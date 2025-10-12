import { withAuth } from "~/lib/auth/with-auth";
import {
	getZestAssetPrices,
	getZestReserve,
	getZestUserAssets,
} from "~/lib/queries/sbtc/zest";
import type { Session } from "~/types/auth";
import ZestContent from "./_components/zest-content";

async function ZestPage(props: { session: Session }) {
	const session = props.session;
	const userAssetsRes = await getZestUserAssets(session?.user.walletAddress);
	const [reserveData, pricesData] = await Promise.all([
		getZestReserve(),
		getZestAssetPrices(),
	]);

	console.log(reserveData);
	return (
		<ZestContent
			walletAddress={session?.user.walletAddress}
			userAssetsRes={userAssetsRes}
			reserveData={reserveData}
			pricesData={pricesData}
		/>
	);
}

export default withAuth(ZestPage);
