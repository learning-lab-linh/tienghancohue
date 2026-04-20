import { NextResponse } from "next/server";
import { STUDENT_COOKIE } from "@/lib/studentAuth";
import { clearStudentClassCookieOnResponse } from "@/lib/studentClassCookie";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(STUDENT_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  clearStudentClassCookieOnResponse(res);
  return res;
}
