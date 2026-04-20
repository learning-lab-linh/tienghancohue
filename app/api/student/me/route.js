import { NextResponse } from "next/server";
import {
  STUDENT_COOKIE,
  getStudentSessionSecret,
  verifyStudentCookieValue,
} from "@/lib/studentAuth";

export async function GET(request) {
  const token = request.cookies.get(STUDENT_COOKIE)?.value;
  const loggedIn = await verifyStudentCookieValue(
    getStudentSessionSecret(),
    token
  );
  return NextResponse.json({ loggedIn });
}
