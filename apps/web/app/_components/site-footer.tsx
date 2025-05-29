import makeFetch from "~/lib/helpers/fetch";
import { ApiResponse } from "~/types";
import { UserWallet } from "~/types/wallets";
import WalletTrackerModal from "./modals/wallet-tracker/wallet-tracker-modal";
import { assertUserAuthenticated } from "~/lib/auth/auth";
import { Button } from "@repo/ui/components/ui/button";

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

export default async function SiteFooter() {
  // const trackedWallets = await getTrackedWallets();
  // console.log(trackedWallets);

  return (
    <footer className="px-2 flex items-center justify-between fixed bottom-0 pt-8">
      <div className="flex gap-3 items-center">
        <Button>Hello</Button>
      </div>
      {/* <WalletTrackerModal wallets={trackedWallets?.data as UserWallet[]} /> */}
    </footer>
  );
}
