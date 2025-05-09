export type TokenMetadata = {
  contract_id: string;
  symbol: string;
  decimals: number;
  name: string;
  circulating_supply: string;
  total_supply: string;
  image_url: string;
  header_image_url: string;
  description: string;
  verified: boolean;
  socials: {
    platform: string;
    value: string;
  }[];
  metrics: {
    contract_id: string;
    holder_count: number;
    swap_count: number;
    transfer_count: number | null;
    price_usd: number;
    price_change_1d: number;
    price_change_7d: number;
    price_change_30d: number;
    liquidity_usd: number;
    marketcap_usd: number;
    volume_1h_usd: number;
    volume_6h_usd: number;
    volume_1d_usd: number;
    volume_7d_usd: number;
  };
};
