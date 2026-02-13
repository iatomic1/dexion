import { Job, Worker } from "bullmq";
import { bullMqRedisConnection } from "@/config/connections";
import { logger } from "@/config/logger";
import { HodlmmAlertStore } from "@/core/alerts/hodlmm-store";
import { UserStore } from "@/core/users/user-store";
import { hasChannel } from "@/core/users/user-utils";
import {
	emailQueue,
	hodlmmQueue,
	telegramQueue,
	webhookQueue,
} from "@/infrastructure/bullmq/queues";
import { fetchBitflowPositions } from "@/infrastructure/http/bitflow-api";
import { updateHodlmmAlertStatus } from "@/infrastructure/http/internal-api"; // We need to implement this

const alertStore = new HodlmmAlertStore();
const userStore = new UserStore();

const queueMap = {
	email: emailQueue,
	telegram: telegramQueue,
	webhook: webhookQueue,
};

const processor = new Worker(
	hodlmmQueue.name,
	async (job: Job) => {
		logger.info("Starting HODLMM position check job");

		// 1. Get all active alerts
		// Optimization: In a real scale scenario, we'd batch this or split by user.
		// For now, fetching all is fine.
		const alerts = await alertStore.getAllActiveAlerts();
		if (alerts.length === 0) {
			logger.info("No active HODLMM alerts found");
			return;
		}

		// 2. Group alerts by Stacks Address to minimize API calls
		// Map<stacksAddress, Alert[]>
		const alertsByAddress = new Map<string, typeof alerts>();
		for (const alert of alerts) {
			const existing = alertsByAddress.get(alert.stacksAddress) || [];
			existing.push(alert);
			alertsByAddress.set(alert.stacksAddress, existing);
		}

		logger.info(
			{ usersCount: alertsByAddress.size, totalAlerts: alerts.length },
			"Processing HODLMM alerts",
		);

		// 3. Process each user
		for (const [address, userAlerts] of alertsByAddress) {
			try {
				const positions = await fetchBitflowPositions(address);
				const positionsMap = new Map(positions.map((p) => [p.poolId, p]));

				for (const alert of userAlerts) {
					const position = positionsMap.get(alert.poolId);
					if (!position) {
						// Position might be closed or API error
						continue;
					}

					const currentStatus = position.coversActiveBin
						? "in-range"
						: "out-of-range";

					// Check if status changed

					if (currentStatus !== alert.lastKnownStatus) {
						logger.info(
							{
								alertId: alert.id,

								old: alert.lastKnownStatus,

								new: currentStatus,
							},

							"HODLMM Status Change Detected",
						);

						// Determine if we should notify

						let shouldNotify = false;

						if (currentStatus === "out-of-range" && alert.notifyOnOutOfRange) {
							shouldNotify = true;
						} else if (
							currentStatus === "in-range" &&
							alert.notifyOnBackInRange
						) {
							shouldNotify = true;
						}

						if (shouldNotify) {
							const userProfile = await userStore.getUserProfile(alert.userId);

							if (userProfile) {
								const channels = [
									alert.notifyViaEmail ? "email" : null,
									alert.notifyViaTelegram ? "telegram" : null,
									alert.notifyViaWebhook ? "webhook" : null,
								].filter(
									(c): c is keyof typeof queueMap =>
										!!c && hasChannel(userProfile, c),
								);

								logger.info(
									{
										channels,
										userId: alert.userId,
										hasTelegram: !!userProfile.telegram_id,
										hasEmail: !!userProfile.email,
										alertConfig: {
											telegram: alert.notifyViaTelegram,
											email: alert.notifyViaEmail,
										},
									},
									"Preparing to send notifications",
								);

								for (const channel of channels) {
									await queueMap[channel].add("send-notification", {
										type: "hodlmm",
										alert,
										currentStatus,
										positionValue: position.valueUsd,
										userProfile,
										triggeredAt: new Date().toISOString(),
									});
								}
							} else {
								logger.warn(
									{ userId: alert.userId },
									"User profile not found in Redis (user:{userId}) - cannot send notifications",
								);
							}
						}
					}

					// Update DB with new status (regardless of notification)

					// This ensures `last_checked` and `valueUsd` are always fresh

					await updateHodlmmAlertStatus({
						id: alert.id,

						status: currentStatus,

						valueUsd: position.valueUsd,
					});
				}
			} catch (err) {
				logger.error(
					{ address, err },
					"Failed to process HODLMM alerts for user",
				);
			}
		}
	},
	{
		connection: bullMqRedisConnection,
		removeOnComplete: { count: 1 },
	},
);

export default processor;
