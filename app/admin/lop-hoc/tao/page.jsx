"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const emptyForm = {
  name: "",
  teacher: "",
  schoolYear: "",
  schedule: "",
  description: "",
};

export default function AdminTaoLopPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState("");

  const createClass = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    setCreateMsg("");
    try {
      const res = await fetch("/api/admin/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/admin/login?from=/admin/lop-hoc/tao";
          return;
        }
        throw new Error(payload.error || "Tạo lớp thất bại.");
      }
      router.push("/admin/lop-hoc");
      router.refresh();
    } catch (e) {
      setCreateMsg(e.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          Điền thông tin lớp. Sau khi tạo xong bạn sẽ quay lại danh sách lớp.
        </p>
        <Link
          href="/admin/lop-hoc"
          className="rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-slate-50"
        >
          ← Danh sách lớp
        </Link>
      </div>

      <section className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-lg font-semibold text-gray-900">Tạo lớp mới</h1>
        <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={createClass}>
          <label className="block text-sm font-medium sm:col-span-2">
            Tên lớp <span className="text-rose-600">*</span>
            <input
              required
              className="mt-1 h-11 w-full rounded-xl border border-rose-300 px-3 text-black"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Ví dụ: Topik II — Khóa 4/2026"
            />
          </label>
          <label className="block text-sm font-medium sm:col-span-2">
            Giáo viên
            <input
              className="mt-1 h-11 w-full rounded-xl border border-rose-300 px-3 text-black"
              value={form.teacher}
              onChange={(e) =>
                setForm((p) => ({ ...p, teacher: e.target.value }))
              }
              placeholder="Họ tên giáo viên phụ trách"
            />
          </label>
          <label className="block text-sm font-medium">
            Khóa / năm học
            <input
              className="mt-1 h-11 w-full rounded-xl border border-rose-300 px-3 text-black"
              value={form.schoolYear}
              onChange={(e) =>
                setForm((p) => ({ ...p, schoolYear: e.target.value }))
              }
              placeholder="2026 — Kỳ 4"
            />
          </label>
          <label className="block text-sm font-medium">
            Lịch học (ghi chú)
            <input
              className="mt-1 h-11 w-full rounded-xl border border-rose-300 px-3 text-black"
              value={form.schedule}
              onChange={(e) =>
                setForm((p) => ({ ...p, schedule: e.target.value }))
              }
              placeholder="Thứ 3, 5 — 19h"
            />
          </label>
          <label className="block text-sm font-medium sm:col-span-2">
            Mô tả ngắn
            <textarea
              rows={2}
              className="mt-1 w-full rounded-xl border border-rose-300 p-3 text-sm text-black"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Ghi chú nội bộ cho giáo viên..."
            />
          </label>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className="rounded-xl bg-[#e5441a] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#cf3c15] disabled:opacity-60"
            >
              {creating ? "Đang tạo..." : "Tạo lớp"}
            </button>
            <Link
              href="/admin/lop-hoc"
              className="text-sm font-medium text-gray-600 underline-offset-2 hover:text-gray-900 hover:underline"
            >
              Hủy
            </Link>
            {createMsg ? (
              <span className="text-sm text-rose-700">{createMsg}</span>
            ) : null}
          </div>
        </form>
      </section>
    </div>
  );
}
