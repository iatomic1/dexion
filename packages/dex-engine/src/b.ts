import {
  trueCV,
  uintCV,
  noneCV,
  someCV,
  listCV,
  tupleCV,
  standardPrincipalCV,
  contractPrincipalCV,
  type ClarityValue,
  stringAsciiCV,
} from "@stacks/transactions";

export function buildFunctionArgs(): ClarityValue[] {
  const tokenAddress = "SP3BRXZ9Y7P5YP28PSR8YJT39RT51ZZBSECTCADGR";
  const tokenContract = "skullcoin-stxcity";
  const inAsFee = trueCV();

  // 2. amt-out-min (uint)
  const amtOutMin = uintCV(62046n);

  // 3. path (list of tuples)
  const path = listCV([
    tupleCV({
      a: stringAsciiCV("a"),
      b: contractPrincipalCV(
        "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1",
        "wstx-skull",
      ),
      c: uintCV(117),
      d: contractPrincipalCV(
        "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1",
        "wstx",
      ),
      e: contractPrincipalCV(tokenAddress, tokenContract),
      f: trueCV(),
    }),
  ]);

  const amtIn = uintCV(1_000_00);

  const token1 = someCV(
    contractPrincipalCV("SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1", "wstx"),
  );
  const token2 = someCV(contractPrincipalCV(tokenAddress, tokenContract));
  const token3 = noneCV();
  const token4 = noneCV();
  const token5 = noneCV();

  // 10. share-fee-to (optional trait reference)
  const shareFeeTo = someCV(
    contractPrincipalCV(
      "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1",
      "univ2-share-fee-to",
    ),
  );

  // 11-14. univ2v2-pool-1-4 (optional trait references)
  const univ2v2Pool1 = noneCV();
  const univ2v2Pool2 = noneCV();
  const univ2v2Pool3 = noneCV();
  const univ2v2Pool4 = noneCV();

  // 15-18. univ2v2-fees-1-4 (optional trait references)
  const univ2v2Fees1 = noneCV();
  const univ2v2Fees2 = noneCV();
  const univ2v2Fees3 = noneCV();
  const univ2v2Fees4 = noneCV();

  // 19-22. curve-pool-1-4 (optional trait references)
  const curvePool1 = noneCV();
  const curvePool2 = noneCV();
  const curvePool3 = noneCV();
  const curvePool4 = noneCV();

  // 23-26. curve-fees-1-4 (optional trait references)
  const curveFees1 = noneCV();
  const curveFees2 = noneCV();
  const curveFees3 = noneCV();
  const curveFees4 = noneCV();

  return [
    inAsFee,
    amtOutMin,
    path,
    amtIn,
    token1,
    token2,
    token3,
    token4,
    token5,
    shareFeeTo,
    univ2v2Pool1,
    univ2v2Pool2,
    univ2v2Pool3,
    univ2v2Pool4,
    univ2v2Fees1,
    univ2v2Fees2,
    univ2v2Fees3,
    univ2v2Fees4,
    curvePool1,
    curvePool2,
    curvePool3,
    curvePool4,
    curveFees1,
    curveFees2,
    curveFees3,
    curveFees4,
  ];
}
