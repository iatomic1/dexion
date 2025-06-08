import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "./lib/session";
export async function middleware(request: NextRequest) {
  const { session, user } = await withAuth();
  console.log(session, "middleware", user);

  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  //   if (session && session.user.id) {
  //   return NextResponse.redirect(new URL("/", request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/meme/:path*", "/portfolio"],
};
