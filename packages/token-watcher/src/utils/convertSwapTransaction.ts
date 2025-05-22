import type { TokenSwapTransaction } from "../types/token";

type InputTransaction = {
  txId: string;
  date: string;
  type: string;
  usdValue: number;
  tokenAmount: number;
  stxAmount: number;
  maker: string;
};

type ChartDataPoint = {
  time: number;
  value: number;
};

// Helper function to find the closest price point in time
function findClosestPrice(
  txTimestamp: number,
  chartData: ChartDataPoint[],
): number | null {
  if (!chartData || chartData.length === 0) return null;

  // Sort chart data by time to ensure proper searching
  const sortedData = [...chartData].sort((a, b) => a.time - b.time);

  // Find the closest price point
  let closestPoint = sortedData[0];
  let minDiff = Math.abs(txTimestamp - sortedData[0].time);

  for (const point of sortedData) {
    const diff = Math.abs(txTimestamp - point.time);
    if (diff < minDiff) {
      minDiff = diff;
      closestPoint = point;
    }
  }

  return closestPoint.value;
}

export function convertTransaction(
  input: InputTransaction,
  options?: {
    tx_index?: number;
    pool_id?: string;
    token_y_contract?: string;
    token_y_symbol?: string;
    token_y_decimals?: number;
    token_y_image?: string;
    bns?: string;
    chartData?: ChartDataPoint[]; // Add chartData to options
  },
): TokenSwapTransaction {
  const burnBlockTime = Math.floor(new Date(input.date).getTime() / 1000);
  const isBuy = input.type.toLowerCase() === "buy";

  // Find the closest price from chart data
  const closestPrice = options?.chartData
    ? findClosestPrice(burnBlockTime, options.chartData)
    : null;

  // Use the closest price if available, otherwise fall back to input.usdValue
  const tokenPrice = closestPrice ?? input.usdValue;

  // If buying: STX (token_x) -> Token (token_y)
  // If selling: Token (token_x) -> STX (token_y)
  const tokenXAmount = isBuy
    ? input.stxAmount.toString() // STX amount when buying
    : input.tokenAmount.toString(); // Token amount when selling

  const tokenYAmount = isBuy
    ? input.tokenAmount.toString() // Token amount when buying
    : input.stxAmount.toString(); // STX amount when selling

  return {
    tx_id: input.txId,
    tx_index: options?.tx_index ?? 0,
    pool_id: options?.pool_id ?? "",
    token_x_amount: tokenXAmount,
    token_y_amount: tokenYAmount,
    burn_block_time: burnBlockTime,
    price_usd: tokenPrice, // Use the matched price from chart data
    volume_usd: tokenPrice * (isBuy ? input.tokenAmount : input.stxAmount),
    wallet: {
      address: input.maker,
      bns: options?.bns ?? "",
      fungible_tokens: [],
    },
    token_x: isBuy
      ? {
          contract_id: "stx",
          decimals: 6,
          image_url:
            "https://images.ctfassets.net/frwmwlognk87/4gSg3vYkO4Vg5XXGJJc70W/ee285c9d710a68ae4e66f703555519b2/STX.svg",
          symbol: "STX",
        }
      : {
          contract_id: options?.token_y_contract ?? "",
          decimals: options?.token_y_decimals ?? 18,
          image_url: options?.token_y_image ?? "",
          symbol: options?.token_y_symbol ?? "TOKEN",
        },
    token_y: isBuy
      ? {
          // When buying: token_y is the other token
          contract_id: options?.token_y_contract ?? "",
          decimals: options?.token_y_decimals ?? 18,
          image_url: options?.token_y_image ?? "",
          symbol: options?.token_y_symbol ?? "TOKEN",
        }
      : {
          // When selling: token_y is STX
          contract_id: "stx",
          decimals: 6,
          image_url:
            "https://images.ctfassets.net/frwmwlognk87/4gSg3vYkO4Vg5XXGJJc70W/ee285c9d710a68ae4e66f703555519b2/STX.svg",
          symbol: "STX",
        },
  };
}
