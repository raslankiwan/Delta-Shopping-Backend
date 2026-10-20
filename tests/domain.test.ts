import test from "node:test";
import assert from "node:assert/strict";
import {
  productSchema,
  registerSchema,
  escapeRegex,
  money,
} from "@delta/domain";
import { hashPassword, verifyPassword } from "../packages/server/auth";
const valid = {
  title: "Great laptop",
  description: "A gently used laptop.",
  category: "Laptops",
  price: 120,
  currency: "USD",
  location: "Ramallah",
  image: "",
};
test("listing validation rejects invalid prices and unsafe image URLs", () => {
  assert.equal(productSchema.safeParse(valid).success, true);
  for (const input of [
    { price: -1 },
    { price: 0 },
    { price: Infinity },
    { image: "javascript:alert(1)" },
    { image: "http://example.com/a.jpg" },
    { category: "wrong" },
  ])
    assert.equal(
      productSchema.safeParse({ ...valid, ...input }).success,
      false,
    );
});
test("email normalization and password length", () => {
  assert.equal(
    registerSchema.parse({
      name: "Raslan",
      email: "Raslan@Example.com",
      password: "safe-password",
    }).email,
    "raslan@example.com",
  );
  assert.equal(
    registerSchema.safeParse({ name: "A", email: "x", password: "short" })
      .success,
    false,
  );
});
test("search treats regex metacharacters literally", () => {
  const s = "[a-z].* (phone) $";
  assert.equal(new RegExp(escapeRegex(s)).test(s), true);
  assert.equal(new RegExp(escapeRegex(s)).test("anything phone"), false);
});
test("NIS displays as ILS and totals preserve currencies", () => {
  assert.match(money(10, "NIS"), /10/);
  assert.match(money(10, "JOD"), /10/);
});
test("passwords use salted scrypt and constant-time comparison", async () => {
  const a = await hashPassword("correct-password");
  const b = await hashPassword("correct-password");
  assert.notEqual(a, b);
  assert.equal(await verifyPassword("correct-password", a), true);
  assert.equal(await verifyPassword("wrong-password", a), false);
  assert.equal(await verifyPassword("x", "broken"), false);
});
