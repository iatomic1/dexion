import { Telegraf } from 'telegraf';
import { registerWalletActions } from './walletActions';
import { registerPreferenceActions } from './preferenceActions';
import { DexBotContext } from '../../types/bot';

export function registerActionHandlers(bot: Telegraf<DexBotContext>) {
    registerWalletActions(bot);
    registerPreferenceActions(bot);
}