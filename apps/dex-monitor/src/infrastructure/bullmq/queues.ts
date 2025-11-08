import { Queue } from "bullmq";
import { bullMqRedisConnection } from "@/config/connections";
import type { NotificationJobData, SwapEventJobData } from "@/core/queues";

// Main swap processing queue
export const swapQueue = new Queue<SwapEventJobData>("swap-events-queue", {
	connection: bullMqRedisConnection,
});
export const swapQueueDlq = new Queue<SwapEventJobData>(
	"swap-events-queue-dlq",
	{ connection: bullMqRedisConnection },
);

// Notification delivery queues
export const webhookQueue = new Queue<NotificationJobData>("webhook-queue", {
	connection: bullMqRedisConnection,
});
export const webhookQueueDlq = new Queue("webhook-queue-dlq", {
	connection: bullMqRedisConnection,
});

export const emailQueue = new Queue<NotificationJobData>("email-queue", {
	connection: bullMqRedisConnection,
});
export const emailQueueDlq = new Queue<NotificationJobData>("email-queue-dlq", {
	connection: bullMqRedisConnection,
});

export const telegramQueue = new Queue<NotificationJobData>("telegram-queue", {
	connection: bullMqRedisConnection,
});
export const telegramQueueDlq = new Queue("telegram-queue-dlq", {
	connection: bullMqRedisConnection,
});
