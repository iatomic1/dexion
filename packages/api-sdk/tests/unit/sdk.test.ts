// tests/sdk.test.ts
import { describe, expect, it } from "vitest";
import { DexionApiSDK } from "@/DexionApiSDK";

describe("DexionApiSDK", () => {
	it("initializes managers with correct props", () => {
		const sdk = new DexionApiSDK("token123", "user456", true);
		expect(sdk.wallets).toBeDefined();
		expect(sdk.watchlists).toBeDefined();
	});
});
