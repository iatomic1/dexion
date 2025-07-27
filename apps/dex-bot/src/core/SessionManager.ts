import { Redis } from "@telegraf/session/redis";
import type { SessionStore } from "telegraf";
import { session } from "telegraf";
import type { SessionData } from "@/types/bot";

export class SessionManager {
	private store: SessionStore<SessionData>;

	constructor() {
		this.store = Redis<SessionData>({
			url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
		});
	}

	public getSessionMiddleware() {
		return session({
			store: this.store,
			defaultSession: () => ({ session_token: null }),
		});
	}
}
