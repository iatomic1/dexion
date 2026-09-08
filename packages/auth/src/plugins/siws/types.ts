export interface WalletAddress {
	id: string;
	userId: string;
	address: string;
	isPrimary: boolean;
	network: "mainnet" | "testnet";
	createdAt: Date;
}

export interface BNSLookupArgs {
	walletAddress: string;
}

export interface BNSLookupResult {
	name: string;
	avatar: string;
}

import type { WalletProvisionUser } from "../../types";

export interface SIWSPluginOptions {
	domain: string;
	emailDomainName?: string;
	anonymous?: boolean;
	getNonce: () => Promise<string>;
	bnsLookup?: (args: BNSLookupArgs) => Promise<BNSLookupResult>;
	verifyMessage: (args: {
		message: string;
		signature: string;
		address: string;
		nonce: string;
		publicKey: string;
	}) => Promise<boolean>;
	onWalletProvision?: (
		user: WalletProvisionUser,
		requireVerified: boolean,
	) => Promise<void>;
}
