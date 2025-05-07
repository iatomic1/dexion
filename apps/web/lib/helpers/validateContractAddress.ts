import { validateStacksAddress } from "@stacks/transactions";

export const validateContractAddress = (ca: string): boolean => {
  try {
    const [address, contractName] = ca.split(".");

    validateStacksAddress(address as string);

    // Validate contract name format (should also check if it follows Clarity naming rules)
    if (!contractName || !contractName.match(/^[a-zA-Z]([a-zA-Z0-9]|-|_)*$/)) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};
