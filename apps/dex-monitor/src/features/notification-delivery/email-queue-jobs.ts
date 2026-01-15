import { Job, Worker } from "bullmq";
import { bullMqRedisConnection } from "@/config/connections";
import { logger } from "@/config/logger";
import type { NotificationJobData } from "@/core/queues";
import { emailQueue, emailQueueDlq } from "@/infrastructure/bullmq/queues";
import { EmailNotifier } from "@/infrastructure/notifiers/email";

const notifier = new EmailNotifier();

const processor = new Worker<NotificationJobData>(
	emailQueue.name,
	async (job: Job<NotificationJobData>) => {
		await notifier.send(job.data);
	},
	{
		connection: bullMqRedisConnection,
		removeOnComplete: { count: 1000 },
		removeOnFail: { count: 5000 },
	},
);

processor.on("failed", (job, err) => {
	if (job) {
		emailQueueDlq.add(job.name, job.data);
		logger.warn({ err, jobId: job.id }, `Moved job ${job.id} to email DLQ`);
	}
});

export default processor;
