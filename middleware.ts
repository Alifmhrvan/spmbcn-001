import { LOGIN_PATH, AUTH_TOKEN_KEY } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  const adminToken = request.cookies.get(AUTH_TOKEN_KEY)?.value;
  const isLoginPage = pathname === LOGIN_PATH;

  if (isLoginPage) {
    if (adminToken) {
      return NextResponse.redirect(
        new URL("/admin/dashboard", request.url)
      );
    }

    return NextResponse.next();
  }

  if (!adminToken) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/admin/:path*"],
};