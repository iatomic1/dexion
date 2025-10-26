import { Job, Queue, Worker } from "bullmq";
import { emailQueue, emailQueueDlq } from "@/queues";
import type { SendEmailAlertJobData } from "@/queues/types";
import { bullMqRedisConnection } from "@/config/redis";
import { Resend } from "resend";
import { getAlertEmail } from "@/lib/messages/email";
import { logger } from "@/config/logger";
import { config } from "@/config";

const resend = new Resend(config.RESEND_API_KEY);

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
	{
		connection: bullMqRedisConnection,
		removeOnComplete: { count: 1000 },
		removeOnFail: { count: 5000 },
	},
);

emailWorker.on("failed", (job, err) => {
	if (job) {
		emailQueueDlq.add(job.name, job.data);
		logger.warn({ err, jobId: job.id }, `Moved job ${job.id} to DLQ`);
	}
});

export default emailWorker;
