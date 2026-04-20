import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  getAdminSessionSecret,
  verifyAdminCookieValue,
} from "@/lib/adminAuth";
import { hasAnyMembershipForEmail } from "@/lib/classMembersFile";
import {
  STUDENT_COOKIE,
  getStudentSessionSecret,
  verifyStudentCookieValue,
} from "@/lib/studentAuth";
import {
  STUDENT_CLASS_COOKIE,
  verifyStudentClassCookie,
} from "@/lib/studentClassCookie";

/**
 * @returns {Promise<
 *   | { ok: true; isAdmin: true }
 *   | { ok: true; isAdmin: false; email: string }
 *   | { ok: false; response: import("next/server").NextResponse }
 * >}
 */
export async function resolveQuizActor(request) {
  const adminToken = request.cookies.get(ADMIN_COOKIE)?.value;
  const adminOk = await verifyAdminCookieValue(
    getAdminSessionSecret(),
    adminToken
  );
  if (adminOk) return { ok: true, isAdmin: true };

  const studentToken = request.cookies.get(STUDENT_COOKIE)?.value;
  const studentOk = await verifyStudentCookieValue(
    getStudentSessionSecret(),
    studentToken
  );
  if (!studentOk) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const secret = getStudentSessionSecret();
  const classCookie = request.cookies.get(STUDENT_CLASS_COOKIE)?.value;
  const email = await verifyStudentClassCookie(secret, classCookie);
  if (!email || !hasAnyMembershipForEmail(email)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Cần nhập mã lớp để làm bài.",
          code: "CLASS_REQUIRED",
        },
        { status: 403 }
      ),
    };
  }

  return { ok: true, isAdmin: false, email };
}

/** Admin hoặc học sinh đã đăng nhập — dùng cho GET đề/câu hỏi. Học sinh phải đã nhập mã lớp. */
export async function requireAdminOrStudent(request) {
  const actor = await resolveQuizActor(request);
  if (!actor.ok) return actor.response;
  return null;
}
