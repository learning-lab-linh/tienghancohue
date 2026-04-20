import { NextResponse } from "next/server";
import {
  cloneTemplateQuestionsForSet,
  createTopikSet,
  getTopikSetByKey,
  getTopikSetMaxDisplayOrder,
} from "@/lib/topikSupabase";
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

    const existing = await getTopikSetByKey(testType, setKey);
    if (existing) {
      return NextResponse.json(
        { error: `Khóa ${setKey} đã tồn tại` },
        { status: 409 }
      );
    }

    const displayOrder = (await getTopikSetMaxDisplayOrder(testType)) + 1;
    await createTopikSet({
      testType,
      setKey,
      label,
      audioUrl: testType === "listen" ? String(audioUrl || "").trim() : "",
      displayOrder,
    });
    const questions = await cloneTemplateQuestionsForSet({ testType, setKey });

    return NextResponse.json(
      {
        message: "Đã tạo khung đề (50 câu theo mẫu).",
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
