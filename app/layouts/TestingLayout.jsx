import React from "react";
import ScoreTracking from "../components/ScoreTracking";
import Header from "../components/Sidebar/Header";
import "../styles/style.css";

const TestingLayout = ({
  children,
  scoreTrackingProps,
  selectedSet,
  answeredQuestions,
}) => {
  return (
    <div className="min-h-screen bg-slate-100">
      <Header
        selectedSet={selectedSet}
        answeredQuestions={answeredQuestions}
        {...scoreTrackingProps}
      />

      <div className="mx-auto flex max-w-[1400px] gap-4 px-2 pb-6 pt-24 sm:px-4 lg:px-6">
        <aside className="hidden w-[290px] shrink-0 lg:block">
          <div className="sticky top-28">
            <ScoreTracking {...scoreTrackingProps} />
          </div>
        </aside>

        <div className="min-h-[calc(100vh-7rem)] flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default TestingLayout;

