'use client';

import { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { Lesson } from '@/lib/types';
import { getWeekLabel, getMonday, formatDate } from '@/lib/timetable';

// Short display names for calendar cells
const SUBJECT_SHORT: Record<string, string> = {
  'G7 Agriculture': 'G7 Agri',
  'G7 Pre-tech Studies': 'G7 Pre-tech',
  'G9 Pre-tech Studies': 'G9 Pre-tech',
};

const SUBJECT_EMOJI: Record<string, string> = {
  'G7 Agriculture': '🌱',
  'G7 Pre-tech Studies': '🔧',
  'G9 Pre-tech Studies': '⚙️',
};

interface CalendarProps {
  initialWeek?: string;
}

export default function TeachingCalendar({ initialWeek }: CalendarProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [weekStart, setWeekStart] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchLessons = useCallback(async (week: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/lessons?week=${week}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setLessons(data.lessons);
      setWeekStart(data.weekStart);
    } catch (e: any) {
      setError('Could not load lessons. Is the API running?');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const week = initialWeek || formatDate(getMonday());
    fetchLessons(week);
  }, [initialWeek, fetchLessons]);

  const events = lessons.map((lesson) => {
    const date = lesson.date;
    const [startTime, endTime] = lesson.timeSlot.split('-');

    let bgColor: string;
    let textColor: string;
    if (lesson.attended === true) {
      bgColor = '#166534'; // green-800
      textColor = '#bbf7d0'; // green-200
    } else if (lesson.attended === false) {
      bgColor = '#991b1b'; // red-800
      textColor = '#fecaca'; // red-200
    } else {
      bgColor = '#374151'; // gray-700
      textColor = '#e5e7eb'; // gray-200
    }

    const shortName = SUBJECT_SHORT[lesson.subject] || lesson.subject;
    const emoji = SUBJECT_EMOJI[lesson.subject] || '';

    return {
      id: lesson.id,
      title: `${emoji} ${shortName}`,
      start: `${date}T${startTime}:00`,
      end: `${date}T${endTime}:00`,
      backgroundColor: bgColor,
      borderColor: bgColor,
      textColor,
      extendedProps: { lesson },
    };
  });

  const handleEventClick = (info: any) => {
    setSelectedLesson(info.event.extendedProps.lesson);
  };

  const handleCloseModal = () => {
    setSelectedLesson(null);
  };

  const handleMarkAttendance = async (attended: boolean) => {
    if (!selectedLesson) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: selectedLesson.id, attended }),
      });
      if (!res.ok) throw new Error('Failed to save');
      await fetchLessons(weekStart);
      setSelectedLesson((prev) =>
        prev ? { ...prev, attended, markedAt: new Date().toISOString() } : null
      );
    } catch (e: any) {
      setError('Failed to save attendance.');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handlePrevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    fetchLessons(formatDate(d));
  };

  const handleNextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    fetchLessons(formatDate(d));
  };

  const handleToday = () => {
    fetchLessons(formatDate(getMonday()));
  };

  const weekLabel = weekStart ? getWeekLabel(new Date(weekStart)) : '';

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* ── Header ── */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">📅 Kabiangek Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">{weekLabel}</p>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={handlePrevWeek}
              className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-gray-300"
            >
              ← Prev
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-gray-300"
            >
              Today
            </button>
            <button
              onClick={handleNextWeek}
              className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-gray-300"
            >
              Next →
            </button>
          </div>
        </div>
      </header>

      {/* ── Legend ── */}
      <div className="max-w-7xl mx-auto px-6 py-3 flex gap-5 text-xs sm:text-sm">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-green-800 border border-green-700"></span>
          <span className="text-gray-400">Attended</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-800 border border-red-700"></span>
          <span className="text-gray-400">Missed</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-gray-700 border border-gray-600"></span>
          <span className="text-gray-400">Pending</span>
        </span>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 mb-3">
          <div className="bg-red-900/50 border border-red-800 text-red-300 px-4 py-2.5 rounded-lg text-sm">
            {error}
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading lessons…</p>
        </div>
      )}

      {/* ── Calendar ── */}
      {!loading && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 pb-8">
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <style jsx global>{`
              /* ── FullCalendar Dark Theme ── */
              .fc {
                --fc-border-color: #1f2937;
                --fc-page-bg-color: #111827;
                --fc-neutral-bg-color: #1f2937;
                --fc-neutral-text-color: #9ca3af;
                --fc-today-bg-color: rgba(59, 130, 246, 0.08);
              }
              .fc .fc-toolbar-title {
                font-size: 1rem;
                font-weight: 600;
                color: #e5e7eb;
              }
              .fc .fc-button {
                background: #1f2937;
                border-color: #374151;
                color: #d1d5db;
                font-size: 0.8rem;
                padding: 0.35rem 0.75rem;
              }
              .fc .fc-button:hover {
                background: #374151;
              }
              .fc .fc-button-active {
                background: #3b82f6 !important;
                border-color: #3b82f6 !important;
              }
              .fc .fc-col-header-cell {
                background: #1f2937;
                color: #d1d5db;
                padding: 8px 4px;
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              .fc .fc-timegrid-slot {
                height: 3rem;
                border-bottom: 1px solid #1f2937;
              }
              .fc .fc-timegrid-slot-label {
                font-size: 0.7rem;
                color: #6b7280;
              }
              .fc .fc-timegrid-axis {
                background: #111827;
                border-color: #1f2937;
              }
              .fc .fc-timegrid-now-indicator-line {
                border-color: #3b82f6;
              }
              .fc .fc-timegrid-now-indicator-arrow {
                border-color: #3b82f6;
              }
              .fc .fc-event {
                border-radius: 6px;
                font-size: 0.75rem;
                padding: 3px 6px;
                cursor: pointer;
                border: 1px solid rgba(255,255,255,0.08);
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
              }
              .fc .fc-event:hover {
                filter: brightness(1.15);
              }
              .fc .fc-timegrid-event .fc-event-time {
                font-size: 0.7rem;
                opacity: 0.8;
              }
              .fc .fc-timegrid-event .fc-event-title {
                font-weight: 500;
                font-size: 0.75rem;
              }
              .fc .fc-scrollgrid {
                border-color: #1f2937 !important;
              }
              .fc .fc-scrollgrid td {
                border-color: #1f2937 !important;
              }
              .fc .fc-scroller {
                scrollbar-width: thin;
                scrollbar-color: #374151 #111827;
              }
              @media (max-width: 640px) {
                .fc .fc-col-header-cell {
                  font-size: 0.65rem;
                  padding: 6px 2px;
                }
                .fc .fc-event {
                  font-size: 0.65rem;
                  padding: 2px 4px;
                }
                .fc .fc-timegrid-event .fc-event-title {
                  font-size: 0.65rem;
                }
              }
            `}</style>
            <div className="p-2 sm:p-4">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: '',
                  center: '',
                  right: '',
                }}
                events={events}
                eventClick={handleEventClick}
                height="auto"
                allDaySlot={false}
                slotMinTime="08:00:00"
                slotMaxTime="16:00:00"
                weekends={false}
                firstDay={1}
                hiddenDays={[]}
                initialDate={weekStart || undefined}
                slotLabelFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                }}
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                }}
                dayHeaderFormat={{
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Lesson Modal ── */}
      {selectedLesson && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="px-5 py-4 border-b border-gray-800 flex items-start justify-between">
              <div>
                <span className="text-xs text-gray-500 font-mono">
                  {selectedLesson.grade} • {selectedLesson.lessonType === 'double' ? '80 min' : '40 min'}
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  {SUBJECT_EMOJI[selectedLesson.subject]} {selectedLesson.subject}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {selectedLesson.dayOfWeek} {selectedLesson.date} • {selectedLesson.timeSlot}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-300 text-xl leading-none p-1"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Topic */}
              {selectedLesson.topic && (
                <div className="bg-blue-900/30 border border-blue-800/50 rounded-lg px-3 py-2.5">
                  <p className="text-xs text-blue-400 font-semibold uppercase tracking-wide mb-0.5">
                    Topic
                  </p>
                  <p className="text-sm text-blue-200">{selectedLesson.topic}</p>
                </div>
              )}

              {/* Attendance */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Attendance
                </h3>
                {selectedLesson.attended === null ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkAttendance(true)}
                      disabled={saving}
                      className="flex-1 px-3 py-2.5 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-600 disabled:opacity-40 transition-colors"
                    >
                      ✅ Attended
                    </button>
                    <button
                      onClick={() => handleMarkAttendance(false)}
                      disabled={saving}
                      className="flex-1 px-3 py-2.5 bg-red-800 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-40 transition-colors"
                    >
                      ❌ Missed
                    </button>
                  </div>
                ) : selectedLesson.attended === true ? (
                  <div className="bg-green-900/30 border border-green-800/50 rounded-lg px-3 py-2.5 flex items-center justify-between">
                    <span className="text-sm text-green-300 font-medium">✅ Attended</span>
                    <button
                      onClick={() => handleMarkAttendance(false)}
                      disabled={saving}
                      className="text-xs text-red-400 hover:text-red-300 hover:underline"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="bg-red-900/30 border border-red-800/50 rounded-lg px-3 py-2.5 flex items-center justify-between">
                    <span className="text-sm text-red-300 font-medium">❌ Missed</span>
                    <button
                      onClick={() => handleMarkAttendance(true)}
                      disabled={saving}
                      className="text-xs text-green-400 hover:text-green-300 hover:underline"
                    >
                      Change
                    </button>
                  </div>
                )}
                {saving && (
                  <p className="text-xs text-gray-500 mt-1.5">Saving…</p>
                )}
              </div>

              {/* Materials */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Materials
                </h3>
                {selectedLesson.notesPath || selectedLesson.slidesPath ? (
                  <div className="space-y-1.5">
                    {selectedLesson.notesPath && (
                      <a
                        href={selectedLesson.notesPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 transition-colors text-sm text-gray-200"
                      >
                        <span className="text-base">📄</span> Download Notes
                      </a>
                    )}
                    {selectedLesson.slidesPath && (
                      <a
                        href={selectedLesson.slidesPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 transition-colors text-sm text-gray-200"
                      >
                        <span className="text-base">📊</span> Download Slides
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 italic">No materials yet</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-950 border-t border-gray-800">
              <p className="text-[10px] text-gray-700 font-mono truncate">{selectedLesson.id}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
