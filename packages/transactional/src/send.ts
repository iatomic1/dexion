import type { ReactElement } from "react";
import { Resend } from "resend";

const FROM_ADDRESS = "Dexion <no-reply@auth.dexion.pro>";

export interface SendEmailInput {
	to: string | string[];
	subject: string;
	html?: string;
	react?: ReactElement;
}

export type SendEmailResult =
	| { success: true; id: string }
	| { success: false; error: string };

let resendClient: Resend | undefined;

function getResendClient(): Resend {
	if (!process.env.RESEND_API_KEY) {
		throw new Error("RESEND_API_KEY is not configured");
	}
	if (!resendClient) {
		resendClient = new Resend(process.env.RESEND_API_KEY);
	}
	return resendClient;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
	if (!process.env.RESEND_API_KEY) {
		return { success: false, error: "RESEND_API_KEY is not configured" };
	}

	try {
		const resend = getResendClient();
		const base = {
			from: FROM_ADDRESS,
			to: Array.isArray(input.to) ? input.to : [input.to],
			subject: input.subject,
		};
		const { data, error } = input.react
			? await resend.emails.send({ ...base, react: input.react })
			: await resend.emails.send({ ...base, html: input.html ?? "" });

		if (error) {
			return { success: false, error: error.message || "Unknown error" };
		}
		if (!data) {
			return { success: false, error: "No data returned from email service" };
		}
		return { success: true, id: data.id };
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : "Unknown error occurred",
		};
	}
}
