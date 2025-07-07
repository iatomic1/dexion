import { sendEmailWithTrigger } from "~/trigger/send-email";
import { EmailType } from "~/types/email";

export const handleEmailSendingImmediate = async (
	email: string,
	type: EmailType,
	otp: string,
): Promise<void> => {
	sendEmailWithTrigger
		.trigger({
			to: email,
			type,
			otp,
		})
		.then((handle) => {
			console.log(
				`Email task triggered for ${type} email to ${email}, Run ID: ${handle.id}`,
			);
		})
		.catch((error) => {
			console.error(`Error triggering ${type} email to ${email}:`, error);
		});

	return Promise.resolve();
};
