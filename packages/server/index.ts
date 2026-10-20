import { commerceApi } from "./commerce";
import { ObjectId, type Document } from "mongodb";
import { z } from "zod";
import { database } from "@delta/database";
import {
  credentialsSchema,
  registerSchema,
  productSchema,
  reviewSchema,
  messageSchema,
  idSchema,
  escapeRegex,
} from "@delta/domain";
import type { User } from "@delta/domain";
import {
  currentUser,
  publicUser,
  hashPassword,
  verifyPassword,
  createSession,
  digest,
} from "./auth";
class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
function fail(status: number, message: string): never {
  throw new HttpError(status, message);
}
const objectId = (s: string) => new ObjectId(idSchema.parse(s));
const json = (data: unknown, status = 200, headers?: HeadersInit) =>
  Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
async function body(req: Request) {
  const value = await req.text();
  if (value.length > 32768) fail(413, "Request too large");
  try {
    return JSON.parse(value);
  } catch {
    fail(400, "Invalid JSON");
  }
}
function requireUser(user: User | null): asserts user is User {
  if (!user) fail(401, "Please sign in");
}
function requireAdmin(user: User | null): asserts user is User {
  requireUser(user);
  if (user.role !== "admin") fail(403, "Administrator access required");
}
async function notify(userId: string, text: string, productId?: string) {
  await (await database())
    .collection("notifications")
    .insertOne({ userId, text, productId, read: false, createdAt: new Date() });
}
async function rateLimit(key: string, limit: number, windowMs: number) {
  const db = await database();
  const slot = Math.floor(Date.now() / windowMs);
  const row = await db.collection("rateLimits").findOneAndUpdate(
    { _id: digest(`${key}:${slot}`) as any },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt: new Date((slot + 1) * windowMs) },
    },
    { upsert: true, returnDocument: "after" },
  );
  if (row!.count > limit)
    fail(429, "Too many requests. Please try again later.");
}
export async function handleApi(req: Request): Promise<Response> {
  if (new URL(req.url).pathname.startsWith("/api/commerce/"))
    return commerceApi(req);
  try {
    const url = new URL(req.url);
    const path = url.pathname
      .replace(/^\/api\/?/, "")
      .split("/")
      .filter(Boolean);
    const method = req.method;
    if (method !== "GET" && method !== "HEAD") {
      const origin = req.headers.get("origin");
      if (origin && origin !== url.origin)
        fail(403, "Cross-origin request rejected");
    }
    if (path[0] === "health") {
      await (await database()).command({ ping: 1 });
      return json({ ok: true, database: "connected" });
    }
    const db = await database();
    if (
      path[0] === "auth" &&
      ["register", "login"].includes(path[1]) &&
      method === "POST"
    ) {
      const input = (
        path[1] === "register" ? registerSchema : credentialsSchema
      ).parse(await body(req));
      await rateLimit(`auth:${input.email}`, 10, 900000);
      // Vercel supplies the trusted client address; do not trust an arbitrary forwarded header elsewhere.
      if (process.env.VERCEL)
        await rateLimit(
          `ip:${req.headers.get("x-vercel-forwarded-for") || "unknown"}`,
          60,
          900000,
        );
      let user;
      if (path[1] === "register") {
        const record = {
          email: input.email,
          passwordHash: await hashPassword(input.password),
          name: (input as z.infer<typeof registerSchema>).name,
          role: "member",
          disabled: false,
          createdAt: new Date(),
        };
        const result = await db.collection("users").insertOne(record);
        user = { ...record, _id: result.insertedId };
      } else {
        user = await db.collection("users").findOne({ email: input.email });
        if (
          !user ||
          user.disabled ||
          !(await verifyPassword(input.password, user.passwordHash))
        )
          fail(401, "Invalid email or password");
      }
      return json(
        { user: publicUser(user) },
        path[1] === "register" ? 201 : 200,
        { "Set-Cookie": await createSession(user!._id.toString()) },
      );
    }
    const user = await currentUser(req);
    if (path[0] === "auth" && path[1] === "me") return json({ user });
    if (path[0] === "auth" && path[1] === "logout" && method === "POST") {
      const token = req.headers
        .get("cookie")
        ?.match(/(?:^|;\s*)delta_session=([^;]+)/)?.[1];
      if (token)
        await db.collection("sessions").deleteOne({ token: digest(token) });
      return json({ ok: true }, 200, {
        "Set-Cookie":
          "delta_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
      });
    }
    if (path[0] === "products") {
      if (!path[1] && method === "GET") {
        const filter: Document = { status: "active" };
        const q = url.searchParams.get("q")?.slice(0, 100);
        const category = url.searchParams.get("category");
        if (q)
          filter.$or = [
            { title: { $regex: escapeRegex(q), $options: "i" } },
            { description: { $regex: escapeRegex(q), $options: "i" } },
          ];
        if (category) filter.category = category;
        if (url.searchParams.get("mine") === "true") {
          requireUser(user);
          delete filter.status;
          filter.sellerId = user._id;
        }
        const page = Math.max(
          1,
          Math.min(10000, Number(url.searchParams.get("page")) || 1),
        );
        const sort: Document =
          url.searchParams.get("sort") === "price"
            ? { price: 1, _id: 1 }
            : { createdAt: -1, _id: -1 };
        return json({
          products: await db
            .collection("products")
            .find(filter)
            .sort(sort)
            .skip((page - 1) * 24)
            .limit(24)
            .toArray(),
          total: await db.collection("products").countDocuments(filter),
          page,
        });
      }
      if (!path[1] && method === "POST") {
        requireUser(user);
        await rateLimit(`listing:${user._id}`, 30, 3600000);
        const input = productSchema.parse(await body(req));
        const record = {
          ...input,
          sellerId: user._id,
          sellerName: user.name,
          status: "active",
          views: 0,
          createdAt: new Date(),
        };
        const result = await db.collection("products").insertOne(record);
        return json({ product: { ...record, _id: result.insertedId } }, 201);
      }
      const _id = objectId(path[1]);
      const product = await db.collection("products").findOne({ _id });
      if (
        !product ||
        (product.status === "hidden" &&
          user?._id !== product.sellerId &&
          user?.role !== "admin")
      )
        fail(404, "Listing not found");
      if (method === "GET" && !path[2])
        return json({
          product,
          reviews: await db
            .collection("reviews")
            .find({ productId: path[1] })
            .sort({ createdAt: -1 })
            .limit(100)
            .toArray(),
        });
      if (path[2] === "reviews" && method === "POST") {
        requireUser(user);
        if (product!.sample) fail(400, "Sample listings cannot be reviewed");
        if (product!.sellerId === user._id)
          fail(400, "You cannot review your own listing");
        const input = reviewSchema.parse(await body(req));
        await db.collection("reviews").insertOne({
          ...input,
          productId: path[1],
          userId: user._id,
          userName: user.name,
          createdAt: new Date(),
        });
        await notify(
          product!.sellerId,
          `${user.name} reviewed ${product!.title}`,
          path[1],
        );
        return json({ ok: true }, 201);
      }
      if (method === "PATCH" && !path[2]) {
        requireUser(user);
        if (product!.sellerId !== user._id && user.role !== "admin")
          fail(403, "You can only edit your own listings");
        const input = z
          .object({
            status: z.enum(["active", "sold"]).optional(),
            ...productSchema.partial().shape,
          })
          .strict()
          .parse(await body(req));
        if (product!.status === "hidden" && user.role !== "admin")
          fail(403, "This listing is under moderation");
        await db
          .collection("products")
          .updateOne({ _id }, { $set: { ...input, updatedAt: new Date() } });
        return json({ ok: true });
      }
      if (method === "DELETE" && !path[2]) {
        requireUser(user);
        if (product!.sellerId !== user._id && user.role !== "admin")
          fail(403, "You can only remove your own listings");
        await db
          .collection("products")
          .updateOne(
            { _id },
            { $set: { status: "hidden", updatedAt: new Date() } },
          );
        return json({ ok: true });
      }
    }
    if (path[0] === "saved") {
      requireUser(user);
      const kind = z
        .enum(["cart", "wishlist"])
        .parse(url.searchParams.get("kind") || "wishlist");
      if (method === "GET") {
        const saved = await db
          .collection("saved")
          .find({ userId: user._id, kind })
          .limit(200)
          .toArray();
        return json({
          products: await db
            .collection("products")
            .find({
              _id: { $in: saved.map((x) => new ObjectId(x.productId)) },
              status: { $ne: "hidden" },
            })
            .toArray(),
        });
      }
      const productId = idSchema.parse(path[1]);
      if (method === "POST") {
        const product = await db
          .collection("products")
          .findOne({ _id: new ObjectId(productId), status: "active" });
        if (!product) fail(404, "Listing unavailable");
        if (product.sellerId === user._id) fail(400, "This is your listing");
        await db
          .collection("saved")
          .updateOne(
            { userId: user._id, productId, kind },
            { $setOnInsert: { createdAt: new Date() } },
            { upsert: true },
          );
        return json({ ok: true });
      }
      if (method === "DELETE") {
        await db
          .collection("saved")
          .deleteOne({ userId: user._id, productId, kind });
        return json({ ok: true });
      }
    }
    if (path[0] === "messages") {
      requireUser(user);
      if (method === "GET")
        return json({
          messages: await db
            .collection("messages")
            .find({ $or: [{ from: user._id }, { to: user._id }] })
            .sort({ createdAt: -1 })
            .limit(200)
            .toArray(),
        });
      if (method === "POST") {
        await rateLimit(`message:${user._id}`, 60, 3600000);
        const input = messageSchema.parse(await body(req));
        const product = await db.collection("products").findOne({
          _id: new ObjectId(input.productId),
          status: { $ne: "hidden" },
        });
        if (!product) fail(404, "Listing not found");
        if (product.sample) fail(400, "Sample listings are not real offers");
        if (input.to === user._id) fail(400, "Choose another recipient");
        if (product.sellerId !== user._id && product.sellerId !== input.to)
          fail(403, "Messages must include the seller");
        if (
          product.sellerId === user._id &&
          !(await db.collection("messages").findOne({
            productId: input.productId,
            from: input.to,
            to: user._id,
          }))
        )
          fail(403, "Buyer must start the conversation");
        const recipient = await db
          .collection("users")
          .findOne({ _id: new ObjectId(input.to), disabled: { $ne: true } });
        if (!recipient) fail(404, "Recipient unavailable");
        await db.collection("messages").insertOne({
          ...input,
          from: user._id,
          fromName: user.name,
          toName: recipient.name,
          productTitle: product.title,
          createdAt: new Date(),
        });
        await notify(
          input.to,
          `${user.name} sent you a message about ${product.title}`,
          input.productId,
        );
        return json({ ok: true }, 201);
      }
    }
    if (path[0] === "notifications") {
      requireUser(user);
      if (method === "GET")
        return json({
          notifications: await db
            .collection("notifications")
            .find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(100)
            .toArray(),
        });
      if (method === "PATCH") {
        await db
          .collection("notifications")
          .updateMany({ userId: user._id }, { $set: { read: true } });
        return json({ ok: true });
      }
    }
    if (path[0] === "admin") {
      requireAdmin(user);
      if (method === "GET" && path[1] === "overview")
        return json({
          users: await db.collection("users").countDocuments(),
          listings: await db.collection("products").countDocuments(),
          active: await db
            .collection("products")
            .countDocuments({ status: "active" }),
          messages: await db.collection("messages").countDocuments(),
        });
      if (method === "GET" && path[1] === "products")
        return json({
          products: await db
            .collection("products")
            .find()
            .sort({ createdAt: -1 })
            .limit(200)
            .toArray(),
        });
      if (method === "GET" && path[1] === "users")
        return json({
          users: (
            await db
              .collection("users")
              .find()
              .sort({ createdAt: -1 })
              .limit(200)
              .toArray()
          ).map(publicUser),
        });
      if (method === "PATCH" && path[1] === "products") {
        const input = z
          .object({ status: z.enum(["active", "sold", "hidden"]) })
          .parse(await body(req));
        const result = await db
          .collection("products")
          .updateOne({ _id: objectId(path[2]) }, { $set: input });
        if (!result.matchedCount) fail(404, "Listing not found");
        await db.collection("audit").insertOne({
          actor: user._id,
          action: "moderate-listing",
          target: path[2],
          ...input,
          createdAt: new Date(),
        });
        return json({ ok: true });
      }
      if (method === "PATCH" && path[1] === "users") {
        if (path[2] === user._id) fail(400, "You cannot disable yourself");
        const input = z
          .object({ disabled: z.boolean() })
          .parse(await body(req));
        const target = await db
          .collection("users")
          .findOne({ _id: objectId(path[2]) });
        if (!target) fail(404, "User not found");
        if (target.role === "admin")
          fail(400, "Manage administrators through the admin CLI");
        await db
          .collection("users")
          .updateOne({ _id: target._id }, { $set: input });
        if (input.disabled)
          await db.collection("sessions").deleteMany({ userId: path[2] });
        await db.collection("audit").insertOne({
          actor: user._id,
          action: "moderate-user",
          target: path[2],
          ...input,
          createdAt: new Date(),
        });
        return json({ ok: true });
      }
    }
    fail(404, "Endpoint not found");
  } catch (error: any) {
    if (error instanceof z.ZodError)
      return json(
        { error: error.issues.map((x) => x.message).join("; ") },
        400,
      );
    if (error instanceof HttpError)
      return json({ error: error.message }, error.status);
    if (error?.code === 11000)
      return json({ error: "This entry already exists" }, 409);
    console.error(
      "API request failed:",
      error?.name || "Error",
      error?.code || "",
    );
    return json({ error: "Service temporarily unavailable" }, 503);
  }
}
