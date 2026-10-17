import React, { useState } from 'react';
import {
  Clock,
  CalendarCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  Faculty,
  CollegeSettings,
  DayOfWeek,
  ScheduleVersion,
} from '../../types';

interface TeacherAvailabilityViewProps {
  currentFaculty: Faculty;
  settings: CollegeSettings;
  activeVersion: ScheduleVersion | null;
  onUpdateFaculty: (updated: Faculty) => void;
  onAddToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const TeacherAvailabilityView: React.FC<TeacherAvailabilityViewProps> = ({
  currentFaculty,
  settings,
  activeVersion,
  onUpdateFaculty,
  onAddToast,
}) => {
  const [maxHours, setMaxHours] = useState<number>(currentFaculty.maxWeeklyHours || 18);
  const [unavailableSlots, setUnavailableSlots] = useState<{ day: DayOfWeek; slotIndex: number }[]>(
    currentFaculty.unavailableSlots || []
  );
  const [preferredSlots, setPreferredSlots] = useState<{ day: DayOfWeek; slotIndex: number }[]>(
    currentFaculty.preferredSlots || []
  );

  // My currently scheduled assignments in the active timetable
  const myAssignments = activeVersion?.assignments.filter(a => a.facultyId === currentFaculty.id) || [];

  const isSlotAssigned = (day: DayOfWeek, slotIndex: number) => {
    return myAssignments.some(
      a => a.day === day && slotIndex >= a.startSlotIndex && slotIndex < a.startSlotIndex + a.durationSlots
    );
  };

  const getSlotAssignedDetails = (day: DayOfWeek, slotIndex: number) => {
    return myAssignments.find(
      a => a.day === day && slotIndex >= a.startSlotIndex && slotIndex < a.startSlotIndex + a.durationSlots
    );
  };

  const isSlotUnavailable = (day: DayOfWeek, slotIndex: number) => {
    return unavailableSlots.some(s => s.day === day && s.slotIndex === slotIndex);
  };

  const isSlotPreferred = (day: DayOfWeek, slotIndex: number) => {
    return preferredSlots.some(s => s.day === day && s.slotIndex === slotIndex);
  };

  const toggleSlotStatus = (day: DayOfWeek, slotIndex: number) => {
    const unav = isSlotUnavailable(day, slotIndex);
    const pref = isSlotPreferred(day, slotIndex);

    if (!unav && !pref) {
      // Set to preferred
      setPreferredSlots(prev => [...prev, { day, slotIndex }]);
    } else if (pref) {
      // Set to unavailable
      setPreferredSlots(prev => prev.filter(s => !(s.day === day && s.slotIndex === slotIndex)));
      setUnavailableSlots(prev => [...prev, { day, slotIndex }]);
    } else {
      // Reset to normal
      setUnavailableSlots(prev => prev.filter(s => !(s.day === day && s.slotIndex === slotIndex)));
    }
  };

  const handleSave = () => {
    const updatedFaculty: Faculty = {
      ...currentFaculty,
      maxWeeklyHours: maxHours,
      unavailableSlots,
      preferredSlots,
    };
    onUpdateFaculty(updatedFaculty);
    onAddToast(
      'success',
      'Teaching Preferences Saved',
      'Your availability and slot preferences will guide upcoming timetable generations and rescheduling.'
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-emerald-700">Faculty Preferences</span>
            <span aria-hidden="true">·</span>
            <span>Constraint Programming Alignment</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Teaching Hours & Slot Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Click on timetable slots to declare preferred research/mentoring hours or unavailable slots.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Preferences</span>
        </button>
      </div>

      {/* Settings strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Max Weekly Teaching Hours Quota
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={6}
              max={28}
              value={maxHours}
              onChange={e => setMaxHours(Number(e.target.value))}
              className="w-24 text-sm font-mono px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <span className="text-xs text-slate-500">hours / week</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Standard UGC / AICTE faculty teaching quota is 16–18 hours.
          </p>
        </div>

        <div className="md:col-span-2 p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between">
          <div className="text-xs space-y-1">
            <div className="font-semibold text-slate-900">Slot Status Legend</div>
            <div className="text-slate-500">Click any grid cell below to cycle its status:</div>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-white border border-slate-300" />
                <span>Available</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
                <span>Preferred (Top Choice)</span>
              </span>
              <span className="flex items-center gap-1.5 text-rose-700">
                <span className="w-3 h-3 rounded bg-rose-100 border border-rose-300" />
                <span>Unavailable (Research/Leave)</span>
              </span>
              <span className="flex items-center gap-1.5 text-teal-700">
                <span className="w-3 h-3 rounded bg-teal-100 border border-teal-300" />
                <span>Currently Assigned Class</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Availability Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-3 font-semibold text-slate-700 w-24 sticky left-0 bg-slate-50">
                  Day
                </th>
                {settings.slots.map(slot => (
                  <th key={slot.slotIndex} className="py-3 px-2 font-semibold text-slate-700 text-center min-w-[110px]">
                    <div>Period {slot.slotIndex + 1}</div>
                    <div className="text-[10px] text-slate-500 font-mono font-normal">
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {settings.workingDays.map(day => (
                <tr key={day} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-semibold text-slate-800 sticky left-0 bg-white border-r border-slate-200">
                    {day}
                  </td>
                  {settings.slots.map(slot => {
                    const assigned = isSlotAssigned(day, slot.slotIndex);
                    const asgDetails = getSlotAssignedDetails(day, slot.slotIndex);
                    const unav = isSlotUnavailable(day, slot.slotIndex);
                    const pref = isSlotPreferred(day, slot.slotIndex);

                    let bgClass = 'bg-white hover:bg-slate-50 text-slate-600';
                    let label = 'Available';

                    if (assigned && asgDetails) {
                      bgClass = 'bg-teal-50 border-teal-200 text-teal-900 font-semibold';
                      label = `${asgDetails.subjectCode} (${asgDetails.roomNumber})`;
                    } else if (unav) {
                      bgClass = 'bg-rose-50 border-rose-200 text-rose-800 font-medium';
                      label = 'Unavailable';
                    } else if (pref) {
                      bgClass = 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium';
                      label = 'Preferred';
                    }

                    return (
                      <td key={slot.slotIndex} className="p-1 border border-slate-100 text-center">
                        <button
                          type="button"
                          disabled={assigned}
                          onClick={() => toggleSlotStatus(day, slot.slotIndex)}
                          className={`w-full h-14 p-1 rounded-lg border text-[11px] flex flex-col items-center justify-center transition-all ${bgClass} ${
                            assigned ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'
                          }`}
                          title={assigned ? 'Assigned in published timetable' : 'Click to cycle status'}
                        >
                          <span className="truncate w-full text-center">{label}</span>
                          {assigned && asgDetails && (
                            <span className="text-[9px] text-teal-700 font-mono truncate">
                              {asgDetails.divisionName}
                            </span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
