// ── GET /api/quiz/results — list all quiz submissions from Vercel Blob ──
// ── Uses list() to enumerate per-submission blobs → no single file bottleneck ──

import { NextRequest, NextResponse } from "next/server";
import { list } from "@vercel/blob";

const QUIZ_PREFIX = "data/quiz-submissions";
const BLOB_STORE_URL = "https://lwl0vea488ilvyqs.public.blob.vercel-storage.com";

export async function GET(_request: NextRequest) {
  try {
    // List all submission blobs
    const { blobs } = await list({ prefix: QUIZ_PREFIX, limit: 200 });

    if (blobs.length === 0) {
      return NextResponse.json({ submissions: [], count: 0 });
    }

    // Fetch each submission blob in parallel
    const results = await Promise.all(
      blobs.map(async (b) => {
        try {
          const url = `${b.url}?t=${Date.now()}`;
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) return null;
          return await res.json();
        } catch {
          return null;
        }
      })
    );

    const submissions = results.filter(Boolean);
    return NextResponse.json({
      submissions,
      count: submissions.length,
    });
  } catch (e: any) {
    console.error("Quiz results error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
