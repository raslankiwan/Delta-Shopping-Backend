import { ObjectId } from "mongodb";
import { database, closeDatabase } from "@delta/database";
import { storeSchema, commerceProductSchema } from "@delta/domain/commerce";
const db = await database();
const samples = [
  {
    name: "Olive & Co.",
    slug: "olive-and-co",
    accent: "#48654a",
    description:
      "A preview of a local pantry store. Thoughtful essentials for the everyday table.",
    category: "The pantry",
    products: [
      [
        "Extra virgin olive oil",
        "Cold-pressed olive oil, selected for the everyday table. Demonstration product; not for sale.",
        8500,
      ],
      [
        "Everyday pantry collection",
        "A collection of local pantry favorites. Demonstration product; not for sale.",
        12500,
      ],
      [
        "Ceramic serving bowl",
        "A simple bowl with room for something good. Demonstration product; not for sale.",
        6500,
      ],
    ],
  },
  {
    name: "Form Studio",
    slug: "form-studio",
    accent: "#796955",
    description:
      "A preview of a design and lifestyle store. Objects with purpose, made for living.",
    category: "Everyday objects",
    products: [
      [
        "The everyday tote",
        "A reusable cotton tote for everyday essentials. Demonstration product; not for sale.",
        4500,
      ],
      [
        "A little notebook",
        "A place for the next good idea. Demonstration product; not for sale.",
        2800,
      ],
      [
        "Desk essentials set",
        "Thoughtfully designed tools for your workspace. Demonstration product; not for sale.",
        9500,
      ],
    ],
  },
  {
    name: "Chapter Digital",
    slug: "chapter-digital",
    accent: "#64617e",
    description:
      "A preview of a digital goods store. Templates, guides, and tools for your next chapter.",
    category: "Digital resources",
    products: [
      [
        "Weekly planner template",
        "An editable planning template for a thoughtful week. Demonstration product; not for sale.",
        3500,
      ],
      [
        "The brand starter guide",
        "A practical guide to beginning a brand. Demonstration product; not for sale.",
        7500,
      ],
      [
        "Creative workbook",
        "A workbook for ideas that deserve a next chapter. Demonstration product; not for sale.",
        4900,
      ],
    ],
  },
];
for (const s of samples) {
  const result = await db
    .collection("stores")
    .findOneAndUpdate(
      { seedKey: `commerce-demo-${s.slug}` },
      {
        $setOnInsert: {
          ...storeSchema.parse({
            name: s.name,
            slug: s.slug,
            accent: s.accent,
            description: s.description,
            country: "PS",
            currency: "ILS",
            shippingFee: 2000,
            freeShippingAbove: 20000,
            shippingPolicy:
              "This is a preview store. Orders and deliveries are disabled.",
            returnPolicy:
              "This is a preview store, with no real offers for sale.",
          }),
          demo: true,
          status: "active",
          createdBy: "system-demo",
          createdAt: new Date(),
          orderVersion: 0,
        },
      },
      { upsert: true, returnDocument: "after" },
    );
  const storeId = result!._id.toString();
  const category = await db
    .collection("storeCategories")
    .findOneAndUpdate(
      { storeId, slug: "collection" },
      {
        $setOnInsert: {
          storeId,
          slug: "collection",
          name: s.category,
          parentId: "",
        },
      },
      { upsert: true, returnDocument: "after" },
    );
  for (const [i, [name, description, price]] of s.products.entries())
    await db
      .collection("commerceProducts")
      .updateOne(
        { storeId, seedKey: `product-${i}` },
        {
          $setOnInsert: {
            ...commerceProductSchema.parse({
              name,
              description,
              categoryId: category!._id.toString(),
              type: s.slug === "chapter-digital" ? "digital" : "physical",
              deliveryUrl:
                s.slug === "chapter-digital"
                  ? "https://example.invalid/demo"
                  : "",
              status: "active",
              variants: [
                {
                  id: "standard",
                  name: "Standard",
                  sku: `${s.slug}-${i}`,
                  price,
                  stock: 20,
                  attributes: {},
                },
              ],
              trackStock: true,
              featured: i === 0,
              images: [],
              attributes: { Collection: "Preview collection" },
            }),
            seedKey: `product-${i}`,
            storeId,
            version: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { upsert: true },
      );
}
console.log(
  "Created three explicitly labeled preview stores. Checkout is disabled for demo stores.",
);
await closeDatabase();
