import { DOMAIN_NAME, FRONTEND_URL } from "@repo/shared-constants/constants.ts";
import { createAuthClient } from "better-auth/client";
import { oneTimeTokenClient } from "better-auth/client/plugins";

export const authClient: any = createAuthClient({
	baseURL:
		process.env.NODE_ENV === "production"
			? `https://${DOMAIN_NAME}`
			: "http://localhost:3001",
	// baseURL: `https://beta.${DOMAIN_NAME}`,
	plugins: [oneTimeTokenClient()],
});

export type Session = typeof authClient.$Infer.Session;
