import { NextResponse } from "next/server";
import { resolveQuizActor } from "@/lib/quizAccess";
import { listResults, appendResult } from "@/lib/quizResultsFile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function mapRow(row, isAdmin) {
  const base = {
    id: row.id,
    testType: row.testType,
    setNumber: row.setNumber,
    setKey: row.setKey ?? null,
    score: row.score,
    totalQuestions: row.totalQuestions,
    createdAt: row.createdAt,
  };
  if (isAdmin) {
    return {
      ...base,
      answers: row.answers,
      studentEmail: row.studentEmail ?? null,
    };
  }
  return base;
}

export async function GET(request) {
  const actor = await resolveQuizActor(request);
  if (!actor.ok) return actor.response;

  const { searchParams } = new URL(request.url);
  const testType = searchParams.get("testType");
  const setNumber = searchParams.get("setNumber");
  const limit = Number(searchParams.get("limit") || 20);

  const rows = listResults({
    testType,
    setNumber,
    limit,
    studentEmail: actor.isAdmin ? null : actor.email,
  });

  return NextResponse.json({
    data: rows.map((row) => mapRow(row, actor.isAdmin)),
  });
}

export async function POST(request) {
  const actor = await resolveQuizActor(request);
  if (!actor.ok) return actor.response;

  const body = await request.json();
  const { testType, setNumber, score, totalQuestions, answers, setKey } = body;

  if (!testType || typeof setNumber !== "number" || typeof score !== "number") {
    return NextResponse.json(
      { error: "testType, setNumber, score là bắt buộc" },
      { status: 400 }
    );
  }

  const studentEmail = actor.isAdmin ? undefined : actor.email;

  const { id } = appendResult({
    testType,
    setNumber,
    score,
    totalQuestions,
    answers,
    setKey: typeof setKey === "string" ? setKey : undefined,
    studentEmail,
  });

  return NextResponse.json(
    {
      message: "Lưu kết quả thành công",
      id,
    },
    { status: 201 }
  );
}
