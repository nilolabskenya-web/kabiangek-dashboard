// ── Vercel Blob helpers — simplified: single lessons.json, no attendance ──

import { put, list, del } from '@vercel/blob';
import type { Lesson, LessonMeta, LessonsDb, Subject } from './types';
import { generateWeekLessons, formatDate, getMonday } from './timetable';

const LESSONS_DB_KEY = 'data/lessons.json';

// ── Lessons DB (single blob: lessonId → { topic, notesPath?, slidesPath? }) ──

/** Fetch the entire lessons database from Blob */
export async function getLessonsDb(): Promise<LessonsDb> {
  try {
    const { blobs } = await list({ prefix: LESSONS_DB_KEY });
    if (blobs.length === 0) return {};
    // Sort by uploadedAt descending — newest first (each put() creates a new blob)
    const sorted = blobs.sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    const res = await fetch(sorted[0].url);
    if (!res.ok) return {};
    return await res.json();
  } catch (e) {
    console.error('getLessonsDb error:', e);
    return {};
  }
}

/** Save the lessons database to Blob */
export async function saveLessonsDb(db: LessonsDb): Promise<void> {
  // Clean up old blobs to prevent stale reads
  try {
    const { blobs } = await list({ prefix: LESSONS_DB_KEY });
    for (const blob of blobs) {
      await del(blob.url);
    }
  } catch (e) {
    console.error('saveLessonsDb cleanup error:', e);
  }
  await put(LESSONS_DB_KEY, JSON.stringify(db, null, 2), {
    access: 'public',
    contentType: 'application/json',
    allowOverwrite: true,
  });
}

/** Get lessons for a specific week, merged with saved metadata */
export async function getWeekLessons(weekStartStr?: string): Promise<Lesson[]> {
  const monday = weekStartStr ? new Date(weekStartStr) : getMonday();
  const lessons = generateWeekLessons(monday);

  // Fetch the lessons DB once (cached by Vercel Blob CDN)
  const db = await getLessonsDb();

  return lessons.map((lesson) => {
    const meta = db[lesson.id];
    if (!meta) return lesson;
    return {
      ...lesson,
      topic: meta.topic || '',
      notesPath: meta.notesPath || null,
      slidesPath: meta.slidesPath || null,
    };
  });
}

/** Update lesson metadata (merges into existing DB) */
export async function saveWeekLessons(
  _weekStart: string,
  lessonsData: Record<string, Partial<LessonMeta>>
): Promise<void> {
  const db = await getLessonsDb();
  for (const [id, meta] of Object.entries(lessonsData)) {
    db[id] = {
      topic: meta.topic || db[id]?.topic || '',
      notesPath: meta.notesPath || db[id]?.notesPath,
      slidesPath: meta.slidesPath || db[id]?.slidesPath,
    };
  }
  await saveLessonsDb(db);
}

// ── Status (for cron pipeline) ──

export interface StatusResponse {
  weekStart: string;
  subjects: {
    subject: Subject;
    lastLessonId: string;
    lastLessonDate: string;
    hasMaterials: boolean;
    shouldGenerate: boolean;
  }[];
}

/** Check which subjects need generation for the target week */
export async function getGenerationStatus(weekStartStr: string): Promise<StatusResponse> {
  const targetMonday = new Date(weekStartStr);
  const prevMonday = new Date(targetMonday);
  prevMonday.setDate(prevMonday.getDate() - 7);

  const lastWeekLessons = await getWeekLessons(formatDate(prevMonday));
  const thisWeekLessons = generateWeekLessons(targetMonday);

  const lastBySubject: Record<string, Lesson> = {};
  for (const l of lastWeekLessons) {
    if (!lastBySubject[l.subject] || l.date > lastBySubject[l.subject].date) {
      lastBySubject[l.subject] = l;
    }
  }

  const subjects = [...new Set(thisWeekLessons.map((l) => l.subject))] as Subject[];

  return {
    weekStart: weekStartStr,
    subjects: subjects.map((subject) => {
      const last = lastBySubject[subject];
      const hasMaterials = last ? !!(last.notesPath || last.slidesPath) : false;
      return {
        subject,
        lastLessonId: last?.id || '',
        lastLessonDate: last?.date || '',
        hasMaterials,
        shouldGenerate: last ? hasMaterials : true,
      };
    }),
  };
}

// ── File upload ──

export async function uploadFile(
  filename: string,
  content: Buffer | Blob,
  contentType: string
): Promise<string> {
  const { url } = await put(`files/${filename}`, content, {
    access: 'public',
    contentType,
    allowOverwrite: true,
  });
  return url;
}
