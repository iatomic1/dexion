"use server";
import { PUBLIC_BASE_URL } from "@repo/shared-constants/constants.ts";
import { headers } from "next/headers";

export const withAuth = async () => {
	const headersList = await headers();
	const cookie = headersList.get("cookie");
	const url = `${PUBLIC_BASE_URL}/api/auth/get-session`;

	const session = await fetch(url, {
		headers: {
			"Content-Type": "application/json",
			cookie: cookie ?? "",
		},
	}).then((res) => res.json());

	return session ?? { user: null, session: null };
};
