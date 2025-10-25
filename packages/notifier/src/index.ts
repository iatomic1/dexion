import { createLogger } from "@repo/logger";
import { PartyKitSender } from "./channels/partykit";
import { TelegramSender } from "./channels/telegram";
import type {
	IChannelSender,
	INotifier,
	Notification,
	NotificationChannel,
	NotificationRecipient,
} from "./interfaces";

const logger = createLogger({ service: "notifier" });

export class NotifierClient implements INotifier {
	private telegramSender: IChannelSender;
	private partykitSender: IChannelSender;

	constructor(telegramBotToken?: string, partykitUrl?: string) {
		this.telegramSender = new TelegramSender(telegramBotToken);
		this.partykitSender = new PartyKitSender(partykitUrl);

		logger.info("NotifierClient initialized with all channel senders");
	}

	async send(
		channel: NotificationChannel,
		notification: Notification,
	): Promise<void> {
		logger.info(
			{ channel, recipient: notification.recipient.id },
			"Attempting to send notification",
		);

		let sender: IChannelSender;

		switch (channel) {
			case "partykit":
				sender = this.partykitSender;
				break;
			case "telegram":
				sender = this.telegramSender;
				break;
			default:
				const exhaustiveCheck: never = channel;
				const err = new Error(`Unsupported channel: ${exhaustiveCheck}`);
				logger.error(err);
				return Promise.reject(err);
		}

		if (!sender.isReady()) {
			const err = new Error(`Sender for channel ${channel} is not ready.`);
			logger.warn(err, "Skipping notification");
			return Promise.reject(err);
		}

		try {
			await sender.send(notification);
			logger.info({ channel }, `Notification successfully routed via ${channel}.`);
		} catch (error) {
			logger.error(error, `Error sending notification via ${channel}:`);
			throw error;
		}
	}

	async destroyAll(): Promise<void> {
		logger.info("Destroying all notifier clients...");
		if (
			this.partykitSender &&
			typeof (this.partykitSender as any).destroy === "function"
		) {
			(this.partykitSender as any).destroy();
		}
		// Add similar destroy calls for TelegramSender if it implements a destroy method
		logger.info("All notifier clients shutdown sequence initiated.");
	}
}

export * from "./interfaces";
