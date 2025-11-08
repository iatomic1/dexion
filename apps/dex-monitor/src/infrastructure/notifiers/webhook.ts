import { config } from "@/config";
import { logger } from "@/config/logger";
import type {
	INotifier,
	NotificationPayload,
} from "@/core/notifications/notifier";
import { decryptToken } from "@/shared/utils/crypto";

export class WebhookNotifier implements INotifier {
	async send(payload: NotificationPayload): Promise<void> {
		const { alert, token, userProfile, triggeredAt } = payload;
		const webhook = userProfile.webhook;

		if (!webhook?.webhookUrl) {
			logger.warn(
				{ userId: alert.userId },
				"User has no webhook URL for notification",
			);
			return;
		}

		if (!webhook.enabled || webhook.status === "interrupted") {
			logger.warn(
				{ userId: alert.userId, status: webhook.status },
				"Webhook is disabled or interrupted, skipping",
			);
			return;
		}

		const decryptedToken = webhook.bearerToken
			? decryptToken(webhook.bearerToken, config.INTERNAL_SECRET)
			: null;

		const webhookPayload = {
			alert,
			token,
			timestamp: triggeredAt,
		};

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};
		if (decryptedToken) {
			headers.Authorization = `Bearer ${decryptedToken}`;
		}

		try {
			const response = await fetch(webhook.webhookUrl, {
				method: "POST",
				headers,
				body: JSON.stringify(webhookPayload),
			});

			if (!response.ok) {
				const text = await response.text();
				throw new Error(
					`Webhook delivery failed with status ${response.status}: ${text}`,
				);
			}

			logger.info(
				{ userId: alert.userId, status: response.status },
				"✅ Webhook delivered successfully",
			);
		} catch (err) {
			logger.error(err, "❌ Error sending webhook");
			// TODO: Add logic to update webhook status to 'interrupted'
			throw err;
		}
	}
}
