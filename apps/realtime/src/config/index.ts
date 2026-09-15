import { z } from "zod";

const configSchema = z.object({
	SOCKETIO_REDIS_URL: z.string().min(1),
	RABBITMQ_URL: z.string().min(1),
	PORT: z.coerce.number().default(4000),
	LOG_LEVEL: z.string().min(1).default("info"),
});

const parsedConfig = configSchema.safeParse(process.env);

if (!parsedConfig.success) {
	console.error(
		"❌ Invalid environment variables:",
		parsedConfig.error.flatten().fieldErrors,
	);
	throw new Error("Invalid environment variables");
}

export const config = parsedConfig.data;
