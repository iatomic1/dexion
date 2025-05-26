import {
  VelarSDK,
  type SwapResponse,
  type ISwapService,
  type AmountOutResponse,
} from "@velarprotocol/velar-sdk";
import type { SwapParams, QuoteParams } from "../../types/sdk";
import { BaseDexService } from "../base/BaseDexService";

export class VelarDexService extends BaseDexService {
  private velarSDK: VelarSDK;

  constructor(config: Record<string, any> = {}) {
    super(config);
    this.velarSDK = new VelarSDK();
  }

  async executeSwap(params: SwapParams): Promise<SwapResponse> {
    const { account, inToken, outToken, amount, slippage } = params;

    // Validate inputs
    this.validateAccount(account);
    this.validateTokens(inToken, outToken);
    this.validateAmount(amount);
    this.validateSlippage(slippage);

    const swapInstance: ISwapService = await this.velarSDK.getSwapInstance({
      account,
      inToken,
      outToken,
    });

    return await swapInstance.swap({
      amount,
      slippage,
    });
  }

  async getQuote(params: QuoteParams): Promise<AmountOutResponse> {
    const { inToken, outToken, amount, slippage } = params;

    // Validate inputs
    this.validateTokens(inToken, outToken);
    this.validateAmount(amount);
    this.validateSlippage(slippage);

    const dummyAccount = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

    // Create swap instance for this specific token pair
    const swapInstance: ISwapService = await this.velarSDK.getSwapInstance({
      account: dummyAccount,
      inToken,
      outToken,
    });

    // Get the quote
    return await swapInstance.getComputedAmount({
      amount,
      slippage,
    });
  }

  async getPairs(symbol: string): Promise<Array<string>> {
    return await this.velarSDK.getPairs(symbol);
  }
}
