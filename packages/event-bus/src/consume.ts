import { type EventName, EXCHANGE } from "@dexion/events";
import type { Channel } from "amqplib";
import logger from "./logger";

type EventContext = {
	ack: () => void;
	retry: () => void;
	reject: () => void;
};
export const consumeEvent = async <T>(
	ch: Channel,
	queue: string,
	event: EventName,
	handler: (payload: T, ctx: EventContext) => Promise<void>,
) => {
	try {
		await ch.assertExchange(EXCHANGE, "topic", { durable: true });
		await ch.assertQueue(queue, { durable: true });
		await ch.bindQueue(queue, EXCHANGE, event);
		ch.consume(queue, async (msg) => {
			if (!msg) return;

			const ctx: EventContext = {
				ack: () => {
					ch.ack(msg);
				},
				retry: () => {
					ch.nack(msg, false, true);
				},
				reject: () => {
					ch.nack(msg, false, false);
				},
			};

			try {
				const payload = JSON.parse(msg.content.toString());
				await handler(payload, ctx);
			} catch (err) {
				logger.error({ err, event, queue }, "Event handler failed");
				ctx.reject();
			}
		});
		logger.info({ queue, event }, "Consumer registered");
	} catch (err) {
		logger.error({ err, queue, event }, "Failed registering consumer");
		throw err;
	}
};
