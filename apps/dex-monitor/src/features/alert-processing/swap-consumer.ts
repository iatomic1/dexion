import { consumeEvent, publishEvent } from "@dexion/bus";
import {
	type AlertTriggeredPayload,
	EVENTS,
	type EventPayloads,
} from "@dexion/events";
import {
	getFakFunTokenMetadata,
	getTokenMetadata,
} from "@dexion/tokens/services";
import type { TokenMetadata } from "@dexion/tokens/types";
import { logger } from "@/config/logger";
import type { Alert } from "@/core/alerts/alert";
import { shouldTrigger } from "@/core/alerts/alert";
import { AlertStore } from "@/core/alerts/alert-store";
import type { CachedUserProfile } from "@/core/users/user";
import { UserStore } from "@/core/users/user-store";
import { hasChannel } from "@/core/users/user-utils";
import {
	emailQueue,
	telegramQueue,
	webhookQueue,
} from "@/infrastructure/bullmq/queues";
import { updateAlertStatus } from "@/infrastructure/http/internal-api";
import { consumer, publisher } from "@/infrastructure/rabbitmq";
import { ALERT_CHANNELS } from "@/shared/constants";

const alertStore = new AlertStore();
const userStore = new UserStore();

const queueMap = {
	email: emailQueue,
	telegram: telegramQueue,
	webhook: webhookQueue,
};

export const startSwapConsumer = () => {
	return consumeEvent(
		consumer,
		"alert-engine.swap-events",
		EVENTS.SwapDetected,
		async (payload, ctx) => {
			const event = payload as EventPayloads["swap.detected"];
			const { assetContracts, platform } = event;
			let processingErrors = false;
			try {
				const contractDataPromises = assetContracts.map(async (ca) => {
					try {
						const alerts = await alertStore.getActiveAlertsByContract(ca);
						if (!alerts.length) return null;

						let token;
						if (platform === "velar" || platform === "bitflow") {
							token = await getTokenMetadata(ca);
						} else if (platform === "fakfun") {
							token = await getFakFunTokenMetadata(ca);
						}

						if (!token) {
							logger.warn({ ca }, "Token metadata not found");
							return null;
						}
						return { alerts, token };
					} catch (err) {
						logger.error({ ca, err }, "Failed processing contract data");
						processingErrors = true;
						return null;
					}
				});

				const validContracts = (await Promise.all(contractDataPromises)).filter(
					Boolean,
				);

				if (validContracts.length === 0) {
					return processingErrors ? ctx.retry() : ctx.ack();
				}

				const uniqueUserIDs = [
					...new Set(
						validContracts.flatMap((c) => c!.alerts.map((a) => a.userId)),
					),
				];

				const userProfiles = await Promise.all(
					uniqueUserIDs.map(async (id) => {
						const profile = await userStore.getUserProfile(id);
						return { id, profile };
					}),
				);

				const userMap = new Map(userProfiles.map((u) => [u.id, u.profile]));
				const triggersToProcess = [];
				const nonRepeatableAlertsToUpdate = new Map<string, Alert>();

				for (const { alerts, token } of validContracts as {
					alerts: Alert[];
					token: TokenMetadata;
				}[]) {
					for (const alert of alerts) {
						if (shouldTrigger(alert, token)) {
							const userProfile = userMap.get(alert.userId);
							if (!userProfile) {
								logger.warn({ userId: alert.userId }, "User Profile not found");
								continue;
							}

							const activeChannels = alert.channels
								.map((cid) => ALERT_CHANNELS.find((ch) => ch.id === cid)?.name)
								.filter(Boolean)
								.filter((name) => hasChannel(userProfile, name as string));

							triggersToProcess.push({
								alert,
								token,
								userProfile,
								activeChannels,
							});
						}
					}
				}

				if (nonRepeatableAlertsToUpdate.size > 0) {
					const updatePromises = Array.from(
						nonRepeatableAlertsToUpdate.values(),
					).map((a) =>
						updateAlertStatus({
							id: a.id,
							status: "completed",
							userId: a.userId,
						}),
					);
					await Promise.all(updatePromises);
				}

				if (triggersToProcess.length > 0) {
					const publishPromises = triggersToProcess.map(
						({ alert, token, userProfile, activeChannels }) => {
							publishEvent(publisher, EVENTS.AlertTriggered, {
								type: "token",
								alert,
								data: token,
								userProfile,
								activeChannels,
								triggeredAt: new Date().toISOString(),
							} satisfies AlertTriggeredPayload<
								Alert,
								CachedUserProfile,
								TokenMetadata
							>);
						},
					);
					await Promise.all(publishPromises);
				}
				ctx.ack();
			} catch (err) {
				logger.error({ err }, "Critical failure processing swap event");
				ctx.retry();
			}
		},
	);
};
