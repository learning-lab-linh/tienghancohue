"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, BookOpen, Check, ChevronDown, GraduationCap,
  Headphones, Layers3, Lightbulb, Menu, Moon, Play,
  Search, Sun, Target, X, Languages,
} from "lucide-react";
import StudentHeaderAuth from "./components/StudentHeaderAuth";
import "./styles/home.css";

const searchItems = [
  { label: "Luyện nghe TOPIK", href: "/pages/Listen", detail: "Đề nghe TOPIK I & II" },
  { label: "Luyện đọc TOPIK", href: "/pages/Reading", detail: "Bài đọc và câu hỏi thực tế" },
  { label: "Chọn đề thi", href: "/pages/Select", detail: "Bắt đầu luyện tập" },
  { label: "Luyện từ vựng", href: "/pages/ConnectWord", detail: "Nối từ và ghi nhớ" },
  { label: "Ngữ pháp TOPIK", href: "#ngu-phap", detail: "Các mẫu câu cơ bản" },
  { label: "Lộ trình học", href: "#lo-trinh", detail: "Các bước ôn tập" },
  { label: "Kinh nghiệm thi", href: "#kinh-nghiem", detail: "Mẹo luyện thi" },
];

const smallCards = [
  { icon: Layers3, title: "Ngữ pháp", text: "Ôn tập ngữ pháp theo chủ đề, ví dụ và bài luyện tập.", href: "#ngu-phap", tone: "navy" },
  { icon: Languages, title: "Từ vựng", text: "Hệ thống từ vựng theo cấp độ TOPIK, dễ học, dễ nhớ.", href: "/pages/ConnectWord", tone: "red" },
  { icon: Target, title: "Lộ trình học", text: "Gợi ý lộ trình học TOPIK từ cơ bản đến nâng cao.", href: "#lo-trinh", tone: "red" },
  { icon: Lightbulb, title: "Kinh nghiệm thi", text: "Chia sẻ kinh nghiệm, mẹo làm bài và tài liệu hữu ích.", href: "#kinh-nghiem", tone: "navy" },
];

export default function Home() {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const results = searchItems.filter((item) =>
    (item.label + " " + item.detail).toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi"))
  );

  return (
    <main className={dark ? "home-shell home-dark" : "home-shell"}>
      <header className="home-header">
        <div className="home-header-inner">
          <Link href="/" className="home-brand" aria-label="Tiếng Hàn Thu Huế - Trang chủ">
            <Image src="/logo.jpg" alt="" width={64} height={64} className="home-logo" priority />
            <span className="home-brand-copy"><strong>Tiếng Hàn Thu Huế</strong><small>Học tiếng Hàn - Luyện thi TOPIK</small></span>
          </Link>

          <nav className={menuOpen ? "home-nav is-open" : "home-nav"} aria-label="Điều hướng chính">
            <Link href="/" className="home-nav-active" onClick={() => setMenuOpen(false)}>Trang chủ</Link>
            <div className="home-nav-dropdown">
              <button type="button" aria-label="Mở các bài luyện TOPIK" aria-haspopup="true">
                Luyện TOPIK <ChevronDown size={17} strokeWidth={2.5} />
              </button>
              <div className="home-dropdown-panel">
                <Link href="/pages/Select" onClick={() => setMenuOpen(false)}>Chọn đề thi</Link>
                <Link href="/pages/Listen" onClick={() => setMenuOpen(false)}>Luyện nghe</Link>
                <Link href="/pages/Reading" onClick={() => setMenuOpen(false)}>Luyện đọc</Link>
              </div>
            </div>
            <Link href="#ngu-phap" onClick={() => setMenuOpen(false)}>Ngữ pháp</Link>
            <Link href="/pages/ConnectWord" onClick={() => setMenuOpen(false)}>Từ vựng</Link>
            <Link href="#kinh-nghiem" onClick={() => setMenuOpen(false)}>Kinh nghiệm</Link>
          </nav>

          <div className="home-header-actions">
            <button className="home-icon-button search-button" type="button" aria-label="Tìm kiếm" onClick={() => setSearchOpen(true)}><Search size={25} /></button>
            <button className="home-icon-button theme-button" type="button" aria-label={dark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"} aria-pressed={dark} onClick={() => setDark(!dark)}>{dark ? <Sun size={22} /> : <Moon size={22} fill="currentColor" />}</button>
            <Link href="/pages/Select" className="home-start">Bắt đầu học</Link>
            <button className="home-icon-button mobile-menu-button" type="button" aria-label={menuOpen ? "Đóng menu" : "Mở menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
          </div>
        </div>
      </header>

      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-bg" aria-hidden="true" />
        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <span className="home-eyebrow"><GraduationCap size={23} fill="currentColor" /> Nền tảng luyện thi TOPIK miễn phí</span>
            <h1 id="home-title">Luyện thi TOPIK hiệu quả,<br /><span>cùng Tiếng Hàn Thu Huế</span></h1>
            <p>Luyện nghe, đọc, ôn ngữ pháp, từ vựng và chia sẻ kinh nghiệm thi TOPIK thực tế. Hoàn toàn miễn phí, không cần đăng nhập.</p>
            <div className="home-hero-buttons">
              <Link href="/pages/Select" className="home-button-primary"><Play size={21} fill="currentColor" /> Luyện thi ngay</Link>
              <Link href="#lo-trinh" className="home-button-outline"><BookOpen size={23} /> Xem lộ trình</Link>
            </div>
            <ul className="home-benefits">
              <li><Check /> Đề thi sát thực tế</li><li><Check /> Giao diện dễ học</li><li><Check /> Cập nhật thường xuyên</li>
            </ul>
          </div>
          <div className="home-hero-art">
            <Image src="/topik-mascot.png" alt="Nhân vật học sinh vui vẻ luyện TOPIK trên máy tính, bên cạnh sách và cờ Hàn Quốc" width={760} height={507} priority />
          </div>
        </div>
        <div className="home-wave" aria-hidden="true"><span /><span /></div>
      </section>

      <section className="home-practice" id="luyen-tap" aria-labelledby="practice-heading">
        <div className="home-section-heading">
          <h2 id="practice-heading">Bắt đầu luyện tập ngay <span aria-hidden="true">✦</span></h2>
          <p>Chọn dạng bài bạn muốn luyện để nâng cao điểm TOPIK.</p>
        </div>
        <div className="home-practice-grid">
          <Link href="/pages/Listen" className="home-feature-card listen-card">
            <span className="home-feature-icon"><Headphones size={76} strokeWidth={1.7} /><span className="sound-wave">⌁</span></span>
            <span className="home-feature-copy"><strong>Luyện nghe TOPIK</strong><small>Đề thi theo cấp độ TOPIK I &amp; II,<br /> có đáp án và giải thích chi tiết.</small></span>
            <span className="home-card-arrow"><ArrowRight size={26} /></span>
          </Link>
          <Link href="/pages/Reading" className="home-feature-card reading-card">
            <span className="home-feature-icon"><BookOpen size={86} strokeWidth={1.5} /></span>
            <span className="home-feature-copy"><strong>Luyện đọc TOPIK</strong><small>Luyện đọc hiểu, nâng cao<br /> kỹ năng phân tích và xử lý đề.</small></span>
            <span className="home-card-arrow"><ArrowRight size={26} /></span>
          </Link>
        </div>
        <div className="home-topic-grid">
          {smallCards.map(({ icon: Icon, title, text, href, tone }) => (
            <Link href={href} className="home-topic-card" key={title}>
              <span className={"home-topic-icon " + tone}><Icon size={38} strokeWidth={2.1} /></span>
              <span><strong>{title}</strong><small>{text}</small></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-more" id="lo-trinh">
        <div><span className="home-kicker">HỌC THEO NHỊP CỦA BẠN</span><h2>Một lộ trình rõ ràng để tiến bộ mỗi ngày</h2><p>Chọn đề phù hợp, luyện từng kỹ năng và xem lại kết quả để biết mình cần tập trung vào đâu.</p></div>
        <div className="home-steps"><span><b>01</b> Chọn đề theo trình độ</span><span><b>02</b> Luyện nghe và đọc</span><span><b>03</b> Xem đáp án, rút kinh nghiệm</span></div>
      </section>
      <section className="home-grammar" id="ngu-phap">
        <div><span className="home-kicker">NGỮ PHÁP CẦN NHỚ</span><h2>Bắt đầu từ những mẫu câu quen thuộc</h2><p>Đọc ví dụ, ghi nhớ cách dùng rồi thử nhận diện chúng trong đề TOPIK.</p></div>
        <div className="home-grammar-examples"><span><b>-고 싶다</b> Diễn tả mong muốn làm một việc</span><span><b>-(으)니까</b> Nêu lý do hoặc nguyên nhân</span><span><b>-(으)ㄹ 수 있다</b> Diễn tả khả năng làm một việc</span></div>
      </section>
      <section className="home-tip" id="kinh-nghiem"><Lightbulb size={28} /><p><strong>Mẹo luyện thi:</strong> Làm bài trong thời gian giới hạn, ghi lại câu sai và ôn lại từ vựng xuất hiện nhiều lần.</p><Link href="/pages/Select">Chọn đề luyện tập <ArrowRight size={18} /></Link></section>
      <footer className="home-footer"><span>© 2026 Tiếng Hàn Thu Huế</span><StudentHeaderAuth /></footer>

      {searchOpen && <div className="home-search-backdrop" onMouseDown={() => setSearchOpen(false)}>
        <div className="home-search-dialog" role="dialog" aria-modal="true" aria-label="Tìm nội dung học" onMouseDown={(event) => event.stopPropagation()}>
          <div className="home-search-input"><Search size={22} /><input autoFocus type="search" placeholder="Tìm bài luyện, từ vựng, lộ trình..." value={query} onChange={(event) => setQuery(event.target.value)} /><button type="button" aria-label="Đóng tìm kiếm" onClick={() => setSearchOpen(false)}><X size={21} /></button></div>
          <div className="home-search-results">{results.length ? results.map((item) => <Link key={item.label} href={item.href} onClick={() => setSearchOpen(false)}><span><strong>{item.label}</strong><small>{item.detail}</small></span><ArrowRight size={18} /></Link>) : <p>Không tìm thấy nội dung phù hợp.</p>}</div>
        </div>
      </div>}
    </main>
  );
}
