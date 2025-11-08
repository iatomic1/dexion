import {
	getFakFunTokenMetadata,
	getTokenMetadata,
} from "@dexion/tokens/services";
import type { TokenMetadata } from "@dexion/tokens/types";
import { type BackoffOptions, Job, Queue, Worker } from "bullmq";
import { logger } from "@/config/logger";
import { bullMqRedisConnection } from "@/config/redis";
import { updateAlertStatus } from "@/lib/api";
import { ALERT_CHANNELS } from "@/lib/constants";
import { getActiveAlertsByCa } from "@/lib/redis/alerts";
import {
	type CachedUserProfile,
	getCachedUserProfile,
} from "@/lib/redis/user-profile";
import {
	emailQueue,
	swapQueue,
	swapQueueDlq,
	telegramQueue,
	webhookQueue,
} from "@/queues";
import type { SwapEventJobData, SwapEventPlatform } from "@/queues/types";
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

async function dispatchNotifications(
	jobId: string,
	alert: Alert,
	token: TokenMetadata,
	userProfile: CachedUserProfile,
) {
	const activeChannels = alert.channels
		.map((cid) => ALERT_CHANNELS.find((ch) => ch.id === cid)?.name)
		.filter((chName): chName is string => Boolean(chName))
		.filter((chName) => hasChannel(userProfile, chName));

	logger.debug(
		{ jobId, alertId: alert.id, activeChannels },
		"Resolved active delivery channels",
	);

	await Promise.all(
		activeChannels.map(async (chName) => {
			const queue = queueMap[chName as keyof typeof queueMap];
			if (!queue) {
				logger.warn(
					{ jobId, alertId: alert.id, chName },
					"No queue found for channel",
				);
				return;
			}
			const retryCfg = retryMap[chName] || { attempts: 1 };

			logger.info(
				{ jobId, alertId: alert.id, chName },
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
				{ jobId, alertId: alert.id, chName },
				"Alert delivery job enqueued",
			);
		}),
	);
}

async function handleNonRepeatableAlert(jobId: string, alert: Alert) {
	if (!alert.repeatable) {
		logger.info(
			{ jobId, alertId: alert.id },
			"Non-repeatable alert, marking for completion",
		);
		await updateAlertStatus({
			id: alert.id,
			status: "completed",
			userId: alert.userId,
		});
	}
}

async function processTriggeredAlert(
	jobId: string,
	alert: Alert,
	token: TokenMetadata,
) {
	const userProfile = await getCachedUserProfile(alert.userId);
	if (!userProfile) {
		logger.warn({ jobId, userId: alert.userId }, "User profile not found");
		return;
	}

	const currentValue = getMetricValue(alert.metric, token);
	logger.info(
		{
			jobId,
			alertId: alert.id,
			userId: alert.userId,
			currentValue,
		},
		"Alert triggered",
	);

	await dispatchNotifications(jobId, alert, token, userProfile);
	await handleNonRepeatableAlert(jobId, alert);
}

async function processAlertsForContract(
	jobId: string,
	ca: string,
	platform: SwapEventPlatform,
) {
	logger.debug({ jobId, ca }, "Processing asset contract");

	try {
		const alerts = await getActiveAlertsByCa(ca);
		logger.debug(
			{ jobId, ca, alertCount: alerts?.length },
			"Fetched active alerts",
		);
		if (!alerts?.length) {
			logger.debug({ jobId, ca }, "No active alerts found");
			return;
		}

		let token: TokenMetadata | null = null;
		if (platform === "velar" || platform === "bitflow") {
			token = await getTokenMetadata(ca);
		} else if (platform === "fakfun") {
			token = await getFakFunTokenMetadata(ca);
		}

		if (!token) {
			logger.warn({ jobId, ca }, "Token metadata missing");
			return;
		}

		await Promise.all(
			alerts.map(async (alert) => {
				logger.debug(
					{ jobId, alertId: alert.id },
					"Evaluating alert condition",
				);
				const shouldTrigger = evaluateAlert(alert, token);
				if (shouldTrigger) {
					await processTriggeredAlert(jobId, alert, token);
				} else {
					logger.debug({ jobId, alertId: alert.id }, "Alert did not trigger");
				}
			}),
		);

		logger.debug({ jobId, ca }, "Completed alerts processing for CA");
	} catch (error) {
		logger.error({ jobId, ca, err: error }, "Failed processing alerts for CA");
		throw error;
	}
}

const swapEventsWorker = new Worker(
	swapQueue.name,
	async (job: Job<SwapEventJobData>) => {
		const { assetContracts, platform } = job.data;
		const { id: jobId } = job;
		logger.info({ jobId, assetContracts }, "Job started");

		await Promise.all(
			assetContracts.map((ca) =>
				processAlertsForContract(jobId as string, ca, platform),
			),
		);

		logger.info({ jobId }, "Job completed successfully");
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
