import { type PlatformConfig, type SwapParams, DexPlatform } from "./types/sdk";
import { DexEngine } from "./services/core/DexEngine";
import { jsonStringifyWithBigInt } from "./utils/serialize";

(globalThis as any).window = {};

(async () => {
  const platforms: PlatformConfig[] = [
    {
      platform: DexPlatform.VELAR,
      config: {},
    },
  ];

  const dexEngine = new DexEngine(platforms);
  const outToken = "SP1JBV7TE0490KNVM1VAM19KHZG0CPC9426YCY3ZF.drones-stxcity";
  const inToken = "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx";
  const account = "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-core";

  const swapParams: SwapParams = {
    account,
    inToken,
    outToken,
    amount: 10,
    slippage: 0.5,
  };

  const quote = await dexEngine.getQuote(DexPlatform.VELAR, {
    inToken: swapParams.inToken,
    outToken: swapParams.outToken,
    amount: swapParams.amount,
    slippage: swapParams.slippage,
  });
  console.log(`You will receive approximately ${quote.value} tokens`);
  const swapResponse = await dexEngine.executeSwap(
    DexPlatform.VELAR,
    swapParams,
  );
  console.log(jsonStringifyWithBigInt(swapResponse, 2));
})();
