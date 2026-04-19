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
            ? "border-emerald-500 bg-emerald-100 font-semibold text-emerald-900"
            : "border-rose-500 bg-rose-100 font-semibold text-rose-900"
          : "border-blue-500 bg-blue-100 font-semibold text-blue-900"
        : "border-slate-200 bg-slate-100 text-slate-800"
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
