import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getById = query({
	args: {
		ticketId: v.id("tickets"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.ticketId);
	},
});

export const getByUser = query({
	args: {
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const tickets = await ctx.db
			.query("tickets")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.collect();

		const ticketsWithEvents = await Promise.all(
			tickets.map(async (ticket) => {
				const event = await ctx.db.get(ticket.eventId);
				return { ...ticket, event };
			}),
		);
		return ticketsWithEvents;
	},
});

export const reserve = mutation({
	args: {
		eventId: v.id("events"),
		code: v.string(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error("Unauthorized");

		// Cari user Convex by clerkId
		const user = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
			.first();
		if (!user) throw new Error("User not provisioned");

		// Cek duplicate per event
		const existing = await ctx.db
			.query("tickets")
			.withIndex("by_user_event", (q) =>
				q.eq("userId", user._id).eq("eventId", args.eventId),
			)
			.first();
		if (existing) throw new Error("Already reserved ticket for this event");

		// Cek kapasitas (guard sederhana)
		const event = await ctx.db.get(args.eventId);
		if (!event) throw new Error("Event not found");
		const reservedCount = (
			await ctx.db
				.query("tickets")
				.withIndex("by_event", (q) => q.eq("eventId", args.eventId))
				.collect()
		).length;
		if (reservedCount >= event.capacity) throw new Error("Event is full");

		// Pastikan code unik
		const clash = await ctx.db
			.query("tickets")
			.withIndex("by_code", (q) => q.eq("code", args.code))
			.first();
		if (clash) throw new Error("Ticket code collision");

		return await ctx.db.insert("tickets", {
			eventId: args.eventId,
			userId: user._id,
			code: args.code,
			reservedAt: Date.now(),
		});
	},
});

export const checkIn = mutation({
	args: {
		eventId: v.id("events"),
		code: v.string(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error("Unauthorized");

		// Operator (scanner) = user yang lagi login
		const operator = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
			.first();
		if (!operator) throw new Error("Operator not found");

		const ticket = await ctx.db
			.query("tickets")
			.withIndex("by_code", (q) => q.eq("code", args.code))
			.first();

		if (!ticket || ticket.eventId !== args.eventId) {
			await ctx.db.insert("checkinLogs", {
				ticketId: undefined, // optional di schema
				eventId: args.eventId,
				byUserId: operator._id,
				at: Date.now(),
				status: "invalid",
			});
			return { status: "invalid" };
		}

		if (ticket.checkedInAt) {
			await ctx.db.insert("checkinLogs", {
				ticketId: ticket._id,
				eventId: args.eventId,
				byUserId: operator._id,
				at: Date.now(),
				status: "already",
			});
			return { status: "already", ticket };
		}

		await ctx.db.patch(ticket._id, {
			checkedInAt: Date.now(),
			checkedInBy: operator._id,
		});

		await ctx.db.insert("checkinLogs", {
			ticketId: ticket._id,
			eventId: args.eventId,
			byUserId: operator._id,
			at: Date.now(),
			status: "success",
		});

		return { status: "success", ticket };
	},
});
