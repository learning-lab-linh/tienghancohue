"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Headphones, PenLine } from "lucide-react";

const DEFAULT_SETS = {
  listen: [
    "Listen83",
    "Listen1",
    "Listen2",
    "Listen3",
    "Listen4",
    "Listen5",
    "Listen6",
    "Listen7",
    "Listen8",
  ],
  reading: ["Reading83", "De1", "De2", "De3", "De4", "De5", "De6", "De7", "De8"],
};

function fallbackSets(testType) {
  const keys = DEFAULT_SETS[testType] || [];
  return keys.map((setKey, idx) => ({
    setKey,
    label: setKey,
    displayOrder: idx + 1,
  }));
}

function SetGridCard({ testType, setRow, count }) {
  const href = `/admin/bo-de/${testType}/${encodeURIComponent(setRow.setKey)}`;
  const isListen = testType === "listen";

  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-rose-100 bg-white p-5 shadow-sm transition hover:border-[#b61e3b]/35 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            isListen
              ? "bg-rose-100 text-[#b61e3b]"
              : "bg-orange-50 text-[#e5441a]"
          }`}
        >
          {isListen ? (
            <>
              <Headphones className="h-3.5 w-3.5" aria-hidden />
              Nghe
            </>
          ) : (
            <>
              <BookOpen className="h-3.5 w-3.5" aria-hidden />
              Đọc
            </>
          )}
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#b61e3b]" />
      </div>
      <h3 className="mt-3 line-clamp-2 text-lg font-semibold text-gray-900 group-hover:text-[#b61e3b]">
        {setRow.label || setRow.setKey}
      </h3>
      <p className="mt-1 font-mono text-xs text-gray-500">{setRow.setKey}</p>
      <div className="mt-4 flex items-center justify-between border-t border-rose-50 pt-3 text-sm">
        <span className="text-gray-600">
          {count == null ? "—" : `${count} câu`}
        </span>
        <span className="font-medium text-[#b61e3b] group-hover:text-[#9a1932]">
          Chỉnh sửa
        </span>
      </div>
    </Link>
  );
}

export default function AdminBoDeGridPage() {
  const [listenSets, setListenSets] = useState([]);
  const [readingSets, setReadingSets] = useState([]);
  const [errListen, setErrListen] = useState("");
  const [errReading, setErrReading] = useState("");
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErrListen("");
      setErrReading("");
      try {
        const [lr, rr] = await Promise.all([
          fetch("/api/sets?testType=listen"),
          fetch("/api/sets?testType=reading"),
        ]);
        const lj = await lr.json().catch(() => ({}));
        const rj = await rr.json().catch(() => ({}));

        if (cancelled) return;

        const nextListen =
          Array.isArray(lj.data) && lj.data.length ? lj.data : fallbackSets("listen");
        const nextReading =
          Array.isArray(rj.data) && rj.data.length ? rj.data : fallbackSets("reading");

        if (!lr.ok || !Array.isArray(lj.data) || !lj.data.length) {
          setErrListen("Không tải được API nghe — đang dùng danh sách mặc định.");
        }
        if (!rr.ok || !Array.isArray(rj.data) || !rj.data.length) {
          setErrReading("Không tải được API đọc — đang dùng danh sách mặc định.");
        }

        setListenSets(nextListen);
        setReadingSets(nextReading);
      } catch {
        if (!cancelled) {
          setListenSets(fallbackSets("listen"));
          setReadingSets(fallbackSets("reading"));
          setErrListen("Lỗi mạng.");
          setErrReading("Lỗi mạng.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allEntries = useMemo(() => {
    return [
      ...listenSets.map((s) => ({ testType: "listen", setRow: s })),
      ...readingSets.map((s) => ({ testType: "reading", setRow: s })),
    ];
  }, [listenSets, readingSets]);

  useEffect(() => {
    if (!allEntries.length) return;
    let cancelled = false;
    (async () => {
      const results = await Promise.all(
        allEntries.map(async ({ testType, setRow }) => {
          const key = setRow.setKey;
          const k = `${testType}:${key}`;
          try {
            const res = await fetch(
              `/api/questions?testType=${testType}&setKey=${encodeURIComponent(key)}`
            );
            const j = await res.json().catch(() => ({}));
            const n = Array.isArray(j.data) ? j.data.length : 0;
            return { k, n };
          } catch {
            return { k, n: null };
          }
        })
      );
      if (cancelled) return;
      const next = {};
      for (const { k, n } of results) next[k] = n;
      setCounts(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [allEntries]);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="max-w-2xl text-sm text-gray-600">
            Chọn một bộ đề để mở trang chi tiết: duyệt câu hỏi, upload ảnh và lưu đáp án. Tạo
            bộ mới tại mục{" "}
            <Link
              href="/admin/tao-de"
              className="font-medium text-[#b61e3b] underline-offset-2 hover:underline"
            >
              Tạo đề (template)
            </Link>
            .
          </p>
        </div>
        <Link
          href="/admin/tao-de"
          className="inline-flex items-center gap-2 rounded-full bg-[#e5441a] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#cf3c15]"
        >
          <PenLine className="h-4 w-4" aria-hidden />
          Tạo đề mới
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl bg-rose-100/80"
              aria-hidden
            />
          ))}
        </div>
      ) : (
        <>
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Headphones className="h-5 w-5 text-[#b61e3b]" aria-hidden />
              <h2 className="text-lg font-bold text-gray-900">Kỹ năng nghe</h2>
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-[#b61e3b]">
                {listenSets.length} bộ
              </span>
            </div>
            {errListen ? (
              <p className="mb-3 text-sm text-amber-800">{errListen}</p>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listenSets.map((s) => (
                <SetGridCard
                  key={s.setKey}
                  testType="listen"
                  setRow={s}
                  count={counts[`listen:${s.setKey}`]}
                />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#e5441a]" aria-hidden />
              <h2 className="text-lg font-bold text-gray-900">Kỹ năng đọc</h2>
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-[#c43d0e]">
                {readingSets.length} bộ
              </span>
            </div>
            {errReading ? (
              <p className="mb-3 text-sm text-amber-800">{errReading}</p>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {readingSets.map((s) => (
                <SetGridCard
                  key={s.setKey}
                  testType="reading"
                  setRow={s}
                  count={counts[`reading:${s.setKey}`]}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
