import { NextResponse } from "next/server";
import { hasAnyMembershipForEmail } from "@/lib/classMembersFile";
import {
  STUDENT_COOKIE,
  createStudentCookieValue,
  getStudentSessionSecret,
} from "@/lib/studentAuth";
import {
  STUDENT_CLASS_COOKIE,
  createStudentClassCookieValue,
  getDefaultStudentClassCookieOptions,
} from "@/lib/studentClassCookie";
import { verifyFirebaseIdTokenClaims } from "@/lib/verifyFirebaseIdToken";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const idToken = String(body.idToken ?? "").trim();
    if (!idToken) {
      return NextResponse.json({ error: "Thiếu idToken." }, { status: 400 });
    }

    const claims = await verifyFirebaseIdTokenClaims(idToken);
    if (!claims) {
      return NextResponse.json(
        { error: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn." },
        { status: 401 }
      );
    }

    const secret = getStudentSessionSecret();
    const { value, maxAgeSec } = await createStudentCookieValue(secret);
    const em = claims.email?.trim().toLowerCase();
    const enrolled = em ? await hasAnyMembershipForEmail(em) : false;
    const res = NextResponse.json({
      ok: true,
      email: claims.email || null,
      enrolled,
    });
    res.cookies.set(STUDENT_COOKIE, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeSec,
    });

    if (em && enrolled) {
      const classCookie = await createStudentClassCookieValue(secret, em);
      res.cookies.set(
        STUDENT_CLASS_COOKIE,
        classCookie.value,
        getDefaultStudentClassCookieOptions(classCookie.maxAgeSec)
      );
    }

    return res;
  } catch (e) {
    console.error("[student/session]", e);
    return NextResponse.json(
      {
        error:
          "Lỗi máy chủ khi tạo phiên. Thử lại sau hoặc kiểm tra kết nối mạng.",
      },
      { status: 500 }
    );
  }
}
