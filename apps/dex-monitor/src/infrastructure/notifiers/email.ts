import { sendEmail } from "@dexion/transactional";
import { logger } from "@/config/logger";
import { getAlertEmail } from "@/core/notifications/templates/email";
import { getHodlmmAlertEmail } from "@/core/notifications/templates/email-hodlmm";
import type { INotifier, NotificationJobData } from "@/core/queues";

export class EmailNotifier implements INotifier {
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

		const result = await sendEmail({ to: userProfile.email, subject, html });

		if (!result.success) {
			logger.error({ err: result.error }, "❌ Error sending email");
			throw new Error(result.error);
		}

		logger.info(result, "✅ Email sent successfully");
	}
}
