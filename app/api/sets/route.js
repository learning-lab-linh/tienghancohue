import { NextResponse } from "next/server";
import {
  createTopikSet,
  getTopikSetMaxDisplayOrder,
  listTopikQuestionSetKeysByType,
  listTopikSetsByType,
} from "@/lib/topikSupabase";
import { requireAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
