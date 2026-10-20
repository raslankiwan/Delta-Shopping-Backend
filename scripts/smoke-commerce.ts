import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { ObjectId } from "mongodb";
import { database, closeDatabase } from "@delta/database";
const base = process.env.SMOKE_BASE_URL;
if (!base) throw new Error("Set SMOKE_BASE_URL.");
const db = await database();
const ids: string[] = [];
const stores: string[] = [];
const suffix = randomUUID();
const email = `commerce-smoke-${suffix}@example.invalid`;
const password = randomUUID() + randomUUID();
async function call(
  path: string,
  method = "GET",
  data?: unknown,
  cookie?: string,
) {
  const r = await fetch(
    `${base}/api/${path.startsWith("auth/") ? path : "commerce/" + path}`,
    {
      method,
      headers: {
        Origin: base!,
        ...(cookie ? { Cookie: cookie } : {}),
        ...(data ? { "Content-Type": "application/json" } : {}),
      },
      body: data ? JSON.stringify(data) : undefined,
    },
  );
  return {
    status: r.status,
    body: await r.json(),
    cookie: r.headers.get("set-cookie")?.split(";")[0],
  };
}
try {
  const account = await call("auth/register", "POST", {
    name: "Commerce smoke test",
    email,
    password,
  });
  assert.equal(account.status, 201);
  ids.push(account.body.user._id);
  const cookie = account.cookie;
  assert.equal(
    (
      await call(
        "stores",
        "POST",
        { name: "Unauthorized", slug: "not-allowed", ownerEmail: email },
        cookie,
      )
    ).status,
    403,
  );
  await db
    .collection("users")
    .updateOne({ _id: new ObjectId(ids[0]) }, { $set: { role: "admin" } });
  const created = await call(
    "stores",
    "POST",
    {
      name: "Temporary commerce verification",
      slug: `test-${suffix}`,
      ownerEmail: email,
      country: "PS",
      currency: "ILS",
      shippingFee: 1000,
      taxBps: 1000,
    },
    cookie,
  );
  assert.equal(created.status, 201);
  const storeId = created.body.store._id;
  stores.push(storeId);
  const token = new URL(created.body.inviteUrl).searchParams.get("token");
  assert.equal(
    (await call("invitations", "POST", { token }, cookie)).status,
    200,
  );
  assert.equal(
    (
      await call(
        `stores/${storeId}/status`,
        "POST",
        { status: "active" },
        cookie,
      )
    ).status,
    200,
  );
  const category = await call(
    `stores/${storeId}/categories`,
    "POST",
    { name: "Any category", slug: "any-category" },
    cookie,
  );
  assert.equal(category.status, 201);
  const product = await call(
    `stores/${storeId}/products`,
    "POST",
    {
      name: "Temporary verification product",
      description:
        "An isolated fixture used only for deployment verification; automatically removed.",
      categoryId: category.body._id,
      status: "active",
      type: "physical",
      variants: [
        {
          id: "default",
          name: "Standard",
          sku: "VERIFY-001",
          price: 1000,
          stock: 1,
          attributes: {},
        },
      ],
      trackStock: true,
    },
    cookie,
  );
  assert.equal(product.status, 201);
  const lines = [
    { productId: product.body.product._id, variantId: "default", quantity: 1 },
  ];
  const q = await call("quote", "POST", { storeId, lines }, cookie);
  assert.equal(q.body.total, 2100);
  const payload = {
    storeId,
    lines,
    address: {
      name: "Verification only",
      phone: "0599000000",
      country: "PS",
      city: "Test City",
      street: "Temporary test fixture",
      postalCode: "",
    },
    delivery: "shipping",
    paymentMethod: "cod",
    coupon: "",
    notes: "Deployment verification fixture, not a real sale.",
    idempotencyKey: randomUUID(),
    expectedTotal: 2100,
    expectedCurrency: "ILS",
  };
  const placed = await call("orders", "POST", payload, cookie);
  assert.equal(placed.status, 201);
  assert.equal(
    (await call("orders", "POST", payload, cookie)).body.order._id,
    placed.body.order._id,
  );
  assert.equal(
    (
      await call(
        "orders",
        "POST",
        { ...payload, idempotencyKey: randomUUID() },
        cookie,
      )
    ).status,
    409,
  );
  assert.equal(
    (await call(`orders/${placed.body.order._id}/cancel`, "POST", {}, cookie))
      .status,
    200,
  );
  const products = await call(
    `stores/${storeId}/products`,
    "GET",
    undefined,
    cookie,
  );
  assert.equal(products.body.products[0].variants[0].stock, 1);
  assert.equal(
    (await call(`stores/${storeId}/analytics`, "GET", undefined, cookie))
      .status,
    200,
  );
  assert.equal((await call("auth/logout", "POST", {}, cookie)).status, 200);
  console.log(
    "Commerce production smoke passed: admin-only stores, invitations, categories, products, integer totals, order idempotency, stock protection, cancellation/restock, analytics.",
  );
} finally {
  await Promise.all(
    [
      "stores",
      "storeMembers",
      "storeInvites",
      "storeCategories",
      "commerceProducts",
      "commerceCarts",
      "storeCoupons",
      "storeReviews",
      "storeMedia",
      "orders",
    ].map((name) =>
      db
        .collection(name)
        .deleteMany(
          name === "stores"
            ? { _id: { $in: stores.map((s) => new ObjectId(s)) } }
            : { storeId: { $in: stores } },
        ),
    ),
  );
  await Promise.all([
    db
      .collection("users")
      .deleteMany({ _id: { $in: ids.map((id) => new ObjectId(id)) } }),
    db.collection("sessions").deleteMany({ userId: { $in: ids } }),
    db.collection("notifications").deleteMany({ userId: { $in: ids } }),
    db.collection("audit").deleteMany({ actor: { $in: ids } }),
  ]);
  await closeDatabase();
  console.log("Removed only this run’s commerce fixtures.");
}
