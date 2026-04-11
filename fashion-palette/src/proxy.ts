import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Protect account pages (except login/register)
  if (pathname.startsWith("/account") && !pathname.startsWith("/account/login") && !pathname.startsWith("/account/register")) {
    if (!token) {
      const loginUrl = new URL("/account/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect admin pages
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/account/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
