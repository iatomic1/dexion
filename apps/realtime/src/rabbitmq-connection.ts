import { createRabbitMQConnection } from "@dexion/bus";
import { config } from "./config";

export const { conn, publisher, consumer } = await createRabbitMQConnection(
	config.RABBITMQ_URL,
);
