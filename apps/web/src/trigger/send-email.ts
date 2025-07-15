import { logger, task } from "@trigger.dev/sdk/v3";
import { sendEmail } from "~/lib/email/send";
import type { EmailPayload, EmailResponse } from "~/types/email";

export const sendEmailWithTrigger = task({
	id: "send-react-email",
	run: async (payload: EmailPayload): Promise<EmailResponse> => {
		// Validate payload
		if (!payload.to || !payload.type || !payload.otp) {
			const error = "Invalid payload: missing required fields (to, type, otp)";
			logger.error(error, { payload });
			throw new Error(error);
		}

		try {
			logger.info("Sending email using React.email and Resend", {
				to: payload.to,
				type: payload.type,
			});

			const result = await sendEmail(payload.to, payload.type, payload.otp);

			if (result.success) {
				logger.info("Email sent successfully", {
					to: payload.to,
					emailId: result.data.id,
				});

				return {
					id: result.data.id,
					status: "sent",
				};
			}
			logger.error("Failed to send email", {
				to: payload.to,
				error: result.error,
			});

			return {
				id: "",
				status: "error",
				error: result.error,
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			logger.error("Unexpected error in email task", {
				error: errorMessage,
				payload: { to: payload.to, type: payload.type },
			});

			// Re-throw to let Trigger.dev handle retries
			throw new Error(`Email task failed: ${errorMessage}`);
		}
	},
});
