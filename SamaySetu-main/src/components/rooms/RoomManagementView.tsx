import React, { useState } from 'react';
import {
  DoorOpen,
  Plus,
  Search,
  Filter,
  Monitor,
  Cpu,
  Wrench,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import { Room, RoomType, ScheduleAssignment } from '../../types';

interface RoomManagementViewProps {
  rooms: Room[];
  assignments: ScheduleAssignment[];
  onSaveRooms: (rooms: Room[]) => void;
  onViewRoomTimetable: (roomId: string) => void;
}

export const RoomManagementView: React.FC<RoomManagementViewProps> = ({
  rooms,
  assignments,
  onSaveRooms,
  onViewRoomTimetable,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isAddingRoom, setIsAddingRoom] = useState(false);

  // New room state
  const [roomNumber, setRoomNumber] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<RoomType>('Classroom');
  const [capacity, setCapacity] = useState(70);
  const [equipmentInput, setEquipmentInput] = useState('');
  const [sessionTypes, setSessionTypes] = useState<('Theory' | 'Practical')[]>(['Theory']);

  const roomTypes: RoomType[] = [
    'Classroom',
    'Computer Lab',
    'Electronics Lab',
    'Mechanical Lab',
    'Civil Lab',
    'Seminar Hall',
  ];

  // Calculate room weekly hours from assignments
  const roomHoursMap = new Map<string, number>();
  assignments.forEach(a => {
    const cur = roomHoursMap.get(a.roomId) || 0;
    roomHoursMap.set(a.roomId, cur + a.durationSlots);
  });

  const filteredRooms = rooms.filter(r => {
    const matchesSearch =
      r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber || !name) return;

    const newRoom: Room = {
      id: `room-${roomNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`,
      roomNumber,
      name,
      type,
      capacity: Number(capacity) || 60,
      equipment: equipmentInput.split(',').map(s => s.trim()).filter(Boolean),
      permittedSessionTypes: sessionTypes,
      unavailableSlots: [],
      active: true,
    };

    onSaveRooms([...rooms, newRoom]);
    setIsAddingRoom(false);
    setRoomNumber('');
    setName('');
    setEquipmentInput('');
  };

  const handleToggleActive = (roomId: string) => {
    const updated = rooms.map(r => (r.id === roomId ? { ...r, active: !r.active } : r));
    onSaveRooms(updated);
  };

  const getRoomIcon = (rType: RoomType) => {
    switch (rType) {
      case 'Computer Lab':
        return Monitor;
      case 'Electronics Lab':
        return Cpu;
      case 'Mechanical Lab':
        return Wrench;
      default:
        return DoorOpen;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>Physical Infrastructure & Facilities</span>
            <span aria-hidden="true">•</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{rooms.length} Active Facilities</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Classrooms, Auditoriums & Specialized Labs
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Each room enforces strict capacity thresholds, session type compatibility, and hardware requirements.
          </p>
        </div>

        <button
          onClick={() => setIsAddingRoom(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Room/Lab</span>
        </button>
      </div>

      {/* Add Room Drawer */}
      {isAddingRoom && (
        <form onSubmit={handleAddRoom} className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 shadow-md p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Add Campus Facility</h3>
            <button
              type="button"
              onClick={() => setIsAddingRoom(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Room / Lab Number</label>
              <input
                type="text"
                required
                placeholder="LAB-105"
                value={roomNumber}
                onChange={e => setRoomNumber(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Facility Name</label>
              <input
                type="text"
                required
                placeholder="Artificial Intelligence & Neural Compute Lab"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Seating Capacity</label>
              <input
                type="number"
                min={15}
                max={300}
                required
                value={capacity}
                onChange={e => setCapacity(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Facility Category</label>
              <select
                value={type}
                onChange={e => {
                  const val = e.target.value as RoomType;
                  setType(val);
                  if (val.includes('Lab')) {
                    setSessionTypes(['Practical']);
                  } else {
                    setSessionTypes(['Theory']);
                  }
                }}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              >
                {roomTypes.map(rt => (
                  <option key={rt} value={rt}>{rt}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Equipment & Hardware (Comma separated)
              </label>
              <input
                type="text"
                placeholder="GPU RTX 4090, 32 Workstations, Gigabit Switch"
                value={equipmentInput}
                onChange={e => setEquipmentInput(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddingRoom(false)}
              className="px-3.5 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              Save Facility
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#BCE5D1] shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#10B981] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by room number, name, or hardware..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-[#F8FCF9] border border-[#BCE5D1] rounded-xl text-[#133E35] placeholder-[#2D6A4F]/60 font-semibold focus:outline-none focus:ring-2 focus:ring-[#10B981]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#10B981]" />
          <span className="text-xs text-[#133E35] font-bold">Type:</span>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-[#F8FCF9] border border-[#BCE5D1] rounded-xl font-bold text-[#133E35] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
          >
            <option value="ALL">All Facilities</option>
            {roomTypes.map(rt => (
              <option key={rt} value={rt}>{rt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map(room => {
          const Icon = getRoomIcon(room.type);
          const weeklyHours = roomHoursMap.get(room.id) || 0;
          const maxCapacityHours = 35;
          const utilizationPct = Math.round((weeklyHours / maxCapacityHours) * 100);

          return (
            <div
              key={room.id}
              className="bg-white/95 backdrop-blur-md border border-[#BCE5D1] hover:border-[#10B981] rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-[#E6FDF0] text-[#065F46] border border-[#A7F3D0]">
                      <Icon className="w-4 h-4 text-[#10B981]" />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-black text-[#133E35]">
                        {room.roomNumber}
                      </span>
                      <h3 className="text-sm font-bold text-[#133E35] leading-tight">
                        {room.name}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleActive(room.id)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                      room.active
                        ? 'bg-[#E6FDF0] text-[#065F46] border border-[#A7F3D0]'
                        : 'bg-red-50 text-red-600 border border-red-200'
                    }`}
                  >
                    {room.active ? 'Available' : 'Maintenance'}
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-[#2D6A4F]">
                  <span className="px-2 py-0.5 bg-[#E6FDF0] text-[#065F46] border border-[#A7F3D0] rounded-md font-bold text-[11px]">
                    {room.type}
                  </span>
                  <span>Capacity: <strong className="font-mono text-[#133E35] font-bold">{room.capacity}</strong> seats</span>
                </div>

                {room.equipment.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">
                      Equipped with:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {room.equipment.map((eq, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded"
                        >
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Weekly Utilization */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Utilization:</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                    {weeklyHours} hrs/week ({utilizationPct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, utilizationPct)}%` }}
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => onViewRoomTimetable(room.id)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
                  >
                    <span>View Room Schedule</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
