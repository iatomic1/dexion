import { describe, expect, mock, test } from "bun:test";
import type { MempoolTransaction } from "@stacks/blockchain-api-client";
import { Transaction } from "../transaction";

mock.module("../parser", () => ({
	generateTransactionMessage: mock(() => ({ message: "test" })),
}));

describe("Transaction", () => {
	const mockTx = {
		tx_id: "0x123",
		sender_address: "SP123",
	} as MempoolTransaction;

	test("should create a new transaction and generate a structured message", () => {
		const transaction = new Transaction(mockTx);

		expect(transaction.tx).toBe(mockTx);
		expect(transaction.structuredMessage).toBeDefined();
	});
});
