import { NextResponse } from "next/server";
import {
  readJsonPayload,
  writeJsonPayload,
} from "@/lib/examTemplateClone";
import {
  readQuizSetsMeta,
  getListenAudioFallbackBySetKey,
  getSetKey,
} from "@/lib/quizSetsMeta";
import { requireAdmin } from "@/lib/adminAuth";
import { requireAdminOrStudent } from "@/lib/quizAccess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const denied = await requireAdminOrStudent(request);
  if (denied) return denied;

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
  const payload = readJsonPayload(testType);
  const rows = Array.isArray(payload[setKey]) ? payload[setKey] : [];

  const questions = rows.map((row) => ({
    id: String(row.id),
    type: row.type || "",
    content: row.content || "",
    options: Array.isArray(row.options) ? row.options : [],
    correctAnswer: row.correctAnswer || "",
    solution: row.solution || "",
  }));

  const meta = readQuizSetsMeta();
  const bucket = testType === "listen" ? meta.listen : meta.reading;
  const metaRow = bucket[setKey];

  let audio = "";
  if (testType === "listen") {
    audio =
      (metaRow?.audioUrl && String(metaRow.audioUrl).trim()) ||
      getListenAudioFallbackBySetKey(setKey) ||
      "";
  }

  return NextResponse.json({
    data: questions,
    setKey,
    audio,
  });
}

export async function PUT(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
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
  const payload = readJsonPayload(testType);
  const list = payload[setKey];
  if (!Array.isArray(list)) {
    return NextResponse.json(
      { error: "Không tìm thấy bộ đề trong JSON" },
      { status: 404 }
    );
  }

  const idx = list.findIndex((q) => Number(q.id) === questionId);
  if (idx === -1) {
    return NextResponse.json(
      { error: "Không tìm thấy câu hỏi để cập nhật" },
      { status: 404 }
    );
  }

  list[idx] = {
    ...list[idx],
    id: String(questionId),
    type: type || "",
    content: content || "",
    options,
    correctAnswer: correctAnswer || "",
    solution: solution || "",
  };

  payload[setKey] = list;
  writeJsonPayload(testType, payload);

  return NextResponse.json({ message: "Cập nhật câu hỏi thành công" });
}
