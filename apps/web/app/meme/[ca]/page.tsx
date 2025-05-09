import { validateContractAddress } from "~/lib/helpers/validateContractAddress";
import TokenDetailPage from "./_components/token-details";
import { notFound } from "next/navigation";

export default async function MemeTokenPage(props: {
  params: Promise<{ ca: string }>;
}) {
  const params = await props.params;

  if (!validateContractAddress(params.ca)) {
    notFound();
  }

  return <TokenDetailPage tokenId={params.ca} />;
}
