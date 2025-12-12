import { mutation, query, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { isAdminEmail } from "./roles";

const buildUpiDeepLink = ({
  payeeVpa,
  payeeName,
  amount,
  note,
}: {
  payeeVpa: string;
  payeeName?: string;
  amount: number;
  note?: string;
}) => {
  const params = new URLSearchParams({
    pa: payeeVpa,
    pn: payeeName ?? "Cafe",
    am: amount.toFixed(2),
    cu: "INR",
  });
  if (note) params.set("tn", note);
  return `upi://pay?${params.toString()}`;
};

type IncomingItem = {
  name: string;
  price: number;
  quantity: number;
  addOns?: { name: string; price: number }[];
  notes?: string;
};

const computeTotals = (items: IncomingItem[], mode: "table" | "delivery") => {
  const subtotal = items.reduce((sum, item) => {
    const addOnTotal = item.addOns?.reduce((acc, a) => acc + a.price, 0) ?? 0;
    return sum + (item.price + addOnTotal) * item.quantity;
  }, 0);
  const tax = Math.round(subtotal * 0.05);
  const fees = mode === "delivery" ? 30 : 0;
  const grandTotal = subtotal + tax + fees;
  return { subtotal, tax, fees, grandTotal };
};

const ensureCustomer = async (
  ctx: MutationCtx,
  email: string,
  contact: {
    name?: string;
    phone?: string;
    community?: string;
    tower?: string;
    unit?: string;
  },
  customerId?: Id<"customers">,
) => {
  const normalized = email.trim().toLowerCase();
  if (customerId) {
    const existing = await ctx.db.get(customerId);
    if (existing) {
      await ctx.db.patch(customerId, {
        lastSeenAt: Date.now(),
        name: contact.name ?? existing.name,
        phone: contact.phone ?? existing.phone,
        community: contact.community ?? existing.community,
        tower: contact.tower ?? existing.tower,
        unit: contact.unit ?? existing.unit,
        role: existing.role ?? (isAdminEmail(normalized) ? "admin" : undefined),
      });
      return customerId;
    }
  }

  const existingByEmail = await ctx.db
    .query("customers")
    .withIndex("by_email", (q) => q.eq("email", normalized))
    .unique();
  const now = Date.now();
  if (existingByEmail?._id) {
    await ctx.db.patch(existingByEmail._id, {
      lastSeenAt: now,
      name: contact.name ?? existingByEmail.name,
      phone: contact.phone ?? existingByEmail.phone,
      community: contact.community ?? existingByEmail.community,
      tower: contact.tower ?? existingByEmail.tower,
      unit: contact.unit ?? existingByEmail.unit,
      role: existingByEmail.role ?? (isAdminEmail(normalized) ? "admin" : undefined),
    });
    return existingByEmail._id;
  }

  return ctx.db.insert("customers", {
    email: normalized,
    name: contact.name,
    phone: contact.phone,
    role: isAdminEmail(normalized) ? "admin" : undefined,
    community: contact.community,
    tower: contact.tower,
    unit: contact.unit,
    createdAt: now,
    lastSeenAt: now,
    totalOrders: 0,
    totalSpend: 0,
    lastOrderAt: undefined,
  });
};

export const create = mutation({
  args: {
    mode: v.union(v.literal("table"), v.literal("delivery")),
    serviceType: v.optional(v.union(v.literal("table"), v.literal("takeaway"))),
    tableId: v.optional(v.string()),
    contact: v.object({
      name: v.optional(v.string()),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      community: v.optional(v.string()),
      tower: v.optional(v.string()),
      unit: v.optional(v.string()),
      address: v.optional(v.string()),
      landmark: v.optional(v.string()),
    }),
    customerId: v.optional(v.id("customers")),
    customerEmail: v.string(),
    items: v.array(
      v.object({
        itemId: v.optional(v.string()),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        addOns: v.optional(v.array(v.object({ name: v.string(), price: v.number() }))),
        notes: v.optional(v.string()),
      }),
    ),
    paymentMethod: v.union(v.literal("upi"), v.literal("cod")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let code: string | undefined;
    // Ensure uniqueness by retrying a few times.
    for (let i = 0; i < 5; i += 1) {
      const candidate = `YY-${Math.floor(Math.random() * 9000 + 1000)}`;
      const collision = await ctx.db
        .query("orders")
        .withIndex("by_code", (q) => q.eq("code", candidate))
        .first();
      if (!collision) {
        code = candidate;
        break;
      }
    }
    code = code ?? `YY-${now}`;

    const contact = {
      name: args.contact.name,
      phone: args.contact.phone,
      email: args.contact.email ?? args.customerEmail,
      address: args.contact.address,
      landmark: args.contact.landmark,
      community: args.contact.community,
      tower: args.contact.tower,
      unit: args.contact.unit,
    };

    const customerId = await ensureCustomer(ctx, args.customerEmail, contact, args.customerId);
    const totals = computeTotals(args.items, args.mode);

    const payeeVpa = process.env.NEXT_PUBLIC_UPI_ID ?? "test@upi";
    const upiLink =
      args.paymentMethod === "upi"
        ? buildUpiDeepLink({
            payeeVpa,
            payeeName: "YumYard",
            amount: totals.grandTotal,
            note: code,
          })
        : undefined;

    const paymentStatus = args.paymentMethod === "cod" ? "pending_cash" : "pending";

    const statusHistory = [{ status: "submitted" as const, at: now, note: "Order placed" }];

    const orderId = await ctx.db.insert("orders", {
      code,
      mode: args.mode,
      tableId: args.tableId,
      serviceType: args.serviceType,
      customerId,
      customerEmail: args.customerEmail.trim().toLowerCase(),
      contact,
      payment: {
        method: args.paymentMethod,
        status: paymentStatus,
        amount: totals.grandTotal,
        reference: undefined,
        upiLink,
      },
      status: "submitted",
      statusHistory,
      items: args.items,
      totals,
      etaMinutes: undefined,
      rider: undefined,
      createdAt: now,
      updatedAt: now,
    });

    // Update customer aggregates
    const customer = await ctx.db.get(customerId);
    if (customer) {
      await ctx.db.patch(customerId, {
        totalOrders: customer.totalOrders + 1,
        totalSpend: customer.totalSpend + totals.grandTotal,
        lastOrderAt: now,
      });
    }

    return { id: orderId, code, upiLink };
  },
});

export const listLive = query({
  args: {},
  handler: async (ctx) => {
    const ignore = new Set(["served", "delivered", "cancelled"]);
    const orders = await ctx.db.query("orders").collect();
    return orders
      .filter((o) => !ignore.has(o.status) && o.payment.status !== "paid")
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((o) => ({ ...o, id: o._id }));
  },
});

export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 50 }) => {
    const orders = await ctx.db.query("orders").collect();
    return orders
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit)
      .map((o) => ({ ...o, id: o._id }));
  },
});

export const orderDetail = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
    if (!order) return null;
    return { ...order, id: order._id };
  },
});

export const listByCustomer = query({
  args: { customerId: v.optional(v.id("customers")), email: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const byId = args.customerId
      ? await ctx.db
          .query("orders")
          .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
          .collect()
      : [];
    const email = args.email?.trim().toLowerCase();
    const byEmail = email
      ? await ctx.db
          .query("orders")
          .withIndex("by_customer_email", (q) => q.eq("customerEmail", email))
          .collect()
      : [];
    const merged = [...byId, ...byEmail];
    const seen = new Set<string>();
    const deduped = merged.filter((o) => {
      const key = o._id.toString();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return deduped.sort((a, b) => b.createdAt - a.createdAt).map((o) => ({ ...o, id: o._id }));
  },
});

export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("submitted"),
      v.literal("accepted"),
      v.literal("preparing"),
      v.literal("packed"),
      v.literal("on_the_way"),
      v.literal("served"),
      v.literal("delivered"),
      v.literal("cancelled"),
    ),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    const history = [...order.statusHistory, { status: args.status, at: Date.now(), note: args.note }];
    await ctx.db.patch(args.orderId, {
      status: args.status,
      statusHistory: history,
      updatedAt: Date.now(),
    });
    return { ...order, status: args.status, statusHistory: history, id: args.orderId };
  },
});

export const setEta = mutation({
  args: { orderId: v.id("orders"), etaMinutes: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    await ctx.db.patch(args.orderId, { etaMinutes: args.etaMinutes, updatedAt: Date.now() });
    return { ...order, etaMinutes: args.etaMinutes, id: args.orderId };
  },
});

export const markPayment = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(v.literal("paid"), v.literal("pending"), v.literal("pending_cash"), v.literal("failed")),
    reference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    await ctx.db.patch(args.orderId, {
      payment: {
        ...order.payment,
        status: args.status,
        reference: args.reference ?? order.payment.reference,
      },
      updatedAt: Date.now(),
    });
    return { ...order, payment: { ...order.payment, status: args.status, reference: args.reference } };
  },
});
