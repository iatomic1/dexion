import Redis from "ioredis";
import { API_BASE_URL } from "./constants";

const redis = new Redis(); // configure if needed

interface Watcher {
  userId: string;
  // optionally: emoji, nickname, notifications etc.
}

interface Wallet {
  wallet_address: string;
  watchers: Watcher[];
}

async function fetchWalletData() {
  const res = await fetch(`${API_BASE_URL}wallets/all`);
  if (!res.ok) throw new Error("Failed to fetch wallet data");
  return res.json();
}

export async function initializeRedis() {
  console.log("Initializing Redis with wallet watcher data...");

  const res = await fetchWalletData();
  const wallets = res.data;
  console.log(res);

  const pipeline = redis.pipeline();

  for (const wallet of wallets) {
    const key = `wallet_watchers:${wallet.wallet_address}`;
    if (wallet.watchers.length > 0) {
      const userIds = wallet.watchers.map((w: Watcher) => w.userId);
      pipeline.del(key); // clear previous
      pipeline.sadd(key, ...userIds);
    }
  }

  await pipeline.exec();
  console.log("Redis initialization complete.");
}
