import { NotifierClient } from "@repo/notifier";
import { type RedisClientType } from "redis";
import redisClient from "../services/redis";

export class PriceAlertChecker {
  private subscriber: RedisClientType;

  constructor(
    private redisClient: RedisClientType,
    private notifier: NotifierClient,
  ) {
    this.subscriber = redisClient.duplicate();
  }

  public async start(): Promise<void> {
    await this.subscriber.connect();
    await this.subscriber.subscribe("price-updates", (message) => {
      const { contractId, price } = JSON.parse(message);
      this.checkPriceAlerts(contractId, price);
    });
    console.log("Price checker started.");
  }

  private async checkPriceAlerts(
    contractId: string,
    price: number,
  ): Promise<void> {
    const redisKey = `price-alerts:${contractId}`;

    const alertsAbove = await this.redisClient.zRangeByScoreWithScores(
      redisKey,
      0,
      price,
    );
    const alertsBelow = await this.redisClient.zRangeByScoreWithScores(
      redisKey,
      price,
      Infinity,
    );

    for (const alert of alertsAbove) {
      const alertData = JSON.parse(alert.value);
      if (alertData.direction === "above") {
        await this.notifyUserAndCleanup(alertData, contractId, price);
      }
    }

    for (const alert of alertsBelow) {
      const alertData = JSON.parse(alert.value);
      if (alertData.direction === "below") {
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
      await this.redisClient.zRem(redisKey, JSON.stringify(alertData));
      await this.redisClient.del(`alert-details:${alertId}`);
    } catch (error) {
      console.error("Error sending notification or cleaning up alert:", error);
    }
  }
}
