"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { mapFirebaseAuthError } from "@/lib/mapFirebaseAuthError";
import StudentGoogleSignInButton from "@/app/components/StudentGoogleSignInButton";
import { redirectAfterStudentSession } from "@/app/utils/redirectAfterStudentSession";

function safeNextPath(raw) {
  if (!raw || typeof raw !== "string") return "/pages/Select";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/pages/Select";
  if (raw.startsWith("/dang-nhap") || raw.startsWith("/dang-ky"))
    return "/pages/Select";
  return raw;
}

function StudentRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const idToken = await cred.user.getIdToken();
      const res = await fetch("/api/student/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        await signOut(auth);
        setError(payload.error || "Đã tạo tài khoản nhưng không tạo được phiên.");
        return;
      }
      const next = safeNextPath(searchParams.get("from"));
      await redirectAfterStudentSession(router, next, {
        loggedIn: true,
        enrolled: Boolean(payload.enrolled),
      });
    } catch (err) {
      const code = err && typeof err === "object" && "code" in err ? err.code : "";
      console.error("[student/register] firebase auth failed:", err);
      setError(mapFirebaseAuthError(String(code)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-rose-100 bg-white p-8 shadow-sm">
      <p className="mb-2 inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-[#b61e3b]">
        Học viên
      </p>
      <h1 className="text-2xl font-bold text-gray-900">Đăng ký</h1>
      <p className="mt-2 text-sm text-gray-600">
        Tạo tài khoản bằng email để làm bài và theo dõi lịch sử.
      </p>

      <div className="mt-6 space-y-3">
        <StudentGoogleSignInButton
          disabled={loading}
          label="Đăng ký bằng Google"
          onError={setError}
          onAfterSession={async (sessionPayload) => {
            const next = safeNextPath(searchParams.get("from"));
            await redirectAfterStudentSession(router, next, {
              loggedIn: true,
              enrolled: Boolean(sessionPayload?.enrolled),
            });
          }}
        />
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-500">hoặc email</span>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-gray-800">
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3 text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-medium text-gray-800">
          Mật khẩu
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3 text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
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
          {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Đã có tài khoản?{" "}
        <Link
          href={`/dang-nhap?from=${encodeURIComponent(
            searchParams.get("from") || "/pages/Select"
          )}`}
          className="font-semibold text-[#b61e3b] underline-offset-2 hover:underline"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}

export default function DangKyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-white p-4 text-black sm:p-8">
      <div className="mx-auto flex max-w-md flex-col gap-6 pt-12">
        <Suspense
          fallback={
            <div className="rounded-3xl border border-rose-100 bg-white p-8 text-sm text-gray-600">
              Đang tải...
            </div>
          }
        >
          <StudentRegisterForm />
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
