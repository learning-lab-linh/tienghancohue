'use client'
import { useState, useEffect, useCallback } from "react";

const useQuiz = (testType = "reading") => {
  const TEST_DURATION_SECONDS = 60 * 60;
  const [expanded, setExpanded] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  const [answers, setAnswers] = useState({});
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [questionsSet, setQuestionsSet] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [showTracking, setShowTracking] = useState(true);
  const [score, setScore] = useState();
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
  const [isLoading, setIsLoading] = useState(false);
  const [audio, setAudio] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTimeLeft) => Math.max(prevTimeLeft - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (selectedSet == null || selectedSet === "") {
        setQuestionsSet([]);
        return;
      }

      const setNum = Number(selectedSet);
      const params = new URLSearchParams({
        testType,
        ...(Number.isInteger(setNum) && setNum > 0
          ? { setNumber: String(setNum) }
          : { setKey: String(selectedSet) }),
      });

      setIsLoading(true);
      try {
        const response = await fetch(`/api/questions?${params}`);
        const payload = await response.json();
        setQuestionsSet(payload.data || []);
        if (testType === "listen") {
          setAudio(payload.audio || "");
        }
      } catch (error) {
        console.error("Không thể tải câu hỏi:", error);
        setQuestionsSet([]);
        setAudio("");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedSet, testType]);

  useEffect(() => {
    setQuestions(questionsSet);
  }, [questionsSet]);

  const calculateScore = useCallback(() => {
    const scorePerQuestion = 2;
    return answeredQuestions.reduce((totalScore, questionNumber) => {
      const userAnswer = answers[questionNumber];
      const correctAnswer = questions.find(
        (q) => String(q.id) === String(questionNumber)
      )?.correctAnswer;
      const ok = userAnswer === correctAnswer;
      return totalScore + (ok ? scorePerQuestion : 0);
    }, 0);
  }, [answeredQuestions, answers, questions]);

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

  const handleSubmit = () => {
    setShowResults(true);
    setShowTracking(false);
    const scores = calculateScore();
    alert(scores);
    setScore(scores);
    setIsCorrect(
      answeredQuestions.filter((qn) => {
        const correct = questions.find(
          (q) => String(q.id) === String(qn)
        )?.correctAnswer;
        return answers[qn] !== correct;
      }).length === 0
    );
  };

  const handleJumpToQuestion = (questionNumber) => {
    const element = document.getElementById(`question${questionNumber}`);
    element.scrollIntoView({ behavior: "smooth" });
  };

  return {
    expanded,
    setExpanded,
    selectedSet,
    setSelectedSet,
    answers,
    setAnswers,
    answeredQuestions,
    setAnsweredQuestions,
    showResults,
    setShowResults,
    isCorrect,
    setIsCorrect,
    elapsedTime,
    setElapsedTime,
    questionsSet,
    setQuestionsSet,
    questions,
    setQuestions,
    showTracking,
    setShowTracking,
    score,
    setScore,
    timeLeft,
    setTimeLeft,
    isLoading,
    audio,
    handleAnswerChange,
    handleSubmit,
    handleJumpToQuestion,
    calculateScore,
  };
};

export default useQuiz;
