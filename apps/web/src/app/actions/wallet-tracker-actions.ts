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
            // tags: ["wallets"],
          },
        },
      )();
    } catch (err) {
      console.error(err);
    }
  });

export const updateWalletPreferences = authenticatedAction
  .createServerAction()
  .input(
    z.object({
      nickname: z.string().optional(),
      notifications: z.boolean().optional(),
      walletAddress: z.string(),
    }),
  )
  .handler(async ({ input, ctx: { user } }) => {
    console.log(user, input);
    try {
      const body = {
        nickname: input.nickname,
        notifcations: input.notifications,
        // ...(input.nickname !== undefined ? { nickname: input.nickname } : {}),
        // ...(input.notifications !== undefined
        //   ? { notifications: input.notifications }
        //   : {}),
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
            // tags: ["wallets"],
          },
        },
      )();
    } catch (err) {
      console.error(err);
    }
  });
