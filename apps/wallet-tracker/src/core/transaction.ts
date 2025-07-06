import { MempoolTransaction } from "@stacks/blockchain-api-client";
import { generateTransactionMessage } from "./parser";

export class Transaction {
	public readonly tx: MempoolTransaction;
	public readonly structuredMessage: any;

	constructor(tx: MempoolTransaction) {
		this.tx = tx;
		this.structuredMessage = generateTransactionMessage(tx);
	}

	public get a() {
		return this.structuredMessage;
	}
}
