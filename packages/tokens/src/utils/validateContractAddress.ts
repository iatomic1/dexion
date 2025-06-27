import { contractPrincipalCV } from "@stacks/transactions";

export const validateContractAddress = (adr: string) => {
  try {
    contractPrincipalCV(adr.split(".")[0], adr.split(".")[1]);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};
