import { createLogger } from "@dexion/logger";

export const logger = createLogger({
	service: "hub",
	level: process.env.LOG_LEVEL || "info",
});
