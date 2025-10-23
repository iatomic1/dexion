import { normalRedisConnection } from "@/config/redis";

export interface Alert {
	channels: string[];
	ca: string;
	createdAt: string;
	updatedAt: string;
	value: string;
	id: string;
	userId: string;
	status: "active" | "paused" | "completed";
	repeatable: string;
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
	return normalRedisConnection.smembers(key);
}

export async function getActiveAlertsByCa(ca: string): Promise<Alert[]> {
	const alertIds = await getAlertsByCa(ca);
	if (!alertIds.length) return [];

	const pipeline = normalRedisConnection.pipeline();
	for (const id of alertIds) {
		pipeline.hgetall(`alert:${id}`);
	}

	const results = await pipeline.exec();

	return results
		.map(([err, data]) => (err ? null : (data as RawAlert)))
		.filter(
			(data): data is RawAlert => data !== null && data.status === "active",
		)
		.map((rawAlert) => ({
			...rawAlert,
			channels: rawAlert.channels.split(",").map((c) => c.trim()),
			value: Number(rawAlert.value),
			repeatable: rawAlert.repeatable === "1" || rawAlert.repeatable === "true",
			status: rawAlert.status as "active" | "inactive",
		}));
}
