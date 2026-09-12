import { type EventName, type EventPayloads, EXCHANGE } from "@dexion/events";
import type { Channel, ConfirmChannel } from "amqplib";
import logger from "./logger";

export const publishEvent = async <E extends EventName>(
	ch: ConfirmChannel,
	event: E,
	data: EventPayloads[E],
) => {
	try {
		if (ch) {
			await ch.assertExchange(EXCHANGE, "topic", {
				durable: true,
			});

			await new Promise<void>((resolve, reject) => {
				ch.publish(
					EXCHANGE,
					event,
					Buffer.from(JSON.stringify(data)),
					{
						persistent: true,
					},
					(err) => {
						if (err) reject(err);
						else resolve();
					},
				);
			});

			logger.info({ event }, "Event Published");
		}
	} catch (err) {
		logger.error({ err, event }, "Failed to publish event");
		throw err;
	}
};
