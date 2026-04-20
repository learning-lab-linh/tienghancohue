"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Select() {
  const [status, setStatus] = useState({ loading: true, loggedIn: false, enrolled: false });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/student/class/status");
        const data = await res.json().catch(() => ({}));
        if (!cancelled) {
          setStatus({
            loading: false,
            loggedIn: Boolean(data.loggedIn),
            enrolled: Boolean(data.enrolled),
          });
        }
      } catch {
        if (!cancelled) {
          setStatus({ loading: false, loggedIn: false, enrolled: false });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const needClass = status.loggedIn && !status.enrolled;

  return (
    <div className="min-h-screen bg-slate-100 px-4">
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <h1 className="mb-4 text-center text-2xl font-bold text-slate-800">
            Hãy lựa chọn phần bạn muốn ôn
          </h1>

          {!status.loading && needClass ? (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              Bạn cần{" "}
              <Link
                href="/nhap-ma-lop?from=/pages/Select"
                className="font-semibold underline underline-offset-2"
              >
                nhập mã lớp
              </Link>{" "}
              để lưu kết quả vào lịch sử học viên.
            </div>
          ) : null}

          {!status.loading && !status.loggedIn ? (
            <p className="mb-6 text-center text-sm text-slate-600">
              Bạn có thể làm bài ngay không cần đăng nhập.
            </p>
          ) : null}

          <div className="flex flex-col items-center gap-3">
            <Link
              href={status.loading ? "#" : "/pages/Listen"}
              className={`w-40 rounded-lg px-6 py-2.5 text-center text-sm font-semibold text-white transition ${
                status.loading
                  ? "pointer-events-none bg-slate-400"
                  : "bg-slate-800 hover:bg-slate-700"
              }`}
              aria-busy={status.loading}
            >
              Listen
            </Link>
            <Link
              href={status.loading ? "#" : "/pages/Reading"}
              className={`w-40 rounded-lg border px-6 py-2.5 text-center text-sm font-semibold transition ${
                status.loading
                  ? "pointer-events-none border-slate-200 bg-slate-100 text-slate-400"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              aria-busy={status.loading}
            >
              Reading
            </Link>
           
            {status.loggedIn && status.enrolled ? (
              <Link
                href="/lich-su-lam-bai"
                className="inline-block w-40 rounded-lg border border-indigo-200 bg-indigo-50 px-6 py-2.5 text-center text-sm font-semibold text-indigo-900 transition hover:bg-indigo-100"
              >
                Lịch sử làm bài
              </Link>
            ) : null}
          </div>

          {needClass ? (
            <p className="mt-6 text-center text-xs text-slate-500">
              Hoặc mở trực tiếp{" "}
              <Link
                href="/nhap-ma-lop?from=/pages/Select"
                className="font-medium text-teal-700 underline-offset-2 hover:underline"
              >
                nhập mã lớp
              </Link>
              .
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
