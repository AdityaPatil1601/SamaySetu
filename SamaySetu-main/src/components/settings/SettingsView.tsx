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
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#BCE5D1] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#059669] mb-1">
            <span>System Parameters</span>
            <span aria-hidden="true">•</span>
            <span>Academic Operating Hours & Bell Schedule</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#133E35] tracking-tight">
            College Scheduling Configuration
          </h1>
          <p className="text-xs text-[#2D6A4F] mt-1">
            Configure working days, period intervals, break durations, and persistent database state.
          </p>
        </div>

        <button
          onClick={onOpenBackendDocs}
          className="px-3.5 py-2 text-xs font-bold text-[#134E3E] bg-[#EAF6F0] hover:bg-[#D7F2E3] border border-[#BCE5D1] rounded-xl transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
        >
          <Code2 className="w-4 h-4 text-[#059669]" />
          <span>Python / OR-Tools Backend</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* College Name & Term */}
        <div className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-[#BCE5D1] space-y-4 shadow-xs">
          <h2 className="text-sm font-black text-[#133E35]">Institution Identity & Term</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#133E35] mb-1">Institution Name</label>
              <input
                type="text"
                required
                value={collegeName}
                onChange={e => setCollegeName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-[#F8FCF9] border border-[#BCE5D1] rounded-xl text-[#133E35] font-semibold focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#133E35] mb-1">Academic Term / Semester</label>
              <input
                type="text"
                required
                value={term}
                onChange={e => setTerm(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-[#F8FCF9] border border-[#BCE5D1] rounded-xl text-[#133E35] font-semibold focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              />
            </div>
          </div>
        </div>

        {/* Working Days */}
        <div className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-[#BCE5D1] space-y-4 shadow-xs">
          <div>
            <h2 className="text-sm font-black text-[#133E35]">Working Days</h2>
            <p className="text-xs text-[#2D6A4F] mt-0.5">Select active instructional days for the timetable solver.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {allDays.map(day => {
              const isSelected = workingDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-[#10B981] text-white border-[#059669] shadow-xs'
                      : 'bg-white text-[#235848] border-[#BCE5D1] hover:bg-[#EAF6F0]'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Operating Hours & Slots */}
        <div className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-[#BCE5D1] space-y-4 shadow-xs">
          <div>
            <h2 className="text-sm font-black text-[#133E35]">Daily Slots & Periods (Canonical Intervals)</h2>
            <p className="text-xs text-[#2D6A4F] mt-0.5">
              The engine evaluates true time intervals (`startTime` to `endTime`) to prevent false overlaps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#133E35] mb-1">Lecture Duration (Minutes)</label>
              <input
                type="number"
                min={45}
                max={90}
                value={lectureMinutes}
                onChange={e => setLectureMinutes(Number(e.target.value))}
                className="w-full text-xs px-3.5 py-2.5 bg-[#F8FCF9] border border-[#BCE5D1] rounded-xl font-mono font-bold text-[#133E35] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#133E35] mb-1">Practical Duration (Minutes)</label>
              <input
                type="number"
                min={90}
                max={180}
                value={practicalMinutes}
                onChange={e => setPracticalMinutes(Number(e.target.value))}
                className="w-full text-xs px-3.5 py-2.5 bg-[#F8FCF9] border border-[#BCE5D1] rounded-xl font-mono font-bold text-[#133E35] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#133E35] mb-1">Lunch Break Slot Index</label>
              <select
                value={lunchIndex}
                onChange={e => setLunchIndex(Number(e.target.value))}
                className="w-full text-xs px-3.5 py-2.5 bg-[#F8FCF9] border border-[#BCE5D1] rounded-xl text-[#133E35] font-semibold focus:outline-none focus:ring-2 focus:ring-[#10B981]"
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
                <tr className="bg-[#EAF6F0] border-b border-[#BCE5D1] text-[#059669] font-bold">
                  <th className="py-2.5 px-3">Slot #</th>
                  <th className="py-2.5 px-3">Start Time</th>
                  <th className="py-2.5 px-3">End Time</th>
                  <th className="py-2.5 px-3">Interval Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#BCE5D1]/40">
                {settings.slots.map(s => (
                  <tr key={s.slotIndex} className="hover:bg-[#F0FDF4]/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#133E35]">Period {s.slotIndex + 1}</td>
                    <td className="py-2.5 px-3 font-mono text-[#14532D] font-medium">{s.startTime}</td>
                    <td className="py-2.5 px-3 font-mono text-[#14532D] font-medium">{s.endTime}</td>
                    <td className="py-2.5 px-3 text-[#2D6A4F]">
                      {s.slotIndex === lunchIndex ? (
                        <span className="text-[#065F46] bg-[#DCFCE7] border border-[#86EFAC] px-2 py-0.5 rounded font-bold text-[11px]">
                          🍱 Followed by Lunch Break (13:15 - 14:00)
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
            className="px-4 py-2 text-xs font-bold text-[#991B1B] hover:bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <RotateCcw className="w-4 h-4 text-[#DC2626]" />
            <span>Reset Demo Database</span>
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4 text-white" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
