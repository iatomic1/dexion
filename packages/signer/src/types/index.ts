import type {
	UnsignedContractCallOptions,
	UnsignedContractDeployOptions,
	UnsignedTokenTransferOptions,
} from "@stacks/transactions";
export interface SignerConfig {
	blockchain: "stacks";
	network: NetworkType;
	provider: "turnkey";
	walletConfig: WalletConfig;
}

export interface TransactionTypeMap {
	contractCall: Omit<UnsignedContractCallOptions, "network" | "publicKey">;
	tokenTransfer: Omit<UnsignedTokenTransferOptions, "network" | "publicKey">;
	smartContract: Omit<UnsignedContractDeployOptions, "network" | "publicKey">;
}

export interface WalletConfig {
	subOrgID: string;
	wallet: {
		address: string;
		publicKey: string;
	};
}

export enum NetworkType {
	MAINNET = "mainnet",
	TESTNET = "testnet",
}

export type ContractCallParams = UnsignedContractCallOptions;

export interface SignedTransaction {
	transaction: any;
	txId: string;
}

export interface BroadcastResult {
	txId: string;
	success: boolean;
	error?: string;
}
