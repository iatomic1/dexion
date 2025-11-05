import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const guestOnlyRoutes = ["/login", "/signup", "/recover-account"];

export async function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);
	const { pathname } = request.nextUrl;

	if (
		pathname.startsWith("/api") ||
		pathname.startsWith("/_next") ||
		pathname === "/favicon.ico" ||
		pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)
	) {
		return NextResponse.next();
	}

	const isProtectedRoute =
		!guestOnlyRoutes.some((r) => pathname.startsWith(r)) && pathname !== "/";

	if (!sessionCookie && isProtectedRoute) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next|favicon.ico).*)"],
};
