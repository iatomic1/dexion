import { Pc } from "@stacks/transactions";

type CA = `${string}.${string}`;
export function buildPC(opts: {
  ca: CA;
  poolCa: CA;
  tokenCa: CA;
  tokenSymbol: string;
  address: string;
}) {
  const stxPostCondition1 = Pc.principal(opts.address)
    .willSendEq(1_000_000)
    .ustx();

  const stxPostCondition2 = Pc.principal(opts.poolCa).willSendLte(10000).ustx();

  // Fungible Token Post Condition: Greater than or equal to 29,136,038,147 units of UAP
  const ftPostCondition = Pc.principal(opts.poolCa)
    .willSendGte(2852889183)
    .ft(opts.tokenCa, opts.tokenSymbol);

  const postConditions = [
    stxPostCondition1,
    stxPostCondition2,
    ftPostCondition,
  ];

  return postConditions;
}
