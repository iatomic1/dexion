import { createLogger } from "@dexion/logger";
import { config } from ".";
export const logger = createLogger({
	service: "realtime",
	level: config.LOG_LEVEL,
});
