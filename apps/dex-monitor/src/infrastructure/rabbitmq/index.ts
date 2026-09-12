import { createRabbitMQConnection } from "@dexion/bus";
import { config } from "@/config";

export const {
	consumer,
	publisher,
	conn: rabbitMqConn,
} = await createRabbitMQConnection(config.RABBITMQ_URL);
