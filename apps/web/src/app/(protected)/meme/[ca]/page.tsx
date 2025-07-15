import { notFound } from "next/navigation";
import { validateContractAddress } from "~/lib/utils/contract";
import TokenDetailPage from "./_components/token-details/token-details";

export default async function MemeTokenPage(props: {
	params: Promise<{ ca: string }>;
}) {
	const { ca } = await props.params;

	if (!validateContractAddress(ca)) {
		notFound();
	}

	return <TokenDetailPage />;
}
