import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  // Behind nginx (HTTPS terminated at the proxy), next-auth stores the session in
  // a `__Secure-` cookie. Tell getToken to look for it, and pass the secret
  // explicitly so it works in the middleware runtime.
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie:
      process.env.NEXTAUTH_URL?.startsWith("https://") ?? process.env.NODE_ENV === "production",
  });
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
