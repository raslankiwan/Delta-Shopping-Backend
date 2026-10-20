import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { database, closeDatabase } from "@delta/database";
import { handleApi } from "@delta/server";
import { fractionDigits, minorAmount, totals } from "@delta/domain/commerce";
import { verifyWebhook } from "../packages/server/commerce/payments";
let mongo: MongoMemoryReplSet;
before(async () => {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  process.env.MONGODB_URI = mongo.getUri();
  process.env.MONGODB_DB = "commerce_test";
});
after(async () => {
  await closeDatabase();
  await mongo?.stop();
});
async function request(
  path: string,
  method = "GET",
  data?: unknown,
  cookie?: string,
  extra: Record<string, string> = {},
) {
  const r = await handleApi(
    new Request(
      `http://localhost/api/${path.startsWith("auth/") ? path : "commerce/" + path}`,
      {
        method,
        headers: {
          ...(cookie ? { cookie } : {}),
          ...extra,
          ...(data ? { "Content-Type": "application/json" } : {}),
        },
        body: data ? JSON.stringify(data) : undefined,
      },
    ),
  );
  return {
    status: r.status,
    body: await r.json(),
    cookie: r.headers.get("set-cookie")?.split(";")[0],
  };
}
async function register(email: string) {
  const r = await request("auth/register", "POST", {
    name: email.split("@")[0],
    email,
    password: "correct-test-password",
  });
  assert.equal(r.status, 201);
  return { ...r.body.user, cookie: r.cookie };
}
const productInput = {
  name: "Everyday T-shirt",
  description: "A cotton T-shirt with a range of sizes.",
  categoryId: "",
  type: "physical",
  status: "active",
  images: [],
  variants: [
    {
      id: "small",
      name: "Small / green",
      sku: "TS-S-G",
      price: 10000,
      stock: 1,
      attributes: { size: "S", color: "green" },
    },
  ],
  trackStock: true,
  featured: true,
  attributes: { material: "Cotton" },
  deliveryUrl: "",
};
const address = {
  name: "Test Buyer",
  phone: "0599000000",
  country: "PS",
  city: "Ramallah",
  street: "Example street 123",
  postalCode: "",
};
test("commerce lifecycle, financial integrity, and tenant isolation", async (t) => {
  const admin = await register("admin@commerce.invalid"),
    owner = await register("owner@commerce.invalid"),
    other = await register("other@commerce.invalid"),
    buyer = await register("buyer@commerce.invalid"),
    buyer2 = await register("buyer2@commerce.invalid"),
    staff = await register("staff@commerce.invalid");
  const db = await database();
  await db
    .collection("users")
    .updateOne({ email: admin.email }, { $set: { role: "admin" } });
  let storeId = "",
    secondStoreId = "",
    productId = "",
    categoryId = "",
    orderId = "";
  await t.test("only platform admins can create stores", async () => {
    assert.equal(
      (
        await request(
          "stores",
          "POST",
          { name: "Bad store", slug: "bad-store", ownerEmail: owner.email },
          owner.cookie,
        )
      ).status,
      403,
    );
    const created = await request(
      "stores",
      "POST",
      {
        name: "Test store",
        slug: "test-store",
        ownerEmail: owner.email,
        shippingFee: 2000,
        taxBps: 1000,
      },
      admin.cookie,
    );
    assert.equal(created.status, 201);
    storeId = created.body.store._id;
    const token = new URL(created.body.inviteUrl).searchParams.get("token");
    assert.equal(
      (await request("invitations", "POST", { token }, other.cookie)).status,
      403,
    );
    assert.equal(
      (await request("invitations", "POST", { token }, owner.cookie)).status,
      200,
    );
    assert.equal(
      (await request("invitations", "POST", { token }, owner.cookie)).status,
      403,
    );
    const second = await request(
      "stores",
      "POST",
      { name: "Other store", slug: "other-store", ownerEmail: other.email },
      admin.cookie,
    );
    secondStoreId = second.body.store._id;
    assert.equal(
      (
        await request(
          "invitations",
          "POST",
          { token: new URL(second.body.inviteUrl).searchParams.get("token") },
          other.cookie,
        )
      ).status,
      200,
    );
  });
  await t.test("tenant-scoped categories and management", async () => {
    assert.equal(
      (
        await request(
          `stores/${storeId}/products`,
          "GET",
          undefined,
          other.cookie,
        )
      ).status,
      403,
    );
    const cat = await request(
      `stores/${storeId}/categories`,
      "POST",
      { name: "Clothing", slug: "clothing" },
      owner.cookie,
    );
    assert.equal(cat.status, 201);
    categoryId = cat.body._id;
    const p = await request(
      `stores/${storeId}/products`,
      "POST",
      { ...productInput, categoryId },
      owner.cookie,
    );
    assert.equal(p.status, 201);
    productId = p.body.product._id;
    assert.equal(
      (
        await request(
          `stores/${secondStoreId}/products`,
          "POST",
          { ...productInput, categoryId },
          other.cookie,
        )
      ).status,
      400,
    );
    assert.equal(
      (
        await request(
          `stores/${secondStoreId}/products/${productId}`,
          "PATCH",
          { ...productInput, expectedVersion: 0 },
          other.cookie,
        )
      ).status,
      404,
    );
    assert.equal((await request("storefront/test-store")).status, 404);
    assert.equal(
      (
        await request(
          `stores/${storeId}/status`,
          "POST",
          { status: "active" },
          owner.cookie,
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await request(
          `stores/${storeId}/status`,
          "POST",
          { status: "active" },
          admin.cookie,
        )
      ).status,
      200,
    );
    assert.equal(
      (await request("storefront/test-store")).body.products.length,
      1,
    );
  });
  const line = { productId: "", variantId: "small", quantity: 1 };
  const checkout = (overrides: any = {}) => ({
    storeId,
    lines: [{ ...line, productId }],
    address,
    delivery: "shipping",
    paymentMethod: "cod",
    coupon: "",
    notes: "",
    idempotencyKey: randomUUID(),
    expectedTotal: 13000,
    expectedCurrency: "ILS",
    ...overrides,
  });
  await t.test(
    "server prices, country restrictions, and card setup gate",
    async () => {
      assert.equal(
        (
          await request(
            "orders",
            "POST",
            checkout({ expectedTotal: 1 }),
            buyer.cookie,
          )
        ).status,
        409,
      );
      assert.equal(
        (
          await request(
            "orders",
            "POST",
            checkout({ address: { ...address, country: "US" } }),
            buyer.cookie,
          )
        ).status,
        400,
      );
      assert.equal(
        (
          await request(
            "orders",
            "POST",
            checkout({ paymentMethod: "card" }),
            buyer.cookie,
          )
        ).status,
        503,
      );
      const q = await request(
        "quote",
        "POST",
        { storeId, lines: [{ ...line, productId }] },
        buyer.cookie,
      );
      assert.equal(q.body.total, 13000);
    },
  );
  let successful: any;
  await t.test("simultaneous checkout cannot oversell", async () => {
    const attempts = await Promise.all([
      request("orders", "POST", checkout(), buyer.cookie),
      request("orders", "POST", checkout(), buyer2.cookie),
    ]);
    assert.deepEqual(attempts.map((x) => x.status).sort(), [201, 409]);
    successful = attempts.find((x) => x.status === 201)!;
    orderId = successful.body.order._id;
    const stock = await db.collection("commerceProducts").findOne({
      _id: (await import("mongodb")).ObjectId.createFromHexString(productId),
    });
    assert.equal(stock!.variants[0].stock, 0);
    assert.equal(await db.collection("orders").countDocuments({ storeId }), 1);
  });
  await t.test(
    "order privacy, inventory conflict, cancellation restores once",
    async () => {
      assert.equal(
        (await request(`orders/${orderId}`, "GET", undefined, other.cookie))
          .status,
        403,
      );
      assert.equal(
        (
          await request(
            `stores/${storeId}/products/${productId}`,
            "PATCH",
            { ...productInput, categoryId, expectedVersion: 0 },
            owner.cookie,
          )
        ).status,
        409,
      );
      assert.equal(
        (await request(`orders/${orderId}/collect`, "POST", {}, owner.cookie))
          .status,
        409,
      );
      assert.equal(
        (await request(`orders/${orderId}/cancel`, "POST", {}, owner.cookie))
          .status,
        200,
      );
      assert.equal(
        (await request(`orders/${orderId}/cancel`, "POST", {}, owner.cookie))
          .status,
        200,
      );
      const p = await request(
        `stores/${storeId}/products`,
        "GET",
        undefined,
        owner.cookie,
      );
      assert.equal(p.body.products[0].variants[0].stock, 1);
    },
  );
  let fresh: any;
  await t.test(
    "idempotent order placement and fingerprint protection",
    async () => {
      const input = checkout();
      fresh = await request("orders", "POST", input, buyer.cookie);
      assert.equal(fresh.status, 201);
      assert.equal(
        (await request("orders", "POST", input, buyer.cookie)).body.order._id,
        fresh.body.order._id,
      );
      assert.equal(
        (
          await request(
            "orders",
            "POST",
            { ...input, notes: "different" },
            buyer.cookie,
          )
        ).status,
        409,
      );
      assert.equal(
        (
          await request(
            `stores/${storeId}`,
            "PATCH",
            { currency: "USD" },
            owner.cookie,
          )
        ).status,
        409,
      );
    },
  );
  await t.test(
    "fulfillment transition, cash collection, verified reviews and return",
    async () => {
      const id = fresh.body.order._id;
      assert.equal(
        (
          await request(
            `products/${productId}/reviews`,
            "POST",
            { text: "A review before payment", rating: 5 },
            buyer.cookie,
          )
        ).status,
        403,
      );
      assert.equal(
        (
          await request(
            `orders/${id}/fulfill`,
            "POST",
            { fulfillment: "delivered" },
            owner.cookie,
          )
        ).status,
        409,
      );
      assert.equal(
        (
          await request(
            `orders/${id}/fulfill`,
            "POST",
            { fulfillment: "processing" },
            owner.cookie,
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await request(
            `orders/${id}/fulfill`,
            "POST",
            {
              fulfillment: "shipped",
              tracking: "tracking-123",
              carrier: "Test",
            },
            owner.cookie,
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await request(
            `orders/${id}/fulfill`,
            "POST",
            { fulfillment: "delivered" },
            owner.cookie,
          )
        ).status,
        200,
      );
      assert.equal(
        (await request(`orders/${id}/collect`, "POST", {}, owner.cookie))
          .status,
        200,
      );
      assert.equal(
        (
          await request(
            `products/${productId}/reviews`,
            "POST",
            { text: "A verified buyer review", rating: 5 },
            buyer.cookie,
          )
        ).status,
        201,
      );
      assert.equal(
        (
          await request(
            `orders/${id}/refund`,
            "POST",
            { confirmation: "CASH_RETURNED" },
            owner.cookie,
          )
        ).status,
        409,
      );
      assert.equal(
        (
          await request(
            `orders/${id}/return`,
            "POST",
            { reason: "The size does not fit" },
            buyer.cookie,
          )
        ).status,
        200,
      );
      for (const status of ["approved", "received"])
        assert.equal(
          (
            await request(
              `orders/${id}/return-status`,
              "POST",
              { status },
              owner.cookie,
            )
          ).status,
          200,
        );
      assert.equal(
        (
          await request(
            `orders/${id}/refund`,
            "POST",
            { confirmation: "CASH_RETURNED" },
            owner.cookie,
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await request(
            `orders/${id}/refund`,
            "POST",
            { confirmation: "CASH_RETURNED" },
            owner.cookie,
          )
        ).status,
        200,
      );
    },
  );
  await t.test("staff invitation and least privilege", async () => {
    assert.equal(
      (
        await request(
          `stores/${storeId}/team`,
          "POST",
          { email: staff.email, role: "owner" },
          owner.cookie,
        )
      ).status,
      403,
    );
    const invite = await request(
      `stores/${storeId}/team`,
      "POST",
      { email: staff.email, role: "staff" },
      owner.cookie,
    );
    assert.equal(invite.status, 201);
    assert.equal(
      (
        await request(
          "invitations",
          "POST",
          { token: new URL(invite.body.inviteUrl).searchParams.get("token") },
          staff.cookie,
        )
      ).status,
      200,
    );
    assert.equal(
      (
        await request(
          `stores/${storeId}/products`,
          "GET",
          undefined,
          staff.cookie,
        )
      ).status,
      200,
    );
    assert.equal(
      (
        await request(
          `stores/${storeId}`,
          "PATCH",
          { name: "Unauthorized change" },
          staff.cookie,
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await request(
          `stores/${storeId}/customers`,
          "GET",
          undefined,
          other.cookie,
        )
      ).status,
      403,
    );
  });
  await t.test(
    "digital delivery URLs never leak through public product APIs",
    async () => {
      const product = await request(
        `stores/${storeId}/products`,
        "POST",
        {
          ...productInput,
          name: "Digital guide",
          type: "digital",
          trackStock: false,
          variants: [
            {
              ...productInput.variants[0],
              id: "digital",
              sku: "DIG-1",
              stock: 0,
            },
          ],
          deliveryUrl: "https://downloads.example.invalid/secret.pdf",
        },
        owner.cookie,
      );
      assert.equal(product.status, 201);
      const id = product.body.product._id;
      assert.equal(
        "deliveryUrl" in (await request(`products/${id}`)).body.product,
        false,
      );
      assert.equal(
        (await request("storefront/test-store")).body.products.some(
          (p: any) => "deliveryUrl" in p,
        ),
        false,
      );
      assert.equal(
        (
          await request(
            "orders",
            "POST",
            checkout({
              lines: [{ productId: id, variantId: "digital", quantity: 1 }],
              expectedTotal: 11000,
            }),
            buyer.cookie,
          )
        ).status,
        400,
      );
    },
  );
  await t.test(
    "coupon limits are atomic and cancellations restore redemption",
    async () => {
      const p = (
        await request(
          `stores/${storeId}/products`,
          "GET",
          undefined,
          owner.cookie,
        )
      ).body.products.find((p: any) => p._id === productId);
      assert.equal(
        (
          await request(
            `stores/${storeId}/products/${productId}`,
            "PATCH",
            {
              ...productInput,
              categoryId,
              variants: [{ ...productInput.variants[0], stock: 10 }],
              expectedVersion: p.version,
            },
            owner.cookie,
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await request(
            `stores/${storeId}/coupons`,
            "POST",
            {
              code: "ONCE",
              kind: "percentage",
              value: 1000,
              minimum: 0,
              limit: 1,
              expiresAt: new Date(Date.now() + 86400000).toISOString(),
            },
            owner.cookie,
          )
        ).status,
        201,
      );
      const attempts = await Promise.all([
        request(
          "orders",
          "POST",
          checkout({ coupon: "ONCE", expectedTotal: 11900 }),
          buyer.cookie,
        ),
        request(
          "orders",
          "POST",
          checkout({ coupon: "ONCE", expectedTotal: 11900 }),
          buyer2.cookie,
        ),
      ]);
      assert.deepEqual(attempts.map((x) => x.status).sort(), [201, 400]);
      const success = attempts.find((x) => x.status === 201)!;
      assert.equal(
        (
          await request(
            `orders/${success.body.order._id}/cancel`,
            "POST",
            {},
            owner.cookie,
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await request(
            "orders",
            "POST",
            checkout({ coupon: "ONCE", expectedTotal: 11900 }),
            buyer.cookie,
          )
        ).status,
        201,
      );
    },
  );
  await t.test(
    "suspended stores block public catalog and new orders",
    async () => {
      assert.equal(
        (
          await request(
            `stores/${storeId}/status`,
            "POST",
            { status: "suspended" },
            admin.cookie,
          )
        ).status,
        200,
      );
      assert.equal((await request("storefront/test-store")).status, 404);
      assert.equal(
        (
          await request(
            `stores/${storeId}/orders`,
            "GET",
            undefined,
            owner.cookie,
          )
        ).status,
        403,
      );
      assert.equal(
        (await request("orders", "POST", checkout(), buyer.cookie)).status,
        404,
      );
    },
  );
  await t.test("forged and stale payment events are rejected", async () => {
    process.env.COMMERCE_GATEWAY_WEBHOOK_SECRET = "test-only-secret";
    const body = {
      eventId: "event-1",
      orderId,
      merchantRef: "merchant",
      paymentId: "payment-1",
      status: "paid",
      amount: 13000,
      currency: "ILS",
    };
    assert.equal(
      (
        await request("payments/webhook", "POST", body, undefined, {
          "x-commerce-timestamp": String(Date.now() / 1000),
          "x-commerce-signature": "0".repeat(64),
        })
      ).status,
      401,
    );
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = createHmac("sha256", "test-only-secret")
      .update(`${timestamp}.${JSON.stringify(body)}`)
      .digest("hex");
    assert.doesNotThrow(() =>
      verifyWebhook(JSON.stringify(body), timestamp, signature),
    );
    assert.throws(() => verifyWebhook(JSON.stringify(body), "1", signature));
  });

  await t.test(
    "payment connector, signed confirmation, downloads, replay and refund",
    async () => {
      const { createServer } = await import("node:http");
      let providerState = "pending";
      const sessions = new Map<string, any>();
      const server = createServer(async (req, res) => {
        let text = "";
        for await (const chunk of req) text += chunk;
        const payload = JSON.parse(text);
        const timestamp = String(req.headers["x-commerce-timestamp"]);
        const sig = createHmac("sha256", "connector-secret")
          .update(`${timestamp}.${text}`)
          .digest("hex");
        assert.equal(req.headers["x-commerce-signature"], sig);
        if (req.url === "/payments/create" && !sessions.has(payload.orderId))
          sessions.set(payload.orderId, {
            id: "test-" + payload.orderId,
            url: "https://bank-test.invalid/pay",
            status: "pending",
            amount: payload.amount,
            currency: payload.currency,
            orderId: payload.orderId,
          });
        const data = {
          ...sessions.get(payload.orderId),
          status: req.url === "/payments/refund" ? "refunded" : providerState,
        };
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(data));
      });
      await new Promise<void>((resolve) =>
        server.listen(0, "127.0.0.1", resolve),
      );
      const port = (server.address() as any).port;
      (process.env as Record<string, string | undefined>).NODE_ENV = "test";
      process.env.COMMERCE_GATEWAY_URL = `http://127.0.0.1:${port}/`;
      process.env.COMMERCE_GATEWAY_SECRET = "connector-secret";
      process.env.COMMERCE_PAYMENT_HOSTS = "bank-test.invalid";
      try {
        await request(
          `stores/${storeId}/status`,
          "POST",
          { status: "active" },
          admin.cookie,
        );
        assert.equal(
          (
            await request(
              `stores/${storeId}/payments`,
              "POST",
              { enabled: true, merchantRef: "merchant-test" },
              admin.cookie,
            )
          ).status,
          200,
        );
        const digital = (
          await request(
            `stores/${storeId}/products`,
            "GET",
            undefined,
            owner.cookie,
          )
        ).body.products.find((p: any) => p.type === "digital");
        const order = await request(
          "orders",
          "POST",
          checkout({
            lines: [
              { productId: digital._id, variantId: "digital", quantity: 1 },
            ],
            paymentMethod: "card",
            expectedTotal: 11000,
          }),
          buyer.cookie,
        );
        assert.equal(order.status, 201);
        const id = order.body.order._id;
        assert.equal(order.body.order.paymentStatus, "pending");
        assert.equal(
          (
            await request(
              `orders/${id}/downloads`,
              "GET",
              undefined,
              buyer.cookie,
            )
          ).status,
          403,
        );
        assert.equal(
          (
            await request(
              `orders/${id}/fulfill`,
              "POST",
              { fulfillment: "processing" },
              owner.cookie,
            )
          ).status,
          409,
        );
        const event = {
          eventId: "verified-event",
          orderId: id,
          merchantRef: "merchant-test",
          paymentId: "test-" + id,
          status: "paid",
          amount: 11000,
          currency: "ILS",
        };
        const send = async (data: any) => {
          const timestamp = String(Math.floor(Date.now() / 1000));
          const signature = createHmac("sha256", "test-only-secret")
            .update(`${timestamp}.${JSON.stringify(data)}`)
            .digest("hex");
          return request("payments/webhook", "POST", data, undefined, {
            "x-commerce-timestamp": timestamp,
            "x-commerce-signature": signature,
          });
        };
        assert.equal((await send({ ...event, amount: 1 })).status, 409);
        assert.equal((await send(event)).status, 200);
        assert.equal((await send(event)).status, 200);
        assert.equal(
          await db
            .collection("paymentEvents")
            .countDocuments({ eventId: "verified-event" }),
          1,
        );
        assert.equal(
          (
            await request(
              `orders/${id}/downloads`,
              "GET",
              undefined,
              buyer.cookie,
            )
          ).body.downloads[0].url,
          "https://downloads.example.invalid/secret.pdf",
        );
        assert.equal(
          (await request(`orders/${id}/refund`, "POST", {}, owner.cookie))
            .status,
          200,
        );
        assert.equal(
          (
            await request(
              `orders/${id}/downloads`,
              "GET",
              undefined,
              buyer.cookie,
            )
          ).status,
          403,
        );
        assert.equal(
          (await send({ ...event, eventId: "late-paid-event" })).status,
          409,
        );

        // Refunds performed at the provider must be recorded even while a
        // shipment is in transit. Inventory returns only after goods arrive.
        const physical = await request(
          "orders",
          "POST",
          checkout({ paymentMethod: "card" }),
          buyer.cookie,
        );
        assert.equal(physical.status, 201);
        const physicalId = physical.body.order._id;
        const physicalEvent = {
          ...event,
          eventId: "physical-paid",
          orderId: physicalId,
          paymentId: "test-" + physicalId,
          amount: 13000,
        };
        assert.equal((await send(physicalEvent)).status, 200);
        assert.equal(
          (
            await request(
              `orders/${physicalId}/fulfill`,
              "POST",
              { fulfillment: "processing" },
              owner.cookie,
            )
          ).status,
          200,
        );
        assert.equal(
          (
            await request(
              `orders/${physicalId}/fulfill`,
              "POST",
              { fulfillment: "shipped", tracking: "external-refund-shipment" },
              owner.cookie,
            )
          ).status,
          200,
        );
        const stockBefore = (
          await request(
            `stores/${storeId}/products`,
            "GET",
            undefined,
            owner.cookie,
          )
        ).body.products.find((p: any) => p._id === productId).variants[0].stock;
        const refundedEvent = {
          ...physicalEvent,
          eventId: "physical-refund",
          status: "refunded",
        };
        assert.equal((await send(refundedEvent)).status, 200);
        const afterRefund = await request(
          `orders/${physicalId}`,
          "GET",
          undefined,
          buyer.cookie,
        );
        assert.equal(afterRefund.body.order.paymentStatus, "refunded");
        assert.equal(afterRefund.body.order.fulfillment, "shipped");
        assert.equal(
          (
            await request(
              `stores/${storeId}/products`,
              "GET",
              undefined,
              owner.cookie,
            )
          ).body.products.find((p: any) => p._id === productId).variants[0]
            .stock,
          stockBefore,
        );
        assert.equal(
          (
            await request(
              `orders/${physicalId}/fulfill`,
              "POST",
              { fulfillment: "delivered" },
              owner.cookie,
            )
          ).status,
          200,
        );
        assert.equal(
          (
            await request(
              `orders/${physicalId}/return`,
              "POST",
              { reason: "Goods returned after provider refund" },
              buyer.cookie,
            )
          ).status,
          200,
        );
        for (const status of ["approved", "received"])
          assert.equal(
            (
              await request(
                `orders/${physicalId}/return-status`,
                "POST",
                { status },
                owner.cookie,
              )
            ).status,
            200,
          );
        assert.equal((await send(refundedEvent)).status, 200);
        assert.equal(
          (
            await request(
              `stores/${storeId}/products`,
              "GET",
              undefined,
              owner.cookie,
            )
          ).body.products.find((p: any) => p._id === productId).variants[0]
            .stock,
          stockBefore + 1,
        );
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
        delete process.env.COMMERCE_GATEWAY_URL;
        delete process.env.COMMERCE_GATEWAY_SECRET;
        delete process.env.COMMERCE_PAYMENT_HOSTS;
      }
    },
  );
});
test("password reset tokens are single-use and revoke sessions", async () => {
  const account = await register("recover@commerce.invalid");
  const db = await database();
  const { digest } = await import("../packages/server/auth");
  const token = "a".repeat(64);
  await db.collection("passwordResets").insertOne({
    userId: account._id,
    token: digest(token),
    expiresAt: new Date(Date.now() + 60000),
  });
  assert.equal(
    (await request("account/request-reset", "POST", { email: account.email }))
      .status,
    503,
  );
  assert.equal(
    (
      await request("account/reset-password", "POST", {
        token,
        password: "new-correct-password",
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await request("account/reset-password", "POST", {
        token,
        password: "another-password",
      })
    ).status,
    400,
  );
  assert.equal(
    (await request("orders", "GET", undefined, account.cookie)).status,
    401,
  );
  assert.equal(
    (
      await request("auth/login", "POST", {
        email: account.email,
        password: "new-correct-password",
      })
    ).status,
    200,
  );
});
test("currency precision and integer tax arithmetic", () => {
  assert.equal(fractionDigits("JOD"), 3);
  assert.equal(fractionDigits("JPY"), 0);
  assert.equal(minorAmount(1.234, "JOD"), 1234);
  assert.equal(minorAmount(12.34, "ILS"), 1234);
  assert.throws(() => minorAmount(1.234, "ILS"));
  assert.deepEqual(totals(10000, 1000, 2000, 1000), {
    subtotal: 10000,
    discount: 1000,
    shipping: 2000,
    tax: 900,
    total: 11900,
  });
});
