import { notFound } from "next/navigation";
import TokenDetailPage from "./_components/token-details/token-details";
import { validateContractAddress } from "~/lib/utils/contract";

export default async function MemeTokenPage(props: {
  params: Promise<{ ca: string }>;
}) {
  const { ca } = await props.params;

  if (!validateContractAddress(ca)) {
    notFound();
  }

  return <TokenDetailPage ca={ca} />;
}
