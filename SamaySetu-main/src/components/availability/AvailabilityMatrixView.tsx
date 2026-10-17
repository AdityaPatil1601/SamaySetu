import React, { useState } from 'react';
import {
  CalendarCheck,
  Users,
  DoorOpen,
  Check,
  X,
  Star,
  Info,
} from 'lucide-react';
import { Faculty, Room, CollegeSettings, DayOfWeek } from '../../types';

interface AvailabilityMatrixViewProps {
  faculty: Faculty[];
  rooms: Room[];
  settings: CollegeSettings;
  onSaveFaculty: (faculty: Faculty[]) => void;
  onSaveRooms: (rooms: Room[]) => void;
}

export const AvailabilityMatrixView: React.FC<AvailabilityMatrixViewProps> = ({
  faculty,
  rooms,
  settings,
  onSaveFaculty,
  onSaveRooms,
}) => {
  const [mode, setMode] = useState<'faculty' | 'room'>('faculty');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(faculty[0]?.id || '');
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || '');

  const activeFaculty = faculty.find(f => f.id === selectedFacultyId) || faculty[0];
  const activeRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0];

  const toggleFacultySlot = (day: DayOfWeek, slotIndex: number) => {
    if (!activeFaculty) return;
    const isUnavailable = activeFaculty.unavailableSlots?.some(
      u => u.day === day && u.slotIndex === slotIndex
    );
    const isPreferred = activeFaculty.preferredSlots?.some(
      p => p.day === day && p.slotIndex === slotIndex
    );

    let updatedUnavailable = [...(activeFaculty.unavailableSlots || [])];
    let updatedPreferred = [...(activeFaculty.preferredSlots || [])];

    if (!isUnavailable && !isPreferred) {
      updatedPreferred.push({ day, slotIndex });
    } else if (isPreferred) {
      updatedPreferred = updatedPreferred.filter(p => !(p.day === day && p.slotIndex === slotIndex));
      updatedUnavailable.push({ day, slotIndex });
    } else {
      updatedUnavailable = updatedUnavailable.filter(u => !(u.day === day && u.slotIndex === slotIndex));
    }

    const updated = faculty.map(f =>
      f.id === activeFaculty.id
        ? { ...f, unavailableSlots: updatedUnavailable, preferredSlots: updatedPreferred }
        : f
    );
    onSaveFaculty(updated);
  };

  const toggleRoomSlot = (day: DayOfWeek, slotIndex: number) => {
    if (!activeRoom) return;
    const isUnavailable = activeRoom.unavailableSlots?.some(
      u => u.day === day && u.slotIndex === slotIndex
    );
    let updatedUnavailable = [...(activeRoom.unavailableSlots || [])];

    if (isUnavailable) {
      updatedUnavailable = updatedUnavailable.filter(u => !(u.day === day && u.slotIndex === slotIndex));
    } else {
      updatedUnavailable.push({ day, slotIndex });
    }

    const updated = rooms.map(r =>
      r.id === activeRoom.id ? { ...r, unavailableSlots: updatedUnavailable } : r
    );
    onSaveRooms(updated);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>Constraint Parameter Matrix</span>
            <span aria-hidden="true">•</span>
            <span>Time-Slot Availability & Preferences</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Faculty & Facility Availability Calendar
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Configure unavailable hours and preferred lecture windows. The solver treats unavailable hours as hard constraints.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            onClick={() => setMode('faculty')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              mode === 'faculty'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Faculty Availability</span>
          </button>
          <button
            onClick={() => setMode('room')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              mode === 'room'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <DoorOpen className="w-3.5 h-3.5" />
            <span>Room Availability</span>
          </button>
        </div>
      </div>

      {/* Selector Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {mode === 'faculty' ? 'Select Faculty Member:' : 'Select Room/Laboratory:'}
          </span>
          {mode === 'faculty' ? (
            <select
              value={selectedFacultyId}
              onChange={e => setSelectedFacultyId(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
            >
              {faculty.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.employeeId} - {f.department})
                </option>
              ))}
            </select>
          ) : (
            <select
              value={selectedRoomId}
              onChange={e => setSelectedRoomId(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
            >
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.roomNumber} - {r.name} ({r.type})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600" />
            <span>Available</span>
          </div>
          {mode === 'faculty' && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-indigo-50 border border-indigo-400 flex items-center justify-center">
                <Star className="w-2 h-2 text-indigo-600 fill-indigo-600" />
              </div>
              <span>Preferred (Soft)</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-rose-50 border border-rose-400 flex items-center justify-center">
              <X className="w-2 h-2 text-rose-600" />
            </div>
            <span>Blocked / Unavailable (Hard)</span>
          </div>
        </div>
      </div>

      {/* Interactive Matrix Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-x-auto shadow-xs">
        <table className="w-full text-center border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
              <th className="py-3 px-3 text-left font-semibold text-slate-600 dark:text-slate-400 w-32">Day</th>
              {settings.slots.map(slot => (
                <th key={slot.slotIndex} className="py-3 px-2 font-semibold text-slate-700 dark:text-slate-300 min-w-[110px]">
                  <div>Slot {slot.slotIndex + 1}</div>
                  <div className="text-[11px] font-mono text-slate-400 font-normal">
                    {slot.startTime} - {slot.endTime}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {settings.workingDays.map(day => (
              <tr key={day} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-4 px-3 text-left font-bold text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/40">
                  {day}
                </td>
                {settings.slots.map(slot => {
                  let state: 'available' | 'preferred' | 'unavailable' = 'available';
                  if (mode === 'faculty' && activeFaculty) {
                    const isUnavail = activeFaculty.unavailableSlots?.some(
                      u => u.day === day && u.slotIndex === slot.slotIndex
                    );
                    const isPref = activeFaculty.preferredSlots?.some(
                      p => p.day === day && p.slotIndex === slot.slotIndex
                    );
                    if (isUnavail) state = 'unavailable';
                    else if (isPref) state = 'preferred';
                  } else if (mode === 'room' && activeRoom) {
                    const isUnavail = activeRoom.unavailableSlots?.some(
                      u => u.day === day && u.slotIndex === slot.slotIndex
                    );
                    if (isUnavail) state = 'unavailable';
                  }

                  return (
                    <td key={slot.slotIndex} className="p-1.5">
                      <button
                        onClick={() => {
                          if (mode === 'faculty') toggleFacultySlot(day, slot.slotIndex);
                          else toggleRoomSlot(day, slot.slotIndex);
                        }}
                        className={`w-full py-3 px-1 rounded-xl border transition-all text-center flex flex-col items-center justify-center gap-1 ${
                          state === 'unavailable'
                            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                            : state === 'preferred'
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 shadow-2xs'
                            : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                        }`}
                        title="Click to cycle status (Available -> Preferred -> Blocked)"
                      >
                        {state === 'unavailable' && (
                          <>
                            <X className="w-3.5 h-3.5 text-rose-600" />
                            <span className="text-[10px] font-semibold">Blocked</span>
                          </>
                        )}
                        {state === 'preferred' && (
                          <>
                            <Star className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                            <span className="text-[10px] font-semibold">Preferred</span>
                          </>
                        )}
                        {state === 'available' && (
                          <>
                            <Check className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                            <span className="text-[10px] text-slate-400">Available</span>
                          </>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Click on any cell to cycle its state. Changes are immediately applied to persistent schedule constraints.
          </span>
        </div>
      </div>
    </div>
  );
};
