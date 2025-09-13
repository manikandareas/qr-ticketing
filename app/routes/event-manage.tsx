import { useQuery } from "convex/react";
import { requireEventOwner } from "~/features/shared/utils/auth";
import { api } from "../../convex/_generated/api";
import type { Route } from "./+types/event-manage";

export async function loader(args: Route.LoaderArgs) {
	const { eventId } = args.params;
	return await requireEventOwner(args, eventId); // { me, event }
}

export default function EventManage({ loaderData }: Route.ComponentProps) {
	const { event } = loaderData;
	const stats = useQuery(api.dashboard.getEventStats, { eventId: event._id });

	return (
		<div className="container mx-auto p-4 space-y-4">
			<h1 className="text-2xl font-bold">{event.title} — Manage</h1>

			{!stats ? (
				<div>Loading…</div>
			) : (
				<div className="grid gap-4 md:grid-cols-3">
					<div className="border rounded p-4">
						<div className="text-sm text-gray-600">Reserved</div>
						<div className="text-2xl font-bold">{stats.reserved}</div>
					</div>
					<div className="border rounded p-4">
						<div className="text-sm text-gray-600">Checked In</div>
						<div className="text-2xl font-bold">{stats.checkedIn}</div>
					</div>
					<div className="border rounded p-4">
						<div className="text-sm text-gray-600">Capacity</div>
						<div className="text-2xl font-bold">{event.capacity}</div>
					</div>
				</div>
			)}
		</div>
	);
}
