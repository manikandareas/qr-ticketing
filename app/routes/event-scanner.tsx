import { Scanner /*, useDevices*/ } from "@yudiel/react-qr-scanner";
import { useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { requireEventOwner } from "~/features/shared/utils/auth";
import { api } from "../../convex/_generated/api";
import { Navigation } from "../features/shared/components/navigation";
import type { Route } from "./+types/event-scanner";

export async function loader(args: Route.LoaderArgs) {
	const { eventId } = args.params;
	return await requireEventOwner(args, eventId); // { me, event }
}

export default function ScanEvent({ loaderData }: Route.ComponentProps) {
	const { event } = loaderData;

	const checkIn = useMutation(api.tickets.checkIn);

	const [status, setStatus] = useState<
		null | "success" | "already" | "invalid" | "error"
	>(null);
	const [detail, setDetail] = useState<string | null>(null);

	// simple dedupe biar gak spam check-in
	const lastCodeRef = useRef<string | null>(null);
	const busyRef = useRef(false);

	useEffect(() => {
		const t = setTimeout(
			() => (status !== "success" ? setStatus(null) : null),
			3000,
		);
		return () => clearTimeout(t);
	}, [status]);

	async function handleScan(detected: Array<{ rawValue: string }>) {
		if (!detected?.length) return;
		const code = detected[0].rawValue?.trim();
		if (!code || busyRef.current) return;
		if (code === lastCodeRef.current) return;

		busyRef.current = true;
		setStatus(null);
		setDetail(null);

		try {
			const res = await checkIn({ eventId: event._id, code });
			setStatus(res.status as typeof status);
			lastCodeRef.current = code;
		} catch (e: any) {
			setStatus("error");
			setDetail(e?.message ?? "Failed");
		} finally {
			// kasih jeda kecil biar kamera gak spam
			setTimeout(() => {
				busyRef.current = false;
			}, 700);
		}
	}

	function handleError(err: unknown) {
		setStatus("error");
		setDetail(err instanceof Error ? err.message : String(err));
	}

	return (
		<div className="container mx-auto p-4 space-y-6">
			<h1 className="text-2xl font-bold">QR Scanner — {event.title}</h1>

			<div className="rounded overflow-hidden border">
				<Scanner
					// throttling bacaan (ms) biar adem
					scanDelay={500}
					// minta kamera belakang kalau ada
					constraints={{ facingMode: "environment" }}
					// UI kontrol bawaan (torch, zoom, on/off, finder)
					components={{
						torch: true,
						zoom: true,
						onOff: true,
						finder: true,
					}}
					// callback hasil scan
					onScan={handleScan}
					onError={handleError}
					classNames={{ container: "w-full aspect-video bg-black" }}
					styles={{
						video: { width: "100%", height: "auto", objectFit: "cover" },
					}}
				/>
			</div>

			<div className="text-sm">
				{status === "success" && (
					<span className="text-green-700">✅ Checked-in</span>
				)}
				{status === "already" && (
					<span className="text-yellow-700">⚠️ Already checked-in</span>
				)}
				{status === "invalid" && (
					<span className="text-red-700">❌ Invalid ticket</span>
				)}
				{status === "error" && (
					<span className="text-red-700">❌ {detail}</span>
				)}
			</div>
		</div>
	);
}
