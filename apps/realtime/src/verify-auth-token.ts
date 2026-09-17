import { FRONTEND_URL } from "@dexion/shared";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { logger } from "./config/logger";

const baseUrl =
	process.env.NODE_ENV === "production"
		? FRONTEND_URL
		: "http://localhost:3001";

export async function validateToken(token: string) {
	try {
		const JWKS = createRemoteJWKSet(new URL(`${baseUrl}/api/auth/jwks`));
		const { payload } = await jwtVerify(token, JWKS, {
			issuer: baseUrl,
			audience: baseUrl,
		});
		return payload;
	} catch (error) {
		logger.error(error, "Token validation failed:");
		throw error;
	}
}
