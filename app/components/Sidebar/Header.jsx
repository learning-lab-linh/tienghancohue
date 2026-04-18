import React from "react";

const Header = ({ answeredQuestions, handleSubmit, score, timeLeft = 0 }) => {
  const progress = Math.min(answeredQuestions.length * 2, 100);
  const formatTime = (seconds) => {
    const safeSeconds = Math.max(Number(seconds) || 0, 0);
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <header className="fixed top-0 z-30 w-full border-b border-slate-200 bg-slate-100/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            한국어 능력시험
          </h1>
          <p className="text-sm font-medium text-slate-500 sm:text-base">
            Thời gian còn lại: {formatTime(timeLeft)}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {score !== undefined && (
            <div className="hidden rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 sm:block">
              Điểm: {score}
            </div>
          )}
          <div className="min-w-24 text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Tiến độ
            </p>
            <p className="text-base font-bold text-slate-700">{progress}%</p>
          </div>
          {score === undefined && (
            <button
              className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 lg:hidden"
              onClick={handleSubmit}
            >
              Nộp bài
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
