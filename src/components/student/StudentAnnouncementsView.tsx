import React from 'react';
import { Bell, Calendar, UserCheck, AlertTriangle } from 'lucide-react';
import { Announcement, Student, Division } from '../../types';

interface StudentAnnouncementsViewProps {
  currentStudent: Student | undefined;
  announcements: Announcement[];
  divisions: Division[];
}

export const StudentAnnouncementsView: React.FC<StudentAnnouncementsViewProps> = ({
  currentStudent,
  announcements,
  divisions,
}) => {
  const student = currentStudent || {
    id: 'stud-101',
    divisionId: 'div-cmpn-fy-a',
  };

  // Filter announcements for students: 'all', 'students', or matching their division
  const studentAnnouncements = announcements.filter(
    a =>
      a.targetAudience === 'all' ||
      a.targetAudience === 'students' ||
      (a.targetAudience === 'class' && a.divisionId === student.divisionId)
  );

  const getPriorityBadge = (p: 'normal' | 'important' | 'urgent') => {
    switch (p) {
      case 'urgent':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            Urgent Notice
          </span>
        );
      case 'important':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Important
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            General Notice
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">
            <Bell className="w-4 h-4" />
            <span>Official College Notice Board</span>
            <span aria-hidden="true">•</span>
            <span>{studentAnnouncements.length} Active Circulars</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Campus Bulletins & Academic Circulars
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Stay up to date with timetable publication updates, examination notices, and classroom announcements.
          </p>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {studentAnnouncements.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            No active announcements for your class section.
          </div>
        ) : (
          studentAnnouncements.map(ann => {
            const targetDiv = divisions.find(d => d.id === ann.divisionId);
            return (
              <div
                key={ann.id}
                className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getPriorityBadge(ann.priority)}
                      {targetDiv && (
                        <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                          Class: {targetDiv.name}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{ann.title}</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  {ann.content}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <span>
                    Issued by: <strong className="text-slate-800 dark:text-slate-200">{ann.authorName}</strong>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
