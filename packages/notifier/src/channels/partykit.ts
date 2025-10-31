import { createLogger } from "@dexion/logger";
import type { IChannelSender, Notification } from "../interfaces";

const logger = createLogger({ service: "notifier-partykit" });

export class PartyKitSender implements IChannelSender {
	private partyUrl: string;

	constructor(partyUrl?: string) {
		this.partyUrl = partyUrl || "http://127.0.0.1:1999/party";
	}

	isReady(): boolean {
		return !!this.partyUrl;
	}

	async send(notification: Notification): Promise<void> {
		if (!this.isReady()) {
			const errorMessage =
				"PartyKitSender is not ready (partyUrl not configured).";
			logger.warn(errorMessage + " Cannot send message.");
			return Promise.reject(new Error(errorMessage));
		}

		if (!notification.recipient.id) {
			const errorMessage =
				"Recipient ID (room ID) is missing for PartyKit notification";
			logger.error(errorMessage);
			return Promise.reject(new Error(errorMessage));
		}

		const fullUrl = `${this.partyUrl}/parties/notifications/${notification.recipient.id}`;

		try {
			await fetch(fullUrl, {
				method: "POST",
				body: JSON.stringify(notification.message),
				headers: { "Content-Type": "application/json" },
			});
			logger.info(`PartyKit message sent to room ${notification.recipient.id}`);
		} catch (error) {
			logger.error(
				error,
				`Failed to send PartyKit message to room ${notification.recipient.id}:`,
			);
			throw error;
		}
	}

	destroy(): void {
		logger.info("PartyKitSender destroy called - no specific action taken.");
	}
}
