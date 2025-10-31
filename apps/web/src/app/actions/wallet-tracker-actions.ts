"use server";
import { z } from "zod";
import makeFetch from "~/lib/helpers/fetch";
import { authenticatedAction } from "~/lib/safe-action";
import type { ApiResponse } from "~/types";
import type { AuthSuccess } from "~/types/auth";
import type { UserWallet } from "~/types/wallets";

export const trackWalletAction = authenticatedAction
	.inputSchema(
		z.object({
			emoji: z.string(),
			nickname: z.string(),
			walletAddress: z.string(),
		}),
	)
	.action(async ({ parsedInput: input, ctx: { user } }) => {
		try {
			return await makeFetch<ApiResponse<UserWallet>>(
				"dexion",
				"wallets",
				user.accessToken,
				{
					method: "POST",
					body: {
						emoji: input.emoji,
						nickname: input.nickname,
						userId: user.userId,
						walletAddress: input.walletAddress,
					},
					next: {
						// tags: ["wallets"],
					},
				},
			)();
		} catch (err) {
			console.error(err);
			if (err instanceof Error) throw err;
			throw new Error("An unknown error occurred");
		}
	});

export const updateWalletPreferences = authenticatedAction
	.inputSchema(
		z.object({
			nickname: z.string().optional(),
			notifications: z.boolean().optional(),
			walletAddress: z.string(),
		}),
	)
	.action(async ({ parsedInput: input, ctx: { user } }) => {
		try {
			const body = {
				nickname: input.nickname,
				notifcations: input.notifications,
			};

			return await makeFetch<ApiResponse<UserWallet>>(
				"dexion",
				`wallets/${input.walletAddress}`,
				user.accessToken,
				{
					method: "PATCH",
					body,
					next: {
						// tags: ["wallets"],
					},
				},
			)();
		} catch (err) {
			console.error(err);
			throw err;
		}
	});

export const untrackWalletAction = authenticatedAction
	.inputSchema(
		z.object({
			walletAddress: z.string(),
		}),
	)
	.action(async ({ parsedInput: input, ctx: { user } }) => {
		try {
			return await makeFetch<ApiResponse<AuthSuccess>>(
				"dexion",
				`wallets/${input.walletAddress}`,
				user.accessToken,
				{
					method: "DELETE",
					next: {
						// tags: ["wallets"],
					},
				},
			)();
		} catch (err) {
			console.error(err);
			if (err instanceof Error) throw err;
			throw new Error("An unknown error occurred");
		}
	});
