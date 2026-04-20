import { NextResponse } from "next/server";
import { readJsonPayload } from "@/lib/examTemplateClone";
import {
  readQuizSetsMeta,
  writeQuizSetsMeta,
  getMaxDisplayOrder,
  getListenAudioFallbackBySetKey,
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

  if (!testType || !["listen", "reading"].includes(testType)) {
    return NextResponse.json(
      { error: "testType không hợp lệ (listen | reading)" },
      { status: 400 }
    );
  }

  const payload = readJsonPayload(testType);
  const meta = readQuizSetsMeta();
  const bucket = testType === "listen" ? meta.listen : meta.reading;

  const keysFromQuestions = Object.keys(payload).filter((k) =>
    Array.isArray(payload[k])
  );
  const allKeys = new Set([...keysFromQuestions, ...Object.keys(bucket)]);

  const sets = [...allKeys].map((setKey) => {
    const m = bucket[setKey] || {};
    const label = m.label || setKey;
    let audioUrl = m.audioUrl || "";
    if (testType === "listen" && !String(audioUrl).trim()) {
      audioUrl = getListenAudioFallbackBySetKey(setKey);
    }
    const displayOrder =
      typeof m.displayOrder === "number" ? m.displayOrder : 9999;
    return { setKey, label, audioUrl, displayOrder };
  });

  sets.sort((a, b) => {
    if (a.displayOrder !== b.displayOrder)
      return a.displayOrder - b.displayOrder;
    return a.setKey.localeCompare(b.setKey);
  });

  return NextResponse.json({ data: sets });
}

export async function POST(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
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

  const payload = readJsonPayload(testType);
  if (payload[setKey]) {
    return NextResponse.json(
      { error: "Set đã tồn tại trong file JSON" },
      { status: 409 }
    );
  }

  const meta = readQuizSetsMeta();
  const bucket = testType === "listen" ? meta.listen : meta.reading;
  if (bucket[setKey]) {
    return NextResponse.json({ error: "Set đã tồn tại" }, { status: 409 });
  }

  const displayOrder = getMaxDisplayOrder(testType) + 1;
  bucket[setKey] = {
    label,
    audioUrl: testType === "listen" ? audioUrl || "" : "",
    displayOrder,
  };
  meta[testType === "listen" ? "listen" : "reading"] = bucket;
  writeQuizSetsMeta(meta);

  return NextResponse.json({ message: "Tạo đề mới thành công" }, { status: 201 });
}
