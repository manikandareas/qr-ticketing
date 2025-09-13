import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router";
import { makeTicketCode } from "~/features/shared/utils/make-ticket-code";
import { api } from "../../convex/_generated/api";
import type { Route } from "./+types/event-detail";

export async function loader(args: Route.LoaderArgs) {
	// Public page — no guard
	return { eventId: args.params.eventId };
}

export default function EventDetail({ loaderData }: Route.ComponentProps) {
	const { eventId } = loaderData as { eventId: string };
	const nav = useNavigate();

	const event = useQuery(api.events.getById, {
		eventId: eventId as Id<"events">,
	});
	const reserve = useMutation(api.tickets.reserve);

	if (!event)
		return (
			<div>
				<div className="container mx-auto p-4">Loading…</div>
			</div>
		);

	async function onReserve() {
		try {
			const code = makeTicketCode();
			// NOTE: fungsi reserve di server diasumsikan terima { eventId, code } dan derive user dari auth.
			const ticketId = await reserve({
				eventId: event?._id as Id<"events">,
				code,
			});
			nav(`/tickets/${ticketId}`);
		} catch (e: any) {
			alert(e?.message ?? "Failed to reserve");
		}
	}

	return (
		<div className="container mx-auto p-4 space-y-4">
			<h1 className="text-2xl font-bold">{event.title}</h1>
			<p className="text-gray-700">{event.description}</p>
			<p className="text-sm">
				{new Date(event.date).toLocaleString()} — {event.venue}
			</p>
			<button
				type="button"
				onClick={onReserve}
				className="bg-blue-600 text-white px-4 py-2 rounded"
			>
				Reserve Free Ticket
			</button>
		</div>
	);
}
