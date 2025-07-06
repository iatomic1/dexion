import redis from "../services/redisClient";

export class Wallet {
	static async getWatchers(address: string): Promise<any[]> {
		const key = `wallet_watchers:${address}`;
		const watchers = await redis.hgetall(key);
		return Object.entries(watchers).map(([id, data]) => ({
			id,
			...JSON.parse(data),
		}));
	}
}
