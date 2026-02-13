import { config } from "@/config";
import { logger } from "@/config/logger";
import type { INotifier, NotificationJobData } from "@/core/queues";
import { decryptToken } from "@/shared/utils/crypto";

export class WebhookNotifier implements INotifier {
	async send(payload: NotificationJobData): Promise<void> {
		const { userProfile, triggeredAt } = payload;
		const webhook = userProfile.webhook;

		if (!webhook?.webhookUrl) {
			logger.warn("User has no webhook URL for notification");
			return;
		}

		if (!webhook.enabled || webhook.status === "interrupted") {
			logger.warn(
				{ status: webhook.status },
				"Webhook is disabled or interrupted, skipping",
			);
			return;
		}

		const decryptedToken = webhook.bearerToken
			? decryptToken(webhook.bearerToken, config.INTERNAL_SECRET)
			: null;

		let webhookPayload: any = {
			timestamp: triggeredAt,
			type: payload.type,
		};

		if (payload.type === "token") {
			webhookPayload = {
				...webhookPayload,
				alert: payload.alert,
				token: payload.token,
			};
		} else if (payload.type === "hodlmm") {
			webhookPayload = {
				...webhookPayload,
				alert: payload.alert,
				currentStatus: payload.currentStatus,
				positionValue: payload.positionValue,
			};
		}

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
				{ status: response.status },
				"✅ Webhook delivered successfully",
			);
		} catch (err) {
			logger.error(err, "❌ Error sending webhook");
			throw err;
		}
	}
}
