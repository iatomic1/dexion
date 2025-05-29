import { trueCV, uintCV } from "@stacks/transactions";

export function transformToWrapperArgs(originalArgs, swapParams, quote) {
  const [
    path,
    amountIn,
    token1,
    token2,
    token3,
    token4,
    token5,
    shareFee,
    ...pools
  ] = originalArgs;

  // Calculate minimum output (with slippage)
  const slippageMultiplier = 1 - swapParams.slippage / 100;
  const amtOutMinValue = Math.floor(quote.value * slippageMultiplier);
  const amtOutMin = uintCV(amtOutMinValue);

  const wrapperArgs = [
    trueCV(),
    amtOutMin,
    path,
    amountIn,
    token1,
    token2,
    token3,
    token4,
    token5,
    shareFee,
    pools[0] || { type: "none" },
    pools[1] || { type: "none" },
    pools[2] || { type: "none" },
    pools[3] || { type: "none" },
    pools[4] || { type: "none" },
    pools[5] || { type: "none" },
    pools[6] || { type: "none" },
    pools[7] || { type: "none" },
    pools[8] || { type: "none" },
    pools[9] || { type: "none" },
    pools[10] || { type: "none" },
    pools[11] || { type: "none" },
    pools[12] || { type: "none" },
    pools[13] || { type: "none" },
    pools[14] || { type: "none" },
    pools[15] || { type: "none" },
  ];

  return wrapperArgs;
}
