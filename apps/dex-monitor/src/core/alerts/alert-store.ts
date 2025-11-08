import { normalRedisConnection as redis } from "@/config/connections";
import { logger } from "@/config/logger";
import type { Alert } from "./alert";

interface RawAlert {
	channels: string;
	ca: string;
	createdAt: string;
	updatedAt: string;
	value: string;
	id: string;
	userId: string;
	status: string;
	repeatable: string;
	operator: string;
	metric: string;
}

export class AlertStore {
	private async getAlertIdsByContract(ca: string): Promise<string[]> {
		const key = `alerts_by_ca:${ca}`;
		logger.debug({ key }, "Fetching alert IDs from Redis");
		const ids = await redis.smembers(key);
		logger.debug({ key, idsCount: ids.length }, "Fetched alert IDs");
		return ids;
	}

	public async getActiveAlertsByContract(ca: string): Promise<Alert[]> {
		logger.debug({ ca }, "Starting getActiveAlertsByCa");
		const alertIds = await this.getAlertIdsByContract(ca);

		if (!alertIds.length) {
			logger.debug({ ca }, "No alert IDs found for contract");
			return [];
		}

		const pipeline = redis.pipeline();
		for (const id of alertIds) {
			pipeline.hgetall(`alert:${id}`);
		}

		const results = await pipeline.exec();
		if (!results) {
			logger.error({ ca }, "Redis pipeline for getting alerts returned null");
			return [];
		}

		const rawAlerts = results
			.map(([err, data], i) => {
				if (err) {
					logger.error(
						{ ca, id: alertIds[i], err },
						"Redis pipeline entry error",
					);
					return null;
				}
				if (!data || Object.keys(data).length === 0) {
					logger.warn({ ca, id: alertIds[i] }, "Empty Redis hash for alert");
					return null;
				}
				return data as RawAlert;
			})
			.filter((data): data is RawAlert => data !== null);

		const activeAlerts = rawAlerts
			.filter((alert) => alert.status === "active")
			.map(
				(rawAlert) =>
					({
						...rawAlert,
						channels: rawAlert.channels.split(",").map((c) => c.trim()),
						value: Number(rawAlert.value),
						repeatable: rawAlert.repeatable === "true",
						status: rawAlert.status as "active",
					}) as Alert,
			);

		logger.info({ ca, count: activeAlerts.length }, "Returning active alerts");
		return activeAlerts;
	}
}
