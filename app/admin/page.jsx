"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, Users } from "lucide-react";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [listenSets, setListenSets] = useState(0);
  const [readingSets, setReadingSets] = useState(0);
  const [classCount, setClassCount] = useState(0);
  const [totalStudentCount, setTotalStudentCount] = useState(0);
  const [recentResults, setRecentResults] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [listenRes, readingRes, classesRes, resultsRes] = await Promise.all([
          fetch("/api/sets?testType=listen"),
          fetch("/api/sets?testType=reading"),
          fetch("/api/admin/classes"),
          fetch("/api/results?limit=8"),
        ]);

        if (cancelled) return;

        const listenPayload = await listenRes.json().catch(() => ({}));
        const readingPayload = await readingRes.json().catch(() => ({}));
        const classesPayload = await classesRes.json().catch(() => ({}));
        const resultsPayload = await resultsRes.json().catch(() => ({}));

        setListenSets(Array.isArray(listenPayload.data) ? listenPayload.data.length : 0);
        setReadingSets(Array.isArray(readingPayload.data) ? readingPayload.data.length : 0);
        setClassCount(Array.isArray(classesPayload.data) ? classesPayload.data.length : 0);
        setTotalStudentCount(
          typeof classesPayload.totalStudentCount === "number"
            ? classesPayload.totalStudentCount
            : 0
        );
        setRecentResults(Array.isArray(resultsPayload.data) ? resultsPayload.data : []);
      } catch {
        if (!cancelled) {
          setListenSets(0);
          setReadingSets(0);
          setClassCount(0);
          setTotalStudentCount(0);
          setRecentResults([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const shortcuts = [
    {
      href: "/admin/bo-de",
      title: "Bộ đề & câu hỏi",
      desc: "Sửa câu, upload ảnh, đáp án",
      icon: BookOpen,
      color:
        "border-rose-200 bg-rose-50/80 text-gray-900 hover:border-[#b61e3b]/30 hover:bg-rose-50",
    },
    {
      href: "/admin/lop-hoc",
      title: "Lớp học",
      desc: "Tạo lớp, mã lớp, lưu trữ",
      icon: Users,
      color:
        "border-rose-200 bg-white text-gray-900 hover:border-[#b61e3b]/40 hover:bg-rose-50/50",
    },
    {
      href: "/admin/tao-de",
      title: "Tạo đề template",
      desc: "Khung đề mới từ Listen83 / Reading91",
      icon: BarChart3,
      color:
        "border-orange-200 bg-orange-50/50 text-gray-900 hover:border-[#e5441a]/40 hover:bg-orange-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-gray-600">
          Chào mừng trở lại. Dưới đây là nhanh số liệu và lối tắt tới các mục quản trị.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Bộ đề nghe
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {loading ? "—" : listenSets}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Bộ đề đọc
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {loading ? "—" : readingSets}
          </p>
        </div>
        <div className="rounded-2xl border border-[#b61e3b]/25 bg-[#b61e3b]/[0.06] p-5 shadow-sm ring-1 ring-[#b61e3b]/10">
          <p className="text-xs font-medium uppercase tracking-wide text-[#b61e3b]">
            Tổng học viên
          </p>
          <p className="mt-2 text-3xl font-bold text-[#b61e3b]">
            {loading ? "—" : totalStudentCount}
          </p>
          <p className="mt-1 text-[11px] leading-snug text-gray-600">
            Email khác nhau đã tham gia ít nhất một lớp
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Lớp đang mở
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {loading ? "—" : classCount}
          </p>
        </div>
   
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Lối tắt
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {shortcuts.map(({ href, title, desc, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className={`group flex flex-col rounded-2xl border p-5 shadow-sm transition ${color}`}
            >
              <div className="flex items-start justify-between gap-2">
                <Icon className="h-8 w-8 text-[#b61e3b] opacity-90" aria-hidden />
                <ArrowRight className="h-5 w-5 shrink-0 text-gray-400 opacity-70 transition group-hover:translate-x-0.5 group-hover:text-[#b61e3b] group-hover:opacity-100" />
              </div>
              <p className="mt-3 font-semibold">{title}</p>
              <p className="mt-1 text-sm text-gray-600">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
