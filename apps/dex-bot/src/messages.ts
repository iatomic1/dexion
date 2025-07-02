import { Markup } from "telegraf";

// Welcome Message
export const WELCOME_MESSAGE =
  "Welcome to the Dexion Wallet Watcher Bot!\n\nUse /track <wallet_address> <nickname> to start tracking a wallet.\nUse /list to see your tracked wallets.\nUse /untrack <wallet_address> to stop tracking a wallet.\nUse /settings to change notification preferences.";

// Usage Messages
export const TRACK_USAGE_MESSAGE = "Usage: /track <wallet_address> <nickname>";
export const UNTRACK_USAGE_MESSAGE = "Usage: /untrack <wallet_address>";

// Confirmation & Error Messages
export const INVALID_ADDRESS_MESSAGE = "Invalid stacks address";
export const GENERIC_ERROR_MESSAGE = "An error occurred. Please try again later.";
export const WALLET_TRACK_SUCCESS = (address: string, nickname: string) =>
  `Successfully started tracking ${address} as ${nickname}.`;
export const WALLET_UNTRACK_SUCCESS = (address: string) =>
  `Successfully stopped tracking ${address}.`;
export const NO_WALLETS_TRACKED_MESSAGE = "You are not tracking any wallets.";
export const PREFERENCE_SET_SUCCESS = (preference: string) =>
  `Notification preference set to *${preference}*.`;
export const ADD_WALLET_PROMPT = "Please use the /track command to add a new wallet.";
export const DELETE_WALLET_PROMPT = "Please use the /untrack command to delete a wallet.";
export const DEV_MODE_MESSAGE = "this bot is still in dev";
export const BACK_TO_MAIN_MESSAGE = "What would you like to do next?";

// Price Alert Messages
export const ALERT_USAGE_MESSAGE =
  "Usage: /alert <contract_address> <above|below> <price>";
export const ALERT_SET_SUCCESS = (
  contractAddress: string,
  direction: string,
  price: number,
) => `✅ Alert set: ${contractAddress} ${direction} ${price}.`;
export const NO_ALERTS_MESSAGE = "You have no active price alerts.";
export const DELETE_ALERT_PROMPT = "Please use /deletealert <alert_id> to remove an alert.";



// Notification Preference Message
export const NOTIFICATION_PREFERENCE_MESSAGE = (nickname: string) =>
  `When would you like to be notified for ${nickname}?\n\n*Mempool*: Instant notification, but the transaction might fail.\n*Confirmed*: Slower notification, but the transaction is confirmed on-chain.`;

export const GLOBAL_NOTIFICATION_PREFERENCE_MESSAGE =
  `When would you like to be notified?\n\n*Mempool*: Instant notification, but the transaction might fail.\n*Confirmed*: Slower notification, but the transaction is confirmed on-chain.`;


// List Wallets Message
export const getWalletListMessage = (wallets: any[]): string => {
  // Header
  let message = `<b>Total STX Wallets: ${wallets.length} / 10</b>\n`;
  message += `This bot: ${wallets.length} | Other bots: 0\n`;
  message += `Groups & Discord & Dedicated: 0\n\n`;

  // Legend
  message += `✅ - Wallet is active\n`;
  message += `⏸ - You paused this wallet\n`;
  message += `⏳ - Wallet was sending too many txs and is paused\n`;
  message += `🔴 - Renew premium to continue tracking this wallet\n\n`;

  // Wallet List
  const walletList = wallets
    .map((wallet: any, index: number) => {
      return `✅ /w_${index}\n<code>${wallet.address}</code> (${wallet.nickname})`;
    })
    .join("\n\n");

  message += walletList;

  // Footer
  message += `\n\nTip: Click on /w_... to change wallet settings`;
  message += `\nPage 1/1`;

  return message;
};

// Copy Addresses Message
export const getCopyAddressesMessage = (wallets: any[]): string => {
    if (!wallets || wallets.length === 0) {
        return "You are not tracking any wallets.";
    }
    const walletAddresses = wallets.map((wallet: any) => wallet.address).join("\n");
    return `<code>${walletAddresses}</code>`;
}

// Keyboards
export const preferenceKeyboard = (walletAddress: string) => Markup.inlineKeyboard([
    Markup.button.callback(
      "Mempool (Instant)",
      `set_preference_${walletAddress}_mempool`,
    ),
    Markup.button.callback(
      "Confirmed (Reliable)",
      `set_preference_${walletAddress}_confirmed`,
    ),
]);

export const globalSettingsKeyboard = Markup.inlineKeyboard([
    Markup.button.callback(
      "Mempool (Instant)",
      `set_preference_mempool`,
    ),
    Markup.button.callback(
      "Confirmed (Reliable)",
      `set_preference_confirmed`,
    ),
]);

export const listKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback("✨ Add", "add_wallet"), Markup.button.callback("🗑️ Delete", "delete_wallet")],
    [Markup.button.callback("Copy addresses", "copy_addresses")],
    [Markup.button.callback("⬅️ Back", "back")]
]);

export const backKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback("List Wallets", "list_wallets")],
    [Markup.button.callback("Settings", "settings")]
]);
