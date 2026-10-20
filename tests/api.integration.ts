import { test, after, before } from "node:test";
import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server";
import { database, closeDatabase } from "@delta/database";
import { handleApi } from "@delta/server";
let mongo: MongoMemoryServer;
before(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  process.env.MONGODB_DB = "delta_integration";
});
after(async () => {
  await closeDatabase();
  await mongo?.stop();
});
async function request(
  path: string,
  method = "GET",
  body?: unknown,
  cookie?: string,
  origin?: string,
) {
  return handleApi(
    new Request(`http://localhost/api/${path}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(cookie ? { cookie } : {}),
        ...(origin ? { origin } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    }),
  );
}
async function register(email: string) {
  const r = await request("auth/register", "POST", {
    email,
    password: "test-password-123",
    name: email.split("@")[0],
  });
  assert.equal(r.status, 201);
  const data = await r.json();
  return {
    user: data.user,
    cookie: r.headers.get("set-cookie")!.split(";")[0],
  };
}
test("marketplace flow and authorization boundaries", async () => {
  const alice = await register("alice@example.com"),
    bob = await register("bob@example.com"),
    admin = await register("admin@example.com");
  assert.equal((await request("products", "POST", {})).status, 401);
  assert.equal(
    (
      await request(
        "products",
        "POST",
        {},
        alice.cookie,
        "https://evil.example",
      )
    ).status,
    403,
  );
  assert.equal(
    (await request("admin/users", "GET", undefined, bob.cookie)).status,
    403,
  );
  const created = await request(
    "products",
    "POST",
    {
      title: "Macbook Pro",
      description: "A carefully used laptop with charger.",
      category: "Laptops",
      price: 500,
      currency: "USD",
      location: "Ramallah",
      image: "",
    },
    alice.cookie,
  );
  assert.equal(created.status, 201);
  const { product } = await created.json();
  assert.equal(
    (
      await request(
        `products/${product._id}`,
        "PATCH",
        { price: 1 },
        bob.cookie,
      )
    ).status,
    403,
  );
  assert.equal(
    (await request(`products/${product._id}`, "DELETE", undefined, bob.cookie))
      .status,
    403,
  );
  assert.equal((await request("products?q=%5B")).status, 200);
  assert.equal(
    (await request(`saved/${product._id}?kind=cart`, "POST", {}, alice.cookie))
      .status,
    400,
  );
  for (let i = 0; i < 2; i++)
    assert.equal(
      (await request(`saved/${product._id}?kind=cart`, "POST", {}, bob.cookie))
        .status,
      200,
    );
  assert.equal(
    (
      await (
        await request("saved?kind=cart", "GET", undefined, bob.cookie)
      ).json()
    ).products.length,
    1,
  );
  assert.equal(
    (
      await request(
        `products/${product._id}/reviews`,
        "POST",
        { text: "My own review", rating: 5 },
        alice.cookie,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await request(
        `products/${product._id}/reviews`,
        "POST",
        { text: "Great seller", rating: 5 },
        bob.cookie,
      )
    ).status,
    201,
  );
  assert.equal(
    (
      await request(
        `products/${product._id}/reviews`,
        "POST",
        { text: "Another review", rating: 5 },
        bob.cookie,
      )
    ).status,
    409,
  );
  assert.equal(
    (
      await request(
        "messages",
        "POST",
        {
          productId: product._id,
          to: alice.user._id,
          text: "Is it available?",
        },
        bob.cookie,
      )
    ).status,
    201,
  );
  assert.equal(
    (
      await request(
        "messages",
        "POST",
        { productId: product._id, to: bob.user._id, text: "Yes, it is." },
        alice.cookie,
      )
    ).status,
    201,
  );
  assert.equal(
    (
      await request(
        "messages",
        "POST",
        { productId: product._id, to: admin.user._id, text: "Spam" },
        bob.cookie,
      )
    ).status,
    403,
  );
  assert.equal(
    (await (await request("messages", "GET", undefined, admin.cookie)).json())
      .messages.length,
    0,
  );
  assert.equal(
    (
      await (
        await request("notifications", "GET", undefined, alice.cookie)
      ).json()
    ).notifications.length,
    2,
  );
  const db = await database();
  await db
    .collection("users")
    .updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } });
  const users = await (
    await request("admin/users", "GET", undefined, admin.cookie)
  ).json();
  assert.equal(
    users.users.some((u: any) => "passwordHash" in u),
    false,
  );
  assert.equal(
    (
      await request(
        `admin/products/${product._id}`,
        "PATCH",
        { status: "hidden" },
        admin.cookie,
      )
    ).status,
    200,
  );
  assert.equal((await request(`products/${product._id}`)).status, 404);
  assert.equal(
    (
      await request(
        `products/${product._id}`,
        "PATCH",
        { status: "active" },
        alice.cookie,
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await request(
        `admin/products/${product._id}`,
        "PATCH",
        { status: "active" },
        admin.cookie,
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await request(
        `admin/users/${bob.user._id}`,
        "PATCH",
        { disabled: true },
        admin.cookie,
      )
    ).status,
    200,
  );
  assert.equal(
    (await request("messages", "GET", undefined, bob.cookie)).status,
    401,
  );
  assert.equal(
    (
      await request("auth/login", "POST", {
        email: "bob@example.com",
        password: "test-password-123",
      })
    ).status,
    401,
  );
  assert.equal(
    (await request("auth/logout", "POST", {}, alice.cookie)).status,
    200,
  );
  assert.equal(
    (await request("products", "POST", {}, alice.cookie)).status,
    401,
  );
  assert.equal((await request("health")).status, 200);
});
