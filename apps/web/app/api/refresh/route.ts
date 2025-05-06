import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { refreshTokenKey } from "~/lib/constants";
import { saveUserTokens } from "~/lib/auth/auth";
import { AuthSuccess } from "~/types/auth";
import makeFetch from "~/lib/helpers/fetch";
import { ApiResponse } from "~/types";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(refreshTokenKey)?.value;
  console.log(refreshToken);

  if (!refreshToken) {
    return NextResponse.json(
      { error: "No refresh token available" },
      { status: 401 },
    );
  }

  try {
    const data = await makeFetch<ApiResponse<AuthSuccess>>(
      "dexion",
      "auth/refresh",
      refreshToken,
      {
        method: "GET",
      },
    )();

    await saveUserTokens(data.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh token" },
      { status: 500 },
    );
  }
}
