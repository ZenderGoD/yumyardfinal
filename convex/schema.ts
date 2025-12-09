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
  }),
  tables: defineTable({
    label: v.string(),
    zone: v.optional(v.string()),
    active: v.boolean(),
  }),
  orders: defineTable({
    mode: v.union(v.literal("table"), v.literal("delivery")),
    tableId: v.optional(v.id("tables")),
    contact: v.object({
      name: v.optional(v.string()),
      phone: v.string(),
      email: v.optional(v.string()),
      address: v.optional(v.string()),
      landmark: v.optional(v.string()),
    }),
    payment: v.object({
      method: v.union(v.literal("upi"), v.literal("cod")),
      status: v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("failed"),
        v.literal("refunded"),
      ),
      reference: v.optional(v.string()),
      amount: v.number(),
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
        status: v.string(),
        at: v.number(),
        note: v.optional(v.string()),
      }),
    ),
    items: v.array(
      v.object({
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
  }).index("by_status", ["status"]).index("by_table", ["tableId"]),
});

