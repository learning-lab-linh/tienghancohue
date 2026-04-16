import { NextResponse } from "next/server";
import db from "@/lib/sqlite";
import { getSetKey, LISTEN_AUDIO_BY_SET } from "@/lib/testSets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get("testType");
  const setNumber = Number(searchParams.get("setNumber") || 1);
  const rawSetKey = searchParams.get("setKey");

  if (!testType || !["listen", "reading"].includes(testType)) {
    return NextResponse.json(
      { error: "testType không hợp lệ (listen | reading)" },
      { status: 400 }
    );
  }

  const setKey = rawSetKey || getSetKey(testType, setNumber);

  const setMeta = db
    .prepare(
      "SELECT audio_url AS audioUrl FROM quiz_sets WHERE test_type = @testType AND set_key = @setKey"
    )
    .get({ testType, setKey });

  const rows = db
    .prepare(
      `
      SELECT
        question_id AS id,
        question_type AS type,
        content,
        options_json AS optionsJson,
        correct_answer AS correctAnswer,
        solution
      FROM quiz_questions
      WHERE test_type = @testType AND set_key = @setKey
      ORDER BY question_id ASC
      `
    )
    .all({ testType, setKey });

  const questions = rows.map((row) => ({
    id: String(row.id),
    type: row.type || "",
    content: row.content || "",
    options: row.optionsJson ? JSON.parse(row.optionsJson) : [],
    correctAnswer: row.correctAnswer || "",
    solution: row.solution || "",
  }));

  return NextResponse.json({
    data: questions,
    setKey,
    audio:
      testType === "listen"
        ? setMeta?.audioUrl || LISTEN_AUDIO_BY_SET[setNumber] || ""
        : "",
  });
}

export async function PUT(request) {
  const body = await request.json();
  const {
    testType,
    setNumber,
    setKey: rawSetKey,
    id,
    type,
    content,
    options,
    correctAnswer,
    solution,
  } = body;

  if (!testType || !["listen", "reading"].includes(testType)) {
    return NextResponse.json(
      { error: "testType không hợp lệ (listen | reading)" },
      { status: 400 }
    );
  }

  const questionId = Number(id);
  const resolvedSetNumber = Number(setNumber);

  if (!Number.isInteger(questionId) || questionId <= 0) {
    return NextResponse.json({ error: "id không hợp lệ" }, { status: 400 });
  }

  if (!Array.isArray(options) || options.length === 0) {
    return NextResponse.json(
      { error: "options phải là mảng không rỗng" },
      { status: 400 }
    );
  }

  const setKey = rawSetKey || getSetKey(testType, resolvedSetNumber);

  const updateResult = db
    .prepare(
      `
      UPDATE quiz_questions
      SET
        question_type = @type,
        content = @content,
        options_json = @optionsJson,
        correct_answer = @correctAnswer,
        solution = @solution
      WHERE test_type = @testType AND set_key = @setKey AND question_id = @questionId
      `
    )
    .run({
      type: type || "",
      content: content || "",
      optionsJson: JSON.stringify(options),
      correctAnswer: correctAnswer || "",
      solution: solution || "",
      testType,
      setKey,
      questionId,
    });

  if (updateResult.changes === 0) {
    return NextResponse.json(
      { error: "Không tìm thấy câu hỏi để cập nhật" },
      { status: 404 }
    );
  }

  return NextResponse.json({ message: "Cập nhật câu hỏi thành công" });
}
