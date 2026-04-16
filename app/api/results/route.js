import { NextResponse } from "next/server";
import db from "@/lib/sqlite";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get("testType");
  const setNumber = searchParams.get("setNumber");
  const limit = Number(searchParams.get("limit") || 20);

  const conditions = [];
  const values = {};

  if (testType) {
    conditions.push("test_type = @testType");
    values.testType = testType;
  }

  if (setNumber) {
    conditions.push("set_number = @setNumber");
    values.setNumber = Number(setNumber);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 20;

  const statement = db.prepare(`
    SELECT
      id,
      test_type AS testType,
      set_number AS setNumber,
      score,
      total_questions AS totalQuestions,
      answers_json AS answersJson,
      created_at AS createdAt
    FROM quiz_results
    ${whereClause}
    ORDER BY id DESC
    LIMIT ${safeLimit}
  `);

  const rows = statement.all(values).map((row) => ({
    ...row,
    answers: row.answersJson ? JSON.parse(row.answersJson) : null,
  }));

  return NextResponse.json({ data: rows });
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

  const insert = db.prepare(`
    INSERT INTO quiz_results (
      test_type,
      set_number,
      score,
      total_questions,
      answers_json
    )
    VALUES (
      @testType,
      @setNumber,
      @score,
      @totalQuestions,
      @answersJson
    )
  `);

  const result = insert.run({
    testType,
    setNumber,
    score,
    totalQuestions: typeof totalQuestions === "number" ? totalQuestions : 0,
    answersJson: answers ? JSON.stringify(answers) : null,
  });

  return NextResponse.json(
    {
      message: "Lưu kết quả thành công",
      id: result.lastInsertRowid,
    },
    { status: 201 }
  );
}
