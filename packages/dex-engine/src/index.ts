import {
  VelarSDK,
  type AmountOutResponse,
  type ISwapService,
  type SwapResponse,
} from "@velarprotocol/velar-sdk";
import { jsonStringifyWithBigInt } from "./utils/serialize";
import { makeContractCall, broadcastTransaction } from "@stacks/transactions";

const sdk = new VelarSDK();
(globalThis as any).window = {};

const main = async () => {
  console.log("Starting swap process...");
  const startTime = Date.now();

  try {
    const account = "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-core";

    console.log("Creating swap instance...");
    const swapInstanceStart = Date.now();
    const swapInstance: ISwapService = await sdk.getSwapInstance({
      account: account,
      inToken: "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx",
      outToken: "SP1JBV7TE0490KNVM1VAM19KHZG0CPC9426YCY3ZF.drones-stxcity",
    });
    const swapInstanceTime = Date.now() - swapInstanceStart;
    console.log(`Swap instance created in ${swapInstanceTime}ms`);

    console.log("Getting computed amount...");
    const amountStart = Date.now();
    const amount: AmountOutResponse = await swapInstance.getComputedAmount({
      amount: 1,
    });
    const amountTime = Date.now() - amountStart;
    console.log(`Computed amount retrieved in ${amountTime}ms`);
    console.log("Amount data:", jsonStringifyWithBigInt(amount, 2));

    console.log("Executing swap...");
    const swapStart = Date.now();
    const swapOptions: SwapResponse = await swapInstance.swap({
      amount: 1,
    });
    const swapTime = Date.now() - swapStart;
    console.log(`Swap executed in ${swapTime}ms`);

    console.log("Swap options:");
    console.log(jsonStringifyWithBigInt(swapOptions, 2));

    const totalTime = Date.now() - startTime;
    console.log(`\n=== Timing Summary ===`);
    console.log(`Swap instance creation: ${swapInstanceTime}ms`);
    console.log(`Amount computation: ${amountTime}ms`);
    console.log(`Swap execution: ${swapTime}ms`);
    console.log(`Total execution time: ${totalTime}ms`);
    const senderKey = process.env.TEST_PRIVATE_KEY;
    console.log(senderKey);

    const { postConditions, ...filteredSwapOptions } = swapOptions;

    const tx = await makeContractCall({
      ...filteredSwapOptions,
      postConditionMode: "allow",
      network: "mainnet",
      senderKey: senderKey as string,
      validateWithAbi: true,
    });

    const res = await broadcastTransaction({ transaction: tx });
    console.log(res.txid);
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error("Error occurred:", error);
    console.log(`Total time before error: ${totalTime}ms`);
  }
};

console.time("main");
await main();
console.timeEnd("main");
