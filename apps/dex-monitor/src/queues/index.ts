import { Queue } from "bullmq";
import { bullMqRedisConnection } from "@/config/redis";
import type { SendEmailAlertJobData, SwapEventJobData } from "@/queues/types";

export const swapQueue = new Queue<SwapEventJobData>("swap-events-queue", {
	connection: bullMqRedisConnection,
});

export const webhookQueue = new Queue("webhook-queue", {
	connection: bullMqRedisConnection,
});

export const emailQueue = new Queue<SendEmailAlertJobData>("email-queue", {
	connection: bullMqRedisConnection,
});

export const telegramQueue = new Queue("telegram-queue", {
	connection: bullMqRedisConnection,
});

export const swapQueueDlq = new Queue<SwapEventJobData>("swap-events-queue.dlq", {
	connection: bullMqRedisConnection,
});

export const webhookQueueDlq = new Queue("webhook-queue.dlq", {
	connection: bullMqRedisConnection,
});

export const emailQueueDlq = new Queue<SendEmailAlertJobData>("email-queue.dlq", {
	connection: bullMqRedisConnection,
});

export const telegramQueueDlq = new Queue("telegram-queue.dlq", {
	connection: bullMqRedisConnection,
});

export const queues = {
	swapQueue,
	webhookQueue,
	emailQueue,
	telegramQueue,
	swapQueueDlq,
	webhookQueueDlq,
	emailQueueDlq,
	telegramQueueDlq,
};

export type QueueNames = keyof typeof queues;
