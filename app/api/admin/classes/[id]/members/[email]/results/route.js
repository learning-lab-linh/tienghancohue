import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getClassById } from "@/lib/classesFile";
import {
  groupQuizRowsByDeck,
  listResultsForClassMember,
} from "@/lib/quizResultsFile";
import { getSetLabel } from "@/lib/quizSetUiMaps";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function mapRow(r) {
  return {
    id: r.id,
    testType: r.testType,
    setNumber: r.setNumber,
    setKey: r.setKey ?? null,
    score: r.score,
    totalQuestions: r.totalQuestions,
    createdAt: r.createdAt,
    studentEmail: r.studentEmail ?? null,
  };
}

export async function GET(request, context) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const classId = context.params?.id;
  const rawEmail = context.params?.email;
  const row = getClassById(classId);
  if (!row) {
    return NextResponse.json({ error: "Không tìm thấy lớp." }, { status: 404 });
  }

  let email = String(rawEmail ?? "");
  try {
    email = decodeURIComponent(email);
  } catch {
    /* giữ nguyên */
  }
  email = email.trim().toLowerCase();

  const results = listResultsForClassMember(row.id, email);
  if (results === null) {
    return NextResponse.json(
      { error: "Học viên không thuộc lớp này." },
      { status: 404 }
    );
  }

  const mapped = results.map(mapRow);
  const byDeck = groupQuizRowsByDeck(results).map((d) => ({
    ...d,
    label: getSetLabel(d.testType, d.setNumber),
    latest: mapRow(d.latest),
    attempts: d.attempts.map(mapRow),
  }));

  return NextResponse.json({
    data: {
      classId: row.id,
      className: row.name,
      email,
      latest: mapped[0] ?? null,
      rows: mapped,
      byDeck,
    },
  });
}
