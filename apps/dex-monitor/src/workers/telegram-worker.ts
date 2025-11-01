import { type NotificationButton, NotifierClient } from "@dexion/notifier";
import { FRONTEND_URL, SOCIALS } from "@dexion/shared";
import { Job, Worker } from "bullmq";
import { config } from "@/config";
import { logger } from "@/config/logger";
import { bullMqRedisConnection } from "@/config/redis";
import { getAlertHtmlMessage } from "@/lib/messages/telegram";
import { telegramQueue, telegramQueueDlq } from "@/queues";
import type { SendTelegramAlertJobData } from "@/queues/types";

const telegramWorker = new Worker(
	telegramQueue.name,
	async (job: Job<SendTelegramAlertJobData>) => {
		try {
			logger.info(job.data, "📩 Received in telegram worker");

			const { alert, token, userProfile: user } = job.data;
			const notifier = new NotifierClient(config.TELEGRAM_BOT_TOKEN);

			const message = getAlertHtmlMessage({ token, alert });
			const recipient = { id: user.telegram_id };
			const buttons: NotificationButton[][] = [];
			buttons.push(
				[
					{
						text: " Join Community: 💬 ",
						url: SOCIALS.DISCORD,
					},
					{
						text: " DEXION: 🔥 ",
						url: `${FRONTEND_URL}/meme/${alert.ca}`,
					},
				],
				[
					{
						text: " Manage your alerts: 🔕",
						url: `${FRONTEND_URL}/alerts`,
					},
				],
			);

			const result = await notifier.send("telegram", {
				message,
				recipient,
				buttons,
				parseMode: "HTML",
			});

			logger.info({ userId: alert.userId, result }, "✅ Telegram alert sent");
			return result;
		} catch (err) {
			logger.error(err, "❌ Error in telegram worker");
			throw err;
		}
	},
	{
		connection: bullMqRedisConnection,
		removeOnComplete: { count: 1000 },
		removeOnFail: { count: 5000 },
	},
);

telegramWorker.on("failed", (job, err) => {
	if (job) {
		telegramQueueDlq.add(job.name, job.data);
		logger.warn({ err, jobId: job.id }, `Moved job ${job.id} to DLQ`);
	}
});

export default telegramWorker;
