import { StacksApiSocketClient } from "@stacks/blockchain-api-client";
import { generateTransactionMessage } from "./parser";
import redis from "./redisClient";

const socketUrl = "https://api.mainnet.hiro.so";
const testnetUrl = "https://api.testnet.hiro.so";
export const sc = new StacksApiSocketClient({ url: socketUrl });

async function getWatchers(walletAddress: string): Promise<string[]> {
  const key = `wallet_watchers:${walletAddress}`;
  console.log(`Querying Redis for key: ${key}`);
  const watchers = await redis.smembers(key);
  console.log(
    `Found ${watchers.length} watchers for ${walletAddress}:`,
    watchers,
  );
  return watchers;
}

async function notifyPartyKit(roomId: string, data: any) {
  const partyUrl = `http://127.0.0.1:4002/party/${roomId}`;
  try {
    await fetch(partyUrl, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`Failed to notify PartyKit room ${roomId}:`, error);
  }
}

export const setupMempoolSubscription = () => {
  sc.subscribeMempool(async (mempoolTx) => {
    console.log(mempoolTx.sender_address);
    const watchers = await getWatchers(mempoolTx.sender_address);
    if (watchers.length > 0) {
      const structuredMessage = generateTransactionMessage(mempoolTx);
      if (!structuredMessage) return;

      const alert = {
        ...structuredMessage,
        txId: mempoolTx.tx_id,
      };

      const results = await Promise.allSettled(
        watchers.map((watcherId) => {
          // Check if watcherId can be converted to a number
          const numericId = Number(watcherId);
          const isNumeric =
            !isNaN(numericId) && isFinite(numericId) && watcherId.trim() !== "";

          if (isNumeric) {
            // Send Telegram message for numeric IDs
            // return sendTelegramMessage(numericId, alert);
          } else {
            // Send PartyKit notification for non-numeric IDs
            return notifyPartyKit(watcherId, alert);
          }
        }),
      );

      // Optional: Log any failures
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(
            `Failed to notify watcher ${watchers[index]}:`,
            result.reason,
          );
        }
      });
    }
  });
};
