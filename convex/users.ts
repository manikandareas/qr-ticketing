// convex/users.ts

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createOrUpdate = mutation({
	args: {
		clerkId: v.string(),
		name: v.string(),
		email: v.string(),
		avatarUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.first();

		if (existing) {
			await ctx.db.patch(existing._id, {
				name: args.name,
				email: args.email,
				avatarUrl: args.avatarUrl,
			});
			return existing._id;
		}

		return await ctx.db.insert("users", args);
	},
});

export const getByClerkId = query({
	args: { clerkId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
			.first();
	},
});

// convex/users.internal.ts
import { internalMutation } from "./_generated/server";

export const upsertFromClerk = internalMutation({
	args: { data: v.any() },
	handler: async (ctx, { data }) => {
		const clerkId: string = data.id;
		const primaryEmailId: string | undefined = data.primary_email_address_id;
		const email =
			data.email_addresses?.find((e: any) => e.id === primaryEmailId)
				?.email_address ??
			data.email_addresses?.[0]?.email_address ??
			"";
		const name =
			[data.first_name, data.last_name].filter(Boolean).join(" ") ||
			data.username ||
			"User";
		const avatarUrl: string | undefined = data.image_url ?? undefined;

		const existing = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
			.first();

		if (existing) {
			await ctx.db.patch(existing._id, { name, email, avatarUrl });
			return existing._id;
		}
		return await ctx.db.insert("users", { clerkId, name, email, avatarUrl });
	},
});

export const deleteFromClerk = internalMutation({
	args: { clerkUserId: v.string() },
	handler: async (ctx, { clerkUserId }) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkUserId))
			.first();
		if (user) await ctx.db.delete(user._id); // MVP: hard delete
	},
});

export const ensureSelf = mutation({
	args: {},
	handler: async (ctx) => {
		const id = await ctx.auth.getUserIdentity();
		if (!id) throw new Error("Unauthorized");

		const existing = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", id.subject))
			.first();

		const name = id.name ?? id.nickname ?? "User";
		const email = id.email ?? "";
		const avatarUrl = id.pictureUrl ?? undefined;

		if (existing) {
			await ctx.db.patch(existing._id, { name, email, avatarUrl });
			return existing._id;
		}
		return await ctx.db.insert("users", {
			clerkId: id.subject,
			name,
			email,
			avatarUrl,
		});
	},
});
