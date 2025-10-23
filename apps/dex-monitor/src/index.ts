import { serve } from "@hono/node-server";
import { createApp } from "./routes";

const startServer = () => {
	const app = createApp();

	const server = serve(
		{
			fetch: app.fetch,
			port: 4000,
		},
		({ address, port }) => {
			console.log(`✅ Server running at http://localhost:${port}`);
			console.log(`For the UI of instance1, open http://localhost:${port}/ui`);
		},
	);
};

startServer();
