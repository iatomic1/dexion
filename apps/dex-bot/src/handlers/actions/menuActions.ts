import { Telegraf } from "telegraf";
import * as api from "@/api";
import * as messages from "@/messages";
import type { DexBotContext } from "@/types/bot";

export function registerMenuActions(bot: Telegraf<DexBotContext>) {
	bot.action("add_wallet", (ctx) => {
		ctx.answerCbQuery();
		ctx.reply(messages.ADD_WALLET_PROMPT);
	});
}
