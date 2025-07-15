import type { auth } from "~/lib/auth";
export type Session = typeof auth.$Infer.Session;
export type User = (typeof auth.$Infer.Session)["user"];
export type AuthSuccess = {
	accessToken: string;
	userId: string;
	session: Session;
};

export type AccessPayload = {
	authenticatedUserId: string;
	expires: number;
	iat: number;
	refresh: false;
};

export type RefreshPayload = {
	expires: number;
	iat: number;
	refresh: true;
	jti: string;
};
