// components/QuestionContent.js
"use client";
import React, { useState } from "react";

const QuestionContent = ({ question, questionNumber }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <div>
        <h1 className="mb-3 text-base font-semibold text-slate-700 sm:text-lg">
          {question.type}
        </h1>
        <div className="flex justify-center">
          <img
            src={question.content}
            alt={`Câu hỏi ${questionNumber}`}
            className="h-auto max-w-full cursor-zoom-in rounded-lg border border-slate-200 bg-white p-1"
            onClick={() => setIsZoomed(true)}
          />
        </div>
      </div>

      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/75 p-3"
          onClick={() => setIsZoomed(false)}
        >
          <img
            src={question.content}
            alt={`Phóng to câu hỏi ${questionNumber}`}
            className="h-auto max-h-[92vh] w-auto max-w-[96vw] rounded-lg border border-slate-300 bg-white"
          />
        </div>
      )}
    </>
  );
};

export default QuestionContent;
