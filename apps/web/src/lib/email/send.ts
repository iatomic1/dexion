"use server";
import {
	getOtpEmailHtml,
	getVerificationEmailHtml,
	sendEmail as sendEmailShared,
} from "@dexion/transactional";
import { ResetPasswordEmail } from "@dexion/transactional/reset-password.tsx";
import type { EmailType } from "~/types/email";

export const sendEmail = async (
	email: string,
	type: EmailType,
	otp: string,
): Promise<
	{ success: true; data: { id: string } } | { success: false; error: string }
> => {
	if (!email || !email.includes("@")) {
		return { success: false, error: "Invalid email address" };
	}

	if (!otp) {
		return { success: false, error: "OTP is required" };
	}

	const emailConfig = getEmailConfig(email, type, otp);
	const result = await sendEmailShared(emailConfig);

	if (!result.success) {
		console.error("Resend API error:", result.error);
		return {
			success: false,
			error: `Failed to send email: ${result.error}`,
		};
	}

	console.log("Email sent successfully:", result.id);
	return { success: true, data: { id: result.id } };
};

const getEmailConfig = (email: string, type: EmailType, otp: string) => {
	const baseConfig = { to: email };

	switch (type) {
		case "email-verification":
			return {
				...baseConfig,
				subject: "Verify your email address",
				html: getVerificationEmailHtml({
					username: email,
					verificationCode: otp,
				}),
			};

		case "sign-in":
			return {
				...baseConfig,
				subject: "Dexion OTP",
				html: getOtpEmailHtml({ username: email, otp }),
			};

		case "forget-password":
			return {
				...baseConfig,
				subject: "Reset Your Password",
				react: ResetPasswordEmail({
					resetPasswordLink: otp,
					userFirstname: email,
				}),
			};

		default:
			throw new Error(`Unsupported email type: ${type}`);
	}
};
