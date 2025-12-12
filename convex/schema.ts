import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  menu: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    tags: v.optional(v.array(v.string())),
    available: v.optional(v.boolean()),
    image: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    dealPrice: v.optional(v.number()),
    dealExpiresAt: v.optional(v.number()),
    comboItems: v.optional(v.array(v.string())),
  }),
  customers: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(v.literal("admin")),
    community: v.optional(v.string()),
    tower: v.optional(v.string()),
    unit: v.optional(v.string()),
    createdAt: v.number(),
    lastSeenAt: v.number(),
    totalOrders: v.number(),
    totalSpend: v.number(),
    lastOrderAt: v.optional(v.number()),
  }).index("by_email", ["email"]),
  loginTokens: defineTable({
    email: v.string(),
    code: v.string(),
    expiresAt: v.number(),
    used: v.boolean(),
  }).index("by_email", ["email"]),
  tables: defineTable({
    label: v.string(),
    zone: v.optional(v.string()),
    active: v.boolean(),
  }),
  orders: defineTable({
    code: v.string(),
    mode: v.union(v.literal("table"), v.literal("delivery")),
    tableId: v.optional(v.string()),
    serviceType: v.optional(v.union(v.literal("table"), v.literal("takeaway"))),
    customerId: v.optional(v.id("customers")),
    customerEmail: v.string(),
    contact: v.object({
      name: v.optional(v.string()),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      address: v.optional(v.string()),
      landmark: v.optional(v.string()),
      community: v.optional(v.string()),
      tower: v.optional(v.string()),
      unit: v.optional(v.string()),
    }),
    payment: v.object({
      method: v.union(v.literal("upi"), v.literal("cod")),
      status: v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("failed"),
        v.literal("refunded"),
        v.literal("pending_cash"),
      ),
      reference: v.optional(v.string()),
      amount: v.number(),
      upiLink: v.optional(v.string()),
    }),
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
    statusHistory: v.array(
      v.object({
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
        at: v.number(),
        note: v.optional(v.string()),
      }),
    ),
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
    totals: v.object({
      subtotal: v.number(),
      tax: v.number(),
      fees: v.number(),
      grandTotal: v.number(),
    }),
    etaMinutes: v.optional(v.number()),
    rider: v.optional(v.object({ name: v.string(), phone: v.string() })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_status", ["status"])
    .index("by_table", ["tableId"])
    .index("by_customer", ["customerId"])
    .index("by_customer_email", ["customerEmail"]),
});

