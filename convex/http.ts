// convex/http.ts

import type { WebhookEvent } from "@clerk/backend";
import { httpRouter } from "convex/server";
import { Webhook } from "svix";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
	path: "/clerk/webhook",
	method: "POST",
	handler: httpAction(async (ctx, req) => {
		const secret = process.env.CLERK_WEBHOOK_SECRET;
		if (!secret) return new Response("Missing secret", { status: 500 });

		const payload = await req.text();
		const headers = {
			"svix-id": req.headers.get("svix-id") ?? "",
			"svix-timestamp": req.headers.get("svix-timestamp") ?? "",
			"svix-signature": req.headers.get("svix-signature") ?? "",
		};

		let evt: WebhookEvent;
		try {
			evt = new Webhook(secret).verify(payload, headers) as WebhookEvent;
		} catch {
			return new Response("Invalid signature", { status: 400 });
		}

		switch (evt.type) {
			case "user.created":
			case "user.updated":
				await ctx.runMutation(internal.users.upsertFromClerk, {
					data: evt.data,
				});
				break;
			case "user.deleted":
				await ctx.runMutation(internal.users.deleteFromClerk, {
					clerkUserId: evt.data.id as string,
				});
				break;
			default:
			// ignore others
		}
		return new Response(null, { status: 200 });
	}),
});

export default http;
