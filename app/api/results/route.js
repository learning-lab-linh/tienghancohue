import { NextResponse } from "next/server";
import {
  listResults,
  appendResult,
} from "@/lib/quizResultsFile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get("testType");
  const setNumber = searchParams.get("setNumber");
  const limit = Number(searchParams.get("limit") || 20);

  const rows = listResults({ testType, setNumber, limit });

  return NextResponse.json({
    data: rows.map((row) => ({
      id: row.id,
      testType: row.testType,
      setNumber: row.setNumber,
      score: row.score,
      totalQuestions: row.totalQuestions,
      answers: row.answers,
      createdAt: row.createdAt,
    })),
  });
}

export async function POST(request) {
  const body = await request.json();
  const { testType, setNumber, score, totalQuestions, answers } = body;

  if (!testType || typeof setNumber !== "number" || typeof score !== "number") {
    return NextResponse.json(
      { error: "testType, setNumber, score là bắt buộc" },
      { status: 400 }
    );
  }

  const { id } = appendResult({
    testType,
    setNumber,
    score,
    totalQuestions,
    answers,
  });

  return NextResponse.json(
    {
      message: "Lưu kết quả thành công",
      id,
    },
    { status: 201 }
  );
}
