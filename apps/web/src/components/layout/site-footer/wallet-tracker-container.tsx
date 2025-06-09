import { assertUserAuthenticated } from "~/lib/auth/auth";
import makeFetch from "~/lib/helpers/fetch";
import type { ApiResponse } from "~/types";
import type { UserWallet } from "~/types/wallets";
import WalletTrackerModal from "../wallet-tracker/wallet-tracker-modal";

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

export default async function WalletTrackerContainer() {
  const wallets = await getTrackedWallets();

  return <WalletTrackerModal wallets={wallets?.data as UserWallet[]} />;
}
