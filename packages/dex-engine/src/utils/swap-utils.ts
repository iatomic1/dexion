import type { SwapParams, QuoteParams } from "../types/sdk";

export class SwapUtils {
  static calculateMinimumAmountOut(
    amountOut: number,
    slippage: number = 0.5,
  ): number {
    const slippageMultiplier = (100 - slippage) / 100;
    return Math.floor(amountOut * slippageMultiplier);
  }

  static calculatePriceImpact(
    amountIn: number,
    amountOut: number,
    rate: number,
  ): number {
    const expectedOut = amountIn * rate;
    return ((expectedOut - amountOut) / expectedOut) * 100;
  }

  static validateSwapParams(params: SwapParams): void {
    const { account, inToken, outToken, amount, slippage } = params;

    if (!account) throw new Error("Account is required");
    if (!inToken) throw new Error("Input token is required");
    if (!outToken) throw new Error("Output token is required");
    if (inToken === outToken)
      throw new Error("Input and output tokens must be different");
    if (amount <= 0) throw new Error("Amount must be greater than 0");
    if (slippage !== undefined && (slippage < 0 || slippage > 100)) {
      throw new Error("Slippage must be between 0 and 100");
    }
  }

  static validateQuoteParams(params: QuoteParams): void {
    const { inToken, outToken, amount, slippage } = params;

    if (!inToken) throw new Error("Input token is required");
    if (!outToken) throw new Error("Output token is required");
    if (inToken === outToken)
      throw new Error("Input and output tokens must be different");
    if (amount <= 0) throw new Error("Amount must be greater than 0");
    if (slippage !== undefined && (slippage < 0 || slippage > 100)) {
      throw new Error("Slippage must be between 0 and 100");
    }
  }
}
