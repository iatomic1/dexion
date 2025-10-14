import { Markup, Telegraf } from "telegraf";
import type { IChannelSender, Notification } from "../interfaces";

export class TelegramSender implements IChannelSender {
	private bot: Telegraf;
	private botToken: string | undefined;

	constructor(botToken?: string) {
		this.botToken = botToken || process.env.TELEGRAM_BOT_TOKEN;
		if (!this.botToken) {
			console.warn(
				"Telegram Bot Token not provided. TelegramSender will not be able to send messages.",
			);
			this.bot = new Telegraf("YOUR_FALLBACK_BOT_TOKEN_IF_ANY_OR_EMPTY_STRING");
		} else {
			this.bot = new Telegraf(this.botToken);
		}

		// Optional: Add error handling for the bot
		this.bot.catch((err, ctx) => {
			console.error(`Telegraf error for ${ctx.updateType}`, err);
		});
	}

	isReady(): boolean {
		return !!this.botToken;
	}

	async send(notification: Notification): Promise<void> {
		if (!this.isReady()) {
			console.warn(
				"TelegramSender is not ready (missing bot token). Cannot send message.",
			);
			return Promise.reject(new Error("Telegram Bot Token is not configured."));
		}

		if (!notification.recipient.id) {
			console.error("Recipient ID is missing for Telegram notification");
			return Promise.reject(new Error("Recipient ID is missing."));
		}

		try {
			const extra: any = {
				parse_mode: notification.parseMode,
				disable_web_page_preview: true,
			};
			if (notification.buttons) {
				extra.reply_markup = Markup.inlineKeyboard(
					notification.buttons,
				).reply_markup;
			}

			// The recipient.id for Telegram should be the chat_id
			const result = await this.bot.telegram.sendMessage(
				notification.recipient.id,
				notification.message,
				extra,
			);
			console.log(`Telegram message sent to ${notification.recipient.id}`);
			console.log(result);
		} catch (error) {
			console.error(
				`Failed to send Telegram message to ${notification.recipient.id}:`,
				error,
			);
			throw error;
		}
	}
}
