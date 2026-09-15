import amqp, {
	type Channel,
	type ChannelModel,
	type ConfirmChannel,
} from "amqplib";
import logger from "./logger";

export type RabbitMQContext = {
	conn: ChannelModel;
	publisher: ConfirmChannel;
	consumer: Channel;
};

export const createRabbitMQConnection = async (
	url: string,
): Promise<RabbitMQContext> => {
	try {
		const conn = await amqp.connect(url);
		const publisher = await conn.createConfirmChannel();
		const consumer = await conn.createChannel();

		await consumer.prefetch(10);

		logger.info("RabbitMQ connected");
		return { conn, publisher, consumer };
	} catch (err) {
		logger.error({ err }, "Error connecting to RabbitMQ");
		throw err;
	}
};
