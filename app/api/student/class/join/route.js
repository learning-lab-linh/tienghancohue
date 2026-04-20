import { NextResponse } from "next/server";
import { upsertClassMember } from "@/lib/classMembersFile";
import { getClassByJoinCode } from "@/lib/classesFile";
import {
  STUDENT_CLASS_COOKIE,
  createStudentClassCookieValue,
  getDefaultStudentClassCookieOptions,
} from "@/lib/studentClassCookie";
import { getStudentSessionSecret } from "@/lib/studentAuth";
import { verifyFirebaseIdTokenClaims } from "@/lib/verifyFirebaseIdToken";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const idToken = String(body.idToken ?? "").trim();
    const code = String(body.code ?? "").trim();
    if (!idToken) {
      return NextResponse.json({ error: "Thiếu idToken." }, { status: 400 });
    }
    if (!code) {
      return NextResponse.json({ error: "Nhập mã lớp." }, { status: 400 });
    }

    const claims = await verifyFirebaseIdTokenClaims(idToken);
    if (!claims) {
      return NextResponse.json(
        { error: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn." },
        { status: 401 }
      );
    }

    const email = claims.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json(
        { error: "Tài khoản cần có email để tham gia lớp." },
        { status: 400 }
      );
    }

    const cls = await getClassByJoinCode(code);
    if (!cls) {
      return NextResponse.json(
        { error: "Mã lớp không đúng hoặc lớp đã lưu trữ." },
        { status: 404 }
      );
    }

    await upsertClassMember(cls.id, email);

    const secret = getStudentSessionSecret();
    const { value, maxAgeSec } = await createStudentClassCookieValue(
      secret,
      email
    );
    const res = NextResponse.json({
      ok: true,
      className: cls.name,
      classId: cls.id,
    });
    res.cookies.set(
      STUDENT_CLASS_COOKIE,
      value,
      getDefaultStudentClassCookieOptions(maxAgeSec)
    );
    return res;
  } catch (e) {
    console.error("[student/class/join]", e);
    return NextResponse.json(
      {
        error:
          "Lỗi máy chủ khi xử lý. Thử lại sau hoặc kiểm tra kết nối mạng.",
      },
      { status: 500 }
    );
  }
}
