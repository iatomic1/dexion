import { TokenMetadata, TokenSwapTransaction, TokenHolder } from "@repo/tokens/types";
import { formatPrice } from "../helpers/numbers";
import { TokenLockedLiquidity } from "~/types/stxwatch";
import { AddressBalanceResponse } from "~/types/hiro/balance";

export const formatTokenBalance = (balance: string, decimal: number) => {
  return Number(balance) / 10 ** decimal;
};

export const calculateMarketCap = (token: TokenMetadata, price: number) => {
  const cs =
    token.progress && token.progress >= 100
      ? Number(token.circulating_supply) / 10 ** token.decimals
      : Number(token.circulating_supply);
  const mc = cs * price;
  // console.log("mccc", token.circulating_supply, price);
  // console.log(
  //   (Number(token.circulating_supply) / 10 ** token.decimals) * price,
  //   "finall",
  // );
  return mc;
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
  const currentValueUsd = calculateTokenValue(row.balance as string, token);

  const totalBuys = Number(row.total_buys);
  const totalSells = Number(row.total_sells);
  const totalSpent = Number(row.total_spent_usd);

  const totalValueNow = currentValueUsd + totalSells;

  if (totalBuys && totalSells === 0) {
    const pnlValue = currentValueUsd - totalSpent;
    return {
      value: pnlValue,
      formatted: formatPrice(pnlValue),
    };
  }

  // Proportional cost basis calculation
  const soldProportion = totalSells / totalValueNow;
  const heldProportion = currentValueUsd / totalValueNow;

  const soldCostBasis = totalSpent * soldProportion;
  const heldCostBasis = totalSpent * heldProportion;

  const realizedPnL = totalSells - soldCostBasis;
  const unrealizedPnL = currentValueUsd - heldCostBasis;
  const pnlValue = realizedPnL + unrealizedPnL;

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
