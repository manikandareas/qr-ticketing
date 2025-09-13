// app/routes.ts
import {
	index,
	layout,
	type RouteConfig,
	route,
} from "@react-router/dev/routes";

export default [
	// Public routes
	index("./routes/home.tsx"),
	route("my-tickets", "./routes/my-tickets.tsx"),
	route("tickets/:ticketId", "./routes/ticket-detail.tsx"),
	route("dashboard", "./routes/dashboard.tsx"),
	route("dashboard/events/new", "./routes/event-create.tsx"),
	route("dashboard/events/:eventId", "./routes/event-manage.tsx"),

	route("events/:eventId", "./routes/event-detail.tsx"),
	route("scan/:eventId", "./routes/event-scanner.tsx"),
	route("auth/redirect", "./routes/auth.redirect.tsx"),
] satisfies RouteConfig;
