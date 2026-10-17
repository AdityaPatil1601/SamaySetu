import React, { useState, useMemo } from 'react';
import {
  Compass,
  DoorOpen,
  Monitor,
  Cpu,
  Clock,
  Filter,
  Users,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  Room,
  ScheduleVersion,
  CollegeSettings,
  DayOfWeek,
  RoomType,
} from '../../types';

interface StudentFreeRoomsViewProps {
  rooms: Room[];
  activeVersion: ScheduleVersion | null;
  settings: CollegeSettings;
}

export const StudentFreeRoomsView: React.FC<StudentFreeRoomsViewProps> = ({
  rooms,
  activeVersion,
  settings,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => {
    const days: DayOfWeek[] = ['Sunday' as DayOfWeek, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const current = days[new Date().getDay()];
    return settings.workingDays.includes(current) ? current : settings.workingDays[0] || 'Monday';
  });

  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const [typeFilter, setTypeFilter] = useState<'ALL' | RoomType>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentSlot = settings.slots[selectedSlotIndex] || settings.slots[0];

  // Calculate free rooms for the selected day and slot
  const freeRooms = useMemo(() => {
    if (!activeVersion) return rooms;

    const occupiedRoomIds = new Set<string>();

    activeVersion.assignments.forEach(a => {
      if (a.day !== selectedDay) return;
      const start = a.startSlotIndex;
      const end = a.startSlotIndex + a.durationSlots;

      if (selectedSlotIndex >= start && selectedSlotIndex < end) {
        occupiedRoomIds.add(a.roomId);
      }
    });

    return rooms.filter(r => {
      if (!r.active) return false;
      if (occupiedRoomIds.has(r.id)) return false;

      // Filter by room type
      if (typeFilter !== 'ALL' && r.type !== typeFilter) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = r.roomNumber.toLowerCase().includes(q);
        const matchName = r.name.toLowerCase().includes(q);
        const matchEquip = r.equipment.some(e => e.toLowerCase().includes(q));
        if (!matchNumber && !matchName && !matchEquip) return false;
      }

      return true;
    });
  }, [rooms, activeVersion, selectedDay, selectedSlotIndex, typeFilter, searchQuery]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-emerald-700">Campus Facility Finder</span>
            <span aria-hidden="true">·</span>
            <span>Real-time Timetable Occupancy</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Vacant Classrooms & Computer Labs
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Locate empty lecture halls, seminar rooms, and open computer labs for revision, group projects, or club meetings.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex items-center gap-2 shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="font-medium text-emerald-950">
            {freeRooms.length} Spaces Vacant during Period {selectedSlotIndex + 1}
          </span>
        </div>
      </div>

      {/* Control Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700">Day:</label>
          <select
            value={selectedDay}
            onChange={e => setSelectedDay(e.target.value as DayOfWeek)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-medium"
          >
            {settings.workingDays.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700">Time Slot:</label>
          <select
            value={selectedSlotIndex}
            onChange={e => setSelectedSlotIndex(Number(e.target.value))}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono"
          >
            {settings.slots.map(s => (
              <option key={s.slotIndex} value={s.slotIndex}>
                Period {s.slotIndex + 1} ({s.label})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-2.5 py-1 rounded-md transition-colors font-semibold ${
              typeFilter === 'ALL'
                ? 'bg-white font-medium text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Spaces
          </button>
          <button
            onClick={() => setTypeFilter('Classroom')}
            className={`px-2.5 py-1 rounded-md transition-colors font-semibold ${
              typeFilter === 'Classroom'
                ? 'bg-white font-medium text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Classrooms
          </button>
          <button
            onClick={() => setTypeFilter('Computer Lab')}
            className={`px-2.5 py-1 rounded-md transition-colors font-semibold ${
              typeFilter === 'Computer Lab'
                ? 'bg-white font-medium text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Computer Labs
          </button>
        </div>

        <div className="flex-1 min-w-[180px] max-w-xs relative ml-auto">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search room number or equipment..."
            className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Free Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {freeRooms.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-xl">
            No empty rooms found matching your filter for {selectedDay} at {currentSlot.label}.
          </div>
        ) : (
          freeRooms.map(room => {
            const isLab = room.type.includes('Lab');

            return (
              <div
                key={room.id}
                className="p-5 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 transition-colors flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-bold text-slate-900">
                      {room.roomNumber}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Vacant Now
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-slate-800 mt-1">
                    {room.name}
                  </h3>

                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>{room.type}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Cap: {room.capacity} seats</span>
                    </span>
                  </div>

                  {room.equipment.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1">
                      {room.equipment.map((eq, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                        >
                          {eq}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Slot {selectedSlotIndex + 1}: {currentSlot.label}</span>
                  <span className="text-emerald-700 font-semibold">Available for Study</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
