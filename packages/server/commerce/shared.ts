import { digest } from "../auth";
import { ObjectId } from "mongodb";
import { database } from "@delta/database";
import { idSchema } from "@delta/domain";
import type { User } from "@delta/domain";
export class CommerceError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function reject(status: number, message: string): never {
  throw new CommerceError(status, message);
}
export const oid = (id: string) => new ObjectId(idSchema.parse(id));
export function signedIn(user: User | null): asserts user is User {
  if (!user) reject(401, "Please sign in");
}
export function admin(user: User | null): asserts user is User {
  signedIn(user);
  if (user.role !== "admin")
    reject(403, "Platform administrator access required");
}
export async function access(
  user: User | null,
  storeId: string,
  ownerOnly = false,
) {
  signedIn(user);
  const db = await database();
  const store = await db.collection("stores").findOne({ _id: oid(storeId) });
  if (!store) reject(404, "Store not found");
  if (user.role === "admin") return store;
  const membership = await db
    .collection("storeMembers")
    .findOne({ storeId, userId: user._id });
  if (!membership || (ownerOnly && membership.role !== "owner"))
    reject(403, "You do not have access to this store");
  if (store.status === "suspended") reject(403, "This store is suspended");
  return store;
}
export async function audit(
  actor: string,
  storeId: string,
  action: string,
  target: string,
) {
  await (await database())
    .collection("audit")
    .insertOne({ actor, storeId, action, target, createdAt: new Date() });
}
export const out = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
export async function input(req: Request) {
  const text = await req.text();
  if (text.length > 150000) reject(413, "Request too large");
  try {
    return JSON.parse(text);
  } catch {
    reject(400, "Invalid JSON");
  }
}
export function safeProduct(p: any) {
  const { deliveryUrl, ...safe } = p;
  return safe;
}
export function safeStore(s: any) {
  const { paymentConfig, ...safe } = s;
  return { ...safe, onlinePaymentsReady: !!paymentConfig?.enabled };
}

export async function mutationLimit(userId: string, limit = 120) {
  const slot = Math.floor(Date.now() / 300000);
  const collection = (await database()).collection("rateLimits");
  const key = digest(`commerce:${userId}:${slot}`);
  const row = await collection.findOneAndUpdate(
    { _id: key as any },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt: new Date((slot + 1) * 300000) },
    },
    { upsert: true, returnDocument: "after" },
  );
  if (row!.count > limit)
    reject(429, "Too many requests. Please try again in a few minutes.");
}
