"use server";
import { PUBLIC_BASE_URL } from "@repo/shared-constants/constants.ts";
import { headers } from "next/headers";
import type { AuthSuccess } from "~/types/auth";
import { authClient } from "../auth-client";
import { auth } from "./auth";

export const assertUserAuthenticated = async (): Promise<AuthSuccess> => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		throw new Error("Not authenticated");
	}

	const tokenData = await auth.api.getToken({
		headers: await headers(),
	});
	if (!tokenData.token) {
		throw new Error("Error trying to get the access token");
	}

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
