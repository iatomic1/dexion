export interface WalletAddress {
	id: string;
	userId: string;
	address: string;
	isPrimary: boolean;
	network: "mainnet" | "testnet";
	createdAt: Date;
}

export interface SIWSPluginOptions {
	domain: string;
	emailDomainName?: string;
	anonymous?: boolean;
	getNonce: () => Promise<string>;
	verifyMessage: (args: {
		message: string;
		signature: string;
		address: string;
		nonce: string;
		publicKey: string;
	}) => Promise<boolean>;
}
