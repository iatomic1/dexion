import { DexionApiSDK } from "@repo/api-sdk";
import { Telegraf } from "telegraf";
import * as messages from "../../messages";
import { WalletService } from "../../services/WalletService";

export class WalletCommands {
	private walletService: WalletService;

	constructor(private bot: Telegraf<any>) {
		this.walletService = new WalletService();
	}

	register() {
		this.bot.command("track", async (ctx) => {
			const [_, walletAddress, nickname] = ctx.message.text.split(" ");
			if (!walletAddress || !nickname) {
				return ctx.reply(messages.TRACK_USAGE_MESSAGE);
			}
			const result = await this.walletService.trackWallet(
				ctx.chat.id.toString(),
				walletAddress,
				nickname,
			);
			if (typeof result === "string") {
				return ctx.reply(result);
			}
			return ctx.reply(result.text, result.options);
		});

		this.bot.command("list", async (ctx) => {
			const sdk = new DexionApiSDK(
				ctx.session.session_data?.session.accessToken,
				ctx.session.session_data.user.id,
				false,
			);
			console.log(await sdk.wallets.getWallets());
			await ctx.reply("Moshi moshi");
		});

		this.bot.command("untrack", async (ctx) => {
			const [_, walletAddress] = ctx.message.text.split(" ");
			if (!walletAddress) {
				return ctx.reply(messages.UNTRACK_USAGE_MESSAGE);
			}
			const result = await this.walletService.untrackWallet(
				ctx.chat.id,
				walletAddress,
			);
			return ctx.reply(result);
		});
	}
}
