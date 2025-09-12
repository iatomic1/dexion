import { BitflowSDK } from "@bitflowlabs/core-sdk";
import { notFound } from "next/navigation";
import { withAuth } from "~/lib/auth/with-auth";
import { validateContractAddress } from "~/lib/utils/contract";
import type { Session } from "~/types/auth";
import TokenDetailPage from "./_components/token-details/token-details";

const getMemeFromBitflow = async (ca: string) => {
	try {
		const bitflow = new BitflowSDK();

		const tokens = await bitflow.getAvailableTokens();
		const bitflowToken = tokens.find((t) => t.tokenContract === ca);

		return bitflowToken;
	} catch (err) {
		console.error(err);
	}
};

async function MemeTokenPage(props: {
	params: Promise<{ ca: string }>;
	session: Session;
}) {
	const { ca } = await props.params;
	const { session } = props;

	if (!validateContractAddress(ca)) {
		notFound();
	}
	const bitflowToken = await getMemeFromBitflow(ca);

	return (
		<TokenDetailPage
			session={session}
			bitflowTokenId={bitflowToken?.["token-id"] ?? null}
		/>
	);
}

export default withAuth(MemeTokenPage);
