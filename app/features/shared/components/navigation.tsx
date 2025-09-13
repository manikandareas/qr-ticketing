// app/features/shared/components/navigation.tsx (updated)
import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from "@clerk/react-router";

export function Navigation() {
	return (
		<nav className="border-b bg-white">
			<div className="container mx-auto px-4 py-3 flex items-center justify-between">
				<a href="/" className="text-xl font-bold">
					QR Ticketing
				</a>

				<div className="flex items-center space-x-6">
					<a href="/" className="text-gray-600 hover:text-gray-900">
						Events
					</a>

					<SignedIn>
						<a href="/my-tickets" className="text-gray-600 hover:text-gray-900">
							My Tickets
						</a>
						<a href="/dashboard" className="text-gray-600 hover:text-gray-900">
							Dashboard
						</a>
					</SignedIn>

					<div>
						<SignedOut>
							<SignInButton mode="modal">
								<button
									type="button"
									className="bg-blue-500 text-white px-4 py-2 rounded"
								>
									Sign In
								</button>
							</SignInButton>
						</SignedOut>

						<SignedIn>
							<UserButton afterSignOutUrl="/" />
						</SignedIn>
					</div>
				</div>
			</div>
		</nav>
	);
}
