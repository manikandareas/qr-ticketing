import { v } from "convex/values";
import { query } from "./_generated/server";

// convex/dashboard.ts
export const getEventStats = query({
	args: { eventId: v.id("events") },
	handler: async (ctx, args) => {
		const tickets = await ctx.db
			.query("tickets")
			.withIndex("by_event", (q) => q.eq("eventId", args.eventId))
			.collect();

		const reserved = tickets.length;
		const checkedIn = tickets.filter((t) => t.checkedInAt).length;

		return { reserved, checkedIn, tickets };
	},
});
