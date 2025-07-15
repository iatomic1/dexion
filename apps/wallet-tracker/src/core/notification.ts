import { NotificationButton, NotifierClient } from "@repo/notifier";
import { generateTelegramMessage } from "./telegram-messages";

export class Notification {
	private notifier: NotifierClient;

	constructor() {
		this.notifier = new NotifierClient(process.env.TELEGRAM_BOT_TOKEN);
	}

	async send(watcher: any, structuredMessage: any) {
		const { preference, nickname } = watcher;
		const [watcherType, id] = watcher.id.split(":");

		if (watcherType === "telegram") {
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
	}
}
