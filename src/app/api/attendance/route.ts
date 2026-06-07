// ── GET /api/attendance?week=YYYY-MM-DD — get attendance for a week
// ── POST /api/attendance — mark attendance

import { NextRequest, NextResponse } from 'next/server';
import { getAttendanceData, markAttendance } from '@/lib/blob';

export async function GET(request: NextRequest) {
  try {
    const data = await getAttendanceData();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lessonId, attended } = body;

    if (!lessonId || typeof attended !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing lessonId or attended (boolean)' },
        { status: 400 }
      );
    }

    const data = await markAttendance(lessonId, attended);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
