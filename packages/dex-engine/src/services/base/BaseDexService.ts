import type { AmountOutResponse, SwapResponse } from "@velarprotocol/velar-sdk";
import type { IDexService, QuoteParams, SwapParams } from "../../types/sdk";

export abstract class BaseDexService implements IDexService {
  protected config: Record<string, any>;

  constructor(config: Record<string, any> = {}) {
    this.config = config;
  }

  abstract executeSwap(params: SwapParams): Promise<SwapResponse>;
  abstract getQuote(params: QuoteParams): Promise<AmountOutResponse>;

  // Common utility methods
  protected validateAmount(amount: number): void {
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }
  }

  protected validateSlippage(slippage?: number): void {
    if (slippage !== undefined && (slippage < 0 || slippage > 100)) {
      throw new Error("Slippage must be between 0 and 100");
    }
  }

  protected validateTokens(inToken: string, outToken: string): void {
    if (!inToken || !outToken) {
      throw new Error("Both inToken and outToken must be provided");
    }
    if (inToken === outToken) {
      throw new Error("inToken and outToken cannot be the same");
    }
  }

  protected validateAccount(account: string): void {
    if (!account) {
      throw new Error("Account address is required");
    }
  }
}
