"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error || "Đăng nhập thất bại.");
        return;
      }
      const from = searchParams.get("from");
      const next =
        from &&
        from.startsWith("/admin") &&
        !from.startsWith("/admin/login")
          ? from
          : "/admin";
      router.push(next);
      router.refresh();
    } catch {
      setError("Không thể kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-rose-100 bg-white p-8 shadow-sm">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-rose-200/50 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-4 h-20 w-20 rounded-full bg-orange-200/40 blur-xl" />

      <div className="relative">
        <p className="mb-2 inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-[#b61e3b]">
          Quản trị
        </p>
        <h1 className="text-2xl font-bold text-[#b61e3b]">Đăng nhập admin</h1>
        <p className="mt-2 text-sm text-gray-600">
          Nhập ID và mật khẩu để vào bảng điều khiển.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-800">
            ID đăng nhập
            <input
              type="text"
              name="username"
              autoComplete="username"
              className="mt-1.5 h-11 w-full rounded-xl border border-rose-200 bg-white px-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#b61e3b] focus:ring-2 focus:ring-[#b61e3b]/20"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium text-gray-800">
            Mật khẩu
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              className="mt-1.5 h-11 w-full rounded-xl border border-rose-200 bg-white px-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#b61e3b] focus:ring-2 focus:ring-[#b61e3b]/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error ? (
            <p className="text-sm font-medium text-rose-700">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#e5441a] py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#cf3c15] disabled:translate-y-0 disabled:opacity-60"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-white text-gray-800">
      <header className="border-b border-rose-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              className="h-10 w-10 rounded-xl object-cover shadow-sm"
              src="/logo.jpg"
              alt="Tiếng Hàn Thu Huế"
              width={40}
              height={40}
            />
            <span className="text-sm font-bold tracking-wide text-[#b61e3b]">
              Tiếng Hàn Thu Huế
            </span>
          </Link>
        </div>
      </header>

      <div className="relative mx-auto flex max-w-md flex-col gap-6 px-4 pb-16 pt-10 sm:px-6">
        <div className="pointer-events-none absolute left-1/2 top-8 h-40 w-40 -translate-x-1/2 rounded-full bg-rose-200/40 blur-3xl" />

        <Suspense
          fallback={
            <div className="rounded-3xl border border-rose-100 bg-white p-8 text-sm text-gray-600 shadow-sm">
              Đang tải...
            </div>
          }
        >
          <AdminLoginForm />
        </Suspense>
        <p className="text-center text-sm text-gray-600">
          <Link
            href="/pages/Select"
            className="font-medium text-[#b61e3b] underline-offset-2 transition hover:underline"
          >
            Quay lại trang chọn đề
          </Link>
        </p>
      </div>
    </main>
  );
}
