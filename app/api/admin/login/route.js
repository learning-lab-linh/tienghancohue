import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  createAdminCookieValue,
  getAdminCredentials,
  getAdminSessionSecret,
} from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");
  const cred = getAdminCredentials();
  if (username !== cred.username || password !== cred.password) {
    return NextResponse.json({ error: "Sai ID hoặc mật khẩu." }, { status: 401 });
  }

  const secret = getAdminSessionSecret();
  const { value, maxAgeSec } = await createAdminCookieValue(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSec,
  });
  return res;
}
