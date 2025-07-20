import type {
	MempoolTransaction,
	Transaction,
} from "@stacks/blockchain-api-client";

export type PostCondition = Transaction["post_conditions"][number];

export interface AssetInfo {
	asset: string;
	amount: string;
	contractId: string;
}

export interface TransactionDetails {
	sent?: AssetInfo;
	received?: AssetInfo;
	recipient?: string;
	[key: string]: any;
}

export interface ParsedTransaction {
	txId: string;
	protocol: string;
	action: string;
	sender: string;
	status: Transaction["tx_status"];
	contract?: {
		id: string;
		function: string;
	};
	details: TransactionDetails;
	summary: string;
}

export interface ProtocolHandler {
	canHandle(contractId: string, functionName?: string): boolean;
	parse(tx: Transaction): ParsedTransaction | null;
	getProtocolName(): string;
}
