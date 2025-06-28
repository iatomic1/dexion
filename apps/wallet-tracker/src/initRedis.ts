import Redis from "ioredis";
import { API_BASE_URL } from "./constants";

export const redis = new Redis(); // configure if needed

interface Wallet {
  address: string;
  watchers: {
    app: string | null; // base64 encoded array of strings
    telegram: string | null; // base64 encoded array of strings
  };
}

async function fetchWalletData(): Promise<{ data: Wallet[] }> {
  const res = await fetch(`${API_BASE_URL}wallets/all`);
  if (!res.ok) {
    throw new Error(`Failed to fetch wallet data: ${res.statusText}`);
  }
  return res.json();
}

function decodeBase64(encoded: string | null): string[] {
  if (!encoded) {
    return [];
  }
  try {
    const decodedString = Buffer.from(encoded, "base64").toString("utf-8");
    return JSON.parse(decodedString);
  } catch (e) {
    console.error("Failed to decode or parse base64 string:", encoded, e);
    return [];
  }
}

export async function initializeRedis() {
  console.log("Initializing Redis with wallet watcher data...");

  try {
    const { data: wallets } = await fetchWalletData();

    if (!wallets || wallets.length === 0) {
      console.log("No wallets to process.");
      return;
    }
    console.log(`Fetched ${wallets.length} wallets.`);

    const pipeline = redis.pipeline();

    for (const wallet of wallets) {
      const key = `wallet_watchers:${wallet.address}`;
      const appWatchers = decodeBase64(wallet.watchers.app);
      const telegramWatchers = decodeBase64(wallet.watchers.telegram);
      const watchers = [...appWatchers, ...telegramWatchers];

      pipeline.del(key); // Always clear previous watchers for the key
      if (watchers.length > 0) {
        pipeline.sadd(key, ...watchers);
      }
    }

    await pipeline.exec();
    console.log("Redis initialization complete.");
  } catch (error) {
    console.error("Error during Redis initialization:", error);
  }
}
