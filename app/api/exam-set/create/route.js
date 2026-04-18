import { NextResponse } from "next/server";
import {
  loadExamTemplateRows,
  readJsonPayload,
  writeJsonPayload,
} from "@/lib/examTemplateClone";
import { readQuizSetsMeta, writeQuizSetsMeta, getMaxDisplayOrder } from "@/lib/quizSetsMeta";
import { requireAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
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

    const jsonPayload = readJsonPayload(testType);
    if (jsonPayload[setKey]) {
      return NextResponse.json(
        { error: `Khóa ${setKey} đã tồn tại trong file JSON` },
        { status: 409 }
      );
    }

    const templateRows = loadExamTemplateRows(testType);
    const questions = templateRows.map((row) => ({ ...row }));

    jsonPayload[setKey] = questions;

    const meta = readQuizSetsMeta();
    const bucket = testType === "listen" ? meta.listen : meta.reading;
    const existing = bucket[setKey];
    const displayOrder =
      typeof existing?.displayOrder === "number"
        ? existing.displayOrder
        : getMaxDisplayOrder(testType) + 1;

    bucket[setKey] = {
      label,
      audioUrl:
        testType === "listen" && audioUrl
          ? String(audioUrl).trim()
          : testType === "listen"
            ? ""
            : "",
      displayOrder,
    };
    meta[testType === "listen" ? "listen" : "reading"] = bucket;

    writeJsonPayload(testType, jsonPayload);
    try {
      writeQuizSetsMeta(meta);
    } catch (e) {
      delete jsonPayload[setKey];
      writeJsonPayload(testType, jsonPayload);
      throw e;
    }

    return NextResponse.json(
      {
        message: "Đã tạo khung đề (50 câu theo mẫu Listen83 / Reading91).",
        setKey,
        questions,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("exam-set/create:", error);
    return NextResponse.json(
      { error: error.message || "Không tạo được đề" },
      { status: 500 }
    );
  }
}
