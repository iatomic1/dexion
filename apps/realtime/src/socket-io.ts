import { FRONTEND_URL } from "@dexion/shared";
import { Server as Engine } from "@socket.io/bun-engine";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import { Server } from "socket.io";
import { config } from "./config";
import { logger } from "./config/logger";
import { validateToken } from "./verify-auth-token";

export const pubClient = new Redis(config.SOCKETIO_REDIS_URL);
const subClient = pubClient.duplicate();
export const io = new Server({
	cors: {
		origin: FRONTEND_URL,
		methods: ["GET", "POST"],
	},
	adapter: createAdapter(pubClient, subClient),
});
io.use(async (socket, next) => {
	const token = socket.handshake.auth.token;
	if (!token) {
		return next(new Error("Authentication error: No token provided"));
	}
	try {
		const payload = await validateToken(token);
		logger.info(payload.sub, "Userid from payload");
		socket.data.userId = payload.sub;
		next();
	} catch (err) {
		next(new Error("Authentication error: Invalid token"));
	}
});

export const engine = new Engine();
io.bind(engine);
io.on("connection", (socket) => {
	socket.join(socket.data.userId);
	logger.info({ userId: socket.data.userId }, "User secured and connected");
});
