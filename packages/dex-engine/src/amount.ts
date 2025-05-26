import {
  VelarSDK,
  type AmountOutResponse,
  type ISwapService,
  type SwapResponse,
} from "@velarprotocol/velar-sdk";

async function measureSwapInstanceCreation() {
  console.log("Starting Velar SDK swap instance creation...");

  // Record start time
  const startTime = performance.now();

  try {
    const sdk = new VelarSDK();
    (globalThis as any).window = {};

    const account = "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-core";
    const stxToken = "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx";
    const outToken = "SP11576BY1VGM2EEGS0Z8P0B3053V0CKT4YYRHM3Z.sonic-svm";

    const swapInstance: ISwapService = await sdk.getSwapInstance({
      account: account,
      inToken: stxToken,
      outToken,
    });

    const amount: AmountOutResponse = await swapInstance.getComputedAmount({
      amount: 10,
    });

    console.log(amount);

    const swapOptions: SwapResponse = await swapInstance.swap({
      amount: 10,
      slippage: 10,
    });
    // Record end time
    const endTime = performance.now();
    const executionTime = endTime - startTime;

    console.log(`✅ Swap instance created successfully!`);
    console.log(`⏱️  Execution time: ${executionTime.toFixed(2)} milliseconds`);
    console.log(
      `⏱️  Execution time: ${(executionTime / 1000).toFixed(3)} seconds`,
    );

    return { swapInstance, executionTime };
  } catch (error) {
    const endTime = performance.now();
    const executionTime = endTime - startTime;

    console.error(
      `❌ Error occurred after ${executionTime.toFixed(2)}ms:`,
      error,
    );
    throw error;
  }
}

// Run the measurement
measureSwapInstanceCreation()
  .then(({ swapInstance, executionTime }) => {
    console.log(`\n📊 Summary:`);
    console.log(`   - Total time: ${executionTime.toFixed(2)}ms`);
    console.log(`   - Swap instance type:`, typeof swapInstance);
  })
  .catch((error) => {
    console.log("Failed to create swap instance:", error.message);
  });
