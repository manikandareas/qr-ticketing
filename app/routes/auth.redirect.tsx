// app/routes/auth.redirect.tsx
import { SignedIn, SignedOut, useUser } from "@clerk/react-router";
import { api } from "convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

export default function AuthRedirect() {
	const navigate = useNavigate();
	const [sp] = useSearchParams();
	const next = sp.get("next") ?? "/dashboard";

	const { isSignedIn, user } = useUser();
	const clerkId = user?.id;

	const convexUser = useQuery(
		api.users.getByClerkId,
		clerkId ? { clerkId } : "skip",
	);
	const ensureSelf = useMutation(api.users.ensureSelf);

	useEffect(() => {
		if (isSignedIn === false) navigate("/", { replace: true });
	}, [isSignedIn, navigate]);

	useEffect(() => {
		if (!clerkId) return;
		if (convexUser === null) {
			void ensureSelf(); // fallback idempotent
		} else if (convexUser?._id) {
			navigate(next, { replace: true });
		}
	}, [clerkId, convexUser, ensureSelf, next, navigate]);

	return (
		<div className="min-h-dvh grid place-items-center p-6">
			<SignedOut>
				<p>Redirecting…</p>
			</SignedOut>
			<SignedIn>
				<p>Syncing your account…</p>
			</SignedIn>
		</div>
	);
}
