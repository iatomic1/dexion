import { DexionApiSDK } from "@repo/api-sdk";
import { Telegraf } from "telegraf";
import * as api from "@/api";
import * as messages from "@/messages";
import type { DexBotContext } from "@/types/bot";

export function registerWalletActions(bot: Telegraf<DexBotContext>) {
	bot.action("add_wallet", (ctx) => {
		const sdk = new DexionApiSDK(
			ctx.session.session_data?.accessToken,
			ctx.session.session_data.user.id,
			false,
		);
		console.log(sdk.wallets.getWallets());
		ctx.answerCbQuery();
		ctx.reply(messages.ADD_WALLET_PROMPT);
	});

	bot.action("delete_wallet", (ctx) => {
		const sdk = new DexionApiSDK(
			ctx.session.session_token,
			ctx.session.session_data.user.id,
			false,
		);

		ctx.answerCbQuery();
		ctx.reply(messages.DELETE_WALLET_PROMPT);
	});

	bot.action("copy_addresses", async (ctx) => {
		if (!ctx.chat) return ctx.answerCbQuery("Could not identify chat.");
		try {
			const response = await api.getTrackedWallets(ctx.chat.id);
			const wallets = response.data.data;
			const message = messages.getCopyAddressesMessage(wallets);
			ctx.replyWithHTML(message);
			ctx.answerCbQuery("Copied addresses to clipboard!");
		} catch (error) {
			console.error(error);
			ctx.answerCbQuery(messages.GENERIC_ERROR_MESSAGE);
		}
	});

	bot.action("back", (ctx) => {
		ctx.answerCbQuery();
		ctx.editMessageText(messages.BACK_TO_MAIN_MESSAGE, messages.backKeyboard);
	});
}
