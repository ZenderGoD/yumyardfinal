import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { isAdminEmail } from "./roles";

const CODE_TTL_MS = 10 * 60 * 1000;

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export const requestCode = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    const normalized = email.trim().toLowerCase();
    const now = Date.now();
    const code = generateCode();
    const expiresAt = now + CODE_TTL_MS;

    const existing = await ctx.db
      .query("loginTokens")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .collect();
    await Promise.all(existing.map((token) => ctx.db.delete(token._id)));

    await ctx.db.insert("loginTokens", {
      email: normalized,
      code,
      expiresAt,
      used: false,
    });

    // In production, send via email/SMS. For now, return for the UI to display.
    return { code, expiresAt };
  },
});

export const verifyCode = mutation({
  args: {
    email: v.string(),
    code: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    community: v.optional(v.string()),
    tower: v.optional(v.string()),
    unit: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const normalized = args.email.trim().toLowerCase();
    const token = await ctx.db
      .query("loginTokens")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .order("desc")
      .first();

    if (!token || token.code !== args.code.trim()) {
      throw new Error("Invalid code");
    }
    if (token.used) {
      throw new Error("Code already used");
    }
    if (token.expiresAt < Date.now()) {
      throw new Error("Code expired");
    }

    await ctx.db.patch(token._id, { used: true });

    const existing = await ctx.db
      .query("customers")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .unique();

    const now = Date.now();
    const customerId =
      existing?._id ??
      (await ctx.db.insert("customers", {
        email: normalized,
        name: args.name,
        phone: args.phone,
      role: isAdminEmail(normalized) ? "admin" : undefined,
        community: args.community,
        tower: args.tower,
        unit: args.unit,
        createdAt: now,
        lastSeenAt: now,
        totalOrders: 0,
        totalSpend: 0,
        lastOrderAt: undefined,
      }));

    await ctx.db.patch(customerId, {
      name: args.name ?? existing?.name,
      phone: args.phone ?? existing?.phone,
      community: args.community ?? existing?.community,
      tower: args.tower ?? existing?.tower,
      unit: args.unit ?? existing?.unit,
      role: existing?.role ?? (isAdminEmail(normalized) ? "admin" : undefined),
      lastSeenAt: now,
    });

    const customer = await ctx.db.get(customerId);
    if (!customer) throw new Error("Customer missing after verification");

    return {
      id: customerId,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      community: customer.community,
      tower: customer.tower,
      unit: customer.unit,
      role: customer.role ?? (isAdminEmail(customer.email) ? "admin" : undefined),
    };
  },
});
