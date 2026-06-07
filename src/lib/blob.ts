// ── Vercel Blob helpers for attendance + file storage ──

import { put, list, del, head } from '@vercel/blob';

const ATTENDANCE_KEY = 'data/attendance.json';
const LESSONS_PREFIX = 'data/lessons/'; // data/lessons/2026-06-08.json

import type { AttendanceData, Lesson, StatusResponse, Subject } from './types';
import { generateWeekLessons, formatDate, getMonday } from './timetable';

// ── Attendance ──

/** Read the full attendance record from Blob storage */
export async function getAttendanceData(): Promise<AttendanceData> {
  try {
    const { blobs } = await list({ prefix: ATTENDANCE_KEY });
    if (blobs.length === 0) {
      return { records: {}, lastUpdated: '' };
    }
    const blob = blobs[0];
    const res = await fetch(blob.url);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('getAttendanceData error:', e);
    return { records: {}, lastUpdated: '' };
  }
}

/** Save attendance data to Blob storage */
export async function saveAttendanceData(data: AttendanceData): Promise<void> {
  data.lastUpdated = new Date().toISOString();
  await put(ATTENDANCE_KEY, JSON.stringify(data, null, 2), {
    access: 'public',
    contentType: 'application/json',
  });
}

/** Mark a specific lesson as attended or missed */
export async function markAttendance(
  lessonId: string,
  attended: boolean
): Promise<AttendanceData> {
  const data = await getAttendanceData();
  data.records[lessonId] = {
    lessonId,
    attended,
    markedAt: new Date().toISOString(),
  };
  await saveAttendanceData(data);
  return data;
}

// ── Lessons ──

/** Get lessons for a specific week, merged with attendance + topic data */
export async function getWeekLessons(weekStartStr?: string): Promise<Lesson[]> {
  const monday = weekStartStr ? new Date(weekStartStr) : getMonday();
  const lessons = generateWeekLessons(monday);
  const weekKey = formatDate(monday);

  // Load saved lesson metadata (topics, file paths)
  let savedLessons: Record<string, Partial<Lesson>> = {};
  try {
    const { blobs } = await list({ prefix: `${LESSONS_PREFIX}${weekKey}` });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url);
      if (res.ok) savedLessons = await res.json();
    }
  } catch (e) {
    console.error('getWeekLessons metadata error:', e);
  }

  // Load attendance data
  const attendance = await getAttendanceData();

  // Merge
  return lessons.map((lesson) => {
    const saved = savedLessons[lesson.id] || {};
    const att = attendance.records[lesson.id];
    return {
      ...lesson,
      topic: saved.topic || lesson.topic,
      notesPath: saved.notesPath || lesson.notesPath,
      slidesPath: saved.slidesPath || lesson.slidesPath,
      attended: att?.attended ?? null,
      markedAt: att?.markedAt ?? null,
    };
  });
}

/** Save lesson metadata (topics, file paths) for a week */
export async function saveWeekLessons(
  weekStart: string,
  lessonsData: Record<string, Partial<Lesson>>
): Promise<void> {
  await put(`${LESSONS_PREFIX}${weekStart}.json`, JSON.stringify(lessonsData, null, 2), {
    access: 'public',
    contentType: 'application/json',
  });
}

// ── Status (for cron pipeline) ──

/**
 * Get generation status for the cron pipeline.
 * Returns which subjects should have next lessons generated.
 * A subject should be generated if its most recent past lesson was attended
 * (or if there's no prior lesson record — i.e., first week).
 */
export async function getGenerationStatus(weekStartStr: string): Promise<StatusResponse> {
  const targetMonday = new Date(weekStartStr);
  const prevMonday = new Date(targetMonday);
  prevMonday.setDate(prevMonday.getDate() - 7);

  // Get last week's lessons + this week's template
  const lastWeekLessons = await getWeekLessons(formatDate(prevMonday));
  const thisWeekLessons = generateWeekLessons(targetMonday);

  // Group last week's lessons by subject
  const lastBySubject: Record<string, Lesson> = {};
  for (const l of lastWeekLessons) {
    // Keep the latest lesson per subject (some subjects have multiple per week)
    if (!lastBySubject[l.subject] || l.date > lastBySubject[l.subject].date) {
      lastBySubject[l.subject] = l;
    }
  }

  // Get unique subjects for the target week
  const subjects = [...new Set(thisWeekLessons.map((l) => l.subject))] as Subject[];

  return {
    weekStart: weekStartStr,
    subjects: subjects.map((subject) => {
      const last = lastBySubject[subject];
      return {
        subject,
        lastLessonId: last?.id || '',
        lastLessonDate: last?.date || '',
        attended: last?.attended ?? null,
        shouldGenerate: last ? last.attended !== false : true, // generate if no prior lesson or attended
      };
    }),
  };
}

// ── File upload ──

/** Upload a file to Blob storage and return the URL */
export async function uploadFile(
  filename: string,
  content: Buffer | Blob,
  contentType: string
): Promise<string> {
  const { url } = await put(`files/${filename}`, content, {
    access: 'public',
    contentType,
  });
  return url;
}
