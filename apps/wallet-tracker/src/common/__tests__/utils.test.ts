import { MempoolTransaction } from "@stacks/blockchain-api-client";
import { extractTxDetails, formatPrice } from "../utils";

describe("extractTxDetails", () => {
	it("should extract the correct details from a transaction", () => {
		const tx = {
			tx_id: "0x123",
			sender_address: "SP123",
			tx_status: "success",
			tx_type: "contract_call",
		} as MempoolTransaction;

		const details = extractTxDetails(tx);

		expect(details).toEqual({
			txId: "0x123",
			senderAddress: "SP123",
			status: "success",
			type: "contract_call",
		});
	});
});

describe("formatPrice", () => {
	it("should format prices correctly", () => {
		expect(formatPrice(1234.567)).toBe("1.2k");
		expect(formatPrice(1234567.89)).toBe("1.2M");
		expect(formatPrice(1234567890)).toBe("1.2B");
		expect(formatPrice(1234567890123)).toBe("1.2T");
		expect(formatPrice(123.456, 2)).toBe("123.46");
		expect(formatPrice(0)).toBe("0");
		expect(formatPrice(undefined as any)).toBe("N/A");
	});
});
