'use client';

import { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { Lesson } from '@/lib/types';
import { getWeekLabel, getMonday, formatDate } from '@/lib/timetable';

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

// Optimized: fetch once and cache the lessons DB response
let cachedLessons: { weekStart: string; lessons: Lesson[] } | null = null;
let cachedWeek = '';

export default function TeachingCalendar() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [weekStart, setWeekStart] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = useCallback(async (week: string) => {
    // Use cache for instant back-navigation
    if (cachedWeek === week && cachedLessons) {
      setLessons(cachedLessons.lessons);
      setWeekStart(cachedLessons.weekStart);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/lessons?week=${week}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setLessons(data.lessons);
      setWeekStart(data.weekStart);
      cachedLessons = data;
      cachedWeek = week;
    } catch (e) {
      console.error(e);
      setError('Could not load lessons. Try refreshing.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLessons(formatDate(getMonday()));
  }, [fetchLessons]);

  // Color: green = has files, gray = no files yet
  const events = lessons.map((lesson) => {
    const date = lesson.date;
    const [startTime, endTime] = lesson.timeSlot.split('-');
    const hasFiles = !!(lesson.notesPath || lesson.slidesPath);

    return {
      id: lesson.id,
      title: `${SUBJECT_EMOJI[lesson.subject]} ${SUBJECT_SHORT[lesson.subject]}`,
      start: `${date}T${startTime}:00`,
      end: `${date}T${endTime}:00`,
      backgroundColor: hasFiles ? '#166534' : '#374151',
      borderColor: hasFiles ? '#15803d' : '#4b5563',
      textColor: hasFiles ? '#bbf7d0' : '#e5e7eb',
      extendedProps: { lesson },
    };
  });

  const handleEventClick = (info: any) => {
    setSelectedLesson(info.event.extendedProps.lesson);
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
  const hasFiles = (l: Lesson) => !!(l.notesPath || l.slidesPath);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold">📅 Kabiangek Dashboard</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{weekLabel}</p>
          </div>
          <div className="flex gap-1.5">
            <button onClick={handlePrevWeek} className="px-3 py-1.5 text-xs sm:text-sm bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-gray-300">
              ← Prev
            </button>
            <button onClick={handleToday} className="px-3 py-1.5 text-xs sm:text-sm bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-gray-300">
              Today
            </button>
            <button onClick={handleNextWeek} className="px-3 py-1.5 text-xs sm:text-sm bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-gray-300">
              Next →
            </button>
          </div>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-red-900/30 border border-red-800/50 rounded-lg px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading…</p>
        </div>
      )}

      {/* Calendar */}
      {!loading && (
        <div className="max-w-7xl mx-auto px-2 sm:px-6 pb-8 pt-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <style jsx global>{`
              .fc {
                --fc-border-color: #1f2937;
                --fc-page-bg-color: #111827;
                --fc-neutral-bg-color: #1f2937;
                --fc-neutral-text-color: #9ca3af;
                --fc-today-bg-color: rgba(59, 130, 246, 0.08);
              }
              .fc .fc-toolbar-title { font-size: 1rem; font-weight: 600; color: #e5e7eb; }
              .fc .fc-button { background: #1f2937; border-color: #374151; color: #d1d5db; font-size: 0.8rem; }
              .fc .fc-button:hover { background: #374151; }
              .fc .fc-col-header-cell { background: #1f2937; color: #d1d5db; padding: 8px 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
              .fc .fc-timegrid-slot { height: 3rem; border-bottom: 1px solid #1f2937; }
              .fc .fc-timegrid-slot-label { font-size: 0.7rem; color: #6b7280; }
              .fc .fc-timegrid-axis { background: #111827; border-color: #1f2937; }
              .fc .fc-event { border-radius: 6px; font-size: 0.75rem; padding: 3px 6px; cursor: pointer; border: 1px solid rgba(255,255,255,0.08); }
              .fc .fc-event:hover { filter: brightness(1.15); }
              .fc .fc-timegrid-event .fc-event-time { font-size: 0.7rem; opacity: 0.8; }
              .fc .fc-timegrid-event .fc-event-title { font-weight: 500; font-size: 0.75rem; }
              .fc .fc-scroller { scrollbar-width: thin; scrollbar-color: #374151 #111827; }
              @media (max-width: 640px) {
                .fc .fc-col-header-cell { font-size: 0.65rem; padding: 6px 2px; }
                .fc .fc-event { font-size: 0.65rem; padding: 2px 4px; }
              }
            `}</style>
            <div className="p-2 sm:p-4">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{ left: '', center: '', right: '' }}
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
                slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                dayHeaderFormat={{ weekday: 'short', day: 'numeric', month: 'short' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {selectedLesson && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedLesson(null)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
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
                onClick={() => setSelectedLesson(null)}
                className="text-gray-500 hover:text-gray-300 text-xl leading-none p-1"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Topic */}
              {selectedLesson.topic ? (
                <div className="bg-blue-900/30 border border-blue-800/50 rounded-lg px-3 py-2.5">
                  <p className="text-xs text-blue-400 font-semibold uppercase tracking-wide mb-0.5">Topic</p>
                  <p className="text-sm text-blue-200">{selectedLesson.topic}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-600 italic">No topic recorded</p>
              )}

              {/* Downloads */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Downloads</h3>
                {hasFiles(selectedLesson) ? (
                  <div className="space-y-1.5">
                    {selectedLesson.notesPath && (
                      <a
                        href={selectedLesson.notesPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 transition-colors text-sm text-gray-200"
                      >
                        <span className="text-base">📄</span> Learner Notes (.docx)
                      </a>
                    )}
                    {selectedLesson.slidesPath && (
                      <a
                        href={selectedLesson.slidesPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 transition-colors text-sm text-gray-200"
                      >
                        <span className="text-base">📊</span> Slides (.pptx)
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 italic">No files uploaded yet</p>
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
