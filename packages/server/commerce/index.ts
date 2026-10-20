import { emailReady, sendEmail } from "./email";
import { randomBytes } from "node:crypto";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { database, transaction } from "@delta/database";
import { idSchema, escapeRegex } from "@delta/domain";
import {
  storeSchema,
  commerceProductSchema,
  categorySchema,
  cartSchema,
  couponSchema,
} from "@delta/domain/commerce";
import { currentUser, digest, hashPassword } from "../auth";
import {
  mutationLimit,
  CommerceError,
  reject,
  signedIn,
  admin,
  access,
  audit,
  oid,
  out,
  input,
  safeProduct,
  safeStore,
} from "./shared";
import {
  createOrder,
  beginPayment,
  cancelOrder,
  updateFulfillment,
  applyPaymentEvent,
  reconcileOrder,
  quote,
  releaseOrder,
} from "./orders";
import {
  gatewayReady,
  paymentReadiness,
  gatewayCall,
  verifyWebhook,
  paymentEventSchema,
} from "./payments";

export async function commerceApi(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const path = url.pathname
      .replace(/^\/api\/commerce\/?/, "")
      .split("/")
      .filter(Boolean);
    const method = req.method;
    const db = await database();
    if (
      !["GET", "HEAD"].includes(method) &&
      path.join("/") !== "payments/webhook"
    ) {
      const origin = req.headers.get("origin");
      if (origin && origin !== url.origin)
        reject(403, "Cross-origin request rejected");
    }
    if (path.join("/") === "payments/webhook" && method === "POST") {
      const body = await req.text();
      if (body.length > 10000) reject(413, "Webhook too large");
      verifyWebhook(
        body,
        req.headers.get("x-commerce-timestamp"),
        req.headers.get("x-commerce-signature"),
      );
      let raw;
      try {
        raw = JSON.parse(body);
      } catch {
        reject(400, "Invalid JSON");
      }
      await applyPaymentEvent(paymentEventSchema.parse(raw));
      return out({ ok: true });
    }
    if (path[0] === "maintenance" && method === "GET") {
      if (
        !process.env.CRON_SECRET ||
        req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
      )
        reject(401, "Maintenance authentication required");
      const pending = await db
        .collection("orders")
        .find({
          paymentMethod: "card",
          paymentStatus: { $in: ["creating", "pending", "refunding"] },
          reservedUntil: { $lt: new Date() },
        })
        .sort({ reservedUntil: 1 })
        .limit(20)
        .toArray();
      let reconciled = 0;
      let failed = 0;
      for (const order of pending) {
        try {
          await reconcileOrder(order);
          const latest = await db
            .collection("orders")
            .findOne({ _id: order._id });
          if (
            latest &&
            ["creating", "pending"].includes(latest.paymentStatus)
          ) {
            const result = await gatewayCall("cancel", {
              orderId: order._id.toString(),
              merchantRef: order.merchantRef,
              paymentId: order.paymentId || "",
              idempotencyKey: `expire-${order._id}`,
            });
            if (result.status !== "pending" && result.status !== "refunded")
              await applyPaymentEvent({
                eventId: `expire-${result.id}-${result.status}`,
                orderId: order._id.toString(),
                paymentId: result.id,
                merchantRef: order.merchantRef,
                status: result.status,
                amount: result.amount,
                currency: result.currency,
              });
          }
          reconciled++;
        } catch {
          failed++;
        }
      }
      return out({ scanned: pending.length, reconciled, failed });
    }
    if (
      path[0] === "account" &&
      path[1] === "request-reset" &&
      method === "POST"
    ) {
      const { email } = z
        .object({ email: z.email().transform((s) => s.toLowerCase()) })
        .parse(await input(req));
      await mutationLimit("password-reset:" + digest(email), 3);
      if (!emailReady())
        reject(
          503,
          "Email recovery is awaiting email-provider setup. Contact the platform administrator.",
        );
      const account = await db
        .collection("users")
        .findOne({ email, disabled: { $ne: true } });
      if (account) {
        const token = randomBytes(32).toString("hex");
        await db.collection("passwordResets").insertOne({
          userId: account._id.toString(),
          token: digest(token),
          expiresAt: new Date(Date.now() + 3600000),
        });
        const resetUrl = `${process.env.APP_URL || url.origin}/reset-password?token=${token}`;
        await sendEmail(
          email,
          "Reset your Delta password",
          `Use this one-time link within one hour to reset your password:\n${resetUrl}\nIf you did not request this, ignore this message.`,
          digest(token),
        );
      }
      return out({
        ok: true,
        message: "If an eligible account exists, a reset link has been sent.",
      });
    }
    if (
      path[0] === "account" &&
      path[1] === "reset-password" &&
      method === "POST"
    ) {
      const data = z
        .object({
          token: z.string().regex(/^[a-f0-9]{64}$/),
          password: z.string().min(10).max(128),
        })
        .parse(await input(req));
      const token = digest(data.token);
      const reset = await db
        .collection("passwordResets")
        .findOne({ token, expiresAt: { $gt: new Date() } });
      if (!reset) reject(400, "Reset link is invalid or expired");
      const passwordHash = await hashPassword(data.password);
      await transaction(async (db, session) => {
        const used = await db
          .collection("passwordResets")
          .findOneAndDelete(
            { token, expiresAt: { $gt: new Date() } },
            { session },
          );
        if (!used) reject(400, "Reset link has already been used");
        const result = await db
          .collection("users")
          .updateOne(
            { _id: oid(used.userId), disabled: { $ne: true } },
            { $set: { passwordHash } },
            { session },
          );
        if (!result.matchedCount) reject(400, "Account is unavailable");
        await db
          .collection("sessions")
          .deleteMany({ userId: used.userId }, { session });
        await db
          .collection("passwordResets")
          .deleteMany({ userId: used.userId }, { session });
      });
      return out({ ok: true });
    }
    const user = await currentUser(req);
    if (user && ["POST", "PATCH", "DELETE"].includes(method))
      await mutationLimit(user._id);
    if (path[0] === "media") {
      if (method === "GET" && path[1]) {
        const asset = await db
          .collection("storeMedia")
          .findOne({ _id: oid(path[1]) });
        if (!asset) reject(404, "Image not found");
        return new Response(new Uint8Array(asset.data.buffer), {
          headers: {
            "Content-Type": asset.contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }
      if (method === "POST") {
        const storeId = idSchema.parse(url.searchParams.get("storeId"));
        await access(user, storeId);
        signedIn(user);
        if (Number(req.headers.get("content-length")) > 2200000)
          reject(413, "Image must be at most 2 MB");
        if (
          (await db.collection("storeMedia").countDocuments({ storeId })) >= 100
        )
          reject(
            409,
            "Store image limit reached (100). Use managed HTTPS image URLs for larger catalogs.",
          );
        const form = await req.formData();
        const file = form.get("file");
        if (!(file instanceof File) || file.size > 2097152)
          reject(400, "Choose an image under 2 MB");
        const bytes = Buffer.from(await file.arrayBuffer());
        const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
        const png = bytes
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
        const webp =
          bytes.subarray(0, 4).toString() === "RIFF" &&
          bytes.subarray(8, 12).toString() === "WEBP";
        if (!jpeg && !png && !webp)
          reject(400, "Only JPEG, PNG, and WebP images are accepted");
        const result = await db.collection("storeMedia").insertOne({
          storeId,
          data: bytes,
          contentType: jpeg ? "image/jpeg" : png ? "image/png" : "image/webp",
          createdAt: new Date(),
          createdBy: user._id,
        });
        return out({ url: `/api/commerce/media/${result.insertedId}` }, 201);
      }
    }

    if (path[0] === "profile") {
      signedIn(user);
      if (method === "GET") {
        const profile = await db
          .collection("users")
          .findOne(
            { _id: oid(user._id) },
            { projection: { name: 1, addresses: 1, email: 1 } },
          );
        return out({ profile });
      }
      if (method === "PATCH") {
        const data = z
          .object({
            name: z.string().trim().min(2).max(100),
            addresses: z
              .array(
                z.object({
                  name: z.string().min(2).max(100),
                  phone: z.string().min(7).max(30),
                  country: z.string().length(2),
                  city: z.string().min(2).max(100),
                  street: z.string().min(3).max(300),
                  postalCode: z.string().max(30).default(""),
                }),
              )
              .max(10),
          })
          .parse(await input(req));
        await db
          .collection("users")
          .updateOne({ _id: oid(user._id) }, { $set: data });
        return out({ ok: true });
      }
    }
    if (path[0] === "context" && method === "GET") {
      const memberships = user
        ? await db
            .collection("storeMembers")
            .find({ userId: user._id })
            .toArray()
        : [];
      const stores =
        user?.role === "admin"
          ? await db
              .collection("stores")
              .find()
              .sort({ createdAt: -1 })
              .limit(100)
              .toArray()
          : await db
              .collection("stores")
              .find({ _id: { $in: memberships.map((m) => oid(m.storeId)) } })
              .toArray();
      return out({
        user,
        stores: stores.map(safeStore),
        memberships,
        paymentGatewayConfigured: gatewayReady(),
        invitationOnly: true,
        emailConfigured: emailReady(),
      });
    }
    if (path[0] === "stores" && !path[1]) {
      if (method === "GET") {
        const q = url.searchParams.get("q")?.slice(0, 100);
        return out({
          stores: (
            await db
              .collection("stores")
              .find({
                status: "active",
                ...(q
                  ? { name: { $regex: escapeRegex(q), $options: "i" } }
                  : {}),
              })
              .sort({ createdAt: -1 })
              .limit(100)
              .toArray()
          ).map(safeStore),
        });
      }
      if (method === "POST") {
        admin(user);
        const parsed = storeSchema
          .extend({ ownerEmail: z.email().transform((s) => s.toLowerCase()) })
          .parse(await input(req));
        const { ownerEmail, ...storeInput } = parsed;
        const store = {
          ...storeInput,
          status: "draft",
          createdBy: user._id,
          createdAt: new Date(),
          orderVersion: 0,
        };
        const storeId = new ObjectId();
        const token = randomBytes(32).toString("hex");
        await transaction(async (db, session) => {
          await db
            .collection("stores")
            .insertOne({ ...store, _id: storeId }, { session });
          await db.collection("storeInvites").insertOne(
            {
              storeId: storeId.toString(),
              email: ownerEmail,
              role: "owner",
              token: digest(token),
              expiresAt: new Date(Date.now() + 7 * 86400000),
              createdBy: user._id,
            },
            { session },
          );
        });
        await audit(
          user._id,
          storeId.toString(),
          "create-store",
          storeId.toString(),
        );
        return out(
          {
            store: { ...store, _id: storeId },
            inviteUrl: `${process.env.APP_URL || url.origin}/invite?token=${token}`,
            email: ownerEmail,
          },
          201,
        );
      }
    }
    if (path[0] === "invitations" && method === "POST") {
      signedIn(user);
      const { token } = z
        .object({ token: z.string().regex(/^[a-f0-9]{64}$/) })
        .parse(await input(req));
      await transaction(async (db, session) => {
        const invite = await db
          .collection("storeInvites")
          .findOne(
            { token: digest(token), expiresAt: { $gt: new Date() } },
            { session },
          );
        if (!invite || invite.email !== user.email)
          reject(
            403,
            "Invitation invalid, expired, or intended for a different email",
          );
        await db.collection("storeMembers").updateOne(
          { storeId: invite.storeId, userId: user._id },
          {
            $set: { role: invite.role, email: user.email, name: user.name },
            $setOnInsert: { createdAt: new Date() },
          },
          { upsert: true, session },
        );
        await db
          .collection("storeInvites")
          .deleteOne({ _id: invite._id }, { session });
      });
      return out({ ok: true });
    }
    if (path[0] === "storefront" && path[1] && method === "GET") {
      const store = await db
        .collection("stores")
        .findOne({ slug: path[1], status: "active" });
      if (!store) reject(404, "Store not found");
      const storeId = store._id.toString();
      const filter: any = { storeId, status: "active" };
      const q = url.searchParams.get("q")?.slice(0, 100);
      if (q) filter.name = { $regex: escapeRegex(q), $options: "i" };
      if (url.searchParams.get("category"))
        filter.categoryId = idSchema.parse(url.searchParams.get("category"));
      const page = Math.max(
        1,
        Math.min(10000, Math.trunc(Number(url.searchParams.get("page")) || 1)),
      );
      const sort: any =
        url.searchParams.get("sort") === "price"
          ? { "variants.price": 1, _id: 1 }
          : { featured: -1, createdAt: -1, _id: -1 };
      return out({
        store: {
          ...safeStore(store),
          onlinePaymentsReady: gatewayReady() && !!store.paymentConfig?.enabled,
        },
        categories: await db
          .collection("storeCategories")
          .find({ storeId })
          .sort({ name: 1 })
          .toArray(),
        products: (
          await db
            .collection("commerceProducts")
            .find(filter)
            .sort(sort)
            .skip((page - 1) * 24)
            .limit(24)
            .toArray()
        ).map(safeProduct),
        total: await db.collection("commerceProducts").countDocuments(filter),
        page,
      });
    }
    if (path[0] === "products" && path[1] && method === "GET") {
      const product = await db
        .collection("commerceProducts")
        .findOne({ _id: oid(path[1]), status: "active" });
      if (!product) reject(404, "Product not found");
      const store = await db
        .collection("stores")
        .findOne({ _id: oid(product.storeId), status: "active" });
      if (!store) reject(404, "Store unavailable");
      return out({
        product: safeProduct(product),
        store: safeStore(store),
        reviews: await db
          .collection("storeReviews")
          .find({ productId: path[1] })
          .sort({ createdAt: -1 })
          .limit(50)
          .toArray(),
      });
    }
    if (path[0] === "products" && path[2] === "reviews" && method === "POST") {
      signedIn(user);
      const productId = idSchema.parse(path[1]);
      const data = z
        .object({
          text: z.string().trim().min(3).max(2000),
          rating: z.number().int().min(1).max(5),
        })
        .parse(await input(req));
      const purchased = await db.collection("orders").findOne({
        userId: user._id,
        "lines.productId": productId,
        paymentStatus: "paid",
      });
      if (!purchased) reject(403, "Reviews are limited to verified purchases");
      await db.collection("storeReviews").insertOne({
        ...data,
        userId: user._id,
        userName: user.name,
        productId,
        storeId: purchased.storeId,
        createdAt: new Date(),
      });
      return out({ ok: true }, 201);
    }
    if (path[0] === "favorites") {
      signedIn(user);
      if (method === "GET") {
        const saved = await db
          .collection("commerceFavorites")
          .find({ userId: user._id })
          .limit(200)
          .toArray();
        const activeStores = await db
          .collection("stores")
          .find(
            { status: "active" },
            { projection: { _id: 1, currency: 1, name: 1, slug: 1 } },
          )
          .toArray();
        const storeMap = new Map(
          activeStores.map((s) => [s._id.toString(), s]),
        );
        const products = await db
          .collection("commerceProducts")
          .find({
            _id: { $in: saved.map((s) => oid(s.productId)) },
            status: "active",
            storeId: { $in: [...storeMap.keys()] },
          })
          .toArray();
        return out({
          products: products.map((p) => ({
            ...safeProduct(p),
            store: storeMap.get(p.storeId),
          })),
        });
      }
      const productId = idSchema.parse(path[1]);
      if (method === "POST") {
        if (
          !(await db
            .collection("commerceProducts")
            .findOne({ _id: oid(productId), status: "active" }))
        )
          reject(404, "Product unavailable");
        await db
          .collection("commerceFavorites")
          .updateOne(
            { userId: user._id, productId },
            { $setOnInsert: { createdAt: new Date() } },
            { upsert: true },
          );
        return out({ ok: true });
      }
      if (method === "DELETE") {
        await db
          .collection("commerceFavorites")
          .deleteOne({ userId: user._id, productId });
        return out({ ok: true });
      }
    }
    if (path[0] === "cart") {
      signedIn(user);
      if (method === "GET")
        return out({
          carts: await db
            .collection("commerceCarts")
            .find({ userId: user._id })
            .toArray(),
        });
      if (method === "POST") {
        const data = cartSchema.parse(await input(req));
        const prior = await db
          .collection("commerceCarts")
          .findOne({ userId: user._id, storeId: data.storeId });
        const removingOnly =
          prior &&
          data.lines.every((line) =>
            prior.lines.some(
              (p: any) =>
                p.productId === line.productId &&
                p.variantId === line.variantId &&
                p.quantity >= line.quantity,
            ),
          );
        if (data.lines.length && !removingOnly) await quote(db, data);
        await db
          .collection("commerceCarts")
          .updateOne(
            { userId: user._id, storeId: data.storeId },
            { $set: { ...data, updatedAt: new Date() } },
            { upsert: true },
          );
        return out({ ok: true });
      }
    }
    if (path[0] === "quote" && method === "POST") {
      signedIn(user);
      const raw = await input(req);
      const data = z
        .object({
          storeId: idSchema,
          lines: cartSchema.shape.lines,
          delivery: z.enum(["shipping", "pickup"]).optional(),
          coupon: z.string().max(40).optional(),
          address: z.object({ country: z.string().length(2) }).optional(),
        })
        .parse(raw);
      const q = await quote(db, data);
      return out({
        lines: q.lines,
        subtotal: q.subtotal,
        discount: q.discount,
        shipping: q.shipping,
        tax: q.tax,
        total: q.total,
        currency: q.currency,
        codAllowed: q.codAllowed && q.store.codEnabled,
        onlinePaymentsReady: gatewayReady() && !!q.store.paymentConfig?.enabled,
      });
    }
    if (path[0] === "orders") {
      signedIn(user);
      if (!path[1] && method === "GET")
        return out({
          orders: await db
            .collection("orders")
            .find({ userId: user._id })
            .project({ fingerprint: 0, merchantRef: 0, idempotencyKey: 0 })
            .sort({ createdAt: -1 })
            .limit(100)
            .toArray(),
        });
      if (!path[1] && method === "POST") {
        const order = await createOrder(user, await input(req));
        const paid = await beginPayment(
          order,
          process.env.APP_URL || url.origin,
        );
        await sendEmail(
          user.email,
          `Order ${order.number} received`,
          `${order.storeName} has received order ${order.number}. Payment status: ${paid.paymentStatus}. View your order at ${process.env.APP_URL || url.origin}/orders`,
          `order-${order._id}`,
        ).catch(() => false);
        return out({ order: publicOrder(paid) }, 201);
      }
      const order = await db
        .collection("orders")
        .findOne({ _id: oid(path[1]) });
      if (!order) reject(404, "Order not found");
      if (order.userId !== user._id) await access(user, order.storeId);
      if (!path[2] && method === "GET") {
        await reconcileOrder(order);
        const fresh = await db.collection("orders").findOne({ _id: order._id });
        return out({ order: publicOrder(fresh) });
      }
      if (path[2] === "cancel" && method === "POST") {
        await cancelOrder(user, path[1]);
        return out({ ok: true });
      }
      if (path[2] === "pay" && method === "POST") {
        if (order.userId !== user._id)
          reject(403, "Only the buyer can complete payment");
        return out({
          order: publicOrder(
            await beginPayment(order, process.env.APP_URL || url.origin),
          ),
        });
      }
      if (path[2] === "fulfill" && method === "POST") {
        await updateFulfillment(user, path[1], await input(req));
        return out({ ok: true });
      }
      if (path[2] === "collect" && method === "POST") {
        await access(user, order.storeId);
        if (
          order.paymentMethod !== "cod" ||
          order.fulfillment !== "delivered" ||
          order.paymentStatus !== "unpaid"
        )
          reject(409, "Only delivered cash orders can be marked collected");
        await db
          .collection("orders")
          .updateOne({ _id: order._id, paymentStatus: "unpaid" }, {
            $set: { paymentStatus: "paid" },
            $push: {
              history: { event: "Cash payment collected", at: new Date() },
            },
          } as any);
        await audit(user._id, order.storeId, "collect-cash", path[1]);
        return out({ ok: true });
      }
      if (path[2] === "return" && method === "POST") {
        if (order.userId !== user._id)
          reject(403, "Only the buyer may request a return");
        const { reason } = z
          .object({ reason: z.string().trim().min(5).max(2000) })
          .parse(await input(req));
        const store = await db
          .collection("stores")
          .findOne({ _id: oid(order.storeId) });
        const delivered = order.history.findLast(
          (h: any) => h.event === "Order delivered",
        );
        if (
          order.fulfillment !== "delivered" ||
          !(order.returnWindowDays ?? store?.returnsDays) ||
          !delivered ||
          Date.now() - new Date(delivered.at).getTime() >
            (order.returnWindowDays ?? store!.returnsDays) * 86400000 ||
          order.returnRequest
        )
          reject(
            409,
            "This order is outside the return window or already has a request",
          );
        await db.collection("orders").updateOne(
          { _id: order._id, returnRequest: { $exists: false } },
          {
            $set: {
              returnRequest: { reason, status: "requested", at: new Date() },
            },
          },
        );
        return out({ ok: true });
      }
      if (path[2] === "return-status" && method === "POST") {
        await access(user, order.storeId);
        const { status } = z
          .object({ status: z.enum(["approved", "rejected", "received"]) })
          .parse(await input(req));
        if (
          !order.returnRequest ||
          (status === "received" &&
            order.returnRequest.status !== "approved") ||
          (["approved", "rejected"].includes(status) &&
            order.returnRequest.status !== "requested")
        )
          reject(409, "Invalid return transition");
        await transaction(async (db, session) => {
          const latest = await db
            .collection("orders")
            .findOne({ _id: order._id }, { session });
          if (
            !latest ||
            latest.returnRequest?.status !== order.returnRequest.status
          )
            reject(409, "Return state changed; refresh the order");
          await db
            .collection("orders")
            .updateOne(
              { _id: order._id },
              { $set: { "returnRequest.status": status } },
              { session },
            );
          if (status === "received" && latest.paymentStatus === "refunded")
            await releaseOrder(db, session, latest, "refunded");
        });
        return out({ ok: true });
      }
      if (path[2] === "refund" && method === "POST") {
        await access(user, order.storeId, true);
        if (order.paymentStatus === "refunded") return out({ ok: true });
        if (
          !["paid", "refunding"].includes(order.paymentStatus) ||
          order.fulfillment === "shipped" ||
          (order.fulfillment === "delivered" &&
            order.returnRequest?.status !== "received")
        )
          reject(
            409,
            "Only paid orders with unshipped or received returns can be refunded",
          );
        if (order.paymentMethod === "card") {
          const result = await gatewayCall("refund", {
            orderId: path[1],
            merchantRef: order.merchantRef,
            paymentId: order.paymentId,
            amount: order.total,
            currency: order.currency,
            idempotencyKey: `refund-${path[1]}`,
          });
          if (
            result.amount !== order.total ||
            result.currency !== order.currency
          )
            reject(502, "Refund response did not match the order");
          if (result.status === "refunded")
            await applyPaymentEvent({
              eventId: `refund-${result.id}`,
              orderId: path[1],
              paymentId: order.paymentId,
              merchantRef: order.merchantRef,
              status: "refunded",
              amount: result.amount,
              currency: result.currency,
            });
          else if (result.status === "pending")
            await db
              .collection("orders")
              .updateOne(
                { _id: order._id, paymentStatus: "paid" },
                { $set: { paymentStatus: "refunding" } },
              );
          else reject(502, "Provider did not confirm the refund");
        } else {
          const { confirmation } = z
            .object({ confirmation: z.literal("CASH_RETURNED") })
            .parse(await input(req));
          await transaction(async (db, session) => {
            const current = await db
              .collection("orders")
              .findOne({ _id: order._id }, { session });
            if (current) await releaseOrder(db, session, current, "refunded");
          });
        }
        await audit(user._id, order.storeId, "refund", path[1]);
        return out({ ok: true });
      }
      if (path[2] === "downloads" && method === "GET") {
        if (order.userId !== user._id || order.paymentStatus !== "paid")
          reject(403, "Paid purchase required");
        const downloads = [];
        for (const line of order.lines.filter(
          (l: any) => l.type === "digital",
        )) {
          const p = await db
            .collection("commerceProducts")
            .findOne({ _id: oid(line.productId) });
          if (p?.deliveryUrl)
            downloads.push({ name: line.name, url: p.deliveryUrl });
        }
        return out({ downloads });
      }
    }
    if (path[0] === "stores" && path[1]) {
      const storeId = idSchema.parse(path[1]);
      const store = await access(user, storeId);
      signedIn(user);
      if (!path[2] && method === "PATCH") {
        await access(user, storeId, true);
        const data = storeSchema
          .partial()
          .strict()
          .parse(await input(req));
        if (data.slug && data.slug !== store.slug && user.role !== "admin")
          reject(403, "Only platform administrators can change store URLs");
        await transaction(async (db, session) => {
          const locked = await db
            .collection("stores")
            .findOneAndUpdate(
              { _id: oid(storeId) },
              { $inc: { orderVersion: 1 } },
              { session, returnDocument: "after" },
            );
          if (
            data.currency &&
            data.currency !== locked!.currency &&
            (await db.collection("orders").findOne({ storeId }, { session }))
          )
            reject(409, "Currency cannot change after the first order");
          await db.collection("stores").updateOne(
            { _id: oid(storeId) },
            {
              $set: { ...data, updatedAt: new Date() },
              $inc: { version: 1 },
            },
            { session },
          );
        });
        await audit(user._id, storeId, "update-store", storeId);
        return out({ ok: true });
      }
      if (path[2] === "status" && method === "POST") {
        admin(user);
        const { status } = z
          .object({ status: z.enum(["draft", "active", "suspended"]) })
          .parse(await input(req));
        await db
          .collection("stores")
          .updateOne(
            { _id: oid(storeId) },
            { $set: { status }, $inc: { orderVersion: 1 } },
          );
        await audit(user._id, storeId, "store-" + status, storeId);
        return out({ ok: true });
      }
      if (path[2] === "payments" && method === "GET") {
        admin(user);
        return out({
          merchantRef: store.paymentConfig?.merchantRef || "",
          enabled: !!store.paymentConfig?.enabled,
          gatewayConfigured: gatewayReady(),
          readiness: paymentReadiness(),
        });
      }
      if (path[2] === "payments" && method === "POST") {
        admin(user);
        const config = z
          .object({
            enabled: z.boolean(),
            merchantRef: z.string().min(1).max(200),
          })
          .parse(await input(req));
        if (config.enabled && !gatewayReady())
          reject(503, "Configure the bank-approved payment connector first");
        await db
          .collection("stores")
          .updateOne(
            { _id: oid(storeId) },
            { $set: { paymentConfig: config } },
          );
        await audit(user._id, storeId, "configure-payments", storeId);
        return out({ ok: true });
      }
      if (path[2] === "products") {
        if (method === "GET")
          return out({
            products: await db
              .collection("commerceProducts")
              .find({ storeId })
              .sort({ createdAt: -1 })
              .limit(500)
              .toArray(),
          });
        if (method === "POST" && !path[3]) {
          const data = commerceProductSchema.parse(await input(req));
          await checkCategory(storeId, data.categoryId);
          const product = {
            ...data,
            storeId,
            version: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const result = await db
            .collection("commerceProducts")
            .insertOne(product);
          await audit(
            user._id,
            storeId,
            "create-product",
            result.insertedId.toString(),
          );
          return out({ product: { ...product, _id: result.insertedId } }, 201);
        }
        if (method === "PATCH" && path[3]) {
          const raw = await input(req);
          const data = commerceProductSchema.parse(raw);
          const { expectedVersion } = z
            .object({ expectedVersion: z.number().int().nonnegative() })
            .parse(raw);
          await checkCategory(storeId, data.categoryId);
          await transaction(async (db, session) => {
            const old = await db
              .collection("commerceProducts")
              .findOne({ _id: oid(path[3]), storeId }, { session });
            if (!old) reject(404, "Product not found");
            if ((old.version || 0) !== expectedVersion)
              reject(
                409,
                "Inventory changed since you opened this product. Reload before saving.",
              );
            const live = await db.collection("orders").findOne(
              {
                storeId,
                fulfillment: { $ne: "cancelled" },
                "lines.productId": path[3],
              },
              { session },
            );
            if (live) {
              const prior = new Set(old.variants.map((v: any) => v.id));
              const next = new Set(data.variants.map((v) => v.id));
              if (
                [...prior].some((id) => !next.has(id as string)) ||
                old.trackStock !== data.trackStock
              )
                reject(
                  409,
                  "Keep existing variants and stock tracking until open orders are fulfilled",
                );
            }
            await db.collection("commerceProducts").updateOne(
              { _id: old._id },
              {
                $set: { ...data, updatedAt: new Date() },
                $inc: { version: 1 },
              },
              { session },
            );
          });
          await audit(user._id, storeId, "update-product", path[3]);
          return out({ ok: true });
        }
      }
      if (path[2] === "categories") {
        if (method === "GET")
          return out({
            categories: await db
              .collection("storeCategories")
              .find({ storeId })
              .sort({ name: 1 })
              .toArray(),
          });
        if (method === "POST") {
          const data = categorySchema.parse(await input(req));
          await checkCategory(storeId, data.parentId);
          const result = await db
            .collection("storeCategories")
            .insertOne({ ...data, storeId });
          return out({ _id: result.insertedId, ...data }, 201);
        }
        if (method === "PATCH") {
          const data = categorySchema
            .partial()
            .strict()
            .parse(await input(req));
          const category = await db
            .collection("storeCategories")
            .findOne({ _id: oid(path[3]), storeId });
          if (!category) reject(404, "Category not found");
          await checkCategory(storeId, data.parentId || "");
          let parent = data.parentId;
          const seen = new Set([path[3]]);
          while (parent) {
            if (seen.has(parent))
              reject(400, "Category trees cannot contain cycles");
            seen.add(parent);
            const next = await db
              .collection("storeCategories")
              .findOne({ _id: oid(parent), storeId });
            parent = next?.parentId;
          }
          await db
            .collection("storeCategories")
            .updateOne({ _id: category._id }, { $set: data });
          return out({ ok: true });
        }
        if (method === "DELETE") {
          if (
            (await db
              .collection("commerceProducts")
              .findOne({ storeId, categoryId: path[3] })) ||
            (await db
              .collection("storeCategories")
              .findOne({ storeId, parentId: path[3] }))
          )
            reject(409, "Move products and child categories before deleting");
          await db
            .collection("storeCategories")
            .deleteOne({ _id: oid(path[3]), storeId });
          return out({ ok: true });
        }
      }
      if (path[2] === "coupons") {
        if (method === "GET")
          return out({
            coupons: await db
              .collection("storeCoupons")
              .find({ storeId })
              .sort({ expiresAt: -1 })
              .toArray(),
          });
        if (method === "POST") {
          const data = couponSchema.parse(await input(req));
          if (new Date(data.expiresAt) <= new Date())
            reject(400, "Choose a future expiry");
          const result = await db.collection("storeCoupons").insertOne({
            ...data,
            expiresAt: new Date(data.expiresAt),
            storeId,
            used: 0,
          });
          return out({ _id: result.insertedId }, 201);
        }
        if (method === "PATCH") {
          const { active } = z
            .object({ active: z.boolean() })
            .parse(await input(req));
          await db
            .collection("storeCoupons")
            .updateOne({ _id: oid(path[3]), storeId }, { $set: { active } });
          return out({ ok: true });
        }
      }
      if (path[2] === "team") {
        await access(user, storeId, true);
        if (method === "GET")
          return out({
            members: await db
              .collection("storeMembers")
              .find({ storeId })
              .toArray(),
            invitations: await db
              .collection("storeInvites")
              .find({ storeId })
              .project({ token: 0 })
              .toArray(),
          });
        if (method === "POST") {
          const data = z
            .object({
              email: z.email().transform((s) => s.toLowerCase()),
              role: z.enum(["owner", "staff"]).default("staff"),
            })
            .parse(await input(req));
          if (data.role === "owner") admin(user);
          const token = randomBytes(32).toString("hex");
          await db.collection("storeInvites").insertOne({
            ...data,
            storeId,
            token: digest(token),
            expiresAt: new Date(Date.now() + 7 * 86400000),
            createdBy: user._id,
          });
          return out(
            {
              inviteUrl: `${process.env.APP_URL || url.origin}/invite?token=${token}`,
              email: data.email,
            },
            201,
          );
        }
        if (method === "DELETE") {
          const member = await db
            .collection("storeMembers")
            .findOne({ _id: oid(path[3]), storeId });
          if (member?.role === "owner") admin(user);
          await db
            .collection("storeMembers")
            .deleteOne({ _id: oid(path[3]), storeId });
          return out({ ok: true });
        }
      }
      if (path[2] === "orders" && method === "GET")
        return out({
          orders: (
            await db
              .collection("orders")
              .find({ storeId })
              .sort({ createdAt: -1 })
              .limit(200)
              .toArray()
          ).map(publicOrder),
        });
      if (path[2] === "customers" && method === "GET") {
        const customers = await db
          .collection("orders")
          .aggregate([
            { $match: { storeId } },
            {
              $group: {
                _id: "$userId",
                email: { $first: "$email" },
                name: { $first: "$address.name" },
                orders: { $sum: 1 },
                paid: {
                  $sum: {
                    $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0],
                  },
                },
              },
            },
            { $sort: { orders: -1 } },
            { $limit: 200 },
          ])
          .toArray();
        return out({ customers });
      }
      if (path[2] === "analytics" && method === "GET") {
        const orders = await db
          .collection("orders")
          .aggregate([
            { $match: { storeId } },
            {
              $group: {
                _id: "$currency",
                orders: { $sum: 1 },
                revenue: {
                  $sum: {
                    $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0],
                  },
                },
                pending: {
                  $sum: {
                    $cond: [
                      {
                        $in: [
                          "$paymentStatus",
                          ["unpaid", "creating", "pending"],
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ])
          .toArray();
        const products = await db
          .collection("commerceProducts")
          .countDocuments({ storeId });
        const lowStock = await db
          .collection("commerceProducts")
          .find({
            storeId,
            trackStock: true,
            status: "active",
            variants: { $elemMatch: { stock: { $lt: 5 } } },
          })
          .project({ name: 1, variants: 1 })
          .limit(30)
          .toArray();
        return out({ orders, products, lowStock });
      }
      if (path[2] === "export" && method === "GET") {
        const orders = await db
          .collection("orders")
          .find({ storeId })
          .sort({ createdAt: -1 })
          .limit(10000)
          .toArray();
        const cell = (v: any) =>
          '"' +
          String(v ?? "")
            .replace(/^[=+@\-\t\r]/, "'$&")
            .replaceAll('"', '""') +
          '"';
        const rows = [
          [
            "Order",
            "Date",
            "Customer",
            "Email",
            "Currency",
            "Total minor units",
            "Payment",
            "Fulfillment",
          ],
          ...orders.map((o) => [
            o.number,
            o.createdAt.toISOString(),
            o.address.name,
            o.email,
            o.currency,
            o.total,
            o.paymentStatus,
            o.fulfillment,
          ]),
        ];
        return new Response(
          rows.map((r) => r.map(cell).join(",")).join("\r\n"),
          {
            headers: {
              "Content-Type": "text/csv;charset=utf-8",
              "Content-Disposition": 'attachment; filename="orders.csv"',
              "Cache-Control": "no-store",
            },
          },
        );
      }
    }
    if (path[0] === "admin") {
      admin(user);
      if (path[1] === "overview" && method === "GET")
        return out({
          stores: await db.collection("stores").countDocuments(),
          customers: await db.collection("users").countDocuments(),
          orders: await db.collection("orders").countDocuments(),
          paymentsConfigured: gatewayReady(),
          revenue: await db
            .collection("orders")
            .aggregate([
              { $match: { paymentStatus: "paid" } },
              { $group: { _id: "$currency", total: { $sum: "$total" } } },
            ])
            .toArray(),
        });
      if (path[1] === "users") {
        if (method === "GET")
          return out({
            users: await db
              .collection("users")
              .find()
              .project({ name: 1, email: 1, role: 1, disabled: 1 })
              .sort({ createdAt: -1 })
              .limit(200)
              .toArray(),
          });
        if (method === "PATCH") {
          const { disabled } = z
            .object({ disabled: z.boolean() })
            .parse(await input(req));
          const target = await db
            .collection("users")
            .findOne({ _id: oid(path[2]) });
          if (!target) reject(404, "Account not found");
          if (target.role === "admin")
            reject(400, "Manage administrators through the admin CLI");
          await db
            .collection("users")
            .updateOne({ _id: target._id }, { $set: { disabled } });
          if (disabled)
            await db.collection("sessions").deleteMany({ userId: path[2] });
          await audit(
            user._id,
            "platform",
            "account-" + (disabled ? "suspend" : "restore"),
            path[2],
          );
          return out({ ok: true });
        }
      }
      if (path[1] === "audit" && method === "GET")
        return out({
          events: await db
            .collection("audit")
            .find({ storeId: { $exists: true } })
            .sort({ createdAt: -1 })
            .limit(100)
            .toArray(),
        });
    }
    reject(404, "Endpoint not found");
  } catch (e: any) {
    if (e instanceof z.ZodError)
      return out({ error: e.issues.map((x) => x.message).join("; ") }, 400);
    if (e instanceof CommerceError) return out({ error: e.message }, e.status);
    if (e?.code === 11000)
      return out({ error: "A record with these details already exists" }, 409);
    console.error("Commerce API failed", e?.name, e?.code || "");
    return out({ error: "Service temporarily unavailable" }, 503);
  }
}
async function checkCategory(storeId: string, id: string) {
  if (
    id &&
    !(await (await database())
      .collection("storeCategories")
      .findOne({ _id: oid(id), storeId }))
  )
    reject(400, "Category must belong to this store");
}
function publicOrder(order: any) {
  if (!order) return null;
  const { fingerprint, merchantRef, idempotencyKey, ...safe } = order;
  return safe;
}
