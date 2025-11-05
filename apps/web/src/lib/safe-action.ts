import { redirect } from "next/navigation";
import { createMiddleware, createSafeActionClient } from "next-safe-action";
import { assertUserAuthenticated } from "~/lib/auth/assert-user-authenticated";

export const unauthenticatedAction = createSafeActionClient({});

export const authMiddleware = createMiddleware().define(
	async ({ ctx, next }) => {
		const user = await assertUserAuthenticated();
		if (!user) redirect("/login");
		return next({ ctx: { user } });
	},
);

export const authenticatedAction = createSafeActionClient({
	handleServerError: (e) => {
		console.error("Action error:", e.message);
		return {
			errorMessage: e.message,
		};
	},
}).use(authMiddleware);
