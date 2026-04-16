"use client";
import React from "react";
import "../styles/style.css";
export const AnswerComponent = ({
  option,
  optionIndex,
  questionNumber,
  handleAnswerChange,
  userAnswer,
  correctAnswer,
  showResults,
}) => {
  const isSelected = userAnswer === (optionIndex + 1).toString();
  const isCorrect = correctAnswer === (optionIndex + 1).toString();
  const labelClassNames = `block w-full rounded-lg border px-4 py-2 text-left text-sm transition sm:text-base
    ${
      isSelected
        ? showResults
          ? isCorrect
            ? "border-emerald-600 bg-emerald-100 font-semibold text-emerald-900 shadow-sm ring-2 ring-emerald-200"
            : "border-rose-600 bg-rose-100 font-semibold text-rose-900 shadow-sm ring-2 ring-rose-200"
          : "border-blue-600 bg-blue-100 font-semibold text-blue-900 shadow-sm ring-2 ring-blue-200"
        : "border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-100"
    }`;

  return (
    <label key={optionIndex} className={labelClassNames}>
      <input
        type="checkbox"
        name={`q${questionNumber}`}
        value={(optionIndex + 1).toString()}
        onChange={() => handleAnswerChange(questionNumber, (optionIndex + 1).toString())}
        checked={isSelected}
        className="hidden"
        disabled={showResults}
      />
      {`${optionIndex + 1}. ${option}`}
    </label>
  );
};
