import { Telegraf } from "telegraf";
import { authClient } from "@/lib/auth-client";
import type { DexBotContext } from "@/types/bot";
import * as messages from "../messages";

export function registerMiddleware(bot: Telegraf<DexBotContext>) {
	const myChatId = process.env.MY_CHAT_ID;

	bot.use(async (ctx, next) => {
		const chatId = ctx.chat?.id.toString();

		if (chatId === myChatId || !myChatId) {
			return next();
		}

		if (chatId) {
			try {
				await ctx.reply(messages.DEV_MODE_MESSAGE);
			} catch (e) {
				console.error(`Error replying to chat ${chatId}`, e);
			}
		}
	});

	const publicCommands = ["/start", "/auth"];
	const protectedCommands = ["/menu", "/wallet", "/settings", "/list"];
	const protectedActions = [
		"wallets",
		"watchlists",
		"price_alerts",
		"refresh",
		"logout",
		"my_wallet",
		"referrals",
		"help",
		"settings",
	];

	bot.use(async (ctx, next) => {
		const msgText =
			ctx.message && "text" in ctx.message ? ctx.message.text : undefined;
		const callbackData =
			ctx.callbackQuery && "data" in ctx.callbackQuery
				? ctx.callbackQuery.data
				: undefined;
		const isPublicCommand = msgText && publicCommands.includes(msgText);
		const isProtectedCommand = msgText && protectedCommands.includes(msgText);
		const isProtectedAction =
			callbackData && protectedActions.includes(callbackData);

		if (isPublicCommand) return next();
		if (!isProtectedCommand && !isProtectedAction) return next();

		const token = ctx.session?.session_token;
		if (!token) {
			await ctx.reply("❌ Not authenticated.");
			return;
		}

		try {
			await new Promise<void>((resolve, reject) => {
				authClient.getSession({
					fetchOptions: {
						headers: {
							Authorization: `Bearer ${token}`,
						},
						onSuccess: async (responseCtx) => {
							try {
								const jwt = responseCtx.response.headers.get("set-auth-jwt");

								// Get session data from the response
								const { data } = await responseCtx; // or however you access the data

								if (!data?.session) {
									await ctx.reply("❌ Session expired.");
									reject(new Error("Session expired"));
									return;
								}

								ctx.session.session_data = {
									session: { ...data.session, accessToken: jwt },
									user: { ...data.user },
								};

								resolve();
							} catch (error) {
								reject(error);
							}
						},
						onError: async (error) => {
							console.log(error);
							await ctx.reply("Error getting session");
							reject(error);
						},
					},
				});
			});

			return next();
		} catch {
			await ctx.reply("❌ Auth failed.");
		}
	});
}
