import { NextResponse } from "next/server";
import { readJsonPayload, writeJsonPayload } from "@/lib/examTemplateClone";
import { readQuizSetsMeta, writeQuizSetsMeta } from "@/lib/quizSetsMeta";
import { requireAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    const { testType, setKey, questions, audioUrl } = body;

    if (!testType || !["listen", "reading"].includes(testType)) {
      return NextResponse.json(
        { error: "testType không hợp lệ (listen | reading)" },
        { status: 400 }
      );
    }

    if (!setKey || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "setKey và questions[] là bắt buộc" },
        { status: 400 }
      );
    }

    const normalized = questions.map((q, idx) => {
      const id = Number(q.id ?? idx + 1);
      if (!Number.isInteger(id) || id < 1 || id > 50) {
        throw new Error(`id không hợp lệ: ${q.id}`);
      }
      const options = Array.isArray(q.options) ? [...q.options] : ["", "", "", ""];
      while (options.length < 4) options.push("");
      return {
        id: String(id),
        type: q.type ?? "",
        options: options.slice(0, 4),
        correctAnswer:
          String(q.correctAnswer ?? "1").replace(/[^1-4]/g, "") || "1",
        solution: q.solution || "Đang cập nhật....",
        content: typeof q.content === "string" ? q.content : "",
      };
    });

    normalized.sort((a, b) => Number(a.id) - Number(b.id));

    const jsonPayload = readJsonPayload(testType);
    if (!jsonPayload[setKey]) {
      return NextResponse.json(
        { error: "Chưa có đề trong JSON — hãy tạo khung trước." },
        { status: 404 }
      );
    }

    jsonPayload[setKey] = normalized;
    writeJsonPayload(testType, jsonPayload);

    if (testType === "listen" && typeof audioUrl === "string") {
      const meta = readQuizSetsMeta();
      const bucket = meta.listen;
      const prev = bucket[setKey] || {};
      bucket[setKey] = {
        ...prev,
        audioUrl: audioUrl.trim(),
      };
      meta.listen = bucket;
      writeQuizSetsMeta(meta);
    }

    return NextResponse.json({
      message: "Đã lưu JSON.",
      count: normalized.length,
    });
  } catch (error) {
    console.error("exam-set/save:", error);
    return NextResponse.json(
      { error: error.message || "Lưu thất bại" },
      { status: 500 }
    );
  }
}
