import { NextResponse } from "next/server";
import db from "@/lib/sqlite";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ensureDefaultSets(testType) {
  const hasAny = db
    .prepare("SELECT COUNT(*) AS count FROM quiz_sets WHERE test_type = ?")
    .get(testType);

  if (hasAny.count > 0) return;

  const discovered = db
    .prepare(
      `
      SELECT set_key AS setKey
      FROM quiz_questions
      WHERE test_type = ?
      GROUP BY set_key
      ORDER BY set_key ASC
      `
    )
    .all(testType);

  const insert = db.prepare(
    `
    INSERT OR IGNORE INTO quiz_sets (test_type, set_key, label, display_order)
    VALUES (?, ?, ?, ?)
    `
  );

  discovered.forEach((item, idx) => {
    insert.run(testType, item.setKey, item.setKey, idx + 1);
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get("testType");

  if (!testType || !["listen", "reading"].includes(testType)) {
    return NextResponse.json(
      { error: "testType không hợp lệ (listen | reading)" },
      { status: 400 }
    );
  }

  ensureDefaultSets(testType);

  const sets = db
    .prepare(
      `
      SELECT
        set_key AS setKey,
        label,
        audio_url AS audioUrl,
        display_order AS displayOrder
      FROM quiz_sets
      WHERE test_type = @testType
      ORDER BY display_order ASC, set_key ASC
      `
    )
    .all({ testType });

  return NextResponse.json({ data: sets });
}

export async function POST(request) {
  const body = await request.json();
  const { testType, setKey, label, audioUrl } = body;

  if (!testType || !["listen", "reading"].includes(testType)) {
    return NextResponse.json(
      { error: "testType không hợp lệ (listen | reading)" },
      { status: 400 }
    );
  }

  if (!setKey || !label) {
    return NextResponse.json(
      { error: "setKey và label là bắt buộc" },
      { status: 400 }
    );
  }

  const exists = db
    .prepare(
      "SELECT 1 FROM quiz_sets WHERE test_type = @testType AND set_key = @setKey"
    )
    .get({ testType, setKey });
  if (exists) {
    return NextResponse.json({ error: "Set đã tồn tại" }, { status: 409 });
  }

  const maxOrder = db
    .prepare(
      "SELECT COALESCE(MAX(display_order), 0) AS maxOrder FROM quiz_sets WHERE test_type = ?"
    )
    .get(testType);

  db.prepare(
    `
    INSERT INTO quiz_sets (test_type, set_key, label, audio_url, display_order)
    VALUES (@testType, @setKey, @label, @audioUrl, @displayOrder)
    `
  ).run({
    testType,
    setKey,
    label,
    audioUrl: audioUrl || "",
    displayOrder: maxOrder.maxOrder + 1,
  });

  return NextResponse.json({ message: "Tạo đề mới thành công" }, { status: 201 });
}
