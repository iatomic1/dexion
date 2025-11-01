import { serve } from "@hono/node-server";
import { logger } from "./config/logger";
import { createApp } from "./routes";

const startServer = () => {
	const app = createApp();

	const server = serve(
		{
			fetch: app.fetch,
			port: 4000,
		},
		({ address, port }) => {
			logger.info(`✅ Server running at http://localhost:${port}`);
			logger.info(`For the UI of instance1, open http://localhost:${port}/ui`);
		},
	);
};

startServer();
