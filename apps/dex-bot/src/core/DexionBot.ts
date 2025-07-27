import { Telegraf } from "telegraf";
import { registerActionHandlers } from "../handlers/actions";
import { AlertCommands } from "../handlers/commands/AlertCommands";
import { GeneralCommands } from "../handlers/commands/GeneralCommands";
import { SettingsCommands } from "../handlers/commands/SettingsCommands";
import { WalletCommands } from "../handlers/commands/WalletCommands";
import { registerMiddleware } from "../handlers/middleware";
import type { DexBotContext } from "../types/bot";
import { SessionManager } from "./SessionManager";

export class DexionBot {
	public readonly bot: Telegraf<DexBotContext>;
	private sessionManager: SessionManager;

	constructor(private token: string) {
		if (!token) {
			throw new Error("Bot token is not provided!");
		}
		this.bot = new Telegraf<DexBotContext>(token);
		this.sessionManager = new SessionManager();

		this.setup();
	}

	private setup(): void {
		this.bot.use(this.sessionManager.getSessionMiddleware());

		registerMiddleware(this.bot);

		new GeneralCommands(this.bot).register();
		new WalletCommands(this.bot).register();
		new AlertCommands(this.bot).register();
		new SettingsCommands(this.bot).register();

		registerActionHandlers(this.bot);
	}

	public start(): void {
		console.log("Bot is starting...");
		this.bot.launch().then(() => {
			console.log("Bot started successfully.");
		});

		// Graceful shutdown
		process.once("SIGINT", () => this.bot.stop("SIGINT"));
		process.once("SIGTERM", () => this.bot.stop("SIGTERM"));
	}
}