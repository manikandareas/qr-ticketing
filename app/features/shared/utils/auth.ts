import { createClerkClient } from "@clerk/react-router/api.server";
import { getAuth } from "@clerk/react-router/ssr.server";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { ConvexHttpClient } from "convex/browser";
import { redirect } from "react-router";

export async function requireAuth(args: any) {
	const { isAuthenticated, userId, sessionId } = await getAuth(args);
	if (!isAuthenticated || !userId || !sessionId) throw redirect("/");
	return { userId, sessionId };
}

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY as string;

export async function getConvexUser(userId: string, sessionId: string) {
	const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });
	const { jwt } = await clerk.sessions.getToken(sessionId, "convex");
	const http = new ConvexHttpClient(CONVEX_URL, { auth: jwt ?? "" });
	return await http.query(api.users.getByClerkId, { clerkId: userId });
}

export async function requireTicketOwner(args: any, ticketId: string) {
	const { userId, sessionId } = await requireAuth(args);

	const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });
	const { jwt } = await clerk.sessions.getToken(sessionId, "convex");
	const http = new ConvexHttpClient(CONVEX_URL, { auth: jwt ?? "" });

	const me = await http.query(api.users.getByClerkId, { clerkId: userId });
	if (!me)
		throw new Response(null, {
			status: 302,
			headers: {
				Location: "/auth/redirect?next=" + new URL(args.request.url).pathname,
			},
		});

	const ticket = await http.query(api.tickets.getById, {
		ticketId: ticketId as Id<"tickets">,
	});
	if (!ticket) throw new Response("Not found", { status: 404 });

	if (ticket.userId !== me._id)
		throw new Response("Forbidden", { status: 403 });

	const event = await http.query(api.events.getById, {
		eventId: ticket.eventId,
	});
	return { me, ticket, event };
}

export async function requireEventOwner(args: any, eventId: string) {
	const { userId, sessionId } = await requireAuth(args);

	const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });
	const { jwt } = await clerk.sessions.getToken(sessionId, "convex");
	const http = new ConvexHttpClient(CONVEX_URL, { auth: jwt ?? "" });

	const me = await http.query(api.users.getByClerkId, { clerkId: userId });
	if (!me)
		throw new Response(null, {
			status: 302,
			headers: {
				Location: "/auth/redirect?next=" + new URL(args.request.url).pathname,
			},
		});

	const event = await http.query(api.events.getById, {
		eventId: eventId as Id<"events">,
	});
	if (!event) throw new Response("Not found", { status: 404 });

	if (event.ownerId !== me._id)
		throw new Response("Forbidden", { status: 403 });

	return { me, event };
}
