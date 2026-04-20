import { NextResponse } from "next/server";
import { hasAnyMembershipForEmail } from "@/lib/classMembersFile";
import {
  STUDENT_CLASS_COOKIE,
  verifyStudentClassCookie,
} from "@/lib/studentClassCookie";
import {
  STUDENT_COOKIE,
  getStudentSessionSecret,
  verifyStudentCookieValue,
} from "@/lib/studentAuth";

export const runtime = "nodejs";

/** Trạng thái đăng nhập + đã nhập mã lớp (còn trong danh sách lớp). */
export async function GET(request) {
  const secret = getStudentSessionSecret();
  const studentToken = request.cookies.get(STUDENT_COOKIE)?.value;
  const loggedIn = await verifyStudentCookieValue(secret, studentToken);
  if (!loggedIn) {
    return NextResponse.json({ loggedIn: false, enrolled: false });
  }

  const classCookie = request.cookies.get(STUDENT_CLASS_COOKIE)?.value;
  const email = await verifyStudentClassCookie(secret, classCookie);
  if (!email) {
    return NextResponse.json({ loggedIn: true, enrolled: false });
  }

  const enrolled = hasAnyMembershipForEmail(email);
  return NextResponse.json({ loggedIn: true, enrolled });
}
