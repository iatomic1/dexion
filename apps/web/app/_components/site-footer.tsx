import makeFetch from "~/lib/helpers/fetch";
import Icon from "react-crypto-icons";
import { ApiResponse } from "~/types";
import { UserWallet } from "~/types/wallets";
import { assertUserAuthenticated } from "~/lib/auth/auth";
import { Button } from "@repo/ui/components/ui/button";
import { TOKEN_WATCHER_API_BASE_URL } from "~/lib/constants";
import { CryptoAsset } from "~/types/xverse";
import Image from "next/image";
import { formatPrice } from "~/lib/helpers/numbers";
import { Suspense } from "react";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import WalletTrackerModal from "./modals/wallet-tracker/wallet-tracker-modal";

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
  }
};

const getBtcAndStxPrices = async (): Promise<CryptoAsset[] | null> => {
  try {
    const res = await fetch(`${TOKEN_WATCHER_API_BASE_URL}btcstx`);
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
  const btcAndStxPrices = await getBtcAndStxPrices();
  const trackedWallets = await getTrackedWallets();
  console.log(trackedWallets);

  return (
    <footer className="px-2 flex items-center flex-row justify-between fixed bottom-0 py-2 border-t-[1px] border-t-border w-full bg-background">
      <div>
        <WalletTrackerModal wallets={trackedWallets?.data as UserWallet[]} />
      </div>
      <div className="flex gap-0.5 items-center self-end">
        {btcAndStxPrices ? (
          btcAndStxPrices?.map((asset) => (
            <Tooltip key={asset.symbol}>
              <TooltipTrigger asChild>
                <Button variant={"ghost"} size={"sm"}>
                  <Image
                    src={`/icons/${asset.symbol}.svg`}
                    height={18}
                    width={18}
                    alt="BTC icon"
                  />
                  ${formatPrice(asset.current_price)}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span className="text-xs">
                  Price of {asset.symbol.toUpperCase()} in USD
                </span>
              </TooltipContent>
            </Tooltip>
          ))
        ) : (
          <>
            <Skeleton className="w-[85px] h-[27px]" />
            <Skeleton className="w-[85px] h-[27px]" />
          </>
        )}
        {/* <Suspense fallback={<Skeleton className="w-[85px] h-[27px]" />}> */}
        {/*   <Button variant={"ghost"} size={"sm"}> */}
        {/*     <Image */}
        {/*       src={"/icons/btc.svg"} */}
        {/*       height={18} */}
        {/*       width={18} */}
        {/*       alt="BTC icon" */}
        {/*     /> */}
        {/*     {formatPrice(btcAndStxPrices[0]?.current_price)} */}
        {/*   </Button> */}
        {/* </Suspense> */}
        {/* <Button>Hello</Button> */}
      </div>
      {/* <WalletTrackerModal wallets={trackedWallets?.data as UserWallet[]} /> */}
    </footer>
  );
}
