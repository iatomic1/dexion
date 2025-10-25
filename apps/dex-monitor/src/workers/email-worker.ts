import { Job, Worker } from "bullmq";
import { emailQueue } from "@/queues";
import type { SendEmailAlertJobData } from "@/queues/types";
import { bullMqRedisConnection } from "@/config/redis";
import { Resend } from "resend";
import { getAlertEmail } from "@/lib/email";
import { logger } from "@/config/logger";

const resend = new Resend(process.env.RESEND_API_KEY!);

const emailWorker = new Worker(
	emailQueue.name,
	async (job: Job<SendEmailAlertJobData>) => {
		try {
			logger.info(job.data, "📩 Received in email worker:");

			const { alert, token, userProfile: user } = job.data;

			const subject = `Alert Triggered - ${alert.metric} condition met for ${token.name}`;

			const response = await resend.emails.send({
				from: "Dexion <no-reply@auth.dexion.pro>",
				to: [user.email],
				subject,
				html: getAlertEmail({ token, alert }),
			});

			logger.info(response, "✅ Email sent successfully:");
			return response;
		} catch (err) {
			logger.error(err, "❌ Error in email worker:");
			throw err; // Ensure BullMQ marks job as failed
		}
	},
	{ connection: bullMqRedisConnection },
);

export default emailWorker;
