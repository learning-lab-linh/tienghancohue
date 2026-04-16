// components/QuestionContent.js
import React from "react";

const QuestionContent = ({ question, questionNumber }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <h1 className="mb-3 text-base font-semibold text-slate-700 sm:text-lg">
        {question.type}
      </h1>
      <div className="flex justify-center">
          <img
            src={question.content}
            alt={`Câu hỏi ${questionNumber}`}
            className="w-full max-w-4xl rounded-lg border border-slate-200 bg-white p-2"
          />
      </div>
    </div>
  );
};

export default QuestionContent;
