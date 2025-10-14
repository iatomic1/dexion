import { beforeEach, describe, expect, it, vi } from "vitest";
import { WatchlistManager } from "@/watchlists";

vi.mock("./schema", () => ({
	addWatchlistSchema: { parse: (d: any) => d },
	deleteWatchlistSchema: { parse: (d: any) => d },
}));

describe("WatchlistManager", () => {
	const manager = new WatchlistManager("user123", "token456", false);

	beforeEach(() => {
		(fetch as any).mockResolvedValue({
			headers: { get: () => "application/json" },
			json: async () => ({ data: "ok" }),
		});
	});

	it("gets user watchlist", async () => {
		await manager.getUserWatchlist();
		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining("watchlist"),
			expect.objectContaining({ method: "GET" }),
		);
	});

	it("adds to watchlist", async () => {
		await manager.addToWatchlist({
			ca: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token",
		});
		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining("watchlist"),
			expect.objectContaining({ method: "POST" }),
		);
	});

	it("deletes watchlist", async () => {
		await manager.deleteWatchlist({ id: "watch1" });
		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining("watchlist/watch1"),
			expect.objectContaining({ method: "DELETE" }),
		);
	});
});
