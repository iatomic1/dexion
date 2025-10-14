export interface NotificationRecipient {
	id: string; // e.g., Discord user ID, Telegram chat ID, phone number
}

export interface NotificationButton {
	text: string;
	url: string;
}

export interface Notification {
	message: any;
	recipient: NotificationRecipient;
	parseMode?: "MarkdownV2" | "HTML";
	buttons?: NotificationButton[][];
}

export type NotificationChannel = "partykit" | "telegram";

export interface INotifier {
	send(channel: NotificationChannel, notification: Notification): Promise<void>;
}

export interface IChannelSender {
	send(notification: Notification): Promise<void>;
	isReady(): boolean;
	destroy?: () => void;
}
