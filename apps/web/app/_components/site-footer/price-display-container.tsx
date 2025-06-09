import { TOKEN_WATCHER_API_BASE_URL } from "~/lib/constants";
import type { CryptoAsset } from "~/types/xverse";
import { PriceDisplay } from "./price-display";

const getBtcAndStxPrices = async (): Promise<CryptoAsset[] | null> => {
  try {
    const res = await fetch(`${TOKEN_WATCHER_API_BASE_URL}btcstx`, {
      cache: "force-cache",
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      throw new Error("Error fetching stx and btc prices");
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export default async function PriceDisplayContainer() {
  const prices = await getBtcAndStxPrices();

  return <PriceDisplay prices={prices} />;
}
