"use client";

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
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="mb-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
        Quản trị
      </p>
      <h1 className="text-2xl font-bold">Đăng nhập admin</h1>
      <p className="mt-2 text-sm text-slate-600">
        Nhập ID và mật khẩu để vào bảng điều khiển.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium">
          ID đăng nhập
          <input
            type="text"
            name="username"
            autoComplete="username"
            className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3 text-black"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-medium">
          Mật khẩu
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3 text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white p-4 text-black sm:p-8">
      <div className="mx-auto flex max-w-md flex-col gap-6 pt-12">
        <Suspense
          fallback={
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
              Đang tải...
            </div>
          }
        >
          <AdminLoginForm />
        </Suspense>
        <p className="text-center text-sm">
          <Link href="/pages/Select" className="text-indigo-700 underline">
            Quay lại trang chọn đề
          </Link>
        </p>
      </div>
    </main>
  );
}
