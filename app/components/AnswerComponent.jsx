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
            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
            : "border-rose-300 bg-rose-50 text-rose-700"
          : "border-slate-400 bg-slate-100 text-slate-800"
        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
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
