'use client'
import React, { useState, useEffect } from "react";
import SetSelection from "../../components/SetSelection";
import { AnswerComponent } from "../../components/AnswerComponent";
import QuestionContent from "../../components/QuestionContent";
import TestingLayout from "../../layouts/TestingLayout";
import '../../styles/style.css';
import AudioPlayer from "@/app/components/AudioComponent";

function runSubmitConfetti() {
  import("canvas-confetti")
    .then(({ default: confetti }) => {
      confetti({
        particleCount: 120,
        spread: 75,
        startVelocity: 40,
        origin: { y: 0.65 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 95,
          startVelocity: 32,
          origin: { y: 0.7 },
        });
      }, 180);
    })
    .catch((error) => {
      console.warn("Không chạy được hiệu ứng confetti:", error);
    });
}

const ListenTest = () => {
  const TEST_DURATION_SECONDS = 60 * 60;
  const [selectedSet, setSelectedSet] = useState(null);
  const [availableSets, setAvailableSets] = useState([]);
  const [answers, setAnswers] = useState({});
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [questionsSet, setQuestionsSet] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [showTracking, setShowTracking] = useState(true);
  const [score, setScore] = useState();
  const [showScoreOverlay, setShowScoreOverlay] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
  const [audio, setAudio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [audioWarning, setAudioWarning] = useState("");
  const selectedSetNumber =
    availableSets.findIndex((item) => item.setKey === selectedSet) + 1;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTimeLeft) => Math.max(prevTimeLeft - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response = await fetch("/api/sets?testType=listen");
        const payload = await response.json();
        setAvailableSets(payload.data || []);
      } catch (error) {
        console.error("Không thể tải danh sách bộ đề nghe:", error);
        setAvailableSets([]);
      }
    };
    fetchSets();
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedSet) return;
      setIsLoading(true);
      setLoadError("");
      setAudioWarning("");
      try {
        const response = await fetch(
          `/api/questions?testType=listen&setKey=${selectedSet}`
        );
        if (!response.ok) {
          throw new Error("Không tải được dữ liệu đề thi.");
        }
        const payload = await response.json();
        setQuestionsSet(payload.data || []);
        setAudio(payload.audio || "");
        if (!payload.audio) {
          const warningText =
            "Đề này hiện chưa có audio hoặc audio đang tạm thời không khả dụng.";
          setAudioWarning(warningText);
          console.warn("[Listen] Missing audio for set:", selectedSet, payload);
        }
      } catch (error) {
        console.error("Không thể tải bộ đề nghe:", error);
        setQuestionsSet([]);
        setAudio("");
        setLoadError("Không tải được đề thi. Vui lòng kiểm tra mạng rồi thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedSet]);

  useEffect(() => {
    setQuestions(questionsSet);
  }, [questionsSet]);

  const calculateScore = () => {
    const scorePerQuestion = 2;
    return answeredQuestions.reduce((totalScore, questionNumber) => {
      const userAnswer = answers[questionNumber];
      const correctAnswer = questions.find(
        (q) => q.id === questionNumber
      )?.correctAnswer;
      const isCorrect = userAnswer === correctAnswer;

      return totalScore + (isCorrect ? scorePerQuestion : 0);
    }, 0);
  };

  const handleAnswerChange = (questionNumber, selectedAnswer) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionNumber]: selectedAnswer,
    }));

    if (!answeredQuestions.includes(questionNumber)) {
      setAnsweredQuestions((prevQuestions) => [
        ...prevQuestions,
        questionNumber,
      ]);
    }
  };

  const handleSubmit = async () => {
    setShowResults(true);
    setShowTracking(false);

    const scores = calculateScore();

    setScore(scores);
    setShowScoreOverlay(true);
    try {
      await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testType: "listen",
          setNumber: selectedSetNumber > 0 ? selectedSetNumber : 0,
          setKey: selectedSet,
          score: scores,
          totalQuestions: questions.length,
          answers,
        }),
      });
    } catch (error) {
      console.error("Không thể lưu kết quả bài nghe:", error);
    }

    runSubmitConfetti();
  };

  const handleJumpToQuestion = (questionNumber) => {
    const element = document.getElementById(`question${questionNumber}`);
    element.scrollIntoView({ behavior: "smooth" });
  };

  if (!selectedSet) {
    return <SetSelection onSelectSet={setSelectedSet} sets={availableSets} />;
  }

  return (
    <TestingLayout
      scoreTrackingProps={{
        showTracking,
        timeLeft,
        questionsSet,
        answers,
        handleJumpToQuestion,
        handleSubmit,
        score,
        showResults,
        questions
      }}
      answeredQuestions={answeredQuestions}
      selectedSet={selectedSet}
    >
      {showScoreOverlay ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/10 px-4"
          onClick={() => setShowScoreOverlay(false)}
        >
          <div
            className="rounded-2xl border border-emerald-200 bg-white/95 px-8 py-6 text-center shadow-2xl backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-medium text-slate-500">Kết quả của bạn</p>
            <p className="mt-1 text-3xl font-bold text-emerald-600">{score} điểm</p>
          </div>
        </div>
      ) : null}
      {audio && (
       <AudioPlayer audio={audio} />
      )}
      {isLoading && <p className="text-sm text-slate-600">Đang tải đề thi...</p>}
      {loadError && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {loadError}
        </p>
      )}
      {audioWarning && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {audioWarning}
        </p>
      )}
      <div className="w-full space-y-4">
        {questionsSet.map((question) => {
          const questionNumber = question.id;
          const userAnswer = answers[questionNumber];
          const isIncorrect =
            userAnswer && userAnswer !== question.correctAnswer;

          return (
            <div
              key={questionNumber}
              id={`question${questionNumber}`}
              className="scroll-mt-28 mb-10 last:mb-0"
            >
              <QuestionContent question={question} questionNumber={questionNumber} />

              <div className="my-1 grid grid-cols-4 gap-px sm:grid-cols-2">
                {question.options.map((option, index) => (
                  <AnswerComponent
                    key={index}
                    option={option}
                    optionIndex={index}
                    questionNumber={questionNumber}
                    handleAnswerChange={(qn, selectedAnswer) =>
                      handleAnswerChange(qn, selectedAnswer)
                    }
                    userAnswer={userAnswer}
                    correctAnswer={question.correctAnswer}
                    showResults={showResults}
                  />
                ))}
              </div>

              {showResults && isIncorrect && (
                <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 p-3">
                  <div className="text-sm text-slate-700">
                    Đáp án đúng:{" "}
                    <span className="ml-1 text-base font-bold text-blue-600">
                        {question.correctAnswer}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">Hướng dẫn giải: {question.solution}</p>
                  </div>
              )}
            </div>
          );
        })}
      </div>
    </TestingLayout>
  );
};

export default function ListenPage() {
  return <ListenTest />;
}
