import {
	getFakFunTokenMetadata,
	getTokenMetadata,
} from "@dexion/tokens/services";
import { Job, Worker } from "bullmq";
import { bullMqRedisConnection } from "@/config/connections";
import { logger } from "@/config/logger";
import { shouldTrigger } from "@/core/alerts/alert";
import { AlertStore } from "@/core/alerts/alert-store";
import type { SwapEventJobData } from "@/core/queues";
import { UserStore } from "@/core/users/user-store";
import { hasChannel } from "@/core/users/user-utils";
import {
	emailQueue,
	swapQueue,
	swapQueueDlq,
	telegramQueue,
	webhookQueue,
} from "@/infrastructure/bullmq/queues";
import { updateAlertStatus } from "@/infrastructure/http/internal-api";
import { ALERT_CHANNELS } from "@/shared/constants";

const alertStore = new AlertStore();
const userStore = new UserStore();

const queueMap = {
	email: emailQueue,
	telegram: telegramQueue,
	webhook: webhookQueue,
};

const processor = new Worker<SwapEventJobData>(
	swapQueue.name,
	async (job: Job<SwapEventJobData>) => {
		const { assetContracts, platform } = job.data;
		const { id: jobId } = job;
		logger.info({ jobId, assetContracts }, "Processing swap event job");

		for (const ca of assetContracts) {
			try {
				const alerts = await alertStore.getActiveAlertsByContract(ca);
				if (!alerts.length) continue;

				let token;
				if (platform === "velar" || platform === "bitflow") {
					token = await getTokenMetadata(ca);
				} else if (platform === "fakfun") {
					token = await getFakFunTokenMetadata(ca);
				}

				if (!token) {
					logger.warn({ jobId, ca }, "Token metadata not found");
					continue;
				}

				for (const alert of alerts) {
					if (shouldTrigger(alert, token)) {
						const userProfile = await userStore.getUserProfile(alert.userId);
						if (!userProfile) {
							logger.warn(
								{ jobId, userId: alert.userId },
								"User profile not found",
							);
							continue;
						}

						const activeChannels = alert.channels
							.map((cid) => ALERT_CHANNELS.find((ch) => ch.id === cid)?.name)
							.filter((name): name is keyof typeof queueMap => !!name)
							.filter((name) => hasChannel(userProfile, name));

						for (const channelName of activeChannels) {
							const queue = queueMap[channelName];
							await queue.add("send-notification", {
								type: "token",
								alert,
								token,
								userProfile,
								triggeredAt: new Date().toISOString(),
							});
						}

						if (!alert.repeatable) {
							await updateAlertStatus({
								id: alert.id,
								status: "completed",
								userId: alert.userId,
							});
						}
					}
				}
			} catch (error) {
				logger.error(
					{ jobId, ca, err: error },
					"Failed processing contract for alerts",
				);
			}
		}
	},
	{
		connection: bullMqRedisConnection,
		removeOnComplete: { count: 1000 },
		removeOnFail: { count: 5000 },
	},
);

processor.on("failed", (job, err) => {
	if (job) {
		swapQueueDlq.add(job.name, job.data);
		logger.warn({ err, jobId: job.id }, `Moved job ${job.id} to swap DLQ`);
	}
});

export default processor;
