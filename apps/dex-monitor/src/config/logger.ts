import { createLogger } from "@dexion/logger";

export const logger = createLogger({
	service: "dex-monitor",
	level: "info",
});
