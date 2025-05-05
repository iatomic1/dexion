"use server";
import { authenticatedAction } from "~/lib/safe-action";
import { AuthSuccess } from "~/types/auth";
import { ApiResponse } from "~/types";
import makeFetch from "~/lib/helpers/fetch";
import { z } from "zod";
import { UserWallet } from "~/types/wallets";

export const trackWalletAction = authenticatedAction
  .createServerAction()
  .input(
    z.object({
      emoji: z.string(),
      nickname: z.string(),
      walletAddress: z.string(),
    }),
  )
  .handler(async ({ input, ctx: { user } }) => {
    console.log(user, input);
    try {
      return await makeFetch<ApiResponse<UserWallet>>(
        "dexion",
        `wallets`,
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
            tags: ["wallets"],
          },
        },
      )();
    } catch (err) {
      console.error(err);
    }
  });

export const untrackWalletAction = authenticatedAction
  .createServerAction()
  .input(
    z.object({
      walletAddress: z.string(),
    }),
  )
  .handler(async ({ input, ctx: { user } }) => {
    try {
      return await makeFetch<ApiResponse<AuthSuccess>>(
        "dexion",
        `wallets/${input.walletAddress}`,
        user.accessToken,
        {
          method: "DELETE",
          next: {
            tags: ["wallets"],
          },
        },
      )();
    } catch (err) {
      console.error(err);
    }
  });
