"use server";
import { PUBLIC_BASE_URL } from "@repo/shared-constants/constants.ts";
import { headers } from "next/headers";
import type { AuthSuccess } from "~/types/auth";
import { auth } from "../auth";

export const assertUserAuthenticated = async (): Promise<AuthSuccess> => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		throw new Error("Not authenticated");
	}

	const tokenRes = await fetch(`${PUBLIC_BASE_URL}/api/auth/token`, {
		headers: {
			Authorization: `Bearer ${session.session.token}`,
		},
	});
	if (!tokenRes.ok) {
		throw new Error("Error trying to get the access token");
	}

	const tokenData: { token: string } = await tokenRes.json();

	try {
		return {
			accessToken: tokenData.token as string,
			userId: session.user.id,
			session: session,
		};
	} catch (error) {
		console.error("Error parsing user data:", error);
		throw new Error("Invalid authentication");
	}
};
