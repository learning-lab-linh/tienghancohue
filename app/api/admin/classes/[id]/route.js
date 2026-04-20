import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import {
  deleteMembersForClass,
  getStudentCountForClass,
  listMembersForClass,
} from "@/lib/classMembersFile";
import { deleteClass, getClassById, updateClass } from "@/lib/classesFile";
import {
  countResultsWithoutStudentEmail,
  summarizeResultsForEmails,
} from "@/lib/quizResultsFile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, context) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const id = context.params?.id;
    const row = await getClassById(id);
    if (!row) {
      return NextResponse.json({ error: "Không tìm thấy lớp." }, { status: 404 });
    }
    const members = await listMembersForClass(row.id);
    const memberEmails = members.map((m) => m.email);
    const orphanAttributionEmail =
      members.length === 1 ? memberEmails[0] : null;
    const quizByEmail = await summarizeResultsForEmails(memberEmails, {
      orphanAttributionEmail,
    });
    const membersWithDetails = members.map((m) => ({
      ...m,
      quiz: quizByEmail[m.email] ?? null,
    }));
    const orphanResultsCount = await countResultsWithoutStudentEmail();

    return NextResponse.json({
      data: {
        ...row,
        studentCount: await getStudentCountForClass(row.id),
        members: membersWithDetails,
        quizMeta: {
          orphanResultsCount,
          /** Kết quả không email đã được cộng vào email này (chỉ khi lớp 1 học viên). */
          orphanAttributedToEmail: orphanAttributionEmail,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/admin/classes/[id] failed", error);
    return NextResponse.json(
      { error: "Không thể tải chi tiết lớp. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}

export async function PATCH(request, context) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const id = context.params?.id;
    const existing = await getClassById(id);
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy lớp." }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const patch = {};
    if (body.name != null) {
      const name = String(body.name).trim();
      if (!name || name.length > 200) {
        return NextResponse.json(
          { error: "Tên lớp không hợp lệ." },
          { status: 400 }
        );
      }
      patch.name = name;
    }
    if (body.description != null) {
      patch.description = String(body.description).trim().slice(0, 2000);
    }
    if (body.schedule != null) {
      patch.schedule = String(body.schedule).trim().slice(0, 500);
    }
    if (body.schoolYear != null) {
      patch.schoolYear = String(body.schoolYear).trim().slice(0, 80);
    }
    if (body.teacher != null) {
      patch.teacher = String(body.teacher).trim().slice(0, 120);
    }
    if (typeof body.archived === "boolean") {
      patch.archived = body.archived;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: "Không có trường nào để cập nhật." },
        { status: 400 }
      );
    }

    const row = await updateClass(id, patch);
    if (!row) {
      return NextResponse.json({ error: "Không tìm thấy lớp." }, { status: 404 });
    }
    return NextResponse.json({
      data: { ...row, studentCount: await getStudentCountForClass(row.id) },
    });
  } catch (error) {
    console.error("PATCH /api/admin/classes/[id] failed", error);
    return NextResponse.json(
      {
        error:
          "Không thể cập nhật lớp. Vui lòng thử lại.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const id = context.params?.id;
    const ok = await deleteClass(id);
    if (!ok) {
      return NextResponse.json({ error: "Không tìm thấy lớp." }, { status: 404 });
    }
    await deleteMembersForClass(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/classes/[id] failed", error);
    return NextResponse.json(
      {
        error:
          "Không thể xóa lớp. Vui lòng thử lại.",
      },
      { status: 500 }
    );
  }
}
