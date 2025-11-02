import { z } from "zod";

export const configSchema = z.object({
	PORT: z.coerce.number().default(4000),
	BULLMQ_REDIS_URL: z.string().min(1),
	REDIS_URL: z.string().min(1),
	CHAINHOOK_CONSUMER_SECRET: z.string().min(1),
	HIRO_PLATFORM_API_KEY: z.string().min(1),
	RESEND_API_KEY: z.string().min(1),
	TELEGRAM_BOT_TOKEN: z.string().min(1),
	BULLBOARD_USERNAME: z.string().min(1),
	BULLBOARD_PASSWORD: z.string().min(1),
});

export type Config = z.infer<typeof configSchema>;
