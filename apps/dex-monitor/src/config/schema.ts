import { z } from "zod";

export const configSchema = z.object({
	PORT: z.coerce.number().default(4000),
	BULLMQ_REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
	REDIS_URL: z.string().min(1),
	CHAINHOOK_CONSUMER_SECRET: z.string().min(1),
	HIRO_PLATFORM_API_KEY: z.string().min(1),
	RESEND_API_KEY: z.string().min(1),
});

export type Config = z.infer<typeof configSchema>;
