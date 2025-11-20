import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const guestOnlyRoutes = ["/login", "/signup", "/recover-account", "/reset"];

export async function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);
	const { pathname } = request.nextUrl;

	// Bypass middleware for static assets and public files
	if (
		pathname.startsWith("/api") ||
		pathname.startsWith("/_next") ||
		pathname === "/favicon.ico" ||
		pathname === "/robots.txt" ||
		pathname.match(/\.(png|jpe?g|gif|svg|webp)$/) || // images
		pathname.endsWith(".xml") // sitemaps or RSS feeds
	) {
		return NextResponse.next();
	}

	const isGuestOnly = guestOnlyRoutes.some((r) => pathname.startsWith(r));
	const isProtectedRoute = !isGuestOnly && pathname !== "/";

	if (!sessionCookie && isProtectedRoute) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next|favicon\\.ico).*)"],
};
