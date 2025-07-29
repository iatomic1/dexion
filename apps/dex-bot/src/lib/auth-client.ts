import { createAuthClient } from "better-auth/client";
import { oneTimeTokenClient } from "better-auth/client/plugins";

export const authClient: any = createAuthClient({
	baseURL:
		process.env.NODE_ENV === "development"
			? "http://localhost:3001"
			: process.env.VERCEL_URL,
	plugins: [oneTimeTokenClient()],
});

export type Session = typeof authClient.$Infer.Session;
