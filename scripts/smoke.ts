import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { ObjectId } from "mongodb";
import { database, closeDatabase } from "@delta/database";
const base = process.env.SMOKE_BASE_URL;
if (!base) throw new Error("Set SMOKE_BASE_URL to the deployment to test.");
const db = await database();
const users: string[] = [];
const products: string[] = [];
const suffix = randomUUID();
const password = randomUUID() + randomUUID();
async function call(
  path: string,
  method = "GET",
  body?: unknown,
  cookie?: string,
) {
  const r = await fetch(`${base}/api/${path}`, {
    method,
    headers: {
      Origin: base!,
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return {
    status: r.status,
    data: await r.json(),
    cookie: r.headers.get("set-cookie")?.split(";")[0],
  };
}
try {
  assert.equal((await call("health")).data.ok, true);
  const seller = await call("auth/register", "POST", {
    email: `smoke-seller-${suffix}@example.invalid`,
    name: "Deployment test seller",
    password,
  });
  assert.equal(seller.status, 201);
  users.push(seller.data.user._id);
  const buyer = await call("auth/register", "POST", {
    email: `smoke-buyer-${suffix}@example.invalid`,
    name: "Deployment test buyer",
    password,
  });
  assert.equal(buyer.status, 201);
  users.push(buyer.data.user._id);
  assert.equal(
    (await call("auth/me", "GET", undefined, seller.cookie)).data.user._id,
    users[0],
  );
  const listing = await call(
    "products",
    "POST",
    {
      title: "Deployment verification fixture",
      description:
        "Temporary record used to verify the deployment. Automatically removed after verification.",
      category: "Other",
      price: 10,
      currency: "USD",
      location: "Test fixture",
      image: "",
    },
    seller.cookie,
  );
  assert.equal(listing.status, 201);
  products.push(listing.data.product._id);
  const id = products[0];
  assert.equal(
    (await call(`products/${id}`, "PATCH", { price: 1 }, buyer.cookie)).status,
    403,
  );
  assert.equal(
    (await call(`saved/${id}?kind=wishlist`, "POST", {}, buyer.cookie)).status,
    200,
  );
  assert.equal(
    (
      await call("saved?kind=wishlist", "GET", undefined, buyer.cookie)
    ).data.products.some((p: any) => p._id === id),
    true,
  );
  assert.equal(
    (
      await call(
        "messages",
        "POST",
        {
          productId: id,
          to: users[0],
          text: "Deployment verification message",
        },
        buyer.cookie,
      )
    ).status,
    201,
  );
  assert.equal(
    (await call("messages", "GET", undefined, seller.cookie)).data.messages
      .length,
    1,
  );
  assert.equal(
    (
      await call(
        `products/${id}/reviews`,
        "POST",
        { text: "Deployment verification review", rating: 5 },
        buyer.cookie,
      )
    ).status,
    201,
  );
  assert.equal(
    (await call("admin/overview", "GET", undefined, seller.cookie)).status,
    403,
  );
  await db
    .collection("users")
    .updateOne({ _id: new ObjectId(users[0]) }, { $set: { role: "admin" } });
  assert.equal(
    (await call("admin/overview", "GET", undefined, seller.cookie)).status,
    200,
  );
  assert.equal(
    (
      await call(
        `admin/products/${id}`,
        "PATCH",
        { status: "hidden" },
        seller.cookie,
      )
    ).status,
    200,
  );
  assert.equal((await call(`products/${id}`)).status, 404);
  assert.equal(
    (await call("auth/logout", "POST", {}, buyer.cookie)).status,
    200,
  );
  assert.equal(
    (await call("messages", "GET", undefined, buyer.cookie)).status,
    401,
  );
  console.log(
    "Production smoke passed: Atlas, signup, session, ownership, listings, wishlist, messages, reviews, admin moderation, logout.",
  );
} finally {
  const userIds = users.map((x) => new ObjectId(x));
  const productIds = products.map((x) => new ObjectId(x));
  await Promise.all([
    db.collection("users").deleteMany({ _id: { $in: userIds } }),
    db.collection("products").deleteMany({ _id: { $in: productIds } }),
    db.collection("sessions").deleteMany({ userId: { $in: users } }),
    db.collection("saved").deleteMany({ userId: { $in: users } }),
    db.collection("messages").deleteMany({ from: { $in: users } }),
    db.collection("reviews").deleteMany({ userId: { $in: users } }),
    db.collection("notifications").deleteMany({ userId: { $in: users } }),
    db.collection("audit").deleteMany({ actor: { $in: users } }),
  ]);
  await closeDatabase();
  console.log("Removed only this run’s test fixtures.");
}
