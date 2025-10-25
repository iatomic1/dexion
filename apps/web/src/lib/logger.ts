import { createLogger } from "@repo/logger";
export const logger = createLogger({
	service: "web",
	env: process.env.NODE_ENV,
});
