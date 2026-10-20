import { database, closeDatabase } from "@delta/database";
import { hashPassword } from "../packages/server/auth";
// Catalog-only examples. No public account is given a known password.
const db = await database();
let seller = await db
  .collection("users")
  .findOne({ email: "catalog@delta.invalid" });
if (!seller) {
  const result = await db
    .collection("users")
    .insertOne({
      email: "catalog@delta.invalid",
      name: "Delta Collection",
      passwordHash: await hashPassword(
        crypto.randomUUID() + crypto.randomUUID(),
      ),
      role: "member",
      disabled: true,
      createdAt: new Date(),
    });
  seller = { _id: result.insertedId };
}
const items = [
  [
    "Electronics for your next project",
    "Thoughtfully selected essentials for a fresh start. This is a sample listing to illustrate the Delta marketplace.",
    "Other",
    24,
    "/images/cat1.jpg",
    "Good",
  ],
  [
    "Apple iPhone — a fresh start",
    "Discover your next favorite mobile. This sample listing shows how electronics appear in the marketplace.",
    "Mobiles",
    185,
    "/images/cat5.jpg",
    "Like new",
  ],
  [
    "Laptop & workspace essentials",
    "A laptop ready for a new chapter. This is a sample listing; publish your own item to start a conversation.",
    "Laptops",
    420,
    "/images/cat7.jpg",
    "Good",
  ],
  [
    "Bracelets with a little character",
    "A find worth discovering. This is a sample listing showing the range of the community marketplace.",
    "Other",
    65,
    "/images/cat4.jpg",
    "Used",
  ],
  [
    "Find your next adventure — Audi",
    "A new journey starts with a great find. Sample listing for the community marketplace.",
    "Cars",
    6500,
    "/images/cat2.jpg",
    "Good",
  ],
  [
    "Accessories with a second chapter",
    "Give great pieces a second chapter. This is a sample listing showing the clothing category.",
    "Clothes",
    32,
    "/images/cat4.jpg",
    "Like new",
  ],
  [
    "Good sounds, better stories — guitar",
    "Make room for your next musical discovery. This is a sample listing for the music category.",
    "Music",
    95,
    "/images/cat3.jpg",
    "Good",
  ],
  [
    "Tablet for everyday inspiration",
    "Something useful with plenty of life ahead. This is a sample listing for the Delta community.",
    "Other",
    48,
    "/images/cat6.jpg",
    "New",
  ],
];
for (const [
  i,
  [title, description, category, price, image, condition],
] of items.entries())
  await db
    .collection("products")
    .updateOne(
      { seedKey: `catalog-${i}` },
      {
        $setOnInsert: {
          seedKey: `catalog-${i}`,
          sample: true,
          title,
          description,
          category,
          price,
          currency: "USD",
          image,
          condition,
          company: "",
          location: "Community collection",
          sellerId: seller._id.toString(),
          sellerName: "Delta Collection · Sample",
          status: "active",
          views: 0,
          createdAt: new Date(Date.now() - i * 3600000),
        },
      },
      { upsert: true },
    );
console.log("Catalog seed complete (8 labeled sample listings).");
await closeDatabase();
