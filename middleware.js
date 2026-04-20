import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  getAdminSessionSecret,
  verifyAdminCookieValue,
} from "./lib/adminAuth";
import {
  STUDENT_COOKIE,
  getStudentSessionSecret,
  verifyStudentCookieValue,
} from "./lib/studentAuth";

const STUDENT_PROTECTED_PREFIXES = [
  "/pages/ConnectWord",
];

function isStudentProtectedPath(pathname) {
  return STUDENT_PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
      const token = request.cookies.get(ADMIN_COOKIE)?.value;
      const already = await verifyAdminCookieValue(
        getAdminSessionSecret(),
        token
      );
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

  if (isStudentProtectedPath(pathname)) {
    const token = request.cookies.get(STUDENT_COOKIE)?.value;
    const ok = await verifyStudentCookieValue(
      getStudentSessionSecret(),
      token
    );
    if (!ok) {
      const login = new URL("/dang-nhap", request.url);
      login.searchParams.set("from", pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/pages/ConnectWord",
    "/pages/ConnectWord/:path*",
  ],
};
