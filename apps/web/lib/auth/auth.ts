"use server";
import { cookies } from "next/headers";
import { AuthSuccess } from "~/types/auth";
import { accessTokenKey, refreshTokenKey, userIdKey } from "../constants";

export const assertUserAuthenticated = async (): Promise<AuthSuccess> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(accessTokenKey);
  const refreshToken = cookieStore.get(refreshTokenKey);
  const userId = cookieStore.get(userIdKey);

  if (!refreshToken || !userId) {
    // throw new Error("User not authenticated");
  }

  try {
    return {
      accessToken: accessToken?.value as string,
      refreshToken: refreshToken?.value as string,
      userId: userId.value,
    };
  } catch (error) {
    console.error("Error parsing user data:", error);
    // throw new Error("Invalid authentication");
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
