import { Skeleton } from "@dexion/ui/components/ui/skeleton";
import { headers } from "next/headers";
import { Suspense } from "react";
import { auth } from "~/lib/auth/auth";
import LatestTransactionsModal from "./latest-transactions";
import PriceDisplayContainer from "./price-display-container";
import WalletTrackerContainer from "./wallet-tracker-container";

export default async function SiteFooter() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return (
		<footer className="fixed bottom-0 w-full border-t border-dx-line bg-dx-bg px-[22px] py-2.5 font-mono text-[11px] text-dx-faint">
			<div className="flex items-center justify-between gap-4">
				<div className="hidden sm:flex gap-0.5 items-center">
					{session && session.user && (
						<div className="flex gap-0.5 items-center">
							<Suspense fallback={<Skeleton className="h-5 w-32" />}>
								<WalletTrackerContainer />
							</Suspense>
							{session.user.walletAddress && (
								<LatestTransactionsModal
									walletAddress={session.user.walletAddress}
								/>
							)}
						</div>
					)}
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
