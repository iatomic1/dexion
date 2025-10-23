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

export const queues = {
	swapQueue,
	webhookQueue,
	emailQueue,
	telegramQueue,
};

export type QueueNames = keyof typeof queues;
