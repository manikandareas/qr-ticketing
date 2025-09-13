import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// convex/events.ts
export const getPublic = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db
			.query("events")
			.withIndex("by_date")
			.order("asc")
			.collect();
	},
});

export const create = mutation({
	args: {
		title: v.string(),
		slug: v.string(),
		description: v.string(),
		date: v.string(),
		venue: v.string(),
		capacity: v.number(),
		ownerId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const exists = await ctx.db
			.query("events")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.first();
		if (exists) throw new Error("Slug already in use");

		return await ctx.db.insert("events", {
			...args,
			createdAt: Date.now(),
		});
	},
});

export const getById = query({
	args: {
		eventId: v.id("events"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.eventId);
	},
});

export const getByOwner = query({
	args: {
		ownerId: v.id("users"),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("events")
			.withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
			.collect();
	},
});
