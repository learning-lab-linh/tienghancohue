import Link from "next/link";
import Image from "next/image";
import StudentHeaderAuth from "./components/StudentHeaderAuth";
import { IoAccessibilityOutline } from "react-icons/io5";
import { CgPlayListCheck } from "react-icons/cg";
import { GoBook } from "react-icons/go";
import { FaEarListen } from "react-icons/fa6";
import "./styles/style.css";
import { CiPenpot } from "react-icons/ci";

export default function Home() {
  const featureCards = [
    {
      icon: IoAccessibilityOutline,
      title: "Làm bài thi Topik",
      description:
        "Các bài thi Topik đã được công bố giúp bạn ôn luyện, đánh giá khả năng qua từng kỹ năng, theo dõi tiến bộ và cải thiện hiệu quả.",
    },
    {
      icon: CiPenpot,
      title: "Kinh nghiệm làm bài thi",
      description:
        "Những chia sẻ thực tế từ các bạn đạt Topik 5+, giúp bạn có chiến lược làm bài rõ ràng, tiết kiệm thời gian và tăng điểm số.",
    },
    {
      icon: CgPlayListCheck,
      title: "Ôn luyện, củng cố ngữ pháp",
      description:
        "Nội dung ngữ pháp được trình bày trực quan, có ví dụ và bài tập theo từng chủ điểm để bạn ghi nhớ nhanh và áp dụng tốt hơn.",
    },
    {
      icon: GoBook,
      title: "Ôn luyện, củng cố từ vựng",
      description:
        "Kho từ vựng phong phú theo cấp độ Topik và chủ đề thực tế, giúp bạn cải thiện cả khả năng đọc hiểu lẫn phản xạ ngôn ngữ.",
    },
    {
      icon: FaEarListen,
      title: "Ôn luyện kỹ năng Nghe, Đọc",
      description:
        "Luyện tập theo từng dạng câu hỏi trong đề thi Topik để tập trung vào phần còn yếu và nâng hiệu suất học tập mỗi ngày.",
    },
    {
      icon: CgPlayListCheck,
      title: "Và nhiều chức năng khác",
      description:
        "Hệ thống tiếp tục được cập nhật. Nếu bạn muốn thêm tính năng mới, hãy gửi góp ý qua email: tienghanthuhue@gmail.com.",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-white text-gray-800">
      <header className="sticky top-0 z-20 border-b border-rose-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image
              className="h-10 w-10 rounded-xl object-cover shadow-sm"
              src="/logo.jpg"
              alt="logo"
              width={40}
              height={40}
            />
            <h2 className="hiddenC text-sm font-bold tracking-wide text-[#b61e3b] lg:block">
              Tiếng Hàn Thu Huế
            </h2>
          </div>

          <nav className="flex items-center gap-2 md:gap-4">
            <Link href="/pages/Listen">
              <span className="rounded-full px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-[#b61e3b] hover:text-white md:text-base">
                Kiểm tra nghe
              </span>
            </Link>
            <Link href="/pages/Reading">
              <span className="rounded-full px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-[#b61e3b] hover:text-white md:text-base">
                Kiểm tra đọc
              </span>
            </Link>
          </nav>

          <div className="flex items-center gap-2 lg:gap-3">
            <StudentHeaderAuth />
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-14 sm:px-6 md:grid-cols-2 lg:px-8">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-medium text-[#b61e3b]">
            Luyện thi Topik thông minh
          </p>
          <h1 className="text-3xl font-bold leading-tight text-[#b61e3b] md:text-5xl">
            Ôn thi chứng chỉ Topik hiệu quả
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600 md:text-lg">
            Bạn sẽ nhanh chóng cải thiện kỹ năng làm bài thi của mình chỉ trong
            3 tuần với lộ trình rõ ràng và bài luyện sát đề thật.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/pages/Select">
              <button className="rounded-full bg-[#e5441a] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#cf3c15]">
                Bắt đầu ngay
              </button>
            </Link>
            <Link href="/pages/Listen">
              <button className="rounded-full border border-rose-300 px-6 py-3 text-sm font-semibold text-[#b61e3b] transition hover:bg-rose-50">
                Làm thử bài nghe
              </button>
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-4 -top-4 h-20 w-20 rounded-full bg-rose-200/60 blur-xl" />
          <div className="absolute -bottom-6 -right-4 h-28 w-28 rounded-full bg-orange-200/60 blur-xl" />
          <Image
            src="/landing-1.jpg"
            alt="Luyện thi Topik"
            className="relative w-full rounded-3xl border border-rose-100 object-cover shadow-xl"
            width={640}
            height={420}
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-lg font-semibold text-[#b61e3b]">
            Hệ thống được phát triển với
          </h2>
          <p className="mt-2 text-3xl font-bold text-gray-800 md:text-4xl">
            Các chức năng chính sau
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="group rounded-2xl border border-rose-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex rounded-xl bg-rose-50 p-3 text-[#b61e3b]">
                  <Icon className="text-2xl" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="mt-10 bg-[#b61e3b] text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-10 text-center sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-6">
            <a href="#!" className="transition hover:text-rose-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </a>
            <a href="#!" className="transition hover:text-rose-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </a>
            <a href="#!" className="transition hover:text-rose-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162z" />
              </svg>
            </a>
          </div>

          <p className="text-sm text-rose-100">
            © 2026 Bản quyền thuộc về
            <a
              className="ml-2 font-semibold text-white underline-offset-2 hover:underline"
              href="https://www.facebook.com/linh.vokhanh.395"
            >
              LinhCoder
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}

