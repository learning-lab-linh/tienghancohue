"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const emptyForm = {
  name: "",
  teacher: "",
  schoolYear: "",
  schedule: "",
  description: "",
};

export default function AdminLopHocPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [savingId, setSavingId] = useState(null);
  const [copyMsg, setCopyMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/classes?includeArchived=1");
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/admin/login?from=/admin/lop-hoc";
          return;
        }
        throw new Error(payload.error || "Không tải được danh sách.");
      }
      setClasses(Array.isArray(payload.data) ? payload.data : []);
    } catch (e) {
      setError(e.message || "Lỗi tải dữ liệu.");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditForm({
      name: row.name || "",
      teacher: row.teacher || "",
      schoolYear: row.schoolYear || "",
      schedule: row.schedule || "",
      description: row.description || "",
    });
  };

  const saveEdit = async (id) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/classes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "Lưu thất bại.");
      setEditingId(null);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingId(null);
    }
  };

  const setArchived = async (id, archived) => {
    try {
      const res = await fetch(`/api/admin/classes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "Cập nhật thất bại.");
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const removeClass = async (id) => {
    if (!window.confirm("Xóa vĩnh viễn lớp này? Hành động không hoàn tác.")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/classes/${id}`, { method: "DELETE" });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "Xóa thất bại.");
      setEditingId(null);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      alert("Đã sao chép mã lớp.");
      setTimeout(() => setCopyMsg(""), 2000);
    } catch {
      alert("Không sao chép được (trình duyệt chặn).");
      setTimeout(() => setCopyMsg(""), 2500);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="max-w-xl text-sm text-gray-600">
          Tất cả lớp đã tạo. Mã lớp dùng sau này khi gán học viên vào lớp.
        </p>
        <Link
          href="/admin/lop-hoc/tao"
          className="rounded-full bg-[#e5441a] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#cf3c15]"
        >
          + Tạo lớp mới
        </Link>
      </div>

      <section className="rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Danh sách lớp</h2>
          <p className="text-sm text-gray-500">
            Cuộn ngang nếu bảng rộng hơn màn hình.
          </p>
        </div>
        {copyMsg ? (
          <p className="mt-2 text-sm text-[#b61e3b]">{copyMsg}</p>
        ) : null}
        {error ? (
          <p className="mt-3 text-sm font-medium text-rose-700">{error}</p>
        ) : null}
        {loading ? (
          <p className="mt-4 text-sm text-gray-600">Đang tải...</p>
        ) : classes.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">
            Chưa có lớp nào.{" "}
            <Link
              href="/admin/lop-hoc/tao"
              className="font-medium text-[#b61e3b] underline-offset-2 hover:underline"
            >
              Tạo lớp đầu tiên
            </Link>
            .
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-rose-100 bg-white shadow-sm">
            <table className="w-full min-w-[920px] border-collapse text-left text-sm text-gray-800">
              <thead>
                <tr className="border-b border-rose-100 bg-rose-50/50">
                  <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Tên lớp
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Trạng thái
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Mã lớp
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Học viên
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Giáo viên
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Khóa / năm
                  </th>
                  <th className="min-w-[140px] px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Lịch học
                  </th>
                  <th className="min-w-[180px] px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Mô tả
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c) =>
                  editingId === c.id ? (
                    <tr key={c.id} className="border-b border-rose-50 bg-rose-50/60">
                      <td colSpan={9} className="p-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="block text-sm font-medium sm:col-span-2">
                            Tên lớp
                            <input
                              className="mt-1 h-10 w-full rounded-lg border border-rose-200 bg-white px-3 text-black"
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  name: e.target.value,
                                }))
                              }
                            />
                          </label>
                          <label className="block text-sm font-medium sm:col-span-2">
                            Giáo viên
                            <input
                              className="mt-1 h-10 w-full rounded-lg border border-rose-200 bg-white px-3 text-black"
                              value={editForm.teacher}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  teacher: e.target.value,
                                }))
                              }
                            />
                          </label>
                          <label className="block text-sm font-medium">
                            Khóa / năm học
                            <input
                              className="mt-1 h-10 w-full rounded-lg border border-rose-200 bg-white px-3 text-black"
                              value={editForm.schoolYear}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  schoolYear: e.target.value,
                                }))
                              }
                            />
                          </label>
                          <label className="block text-sm font-medium">
                            Lịch học
                            <input
                              className="mt-1 h-10 w-full rounded-lg border border-rose-200 bg-white px-3 text-black"
                              value={editForm.schedule}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  schedule: e.target.value,
                                }))
                              }
                            />
                          </label>
                          <label className="block text-sm font-medium sm:col-span-2">
                            Mô tả
                            <textarea
                              rows={2}
                              className="mt-1 w-full rounded-lg border border-rose-200 bg-white p-2 text-sm text-black"
                              value={editForm.description}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  description: e.target.value,
                                }))
                              }
                            />
                          </label>
                          <div className="flex flex-wrap gap-2 sm:col-span-2">
                            <button
                              type="button"
                              onClick={() => saveEdit(c.id)}
                              disabled={savingId === c.id}
                              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                            >
                              {savingId === c.id ? "Đang lưu..." : "Lưu"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm hover:bg-rose-50/50"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={c.id}
                      className="border-b border-rose-50 transition hover:bg-rose-50/50/80"
                    >
                      <td className="align-top px-3 py-3">
                        <Link
                          href={`/admin/lop-hoc/${c.id}`}
                          className="font-semibold text-[#b61e3b] hover:text-[#e5441a] hover:underline"
                        >
                          {c.name}
                        </Link>
                      </td>
                      <td className="align-top px-3 py-3">
                        {c.archived ? (
                          <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                            Lưu trữ
                          </span>
                        ) : (
                          <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                            Đang mở
                          </span>
                        )}
                      </td>
                      <td className="align-top px-3 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <code className="rounded bg-rose-50 px-2 py-0.5 font-mono text-xs font-semibold tracking-wide">
                            {c.code}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyCode(c.code)}
                            className="text-xs font-semibold text-[#b61e3b] underline-offset-2 hover:underline"
                          >
                            Sao chép
                          </button>
                        </div>
                      </td>
                      <td className="align-top px-3 py-3 tabular-nums font-semibold text-gray-900">
                        {c.studentCount ?? 0}
                      </td>
                      <td className="max-w-[160px] align-top px-3 py-3 text-gray-700">
                        {c.teacher?.trim() ? (
                          c.teacher
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="max-w-[120px] align-top px-3 py-3 text-gray-700">
                        {c.schoolYear?.trim() ? (
                          c.schoolYear
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="align-top px-3 py-3 text-gray-700">
                        <span className="line-clamp-3 break-words">
                          {c.schedule?.trim() ? (
                            c.schedule
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </span>
                      </td>
                      <td className="align-top px-3 py-3 text-gray-700">
                        <span
                          className="line-clamp-3 whitespace-pre-wrap break-words"
                          title={
                            c.description?.trim() ? c.description : undefined
                          }
                        >
                          {c.description?.trim() ? (
                            c.description
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </span>
                      </td>
                      <td className="align-top px-3 py-3 text-right">
                        <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:justify-end sm:gap-2">
                          <Link
                            href={`/admin/lop-hoc/${c.id}`}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-[#b61e3b] hover:bg-rose-100"
                          >
                            Chi tiết
                          </Link>
                          <button
                            type="button"
                            onClick={() => startEdit(c)}
                            className="rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-medium hover:bg-rose-50/50"
                          >
                            Sửa
                          </button>
                          {c.archived ? (
                            <button
                              type="button"
                              onClick={() => setArchived(c.id, false)}
                              className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-[#b61e3b]"
                            >
                              Khôi phục
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setArchived(c.id, true)}
                              className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900"
                            >
                              Lưu trữ
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeClass(c.id)}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-900"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
