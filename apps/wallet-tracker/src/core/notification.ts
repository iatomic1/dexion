import { type NotificationButton, NotifierClient } from "@repo/notifier";
import { PARTKIT_HOST } from "@repo/shared-constants/constants.ts";
import { type ParsedTransaction, TransactionParser } from "@repo/tokens/parser";
import { generateTelegramMessage } from "./telegram-messages";
import { Transaction } from "./transaction";

interface WalletNotification extends ParsedTransaction {
	type: "wallet_activity";
	action: "send_notification";
	wallet: {
		userId: string;
		nickname: string;
		address: string;
	};
}

export class Notification {
	private notifier: NotifierClient;
	private parser: TransactionParser;

	constructor() {
		this.notifier = new NotifierClient(
			process.env.TELEGRAM_BOT_TOKEN,
			"https://" + PARTKIT_HOST,
		);
		this.parser = new TransactionParser();
	}

	async send(watcher: any, address: string, tx: any) {
		const { preference, nickname } = watcher;
		const [watcherType, id] = watcher.id.split(":");

		if (watcherType === "telegram") {
			const transaction = new Transaction(tx);
			const structuredMessage = transaction.structuredMessage;

			const message = await generateTelegramMessage(
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
			return this.notifier.send("telegram", {
				message,
				recipient: { id },
				buttons,
				parseMode: "HTML",
			});
		}
		if (watcherType === "app") {
			const parsedTx = this.parser.parse(tx);
			return this.notifier.send("partykit", {
				recipient: { id },
				message: {
					type: "wallet_activity",
					action: "send_notification",
					wallet: {
						userId: id,
						nickname,
						address: address,
					},
					tx: {
						...parsedTx,
					},
				},
			});
		}
	}
}
