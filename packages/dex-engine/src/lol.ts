import { broadcastTransaction, makeContractCall } from "@stacks/transactions";
import { buildStxToToken } from "./utils/buildStxToTokenSwap";
import { jsonStringifyWithBigInt } from "./utils/serialize";
const swapOpts = buildStxToToken({
  tokenContract: "SP1JBV7TE0490KNVM1VAM19KHZG0CPC9426YCY3ZF.drones-stxcity",
  ca: "SP20X3DC5R091J8B6YPQT638J8NR1W83KN6TN5BJY.path-apply_staging",
  amount: 1_000_000n,
});

const { postConditions, ...filteredSwapOptions } = swapOpts;
const senderKey = process.env.TEST_PRIVATE_KEY;
console.log(jsonStringifyWithBigInt(swapOpts, 2));

const tx = await makeContractCall({
  ...filteredSwapOptions,
  postConditionMode: "allow",
  network: "mainnet",
  senderKey: senderKey as string,
  validateWithAbi: true,
});
tx;

const res = await broadcastTransaction({ transaction: tx });
console.log(res.txid);
