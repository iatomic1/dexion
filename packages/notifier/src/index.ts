import { PartyKitSender } from "./channels/partykit";
import { TelegramSender } from "./channels/telegram";
import type {
	IChannelSender,
	INotifier,
	Notification,
	NotificationChannel,
	NotificationRecipient,
} from "./interfaces";

export class NotifierClient implements INotifier {
	private telegramSender: IChannelSender;
	private partykitSender: IChannelSender;

	constructor(telegramBotToken?: string, partykitUrl?: string) {
		this.telegramSender = new TelegramSender(telegramBotToken);
		this.partykitSender = new PartyKitSender(partykitUrl);

		console.log("NotifierClient initialized with all channel senders");
	}

	async send(
		channel: NotificationChannel,
		notification: Notification,
	): Promise<void> {
		console.log(
			`Attempting to send notification via ${channel} to ${notification.recipient.id}`,
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
				return Promise.reject(
					new Error(`Unsupported channel: ${exhaustiveCheck}`),
				);
		}

		if (!sender.isReady()) {
			console.warn(
				`Sender for channel ${channel} is not ready. Skipping notification.`,
			);
			return Promise.reject(
				new Error(`Sender for channel ${channel} is not ready.`),
			);
		}

		try {
			await sender.send(notification);
			console.log(`Notification successfully routed via ${channel}.`);
		} catch (error) {
			console.error(`Error sending notification via ${channel}:`, error);
			throw error;
		}
	}

	async destroyAll(): Promise<void> {
		console.log("Destroying all notifier clients...");
		if (
			this.partykitSender &&
			typeof (this.partykitSender as any).destroy === "function"
		) {
			(this.partykitSender as any).destroy();
		}
		// Add similar destroy calls for TelegramSender if it implements a destroy method
		console.log("All notifier clients shutdown sequence initiated.");
	}
}

export * from "./interfaces";
