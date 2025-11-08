import { Job, Worker } from "bullmq";
import { bullMqRedisConnection } from "@/config/connections";
import { logger } from "@/config/logger";
import type { NotificationJobData as NotificationPayload } from "@/core/queues";
import { webhookQueue, webhookQueueDlq } from "@/infrastructure/bullmq/queues";
import { WebhookNotifier } from "@/infrastructure/notifiers/webhook";

// import { updateWebhookStatus } from "@/lib/api"; // To be moved

const notifier = new WebhookNotifier();

const processor = new Worker<NotificationPayload>(
	webhookQueue.name,
	async (job: Job<NotificationPayload>) => {
		await notifier.send(job.data);
	},
	{
		connection: bullMqRedisConnection,
		removeOnComplete: { count: 1000 },
		removeOnFail: { count: 200 },
	},
);

processor.on("failed", async (job, err) => {
	if (job) {
		webhookQueueDlq.add(job.name, job.data);
		logger.warn({ err, jobId: job.id }, `Moved job ${job.id} to webhook DLQ`);
		// const { alert } = job.data;
		// await updateWebhookStatus(alert.userId, "interrupted");
	}
});

export default processor;
