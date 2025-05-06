import TokenDetailPage from "./_components/token-details";

export default async function MemeTokenPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return <TokenDetailPage tokenId={params.id} />;
}
