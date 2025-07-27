import { nanoid } from "nanoid";
import * as messages from "@/messages";
import redisClient from "@/redis";
export class PriceAlertService {
	public async createAlert(
		chatId: string,
		contractAddress: string,
		direction: "above" | "below",
		price: number,
	) {
		try {
			const alertId = nanoid();
			const alert = { id: alertId, chatId, contractAddress, direction, price };
			const redisKey = `price-alerts:${contractAddress}`;
			const redisValue = JSON.stringify({
				alertId: alert.id,
				userId: chatId,
				direction,
			});
			await redisClient.zAdd(redisKey, [{ score: price, value: redisValue }]);
			await redisClient.hSet(`alert-details:${alertId}`, alert as any);
			return messages.ALERT_SET_SUCCESS(contractAddress, direction, price);
		} catch (error) {
			console.error(error);
			return messages.GENERIC_ERROR_MESSAGE;
		}
	}
	public async listAlerts(chatId: string) {
		try {
			const alertKeys = await redisClient.keys("alert-details:*");
			if (alertKeys.length === 0) {
				return messages.NO_ALERTS_MESSAGE;
			}
			const userAlerts = [];
			for (const key of alertKeys) {
				const alert = await redisClient.hGetAll(key);
				if (alert.chatId === chatId) {
					userAlerts.push(alert);
				}
			}
			if (userAlerts.length === 0) {
				return messages.NO_ALERTS_MESSAGE;
			}
			let message = "<b>Your Price Alerts:</b>\n";
			userAlerts.forEach((alert: any) => {
				message += `\n- <b>${alert.contractAddress}</b> ${alert.direction} ${alert.price} (ID: <code>${alert.id}</code>)`;
			});
			return message;
		} catch (error) {
			console.error(error);
			return messages.GENERIC_ERROR_MESSAGE;
		}
	}
	public async deleteAlert(chatId: string, alertId: string) {
		try {
			const alert = await redisClient.hGetAll(`alert-details:${alertId}`);
			if (!alert.id || alert.chatId !== chatId) {
				return "Alert not found or you do not own this alert.";
			}
			const redisKey = `price-alerts:${alert.contractAddress}`;
			const redisValue = JSON.stringify({
				alertId: alert.id,
				userId: alert.chatId,
				direction: alert.direction,
			});
			await redisClient.zRem(redisKey, redisValue);
			await redisClient.del(`alert-details:${alertId}`);
			return `✅ Alert ${alertId} deleted.`;
		} catch (error) {
			console.error(error);
			return messages.GENERIC_ERROR_MESSAGE;
		}
	}
}
