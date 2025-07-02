import { validateStacksAddress } from "@stacks/transactions";
import { AxiosError } from "axios";
import * as dotenv from "dotenv";
import { Telegraf } from "telegraf";
import * as api from "./api";
import * as messages from "./messages";
import redisClient from "./redis";
import { nanoid } from "nanoid";

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

bot.command("alert", async (ctx) => {
  const [_, contractAddress, direction, priceStr] = ctx.message.text.split(" ");
  const price = parseFloat(priceStr);

  if (!contractAddress || !direction || !price) {
    return ctx.reply(messages.ALERT_USAGE_MESSAGE);
  }

  if (direction !== "above" && direction !== "below") {
    return ctx.reply(messages.ALERT_USAGE_MESSAGE);
  }

  try {
    const alertId = nanoid();
    const alert = {
      id: alertId,
      chatId: ctx.chat.id.toString(),
      contractAddress,
      direction,
      price,
    };

    // Add to redis
    const redisKey = `price-alerts:${contractAddress}`;
    const redisValue = JSON.stringify({
      alertId: alert.id,
      userId: ctx.chat.id.toString(),
      direction,
    });
    await redisClient.zAdd(redisKey, [{ score: price, value: redisValue }]);
    await redisClient.hSet(`alert-details:${alertId}`, alert as any);

    ctx.reply(
      messages.ALERT_SET_SUCCESS(contractAddress, direction, price),
    );
  } catch (error) {
    console.error(error);
    ctx.reply(messages.GENERIC_ERROR_MESSAGE);
  }
});

bot.command("alerts", async (ctx) => {
  try {
    const alertKeys = await redisClient.keys("alert-details:*");
    if (alertKeys.length === 0) {
      return ctx.reply(messages.NO_ALERTS_MESSAGE);
    }

    const userAlerts = [];
    for (const key of alertKeys) {
      const alert = await redisClient.hGetAll(key);
      if (alert.chatId === ctx.chat.id.toString()) {
        userAlerts.push(alert);
      }
    }

    if (userAlerts.length === 0) {
      return ctx.reply(messages.NO_ALERTS_MESSAGE);
    }

    let message = "<b>Your Price Alerts:</b>\n";
    userAlerts.forEach((alert: any) => {
      message += `\n- <b>${alert.contractAddress}</b> ${alert.direction} ${alert.price} (ID: <code>${alert.id}</code>)`;
    });
    ctx.replyWithHTML(message);
  } catch (error) {
    console.error(error);
    ctx.reply(messages.GENERIC_ERROR_MESSAGE);
  }
});

bot.command("deletealert", async (ctx) => {
  const [_, alertId] = ctx.message.text.split(" ");
  if (!alertId) {
    return ctx.reply(messages.DELETE_ALERT_PROMPT);
  }
  try {
    const alert = await redisClient.hGetAll(`alert-details:${alertId}`);
    if (!alert.id || alert.chatId !== ctx.chat.id.toString()) {
      return ctx.reply("Alert not found or you do not own this alert.");
    }

    const redisKey = `price-alerts:${alert.contractAddress}`;
    const redisValue = JSON.stringify({
      alertId: alert.id,
      userId: alert.chatId,
      direction: alert.direction,
    });

    await redisClient.zRem(redisKey, redisValue);
    await redisClient.del(`alert-details:${alertId}`);

    ctx.reply(`✅ Alert ${alertId} deleted.`);
  } catch (error) {
    console.error(error);
    ctx.reply(messages.GENERIC_ERROR_MESSAGE);
  }
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
