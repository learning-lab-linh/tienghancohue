"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";

function safeNextPath(raw) {
  if (!raw || typeof raw !== "string") return "/pages/Select";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/pages/Select";
  if (raw.startsWith("/dang-nhap") || raw.startsWith("/dang-ky")) {
    return "/pages/Select";
  }
  return raw;
}

function NhapMaLopForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/student/class/status");
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!data.loggedIn) {
          router.replace(
            `/dang-nhap?from=${encodeURIComponent("/nhap-ma-lop")}`
          );
          return;
        }
        if (data.enrolled) {
          const next = safeNextPath(searchParams.get("from"));
          router.replace(next);
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Nhập mã lớp.");
      return;
    }
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      let user = auth.currentUser;
      if (!user) {
        user = await new Promise((resolve) => {
          const unsub = onAuthStateChanged(auth, (u) => {
            if (u) {
              unsub();
              resolve(u);
            }
          });
          setTimeout(() => {
            unsub();
            resolve(auth.currentUser);
          }, 5000);
        });
      }
      if (!user) {
        router.push(`/dang-nhap?from=${encodeURIComponent("/nhap-ma-lop")}`);
        return;
      }
      const idToken = await user.getIdToken();
      const res = await fetch("/api/student/class/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, code: trimmed }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error || "Không tham gia được lớp.");
        return;
      }
      const next = safeNextPath(searchParams.get("from"));
      router.push(next);
      router.refresh();
    } catch {
      setError("Có lỗi xảy ra, thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="rounded-3xl border border-rose-100 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
        Đang kiểm tra…
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-rose-100 bg-white p-8 shadow-sm">
      <p className="mb-2 inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-[#b61e3b]">
        Học viên
      </p>
      <h1 className="text-2xl font-bold text-gray-900">Nhập mã lớp</h1>
      <p className="mt-2 text-sm text-gray-600">
        Bạn cần mã lớp do giáo viên cung cấp để làm bài nghe, đọc và lưu kết
        quả.
      </p>

      <form className="mt-6 space-y-4" onSubmit={submit}>
        <label className="block text-sm font-medium text-gray-800">
          Mã lớp
          <input
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            placeholder="Ví dụ: QYKWJF"
            className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3 font-mono text-lg tracking-widest text-black"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={12}
          />
        </label>
        {error ? (
          <p className="text-sm font-medium text-rose-700">{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#e5441a] py-2.5 text-sm font-semibold text-white transition hover:bg-[#cf3c15] disabled:opacity-60"
        >
          {loading ? "Đang xác nhận…" : "Xác nhận"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link
          href="/pages/Select"
          className="font-semibold text-[#b61e3b] underline-offset-2 hover:underline"
        >
          Về trang chọn bài
        </Link>
      </p>
    </div>
  );
}

export default function NhapMaLopPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-white p-4 text-black sm:p-8">
      <div className="mx-auto flex max-w-md flex-col gap-6 pt-12">
        <Suspense
          fallback={
            <div className="rounded-3xl border border-rose-100 bg-white p-8 text-sm text-gray-600">
              Đang tải…
            </div>
          }
        >
          <NhapMaLopForm />
        </Suspense>
        <p className="text-center text-sm">
          <Link href="/" className="text-[#b61e3b] underline-offset-2 hover:underline">
            Về trang chủ
          </Link>
        </p>
      </div>
    </main>
  );
}
