"use server";
import { ResetPasswordEmail } from "@repo/transactional/reset-password.tsx";
import { Resend } from "resend";
import type { EmailType, ResendEmailData, ResendError } from "~/types/email";
import { getOtpEmailHtml } from "./otp-template";
import { getVerificationEmailHtml } from "./verify-email-template";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (
	email: string,
	type: EmailType,
	otp: string,
): Promise<
	{ success: true; data: ResendEmailData } | { success: false; error: string }
> => {
	if (!process.env.RESEND_API_KEY) {
		return { success: false, error: "RESEND_API_KEY is not configured" };
	}

	if (!email || !email.includes("@")) {
		return { success: false, error: "Invalid email address" };
	}

	if (!otp) {
		return { success: false, error: "OTP is required" };
	}

	try {
		const emailConfig = getEmailConfig(email, type, otp);

		const { data, error } = await resend.emails.send(emailConfig);

		if (error) {
			console.error("Resend API error:", error);
			return {
				success: false,
				error: `Failed to send email: ${error.message || "Unknown error"}`,
			};
		}

		if (!data) {
			return { success: false, error: "No data returned from email service" };
		}

		console.log("Email sent successfully:", data);
		return { success: true, data };
	} catch (err) {
		const errorMessage =
			err instanceof Error ? err.message : "Unknown error occurred";
		console.error("Unexpected error sending email:", err);
		return { success: false, error: errorMessage };
	}
};

const getEmailConfig = (email: string, type: EmailType, otp: string) => {
	const baseConfig = {
		from: "Dexion <no-reply@auth.dexion.pro>",
		to: [email],
	};

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
