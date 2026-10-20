import { MongoClient, type Db, type ClientSession } from "mongodb";
const globalDb = globalThis as typeof globalThis & {
  deltaClient?: Promise<MongoClient>;
  deltaIndexes?: Promise<unknown>;
};
export async function database(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (!globalDb.deltaClient) {
    globalDb.deltaClient = new MongoClient(uri, {
      maxPoolSize: 8,
      serverSelectionTimeoutMS: 10000,
    })
      .connect()
      .catch((e) => {
        delete globalDb.deltaClient;
        throw e;
      });
  }
  const db = (await globalDb.deltaClient).db(
    process.env.MONGODB_DB || "delta_shopping",
  );
  if (!globalDb.deltaIndexes)
    globalDb.deltaIndexes = Promise.all([
      db
        .collection("passwordResets")
        .createIndex({ token: 1 }, { unique: true }),
      db
        .collection("passwordResets")
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      db.collection("storeMedia").createIndex({ storeId: 1 }),
      db.collection("stores").createIndex({ slug: 1 }, { unique: true }),
      db
        .collection("storeMembers")
        .createIndex({ storeId: 1, userId: 1 }, { unique: true }),
      db.collection("storeMembers").createIndex({ userId: 1 }),
      db.collection("storeInvites").createIndex({ token: 1 }, { unique: true }),
      db
        .collection("storeInvites")
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      db
        .collection("storeCategories")
        .createIndex({ storeId: 1, slug: 1 }, { unique: true }),
      db
        .collection("commerceProducts")
        .createIndex({ storeId: 1, status: 1, createdAt: -1 }),
      db
        .collection("commerceCarts")
        .createIndex({ userId: 1, storeId: 1 }, { unique: true }),
      db
        .collection("commerceFavorites")
        .createIndex({ userId: 1, productId: 1 }, { unique: true }),
      db
        .collection("orders")
        .createIndex({ userId: 1, idempotencyKey: 1 }, { unique: true }),
      db.collection("orders").createIndex({ storeId: 1, createdAt: -1 }),
      db
        .collection("orders")
        .createIndex({ paymentStatus: 1, reservedUntil: 1 }),
      db
        .collection("storeCoupons")
        .createIndex({ storeId: 1, code: 1 }, { unique: true }),
      db
        .collection("paymentEvents")
        .createIndex({ provider: 1, eventId: 1 }, { unique: true }),
      db
        .collection("storeReviews")
        .createIndex({ userId: 1, productId: 1 }, { unique: true }),
      db.collection("users").createIndex({ email: 1 }, { unique: true }),
      db.collection("sessions").createIndex({ token: 1 }, { unique: true }),
      db
        .collection("sessions")
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      db
        .collection("products")
        .createIndex({ status: 1, category: 1, createdAt: -1 }),
      db.collection("products").createIndex({ sellerId: 1, createdAt: -1 }),
      db
        .collection("saved")
        .createIndex({ userId: 1, productId: 1, kind: 1 }, { unique: true }),
      db
        .collection("reviews")
        .createIndex({ productId: 1, userId: 1 }, { unique: true }),
      db.collection("messages").createIndex({ from: 1, to: 1, createdAt: -1 }),
      db.collection("notifications").createIndex({ userId: 1, createdAt: -1 }),
      db
        .collection("rateLimits")
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    ]).catch((e) => {
      delete globalDb.deltaIndexes;
      throw e;
    });
  await globalDb.deltaIndexes;
  return db;
}
export async function closeDatabase() {
  if (globalDb.deltaClient) await (await globalDb.deltaClient).close();
  delete globalDb.deltaClient;
  delete globalDb.deltaIndexes;
}

export async function transaction<T>(
  fn: (db: Db, session: ClientSession) => Promise<T>,
): Promise<T> {
  const db = await database();
  const client = await globalDb.deltaClient!;
  return client.withSession((session) =>
    session.withTransaction(() => fn(db, session)),
  ) as Promise<T>;
}
