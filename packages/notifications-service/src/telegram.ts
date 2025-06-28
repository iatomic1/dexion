import { Telegraf } from 'telegraf';

export async function sendTelegramMessage(botToken: string, chatId: string, message: string) {
  const bot = new Telegraf(botToken);
  await bot.telegram.sendMessage(chatId, message);
}
