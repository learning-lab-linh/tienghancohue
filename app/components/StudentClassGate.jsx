"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Chỉ cho phép vào nội dung khi đã đăng nhập học viên và đã nhập mã lớp.
 */
export default function StudentClassGate({ children }) {
  const router = useRouter();
  const pathname = usePathname() || "/pages/Select";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/student/class/status");
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!data.loggedIn) {
          router.replace(
            `/dang-nhap?from=${encodeURIComponent(pathname)}`
          );
          return;
        }
        if (!data.enrolled) {
          router.replace(
            `/nhap-ma-lop?from=${encodeURIComponent(pathname)}`
          );
          return;
        }
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) {
          router.replace(
            `/dang-nhap?from=${encodeURIComponent(pathname)}`
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-slate-100 px-4 text-slate-600">
        <p className="text-sm font-medium">Đang kiểm tra tài khoản và mã lớp…</p>
      </div>
    );
  }

  return children;
}
