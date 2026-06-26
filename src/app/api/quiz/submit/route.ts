// ── POST /api/quiz/submit — save a teacher's quiz submission to Vercel Blob ──

import { NextRequest, NextResponse } from "next/server";
import { put, list } from "@vercel/blob";

const QUIZ_DB_KEY = "data/quiz-submissions.json";
const BLOB_STORE_URL = "https://lwl0vea488ilvyqs.public.blob.vercel-storage.com";

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

    const submission: QuizSubmission = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: String(name).trim(),
      tscNo: tscNo ? String(tscNo).trim() : undefined,
      answers,
      score,
      correct,
      total,
      moduleScores,
      timestamp: new Date().toISOString(),
    };

    // Fetch existing submissions
    let submissions: QuizSubmission[] = [];
    try {
      const url = `${BLOB_STORE_URL}/${QUIZ_DB_KEY}?t=${Date.now()}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) submissions = await res.json();
    } catch {
      // First submission — start fresh
    }

    // Add new submission
    submissions.push(submission);

    // Save back to Blob
    await put(QUIZ_DB_KEY, JSON.stringify(submissions, null, 2), {
      access: "public",
      contentType: "application/json",
      allowOverwrite: true,
    });

    return NextResponse.json({ success: true, id: submission.id });
  } catch (e: any) {
    console.error("Quiz submit error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
