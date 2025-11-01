import { configSchema } from "./schema";

const parsedConfig = configSchema.safeParse(process.env);

if (!parsedConfig.success) {
	console.error(
		"❌ Invalid environment variables:",
		parsedConfig.error.flatten().fieldErrors,
	);
	throw new Error("Invalid environment variables");
}

export const config = parsedConfig.data;
