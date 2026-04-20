"use client";

import { useCallback, useEffect, useState } from "react";

import { getSetLabel } from "@/lib/quizSetUiMaps";

/** Mỗi câu đúng 2 điểm; tối đa thường 100 (50 câu). */
const POINTS_PER_QUESTION = 2;

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

function typeLabel(t) {
  if (t === "reading") return "Đọc";
  if (t === "listen") return "Nghe";
  return String(t || "—");
}

function maxScoreFromQuestions(totalQuestions) {
  const n = Number(totalQuestions);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n * POINTS_PER_QUESTION;
}

/**
 * @returns {{ max: number | null; pct: number | null; display: string; correctApprox: string | null }}
 */
function scoreMeta(score, totalQuestions) {
  const max = maxScoreFromQuestions(totalQuestions);
  if (max == null || typeof score !== "number" || !Number.isFinite(score)) {
    return { max: null, pct: null, display: "—", correctApprox: null };
  }
  const pct = Math.min(100, Math.max(0, Math.round((score / max) * 100)));
  const approxCorrect = score / POINTS_PER_QUESTION;
  const correctApprox =
    Number.isInteger(approxCorrect) || Number.isFinite(approxCorrect)
      ? Number.isInteger(approxCorrect)
        ? `${approxCorrect}/${totalQuestions} câu`
        : `≈ ${approxCorrect.toFixed(1)}/${totalQuestions} câu`
      : null;
  return {
    max,
    pct,
    display: `${score} / ${max}`,
    correctApprox,
  };
}

function ScoreRing({ pct, size = "lg" }) {
  const p = pct == null ? 0 : Math.min(100, Math.max(0, pct));
  const r = 44;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - p / 100);
  const dim = size === "lg" ? "h-36 w-36" : "h-[5.5rem] w-[5.5rem]";
  const stroke = size === "lg" ? 7 : 5;

  return (
    <div className={`relative ${dim} shrink-0`}>
      <svg
        className="-rotate-90"
        viewBox="0 0 112 112"
        aria-hidden
      >
        <circle
          cx="56"
          cy="56"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-gray-200"
        />
        <circle
          cx="56"
          cy="56"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={
            p >= 70
              ? "text-emerald-500"
              : p >= 40
                ? "text-amber-500"
                : "text-rose-500"
          }
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-bold tabular-nums text-gray-900 ${
            size === "lg" ? "text-2xl" : "text-base"
          }`}
        >
          {pct != null ? `${p}%` : "—"}
        </span>
        {size === "lg" && (
          <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
            đạt
          </span>
        )}
      </div>
    </div>
  );
}

function ScoreBar({ pct }) {
  const p = pct == null ? 0 : Math.min(100, Math.max(0, pct));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200/90">
      <div
        className={`h-full rounded-full transition-all ${
          p >= 70
            ? "bg-emerald-500"
            : p >= 40
              ? "bg-amber-500"
              : "bg-rose-500"
        }`}
        style={{ width: `${p}%` }}
      />
    </div>
  );
}

function ScoreBadge({ score, totalQuestions, compact }) {
  const m = scoreMeta(score, totalQuestions);
  if (m.display === "—") {
    return <span className="text-gray-400">—</span>;
  }
  return (
    <span className={compact ? "inline-flex flex-col items-end gap-0.5" : ""}>
      <span className="font-semibold tabular-nums text-gray-900">{m.display}</span>
      {!compact && m.correctApprox && (
        <span className="text-xs font-normal text-gray-500">{m.correctApprox}</span>
      )}
    </span>
  );
}

export default function MemberQuizDetailModal({
  open,
  onClose,
  classId,
  email,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState(null);
  const [expandedDeck, setExpandedDeck] = useState(null);

  const load = useCallback(async () => {
    if (!classId || !email) return;
    setLoading(true);
    setError("");
    setPayload(null);
    setExpandedDeck(null);
    try {
      const enc = encodeURIComponent(email);
      const res = await fetch(`/api/admin/classes/${classId}/members/${enc}/results`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = `/admin/login?from=/admin/lop-hoc/${classId}`;
          return;
        }
        throw new Error(body.error || "Không tải được kết quả.");
      }
      setPayload(body.data || null);
    } catch (e) {
      setError(e.message || "Lỗi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, [classId, email]);

  useEffect(() => {
    if (open && email) load();
  }, [open, email, load]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const latest = payload?.latest;
  const byDeck = Array.isArray(payload?.byDeck) ? payload.byDeck : [];
  const rows = Array.isArray(payload?.rows) ? payload.rows : [];
  const latestMeta = scoreMeta(latest?.score, latest?.totalQuestions);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-quiz-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div className="relative z-10 mt-2 w-full max-w-3xl overflow-hidden rounded-3xl border border-rose-200/80 bg-white shadow-2xl shadow-[#b61e3b]/10 ring-1 ring-black/5">
        <div className="border-b border-rose-100 bg-gradient-to-br from-rose-50 via-white to-orange-50/30 px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#b61e3b]">
                Chi tiết kết quả
              </p>
              <h2
                id="member-quiz-modal-title"
                className="mt-1 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl"
              >
                Bài làm của học viên
              </h2>
              <p className="mt-2 break-all font-mono text-sm text-gray-600">{email}</p>
              {payload?.className && (
                <p className="mt-1 text-sm text-gray-500">
                  Lớp: <span className="font-medium text-gray-700">{payload.className}</span>
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 self-start rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-rose-50"
            >
              Đóng
            </button>
          </div>
          <p className="mt-4 rounded-xl border border-rose-200/80 bg-rose-50/70 px-3 py-2 text-xs leading-relaxed text-gray-800">
            <span className="font-semibold">Thang điểm:</span> tối đa{" "}
            <strong>100 điểm</strong> với 50 câu — <strong>2 điểm cho mỗi câu trả lời đúng</strong>.
            Điểm hiển thị là <strong>tổng điểm / điểm tối đa</strong> của bài đó (điểm tối đa = số câu × 2).
          </p>
        </div>

        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto bg-rose-50/50 px-6 py-6 sm:px-8">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#b61e3b] border-t-transparent" />
              Đang tải...
            </div>
          )}
          {error && (
            <p className="text-sm font-medium text-rose-700">{error}</p>
          )}
          {!loading && !error && rows.length === 0 && (
            <p className="rounded-2xl border border-dashed border-rose-200 bg-white px-4 py-8 text-center text-sm text-gray-600">
              Chưa có kết quả nào được gắn với học viên này.
            </p>
          )}
          {!loading && !error && rows.length > 0 && (
            <div className="space-y-10">
              <section className="rounded-2xl border border-rose-200/80 bg-white p-5 shadow-sm sm:p-6">
                <h3 className="text-sm font-semibold text-gray-900">
                  Lần làm gần nhất
                </h3>
                <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-10">
                  <ScoreRing pct={latestMeta.pct} size="lg" />
                  <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
                    <div className="text-4xl font-bold tabular-nums tracking-tight text-gray-900">
                      {latestMeta.display}
                    </div>
                    {latestMeta.correctApprox && (
                      <p className="text-sm text-gray-600">{latestMeta.correctApprox}</p>
                    )}
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {typeLabel(latest?.testType)}
                      </span>
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {latest?.testType != null && latest?.setNumber != null
                          ? getSetLabel(latest.testType, latest.setNumber)
                          : `#${latest?.setNumber ?? "—"}`}
                      </span>
                      {latest?.setKey && (
                        <span className="rounded-full bg-rose-100 px-3 py-1 font-mono text-xs text-gray-600">
                          {latest.setKey}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{formatDt(latest?.createdAt)}</p>
                    {latestMeta.pct != null && (
                      <div className="max-w-md pt-1">
                        <ScoreBar pct={latestMeta.pct} />
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-4 text-sm font-semibold text-gray-900">
                  Theo từng bộ đề
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {byDeck.map((d) => {
                    const dm = scoreMeta(d.latest?.score, d.latest?.totalQuestions);
                    return (
                      <div
                        key={d.deckKey}
                        className="overflow-hidden rounded-2xl border border-rose-200/90 bg-white shadow-sm transition hover:border-[#b61e3b]/30 hover:shadow-md"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedDeck((prev) =>
                              prev === d.deckKey ? null : d.deckKey
                            )
                          }
                          className="flex w-full flex-col gap-3 p-4 text-left"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                {typeLabel(d.testType)}
                              </p>
                              <p className="mt-0.5 font-medium text-gray-900">{d.label}</p>
                            </div>
                            <ScoreRing pct={dm.pct} size="sm" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold tabular-nums text-gray-900">
                              {dm.display}
                            </p>
                            {dm.correctApprox && (
                              <p className="mt-0.5 text-xs text-gray-500">{dm.correctApprox}</p>
                            )}
                            <div className="mt-2">
                              <ScoreBar pct={dm.pct} />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            {d.attemptCount} lần làm ·{" "}
                            <span className="font-medium text-[#b61e3b]">
                              {expandedDeck === d.deckKey ? "Thu gọn lịch sử" : "Xem lịch sử từng lần"}
                            </span>
                          </p>
                        </button>
                        {expandedDeck === d.deckKey && (
                          <ul className="space-y-0 border-t border-rose-100 bg-rose-50/80 px-4 py-3 text-sm">
                            {d.attempts.map((a, idx) => {
                              const am = scoreMeta(a.score, a.totalQuestions);
                              return (
                                <li
                                  key={a.id ?? idx}
                                  className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-100/80 py-2.5 last:border-0"
                                >
                                  <span className="text-gray-600">{formatDt(a.createdAt)}</span>
                                  <span className="font-semibold tabular-nums text-gray-900">
                                    {am.display}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section>
                <h3 className="mb-4 text-sm font-semibold text-gray-900">
                  Lịch sử tất cả lần làm
                </h3>
                <div className="overflow-hidden rounded-2xl border border-rose-200/80 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-rose-200 bg-rose-50/90">
                          <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Thời gian
                          </th>
                          <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Loại
                          </th>
                          <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Bộ đề
                          </th>
                          <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Điểm (tối đa = câu × 2)
                          </th>
                          <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Tỷ lệ
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r, i) => {
                          const rm = scoreMeta(r.score, r.totalQuestions);
                          return (
                            <tr
                              key={r.id}
                              className={
                                i % 2 === 0
                                  ? "bg-white"
                                  : "bg-rose-50/50"
                              }
                            >
                              <td className="whitespace-nowrap px-4 py-2.5 text-gray-700">
                                {formatDt(r.createdAt)}
                              </td>
                              <td className="px-4 py-2.5 text-gray-800">
                                {typeLabel(r.testType)}
                              </td>
                              <td className="px-4 py-2.5 text-gray-700">
                                <span className="font-medium">#{r.setNumber}</span>
                                {r.setKey ? (
                                  <span className="ml-1 font-mono text-xs text-gray-500">
                                    {r.setKey}
                                  </span>
                                ) : null}
                              </td>
                              <td className="whitespace-nowrap px-4 py-2.5">
                                <ScoreBadge score={r.score} totalQuestions={r.totalQuestions} />
                              </td>
                              <td className="px-4 py-2.5">
                                {rm.pct != null ? (
                                  <span className="inline-flex min-w-[3rem] items-center justify-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-gray-800">
                                    {rm.pct}%
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
