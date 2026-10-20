import { randomUUID } from "node:crypto";
import { ObjectId, type ClientSession, type Db } from "mongodb";
import { database, transaction } from "@delta/database";
import {
  cartSchema,
  checkoutSchema,
  totals,
  fulfillmentTransitions,
} from "@delta/domain/commerce";
import type { User } from "@delta/domain";
import { z } from "zod";
import { digest } from "../auth";
import { oid, reject, access, audit } from "./shared";
import { gatewayReady, gatewayCall } from "./payments";

export async function quote(db: Db, raw: unknown, session?: ClientSession) {
  const request = cartSchema.parse(raw);
  const options = session ? { session } : {};
  const store = await db
    .collection("stores")
    .findOne({ _id: oid(request.storeId), status: "active" }, options);
  if (!store) reject(404, "Store unavailable");
  if (!request.lines.length) reject(400, "Cart is empty");
  const data = raw as any;
  const lines = [];
  let subtotal = 0;
  let physical = false;
  let codAllowed = true;
  for (const line of request.lines) {
    const product = await db.collection("commerceProducts").findOne(
      {
        _id: oid(line.productId),
        storeId: request.storeId,
        status: "active",
      },
      options,
    );
    if (!product) reject(409, "A product is no longer available");
    const variant = product.variants.find((v: any) => v.id === line.variantId);
    if (!variant) reject(409, "A product variant is no longer available");
    if (product.trackStock && variant.stock < line.quantity)
      reject(409, `${product.name} has insufficient stock`);
    subtotal += variant.price * line.quantity;
    physical ||= product.type === "physical";
    codAllowed &&= product.type === "physical";
    lines.push({
      productId: line.productId,
      variantId: line.variantId,
      quantity: line.quantity,
      name: product.name,
      variant: variant.name,
      sku: variant.sku,
      unitPrice: variant.price,
      type: product.type,
      trackStock: product.trackStock,
      image: product.images[0] || "",
    });
  }
  const delivery = data.delivery || "shipping";
  if (delivery === "pickup" && !store.pickupEnabled)
    reject(400, "Store pickup is unavailable");
  if (
    physical &&
    delivery === "shipping" &&
    data.address &&
    !store.deliveryCountries.includes(data.address.country)
  )
    reject(400, "This store does not deliver to your country");
  let shipping = physical && delivery === "shipping" ? store.shippingFee : 0;
  if (store.freeShippingAbove > 0 && subtotal >= store.freeShippingAbove)
    shipping = 0;
  let discount = 0;
  let coupon: any = null;
  if (data.coupon) {
    coupon = await db.collection("storeCoupons").findOne(
      {
        storeId: request.storeId,
        code: String(data.coupon).toUpperCase(),
        active: true,
        expiresAt: { $gt: new Date() },
      },
      options,
    );
    if (!coupon || coupon.used >= coupon.limit || subtotal < coupon.minimum)
      reject(
        400,
        "Coupon is invalid, expired, or its minimum has not been reached",
      );
    discount = Math.min(
      subtotal,
      coupon.kind === "percentage"
        ? Math.round((subtotal * coupon.value) / 10000)
        : coupon.value,
    );
  }
  return {
    store,
    lines,
    coupon,
    codAllowed,
    ...totals(subtotal, discount, shipping, store.taxBps),
    currency: store.currency,
  };
}
export async function createOrder(user: User, raw: unknown) {
  const input = checkoutSchema.parse(raw);
  const fingerprint = digest(JSON.stringify(input));
  const db = await database();
  const existing = await db
    .collection("orders")
    .findOne({ userId: user._id, idempotencyKey: input.idempotencyKey });
  if (existing) {
    if (existing.fingerprint !== fingerprint)
      reject(409, "This checkout key belongs to a different request");
    return existing;
  }
  return transaction(async (db, session) => {
    const repeated = await db
      .collection("orders")
      .findOne(
        { userId: user._id, idempotencyKey: input.idempotencyKey },
        { session },
      );
    if (repeated) {
      if (repeated.fingerprint !== fingerprint)
        reject(409, "Checkout key reused");
      return repeated;
    }
    const q = await quote(db, input, session);
    if (q.store.demo)
      reject(400, "This is a preview store. Its products are not for sale.");
    if (
      q.total !== input.expectedTotal ||
      q.currency !== input.expectedCurrency
    )
      reject(
        409,
        "Prices or delivery settings changed. Review your updated total before ordering.",
      );
    // Serialize order placement against store suspension and currency/settings changes.
    const available = await db
      .collection("stores")
      .updateOne(
        { _id: q.store._id, status: "active", currency: q.currency },
        { $inc: { orderVersion: 1 } },
        { session },
      );
    if (!available.matchedCount)
      reject(409, "Store settings changed; refresh checkout");
    if (input.paymentMethod === "cod" && (!q.store.codEnabled || !q.codAllowed))
      reject(400, "Cash on delivery is unavailable for these products");
    if (
      input.paymentMethod === "card" &&
      (!gatewayReady() ||
        !q.store.paymentConfig?.enabled ||
        !q.store.paymentConfig?.merchantRef)
    )
      reject(503, "Online payments are awaiting merchant gateway setup");
    for (const line of q.lines)
      if (line.trackStock) {
        const result = await db.collection("commerceProducts").updateOne(
          {
            _id: oid(line.productId),
            storeId: input.storeId,
            status: "active",
            variants: {
              $elemMatch: {
                id: line.variantId,
                stock: { $gte: line.quantity },
              },
            },
          },
          { $inc: { "variants.$.stock": -line.quantity, version: 1 } },
          { session },
        );
        if (!result.matchedCount)
          reject(409, "Stock changed. Please refresh your cart.");
      }
    if (q.coupon) {
      const result = await db.collection("storeCoupons").updateOne(
        {
          _id: q.coupon._id,
          active: true,
          used: { $lt: q.coupon.limit },
          expiresAt: { $gt: new Date() },
        },
        { $inc: { used: 1 } },
        { session },
      );
      if (!result.matchedCount) reject(409, "Coupon limit reached");
    }
    const order = {
      _id: new ObjectId(),
      number: `DS-${randomUUID().slice(0, 8).toUpperCase()}`,
      storeId: input.storeId,
      storeName: q.store.name,
      userId: user._id,
      email: user.email,
      lines: q.lines,
      address: input.address,
      delivery: input.delivery,
      paymentMethod: input.paymentMethod,
      stockReleased: false,
      paymentStatus: input.paymentMethod === "cod" ? "unpaid" : "creating",
      fulfillment: "unfulfilled",
      subtotal: q.subtotal,
      discount: q.discount,
      shipping: q.shipping,
      tax: q.tax,
      total: q.total,
      currency: q.currency,
      returnWindowDays: q.store.returnsDays,
      returnPolicy: q.store.returnPolicy,
      shippingPolicy: q.store.shippingPolicy,
      storeAddress: q.store.address,
      couponId: q.coupon?._id.toString() || "",
      notes: input.notes,
      idempotencyKey: input.idempotencyKey,
      fingerprint,
      merchantRef: q.store.paymentConfig?.merchantRef || "",
      reservedUntil: new Date(Date.now() + 30 * 60000),
      createdAt: new Date(),
      history: [{ event: "Order placed", at: new Date() }],
    };
    await db.collection("orders").insertOne(order, { session });
    const members = await db
      .collection("storeMembers")
      .find({ storeId: input.storeId }, { session })
      .toArray();
    if (members.length)
      await db.collection("notifications").insertMany(
        members.map((m) => ({
          userId: m.userId,
          text: `${q.store.name}: new order ${order.number}`,
          read: false,
          createdAt: new Date(),
        })),
        { session },
      );
    await db.collection("notifications").insertOne(
      {
        userId: user._id,
        text: `Order ${order.number} placed at ${q.store.name}`,
        read: false,
        createdAt: new Date(),
      },
      { session },
    );
    await db
      .collection("commerceCarts")
      .deleteOne({ userId: user._id, storeId: input.storeId }, { session });
    return order;
  });
}
export async function beginPayment(order: any, origin: string) {
  if (
    order.paymentMethod !== "card" ||
    !["creating", "pending"].includes(order.paymentStatus)
  )
    return order;
  if (order.paymentUrl) return order;
  const result = await gatewayCall("create", {
    orderId: order._id.toString(),
    idempotencyKey: order._id.toString(),
    merchantRef: order.merchantRef,
    amount: order.total,
    currency: order.currency,
    customerEmail: order.email,
    expiresAt: order.reservedUntil.toISOString(),
    returnUrl: `${origin}/orders?order=${order._id}`,
    webhookUrl: `${origin}/api/commerce/payments/webhook`,
  });
  if (
    result.amount !== order.total ||
    result.currency !== order.currency ||
    result.status !== "pending"
  )
    reject(502, "Payment provider returned invalid checkout data");
  await (await database()).collection("orders").updateOne(
    { _id: order._id, paymentStatus: { $in: ["creating", "pending"] } },
    {
      $set: {
        paymentStatus: "pending",
        paymentId: result.id,
        paymentUrl: result.url,
      },
    },
  );
  return {
    ...order,
    paymentStatus: "pending",
    paymentId: result.id,
    paymentUrl: result.url,
  };
}
export async function releaseOrder(
  db: Db,
  session: ClientSession,
  order: any,
  paymentStatus = "cancelled",
) {
  if (order.stockReleased || order.fulfillment === "cancelled") {
    if (paymentStatus === "refunded" && order.paymentStatus !== "refunded")
      await db
        .collection("orders")
        .updateOne(
          { _id: order._id },
          { $set: { paymentStatus: "refunded" } },
          { session },
        );
    return;
  }
  for (const line of order.lines)
    if (line.trackStock)
      await db.collection("commerceProducts").updateOne(
        {
          _id: oid(line.productId),
          variants: { $elemMatch: { id: line.variantId } },
        },
        { $inc: { "variants.$.stock": line.quantity, version: 1 } },
        { session },
      );
  if (order.couponId)
    await db
      .collection("storeCoupons")
      .updateOne(
        { _id: oid(order.couponId), used: { $gt: 0 } },
        { $inc: { used: -1 } },
        { session },
      );
  await db.collection("orders").updateOne(
    { _id: order._id },
    {
      $set: { fulfillment: "cancelled", paymentStatus, stockReleased: true },
      $push: {
        history: {
          event:
            paymentStatus === "refunded"
              ? "Refund confirmed"
              : "Order cancelled",
          at: new Date(),
        },
      },
    } as any,
    { session },
  );
}
export async function cancelOrder(user: User, id: string) {
  const db = await database();
  const order = await db.collection("orders").findOne({ _id: oid(id) });
  if (!order) reject(404, "Order not found");
  if (order.userId !== user._id) await access(user, order.storeId);
  if (order.fulfillment === "cancelled") return;
  if (!["unfulfilled", "processing"].includes(order.fulfillment))
    reject(409, "This order can no longer be cancelled; request a return");
  if (["paid", "refunding", "refunded"].includes(order.paymentStatus))
    reject(409, "Paid orders require a refund");
  if (order.paymentMethod === "card") {
    const result = await gatewayCall("cancel", {
      orderId: id,
      merchantRef: order.merchantRef,
      paymentId: order.paymentId || "",
      idempotencyKey: `cancel-${id}`,
    });
    if (result.amount !== order.total || result.currency !== order.currency)
      reject(502, "Payment cancellation did not match the order");
    if (!["expired", "failed"].includes(result.status))
      reject(
        409,
        "Payment must be cancelled by the provider before releasing stock",
      );
  }
  await transaction(async (db, session) => {
    const latest = await db
      .collection("orders")
      .findOne({ _id: oid(id) }, { session });
    if (!latest) reject(404, "Order not found");
    if (["paid", "refunding", "refunded"].includes(latest.paymentStatus))
      reject(409, "Payment already completed");
    if (
      !["unfulfilled", "processing", "cancelled"].includes(latest.fulfillment)
    )
      reject(409, "Order fulfillment changed");
    await releaseOrder(db, session, latest);
  });
}
export async function updateFulfillment(user: User, id: string, raw: unknown) {
  const input = z
    .object({
      fulfillment: z.enum(["processing", "shipped", "delivered"]),
      tracking: z.string().max(200).default(""),
      carrier: z.string().max(100).default(""),
    })
    .parse(raw);
  return transaction(async (db, session) => {
    const order = await db
      .collection("orders")
      .findOne({ _id: oid(id) }, { session });
    if (!order) reject(404, "Order not found");
    await access(user, order.storeId);
    if (
      !(fulfillmentTransitions[order.fulfillment] || []).includes(
        input.fulfillment,
      )
    )
      reject(409, "Invalid fulfillment transition");
    if (
      order.paymentMethod === "card" &&
      order.paymentStatus !== "paid" &&
      !(
        order.paymentStatus === "refunded" &&
        order.fulfillment === "shipped" &&
        input.fulfillment === "delivered"
      )
    )
      reject(409, "Payment must be verified before fulfillment");
    if (input.fulfillment === "shipped" && !input.tracking)
      reject(400, "Tracking reference required");
    await db.collection("orders").updateOne(
      { _id: order._id },
      {
        $set: input,
        $push: {
          history: { event: `Order ${input.fulfillment}`, at: new Date() },
        },
      } as any,
      { session },
    );
    await db.collection("notifications").insertOne(
      {
        userId: order.userId,
        text: `${order.storeName}: order ${order.number} ${input.fulfillment}`,
        read: false,
        createdAt: new Date(),
      },
      { session },
    );
  });
}
export async function applyPaymentEvent(event: any) {
  return transaction(async (db, session) => {
    if (
      await db
        .collection("paymentEvents")
        .findOne({ provider: "connector", eventId: event.eventId }, { session })
    )
      return;
    const order = await db
      .collection("orders")
      .findOne({ _id: oid(event.orderId) }, { session });
    if (!order) reject(404, "Order not found");
    if (
      order.paymentMethod !== "card" ||
      order.merchantRef !== event.merchantRef ||
      order.total !== event.amount ||
      order.currency !== event.currency ||
      (order.paymentId && order.paymentId !== event.paymentId)
    )
      reject(409, "Payment details do not match the order");
    if (event.status === "paid" && order.paymentStatus === "refunding") {
      /* Keep the refund in progress on a late paid event. */
    } else if (event.status === "paid") {
      if (
        order.fulfillment === "cancelled" ||
        order.paymentStatus === "refunded"
      )
        reject(
          409,
          "Payment received for a closed order; provider reconciliation required",
        );
      await db.collection("orders").updateOne(
        { _id: order._id },
        {
          $set: { paymentStatus: "paid", paymentId: event.paymentId },
          $push: { history: { event: "Payment verified", at: new Date() } },
        } as any,
        { session },
      );
    } else if (event.status === "refunded") {
      // An authenticated provider refund is financial truth even if its paid
      // event arrived late, or goods have already shipped. Do not restock goods
      // that have not physically returned.
      if (
        order.fulfillment === "shipped" ||
        (order.fulfillment === "delivered" &&
          order.returnRequest?.status !== "received")
      ) {
        if (order.paymentStatus !== "refunded")
          await db.collection("orders").updateOne(
            { _id: order._id },
            {
              $set: { paymentStatus: "refunded" },
              $push: {
                history: {
                  event: "Provider refund confirmed; goods not yet returned",
                  at: new Date(),
                },
              },
            } as any,
            { session },
          );
      } else await releaseOrder(db, session, order, "refunded");
    } else if (["creating", "pending"].includes(order.paymentStatus))
      await releaseOrder(db, session, order, event.status);
    await db
      .collection("paymentEvents")
      .insertOne(
        { provider: "connector", ...event, createdAt: new Date() },
        { session },
      );
  });
}
export async function reconcileOrder(order: any) {
  if (
    order.paymentMethod !== "card" ||
    !["creating", "pending", "refunding"].includes(order.paymentStatus)
  )
    return;
  const result = await gatewayCall("status", {
    orderId: order._id.toString(),
    merchantRef: order.merchantRef,
    paymentId: order.paymentId || "",
  });
  if (result.status !== "pending")
    await applyPaymentEvent({
      eventId: `reconcile-${result.id}-${result.status}`,
      orderId: order._id.toString(),
      paymentId: result.id,
      merchantRef: order.merchantRef,
      status: result.status,
      amount: result.amount,
      currency: result.currency,
    });
}
