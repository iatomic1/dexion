import { VelarSDK, type ISwapService } from "@velarprotocol/velar-sdk";
import { jsonStringifyWithBigInt } from "./utils/serialize";
import Redis from "ioredis";
import { tokens } from "./tokens";

const sdk = new VelarSDK();
(globalThis as any).window = {};

const redis = new Redis();

const getCacheKey = (platform: string, token: string) =>
  `swapii:${platform}->${token}`;

async function cacheSwapOptions(
  account: string,
  inToken: string,
  outToken: string,
): Promise<boolean> {
  const cacheKey = getCacheKey("velar", outToken);

  try {
    const swapInstance: ISwapService = await sdk.getSwapInstance({
      account: account,
      inToken,
      outToken,
    });

    const swapOptions = await swapInstance.swap({ amount: 1 });
    await redis.set(cacheKey, jsonStringifyWithBigInt(swapOptions, 2));
    console.log(`✅ Cached swapOptions for ${inToken} -> ${outToken}`);
    return true;
  } catch (err) {
    console.warn(
      `⚠️  Failed to cache ${inToken} -> ${outToken}: ${(err as Error).message}`,
    );
    return false;
  }
}

// Check which tokens are already cached
async function getUncachedTokens(
  inToken: string,
  allTokens: typeof tokens,
): Promise<typeof tokens> {
  console.log("🔍 Checking for already cached tokens...");

  const uncachedTokens = [];
  let cachedCount = 0;

  for (const token of allTokens) {
    const cacheKey = getCacheKey("velar", token.contractAddress);
    const exists = await redis.exists(cacheKey);

    if (exists) {
      cachedCount++;
      console.log(`⚡ Already cached: ${token.contractAddress}`);
    } else {
      uncachedTokens.push(token);
    }
  }

  console.log(`📊 Cache Status:`);
  console.log(`   ✅ Already cached: ${cachedCount}`);
  console.log(`   🔄 Need to cache: ${uncachedTokens.length}`);
  console.log(`   📝 Total tokens: ${allTokens.length}`);

  return uncachedTokens;
}

// Get from Redis and replace dynamic values
async function getFastSwapOptions(from: string, to: string, amount: bigint) {
  const cacheKey = getCacheKey(from, to);
  const raw = await redis.get(cacheKey);
  if (!raw) throw new Error("No cached swapOptions found");

  const swapOptions = JSON.parse(raw);

  swapOptions.functionArgs[1].value = amount.toString() + "n";

  for (const pc of swapOptions.postConditions) {
    if (pc.amount) pc.amount = amount.toString();
  }

  return swapOptions;
}

(async () => {
  const account = "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-core";
  const stxToken = "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx";

  const nonSuspiciousTokens = tokens.filter((t) => !t.isSuspicious);
  console.log(
    `🚀 Starting with ${nonSuspiciousTokens.length} non-suspicious tokens out of ${tokens.length} total tokens`,
  );

  // Get tokens that aren't already cached
  const tokensToProcess = await getUncachedTokens(
    stxToken,
    nonSuspiciousTokens,
  );

  if (tokensToProcess.length === 0) {
    console.log("🎉 All tokens are already cached! Nothing to do.");
    return;
  }

  let successCount = 0;
  let failureCount = 0;
  let processedCount = 0;

  console.log(
    `\n🔄 Starting to process ${tokensToProcess.length} uncached tokens...`,
  );

  for (const token of tokensToProcess) {
    processedCount++;
    console.log(
      `\nProcessing ${processedCount}/${tokensToProcess.length}: ${token.contractAddress}`,
    );

    const success = await cacheSwapOptions(
      account,
      stxToken,
      token.contractAddress,
    );

    if (success) {
      successCount++;
    } else {
      failureCount++;
    }

    console.log("💤 Waiting 2 seconds...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log(`\n📊 Final Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failureCount}`);
  console.log(`   📝 Total processed: ${processedCount}`);
  console.log(
    `   🎯 Completion rate: ${((successCount / tokensToProcess.length) * 100).toFixed(1)}%`,
  );
})().catch((err) => {
  console.error("❌ Unhandled error in main execution:", err);
  process.exit(1);
});
