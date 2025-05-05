import makeFetch from "~/lib/helpers/fetch";
import { ApiResponse } from "~/types";
import { UserWallet } from "~/types/wallets";
import WalletTrackerModal from "./modals/wallet-tracker/wallet-tracker-modal";
import { assertUserAuthenticated } from "~/lib/auth/auth";

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
  const trackedWallets = await getTrackedWallets();
  console.log(trackedWallets);

  return (
    <footer>
      <WalletTrackerModal wallets={trackedWallets?.data as UserWallet[]} />
    </footer>
  );
}
