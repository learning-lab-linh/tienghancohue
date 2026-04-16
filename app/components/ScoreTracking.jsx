import React from "react";

const ScoreTracking = ({
  showTracking,
  timeLeft,
  questionsSet,
  answers,
  handleJumpToQuestion,
  handleSubmit,
  score ,
  showResults,
  answeredQuestions,
  questions,
}) => {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {showTracking && (
        <div>
          <div className="mb-4 border-b border-slate-100 pb-3">
            <h5 className="text-base font-semibold text-slate-800">
              Bảng theo dõi
            </h5>
            <span className="text-sm text-slate-500">
              Thời gian còn lại: {formatTime(timeLeft)}
            </span>
          </div>
          <ul className="grid grid-cols-4 gap-2">
            {questionsSet.map((question, index) => (
              <li key={question.id}>
                <button
                  className={`w-full rounded-md border px-2 py-1 text-sm transition ${
                    answers[question.id]
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                  }`}
                  onClick={() => handleJumpToQuestion(question.id)}
                >
                  {question.id}
                </button>
              </li>
            ))}
          </ul>

          <button
            className="mt-5 w-full rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            onClick={handleSubmit}
          >
            Kiểm tra đáp án
          </button>
        </div>
      )}

     {showResults && (
        <div className="pb-2">
          <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-3 text-center">
            <h1 className="text-base text-slate-600">
              Chúc mừng bạn đạt{" "}
              <span className="text-xl font-bold text-emerald-600">{score}</span>{" "}
              điểm
            </h1>
          </div>
          <h5 className="text-sm font-semibold text-slate-700">Kết quả chi tiết</h5>
          <p className="text-xs text-slate-500">Xanh: đúng, Đỏ: sai</p>
          <ul className="mt-3 grid grid-cols-4 gap-2">
              {answeredQuestions && answeredQuestions.map((questionNumber) => (
                <li key={questionNumber}>
                  <button
                    className={`w-full rounded-md px-2 py-1 text-sm text-white ${
                      answers[questionNumber] ===
                      questions.find((q) => q.id === questionNumber)?.correctAnswer
                        ? "bg-emerald-500"
                        : "bg-rose-500"
                    }`}
                    onClick={() => handleJumpToQuestion(questionNumber)}
                  >
                    {questionNumber}
                  </button>
                </li>
              ))}
            </ul>
        </div>
      )}
    </div>
  );
};

export default ScoreTracking;
