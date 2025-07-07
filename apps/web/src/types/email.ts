export type EmailType = "sign-in" | "email-verification" | "forget-password";

export interface EmailPayload {
	to: string;
	type: EmailType;
	otp: string;
}

export interface EmailResponse {
	id: string;
	status: "sent" | "error";
	error?: string;
}

export interface ResendEmailData {
	id: string;
	from: string;
	to: string[];
	created_at: string;
}

export interface ResendError {
	message: string;
	name: string;
}
