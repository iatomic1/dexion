import { assertUserAuthenticated } from "~/lib/auth/assert-user-authenticated";
import { withAuth } from "~/lib/auth/with-auth";
import makeFetch from "~/lib/helpers/fetch";
import type { ApiResponse } from "~/types";
import type { Session } from "~/types/auth";
import type { UserWallet } from "~/types/wallets";
import TrackersDetails from "./_components/trackers-details";

const getTrackedWallets = async () => {
	const session = await assertUserAuthenticated();
	try {
		return await makeFetch<ApiResponse<UserWallet[]>>(
			"dexion",
			"wallets",
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

async function TrackersPage() {
	const wallets = await getTrackedWallets();
	return <TrackersDetails wallets={wallets?.data as UserWallet[]} />;
}
export default withAuth(TrackersPage);
