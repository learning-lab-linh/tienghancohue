import { NextResponse } from "next/server";
import {
  createTopikSet,
  deleteTopikSetWithQuestions,
  getTopikSetMaxDisplayOrder,
  listTopikQuestionsBySet,
  listTopikQuestionSetKeysByType,
  listTopikSetsByType,
  updateTopikSetAudio,
} from "@/lib/topikSupabase";
import { deleteFirebaseFilesByUrls } from "@/lib/firebaseStorageServer";
import { requireAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractUrlsFromText(text) {
  if (!text || typeof text !== "string") return [];
  const matches = text.match(/https?:\/\/[^\s"'<>]+/g);
  return matches || [];
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get("testType");

    if (!testType || !["listen", "reading"].includes(testType)) {
      return NextResponse.json(
        { error: "testType không hợp lệ (listen | reading)" },
        { status: 400 }
      );
    }

    const [setsFromMeta, keysFromQuestions] = await Promise.all([
      listTopikSetsByType(testType),
      listTopikQuestionSetKeysByType(testType),
    ]);
    const byKey = new Map(setsFromMeta.map((item) => [item.setKey, item]));
    for (const key of keysFromQuestions) {
      if (!byKey.has(key)) {
        byKey.set(key, {
          setKey: key,
          label: key,
          audioUrl: "",
          displayOrder: 9999,
        });
      }
    }
    const sets = [...byKey.values()].sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return a.setKey.localeCompare(b.setKey);
    });

    return NextResponse.json({ data: sets });
  } catch (error) {
    console.error("GET /api/sets failed", error);
    return NextResponse.json(
      { error: "Không tải được danh sách bộ đề." },
      { status: 500 }
    );
  }
}

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

    const displayOrder = (await getTopikSetMaxDisplayOrder(testType)) + 1;
    await createTopikSet({
      testType,
      setKey,
      label,
      audioUrl: testType === "listen" ? audioUrl || "" : "",
      displayOrder,
    });
    return NextResponse.json(
      { message: "Tạo đề mới thành công" },
      { status: 201 }
    );
  } catch (error) {
    if (String(error?.code || "") === "23505") {
      return NextResponse.json({ error: "Set đã tồn tại" }, { status: 409 });
    }
    console.error("POST /api/sets failed", error);
    return NextResponse.json(
      { error: "Không tạo được bộ đề." },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get("testType");
    const setKey = searchParams.get("setKey");

    if (!testType || !["listen", "reading"].includes(testType)) {
      return NextResponse.json(
        { error: "testType không hợp lệ (listen | reading)" },
        { status: 400 }
      );
    }
    if (!setKey || !String(setKey).trim()) {
      return NextResponse.json(
        { error: "setKey là bắt buộc" },
        { status: 400 }
      );
    }

    const questions = await listTopikQuestionsBySet(testType, setKey);
    const candidateUrls = questions.flatMap((q) => [
      ...extractUrlsFromText(q.content),
      ...(Array.isArray(q.options)
        ? q.options.flatMap((option) => extractUrlsFromText(option))
        : []),
    ]);
    const firebaseDeleteResult = await deleteFirebaseFilesByUrls(candidateUrls);
    if (firebaseDeleteResult.failed.length) {
      console.warn("DELETE /api/sets firebase cleanup partial failure", {
        testType,
        setKey,
        failed: firebaseDeleteResult.failed,
      });
    }

    await deleteTopikSetWithQuestions({ testType, setKey });
    return NextResponse.json({
      message: "Đã xóa bộ đề thành công.",
      firebaseCleanup: {
        deletedCount: firebaseDeleteResult.deleted.length,
        failedCount: firebaseDeleteResult.failed.length,
      },
    });
  } catch (error) {
    console.error("DELETE /api/sets failed", error);
    return NextResponse.json(
      { error: "Không xóa được bộ đề." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    const { testType, setKey, audioUrl } = body || {};

    if (testType !== "listen") {
      return NextResponse.json(
        { error: "Chỉ hỗ trợ cập nhật audio cho bộ đề nghe." },
        { status: 400 }
      );
    }
    if (!setKey || !String(setKey).trim()) {
      return NextResponse.json({ error: "setKey là bắt buộc" }, { status: 400 });
    }

    await updateTopikSetAudio({
      testType,
      setKey: String(setKey).trim(),
      audioUrl: String(audioUrl || "").trim(),
    });

    return NextResponse.json({ message: "Đã cập nhật link audio." });
  } catch (error) {
    console.error("PATCH /api/sets failed", error);
    return NextResponse.json(
      { error: "Không cập nhật được link audio." },
      { status: 500 }
    );
  }
}
