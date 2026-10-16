import React, { useState } from 'react';
import {
  Settings,
  Clock,
  Calendar,
  RotateCcw,
  Save,
  CheckCircle2,
  Code2,
} from 'lucide-react';
import { CollegeSettings, DayOfWeek } from '../../types';

interface SettingsViewProps {
  settings: CollegeSettings;
  onSaveSettings: (settings: CollegeSettings) => void;
  onResetDemoData: () => void;
  onOpenBackendDocs: () => void;
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetDemoData,
  onOpenBackendDocs,
  onShowToast,
}) => {
  const [collegeName, setCollegeName] = useState(settings.collegeName);
  const [term, setTerm] = useState(settings.academicTerm);
  const [workingDays, setWorkingDays] = useState<DayOfWeek[]>(settings.workingDays);
  const [lectureMinutes, setLectureMinutes] = useState(settings.lectureDurationMinutes);
  const [practicalMinutes, setPracticalMinutes] = useState(settings.practicalDurationMinutes);
  const [lunchIndex, setLunchIndex] = useState(settings.lunchBreakSlotIndex);

  const allDays: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const toggleDay = (day: DayOfWeek) => {
    if (workingDays.includes(day)) {
      if (workingDays.length <= 3) {
        alert('A minimum of 3 working days is required.');
        return;
      }
      setWorkingDays(workingDays.filter(d => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CollegeSettings = {
      ...settings,
      collegeName,
      academicTerm: term,
      workingDays,
      lectureDurationMinutes: Number(lectureMinutes),
      practicalDurationMinutes: Number(practicalMinutes),
      lunchBreakSlotIndex: Number(lunchIndex),
    };
    onSaveSettings(updated);
    if (onShowToast) {
      onShowToast('success', 'Configuration Saved', 'Operating hours and parameters updated.');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>System Parameters</span>
            <span aria-hidden="true">•</span>
            <span>Academic Operating Hours & Bell Schedule</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            College Scheduling Configuration
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Configure working days, period intervals, break durations, and persistent database state.
          </p>
        </div>

        <button
          onClick={onOpenBackendDocs}
          className="px-3.5 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Code2 className="w-4 h-4" />
          <span>Python / OR-Tools Backend</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* College Name & Term */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Institution Identity & Term</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Institution Name</label>
              <input
                type="text"
                required
                value={collegeName}
                onChange={e => setCollegeName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Academic Term / Semester</label>
              <input
                type="text"
                required
                value={term}
                onChange={e => setTerm(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Working Days */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Working Days</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Select active instructional days for the timetable solver.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {allDays.map(day => {
              const isSelected = workingDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Operating Hours & Slots */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Daily Slots & Periods (Canonical Intervals)</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The engine evaluates true time intervals (`startTime` to `endTime`) to prevent false overlaps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Lecture Duration (Minutes)</label>
              <input
                type="number"
                min={45}
                max={90}
                value={lectureMinutes}
                onChange={e => setLectureMinutes(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Practical Duration (Minutes)</label>
              <input
                type="number"
                min={90}
                max={180}
                value={practicalMinutes}
                onChange={e => setPracticalMinutes(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Lunch Break Slot Index</label>
              <select
                value={lunchIndex}
                onChange={e => setLunchIndex(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              >
                {settings.slots.map(s => (
                  <option key={s.slotIndex} value={s.slotIndex}>
                    After Slot {s.slotIndex + 1} ({s.endTime})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">Slot #</th>
                  <th className="py-2.5 px-3">Start Time</th>
                  <th className="py-2.5 px-3">End Time</th>
                  <th className="py-2.5 px-3">Interval Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {settings.slots.map(s => (
                  <tr key={s.slotIndex}>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">Period {s.slotIndex + 1}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">{s.startTime}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">{s.endTime}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {s.slotIndex === lunchIndex ? (
                        <span className="text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded font-medium text-[11px]">
                          Followed by Lunch Break (13:15 - 14:00)
                        </span>
                      ) : (
                        <span>Standard Instructional Period</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              const confirm = window.confirm(
                'Are you sure you want to restore demo seed data? This will reset all branches, faculty, students, and schedules to the original demonstration state.'
              );
              if (confirm) onResetDemoData();
            }}
            className="px-4 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>Reset Demo Database</span>
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
