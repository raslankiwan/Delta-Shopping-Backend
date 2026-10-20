import {
  randomBytes,
  scrypt as rawScrypt,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { promisify } from "node:util";
import { ObjectId } from "mongodb";
import { database } from "@delta/database";
import type { User } from "@delta/domain";
const scrypt = promisify(rawScrypt);
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}
export async function verifyPassword(password: string, stored: string) {
  const [salt, hex] = stored.split(":");
  if (!salt || !hex || hex.length !== 128) return false;
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return timingSafeEqual(key, Buffer.from(hex, "hex"));
}
export const digest = (s: string) =>
  createHash("sha256").update(s).digest("hex");
export function publicUser(u: any): User {
  return {
    _id: u._id.toString(),
    email: u.email,
    name: u.name,
    role: u.role,
    disabled: !!u.disabled,
  };
}
export async function currentUser(req: Request): Promise<User | null> {
  const token = req.headers
    .get("cookie")
    ?.split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith("delta_session="))
    ?.slice("delta_session=".length);
  if (!token) return null;
  const db = await database();
  const session = await db
    .collection("sessions")
    .findOne({ token: digest(token), expiresAt: { $gt: new Date() } });
  if (!session) return null;
  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(session.userId), disabled: { $ne: true } });
  return user ? publicUser(user) : null;
}
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  await (await database())
    .collection("sessions")
    .insertOne({
      token: digest(token),
      userId,
      expiresAt: new Date(Date.now() + 7 * 86400000),
    });
  return `delta_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}
