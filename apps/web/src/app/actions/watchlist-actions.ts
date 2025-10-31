"use server";

import z from "zod";
import { assertUserAuthenticated } from "~/lib/auth/assert-user-authenticated";
import makeFetch from "~/lib/helpers/fetch";
import { authenticatedAction } from "~/lib/safe-action";
import type { ApiResponse } from "~/types";
import type { AuthSuccess } from "~/types/auth";
import type { UserWatchlist } from "~/types/wallets";

export async function getUserWatchlist() {
	const user = await assertUserAuthenticated();

	try {
		return await makeFetch<ApiResponse<UserWatchlist[]>>(
			"dexion",
			"watchlist",
			user.accessToken,
			{
				method: "GET",
			},
		)();
	} catch (err) {
		console.error(err);
	}
}

export const addToWatchlistAction = authenticatedAction
	.inputSchema(
		z.object({
			ca: z.string(),
		}),
	)
	.action(async ({ parsedInput: input, ctx: { user } }) => {
		try {
			return await makeFetch<ApiResponse<UserWatchlist>>(
				"dexion",
				"watchlist",
				user.accessToken,
				{
					method: "POST",
					body: {
						userId: user.userId,
						ca: input.ca,
					},
				},
			)();
		} catch (err) {
			console.error(JSON.stringify(err, null, 2));
			if (err instanceof Error) throw err;
			throw new Error("An unknown error occurred");
		}
	});

export const deleteWatchlistAction = authenticatedAction
	.inputSchema(
		z.object({
			id: z.string(),
		}),
	)
	.action(async ({ parsedInput: input, ctx: { user } }) => {
		try {
			return await makeFetch<ApiResponse<AuthSuccess>>(
				"dexion",
				`watchlist/${input.id}`,
				user.accessToken,
				{
					method: "DELETE",
				},
			)();
		} catch (err) {
			console.error(JSON.stringify(err, null, 2));
			if (err instanceof Error) throw err;
			throw new Error("An unknown error occurred");
		}
	});
