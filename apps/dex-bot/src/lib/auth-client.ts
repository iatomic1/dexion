import { createAuthClient } from "better-auth/client";
import { oneTimeTokenClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
	baseURL: "http://localhost:3001",
	plugins: [oneTimeTokenClient()],
});
