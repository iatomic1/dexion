import { logger } from "@/config/logger";
import { normalRedisConnection } from "@/config/redis";

export interface Alert {
	channels: string[];
	ca: string;
	createdAt: string;
	updatedAt: string;
	value: number;
	id: string;
	userId: string;
	status: "active" | "paused" | "completed";
	repeatable: boolean;
	operator: string;
	metric: string;
}

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

export async function getAlertsByCa(ca: string) {
	const key = `alerts_by_ca:${ca}`;
	logger.debug({ key }, "fetching alert IDs from Redis");
	const ids = await normalRedisConnection.smembers(key);
	logger.debug({ key, idsCount: ids.length, ids }, "fetched alert IDs");
	return ids;
}

export async function getActiveAlertsByCa(ca: string): Promise<Alert[]> {
	logger.debug({ ca }, "starting getActiveAlertsByCa");
	const alertIds = await getAlertsByCa(ca);

	if (!alertIds.length) {
		logger.debug({ ca }, "no alert IDs found");
		return [];
	}

	logger.debug({ ca, alertIds }, "building pipeline for alert fetch");

	const pipeline = normalRedisConnection.pipeline();
	for (const id of alertIds) {
		pipeline.hgetall(`alert:${id}`);
	}

	const results = await pipeline.exec();
	if (!results) {
		logger.error({ ca }, "Redis pipeline returned null");
		return [];
	}
	logger.debug(
		{
			ca,
			resultsCount: results.length,
			resultsRaw: results,
		},
		"pipeline execution complete",
	);

	const mapped = results.map(([err, data], i) => {
		if (err) {
			logger.error({ ca, id: alertIds[i], err }, "pipeline entry error");
			return null;
		}
		if (!data || Object.keys(data).length === 0) {
			logger.warn({ ca, id: alertIds[i] }, "empty Redis hash");
			return null;
		}
		logger.debug({ ca, id: alertIds[i], data }, "raw alert data");
		return data as RawAlert;
	});

	const filtered = mapped.filter(
		(data): data is RawAlert => data !== null && data.status === "active",
	);

	logger.debug(
		{
			ca,
			totalFetched: mapped.length,
			totalActive: filtered.length,
			filteredIds: filtered.map((a) => a.id),
			statuses: mapped.map((a) => a?.status),
		},
		"filtered active alerts",
	);

	const final = filtered.map((rawAlert) => ({
		...rawAlert,
		channels: rawAlert.channels.split(",").map((c) => c.trim()),
		value: Number(rawAlert.value),
		repeatable: rawAlert.repeatable === "true",
		status: rawAlert.status as "active" | "paused" | "completed",
	}));

	logger.info(
		{ ca, count: final.length, ids: final.map((a) => a.id) },
		"returning active alerts",
	);

	return final;
}
