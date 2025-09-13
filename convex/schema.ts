// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	// User data untuk reference dan display
	users: defineTable({
		name: v.string(),
		email: v.string(),
		avatarUrl: v.optional(v.string()),
		clerkId: v.string(), // Clerk user ID (unique)
	}).index("by_clerk_id", ["clerkId"]),

	// Events yang dibuat organizer
	events: defineTable({
		title: v.string(),
		slug: v.string(), // URL-friendly identifier
		description: v.string(),
		date: v.string(), // ISO date string
		venue: v.string(),
		capacity: v.number(),
		ownerId: v.id("users"), // Reference ke users table
		createdAt: v.number(),
	})
		.index("by_owner", ["ownerId"])
		.index("by_slug", ["slug"])
		.index("by_date", ["date"]),

	// Tickets yang direserve attendee
	tickets: defineTable({
		eventId: v.id("events"),
		userId: v.id("users"), // Reference ke users table
		code: v.string(), // QR code payload (opaque)
		reservedAt: v.number(),
		checkedInAt: v.optional(v.number()),
		checkedInBy: v.optional(v.id("users")), // Reference ke operator user
	})
		.index("by_user", ["userId"])
		.index("by_event", ["eventId"])
		.index("by_user_event", ["userId", "eventId"])
		.index("by_code", ["code"]),

	// Audit log untuk check-in (opsional)
	checkinLogs: defineTable({
		ticketId: v.optional(v.id("tickets")),
		eventId: v.id("events"),
		byUserId: v.id("users"), // Reference ke operator user
		at: v.number(),
		status: v.union(
			v.literal("success"),
			v.literal("already"),
			v.literal("invalid"),
		),
	})
		.index("by_event", ["eventId"])
		.index("by_ticket", ["ticketId"]),
});
