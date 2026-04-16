'use client'
import React, { useState, useEffect } from "react";
import { Card } from "@mui/material";
import SetSelection from "../../components/SetSelection";
import { AnswerComponent } from "../../components/AnswerComponent";
import QuestionContent from "../../components/QuestionContent";
import TestingLayout from "../../layouts/TestingLayout";
import '../../styles/style.css';
import 'react-notifications/lib/notifications.css';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import AudioPlayer from "@/app/components/AudioComponent";
const ListenTest = () => {
  const [selectedSet, setSelectedSet] = useState(null);
  const [availableSets, setAvailableSets] = useState([]);
  const [answers, setAnswers] = useState({});
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [questionsSet, setQuestionsSet] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [showTracking, setShowTracking] = useState(true);
  const [score, setScore] = useState();
  const [timeLeft, setTimeLeft] = useState(3600);
  const [audio, setAudio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const selectedSetNumber =
    availableSets.findIndex((item) => item.setKey === selectedSet) + 1;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
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
      try {
        const response = await fetch(
          `/api/questions?testType=listen&setKey=${selectedSet}`
        );
        const payload = await response.json();
        setQuestionsSet(payload.data || []);
        setAudio(payload.audio || "");
      } catch (error) {
        console.error("Không thể tải bộ đề nghe:", error);
        setQuestionsSet([]);
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

    NotificationManager.success(`Số điểm của bạn là ${scores}`, "Kết quả");
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
      <NotificationContainer />
      {audio && (
       <AudioPlayer audio={audio} />
      )}
      {isLoading && <p className="text-sm text-slate-600">Đang tải đề thi...</p>}
      <div className="w-full space-y-4">
        {questionsSet.map((question) => {
          const questionNumber = question.id;
          const userAnswer = answers[questionNumber];
          const isIncorrect =
            userAnswer && userAnswer !== question.correctAnswer;

          return (
            <Card
              key={questionNumber}
              id={`question${questionNumber}`}
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
            > 
              <QuestionContent question={question} questionNumber={questionNumber} />

              <div className="my-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
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
            </Card>
          );
        })}
      </div>
    </TestingLayout>
  );
};

export default ListenTest;
