import { validateStacksAddress } from "@stacks/transactions";
import { AxiosError } from "axios";
import * as dotenv from "dotenv";
import { Telegraf } from "telegraf";
import * as api from "./api";
import * as messages from "./messages";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN || "");

const myChatId = process.env.MY_CHAT_ID;

bot.use(async (ctx, next) => {
  const chatId = ctx.chat?.id.toString();

  if (chatId === myChatId) {
    return next();
  }

  if (!myChatId) {
    console.error(
      "MY_CHAT_ID is not set. The bot will not respond to any user.",
    );
    return;
  }

  if (chatId) {
    try {
      await ctx.reply(messages.DEV_MODE_MESSAGE);
    } catch (e) {
      console.error(`Error replying to chat ${chatId}`, e);
    }
  }
  // For non-chat updates, we just don't call next(), so they are ignored.
});

bot.start(async (ctx) => {
  try {
    await api.createUser(ctx.chat.id.toString(), ctx.from.username);
    ctx.reply(messages.WELCOME_MESSAGE);
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(error.response?.data);
    }
    ctx.reply(messages.GENERIC_ERROR_MESSAGE);
  }
});

bot.command("track", async (ctx) => {
  const [_, walletAddress, nickname] = ctx.message.text.split(" ");
  if (!walletAddress || !nickname) {
    return ctx.reply(messages.TRACK_USAGE_MESSAGE);
  }
  if (!validateStacksAddress(walletAddress)) {
    return ctx.reply(messages.INVALID_ADDRESS_MESSAGE);
  }
  try {
    await api.trackWallet(ctx.chat.id.toString(), walletAddress, nickname);
    ctx.reply(messages.WALLET_TRACK_SUCCESS(walletAddress, nickname));

    ctx.reply(messages.NOTIFICATION_PREFERENCE_MESSAGE(nickname), {
      ...messages.preferenceKeyboard(walletAddress),
      parse_mode: "Markdown",
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(error.response?.data);
    }
    ctx.reply(messages.GENERIC_ERROR_MESSAGE);
  }
});

bot.command("list", async (ctx) => {
  try {
    const response = await api.getTrackedWallets(ctx.chat.id);
    const wallets = response.data.data;

    if (!wallets || wallets.length === 0) {
      return ctx.reply(messages.NO_WALLETS_TRACKED_MESSAGE);
    }

    const message = messages.getWalletListMessage(wallets);
    ctx.replyWithHTML(message, messages.listKeyboard);
  } catch (error) {
    console.error(error);
    ctx.reply(messages.GENERIC_ERROR_MESSAGE);
  }
});

bot.command("untrack", async (ctx) => {
  const [_, walletAddress] = ctx.message.text.split(" ");
  if (!walletAddress) {
    return ctx.reply(messages.UNTRACK_USAGE_MESSAGE);
  }
  try {
    await api.untrackWallet(ctx.chat.id, walletAddress);
    ctx.reply(messages.WALLET_UNTRACK_SUCCESS(walletAddress));
  } catch (error) {
    console.error(error);
    ctx.reply(messages.GENERIC_ERROR_MESSAGE);
  }
});

bot.command("settings", async (ctx) => {
  ctx.reply(messages.GLOBAL_NOTIFICATION_PREFERENCE_MESSAGE, {
    ...messages.globalSettingsKeyboard,
    parse_mode: "Markdown",
  });
});

bot.action("add_wallet", (ctx) => {
  ctx.answerCbQuery();
  ctx.reply(messages.ADD_WALLET_PROMPT);
});

bot.action("delete_wallet", (ctx) => {
  ctx.answerCbQuery();
  ctx.reply(messages.DELETE_WALLET_PROMPT);
});

bot.action("copy_addresses", async (ctx) => {
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

bot.action(/set_preference_(.+)/, async (ctx) => {
  const preference = ctx.match[1];
  try {
    await api.setWalletPreference(ctx.chat.id, preference);
    ctx.editMessageText(messages.PREFERENCE_SET_SUCCESS(preference), {
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.error(error);
    ctx.reply(messages.GENERIC_ERROR_MESSAGE);
  }
});

bot.launch();

console.log("Bot is running...");
