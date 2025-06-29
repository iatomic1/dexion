export type StxCityTokenMetadata = {
  chat_count: number;
  decimals: number;
  deployed_at: string;
  description: string;
  dex_contract: string;
  discord: string;
  holders: number;
  homepage: string;
  id: number;
  logo_url: string;
  name: string;
  price: number;
  price_24h_changes: number;
  progress: number;
  status: string;
  stx_buy_first_fee: number;
  stx_paid: number;
  stx_to_dex: number;
  supply: number;
  symbol: string;
  target_AMM: string;
  target_stx: number;
  telegram: string;
  token_contract: string;
  token_to_deployer: number;
  token_to_dex: number;
  trading_volume: number;
  tx_id: string;
  txs_count: number;
  uri: string | null;
  xlink: string;
};
export type BondingDataResult = {
  trending: StxCityTokenMetadata[];
  all: StxCityTokenMetadata[];
  completed: StxCityTokenMetadata[];
  limit: number;
  new: StxCityTokenMetadata[];
  page: number;
  total: number;
};
