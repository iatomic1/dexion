import * as dotenv from "dotenv";
import { DexionBot } from "./core/DexionBot";

// Load environment variables
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
	console.error("BOT_TOKEN must be provided!");
	process.exit(1);
}

const app = new DexionBot(BOT_TOKEN);
app.start();
