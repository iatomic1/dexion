import { NotifierClient } from "@repo/notifier";
import type Redis from "ioredis";

export class PriceAlertChecker {
	private subscriber: Redis;

	constructor(
		private redisClient: Redis,
		private notifier: NotifierClient,
	) {
		this.subscriber = redisClient.duplicate();
	}

	public async start(): Promise<void> {
		this.subscriber.on("message", async (channel, message) => {
			if (channel === "price-updates") {
				const { contractId, price } = JSON.parse(message);
				await this.checkPriceAlerts(contractId, price);
			}
		});

		await this.subscriber.subscribe("price-updates");
		console.log("Price checker started.");
	}

	private async checkPriceAlerts(
		contractId: string,
		price: number,
	): Promise<void> {
		const redisKey = `price-alerts:${contractId}`;

		const alertsAbove = await this.redisClient.zrangebyscore(
			redisKey,
			0,
			price,
			"WITHSCORES",
		);
		const alertsBelow = await this.redisClient.zrangebyscore(
			redisKey,
			price,
			"+inf",
			"WITHSCORES",
		);

		await this.handleAlerts(alertsAbove, contractId, price, "above");
		await this.handleAlerts(alertsBelow, contractId, price, "below");
	}

	private async handleAlerts(
		rawAlerts: string[],
		contractId: string,
		price: number,
		direction: "above" | "below",
	): Promise<void> {
		for (let i = 0; i < rawAlerts.length; i += 2) {
			const alertValue = rawAlerts[i];
			const alertData = JSON.parse(alertValue as string);
			if (alertData.direction === direction) {
				await this.notifyUserAndCleanup(alertData, contractId, price);
			}
		}
	}

	private async notifyUserAndCleanup(
		alertData: any,
		contractId: string,
		price: number,
	): Promise<void> {
		const { alertId, userId } = alertData;

		try {
			await this.notifier.send("telegram", {
				recipient: { id: userId },
				message: `🚨 Price Alert! 🚨\n\n${contractId} has reached $${price}.`,
			});

			const redisKey = `price-alerts:${contractId}`;
			await this.redisClient.zrem(redisKey, JSON.stringify(alertData));
			await this.redisClient.del(`alert-details:${alertId}`);
		} catch (error) {
			console.error("Error sending notification or cleaning up alert:", error);
		}
	}
}
