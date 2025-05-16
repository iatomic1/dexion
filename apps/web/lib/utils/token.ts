import {
  TokenHolder,
  TokenMetadata,
  TokenSwapTransaction,
} from "@repo/token-watcher/token.ts";
import { formatPrice } from "../helpers/numbers";
import { Address } from "@stacks/transactions";
import { AddressBalanceResponse } from "~/types/balance";
import { TokenLockedLiquidity } from "~/types/stxwatch";

export const calculateMarketCap = (token: TokenMetadata, price: number) => {
  return (Number(token.circulating_supply) / 10 ** token.decimals) * price;
};

export const calculateTokenValue = (balance: string, token: TokenMetadata) => {
  if (balance === "") return 0;

  const tokenBal = Number(balance);
  return (tokenBal / 10 ** token.decimals) * token.metrics.price_usd;
};
export const determineTransactionType = (
  trade: TokenSwapTransaction,
  token: TokenMetadata,
) => {
  return trade.token_x.contract_id === token.contract_id ? "Sell" : "Buy";
};

export function calculatePnl(
  row: TokenHolder,
  token: TokenMetadata,
): { value: number; formatted: string } {
  const valueUsd = calculateTokenValue(row.balance as string, token);

  // If no sells have occurred, calculate PnL as current value minus total spent
  if (row.total_buys && row.total_sells === "0") {
    const pnlValue = valueUsd - Number(row.total_spent_usd);
    return {
      value: pnlValue,
      formatted: formatPrice(pnlValue),
    };
  }

  // Otherwise, use the calculated total PnL
  const pnlValue = Number(row.total_pnl_usd);
  return {
    value: pnlValue,
    formatted: formatPrice(pnlValue),
  };
}

export function calculatePercentageHolding(
  balance: string,
  total_supply: string,
) {
  return (Number(balance) / Number(total_supply)) * 100;
}

export const getDevHoldingPercentage = (
  addressBalance: AddressBalanceResponse,
  ca: string,
  total_supply: string,
): number => {
  if (!addressBalance || !addressBalance.fungible_tokens) return 0;

  const tokenBalance = addressBalance.fungible_tokens[ca];
  return tokenBalance
    ? calculatePercentageHolding(tokenBalance.balance, total_supply)
    : 0;
};

export const getLockedLiquidityPercentage = (
  liquidity: TokenLockedLiquidity,
) => {
  const locked =
    liquidity.locked_alex + liquidity.locked_evil + liquidity.locked_velar;
  return (locked / liquidity.total_liquidity) * 100;
};
