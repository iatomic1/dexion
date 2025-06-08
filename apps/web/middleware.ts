import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "./lib/session";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  // console.log(session, "middleware", user);

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/meme/:path*", "/portfolio"],
};
