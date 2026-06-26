// ── POST /api/quiz/submit — save a teacher's quiz submission to Vercel Blob ──
// ── Each submission is a separate blob → no race conditions with 40+ concurrent users ──

import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

const QUIZ_PREFIX = "data/quiz-submissions";

interface QuizSubmission {
  id: string;
  name: string;
  tscNo?: string;
  answers: Record<number, string>;
  score: number;
  correct: number;
  total: number;
  moduleScores: Record<string, { correct: number; total: number }>;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, tscNo, answers, score, correct, total, moduleScores } = body;

    if (!name || !answers || score === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name, answers, score" },
        { status: 400 }
      );
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const submission: QuizSubmission = {
      id,
      name: String(name).trim(),
      tscNo: tscNo ? String(tscNo).trim() : undefined,
      answers,
      score,
      correct,
      total,
      moduleScores,
      timestamp: new Date().toISOString(),
    };

    // Each submission gets its own blob — zero race conditions at any scale
    await put(`${QUIZ_PREFIX}/${id}.json`, JSON.stringify(submission), {
      access: "public",
      contentType: "application/json",
    });

    return NextResponse.json({ success: true, id });
  } catch (e: any) {
    console.error("Quiz submit error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
