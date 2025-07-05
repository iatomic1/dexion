import { type NotificationButton, NotifierClient } from "@repo/notifier";
import { StacksApiSocketClient } from "@stacks/blockchain-api-client";
import { generateTransactionMessage } from "./parser";
import redis from "./redisClient";
import { generateTelegramMessage } from "./telegram-messages";

const socketUrl = "https://api.mainnet.hiro.so";
const testnetUrl = "https://api.testnet.hiro.so";
export const sc = new StacksApiSocketClient({ url: socketUrl });

const notifier = new NotifierClient(process.env.TELEGRAM_BOT_TOKEN);

async function getWatchers(
	walletAddress: string,
): Promise<Record<string, string>> {
	const key = `wallet_watchers:${walletAddress}`;
	// console.log(`Querying Redis for key: ${key}`);
	const watchers = await redis.hgetall(key);
	// console.log(
	//   `Found ${Object.keys(watchers).length} watchers for ${walletAddress}:`,
	//   watchers,
	// );
	return watchers;
}

export const setupMempoolSubscription = async () => {
	sc.subscribeMempool(async (mempoolTx) => {
		// console.log(mempoolTx.sender_address);
		const watchers = await getWatchers(mempoolTx.sender_address);
		if (Object.keys(watchers).length > 0) {
			console.log("yes");
			const structuredMessage = generateTransactionMessage(mempoolTx);
			console.log(structuredMessage);
			if (!structuredMessage) return;

			const alert = {
				...structuredMessage,
				txId: mempoolTx.tx_id,
			};

			const results = await Promise.allSettled(
				Object.entries(watchers).map(([watcherId, watcherData]) => {
					const { preference, nickname } = JSON.parse(watcherData);
					// if (preference === "mempool") {
					const [watcherType, id] = watcherId.split(":");
					if (watcherType === "telegram") {
						const message = generateTelegramMessage(
							structuredMessage,
							nickname,
						);
						const buttons: NotificationButton[][] = [];
						if (structuredMessage.action === "Swap") {
							buttons.push([
								{
									text: "Trade on Dexion",
									url: `https://dexion.io/swap/${structuredMessage.details.sent.contractId}/${structuredMessage.details.received.contractId}`,
								},
								{
									text: "View on STXWatch",
									url: `https://stxwatch.com/txid/${structuredMessage.txId}`,
								},
							]);
						}
						return notifier.send("telegram", {
							message,
							recipient: { id },
							buttons,
							parseMode: "HTML",
						});
					}
					// else {
					//   return notifier.send("partykit", {
					//     message: alert,
					//     recipient: { id },
					//   });
					// }
					// }
				}),
			);

			// Optional: Log any failures
			results.forEach((result, index) => {
				if (result.status === "rejected") {
					console.error(
						`Failed to notify watcher ${Object.keys(watchers)[index]}:`,
						result.reason,
					);
				}
			});
		}
	});
};
