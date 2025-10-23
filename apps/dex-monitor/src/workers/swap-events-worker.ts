import { Job, Queue, Worker } from "bullmq";
import { emailQueue, swapQueue, telegramQueue, webhookQueue } from "@/queues";
import { getActiveAlertsByCa } from "@/lib/redis/alerts";
import type { SwapEventJobData } from "@/queues/types";
import { getTokenMetadata } from "@repo/tokens/services";
import { bullMqRedisConnection } from "@/config/redis";
import { getCachedUserProfile } from "@/lib/redis/user-profile";
import { ALERT_CHANNELS } from "@/lib/constants";
import { evaluateAlert, getMetricValue, hasChannel } from "@/utils/swap-events";

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
							try {
								const shouldTrigger = evaluateAlert(alert, token);
								if (!shouldTrigger) return;

								const userProfile = await getCachedUserProfile(alert.userId);

								console.log(`Alert triggered for user ${alert.userId}:`, {
									metric: alert.metric,
									operator: alert.operator,
									value: alert.value,
									currentValue: getMetricValue(alert.metric, token),
								});

								const activeChannels = alert.channels
									.map(
										(cid: string) =>
											ALERT_CHANNELS.find((ch) => ch.id === cid)?.name,
									)
									.filter(Boolean)
									.filter((chName) => hasChannel(userProfile, chName));

								await Promise.all(
									activeChannels.map(async (chName) => {
										try {
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
										} catch (error) {
											console.error(
												`Failed to queue alert for channel ${chName}:`,
												error,
											);
										}
									}),
								);

								if (!alert.repeatable) {
									// Mark as completed here | Delete from cache
								}
							} catch (error) {
								console.error(
									`Failed processing alert ${alert.id} for user ${alert.userId}:`,
									error,
								);
							}
						}),
					);
				} catch (error) {
					console.error(`Failed processing alerts for CA ${ca}:`, error);
				}
			}),
		);
		return;
	},
	{ connection: bullMqRedisConnection },
);

export default swapEventsWorker;
