import { logger } from "@/config/logger";
import hodlmmProcessor from "@/features/alert-processing/hodlmm-queue-jobs";
import { startSwapConsumer } from "@/features/alert-processing/swap-consumer";
import { startAlertTriggeredConsumer } from "@/features/notification-delivery/alert-triggered-consumer";
import emailProcessor from "@/features/notification-delivery/email-queue-jobs";
import telegramProcessor from "@/features/notification-delivery/telegram-queue-jobs";
import webhookProcessor from "@/features/notification-delivery/webhook-queue-jobs";
import { hodlmmQueue } from "@/infrastructure/bullmq/queues";
import { startServer } from "./server";

logger.info("🚀 Starting Dex-Monitor");
await startSwapConsumer();
await startAlertTriggeredConsumer();

// Start job processors
if (!hodlmmProcessor.isRunning()) hodlmmProcessor.run();
if (!emailProcessor.isRunning()) emailProcessor.run();
if (!telegramProcessor.isRunning()) telegramProcessor.run();
if (!webhookProcessor.isRunning()) webhookProcessor.run();

// Schedule HODLMM check every 5 minutes
// We wrap this in an async function or just call it, but top-level await is supported in Bun
await hodlmmQueue.add(
	"check-hodlmm-positions",
	{},
	{
		repeat: {
			pattern: "*/5 * * * *",
		},
		jobId: "check-hodlmm-positions-cron",
	},
);
startServer(logger);
