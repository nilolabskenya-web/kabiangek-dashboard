// ── Kabiangek Junior School Timetable ──
// Fixed weekly schedule. Lessons are generated per week from this template.

import type { Lesson, Subject, Grade, LessonType } from './types';

interface TimetableSlot {
  dayOfWeek: string;    // "Mon" - "Fri"
  subject: Subject;
  grade: Grade;
  lessonType: LessonType;
  timeSlot: string;
}

export const TIMETABLE: TimetableSlot[] = [
  { dayOfWeek: 'Mon', subject: 'G7 Agriculture',     grade: 'G7', lessonType: 'double', timeSlot: '14:00-15:20' },
  { dayOfWeek: 'Tue', subject: 'G9 Pre-tech Studies', grade: 'G9', lessonType: 'double', timeSlot: '09:50-11:10' },
  { dayOfWeek: 'Tue', subject: 'G7 Agriculture',      grade: 'G7', lessonType: 'single', timeSlot: '14:00-14:40' },
  { dayOfWeek: 'Wed', subject: 'G7 Agriculture',      grade: 'G7', lessonType: 'single', timeSlot: '12:10-12:50' },
  { dayOfWeek: 'Thu', subject: 'G7 Pre-tech Studies', grade: 'G7', lessonType: 'single', timeSlot: '10:30-11:10' },
  { dayOfWeek: 'Fri', subject: 'G9 Pre-tech Studies', grade: 'G9', lessonType: 'single', timeSlot: '09:50-10:30' },
  { dayOfWeek: 'Fri', subject: 'G7 Pre-tech Studies', grade: 'G7', lessonType: 'double', timeSlot: '11:30-12:50' },
];

const DAY_MAP: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

/**
 * Get the Monday date for a given week.
 * If no date given, returns current week's Monday.
 */
export function getMonday(date?: Date): Date {
  const d = date ? new Date(date) : new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Sunday → go back 6, else go back to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Format date as YYYY-MM-DD */
export function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

/** Generate lesson ID from date and subject */
export function lessonId(date: string, subject: Subject): string {
  const slug = subject.toLowerCase().replace(/\s+/g, '-').replace('studies', '');
  return `${date}-${slug}`;
}

/**
 * Generate all lessons for a given week (Monday-based).
 */
export function generateWeekLessons(weekStart: Date): Lesson[] {
  const monday = getMonday(weekStart);
  const lessons: Lesson[] = [];

  for (const slot of TIMETABLE) {
    const dayOffset = DAY_MAP[slot.dayOfWeek] - 1; // Mon=0, Tue=1, ...
    const lessonDate = new Date(monday);
    lessonDate.setDate(monday.getDate() + dayOffset);
    const dateStr = formatDate(lessonDate);

    lessons.push({
      id: lessonId(dateStr, slot.subject),
      date: dateStr,
      dayOfWeek: slot.dayOfWeek,
      subject: slot.subject,
      grade: slot.grade,
      lessonType: slot.lessonType,
      timeSlot: slot.timeSlot,
      topic: '',
      notesPath: null,
      slidesPath: null,
      attended: null,
      markedAt: null,
    });
  }

  return lessons;
}

/**
 * Get the week label (e.g., "Week 24, 2026" or "Jun 8–12, 2026")
 */
export function getWeekLabel(weekStart: Date): string {
  const monday = getMonday(weekStart);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${monday.toLocaleDateString('en-US', opts)} – ${friday.toLocaleDateString('en-US', opts)}`;
}

/**
 * Get the current teaching week's Monday.
 * Today is Sunday June 7 2026 → next Monday is June 8.
 */
export function getCurrentTeachingMonday(): Date {
  const now = new Date();
  return getMonday(now);
}
