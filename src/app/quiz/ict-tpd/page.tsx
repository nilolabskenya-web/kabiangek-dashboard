"use client";

import { useState, useEffect, useCallback } from "react";
import { questions, QUIZ_TITLE, QUIZ_TIME_MINUTES } from "@/lib/quiz-questions";

interface Answers {
  [questionId: number]: string;
}

export default function QuizPage() {
  const [name, setName] = useState("");
  const [tscNo, setTscNo] = useState("");
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [moduleScores, setModuleScores] = useState<Record<string, { correct: number; total: number }>>({});
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME_MINUTES * 60);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Timer
  useEffect(() => {
    if (!started || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [started, timeLeft, submitted]);

  const handleStart = () => {
    if (!name.trim()) return;
    setStarted(true);
  };

  const handleSelect = (questionId: number, label: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: label }));
  };

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setError("");

    // Calculate score
    let correct = 0;
    const modScores: Record<string, { correct: number; total: number }> = {};

    for (const q of questions) {
      if (!modScores[q.module]) modScores[q.module] = { correct: 0, total: 0 };
      modScores[q.module].total++;
      if (answers[q.id] === q.answer) {
        correct++;
        modScores[q.module].correct++;
      }
    }

    const pct = Math.round((correct / questions.length) * 100);
    setScore(pct);
    setModuleScores(modScores);
    setSubmitted(true);

    // Save to API
    try {
      await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          tscNo: tscNo.trim() || undefined,
          answers,
          score: pct,
          correct,
          total: questions.length,
          moduleScores: modScores,
        }),
      });
    } catch (e) {
      console.error("Failed to save results:", e);
    }

    setSubmitting(false);
  }, [answers, name, tscNo]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  // Submitted screen
  if (submitted && score !== null) {
    const grade =
      score >= 80 ? "🏆 Bora kabisa!" :
      score >= 60 ? "👏 Vizuri!" :
      score >= 40 ? "📚 Endelea kujifunza" : "💪 Jaribu tena";

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">
              {score >= 80 ? "🎉" : score >= 60 ? "✅" : score >= 40 ? "📖" : "🔄"}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Assessment Complete</h1>
            <p className="text-gray-500 mt-1">{name}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-5 mb-5 text-center">
            <div className="text-4xl font-bold text-green-700">{score}%</div>
            <div className="text-sm text-gray-500 mt-1">
              {Object.values(answers).filter((a) => a).length} of {questions.length} answered
            </div>
            <div className="text-lg mt-2 font-medium text-gray-700">{grade}</div>
          </div>

          {/* Module breakdown */}
          <div className="space-y-2 mb-5">
            <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Module Breakdown</h3>
            {Object.entries(moduleScores).map(([mod, s]) => (
              <div key={mod} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-sm">
                <span className="text-gray-600 truncate flex-1 mr-2">{mod}</span>
                <span className="font-semibold text-gray-900">
                  {s.correct}/{s.total}
                </span>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400">
            Your results have been recorded. Asante!
          </p>
        </div>
      </div>
    );
  }

  // Start screen
  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">{QUIZ_TITLE}</h1>
          <p className="text-gray-500 text-sm mb-6">
            {questions.length} questions • {QUIZ_TIME_MINUTES} minutes • Covers all 4 training modules
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Muthoni"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TSC Number (optional)</label>
              <input
                type="text"
                value={tscNo}
                onChange={(e) => setTscNo(e.target.value)}
                placeholder="e.g. 123456"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
              />
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={!name.trim()}
            className="w-full mt-6 bg-green-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  // Quiz screen
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-gray-900 text-sm sm:text-base">{QUIZ_TITLE}</h1>
            <p className="text-xs text-gray-500">{name}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              {answeredCount}/{questions.length}
            </span>
            <span
              className={`font-mono font-bold text-sm px-3 py-1 rounded-full ${
                timeLeft < 300 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
              }`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        {questions.map((q, idx) => (
          <div
            key={q.id}
            id={`q${q.id}`}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5"
          >
            <div className="flex items-start gap-3">
              <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] uppercase tracking-wider text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">
                    {q.module}
                  </span>
                </div>
                <p className="text-gray-900 font-medium text-sm sm:text-base mb-3">{q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt) => {
                    const isSelected = answers[q.id] === opt.label;
                    return (
                      <button
                        key={opt.label}
                        onClick={() => handleSelect(q.id, opt.label)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                          isSelected
                            ? "border-green-500 bg-green-50 text-green-800 font-medium"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        <span className="font-bold mr-2 text-gray-400">{opt.label}.</span>
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Submit */}
        <div className="sticky bottom-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-500">
            {allAnswered
              ? "✅ All questions answered — ready to submit!"
              : `⚠️ ${questions.length - answeredCount} questions unanswered`}
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full sm:w-auto bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-green-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? "Submitting..." : "Submit Assessment"}
          </button>
        </div>
      </div>
    </div>
  );
}
