import { Telegraf } from "telegraf";
import * as messages from "@/messages";
import type { DexBotContext } from "@/types/bot";

export function registerPreferenceActions(bot: Telegraf<DexBotContext>) {
	bot.action(/set_preference_(.+)/, async (ctx) => {
		if (!ctx.chat) return ctx.answerCbQuery("Could not identify chat.");
		const preference = ctx.match[1];
		try {
			// await api.setWalletPreference(ctx.chat.id, preference);
			ctx.editMessageText(messages.PREFERENCE_SET_SUCCESS(preference), {
				parse_mode: "Markdown",
			});
		} catch (error) {
			console.error(error);
			ctx.reply(messages.GENERIC_ERROR_MESSAGE);
		}
	});
}
