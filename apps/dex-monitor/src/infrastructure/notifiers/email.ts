import { Resend } from "resend";
import { config } from "@/config";
import { logger } from "@/config/logger";
import type {
	INotifier,
	NotificationPayload,
} from "@/core/notifications/notifier";
import { getAlertEmail } from "@/core/notifications/templates/email";

export class EmailNotifier implements INotifier {
	private resend: Resend;

	constructor() {
		this.resend = new Resend(config.RESEND_API_KEY);
	}

	async send(payload: NotificationPayload): Promise<void> {
		const { alert, token, userProfile } = payload;

		if (!userProfile.email) {
			logger.warn(
				{ userId: alert.userId },
				"User has no email for notification",
			);
			return;
		}

		const subject = `Alert Triggered: ${token.name} ${alert.metric} ${alert.operator} ${alert.value}`;
		const html = getAlertEmail({ token, alert });

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
			throw err; // Re-throw to allow job retries
		}
	}
}
