import {
  trueCV,
  noneCV,
  someCV,
  uintCV,
  contractPrincipalCV,
  listCV,
  tupleCV,
  stringAsciiCV,
  PostConditionMode,
} from "@stacks/transactions";
import { buildPC } from "./buildPostConditions";

export const buildStxToToken = (options: {
  ca: `${string}.${string}`;
  tokenContract: `${string}.${string}`;
  amount: bigint;
}) => {
  const { ca, tokenContract, amount } = options;
  const [contractAddress, contractName] = ca.split(".");
  const [tokenContractAddress, tokenContractName] = tokenContract.split(".");

  // const poolAddr = "SP20X3DC5R091J8B6YPQT638J8NR1W83KN6TN5BJY";
  const poolAddr = "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1";
  const commonAddress = "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1";
  const poolContract = "univ2-pool-v1_0_0-0003";
  const poolFeeContract = "univ2-fees-v1_0_0-0003";
  const feeToContract = "univ2-share-fee-to";
  const wstxContract = "wstx";
  const feesContract = "univ2-fees-v1_0_0-0003";

  const tupleItem = tupleCV({
    a: stringAsciiCV("v"),
    b: contractPrincipalCV(poolAddr, poolContract),
    c: uintCV(21000065),
    d: contractPrincipalCV(commonAddress, wstxContract),
    e: contractPrincipalCV(tokenContractAddress, tokenContractName),
    f: trueCV(),
  });

  const functionArgs = [
    listCV([tupleItem]),
    uintCV(amount),
    someCV(contractPrincipalCV(commonAddress, wstxContract)),
    someCV(contractPrincipalCV(tokenContractAddress, tokenContractName)),
    noneCV(),
    noneCV(),
    noneCV(),
    someCV(contractPrincipalCV(commonAddress, feeToContract)),
    someCV(contractPrincipalCV(poolAddr, poolContract)),
    noneCV(),
    noneCV(),
    noneCV(),
    someCV(contractPrincipalCV(poolAddr, poolFeeContract)),
    ...Array(19).fill(noneCV()),
  ];

  const pcs = buildPC({
    ca,
    poolCa: `${commonAddress}.${poolContract}`,
    tokenCa: tokenContract,
    tokenSymbol: "UAP",
    address: "SP3451PXD29FVXH7KXCJDRAW5M6H71KXQ2HD50RGR",
  });

  return {
    contractAddress,
    contractName,
    functionName: "apply",
    functionArgs,
    postConditions: pcs,
    postConditionMode: PostConditionMode.Deny,
  };
};
