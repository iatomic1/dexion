import { type PlatformConfig, type SwapParams, DexPlatform } from "./types/sdk";
import { DexEngine } from "./services/core/DexEngine";
import { jsonStringifyWithBigInt } from "./utils/serialize";
import { makeContractCall, broadcastTransaction } from "@stacks/transactions";
import { transformToWrapperArgs } from "./util";
import { buildFunctionArgs } from "./b";

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
  const account = "SPQ9B3SYFV0AFYY96QN5ZJBNGCRRZCCMFHY0M34Z";

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
  const swapOpts = await dexEngine.executeSwap(DexPlatform.VELAR, swapParams);

  const { postConditions, functionArgs, ...filteredSwapOptions } = swapOpts;
  const senderKey = process.env.TEST_PRIVATE_KEY;
  console.log(jsonStringifyWithBigInt(swapOpts, 2));
  // const wrapperFunctionArgs = transformToWrapperArgs(
  //   functionArgs,
  //   swapParams,
  //   quote,
  // );
  const tx = await makeContractCall({
    ...filteredSwapOptions,
    contractAddress: "SP3451PXD29FVXH7KXCJDRAW5M6H71KXQ2HD50RGR",
    contractName: "dark-amethyst-anglerfish",
    functionName: "apply",
    functionArgs: buildFunctionArgs(),
    postConditionMode: "allow",
    network: "mainnet",
    senderKey: senderKey as string,
    validateWithAbi: true,
  });

  const res = await broadcastTransaction({ transaction: tx });
  console.log(res.txid);

  // console.log(jsonStringifyWithBigInt(swapResponse, 2));
})();
