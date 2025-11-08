import { z } from "zod";

const configSchema = z.object({
	PORT: z.coerce.number().default(4000),
	BULLMQ_REDIS_URL: z.string().min(1),
	REDIS_URL: z.string().min(1),
	CHAINHOOK_CONSUMER_SECRET: z.string().min(1),
	HIRO_PLATFORM_API_KEY: z.string().min(1),
	RESEND_API_KEY: z.string().min(1),
	TELEGRAM_BOT_TOKEN: z.string().min(1),
	BULLBOARD_USERNAME: z.string().min(1),
	BULLBOARD_PASSWORD: z.string().min(1),
	INTERNAL_SECRET: z.string().min(1),
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
