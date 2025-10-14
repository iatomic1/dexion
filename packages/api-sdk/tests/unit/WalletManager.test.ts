import { beforeEach, describe, expect, it, vi } from "vitest";
import { WalletManager } from "@/wallets";

vi.mock("./schema", () => ({
	addWalletSchema: { parse: (d: any) => d },
	updateWalletSchema: { parse: (d: any) => d },
	removeWalletSchema: { parse: (d: any) => d },
}));

describe("WalletManager", () => {
	const manager = new WalletManager("user123", "token456", false);

	beforeEach(() => {
		(fetch as any).mockResolvedValue({
			headers: { get: () => "application/json" },
			json: async () => ({ data: "ok" }),
		});
	});

	it("adds a wallet", async () => {
		const res = await manager.addWallet({
			walletAddress: "SP38PHX6CDTPRDMWEYEZ2PMQNHH6K8BYYX9KVW76X",
			nickname: "atomic",
			emoji: "😀",
		});
		expect(res).toEqual({ data: "ok" });
		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining("wallets"),
			expect.objectContaining({ method: "POST" }),
		);
	});

	it("updates wallet preferences", async () => {
		await manager.updateWalletPreferences({
			walletAddress: "addr1",
			notifications: true,
		});
		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining("wallets/addr1"),
			expect.objectContaining({ method: "PATCH" }),
		);
	});

	it("removes a wallet", async () => {
		await manager.removeWallet({ walletAddress: "addr1" });
		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining("wallets/addr1"),
			expect.objectContaining({ method: "DELETE" }),
		);
	});

	it("gets wallets", async () => {
		await manager.getWallets();
		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining("wallets"),
			expect.objectContaining({ method: "GET" }),
		);
	});
});
