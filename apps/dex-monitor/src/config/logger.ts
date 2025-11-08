import { createLogger } from "@dexion/logger";
import { config } from ".";

export const logger = createLogger({
	service: "dex-monitor",
	level: config.LOG_LEVEL,
});
