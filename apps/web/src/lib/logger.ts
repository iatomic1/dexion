import { createLogger } from "@dexion/logger";
export const logger = createLogger({
	service: "web",
	env: process.env.NODE_ENV,
});
