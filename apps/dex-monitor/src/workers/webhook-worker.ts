import { Job, Worker } from "bullmq";
import { logger } from "@/config/logger";
import { bullMqRedisConnection } from "@/config/redis";
import { webhookQueue, webhookQueueDlq } from "@/queues";
import type { SendWebhookAlertJobData } from "@/queues/types";

const webhookWorker = new Worker(
	webhookQueue.name,
	async (job: Job<SendWebhookAlertJobData>) => {
		try {
			logger.info(job.data, "📩 Received in webhook worker:");

			const { alert, token, userProfile: user } = job.data;
			const webhook = user.webhook;

			if (!webhook?.webhookUrl || !webhook.enabled) {
				logger.warn(
					{ userId: alert.userId },
					"Webhook disabled or missing URL, skipping",
				);
				return;
			}

			const payload = {
				alert,
				token,
				timestamp: new Date().toISOString(),
			};

			const headers: Record<string, string> = {
				"Content-Type": "application/json",
			};

			if (webhook.bearerToken) {
				headers.Authorization = `Bearer ${webhook.bearerToken}`;
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

webhookWorker.on("failed", (job, err) => {
	if (job) {
		webhookQueueDlq.add(job.name, job.data);
		logger.warn({ err, jobId: job.id }, `Moved job ${job.id} to DLQ`);
	}
});

export default webhookWorker;
