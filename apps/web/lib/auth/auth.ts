"use server";
import { cookies, headers } from "next/headers";
import { AuthSuccess } from "~/types/auth";
import {
  accessTokenKey,
  PUBLIC_BASE_URL,
  refreshTokenKey,
  userIdKey,
} from "../constants";
import { auth } from "../auth";

export const assertUserAuthenticated = async (): Promise<AuthSuccess> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Not authenticated");
  }

  const tokenRes = await fetch(PUBLIC_BASE_URL + "/api/auth/token", {
    headers: {
      Authorization: `Bearer ${session.session.token}`,
    },
  });
  if (!tokenRes.ok) {
    throw new Error("Error trying to get the access token");
  }

  const tokenData: { token: string } = await tokenRes.json();
  // console.log(tokenData.token);

  try {
    return {
      accessToken: tokenData.token as string,
      refreshToken: "",
      userId: session.user.id,
    };
  } catch (error) {
    console.error("Error parsing user data:", error);
    throw new Error("Invalid authentication");
  }
};

export async function saveUserTokens(data: AuthSuccess) {
  // console.log(data, "save");
  const cookieStore = await cookies();
  cookieStore.set(accessTokenKey, data.accessToken as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    // maxAge: tokens.accessTokenExpiry - Math.floor(Date.now() / 1000),
    path: "/",
  });
  cookieStore.set(refreshTokenKey, data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    path: "/",
  });

  if (data.userId)
    cookieStore.set(userIdKey, data.userId, {
      httpOnly: false,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      path: "/",
    });
}
