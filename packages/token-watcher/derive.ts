import {
  broadcastTransaction,
  getAddressFromPublicKey,
  makeUnsignedSTXTokenTransfer,
  publicKeyToAddress,
} from "@stacks/transactions";
import { TransactionSigner } from "@stacks/transactions";

const addr = getAddressFromPublicKey(
  "0238b4b156803a4ec7671f46e119625056017208e6a51c5c88bb9d9265ef8f5c33",
);
console.log(addr);

const transaction = await makeUnsignedSTXTokenTransfer({
  recipient: "SPQ9B3SYFV0AFYY96QN5ZJBNGCRRZCCMFHY0M34Z",
  amount: 100n,
  network: "mainnet" as const,
  memo: "test memo",
  nonce: 0n, // set a nonce manually if you don't want builder to fetch from a Stacks node
  fee: 200n, // set a tx fee if you don't wanthttps://www.better-auth.com/docs/integrations/next#server-action-cookies the builder to estimate
  publicKey: "",
});

const serializedTx = transaction.serialize();
broadcastTransaction({});
