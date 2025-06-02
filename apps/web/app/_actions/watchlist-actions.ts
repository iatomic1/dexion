"use server";

import { assertUserAuthenticated } from "~/lib/auth/auth";
import makeFetch from "~/lib/helpers/fetch";
import { ApiResponse } from "~/types";
import { UserWatchlist } from "~/types/wallets";

export async function getUserWatchlist() {
  const user = await assertUserAuthenticated();

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
