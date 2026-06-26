// ── GET /api/quiz/results — fetch all quiz submissions (admin) ──

import { NextRequest, NextResponse } from "next/server";

const BLOB_STORE_URL = "https://lwl0vea488ilvyqs.public.blob.vercel-storage.com";
const QUIZ_DB_KEY = "data/quiz-submissions.json";

export async function GET(_request: NextRequest) {
  try {
    const url = `${BLOB_STORE_URL}/${QUIZ_DB_KEY}?t=${Date.now()}`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      return NextResponse.json({ submissions: [], count: 0 });
    }

    const submissions = await res.json();
    return NextResponse.json({
      submissions,
      count: submissions.length,
    });
  } catch (e: any) {
    console.error("Quiz results error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
