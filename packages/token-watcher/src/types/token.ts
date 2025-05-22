export type TokenMetadata = {
  contract_id: string;
  dex_contract: string | null;
  progress: number | null;
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

export type TokenSwapTransaction = {
  tx_id: string;
  tx_index: number;
  pool_id: string;
  token_x_amount: string;
  token_y_amount: string;
  burn_block_time: number;
  price_usd: number;
  volume_usd: number;
  wallet: {
    address: string;
    bns: string;
    fungible_tokens: Array<{
      balance: string;
      credits: string;
      debits: string;
      total_buys: string;
      total_sells: string;
      total_spent_usd: string;
      total_received_usd: string;
      total_pnl_usd: string;
      created_at: string;
    }>;
  };
  token_x: {
    contract_id: string;
    decimals: number;
    image_url: string;
    symbol: string;
  };
  token_y: {
    contract_id: string;
    decimals: number;
    image_url: string;
    symbol: string;
  };
};

export type ApiRes<T> = {
  data: T[];
  rowCount: number;
};

export type TokenHolder = {
  balance: string;
  debits: string;
  credits: string;
  total_spent_usd: string;
  total_received_usd: string;
  total_buys: string;
  total_sells: string;
  total_pnl_usd: string;
  wallet: {
    address: string;
    bns: string | null;
    tags: string[];
  };
  rank: number;
};

export type LiquidityPool = {
  pool_id: string;
  platform: string;
  liquidity_usd: number;
  token_x_price_usd: number;
  base_token: {
    contract_id: string;
    image_url: string;
    symbol: string;
  };
  target_token: {
    contract_id: string;
    image_url: string;
    symbol: string;
  };
  metrics: {
    swap_count: number;
    volume_1d_usd: number;
    volume_7d_usd: number;
    price_change_1d: number;
    price_change_7d: number;
    price_change_30d: number;
  };
};

type Token = {
  contract_id: string;
  decimals: number;
  image_url: string;
  symbol: string;
};

export type FilterTokenSwapTransaction = {
  tx_id: string;
  pool_id: string;
  token_x_amount: string;
  token_y_amount: string;
  burn_block_time: number;
  price_usd: number;
  volume_usd: number;
  wallet: {
    address: string;
    bns: string;
  };
  token_x: {
    contract_id: string;
    decimals: number;
    image_url: string;
    symbol: string;
  };
  token_y: {
    contract_id: string;
    decimals: number;
    image_url: string;
    symbol: string;
  };
};
