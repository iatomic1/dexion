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
	const protectedCommands = ["/menu", "/wallet", "/settings"];
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
			const { data, error } = await authClient.getSession({
				fetchOptions: {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			});

			if (error) {
				console.log(error);
				await ctx.reply("Error getting session");
				return;
			}

			if (!data?.session) {
				await ctx.reply("❌ Session expired.");
				return;
			}

			ctx.session.session_data = {
				session: { ...data.session },
				user: { ...data.user },
			};

			return next();
		} catch {
			await ctx.reply("❌ Auth failed.");
		}
	});
}
