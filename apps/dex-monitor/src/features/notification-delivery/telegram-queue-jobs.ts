import { Job, Worker } from "bullmq";
import { bullMqRedisConnection } from "@/config/connections";
import { logger } from "@/config/logger";
import type { NotificationJobData } from "@/core/queues";
import {
	telegramQueue,
	telegramQueueDlq,
} from "@/infrastructure/bullmq/queues";
import { TelegramNotifier } from "@/infrastructure/notifiers/telegram";

const notifier = new TelegramNotifier();

const processor = new Worker<NotificationJobData>(
	telegramQueue.name,
	async (job: Job<NotificationJobData>) => {
		await notifier.send(job.data);
	},
	{
		connection: bullMqRedisConnection,
		removeOnComplete: { count: 1000 },
		removeOnFail: { count: 5000 },
		limiter: {
			max: 25,
			duration: 1000,
		},
	},
);

processor.on("failed", (job, err) => {
	if (job) {
		telegramQueueDlq.add(job.name, job.data);
		logger.warn({ err, jobId: job.id }, `Moved job ${job.id} to telegram DLQ`);
	}
});

export default processor;
