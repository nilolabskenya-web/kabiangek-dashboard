// ── GET /api/lessons?week=YYYY-MM-DD — get lessons for a week
// ── POST /api/lessons — save lesson metadata (topics, file paths)

import { NextRequest, NextResponse } from 'next/server';
import { getWeekLessons, saveWeekLessons } from '@/lib/blob';
import { formatDate, getMonday } from '@/lib/timetable';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekStr = searchParams.get('week');

    const weekStart = weekStr || formatDate(getMonday());
    const lessons = await getWeekLessons(weekStart);

    return NextResponse.json({ weekStart, lessons });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { weekStart, lessons } = body;

    if (!weekStart || !lessons) {
      return NextResponse.json(
        { error: 'Missing weekStart or lessons' },
        { status: 400 }
      );
    }

    await saveWeekLessons(weekStart, lessons);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
