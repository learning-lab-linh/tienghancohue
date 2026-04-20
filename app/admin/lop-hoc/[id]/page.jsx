"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import MemberQuizDetailModal from "./MemberQuizDetailModal";

function formatDt(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

/** Giữ quiz (đã tách cột); email/joinedAt/classId hiển thị ở cột khác hoặc dưới đây nếu có thêm trường tùy chỉnh. */
const MEMBER_RESERVED = new Set(["email", "joinedAt", "quiz"]);

function extraMemberFields(member) {
  if (!member || typeof member !== "object") return [];
  return Object.keys(member).filter((k) => !MEMBER_RESERVED.has(k));
}

/** 2 điểm / câu — đồng bộ với modal chi tiết */
function formatLastScorePoints(q) {
  if (
    !q ||
    typeof q.lastScore !== "number" ||
    typeof q.lastTotalQuestions !== "number"
  ) {
    return "—";
  }
  const max = q.lastTotalQuestions * 2;
  return `${q.lastScore} / ${max}`;
}

function testTypeBadge(testType) {
  const t = String(testType || "").toLowerCase();
  if (t === "reading") {
    return (
      <span className="inline-flex rounded-md bg-orange-50 px-2 py-0.5 text-xs font-medium text-[#c43d0e]">
        Đọc
      </span>
    );
  }
  if (t === "listen") {
    return (
      <span className="inline-flex rounded-md bg-rose-100 px-2 py-0.5 text-xs font-medium text-[#b61e3b]">
        Nghe
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-md bg-rose-100 px-2 py-0.5 text-xs font-medium text-gray-700">
      {testType || "—"}
    </span>
  );
}

export default function AdminLopHocChiTietPage() {
  const params = useParams();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cls, setCls] = useState(null);
  const [detailEmail, setDetailEmail] = useState(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/classes/${id}`);
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = `/admin/login?from=/admin/lop-hoc/${id}`;
          return;
        }
        throw new Error(payload.error || "Không tải được lớp.");
      }
      setCls(payload.data || null);
    } catch (e) {
      setError(e.message || "Lỗi tải dữ liệu.");
      setCls(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!id) {
    return (
      <div className="text-sm text-gray-600">
        Thiếu mã lớp.{" "}
        <Link href="/admin/lop-hoc" className="text-[#b61e3b] underline">
          Quay lại
        </Link>
      </div>
    );
  }

  if (loading) {
    return <p className="text-sm text-gray-600">Đang tải...</p>;
  }

  if (error || !cls) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-rose-700">{error || "Không có dữ liệu."}</p>
        <Link
          href="/admin/lop-hoc"
          className="inline-flex rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-medium hover:bg-rose-50"
        >
          ← Danh sách lớp
        </Link>
      </div>
    );
  }

  const members = Array.isArray(cls.members) ? cls.members : [];

  return (
    <div className="w-full space-y-8">
      <div>
        <Link
          href="/admin/lop-hoc"
          className="text-sm font-medium text-[#b61e3b] hover:underline"
        >
          ← Danh sách lớp
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Học viên</h1>
      </div>

      <section className="overflow-hidden rounded-2xl border border-rose-200/90 bg-gradient-to-br from-white via-white to-rose-100/30 p-5 shadow-sm ring-1 ring-[#b61e3b]/5 sm:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-gray-900">
              Danh sách học viên
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              <span className="font-semibold tabular-nums text-gray-700">{members.length}</span>{" "}
              người đã tham gia
            </p>
          </div>
          <p className="max-w-xl text-xs leading-relaxed text-gray-500">
            Điểm hiển thị dạng <span className="font-medium text-gray-600">điểm / tối đa</span> (2 điểm mỗi
            câu). Nhấn số lần làm bài để xem chi tiết.
          </p>
        </div>

        {members.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-rose-200 bg-white/60 px-4 py-10 text-center text-sm text-gray-600">
            Chưa có học viên nào.
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-rose-200/80 bg-white shadow-inner">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-rose-200 bg-rose-100/90">
                    <th
                      scope="col"
                      className="whitespace-nowrap px-4 py-3.5 pl-5 text-[11px] font-semibold uppercase tracking-wider text-gray-600 sm:pl-6"
                    >
                      Học viên
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray-600"
                    >
                      Tham gia
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-600"
                    >
                      Lần làm
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray-600"
                    >
                      Làm gần nhất
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray-600"
                    >
                      Điểm gần nhất
                    </th>
                    <th
                      scope="col"
                      className="min-w-[160px] px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray-600"
                    >
                      Bài gần nhất
                    </th>
                    <th
                      scope="col"
                      className="min-w-[140px] px-4 py-3.5 pr-5 text-[11px] font-semibold uppercase tracking-wider text-gray-600 sm:pr-6"
                    >
                      Ghi chú
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100">
                  {members.map((m, i) => {
                    const q = m.quiz;
                    const extras = extraMemberFields(m);
                    const lastScoreStr = formatLastScorePoints(q);
                    const hasLastTest =
                      q &&
                      (q.lastTestType || q.lastSetNumber != null || q.lastSetKey);

                    return (
                      <tr
                        key={`${m.email}-${i}`}
                        className="align-top transition-colors odd:bg-white even:bg-rose-50/40 hover:bg-rose-50/60"
                      >
                        <td className="max-w-[220px] px-4 py-3.5 pl-5 sm:max-w-xs sm:pl-6">
                          <span className="break-all font-mono text-[13px] font-medium leading-snug text-gray-900">
                            {m.email}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-gray-600">
                          {formatDt(m.joinedAt)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            type="button"
                            title="Xem chi tiết điểm và lịch sử làm bài"
                            onClick={() => setDetailEmail(m.email)}
                            className="inline-flex min-w-[2.5rem] items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-bold tabular-nums text-[#b61e3b] shadow-sm transition hover:border-rose-300 hover:bg-rose-100 hover:shadow"
                          >
                            {q?.attemptCount ?? 0}
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-gray-600">
                          {formatDt(q?.lastAttemptAt)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span className="font-semibold tabular-nums text-gray-900">
                            {lastScoreStr}
                          </span>
                        </td>
                        <td className="max-w-[220px] px-4 py-3.5">
                          {hasLastTest ? (
                            <div className="flex flex-col gap-1.5">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {q.lastTestType
                                  ? testTypeBadge(q.lastTestType)
                                  : null}
                                {q.lastSetNumber != null && (
                                  <span className="text-xs font-medium text-gray-600">
                                    Bộ #{q.lastSetNumber}
                                  </span>
                                )}
                              </div>
                              {q.lastSetKey ? (
                                <code className="block w-fit rounded-md bg-rose-100 px-2 py-0.5 font-mono text-[11px] text-gray-700">
                                  {q.lastSetKey}
                                </code>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="max-w-[260px] px-4 py-3.5 pr-5 sm:pr-6">
                          {extras.length === 0 ? (
                            <span className="text-gray-400">—</span>
                          ) : (
                            <div className="space-y-1.5 rounded-lg border border-rose-100 bg-rose-50/80 p-2.5 text-xs text-gray-700">
                              {extras.map((k) => (
                                <div key={k} className="flex gap-2 leading-snug">
                                  <span className="shrink-0 font-semibold text-gray-500">
                                    {k}
                                  </span>
                                  <span className="min-w-0 break-words font-mono text-[11px] text-gray-800">
                                    {typeof m[k] === "object"
                                      ? JSON.stringify(m[k])
                                      : String(m[k])}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <MemberQuizDetailModal
        open={detailEmail != null}
        onClose={() => setDetailEmail(null)}
        classId={id}
        email={detailEmail || ""}
      />
    </div>
  );
}
