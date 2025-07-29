import type { Context } from "telegraf";
import type { Update } from "telegraf/types";
import type { Session } from "@/lib/auth-client";

interface ExtendedSession extends Session {
	accessToken?: string;
}

export interface SessionData {
	session_token?: string;
	session_data?: ExtendedSession;
}

export interface DexBotContext<U extends Update = Update> extends Context<U> {
	session: SessionData;
}
