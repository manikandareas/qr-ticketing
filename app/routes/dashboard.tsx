import { useQuery } from "convex/react";
import { Link } from "react-router";
import { api } from "../../convex/_generated/api";
import { getConvexUser, requireAuth } from "../features/shared/utils/auth";
import type { Route } from "./+types/dashboard";

export async function loader(args: Route.LoaderArgs) {
	const { userId, sessionId } = await requireAuth(args);
	const me = await getConvexUser(userId, sessionId);
	if (!me)
		throw new Response(null, {
			status: 302,
			headers: { Location: "/auth/redirect?next=/dashboard" },
		});
	return { me };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
	const { me } = loaderData;
	const events = useQuery(api.events.getByOwner, { ownerId: me._id });

	return (
		<div className="container mx-auto p-4 space-y-6">
			<header className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Dashboard</h1>
					<p className="text-gray-600">Welcome, {me.name}</p>
				</div>
				<Link
					to="/dashboard/events/new"
					className="bg-blue-600 text-white px-3 py-2 rounded"
				>
					Create Event
				</Link>
			</header>

			<section>
				<h2 className="font-semibold mb-2">Your Events</h2>
				{!events ? (
					<div>Loading…</div>
				) : events.length === 0 ? (
					<div className="text-gray-600">Belum ada event.</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2">
						{events.map((ev: any) => (
							<div
								key={ev._id}
								className="border rounded p-4 flex items-start justify-between"
							>
								<div>
									<div className="font-medium">{ev.title}</div>
									<div className="text-sm text-gray-600">{ev.venue}</div>
								</div>
								<div className="flex gap-2">
									<Link
										to={`/dashboard/events/${ev._id}`}
										className="px-3 py-1 rounded bg-gray-600 text-white"
									>
										Manage
									</Link>
									<Link
										to={`/scan/${ev._id}`}
										className="px-3 py-1 rounded bg-green-600 text-white"
									>
										Scan
									</Link>
								</div>
							</div>
						))}
					</div>
				)}
			</section>
		</div>
	);
}
