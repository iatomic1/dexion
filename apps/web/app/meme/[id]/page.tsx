import TokenDetailPage from "./_components/token-details";

export default function MemeTokenPage({ params }: { params: { id: string } }) {
  return <TokenDetailPage tokenId={params.id} />;
}
