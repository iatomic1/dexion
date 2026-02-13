import { type NotificationButton, NotifierClient } from "@dexion/notifier";
import { FRONTEND_URL, SOCIALS } from "@dexion/shared";
import { config } from "@/config";
import { logger } from "@/config/logger";
import { getAlertHtmlMessage } from "@/core/notifications/templates/telegram";
import { getHodlmmAlertHtmlMessage } from "@/core/notifications/templates/telegram-hodlmm";
import type { INotifier, NotificationJobData } from "@/core/queues";

export class TelegramNotifier implements INotifier {
	private notifier: NotifierClient;

	constructor() {
		this.notifier = new NotifierClient(config.TELEGRAM_BOT_TOKEN);
	}

	async send(payload: NotificationJobData): Promise<void> {
		const { userProfile } = payload;

		if (!userProfile.telegram_id) {
			logger.warn("User has no telegram_id for notification");
			return;
		}

		let message = "";
		let buttons: NotificationButton[][] = [];

		if (payload.type === "token") {
			const { alert, token } = payload;
			message = getAlertHtmlMessage({ token, alert });
			buttons = [
				[
					{ text: "Join Community: 💬", url: SOCIALS.DISCORD },
					{ text: "DEXION: 🔥", url: `${FRONTEND_URL}/meme/${alert.ca}` },
				],
				[{ text: "Manage your alerts: 🔕", url: `${FRONTEND_URL}/alerts` }],
			];
		} else if (payload.type === "hodlmm") {
			message = getHodlmmAlertHtmlMessage(payload);
			buttons = [
				[{ text: "Manage Position 🏦", url: "https://hodlmm.bitflow.finance" }],
				[{ text: "Alert Settings ⚙️", url: `${FRONTEND_URL}/alerts/hodlmm` }],
			];
		}

		const recipient = { id: userProfile.telegram_id };

		try {
			const result = await this.notifier.send("telegram", {
				message,
				recipient,
				buttons,
				parseMode: "HTML",
			});
			logger.info({ result }, "✅ Telegram alert sent");
		} catch (err) {
			logger.error(err, "❌ Error sending telegram message");
			throw err;
		}
	}
}
