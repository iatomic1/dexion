import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "./lib/session";
export async function middleware(request: NextRequest) {
  const { session } = await withAuth();

  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/meme/:path*", "/portfolio"],
};
