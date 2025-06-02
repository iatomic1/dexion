import { assertUserAuthenticated } from "~/lib/auth/auth";
import { TOKEN_WATCHER_API_BASE_URL } from "~/lib/constants";
import makeFetch from "~/lib/helpers/fetch";
import { ApiResponse } from "~/types";
import { UserWallet } from "~/types/wallets";
import { CryptoAsset } from "~/types/xverse";
import { Suspense } from "react";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import WalletTrackerModal from "./modals/wallet-tracker/wallet-tracker-modal";
import { PriceDisplay } from "./priice-display";

const getTrackedWallets = async () => {
  const session = await assertUserAuthenticated();
  try {
    return await makeFetch<ApiResponse<UserWallet[]>>(
      "dexion",
      `wallets`,
      session.accessToken,
      {
        method: "GET",
        next: {
          tags: ["wallets"],
        },
      },
    )();
  } catch (err) {
    console.error(err);
    return null;
  }
};

const getBtcAndStxPrices = async (): Promise<CryptoAsset[] | null> => {
  try {
    const res = await fetch(`${TOKEN_WATCHER_API_BASE_URL}btcstx`, {
      next: { revalidate: 30 }, // Cache for 30 seconds
    });
    if (!res.ok) {
      throw new Error("Error fetching stx and btc prices");
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export default async function SiteFooter() {
  // Run both API calls in parallel
  const [btcAndStxPrices, trackedWallets] = await Promise.allSettled([
    getBtcAndStxPrices(),
    getTrackedWallets(),
  ]);

  const prices =
    btcAndStxPrices.status === "fulfilled" ? btcAndStxPrices.value : null;
  const wallets =
    trackedWallets.status === "fulfilled" ? trackedWallets.value : null;

  return (
    <footer className="fixed bottom-0 w-full border-t border-border bg-background px-2 py-2">
      <div className="flex items-center justify-between">
        <div>
          <Suspense fallback={<Skeleton className="h-9 w-32" />}>
            <WalletTrackerModal wallets={wallets?.data as UserWallet[]} />
          </Suspense>
        </div>

        <div className="flex items-center gap-0.5">
          <Suspense fallback={<PriceDisplaySkeleton />}>
            <PriceDisplay prices={prices} />
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
