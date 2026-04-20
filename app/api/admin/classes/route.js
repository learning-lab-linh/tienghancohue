import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import {
  countDistinctMemberEmails,
  countMembersByClassIds,
} from "@/lib/classMembersFile";
import { createClass, listClasses } from "@/lib/classesFile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const includeArchived = searchParams.get("includeArchived") === "1";
  const data = listClasses({ includeArchived });
  const counts = countMembersByClassIds(data.map((c) => c.id));
  const enriched = data.map((c) => ({
    ...c,
    studentCount: counts.get(c.id) ?? 0,
  }));
  const totalStudentCount = countDistinctMemberEmails();
  return NextResponse.json({ data: enriched, totalStudentCount });
}

export async function POST(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  if (!name || name.length > 200) {
    return NextResponse.json(
      { error: "Tên lớp bắt buộc, tối đa 200 ký tự." },
      { status: 400 }
    );
  }

  const description = String(body.description ?? "").trim().slice(0, 2000);
  const schedule = String(body.schedule ?? "").trim().slice(0, 500);
  const schoolYear = String(body.schoolYear ?? "").trim().slice(0, 80);
  const teacher = String(body.teacher ?? "").trim().slice(0, 120);

  const row = createClass({ name, description, schedule, schoolYear, teacher });
  return NextResponse.json(
    { data: { ...row, studentCount: 0 } },
    { status: 201 }
  );
}
