import { validateContractAddress } from "@repo/tokens/utils";
import { ValidationError } from "../errors";
import type { ContractCallParams } from "../types";

export class Validator {
	static validateContractAddress(address: string): void {
		const isValid = validateContractAddress(address);

		if (!isValid) {
			throw new ValidationError("Invalid Stacks contract address format");
		}
	}

	static validateContractCall(params: ContractCallParams): void {
		this.validateContractAddress(params.contractAddress);

		if (!params.contractName?.trim()) {
			throw new ValidationError("Contract name is required");
		}

		if (!params.functionName?.trim()) {
			throw new ValidationError("Function name is required");
		}

		if (!Array.isArray(params.functionArgs)) {
			throw new ValidationError("Function arguments must be an array");
		}
	}

	static validateHexString(hex: string, name: string): void {
		if (typeof hex !== "string") {
			throw new ValidationError(`${name} must be a string`);
		}

		if (!/^[0-9a-fA-F]*$/.test(hex)) {
			throw new ValidationError(`${name} must be a valid hex string`);
		}
	}
}
