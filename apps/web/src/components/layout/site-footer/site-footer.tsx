import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { headers } from "next/headers";
import { Suspense } from "react";
import { auth } from "~/lib/auth";
import PriceDisplayContainer from "./price-display-container";
import WalletTrackerContainer from "./wallet-tracker-container";

export default async function SiteFooter() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return (
		<footer className="fixed bottom-0 w-full border-t border-border bg-background px-2 py-1">
			<div className="flex items-center justify-between">
				{session && (
					<div>
						<Suspense fallback={<Skeleton className="h-9 w-32" />}>
							<WalletTrackerContainer />
						</Suspense>
					</div>
				)}

				<div className="flex items-center gap-0.5">
					<Suspense fallback={<PriceDisplaySkeleton />}>
						<PriceDisplayContainer />
					</Suspense>
				</div>
			</div>
		</footer>
	);
}

function PriceDisplaySkeleton() {
	return (
		<>
			<Skeleton className="h-[27px] w-[85px]" />
			<Skeleton className="h-[27px] w-[85px]" />
		</>
	);
}
