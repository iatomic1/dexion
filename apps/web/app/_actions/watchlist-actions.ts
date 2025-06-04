"use server";

import z from "zod";
import { assertUserAuthenticated } from "~/lib/auth/auth";
import makeFetch from "~/lib/helpers/fetch";
import { authenticatedAction } from "~/lib/safe-action";
import { ApiResponse } from "~/types";
import { AuthSuccess } from "~/types/auth";
import { UserWatchlist } from "~/types/wallets";

export async function getUserWatchlist() {
  const user = await assertUserAuthenticated();
  console.log("called");
  console.log(user, "from me");

  try {
    return await makeFetch<ApiResponse<UserWatchlist[]>>(
      "dexion",
      `watchlist`,
      user.accessToken,
      {
        method: "GET",
        next: {
          tags: ["watchlist"],
        },
      },
    )();
  } catch (err) {
    console.error(err);
  }
}

export const addToWatchlistAction = authenticatedAction
  .createServerAction()
  .input(
    z.object({
      ca: z.string(),
    }),
  )
  .handler(async ({ input, ctx: { user } }) => {
    console.log(user, input);
    try {
      return await makeFetch<ApiResponse<UserWatchlist>>(
        "dexion",
        `watchlist`,
        user.accessToken,
        {
          method: "POST",
          body: {
            userId: user.userId,
            ca: input.ca,
          },
          next: {
            tags: ["watchlist"],
          },
        },
      )();
    } catch (err) {
      console.error(err);
    }
  });

export const deleteWatchlistAction = authenticatedAction
  .createServerAction()
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .handler(async ({ input, ctx: { user } }) => {
    try {
      return await makeFetch<ApiResponse<AuthSuccess>>(
        "dexion",
        `watchlist/${input.id}`,
        user.accessToken,
        {
          method: "DELETE",
          next: {
            tags: ["watchlist"],
          },
        },
      )();
    } catch (err) {
      console.error(err);
    }
  });
