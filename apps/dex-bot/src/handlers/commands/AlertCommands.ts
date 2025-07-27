
import { Telegraf } from 'telegraf';
import { PriceAlertService } from '../../services/PriceAlertService';
import * as messages from '../../messages';

export class AlertCommands {
    private priceAlertService: PriceAlertService;

    constructor(private bot: Telegraf<any>) {
        this.priceAlertService = new PriceAlertService();
    }

    register() {
        this.bot.command("alert", async (ctx) => {
            const [_, contractAddress, direction, priceStr] = ctx.message.text.split(" ");
            const price = Number.parseFloat(priceStr);

            if (!contractAddress || !direction || !price || (direction !== 'above' && direction !== 'below')) {
                return ctx.reply(messages.ALERT_USAGE_MESSAGE);
            }

            const result = await this.priceAlertService.createAlert(ctx.chat.id.toString(), contractAddress, direction, price);
            return ctx.reply(result);
        });

        this.bot.command("alerts", async (ctx) => {
            const result = await this.priceAlertService.listAlerts(ctx.chat.id.toString());
            return ctx.replyWithHTML(result);
        });

        this.bot.command("deletealert", async (ctx) => {
            const [_, alertId] = ctx.message.text.split(" ");
            if (!alertId) {
                return ctx.reply(messages.DELETE_ALERT_PROMPT);
            }
            const result = await this.priceAlertService.deleteAlert(ctx.chat.id.toString(), alertId);
            return ctx.reply(result);
        });
    }
}
