import { telegram } from "./index";

export function getTelegramPlugin() {
	const token = process.env.TELEGRAM_BOT_TOKEN;
	const username = process.env.TELEGRAM_BOT_USERNAME;
	if (!token) {
		console.warn("⚠️ TELEGRAM_BOT_TOKEN missing — skipping Telegram plugin");
		return null;
	}

	if (!username) {
		console.warn("⚠️ TELEGRAM_BOT_USERNAME missing — skipping Telegram plugin");
		return null;
	}
	return telegram({
		botToken: token,
		botUsername: username,
	});
}
