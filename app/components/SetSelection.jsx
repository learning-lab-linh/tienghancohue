"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, BookOpen, Check, ClipboardList, Headphones,
  Home, Layers3, Menu, Moon, Search, Sun, Target, TrendingUp, X, Zap,
} from "lucide-react";
import "../styles/set-selection.css";

const filters = [
  { key: "all", label: "Tất cả" },
  { key: "practice", label: "Bộ đề 1 – 7" },
  { key: "topik", label: "Đề TOPIK 83 & 91" },
];

function setGroup(set) {
  const number = Number(String(set.label || "").match(/\d+/)?.[0]);
  if (number === 83 || number === 91) return "topik";
  if (number >= 1 && number <= 7) return "practice";
  return "other";
}

export default function SetSelection({
  onSelectSet,
  sets = [],
  testType = "reading",
  loading = false,
  error = "",
}) {
  const isReading = testType === "reading";
  const title = isReading ? "Luyện đọc" : "Luyện nghe";
  const skill = isReading ? "đọc hiểu" : "nghe hiểu";
  const Icon = isReading ? BookOpen : Headphones;
  const [selectedSet, setSelectedSet] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleSets = useMemo(() => sets.filter((item) => {
    const matchesFilter = filter === "all" || setGroup(item) === filter;
    const matchesSearch = item.label.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi"));
    return matchesFilter && matchesSearch;
  }), [sets, filter, query]);

  useEffect(() => {
    if (!visibleSets.some((item) => item.setKey === selectedSet)) {
      setSelectedSet(visibleSets[0]?.setKey || "");
    }
  }, [visibleSets, selectedSet]);

  const selected = visibleSets.find((item) => item.setKey === selectedSet);

  function changeFilter(nextFilter) {
    setFilter(nextFilter);
  }

  return (
    <main className={dark ? "set-picker is-dark" : "set-picker"}>
      <header className="set-header">
        <div className="set-header-inner">
          <Link href="/" className="set-brand" aria-label="Tiếng Hàn Thu Huế - Trang chủ">
            <Image src="/logo.jpg" alt="" width={62} height={62} priority />
            <span><strong>Tiếng Hàn Thu Huế</strong><small>Học tiếng Hàn - Luyện thi TOPIK</small></span>
          </Link>
          <nav className={menuOpen ? "set-nav is-open" : "set-nav"} aria-label="Điều hướng chính">
            <Link href="/" onClick={() => setMenuOpen(false)}><Home size={19} fill="currentColor" /> Trang chủ</Link>
            <Link href="/pages/Listen" className={!isReading ? "active" : ""} onClick={() => setMenuOpen(false)}><Headphones size={20} /> Luyện nghe</Link>
            <Link href="/pages/Reading" className={isReading ? "active" : ""} onClick={() => setMenuOpen(false)}><BookOpen size={21} /> Luyện đọc</Link>
            <Link href="/#ngu-phap" onClick={() => setMenuOpen(false)}><Layers3 size={20} /> Ngữ pháp</Link>
            <Link href="/pages/ConnectWord" onClick={() => setMenuOpen(false)}>Aᵃ Từ vựng</Link>
          </nav>
          <div className="set-header-actions">
            <button type="button" className="set-icon-button" aria-label={searchOpen ? "Đóng tìm kiếm" : "Tìm bộ đề"} aria-expanded={searchOpen} onClick={() => setSearchOpen(!searchOpen)}>{searchOpen ? <X /> : <Search />}</button>
            <button type="button" className="set-icon-button" aria-label={dark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"} aria-pressed={dark} onClick={() => setDark(!dark)}>{dark ? <Sun /> : <Moon fill="currentColor" />}</button>
            <button type="button" className="set-icon-button set-menu-button" aria-label={menuOpen ? "Đóng menu" : "Mở menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
          </div>
        </div>
        {searchOpen && <div className="set-search-row"><Search size={20} /><input autoFocus type="search" placeholder="Tìm tên bộ đề..." value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Tìm tên bộ đề" /></div>}
      </header>

      <section className="set-hero" aria-labelledby="set-title">
        <div className="set-hero-background" aria-hidden="true" />
        <div className="set-hero-inner">
          <div className="set-hero-content">
            <div className="set-breadcrumb"><Link href="/"><Home size={19} fill="currentColor" /> Trang chủ</Link><span>/</span><strong>{title} TOPIK</strong></div>
            <h1 id="set-title"><Icon className="set-title-icon" size={64} fill="currentColor" strokeWidth={1.7} /> {title} <span>TOPIK</span></h1>
            <p>Chọn bộ đề và bắt đầu luyện tập ngay.</p>
            <div className="set-benefits"><span><Target /> Đề thi sát TOPIK</span><span><TrendingUp /> Rèn kỹ năng {skill}</span><span><Zap fill="currentColor" /> Có đáp án &amp; giải thích</span></div>
          </div>
          <Image className="set-hero-mascot" src={isReading ? "/topik-reading-mascot.png" : "/topik-listening-mascot.png"} alt={isReading ? "Học sinh đọc sách luyện TOPIK" : "Học sinh đeo tai nghe luyện TOPIK"} width={700} height={467} priority unoptimized />
        </div>
        <div className="set-hero-wave" aria-hidden="true" />
      </section>

      <section className="set-main" aria-labelledby="set-heading">
        <div className="set-section-top">
          <h2 id="set-heading">Chọn bộ đề luyện {isReading ? "đọc" : "nghe"}<span aria-hidden="true">✦</span></h2>
          <div className="set-filters" role="group" aria-label="Lọc bộ đề">
            {filters.map((item) => <button key={item.key} type="button" className={filter === item.key ? "active" : ""} aria-pressed={filter === item.key} onClick={() => changeFilter(item.key)}>{item.label}</button>)}
          </div>
        </div>

        {loading ? (
          <div className="set-grid" aria-busy="true" aria-label="Đang tải bộ đề">{Array.from({ length: 9 }, (_, index) => <div className="set-skeleton" key={index} />)}</div>
        ) : error ? (
          <div className="set-empty" role="alert">{error}</div>
        ) : visibleSets.length ? (
          <div className="set-grid">
            {visibleSets.map((item) => <button type="button" className={item.setKey === selectedSet ? "set-card selected" : "set-card"} key={item.setKey} aria-pressed={item.setKey === selectedSet} onClick={() => setSelectedSet(item.setKey)}>
              <span className="set-card-icon"><Icon size={42} fill="currentColor" strokeWidth={1.6} /></span>
              <span className="set-card-copy"><strong>{item.label}</strong><small>Luyện {skill}</small></span>
              <span className="set-card-action">Chọn đề</span>
              {item.setKey === selectedSet && <span className="set-card-check"><Check size={15} strokeWidth={3} /></span>}
            </button>)}
          </div>
        ) : <div className="set-empty">{sets.length ? "Không có bộ đề phù hợp với bộ lọc này." : "Chưa có bộ đề để luyện tập."}</div>}

        <div className="set-start-bar">
          <ClipboardList className="set-start-icon" size={44} />
          <div className="set-selected-label">Đã chọn: <strong>{selected?.label || "Chưa chọn bộ đề"}</strong></div>
          <p>Luyện {skill} <span>•</span> Đề thi sát cấu trúc TOPIK</p>
          <button type="button" disabled={!selected || loading || Boolean(error)} onClick={() => onSelectSet(selectedSet)}>Bắt đầu thi <ArrowRight size={27} /></button>
        </div>
      </section>
      <div className="set-bottom-wave" aria-hidden="true" />
    </main>
  );
}
