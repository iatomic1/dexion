import { Resend } from "resend";
import { config } from "@/config";
import { logger } from "@/config/logger";
import { getAlertEmail } from "@/core/notifications/templates/email";
import { getHodlmmAlertEmail } from "@/core/notifications/templates/email-hodlmm";
import type { INotifier, NotificationJobData } from "@/core/queues";

export class EmailNotifier implements INotifier {
	private resend: Resend;

	constructor() {
		this.resend = new Resend(config.RESEND_API_KEY);
	}

	async send(payload: NotificationJobData): Promise<void> {
		const { userProfile } = payload;

		if (!userProfile.email) {
			logger.warn("User has no email for notification");
			return;
		}

		let subject = "";
		let html = "";

		if (payload.type === "token") {
			const { alert, token } = payload;
			subject = `Alert Triggered: ${token.name} ${alert.metric} ${alert.operator} ${alert.value}`;
			html = getAlertEmail({ token, alert });
		} else if (payload.type === "hodlmm") {
			const { alert, currentStatus } = payload;
			const statusText =
				currentStatus === "out-of-range" ? "Out of Range" : "Back in Range";
			subject = `HODLMM Alert: ${alert.displayName} is ${statusText}`;
			html = getHodlmmAlertEmail(payload);
		}

		try {
			const response = await this.resend.emails.send({
				from: "Dexion <no-reply@auth.dexion.pro>",
				to: [userProfile.email],
				subject,
				html,
			});
			logger.info(response, "✅ Email sent successfully");
		} catch (err) {
			logger.error(err, "❌ Error sending email");
			throw err;
		}
	}
}
