import { MongoClient, type Db } from "mongodb";
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
