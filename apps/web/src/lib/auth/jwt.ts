import { type JWTPayload, jwtVerify } from "jose";
import type { AccessPayload, RefreshPayload } from "~/types/auth";

export type AuthPayload = RefreshPayload | AccessPayload;

export async function decodeJwt(token: string, JWT_SECRET: string) {
	const encoder = new TextEncoder();
	const secretKey = encoder.encode(JWT_SECRET);

	try {
		const { payload } = await jwtVerify(token, secretKey, {
			algorithms: ["HS256"],
		});

		const typedPayload = payload as JWTPayload & AuthPayload;

		if (typedPayload) {
			return typedPayload;
		}
	} catch (err) {
		console.error(err, "catch");
		return false;
	}
}
