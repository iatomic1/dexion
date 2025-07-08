import type { TxBroadcastResult } from "@stacks/transactions";
import { SignerError } from "../errors";
import type {
	BroadcastResult,
	SignedTransaction,
	TransactionTypeMap,
} from "../types";

export abstract class BaseSigner {
	protected config: any;

	constructor(config: any) {
		this.config = config;
	}

	abstract signTransaction<T extends keyof TransactionTypeMap>(
		type: T,
		params: TransactionTypeMap[T],
	): Promise<SignedTransaction>;

	abstract broadcastTransaction(
		signedTx: SignedTransaction,
	): Promise<TxBroadcastResult>;

	protected validateParams<T extends keyof TransactionTypeMap>(
		type: T,
		params: TransactionTypeMap[T],
	): void {
		switch (type) {
			case "contractCall":
				this.validateContractCallParams(
					params as TransactionTypeMap["contractCall"],
				);
				break;
			case "tokenTransfer":
				this.validateTokenTransferParams(
					params as TransactionTypeMap["tokenTransfer"],
				);
				break;
			case "smartContract":
				this.validateSmartContractParams(
					params as TransactionTypeMap["smartContract"],
				);
				break;
			default:
				throw new SignerError(
					`Unsupported transaction type: ${type}`,
					"VALIDATION_ERROR",
				);
		}
	}

	private validateContractCallParams(
		params: TransactionTypeMap["contractCall"],
	): void {
		if (!params.contractAddress) {
			throw new SignerError("Contract address is required", "VALIDATION_ERROR");
		}
		if (!params.contractName) {
			throw new SignerError("Contract name is required", "VALIDATION_ERROR");
		}
		if (!params.functionName) {
			throw new SignerError("Function name is required", "VALIDATION_ERROR");
		}
	}

	private validateTokenTransferParams(
		params: TransactionTypeMap["tokenTransfer"],
	): void {
		if (!params.recipient) {
			throw new SignerError(
				"Recipient address is required",
				"VALIDATION_ERROR",
			);
		}
		if (!params.amount) {
			throw new SignerError("Amount is required", "VALIDATION_ERROR");
		}
	}

	private validateSmartContractParams(
		params: TransactionTypeMap["smartContract"],
	): void {
		if (!params.contractName) {
			throw new SignerError("Contract name is required", "VALIDATION_ERROR");
		}
		if (!params.codeBody) {
			throw new SignerError(
				"Contract code body is required",
				"VALIDATION_ERROR",
			);
		}
	}
}
