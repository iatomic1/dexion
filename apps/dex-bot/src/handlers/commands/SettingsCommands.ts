
import { Telegraf } from 'telegraf';
import * as messages from '../../messages';

export class SettingsCommands {
    constructor(private bot: Telegraf<any>) {}

    register() {
        this.bot.command("settings", async (ctx) => {
            ctx.reply(messages.GLOBAL_NOTIFICATION_PREFERENCE_MESSAGE, {
                ...messages.globalSettingsKeyboard,
                parse_mode: "Markdown",
            });
        });
    }
}
