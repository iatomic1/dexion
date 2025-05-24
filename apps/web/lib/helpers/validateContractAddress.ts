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
export const getContractAddressAndName = (
  address: string,
): { address: string; name: string } => {
  if (!address) {
    return { address: "", name: "" };
  }
  const arr = address.split(".");
  return { address: arr[0], name: arr[1] };
};
