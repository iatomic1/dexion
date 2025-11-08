import { type NotificationButton, NotifierClient } from "@dexion/notifier";
import { FRONTEND_URL, SOCIALS } from "@dexion/shared";
import { config } from "@/config";
import { logger } from "@/config/logger";
import type {
	INotifier,
	NotificationPayload,
} from "@/core/notifications/notifier";
import { getAlertHtmlMessage } from "@/core/notifications/templates/telegram";

export class TelegramNotifier implements INotifier {
	private notifier: NotifierClient;

	constructor() {
		this.notifier = new NotifierClient(config.TELEGRAM_BOT_TOKEN);
	}

	async send(payload: NotificationPayload): Promise<void> {
		const { alert, token, userProfile } = payload;

		if (!userProfile.telegram_id) {
			logger.warn(
				{ userId: alert.userId },
				"User has no telegram_id for notification",
			);
			return;
		}

		const message = getAlertHtmlMessage({ token, alert });
		const recipient = { id: userProfile.telegram_id };
		const buttons: NotificationButton[][] = [
			[
				{ text: "Join Community: 💬", url: SOCIALS.DISCORD },
				{ text: "DEXION: 🔥", url: `${FRONTEND_URL}/meme/${alert.ca}` },
			],
			[{ text: "Manage your alerts: 🔕", url: `${FRONTEND_URL}/alerts` }],
		];

		try {
			const result = await this.notifier.send("telegram", {
				message,
				recipient,
				buttons,
				parseMode: "HTML",
			});
			logger.info({ userId: alert.userId, result }, "✅ Telegram alert sent");
		} catch (err) {
			logger.error(err, "❌ Error sending telegram message");
			throw err;
		}
	}
}
