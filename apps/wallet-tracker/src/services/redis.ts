import Redis from "ioredis";
import { API_BASE_URL } from "../common/constants";

interface Watcher {
	user_id?: string;
	chat_id?: string;
	nickname: string;
	preference: string | boolean;
}

interface Wallet {
	address: string;
	watchers: {
		app: string | null; // base64 encoded array of Watcher objects
		telegram: string | null; // base64 encoded array of Watcher objects
	};
}

export class RedisService {
	private redis: Redis;

	constructor() {
		this.redis = new Redis();
	}

	private async fetchWalletData(): Promise<{ data: Wallet[] }> {
		const res = await fetch(`${API_BASE_URL}wallets/all`);
		if (!res.ok) {
			throw new Error(`Failed to fetch wallet data: ${res.statusText}`);
		}
		return res.json();
	}

	private decodeWatchers(encoded: string | null): Watcher[] {
		if (!encoded) {
			return [];
		}
		try {
			const decoded = Buffer.from(encoded, "base64").toString("utf-8");
			return JSON.parse(decoded);
		} catch (e) {
			console.error("Failed to decode or parse watcher string:", encoded, e);
			return [];
		}
	}

	public async initialize() {
		console.log("Initializing Redis with wallet watcher data...");

		try {
			const { data: wallets } = await this.fetchWalletData();

			if (!wallets || wallets.length === 0) {
				console.log("No wallets to process.");
				return;
			}
			console.log(`Fetched ${wallets.length} wallets.`);

			const pipeline = this.redis.pipeline();

			for (const wallet of wallets) {
				const key = `wallet_watchers:${wallet.address}`;
				pipeline.del(key); // Always clear previous watchers for the key

				const appWatchers = this.decodeWatchers(wallet.watchers.app);
				const telegramWatchers = this.decodeWatchers(wallet.watchers.telegram);

				const allWatchers = [...appWatchers, ...telegramWatchers];

				if (allWatchers.length > 0) {
					const watcherData: Record<string, string> = {};
					for (const watcher of allWatchers) {
						const id = watcher.user_id
							? `app:${watcher.user_id}`
							: `telegram:${watcher.chat_id}`;
						watcherData[id] = JSON.stringify({
							nickname: watcher.nickname,
							preference: watcher.preference,
						});
					}
					pipeline.hset(key, watcherData);
				}
			}

			await pipeline.exec();
			console.log("Redis initialization complete.");
		} catch (error) {
			console.error("Error during Redis initialization:", error);
		}
	}
}
