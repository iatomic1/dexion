import { Markup, Telegraf } from "telegraf";
import { authClient } from "@/lib/auth-client";
import type { DexBotContext } from "@/types/bot";

const LOGO_URL =
	"https://ik.imagekit.io/rhmwnsdz3/Private/dex.png?updatedAt=1753630428352";
export class GeneralCommands {
	constructor(private bot: Telegraf<DexBotContext>) {}

	register() {
		this.bot.start(async (ctx) => {
			const messageText = ctx.message.text;
			console.log("Received /start message:", messageText);

			const startPayloadPrefix = "ott_verify_";

			if (messageText.startsWith(`/start ${startPayloadPrefix}`)) {
				const fullPayload = messageText.substring("/start ".length);

				if (fullPayload.startsWith(startPayloadPrefix)) {
					const ottToken = fullPayload.substring(startPayloadPrefix.length);

					console.log("Extracted OTT Token:", ottToken);

					try {
						const { data, error } = await authClient.oneTimeToken.verify({
							token: ottToken,
						});
						if (error) {
							await ctx.reply(
								"Authentication failed. Invalid or expired token.",
							);
							return;
						}

						if (data.session && data.user) {
							ctx.session.session_token = data.session.token;
							ctx.session.session_data = {
								session: { ...data.session },
								user: { ...data.user },
							};

							await ctx.replyWithPhoto(LOGO_URL, mainMenuMessage(data.user));
						} else {
							await ctx.reply(
								"Authentication failed. Invalid or expired token.",
							);
						}
					} catch (error) {
						console.error("Error verifying OTT with Better-Auth:", error);
						await ctx.reply(
							"An error occurred during authentication. Please try again.",
						);
					}
				} else {
					await ctx.reply("Welcome! Send /login to authenticate.");
				}
			} else {
				await ctx.reply(
					"Welcome to the bot! Send /login to authenticate with your account.",
				);
			}
		});
		this.bot.command("menu", async (ctx) => {
			const user = ctx.session.session_data.user;
			await ctx.replyWithPhoto(LOGO_URL, mainMenuMessage(user));
		});
	}
}

function mainMenuMessage(user: { email: string; walletAddress: string }) {
	return {
		caption: `🚀 *Welcome to DEX-BOT*
🪙 Fast on-chain, click to trade.
🧠 Auto sell with stop loss/take profit.
📉 Track smart money & KOLs with alerts.
📈 Real-time wallet P&L analysis.

Logged in as ${user.email}
Wallet: \`${user.walletAddress}\`
`,

		parse_mode: "Markdown" as const,
		...Markup.inlineKeyboard([
			[
				Markup.button.callback("👛 Wallets", "wallets"),
				Markup.button.callback("📃 Watchlists", "watchlists"),
			],
			[
				Markup.button.callback("🚨 Price Alerts", "price_alerts"),
				Markup.button.callback("🔄 Refresh", "refresh"),
			],
			[
				Markup.button.callback("🚪 Logout", "logout"),
				Markup.button.callback("💼 My Wallet", "my_wallet"),
			],
			[
				Markup.button.callback("🎁 Referrals", "referrals"),
				Markup.button.callback("❓ Help", "help"),
			],
			[Markup.button.callback("⚙️ Settings", "settings")],
		]),
	};
}
