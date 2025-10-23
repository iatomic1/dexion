import { Job, Worker } from "bullmq";
import { emailQueue } from "@/queues";
import type { SendEmailAlertJobData } from "@/queues/types";
import { bullMqRedisConnection } from "@/config/redis";
import { Resend } from "resend";
import { getAlertEmail } from "@/lib/email";

const resend = new Resend(process.env.RESEND_API_KEY!);

const emailWorker = new Worker(
	emailQueue.name,
	async (job: Job<SendEmailAlertJobData>) => {
		try {
			console.log("📩 Received in email worker:", job.data);

			const { alert, token, userProfile: user } = job.data;

			const subject = `Alert Triggered - ${alert.metric} condition met for ${token.name}`;

			const response = await resend.emails.send({
				from: "Dexion <no-reply@auth.dexion.pro>",
				to: [user.email],
				subject,
				html: getAlertEmail({ token, alert }),
			});

			console.log("✅ Email sent successfully:", response);
			return response;
		} catch (err) {
			console.error("❌ Error in email worker:", err);
			throw err; // Ensure BullMQ marks job as failed
		}
	},
	{ connection: bullMqRedisConnection },
);

export default emailWorker;
