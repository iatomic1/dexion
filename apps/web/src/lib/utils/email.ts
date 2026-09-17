import { sendEmailWithTrigger } from "~/trigger/send-email";
import type { EmailType } from "~/types/email";

export const handleEmailSendingImmediate = async (
	email: string,
	type: EmailType,
	otp: string,
): Promise<void> => {
	const handle = await sendEmailWithTrigger.trigger({
		to: email,
		type,
		otp,
	});

	console.log(
		`Email task triggered for ${type} email to ${email}, Run ID: ${handle.id}`,
	);
};
