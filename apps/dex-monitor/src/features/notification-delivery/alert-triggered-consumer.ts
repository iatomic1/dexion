import { consumeEvent } from "@dexion/bus";
import { type AlertTriggeredPayload, EVENTS } from "@dexion/events";
import type { TokenMetadata } from "@dexion/tokens/types";
import { logger } from "@/config/logger";
import type { Alert } from "@/core/alerts/alert";
import type { CachedUserProfile } from "@/core/users/user";
import {
	emailQueue,
	telegramQueue,
	webhookQueue,
} from "@/infrastructure/bullmq/queues";
import { consumer } from "@/infrastructure/rabbitmq";

const queueMap = {
	email: emailQueue,
	telegram: telegramQueue,
	webhook: webhookQueue,
};

export const startAlertTriggeredConsumer = () => {
	return consumeEvent(
		consumer,
		"notification-engine.alert-triggered",
		EVENTS.AlertTriggered,
		async (payload, ctx) => {
			try {
				if (!payload) return ctx.ack();
				const {
					activeChannels,
					data: token,
					userProfile,
					alert,
					triggeredAt,
				} = payload as AlertTriggeredPayload<
					Alert,
					CachedUserProfile,
					TokenMetadata
				>;

				await Promise.all(
					activeChannels.map((chName) => {
						const targetQueue = queueMap[chName as keyof typeof queueMap];
						if (!targetQueue) return Promise.resolve();

						const uniqueJobId = `${alert.id}-${triggeredAt}-${chName}`;
						return targetQueue.add(
							"send-notification",
							{
								type: "token",
								alert,
								token,
								userProfile,
								triggeredAt,
							},
							{ jobId: uniqueJobId, removeOnComplete: true },
						);
					}),
				);
				ctx.ack();
			} catch (err) {
				logger.error(
					{ err: err },
					"Failed dispatching alert to their respective channels",
				);
				ctx.retry();
			}
		},
	);
};
