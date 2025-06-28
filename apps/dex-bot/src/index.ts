import { validateStacksAddress } from "@stacks/transactions";
import { AxiosError } from "axios";
import * as dotenv from "dotenv";
import { Telegraf } from "telegraf";
import * as api from "./api";
dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN || "");
bot.start(async (ctx) => {
  try {
    console.log(ctx.chat.id.toString(), ctx.from.username);
    await api.createUser(ctx.chat.id.toString(), ctx.from.username);
    ctx.reply(
      "Welcome to the Dexion Wallet Watcher Bot!\n\nUse /track <wallet_address> <nickname> to start tracking a wallet.\nUse /list to see your tracked wallets.\nUse /untrack <wallet_address> to stop tracking a wallet.",
    );
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(error.response.data);
    }
    ctx.reply("An error occurred while setting up your account.");
  }
});
bot.command("track", async (ctx) => {
  const [_, walletAddress, nickname] = ctx.message.text.split(" ");
  if (!walletAddress || !nickname) {
    return ctx.reply("Usage: /track <wallet_address> <nickname>");
  }
  if (!validateStacksAddress(walletAddress)) {
    return ctx.reply("Invalid stacks address");
  }
  try {
    await api.trackWallet(ctx.chat.id.toString(), walletAddress, nickname);
    ctx.reply(`Successfully started tracking ${walletAddress} as ${nickname}.`);
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(error.response.data);
    }
    ctx.reply("An error occurred while tracking the wallet.");
  }
});
bot.command("list", async (ctx) => {
  try {
    const response = await api.getTrackedWallets(ctx.chat.id);
    const wallets = response.data.data;
    if (!wallets || wallets.length === 0) {
      return ctx.reply("You are not tracking any wallets.");
    }
    const walletList = wallets
      .map((wallet: any) => `- ${wallet.address} (${wallet.nickname})`)
      .join("\n");
    ctx.reply(`Tracked wallets:\n${walletList}`);
  } catch (error) {
    console.error(error);
    ctx.reply("An error occurred while fetching your tracked wallets.");
  }
});
bot.command("untrack", async (ctx) => {
  const [_, walletAddress] = ctx.message.text.split(" ");
  if (!walletAddress) {
    return ctx.reply("Usage: /untrack <wallet_address>");
  }
  try {
    await api.untrackWallet(ctx.chat.id, walletAddress);
    ctx.reply(`Successfully stopped tracking ${walletAddress}.`);
  } catch (error) {
    console.error(error);
    ctx.reply("An error occurred while untracking the wallet.");
  }
});
bot.launch();
console.log("Bot is running...");
