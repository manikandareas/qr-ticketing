import { useQuery } from "convex/react";
import { Link } from "react-router";
import { api } from "../../convex/_generated/api";

export default function Home() {
	const events = useQuery(api.events.getPublic);

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>

			{!events ? (
				<div>Loading…</div>
			) : events.length === 0 ? (
				<div className="text-gray-600">No events yet.</div>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{events.map((ev) => (
						<div key={ev._id} className="border rounded p-4">
							<h3 className="font-semibold">{ev.title}</h3>
							<p className="text-gray-600">{ev.venue}</p>
							<p className="text-sm">
								{new Date(ev.date).toLocaleDateString()}
							</p>
							<Link
								to={`/events/${ev._id}`}
								className="text-blue-600 hover:underline mt-2 inline-block"
							>
								View Details
							</Link>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
