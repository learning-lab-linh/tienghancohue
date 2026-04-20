"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  FileStack,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/bo-de", label: "Bộ đề & câu hỏi", icon: FolderOpen },
  { href: "/admin/lop-hoc", label: "Lớp học", icon: Users },
  { href: "/admin/tao-de", label: "Tạo đề (template)", icon: FileStack },
];

function navActive(pathname, href) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function titleForPath(pathname) {
  if (pathname === "/admin") return "Tổng quan";
  if (/^\/admin\/bo-de\/(listen|reading)\/.+/u.test(pathname)) {
    return "Chi tiết bộ đề";
  }
  if (pathname.startsWith("/admin/bo-de")) return "Bộ đề & câu hỏi";
  if (pathname === "/admin/lop-hoc/tao") return "Tạo lớp mới";
  if (/^\/admin\/lop-hoc\/\d+$/u.test(pathname)) return "Chi tiết lớp";
  if (pathname.startsWith("/admin/lop-hoc")) return "Lớp học";
  if (pathname.startsWith("/admin/tao-de")) return "Tạo đề từ template";
  return "Quản trị";
}

export default function AdminShell({ children }) {
  const pathname = usePathname() || "";
  const [mobileOpen, setMobileOpen] = useState(false);
  const pageTitle = useMemo(() => titleForPath(pathname), [pathname]);

  if (pathname.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const closeMobile = () => setMobileOpen(false);

  const sidebar = (
    <div className="flex h-full flex-col border-r border-white/10 bg-[#b61e3b] text-white shadow-lg">
      <div className="flex h-14 items-center gap-3 border-b border-white/15 px-4 lg:h-16">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-sm">
          <Image
            src="/logo.jpg"
            alt=""
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            Tiếng Hàn Thu Huế
          </p>
          <p className="text-xs text-rose-100/90">Admin</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = navActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={closeMobile}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-white/20 text-white shadow-sm ring-1 ring-white/25"
                  : "text-rose-50 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-white/15 p-3">
        <Link
          href="/pages/Select"
          target="_blank"
          rel="noopener noreferrer"
          onClick={closeMobile}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-100 transition hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="h-5 w-5 shrink-0" aria-hidden />
          Trang làm bài
        </Link>
        <button
          type="button"
          onClick={() => {
            closeMobile();
            logout();
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-100 transition hover:bg-black/10 hover:text-white"
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden />
          Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-white text-gray-800">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
          aria-label="Đóng menu"
          onClick={closeMobile}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebar}
        <button
          type="button"
          onClick={closeMobile}
          className="absolute right-2 top-3 rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-rose-100 bg-white/90 px-4 backdrop-blur lg:h-16 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-gray-600 hover:bg-rose-50 lg:hidden"
            aria-label="Mở menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold text-[#b61e3b] lg:text-xl">
              {pageTitle}
            </h1>
            <p className="hidden text-xs text-gray-500 sm:block">
              Bảng điều khiển quản trị nội dung & lớp học
            </p>
          </div>
        </header>

        <div className="w-full p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
