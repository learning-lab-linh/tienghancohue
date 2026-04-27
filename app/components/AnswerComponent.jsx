"use client";
import React from "react";
import "../styles/style.css";

const CHOICE_SYMBOLS = ["①", "②", "③", "④"];

export const AnswerComponent = ({
  option,
  optionIndex,
  questionNumber,
  handleAnswerChange,
  userAnswer,
  correctAnswer,
  showResults,
}) => {
  const choiceValue = (optionIndex + 1).toString();
  const isSelected = userAnswer === choiceValue;
  const isCorrect = correctAnswer === choiceValue;
  const choiceSymbol = CHOICE_SYMBOLS[optionIndex] || choiceValue;

  const baseClass =
    "w-full rounded-xl border px-2 py-1.5 text-center text-xs font-semibold transition sm:px-2.5 sm:py-2";

  const selectedClass = showResults
    ? isCorrect
      ? "border-emerald-500 bg-emerald-500 text-white shadow-md"
      : "border-rose-500 bg-rose-500 text-white shadow-md"
    : "border-emerald-500 bg-emerald-500 text-white shadow-md";

  const correctHintClass =
    showResults && !isSelected && isCorrect
      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
      : "border-gray-300 bg-slate-100 text-slate-700 hover:bg-slate-200";

  const buttonClassNames = `${baseClass} ${isSelected ? selectedClass : correctHintClass}`;

  return (
    <button
      key={optionIndex}
      type="button"
      onClick={() => handleAnswerChange(questionNumber, choiceValue)}
      className={buttonClassNames}
      disabled={showResults}
      aria-pressed={isSelected}
      aria-label={`Chọn đáp án ${choiceValue}${option ? `: ${option}` : ""}`}
    >
      <span className="text-[11px] leading-none sm:text-sm">{choiceSymbol}</span>
    </button>
  );
};
