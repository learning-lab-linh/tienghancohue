import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  getAdminSessionSecret,
  verifyAdminCookieValue,
} from "./lib/adminAuth";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    const already = await verifyAdminCookieValue(getAdminSessionSecret(), token);
    if (already) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const ok = await verifyAdminCookieValue(getAdminSessionSecret(), token);
  if (!ok) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
