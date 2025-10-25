import { Job, Queue, Worker } from "bullmq";
import {
	emailQueue,
	swapQueue,
	swapQueueDlq,
	telegramQueue,
	webhookQueue,
} from "@/queues";
import { getActiveAlertsByCa } from "@/lib/redis/alerts";
import type { SwapEventJobData } from "@/queues/types";
import { getTokenMetadata } from "@repo/tokens/services";
import { bullMqRedisConnection } from "@/config/redis";
import { getCachedUserProfile } from "@/lib/redis/user-profile";
import { ALERT_CHANNELS } from "@/lib/constants";
import { evaluateAlert, getMetricValue, hasChannel } from "@/utils/swap-events";
import { logger } from "@/config/logger";

export type Alert = Awaited<ReturnType<typeof getActiveAlertsByCa>>[number];

const queueMap: Record<string, Queue> = {
	email: emailQueue,
	telegram: telegramQueue,
	// webapp: webappQueue,
	webhook: webhookQueue,
};

const swapEventsWorker = new Worker(
	swapQueue.name,
	async (job: Job<SwapEventJobData>) => {
		const { assetContracts } = job.data;
		await Promise.all(
			assetContracts.map(async (ca) => {
				try {
					const alerts = await getActiveAlertsByCa(ca);
					if (!alerts?.length) return;

					const token = await getTokenMetadata(ca);
					if (!token) return;

					await Promise.all(
						alerts.map(async (alert) => {
							const shouldTrigger = evaluateAlert(alert, token);
							if (!shouldTrigger) return;

							const userProfile = await getCachedUserProfile(alert.userId);

							logger.info(
								{ alert, currentValue: getMetricValue(alert.metric, token) },
								`Alert triggered for user ${alert.userId}`,
							);

							const activeChannels = alert.channels
								.map(
									(cid: string) =>
										ALERT_CHANNELS.find((ch) => ch.id === cid)?.name,
								)
								.filter(Boolean)
								.filter((chName) => hasChannel(userProfile, chName));

							await Promise.all(
								activeChannels.map(async (chName) => {
									const queue = queueMap[chName as keyof typeof queueMap];
									if (!queue) return;

									await queue.add(
										"send-alert",
										{
											channel: chName,
											userProfile,
											alert,
											token,
											triggeredAt: new Date().toISOString(),
										},
										{
											attempts: 3,
											backoff: { type: "exponential", delay: 2000 },
										},
									);
								}),
							);

							if (!alert.repeatable) {
								// Mark as completed here | Delete from cache
							}
						}),
					);
				} catch (error) {
					logger.error(error, `Failed processing alerts for CA ${ca}`);
					throw error; // Propagate error to fail the job
				}
			}),
		);
		return;
	},
	{
		connection: bullMqRedisConnection,
		removeOnComplete: { count: 1000 },
		removeOnFail: { count: 5000 },
	},
);

swapEventsWorker.on("failed", (job, err) => {
	if (job) {
		swapQueueDlq.add(job.name, job.data);
		logger.warn({ err, jobId: job.id }, `Moved job ${job.id} to DLQ`);
	}
});

export default swapEventsWorker;
