import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const customers = await ctx.db.query("customers").collect();
    return customers.map((c) => ({
      id: c._id,
      email: c.email,
      name: c.name,
      phone: c.phone,
      role: c.role,
      totalOrders: c.totalOrders,
      totalSpend: c.totalSpend,
      lastOrderAt: c.lastOrderAt,
      community: c.community,
      tower: c.tower,
      unit: c.unit,
      createdAt: c.createdAt,
      lastSeenAt: c.lastSeenAt,
    }));
  },
});

export const byEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const customer = await ctx.db
      .query("customers")
      .withIndex("by_email", (q) => q.eq("email", email.trim().toLowerCase()))
      .unique();
    if (!customer) return null;
    return {
      id: customer._id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      role: customer.role,
      community: customer.community,
      tower: customer.tower,
      unit: customer.unit,
      totalOrders: customer.totalOrders,
      totalSpend: customer.totalSpend,
      lastOrderAt: customer.lastOrderAt,
    };
  },
});

export const updateProfile = mutation({
  args: {
    customerId: v.id("customers"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    community: v.optional(v.string()),
    tower: v.optional(v.string()),
    unit: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.customerId);
    if (!existing) throw new Error("Customer not found");
    await ctx.db.patch(args.customerId, {
      name: args.name ?? existing.name,
      phone: args.phone ?? existing.phone,
      community: args.community ?? existing.community,
      tower: args.tower ?? existing.tower,
      unit: args.unit ?? existing.unit,
      lastSeenAt: Date.now(),
    });
    const updated = await ctx.db.get(args.customerId);
    return updated
      ? {
          id: updated._id,
          email: updated.email,
          name: updated.name,
          phone: updated.phone,
          community: updated.community,
          tower: updated.tower,
          unit: updated.unit,
          totalOrders: updated.totalOrders,
          totalSpend: updated.totalSpend,
          lastOrderAt: updated.lastOrderAt,
        }
      : null;
  },
});
