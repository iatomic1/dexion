import { createAuthClient } from "better-auth/client";
import { oneTimeTokenClient } from "better-auth/client/plugins";

export const authClient: any = createAuthClient({
	baseURL:
		process.env.NODE_ENV === "production"
			? `https://${process.env.VERCEL_URL}`
			: "http://localhost:3001",
	plugins: [oneTimeTokenClient()],
});

export type Session = typeof authClient.$Infer.Session;
