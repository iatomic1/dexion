import type { Context } from "telegraf";
import type { Update } from "telegraf/types";
import type { Session } from "@/lib/auth-client";

export interface SessionData {
	session_token?: string | null;
	session_data?: Session;
}

export interface DexBotContext<U extends Update = Update> extends Context<U> {
	session: SessionData;
}
