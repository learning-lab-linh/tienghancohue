"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { History, LogIn, LogOut, UserPlus } from "lucide-react";

export default function StudentHeaderAuth() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/student/class/status");
        const data = await res.json().catch(() => ({}));
        if (!cancelled) setLoggedIn(Boolean(data.loggedIn));
      } catch {
        if (!cancelled) setLoggedIn(false);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = async () => {
    await fetch("/api/student/logout", { method: "POST" });
    setLoggedIn(false);
    router.refresh();
  };

  if (!ready) {
    return (
      <div className="flex items-center gap-2">
        <span className="h-9 w-20 animate-pulse rounded-full bg-rose-100" />
      </div>
    );
  }

  if (loggedIn) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-3">
        <Link
          href="/lich-su-lam-bai"
          aria-label="Lịch sử làm bài"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 p-2.5 text-[#b61e3b] shadow-sm transition hover:bg-rose-100 sm:px-4 sm:py-1.5 sm:text-xs sm:font-semibold md:text-sm"
        >
          <History className="h-5 w-5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
          <span className="hidden sm:inline">Lịch sử làm bài</span>
        </Link>
        <button
          type="button"
          aria-label="Đăng xuất"
          onClick={() => logout()}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-100 bg-white/90 p-2.5 text-gray-700 shadow-sm transition hover:bg-rose-50 sm:px-4 sm:py-1.5 sm:text-xs sm:font-semibold md:text-sm"
        >
          <LogOut className="h-5 w-5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      <Link
        href="/dang-ky"
        aria-label="Đăng ký"
        className="inline-flex items-center justify-center gap-2 rounded-full border border-[#b61e3b] p-2.5 text-[#b61e3b] transition hover:bg-rose-50 sm:px-4 sm:py-1.5 sm:text-xs sm:font-semibold md:text-sm"
      >
        <UserPlus className="h-5 w-5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
        <span className="hidden sm:inline">Đăng ký</span>
      </Link>
      <Link
        href="/dang-nhap"
        aria-label="Đăng nhập"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#b61e3b] p-2.5 text-white shadow-sm transition hover:bg-[#9d1832] sm:px-4 sm:py-1.5 sm:text-xs sm:font-semibold md:text-sm"
      >
        <LogIn className="h-5 w-5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
        <span className="hidden sm:inline">Đăng nhập</span>
      </Link>
    </div>
  );
}
