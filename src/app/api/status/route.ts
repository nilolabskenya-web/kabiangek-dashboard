// ── GET /api/status?week=YYYY-MM-DD — cron pipeline checks which subjects to generate
// Returns: { subjects: [{ subject, attended, shouldGenerate }] }

import { NextRequest, NextResponse } from 'next/server';
import { getGenerationStatus } from '@/lib/blob';
import { formatDate, getMonday } from '@/lib/timetable';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekStr = searchParams.get('week');

    // Default to next week (what the Friday generator needs)
    const now = new Date();
    const nextMonday = getMonday(now);
    nextMonday.setDate(nextMonday.getDate() + 7);
    const targetWeek = weekStr || formatDate(nextMonday);

    const status = await getGenerationStatus(targetWeek);
    return NextResponse.json(status);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
