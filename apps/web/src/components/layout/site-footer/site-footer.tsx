import { Skeleton } from "@dexion/ui/components/ui/skeleton";
import { headers } from "next/headers";
import { Suspense } from "react";
import { auth } from "~/lib/auth/auth";
import LatestTransactionsModal from "./latest-transactions";
import PriceDisplayContainer from "./price-display-container";
import ThemeSwitcherTab from "./theme-switcher";
import WalletTrackerContainer from "./wallet-tracker-container";

export default async function SiteFooter() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return (
		<footer className="fixed bottom-0 w-full border-t border-border bg-background px-2 py-1">
			<div className="flex items-center justify-between">
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

				<div className="flex flex-row-reverse sm:flex-row items-center gap-0.5 justify-between w-full sm:w-fit">
					<ThemeSwitcherTab />
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
