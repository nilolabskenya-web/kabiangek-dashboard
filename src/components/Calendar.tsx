'use client';

import { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { Lesson, AttendanceData } from '@/lib/types';
import { getWeekLabel, getMonday, formatDate } from '@/lib/timetable';

interface CalendarProps {
  initialWeek?: string; // YYYY-MM-DD (Monday)
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

  // Convert lessons to FullCalendar events
  const events = lessons.map((lesson) => {
    const date = lesson.date;
    const [startTime, endTime] = lesson.timeSlot.split('-');
    const color = lesson.attended === true
      ? '#16a34a'  // green — attended
      : lesson.attended === false
        ? '#dc2626'  // red — missed
        : '#6b7280'; // gray — pending

    return {
      id: lesson.id,
      title: `${lesson.subject.split(' ')[0]} ${lesson.grade} Agri${lesson.subject.includes('Pre-tech') ? ' Pre-tech' : ''}`,
      start: `${date}T${startTime}:00`,
      end: `${date}T${endTime}:00`,
      backgroundColor: color,
      borderColor: color,
      extendedProps: { lesson },
      classNames: ['cursor-pointer', 'text-sm'],
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
      // Refresh lessons
      await fetchLessons(weekStart);
      // Update selected lesson
      setSelectedLesson((prev) => prev ? { ...prev, attended, markedAt: new Date().toISOString() } : null);
    } catch (e: any) {
      setError('Failed to save attendance. Check console.');
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📅 Kabiangek Teaching Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">{weekLabel}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrevWeek}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              ← Prev
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              This Week
            </button>
            <button
              onClick={handleNextWeek}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </header>

      {/* Legend */}
      <div className="max-w-6xl mx-auto px-6 py-3 flex gap-4 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-green-600"></span> Attended
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-600"></span> Missed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-gray-500"></span> Pending
        </span>
      </div>

      {/* Error banner */}
      {error && (
        <div className="max-w-6xl mx-auto px-6 mb-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="max-w-6xl mx-auto px-6 py-12 text-center text-gray-500">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          Loading lessons...
        </div>
      )}

      {/* Calendar */}
      {!loading && (
        <div className="max-w-6xl mx-auto px-6 pb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
              dayHeaderFormat={{ weekday: 'short', day: 'numeric', month: 'short' }}
            />
          </div>
        </div>
      )}

      {/* Lesson Detail Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedLesson.subject}</h2>
                <p className="text-sm text-gray-500">
                  {selectedLesson.dayOfWeek}, {selectedLesson.date} • {selectedLesson.timeSlot}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedLesson.lessonType === 'double' ? 'Double lesson (80 min)' : 'Single lesson (40 min)'}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Topic */}
            {selectedLesson.topic && (
              <div className="bg-blue-50 border border-blue-100 rounded-md px-3 py-2 mb-4">
                <span className="text-xs text-blue-500 font-semibold uppercase">Topic</span>
                <p className="text-sm text-blue-900">{selectedLesson.topic}</p>
              </div>
            )}

            {/* Attendance Status */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Attendance</h3>
              {selectedLesson.attended === null ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMarkAttendance(true)}
                    disabled={saving}
                    className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    ✅ I Attended
                  </button>
                  <button
                    onClick={() => handleMarkAttendance(false)}
                    disabled={saving}
                    className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    ❌ I Missed
                  </button>
                </div>
              ) : selectedLesson.attended === true ? (
                <div className="bg-green-50 border border-green-200 rounded-md px-3 py-2 flex items-center justify-between">
                  <span className="text-sm text-green-700">✅ Attended</span>
                  <button
                    onClick={() => handleMarkAttendance(false)}
                    disabled={saving}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Change to Missed
                  </button>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 flex items-center justify-between">
                  <span className="text-sm text-red-700">❌ Missed</span>
                  <button
                    onClick={() => handleMarkAttendance(true)}
                    disabled={saving}
                    className="text-xs text-green-600 hover:underline"
                  >
                    Change to Attended
                  </button>
                </div>
              )}
              {saving && (
                <p className="text-xs text-gray-400 mt-1">Saving...</p>
              )}
            </div>

            {/* Files */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Materials</h3>
              {selectedLesson.notesPath || selectedLesson.slidesPath ? (
                <div className="space-y-2">
                  {selectedLesson.notesPath && (
                    <a
                      href={selectedLesson.notesPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors text-sm"
                    >
                      📄 Download Notes (.docx)
                    </a>
                  )}
                  {selectedLesson.slidesPath && (
                    <a
                      href={selectedLesson.slidesPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors text-sm"
                    >
                      📊 Download Slides (.pptx)
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No materials uploaded yet.</p>
              )}
            </div>

            {/* Lesson ID (debug) */}
            <p className="text-xs text-gray-300 mt-4 font-mono">{selectedLesson.id}</p>
          </div>
        </div>
      )}
    </div>
  );
}
