import { requireTicketOwner } from "~/features/shared/utils/auth";
import { QR } from "../features/shared/components/qr";
import type { Route } from "./+types/ticket-detail";

export async function loader(args: Route.LoaderArgs) {
	const { ticketId } = args.params;
	// Guard reusable — tidak kita tulis ulang implementasinya
	return await requireTicketOwner(args, ticketId); // { me, ticket, event }
}

export default function TicketDetail({ loaderData }: Route.ComponentProps) {
	const { ticket, event } = loaderData;

	return (
		<div className="container mx-auto p-4 space-y-4">
			<h1 className="text-2xl font-bold">{event?.title}</h1>
			<p className="text-gray-600">
				{new Date(event?.date ?? "").toLocaleString()}
			</p>

			<QR value={ticket.code} />

			<p className="text-sm text-gray-600">
				Status: {ticket.checkedInAt ? "Checked In" : "Reserved"}
			</p>
		</div>
	);
}
