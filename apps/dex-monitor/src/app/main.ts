import { logger } from "@/config/logger";
import alertProcessor from "@/features/alert-processing/swap-queue-jobs";
import emailProcessor from "@/features/notification-delivery/email-queue-jobs";
import telegramProcessor from "@/features/notification-delivery/telegram-queue-jobs";
import webhookProcessor from "@/features/notification-delivery/webhook-queue-jobs";
import { startServer } from "./server";

logger.info("🚀 Starting Dex-Monitor");

// Start job processors
if (!alertProcessor.isRunning()) alertProcessor.run();
if (!emailProcessor.isRunning()) emailProcessor.run();
if (!telegramProcessor.isRunning()) telegramProcessor.run();
if (!webhookProcessor.isRunning()) webhookProcessor.run();

startServer(logger);
