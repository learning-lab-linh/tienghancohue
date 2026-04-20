"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import StudentClassGate from "@/app/components/StudentClassGate";
import { getSetLabel } from "@/lib/quizSetUiMaps";
import {
  ChevronDown,
  ChevronUp,
  Minus,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function maxPossibleScore(totalQuestions) {
  const n = Number(totalQuestions);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n * 2;
}

/**
 * So sánh lần làm mới nhất với lần ngay trước đó (cùng bộ đề).
 */
function evaluateProgress(attemptsNewestFirst) {
  if (!attemptsNewestFirst.length) return null;
  if (attemptsNewestFirst.length === 1) {
    return {
      kind: "first",
      title: "Lần đầu làm bài",
      detail: "Tiếp tục làm thêm để xem bạn có tiến bộ so với lần này.",
      Icon: Sparkles,
      badgeClass:
        "border-amber-200 bg-amber-50 text-amber-900",
    };
  }
  const [newest, previous] = attemptsNewestFirst;
  const delta = Number(newest.score) - Number(previous.score);
  const threshold = 1;

  if (delta > threshold) {
    return {
      kind: "up",
      title: "Đang tiến bộ",
      detail: `Cao hơn lần trước ${delta} điểm — giữ vững nhịp ôn tập.`,
      delta,
      Icon: TrendingUp,
      badgeClass:
        "border-emerald-200 bg-emerald-50 text-emerald-900",
    };
  }
  if (delta < -threshold) {
    return {
      kind: "down",
      title: "Điểm giảm so với lần trước",
      detail: `Thấp hơn lần trước ${Math.abs(delta)} điểm — nên xem lại phần sai và ôn thêm.`,
      delta,
      Icon: TrendingDown,
      badgeClass:
        "border-rose-200 bg-rose-50 text-rose-900",
    };
  }
  return {
    kind: "flat",
    title: "Ổn định",
    detail: "Gần bằng lần trước — có thể tăng độ khó hoặc ôn kỹ hơn từng dạng câu.",
    delta: 0,
    Icon: Minus,
    badgeClass:
      "border-slate-200 bg-slate-50 text-slate-800",
  };
}

function groupRowsByDeck(rows) {
  const map = new Map();
  for (const r of rows) {
    const key = `${r.testType}-${r.setNumber}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(r);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return Array.from(map.entries()).sort(
    (a, b) =>
      new Date(b[1][0].createdAt).getTime() -
      new Date(a[1][0].createdAt).getTime()
  );
}

function LichSuContent() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openKeys, setOpenKeys] = useState(() => new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/results?limit=200");
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/dang-nhap?from=/lich-su-lam-bai";
          return;
        }
        if (res.status === 403) {
          window.location.href = "/nhap-ma-lop?from=/lich-su-lam-bai";
          return;
        }
        throw new Error(payload.error || "Không tải được lịch sử.");
      }
      const data = Array.isArray(payload.data) ? payload.data : [];
      setRows(data);
      const grouped = groupRowsByDeck(data);
      setOpenKeys(new Set(grouped.map(([k]) => k)));
    } catch (e) {
      setError(e.message || "Lỗi tải dữ liệu.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const grouped = useMemo(() => groupRowsByDeck(rows), [rows]);

  const toggleKey = (key) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-white px-4 py-8 text-gray-800">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-[#b61e3b]">
              Học viên
            </p>
            <h1 className="text-2xl font-bold text-[#b61e3b] md:text-3xl">
              Lịch sử làm bài
            </h1>
            <p className="mt-2 max-w-xl text-sm text-gray-600">
              Mỗi bộ đề có thể làm nhiều lần. Hệ thống so sánh lần mới nhất với
              lần làm liền trước để gợi ý bạn có đang tiến bộ hay không.
            </p>
          </div>
          <Link
            href="/pages/Select"
            className="shrink-0 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-[#b61e3b] shadow-sm transition hover:bg-rose-50"
          >
            ← Chọn bài
          </Link>
        </div>

        {error ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#b61e3b] border-t-transparent" />
            Đang tải lịch sử...
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-rose-100 bg-white p-10 text-center shadow-sm">
            <p className="text-gray-700">Chưa có kết quả nào được lưu.</p>
            <p className="mt-2 text-sm text-gray-500">
              Làm bài Listen hoặc Reading và nộp bài để lưu điểm — mỗi lần nộp
              sẽ hiện dưới đúng bộ đề.
            </p>
            <Link
              href="/pages/Select"
              className="mt-6 inline-block rounded-full bg-[#e5441a] px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#cf3c15]"
            >
              Vào chọn bài
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {grouped.map(([deckKey, attempts]) => {
              const first = attempts[0];
              const testType = first.testType;
              const setNumber = first.setNumber;
              const label = getSetLabel(testType, setNumber);
              const partLabel =
                testType === "listen"
                  ? "Nghe (Listen)"
                  : testType === "reading"
                    ? "Đọc (Reading)"
                    : testType;
              const progress = evaluateProgress(attempts);
              const bestScore = Math.max(
                ...attempts.map((a) => Number(a.score) || 0)
              );
              const maxPts = maxPossibleScore(first.totalQuestions);
              const isOpen = openKeys.has(deckKey);
              const ProgressIcon = progress?.Icon ?? Sparkles;

              return (
                <section
                  key={deckKey}
                  className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleKey(deckKey)}
                    className="flex w-full items-start justify-between gap-3 border-b border-rose-50 bg-gradient-to-r from-rose-50/80 to-white px-4 py-4 text-left transition hover:bg-rose-50/50 sm:px-5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#b61e3b]/10 px-2.5 py-0.5 text-xs font-semibold text-[#b61e3b]">
                          {partLabel}
                        </span>
                        <span className="text-xs text-gray-500">
                          {attempts.length} lần làm
                        </span>
                      </div>
                      <h2 className="mt-1 text-lg font-bold text-gray-900">
                        {label}
                      </h2>
                      {progress ? (
                        <div
                          className={`mt-3 inline-flex max-w-full items-start gap-2 rounded-xl border px-3 py-2 text-left text-sm ${progress.badgeClass}`}
                        >
                          <ProgressIcon
                            className="mt-0.5 h-4 w-4 shrink-0"
                            aria-hidden
                          />
                          <div>
                            <p className="font-semibold">{progress.title}</p>
                            <p className="mt-0.5 text-xs opacity-90">
                              {progress.detail}
                            </p>
                          </div>
                        </div>
                      ) : null}
                      <p className="mt-2 text-xs text-gray-500">
                        Điểm cao nhất:{" "}
                        <span className="font-semibold text-gray-800">
                          {bestScore}
                        </span>
                        {maxPts != null ? (
                          <span className="text-gray-400">
                            {" "}
                            / {maxPts} (tối đa)
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <span className="shrink-0 text-gray-400">
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </span>
                  </button>

                  {isOpen ? (
                    <div className="px-4 py-3 sm:px-5">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Các lần làm (mới nhất trên cùng)
                      </p>
                      <ul className="space-y-2">
                        {attempts.map((r, idx) => {
                          const older = attempts[idx + 1];
                          let deltaLabel = null;
                          if (older) {
                            const d = Number(r.score) - Number(older.score);
                            if (d > 0)
                              deltaLabel = (
                                <span className="text-emerald-700">
                                  +{d} điểm so với lần làm liền trước
                                </span>
                              );
                            else if (d < 0)
                              deltaLabel = (
                                <span className="text-rose-700">
                                  {d} điểm so với lần làm liền trước
                                </span>
                              );
                            else
                              deltaLabel = (
                                <span className="text-gray-500">
                                  Bằng lần làm liền trước
                                </span>
                              );
                          }
                          const mp = maxPossibleScore(r.totalQuestions);
                          const nthChrono = attempts.length - idx;
                          const attemptTitle =
                            idx === 0
                              ? `Lần làm thứ ${nthChrono} (mới nhất)`
                              : `Lần làm thứ ${nthChrono}`;
                          return (
                            <li
                              key={r.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5 text-sm"
                            >
                              <div>
                                <span className="font-medium text-gray-900">
                                  {attemptTitle}
                                </span>
                                <span className="ml-2 text-gray-500">
                                  {formatDate(r.createdAt)}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-semibold tabular-nums text-gray-900">
                                  {r.score}
                                  {mp != null ? (
                                    <span className="font-normal text-gray-500">
                                      {" "}
                                      / {mp}
                                    </span>
                                  ) : r.totalQuestions ? (
                                    <span className="font-normal text-gray-500">
                                      {" "}
                                      · {r.totalQuestions} câu
                                    </span>
                                  ) : null}
                                </span>
                                {deltaLabel ? (
                                  <p className="text-xs">{deltaLabel}</p>
                                ) : null}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LichSuLamBaiPage() {
  return (
    <StudentClassGate>
      <LichSuContent />
    </StudentClassGate>
  );
}
