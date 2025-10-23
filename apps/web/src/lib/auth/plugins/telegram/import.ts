import { telegram } from "./index";

export function getTelegramPlugin() {
	const token = process.env.TELEGRAM_BOT_TOKEN;
	if (!token) {
		console.warn("⚠️ TELEGRAM_BOT_TOKEN missing — skipping Telegram plugin");
		return null;
	}

	return telegram({
		botToken: token,
		botUsername: "dex1933_bot",
	});
}
