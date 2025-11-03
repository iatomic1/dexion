import { API_BASE_URL } from "@dexion/shared";
import { Job, Worker } from "bullmq";
import { config } from "@/config";
import { logger } from "@/config/logger";
import { bullMqRedisConnection } from "@/config/redis";
import { webhookQueue, webhookQueueDlq } from "@/queues";
import type { SendWebhookAlertJobData } from "@/queues/types";
import { decryptToken } from "@/utils/crypto";

async function updateWebhookStatus(userId: string, status: string) {
	try {
		const res = await fetch(`${API_BASE_URL}webhooks/status`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				"X-Internal-Secret": config.INTERNAL_SECRET,
			},
			body: JSON.stringify({ user_id: userId, status }),
		});

		if (!res.ok) {
			const text = await res.text();
			throw new Error(`Failed to update webhook status: ${res.status} ${text}`);
		}

		logger.info({ userId, status }, "Webhook status updated");
	} catch (err) {
		logger.error(err, "Failed to call UpdateWebhookStatus");
	}
}

const webhookWorker = new Worker(
	webhookQueue.name,
	async (job: Job<SendWebhookAlertJobData>) => {
		try {
			logger.info(job.data, "📩 Received in webhook worker:");

			const { alert, token, userProfile: user } = job.data;
			const webhook = user.webhook;

			if (!webhook?.webhookUrl || !webhook.enabled || !webhook.bearerToken) {
				logger.warn(
					{ userId: alert.userId },
					"Webhook disabled or missing URL, skipping",
				);
				return;
			}

			const decryptedToken = webhook.bearerToken
				? decryptToken(webhook.bearerToken, config.INTERNAL_SECRET)
				: null;
			const payload = {
				alert,
				token,
				timestamp: new Date().toISOString(),
			};

			const headers: Record<string, string> = {
				"Content-Type": "application/json",
			};

			if (webhook.bearerToken) {
				headers.Authorization = `Bearer ${decryptedToken}`;
			}

			const response = await fetch(webhook.webhookUrl, {
				method: "POST",
				headers,
				body: JSON.stringify(payload),
			});

			const text = await response.text();

			if (!response.ok) {
				throw new Error(
					`Webhook delivery failed with status ${response.status}: ${text}`,
				);
			}

			logger.info(
				{ userId: alert.userId, status: response.status },
				"✅ Webhook delivered successfully",
			);

			return { status: response.status, response: text };
		} catch (err) {
			logger.error(err, "❌ Error in webhook worker:");
			throw err;
		}
	},
	{
		connection: bullMqRedisConnection,
		removeOnComplete: { count: 1000 },
		removeOnFail: { count: 200 },
	},
);

webhookWorker.on("failed", async (job, err) => {
	if (job) {
		webhookQueueDlq.add(job.name, job.data);
		logger.warn({ err, jobId: job.id }, `Moved job ${job.id} to DLQ`);
		const { alert } = job.data as SendWebhookAlertJobData;
		await updateWebhookStatus(alert.userId, "interrupted");
	}
});

export default webhookWorker;
