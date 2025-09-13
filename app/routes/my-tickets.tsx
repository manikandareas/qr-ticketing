import { useQuery } from "convex/react";
import { Link } from "react-router";
import { api } from "../../convex/_generated/api";
import { getConvexUser, requireAuth } from "../features/shared/utils/auth";
import type { Route } from "./+types/my-tickets";

export async function loader(args: Route.LoaderArgs) {
	const { userId, sessionId } = await requireAuth(args);
	const me = await getConvexUser(userId, sessionId);
	if (!me)
		throw new Response(null, {
			status: 302,
			headers: { Location: "/auth/redirect?next=/my-tickets" },
		});
	return { me };
}

export default function MyTickets({ loaderData }: Route.ComponentProps) {
	const { me } = loaderData;
	const tickets = useQuery(api.tickets.getByUser, { userId: me._id });

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-6">My Tickets</h1>
			{!tickets ? (
				<div>Loading…</div>
			) : tickets.length === 0 ? (
				<div className="text-gray-600">
					No tickets yet.{" "}
					<Link to="/" className="underline">
						Browse events
					</Link>
				</div>
			) : (
				<div className="space-y-3">
					{tickets.map((t) => (
						<div key={t._id} className="border rounded p-4">
							<div className="font-medium">{t.event?.title ?? "Event"}</div>
							<div className="text-sm text-gray-600">
								{t.checkedInAt ? "Checked In" : "Reserved"}
							</div>
							<Link
								to={`/tickets/${t._id}`}
								className="text-blue-600 underline mt-1 inline-block"
							>
								View QR
							</Link>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
