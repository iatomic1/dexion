import { getTokenMetadata } from "@dexion/tokens/services";
import { type BackoffOptions, Job, Queue, Worker } from "bullmq";
import { logger } from "@/config/logger";
import { bullMqRedisConnection } from "@/config/redis";
import { ALERT_CHANNELS } from "@/lib/constants";
import { getActiveAlertsByCa } from "@/lib/redis/alerts";
import { getCachedUserProfile } from "@/lib/redis/user-profile";
import {
	emailQueue,
	swapQueue,
	swapQueueDlq,
	telegramQueue,
	webhookQueue,
} from "@/queues";
import type { SwapEventJobData } from "@/queues/types";
import { evaluateAlert, getMetricValue, hasChannel } from "@/utils/swap-events";

export type Alert = Awaited<ReturnType<typeof getActiveAlertsByCa>>[number];

const queueMap: Record<string, Queue> = {
	email: emailQueue,
	telegram: telegramQueue,
	webhook: webhookQueue,
};
const retryMap: Record<string, { attempts: number; backoff?: BackoffOptions }> =
	{
		webhook: { attempts: 1 }, // no retry
		email: { attempts: 2, backoff: { type: "exponential", delay: 2000 } }, // retry once
		telegram: { attempts: 3, backoff: { type: "exponential", delay: 2000 } }, // retry thrice
	};

const swapEventsWorker = new Worker(
	swapQueue.name,
	async (job: Job<SwapEventJobData>) => {
		const { assetContracts } = job.data;
		logger.info({ jobId: job.id, assetContracts }, "Job started");

		await Promise.all(
			assetContracts.map(async (ca) => {
				logger.debug({ jobId: job.id, ca }, "Processing asset contract");

				try {
					const alerts = await getActiveAlertsByCa(ca);
					logger.debug(
						{ jobId: job.id, ca, alertCount: alerts?.length },
						"Fetched active alerts",
					);
					if (!alerts?.length) {
						logger.debug({ jobId: job.id, ca }, "No active alerts found");
						return;
					}

					const token = await getTokenMetadata(ca);
					if (!token) {
						logger.warn({ jobId: job.id, ca }, "Token metadata missing");
						return;
					}

					await Promise.all(
						alerts.map(async (alert) => {
							logger.debug(
								{ jobId: job.id, alertId: alert.id },
								"Evaluating alert condition",
							);
							const shouldTrigger = evaluateAlert(alert, token);
							if (!shouldTrigger) {
								logger.debug(
									{ jobId: job.id, alertId: alert.id },
									"Alert did not trigger",
								);
								return;
							}

							const userProfile = await getCachedUserProfile(alert.userId);
							if (!userProfile) {
								logger.warn(
									{ jobId: job.id, userId: alert.userId },
									"User profile not found",
								);
								return;
							}

							const currentValue = getMetricValue(alert.metric, token);
							logger.info(
								{
									jobId: job.id,
									alertId: alert.id,
									userId: alert.userId,
									currentValue,
								},
								"Alert triggered",
							);

							const activeChannels = alert.channels
								.map(
									(cid: string) =>
										ALERT_CHANNELS.find((ch) => ch.id === cid)?.name,
								)
								.filter((chName): chName is string => Boolean(chName))
								.filter((chName) => hasChannel(userProfile, chName));

							logger.debug(
								{ jobId: job.id, alertId: alert.id, activeChannels },
								"Resolved active delivery channels",
							);

							await Promise.all(
								activeChannels.map(async (chName) => {
									const queue = queueMap[chName as keyof typeof queueMap];
									if (!queue) {
										logger.warn(
											{ jobId: job.id, alertId: alert.id, chName },
											"No queue found for channel",
										);
										return;
									}
									const retryCfg = retryMap[chName] || { attempts: 1 };

									logger.info(
										{ jobId: job.id, alertId: alert.id, chName },
										"Enqueueing alert delivery job",
									);

									await queue.add(
										"send-alert",
										{
											channel: chName,
											userProfile,
											alert,
											token,
											triggeredAt: new Date().toISOString(),
										},
										retryCfg,
									);

									logger.debug(
										{ jobId: job.id, alertId: alert.id, chName },
										"Alert delivery job enqueued",
									);
								}),
							);

							if (!alert.repeatable) {
								logger.info(
									{ jobId: job.id, alertId: alert.id },
									"Non-repeatable alert, marking for completion",
								);
								// TODO: Mark alert as completed or delete from cache
							}
						}),
					);

					logger.debug(
						{ jobId: job.id, ca },
						"Completed alerts processing for CA",
					);
				} catch (error) {
					logger.error(
						{ jobId: job.id, ca, err: error },
						"Failed processing alerts for CA",
					);
					throw error;
				}
			}),
		);

		logger.info({ jobId: job.id }, "Job completed successfully");
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
		logger.warn({ jobId: job.id, err }, "Job failed, moved to DLQ");
	} else {
		logger.error({ err }, "Worker failed with unknown job");
	}
});

swapEventsWorker.on("completed", (job) => {
	logger.info({ jobId: job.id }, "Worker reported job completion");
});

swapEventsWorker.on("active", (job) => {
	logger.debug({ jobId: job.id }, "Worker picked up job");
});

swapEventsWorker.on("stalled", (jobId) => {
	logger.warn({ jobId }, "Job stalled");
});

export default swapEventsWorker;
