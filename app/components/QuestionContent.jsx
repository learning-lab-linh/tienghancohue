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
        <div className="w-full">
          <img
            src={question.content}
            alt={`Câu hỏi ${questionNumber}`}
            className="h-auto w-full cursor-zoom-in rounded-lg"
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
            className="h-auto max-h-[92vh] w-auto max-w-[96vw] rounded-lg   bg-slate-100"
          />
        </div>
      )}
    </>
  );
};

export default QuestionContent;
