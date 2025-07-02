import { NotifierClient } from "@repo/notifier";
import redisClient from "./redis";

const notifier = new NotifierClient();
const subscriber = redisClient.duplicate();

async function checkPriceAlerts(contractId: string, price: number) {
  const redisKey = `price-alerts:${contractId}`;

  // Check for alerts above the current price
  const alertsAbove = await redisClient.zRangeByScoreWithScores(
    redisKey,
    0,
    price,
  );

  // Check for alerts below the current price
  const alertsBelow = await redisClient.zRangeByScoreWithScores(
    redisKey,
    price,
    Infinity,
  );

  for (const alert of alertsAbove) {
    const alertData = JSON.parse(alert.value);
    if (alertData.direction === "above") {
      await notifyUserAndCleanup(alertData, contractId, price);
    }
  }

  for (const alert of alertsBelow) {
    const alertData = JSON.parse(alert.value);
    if (alertData.direction === "below") {
      await notifyUserAndCleanup(alertData, contractId, price);
    }
  }
}

async function notifyUserAndCleanup(
  alertData: any,
  contractId: string,
  price: number,
) {
  const { alertId, userId } = alertData;

  try {
    await notifier.send("telegram", {
      recipient: { id: userId },
      message: `🚨 Price Alert! 🚨\n\n${contractId} has reached ${price}.`,
    });

    // Clean up the alert from Redis to prevent re-notification
    const redisKey = `price-alerts:${contractId}`;
    await redisClient.zRem(redisKey, JSON.stringify(alertData));
    await redisClient.del(`alert-details:${alertId}`);
  } catch (error) {
    console.error("Error sending notification or cleaning up alert:", error);
  }
}

export async function startPriceChecker() {
  await subscriber.connect();
  await subscriber.subscribe("price-updates", (message) => {
    const { contractId, price } = JSON.parse(message);
    checkPriceAlerts(contractId, price);
  });
  console.log("Price checker started.");
}
