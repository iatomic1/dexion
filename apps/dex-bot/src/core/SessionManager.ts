import { Redis } from "@telegraf/session/redis";
import { createClient } from "redis";
import type { SessionStore } from "telegraf";
import { session } from "telegraf";
import type { SessionData } from "@/types/bot";

export class SessionManager {
	private store: SessionStore<SessionData>;
	private redisClient: ReturnType<typeof createClient> | null = null;

	constructor() {
		try {
			// Create Redis client with proper configuration
			this.redisClient = createClient({
				url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
				socket: {
					reconnectStrategy: (retries) => Math.min(retries * 50, 500),
					connectTimeout: 60000,
					lazyConnect: true,
				},
				pingTimeout: 30000,
				retryDelayOnFailover: 100,
				enableReadyCheck: true,
				maxRetriesPerRequest: 3,
			});

			// Handle Redis connection events
			this.redisClient.on("error", (err) => {
				console.error("Redis client error:", err);
			});

			this.redisClient.on("connect", () => {
				console.log("Redis connected");
			});

			this.redisClient.on("ready", () => {
				console.log("Redis ready");
			});

			this.redisClient.on("reconnecting", () => {
				console.log("Redis reconnecting...");
			});

			// Create session store using the Redis client
			this.store = Redis<SessionData>({
				client: this.redisClient,
			});
		} catch (err) {
			console.error("Failed to initialize Redis store:", err);
			console.warn("Falling back to in-memory session store");
			// Fallback to in-memory store (sessions won't persist across restarts)
			this.store = new Map() as any;
		}
	}

	public getSessionMiddleware() {
		return session({
			store: this.store,
			defaultSession: () => ({ session_token: undefined }),
		});
	}

	// Optional: method to gracefully close Redis connection
	public async close() {
		if (this.redisClient) {
			await this.redisClient.quit();
		}
	}
}
