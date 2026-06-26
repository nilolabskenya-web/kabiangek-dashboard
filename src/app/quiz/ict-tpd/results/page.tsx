"use client";

import { useState, useEffect } from "react";

interface Submission {
  id: string;
  name: string;
  tscNo?: string;
  score: number;
  correct: number;
  total: number;
  moduleScores: Record<string, { correct: number; total: number }>;
  timestamp: string;
}

export default function QuizResultsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Submission | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quiz/results", { cache: "no-store" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      // Sort newest first
      const sorted = (data.submissions || []).sort(
        (a: Submission, b: Submission) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setSubmissions(sorted);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const avgScore =
    submissions.length > 0
      ? Math.round(submissions.reduce((s, sub) => s + sub.score, 0) / submissions.length)
      : 0;

  const gradeColor = (score: number) => {
    if (score >= 80) return "text-green-700 bg-green-50";
    if (score >= 60) return "text-blue-700 bg-blue-50";
    if (score >= 40) return "text-yellow-700 bg-yellow-50";
    return "text-red-700 bg-red-50";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">TPD ICT Quiz — Results</h1>
            <p className="text-sm text-gray-500">Admin dashboard</p>
          </div>
          <button
            onClick={fetchResults}
            className="text-sm text-green-600 hover:text-green-800 font-medium"
          >
            Refresh ↻
          </button>
        </div>

        {/* Stats cards */}
        {!loading && submissions.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-lg border p-4">
              <div className="text-2xl font-bold text-gray-900">{submissions.length}</div>
              <div className="text-xs text-gray-500">Total Submissions</div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-2xl font-bold text-gray-900">{avgScore}%</div>
              <div className="text-xs text-gray-500">Average Score</div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-2xl font-bold text-green-700">
                {submissions.filter((s) => s.score >= 80).length}
              </div>
              <div className="text-xs text-gray-500">Above 80%</div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-2xl font-bold text-red-600">
                {submissions.filter((s) => s.score < 40).length}
              </div>
              <div className="text-xs text-gray-500">Below 40%</div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-gray-400">
            <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-green-600 rounded-full mx-auto mb-2" />
            Loading results...
          </div>
        )}

        {/* No results */}
        {!loading && submissions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-gray-400">No submissions yet.</p>
            <p className="text-sm text-gray-300 mt-1">
              Share the quiz link with teachers to get started.
            </p>
          </div>
        )}

        {/* Submissions table */}
        {!loading && submissions.length > 0 && (
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b text-left">
                    <th className="px-4 py-3 font-medium text-gray-500">#</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Name</th>
                    <th className="px-4 py-3 font-medium text-gray-500">TSC No.</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Score</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Time</th>
                    <th className="px-4 py-3 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub, idx) => (
                    <tr key={sub.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{sub.name}</td>
                      <td className="px-4 py-3 text-gray-500">{sub.tscNo || "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${gradeColor(
                            sub.score
                          )}`}
                        >
                          {sub.score}% ({sub.correct}/{sub.total})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(sub.timestamp).toLocaleString("en-KE", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelected(selected?.id === sub.id ? null : sub)}
                          className="text-xs text-green-600 hover:text-green-800 font-medium"
                        >
                          {selected?.id === sub.id ? "Hide" : "Details"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detail panel */}
        {selected && (
          <div className="mt-4 bg-white rounded-lg border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                {selected.name} — {selected.score}%
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                ✕ Close
              </button>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wide text-gray-400 font-medium">
                Module Breakdown
              </h4>
              {Object.entries(selected.moduleScores).map(([mod, s]) => (
                <div key={mod} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-sm">
                  <span className="text-gray-600">{mod}</span>
                  <span className="font-semibold">
                    {s.correct}/{s.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export hint */}
        {submissions.length > 0 && (
          <p className="text-xs text-gray-300 text-center mt-6">
            Results stored securely in Vercel Blob •{" "}
            <a href="/" className="underline hover:text-gray-500">
              Back to Dashboard
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
