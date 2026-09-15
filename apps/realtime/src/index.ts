import { Hono } from "hono";
import { engine } from "./socket-io";

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
