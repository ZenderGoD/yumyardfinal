import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("menu").collect();
    const withUrls = await Promise.all(
      items.map(async (m) => {
        const imageUrl = m.imageStorageId ? await ctx.storage.getUrl(m.imageStorageId) : m.image;
        return { ...m, id: m._id, image: imageUrl ?? undefined };
      }),
    );
    return withUrls;
  },
});

const itemArgs = {
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
};

export const create = mutation({
  args: itemArgs,
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("menu", {
      ...args,
    });
    return { id };
  },
});

export const update = mutation({
  args: {
    id: v.id("menu"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    available: v.optional(v.boolean()),
    image: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    dealPrice: v.optional(v.number()),
    dealExpiresAt: v.optional(v.number()),
    comboItems: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Menu item not found");
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) {
        patch[key] = value;
      }
    }
    await ctx.db.patch(id, patch);
    return { id };
  },
});

export const remove = mutation({
  args: { id: v.id("menu") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { id };
  },
});

export const toggleAvailability = mutation({
  args: { id: v.id("menu"), available: v.boolean() },
  handler: async (ctx, { id, available }) => {
    await ctx.db.patch(id, { available });
    return { id, available };
  },
});

export const getUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const uploadUrl = await ctx.storage.generateUploadUrl();
    return { uploadUrl };
  },
});



