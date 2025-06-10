import { getAddressFromPublicKey } from "@stacks/transactions";

const addr = getAddressFromPublicKey(
  "0238b4b156803a4ec7671f46e119625056017208e6a51c5c88bb9d9265ef8f5c33",
);
console.log(addr);
