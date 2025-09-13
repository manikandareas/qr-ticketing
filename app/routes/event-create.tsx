import type { Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { getConvexUser, requireAuth } from "~/features/shared/utils/auth";
import { api } from "../../convex/_generated/api";
import type { Route } from "./+types/event-create";

export async function loader(args: Route.LoaderArgs) {
	const { userId, sessionId } = await requireAuth(args);
	const me = await getConvexUser(userId, sessionId);
	return { me };
}

function slugify(s: string) {
	return s
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.slice(0, 60);
}

export default function DashboardEventNew({
	loaderData,
}: Route.ComponentProps) {
	const { me } = loaderData;
	const navigate = useNavigate();
	const createEvent = useMutation(api.events.create);

	const [title, setTitle] = useState("");
	const [slug, setSlug] = useState("");
	const [description, setDescription] = useState("");
	const [venue, setVenue] = useState("");
	const [datetime, setDatetime] = useState(""); // HTML datetime-local value
	const [capacity, setCapacity] = useState<number | "">("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: false positive
	useEffect(() => {
		if (!slug) setSlug(slugify(title));
	}, [title]);

	const isValid = useMemo(() => {
		return (
			title.trim().length >= 3 &&
			slug.trim().length >= 3 &&
			description.trim().length >= 10 &&
			venue.trim().length >= 3 &&
			Boolean(datetime) &&
			typeof capacity === "number" &&
			capacity > 0
		);
	}, [title, slug, description, venue, datetime, capacity]);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!isValid || submitting) return;
		setSubmitting(true);
		setError(null);

		try {
			const iso = new Date(datetime).toISOString(); // schema pakai string ISO
			const newId = await createEvent({
				title: title.trim(),
				slug: slug.trim(),
				description: description.trim(),
				date: iso,
				venue: venue.trim(),
				capacity: Number(capacity),
				ownerId: me?._id as Id<"users">, // sesuai fungsi existing
			});

			navigate(`/dashboard/events/${newId}`);
		} catch (err: any) {
			setError(err?.message ?? "Failed to create event");
			setSubmitting(false);
		}
	}

	return (
		<div className="container mx-auto p-4 max-w-2xl">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">Create New Event</h1>
				<Link to="/dashboard" className="text-blue-600 hover:underline">
					Back to Dashboard
				</Link>
			</div>

			{error && (
				<div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-red-700 text-sm">
					{error}
				</div>
			)}

			<form onSubmit={onSubmit} className="space-y-4">
				<div>
					<label htmlFor="title" className="block text-sm font-medium mb-1">
						Title
					</label>
					<input
						id="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="React Meetup Samarinda"
						className="w-full border rounded px-3 py-2"
						required
					/>
				</div>

				<div>
					<label htmlFor="slug" className="block text-sm font-medium mb-1">
						Slug
					</label>
					<input
						id="slug"
						value={slug}
						onChange={(e) => setSlug(slugify(e.target.value))}
						placeholder="react-meetup-samarinda"
						className="w-full border rounded px-3 py-2"
						required
					/>
					<p className="text-xs text-gray-500 mt-1">
						URL-friendly. Boleh edit selama unik.
					</p>
				</div>

				<div>
					<label
						htmlFor="description"
						className="block text-sm font-medium mb-1"
					>
						Description
					</label>
					<textarea
						id="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Meetup developer untuk ngobrolin React, state management, dan tips produksi."
						className="w-full border rounded px-3 py-2 min-h-[96px]"
						required
					/>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<div>
						<label
							htmlFor="datetime"
							className="block text-sm font-medium mb-1"
						>
							Date & Time
						</label>
						<input
							type="datetime-local"
							value={datetime}
							onChange={(e) => setDatetime(e.target.value)}
							className="w-full border rounded px-3 py-2"
							required
						/>
					</div>
					<div>
						<label htmlFor="venue" className="block text-sm font-medium mb-1">
							Venue
						</label>
						<input
							id="venue"
							value={venue}
							onChange={(e) => setVenue(e.target.value)}
							placeholder="Kampus A, Aula 2"
							className="w-full border rounded px-3 py-2"
							required
						/>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<div>
						<label
							htmlFor="capacity"
							className="block text-sm font-medium mb-1"
						>
							Capacity
						</label>
						<input
							id="capacity"
							type="number"
							min={1}
							value={capacity}
							onChange={(e) => {
								const v = e.target.value;
								setCapacity(v === "" ? "" : Math.max(1, parseInt(v, 10) || 1));
							}}
							className="w-full border rounded px-3 py-2"
							required
						/>
					</div>
				</div>

				<div className="pt-2">
					<button
						type="submit"
						disabled={!isValid || submitting}
						className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
					>
						{submitting ? "Creating..." : "Create Event"}
					</button>
				</div>
			</form>

			<div className="mt-6 text-sm text-gray-600">
				<div className="rounded border border-blue-200 bg-blue-50 p-3">
					<div className="font-medium">Info</div>
					<ul className="list-disc ml-5 mt-1 space-y-1">
						<li>
							Tanggal disimpan sebagai ISO string untuk sorting/filtering.
						</li>
						<li>Slug otomatis dari judul, bisa diedit sebelum submit.</li>
						<li>
							Kalau slug sudah dipakai, server akan menolak—pesan error muncul
							di atas.
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
