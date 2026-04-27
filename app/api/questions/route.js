import { NextResponse } from "next/server";
import {
  getTopikSetByKey,
  listTopikQuestionsBySet,
  upsertTopikQuestion,
} from "@/lib/topikSupabase";
import { getSetKey } from "@/lib/quizSetUiMaps";
import { getListenAudioFallbackBySetKey } from "@/lib/quizSetsMeta";
import { requireAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
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
    const [questions, setMeta] = await Promise.all([
      listTopikQuestionsBySet(testType, setKey),
      getTopikSetByKey(testType, setKey),
    ]);
    const audioUrl =
      testType === "listen"
        ? setMeta?.audioUrl || getListenAudioFallbackBySetKey(setKey)
        : "";

    return NextResponse.json({
      data: questions,
      setKey,
      audio: audioUrl,
    });
  } catch (error) {
    console.error("GET /api/questions failed", error);
    return NextResponse.json(
      { error: "Không tải được danh sách câu hỏi." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
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
    const setMeta = await getTopikSetByKey(testType, setKey);
    if (!setMeta) {
      return NextResponse.json(
        { error: "Không tìm thấy bộ đề" },
        { status: 404 }
      );
    }

    await upsertTopikQuestion({
      testType,
      setKey,
      id: questionId,
      type: type || "",
      content: content || "",
      options,
      correctAnswer: correctAnswer || "",
      solution: solution || "",
    });

    return NextResponse.json({ message: "Cập nhật câu hỏi thành công" });
  } catch (error) {
    console.error("PUT /api/questions failed", error);
    return NextResponse.json(
      { error: "Không cập nhật được câu hỏi." },
      { status: 500 }
    );
  }
}
