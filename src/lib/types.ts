// ── Core Types for Kabiangek Teaching Dashboard ──

export type Subject = 'G7 Agriculture' | 'G7 Pre-tech Studies' | 'G9 Pre-tech Studies';
export type Grade = 'G7' | 'G9';
export type LessonType = 'single' | 'double';

export interface Lesson {
  id: string;               // e.g. "2026-06-08-g7-agriculture"
  date: string;             // ISO date "2026-06-08"
  dayOfWeek: string;        // "Mon", "Tue", etc.
  subject: Subject;
  grade: Grade;
  lessonType: LessonType;
  timeSlot: string;         // "14:00-14:40" or "14:00-15:20"
  topic: string;
  notesPath: string | null;
  slidesPath: string | null;
}

export interface WeekData {
  weekStart: string;
  lessons: Lesson[];
}

export interface LessonMeta {
  topic: string;
  notesPath?: string;
  slidesPath?: string;
}

/** Single blob: data/lessons.json — maps lessonId → LessonMeta */
export type LessonsDb = Record<string, LessonMeta>;
