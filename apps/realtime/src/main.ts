import { Server as Engine } from "@socket.io/bun-engine";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import { Server } from "socket.io";

const pubClient = new Redis();
const subClient = pubClient.duplicate();
const io = new Server(4005, {
	cors: {
		origin: "*",
	},
	adapter: createAdapter(pubClient, subClient),
});

const engine = new Engine();
io.bind(engine);
io.on("connection", (sck) => {});

const app = new Hono();
const { websocket } = engine.handler();

export default {
	port: 4005,
	idleTimeout: 30,
	fetch(req, server) {
		const url = new URL(req.url);
		if (url.pathname === "/socket.io/") {
			return engine.handleRequest(req, server);
		}
		return app.fetch(req, server);
	},
	websocket,
};
