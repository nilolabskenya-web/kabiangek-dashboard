// ── Core Types for Kabiangek Teaching Dashboard ──

export type Subject = 'G7 Agriculture' | 'G7 Pre-tech Studies' | 'G9 Pre-tech Studies';
export type Grade = 'G7' | 'G9';
export type LessonType = 'single' | 'double';

export interface Lesson {
  id: string;               // e.g. "2026-06-08-g7-agri"
  date: string;             // ISO date "2026-06-08"
  dayOfWeek: string;        // "Mon", "Tue", etc.
  subject: Subject;
  grade: Grade;
  lessonType: LessonType;
  timeSlot: string;         // "14:00-14:40" or "14:00-15:20"
  topic: string;            // e.g. "Crochet: Tools & Materials"
  notesPath: string | null;  // Blob URL for notes
  slidesPath: string | null; // Blob URL for slides (only doubles)
  attended: boolean | null;  // true=attended, false=missed, null=pending
  markedAt: string | null;   // ISO timestamp when attendance was marked
}

export interface WeekData {
  weekStart: string;        // Monday date
  lessons: Lesson[];
}

export interface AttendanceRecord {
  lessonId: string;
  attended: boolean;
  markedAt: string;
}

export interface AttendanceData {
  records: Record<string, AttendanceRecord>;  // lessonId -> record
  lastUpdated: string;
}

export interface StatusResponse {
  weekStart: string;
  subjects: {
    subject: Subject;
    lastLessonId: string;
    lastLessonDate: string;
    attended: boolean | null;
    shouldGenerate: boolean;  // true if last lesson was attended or no prior lesson
  }[];
}
