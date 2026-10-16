import React, { useState, useMemo } from 'react';
import {
  CalendarPlus,
  Clock,
  DoorOpen,
  Users,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { Modal } from './Modal';
import {
  Faculty,
  Division,
  Room,
  Subject,
  CollegeSettings,
  ScheduleAssignment,
  ScheduleVersion,
  DayOfWeek,
  Announcement,
} from '../../types';

interface ScheduleClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFaculty: Faculty;
  activeVersion: ScheduleVersion | null;
  divisions: Division[];
  subjects: Subject[];
  rooms: Room[];
  settings: CollegeSettings;
  onScheduleConfirmed: (
    newAssignment: ScheduleAssignment,
    newAnnouncement: Announcement
  ) => void;
}

export const ScheduleClassModal: React.FC<ScheduleClassModalProps> = ({
  isOpen,
  onClose,
  currentFaculty,
  activeVersion,
  divisions,
  subjects,
  rooms,
  settings,
  onScheduleConfirmed,
}) => {
  // Step 1: Find all subjects taught by this professor (or where eligible)
  const mySubjects = useMemo(() => {
    return subjects.filter(
      s =>
        s.eligibleFacultyIds.includes(currentFaculty.id) ||
        currentFaculty.qualifiedSubjectCodes.includes(s.code)
    );
  }, [subjects, currentFaculty]);

  // Step 2: Find all classes (divisions) that this professor teaches
  const eligibleDivisions = useMemo(() => {
    // Divisions from subjects taught by faculty
    const divIdSet = new Set<string>();
    mySubjects.forEach(s => {
      s.divisionIds.forEach(id => divIdSet.add(id));
      if (s.sharedDivisionIds) {
        s.sharedDivisionIds.forEach(id => divIdSet.add(id));
      }
    });

    // Also include any assignments already in activeVersion for this faculty
    if (activeVersion) {
      activeVersion.assignments
        .filter(a => a.facultyId === currentFaculty.id)
        .forEach(a => divIdSet.add(a.divisionId));
    }

    const list = divisions.filter(d => divIdSet.has(d.id));
    return list.length > 0 ? list : divisions.slice(0, 3);
  }, [mySubjects, activeVersion, currentFaculty.id, divisions]);

  // Selected Division state
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>(() => {
    return eligibleDivisions[0]?.id || divisions[0]?.id || '';
  });

  // Keep selected division updated if eligibleDivisions changes
  React.useEffect(() => {
    if (eligibleDivisions.length > 0 && !eligibleDivisions.some(d => d.id === selectedDivisionId)) {
      setSelectedDivisionId(eligibleDivisions[0].id);
    }
  }, [eligibleDivisions, selectedDivisionId]);

  // Selected class division object
  const selectedDivision = useMemo(() => {
    return divisions.find(d => d.id === selectedDivisionId) || eligibleDivisions[0] || divisions[0];
  }, [divisions, eligibleDivisions, selectedDivisionId]);

  // Subjects applicable to the selected division
  const subjectsForClass = useMemo(() => {
    const list = mySubjects.filter(s =>
      s.divisionIds.includes(selectedDivision?.id || '')
    );
    return list.length > 0 ? list : mySubjects.length > 0 ? mySubjects : subjects.slice(0, 2);
  }, [mySubjects, selectedDivision, subjects]);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  React.useEffect(() => {
    if (subjectsForClass.length > 0 && (!selectedSubjectId || !subjectsForClass.some(s => s.id === selectedSubjectId))) {
      setSelectedSubjectId(subjectsForClass[0].id);
    }
  }, [subjectsForClass, selectedSubjectId]);

  const selectedSubject = useMemo(() => {
    return subjects.find(s => s.id === selectedSubjectId) || subjectsForClass[0] || subjects[0];
  }, [subjects, subjectsForClass, selectedSubjectId]);

  // Session type: Theory or Practical
  const [sessionType, setSessionType] = useState<'Theory' | 'Practical'>('Theory');
  const [reason, setReason] = useState<string>('Compensatory Lecture for missed session');

  // Room selection: default to first available permitted room
  const permittedRooms = useMemo(() => {
    if (selectedSubject?.permittedRoomIds?.length) {
      const filtered = rooms.filter(r => selectedSubject.permittedRoomIds.includes(r.id));
      if (filtered.length > 0) return filtered;
    }
    return rooms.filter(r => (sessionType === 'Practical' ? r.type.includes('Lab') : r.type === 'Classroom'));
  }, [rooms, selectedSubject, sessionType]);

  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  React.useEffect(() => {
    if (permittedRooms.length > 0 && (!selectedRoomId || !permittedRooms.some(r => r.id === selectedRoomId))) {
      setSelectedRoomId(permittedRooms[0].id);
    }
  }, [permittedRooms, selectedRoomId]);

  // Selected slot coordinates: { day: DayOfWeek, slotIndex: number } | null
  const [selectedSlot, setSelectedSlot] = useState<{ day: DayOfWeek; slotIndex: number } | null>(null);

  // Timetable Analysis for the chosen class
  const classAssignments = useMemo(() => {
    if (!activeVersion || !selectedDivision) return [];
    return activeVersion.assignments.filter(a => a.divisionId === selectedDivision.id);
  }, [activeVersion, selectedDivision]);

  // Timetable Analysis for current faculty
  const facultyAssignments = useMemo(() => {
    if (!activeVersion) return [];
    return activeVersion.assignments.filter(a => a.facultyId === currentFaculty.id);
  }, [activeVersion, currentFaculty.id]);

  // Room busy map
  const roomAssignments = useMemo(() => {
    if (!activeVersion || !selectedRoomId) return [];
    return activeVersion.assignments.filter(a => a.roomId === selectedRoomId);
  }, [activeVersion, selectedRoomId]);

  // Slots calculation
  const workingDays = settings.workingDays;
  const timeSlots = settings.slots.filter(s => !s.isBreak);

  // Helper to determine slot status for the grid
  interface SlotEvaluation {
    type: 'available' | 'prof_busy' | 'class_busy' | 'both_busy' | 'room_busy';
    classAssignment?: ScheduleAssignment;
    profAssignment?: ScheduleAssignment;
    roomAssignment?: ScheduleAssignment;
    label: string;
    description: string;
  }

  const evaluateSlot = (day: DayOfWeek, slotIndex: number): SlotEvaluation => {
    const classAsg = classAssignments.find(
      a => a.day === day && slotIndex >= a.startSlotIndex && slotIndex < a.startSlotIndex + a.durationSlots
    );
    const profAsg = facultyAssignments.find(
      a => a.day === day && slotIndex >= a.startSlotIndex && slotIndex < a.startSlotIndex + a.durationSlots
    );
    const roomAsg = roomAssignments.find(
      a => a.day === day && slotIndex >= a.startSlotIndex && slotIndex < a.startSlotIndex + a.durationSlots
    );

    // If both class and professor are busy
    if (classAsg && profAsg) {
      return {
        type: 'both_busy',
        classAssignment: classAsg,
        profAssignment: profAsg,
        label: 'Both Occupied',
        description: `Class has ${classAsg.subjectCode}; You are in ${profAsg.divisionName}`,
      };
    }

    // If class has a lecture scheduled
    if (classAsg) {
      return {
        type: 'class_busy',
        classAssignment: classAsg,
        label: `${classAsg.subjectCode} (${classAsg.sessionType})`,
        description: `Taught by ${classAsg.facultyName} in ${classAsg.roomNumber}`,
      };
    }

    // If class is free, but professor has another lecture elsewhere
    if (profAsg) {
      return {
        type: 'prof_busy',
        profAssignment: profAsg,
        label: 'You are Unavailable',
        description: `You have ${profAsg.subjectCode} in ${profAsg.divisionName} (${profAsg.roomNumber})`,
      };
    }

    // If room is busy at this slot
    if (roomAsg) {
      return {
        type: 'room_busy',
        roomAssignment: roomAsg,
        label: 'Room Occupied',
        description: `Room booked for ${roomAsg.divisionName} (${roomAsg.subjectCode})`,
      };
    }

    // Free and eligible!
    return {
      type: 'available',
      label: 'Open & Available',
      description: 'Both students and you are free! Click to schedule here.',
    };
  };

  const handleConfirmSchedule = () => {
    if (!selectedSlot) return;
    const roomObj = rooms.find(r => r.id === selectedRoomId) || permittedRooms[0] || rooms[0];
    const slotConfig = timeSlots.find(s => s.slotIndex === selectedSlot.slotIndex) || timeSlots[0];

    const newAssignmentId = `sched-extra-${Date.now()}`;
    const newAssignment: ScheduleAssignment = {
      id: newAssignmentId,
      requiredSessionId: `req-extra-${Date.now()}`,
      subjectId: selectedSubject.id,
      subjectCode: selectedSubject.code,
      subjectName: selectedSubject.name,
      sessionType: sessionType,
      branchId: selectedDivision.branchId,
      academicYear: selectedDivision.academicYear,
      divisionId: selectedDivision.id,
      divisionName: selectedDivision.name,
      participatingDivisionIds: [selectedDivision.id],
      facultyId: currentFaculty.id,
      facultyName: currentFaculty.name,
      roomId: roomObj.id,
      roomNumber: roomObj.roomNumber,
      roomName: roomObj.name,
      day: selectedSlot.day,
      startSlotIndex: selectedSlot.slotIndex,
      durationSlots: sessionType === 'Practical' ? 2 : 1,
      timeRange: slotConfig.label,
    };

    const newAnnouncement: Announcement = {
      id: `ann-sched-${Date.now()}`,
      title: `Compensatory Lecture: ${selectedSubject.name} (${selectedSubject.code})`,
      content: `Notice for ${selectedDivision.name}: ${currentFaculty.name} has scheduled a ${sessionType.toLowerCase()} session on ${selectedSlot.day} during period ${slotConfig.label} in ${roomObj.roomNumber} (${roomObj.name}). Reason: ${reason}. Please attend promptly.`,
      authorName: currentFaculty.name,
      authorRole: 'teacher',
      targetAudience: 'class',
      divisionId: selectedDivision.id,
      createdAt: new Date().toISOString(),
      priority: 'important',
    };

    onScheduleConfirmed(newAssignment, newAnnouncement);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule a Compensatory Class"
      subtitle="Select your target class, inspect student & faculty time matrix, and book a verified conflict-free slot."
      maxWidth="5xl"
    >
      <div className="p-5 sm:p-6 space-y-6 text-slate-800 dark:text-slate-200">
        {/* Step 1: Class, Course, Type & Room Selector Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          {/* Target Class Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Target Class</span>
            </label>
            <select
              value={selectedDivisionId}
              onChange={e => {
                setSelectedDivisionId(e.target.value);
                setSelectedSlot(null);
              }}
              className="w-full text-xs font-semibold px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {eligibleDivisions.map(d => (
                <option key={d.id} value={d.id}>
                  {d.academicYear} - {d.name} ({d.studentCount} Students)
                </option>
              ))}
            </select>
          </div>

          {/* Subject / Course Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>2. Subject</span>
            </label>
            <select
              value={selectedSubjectId}
              onChange={e => {
                setSelectedSubjectId(e.target.value);
                setSelectedSlot(null);
              }}
              className="w-full text-xs font-semibold px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {subjectsForClass.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Session Type */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>3. Session Format</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg">
              <button
                type="button"
                onClick={() => setSessionType('Theory')}
                className={`py-1 text-xs font-medium rounded-md transition-all ${
                  sessionType === 'Theory'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Theory (1 hr)
              </button>
              <button
                type="button"
                onClick={() => setSessionType('Practical')}
                className={`py-1 text-xs font-medium rounded-md transition-all ${
                  sessionType === 'Practical'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Practical (2 hr)
              </button>
            </div>
          </div>

          {/* Room Allocation */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <DoorOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>4. Classroom / Lab</span>
            </label>
            <select
              value={selectedRoomId}
              onChange={e => setSelectedRoomId(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {permittedRooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.roomNumber} - {r.name} ({r.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reason / Notes Field */}
        <div className="flex items-center gap-3 px-3 py-2 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-xl">
          <Info className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs font-semibold text-blue-950 dark:text-blue-200 whitespace-nowrap">
              Reason for scheduling:
            </span>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Compensating for missed lecture due to department symposium"
              className="flex-1 text-xs px-2.5 py-1 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Step 2: Interactive Timetable Comparison Matrix */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>
                  Weekly Matrix for {selectedDivision?.academicYear} {selectedDivision?.name} vs. Your Availability
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Green slots indicate conflict-free time windows where both your schedule and the students' schedule are free.
              </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Available Slot
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                You're Unavailable
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                Class Has Lecture
              </span>
            </div>
          </div>

          {/* Timetable Table Grid */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-2.5 font-bold text-center w-24">Day</th>
                  {timeSlots.map(slot => (
                    <th key={slot.slotIndex} className="p-2.5 font-semibold text-center border-l border-slate-200 dark:border-slate-700 min-w-[130px]">
                      <div className="font-bold text-slate-900 dark:text-slate-100">P{slot.slotIndex + 1}</div>
                      <div className="text-[10px] font-mono text-slate-500">{slot.label}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workingDays.map(day => (
                  <tr key={day} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/40 text-center">
                      {day}
                    </td>
                    {timeSlots.map(slot => {
                      const evalResult = evaluateSlot(day, slot.slotIndex);
                      const isSelected = selectedSlot?.day === day && selectedSlot?.slotIndex === slot.slotIndex;

                      if (evalResult.type === 'available') {
                        return (
                          <td
                            key={slot.slotIndex}
                            onClick={() => setSelectedSlot({ day, slotIndex: slot.slotIndex })}
                            className={`p-2 border-l border-slate-100 dark:border-slate-800 text-center cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white ring-2 ring-blue-600 font-bold shadow-md'
                                : 'bg-emerald-50/60 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center py-1">
                              {isSelected ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mb-0.5 text-white" />
                                  <span className="text-[11px] font-bold">Selected Slot</span>
                                  <span className="text-[9px] opacity-90">{slot.label}</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mb-0.5" />
                                  <span className="font-bold text-[11px] text-emerald-800 dark:text-emerald-300">
                                    Click to Book
                                  </span>
                                  <span className="text-[9px] text-emerald-700/80 dark:text-emerald-400">
                                    Both Free
                                  </span>
                                </>
                              )}
                            </div>
                          </td>
                        );
                      }

                      if (evalResult.type === 'prof_busy') {
                        return (
                          <td
                            key={slot.slotIndex}
                            title={evalResult.description}
                            className="p-2 border-l border-slate-100 dark:border-slate-800 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 opacity-90"
                          >
                            <div className="flex flex-col items-center text-center">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200/80 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 mb-0.5">
                                You're Unavailable
                              </span>
                              <span className="text-[10px] text-amber-800 dark:text-amber-300 truncate max-w-[120px]">
                                {evalResult.profAssignment?.subjectCode} in {evalResult.profAssignment?.divisionName}
                              </span>
                            </div>
                          </td>
                        );
                      }

                      if (evalResult.type === 'both_busy') {
                        return (
                          <td
                            key={slot.slotIndex}
                            title={evalResult.description}
                            className="p-2 border-l border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400"
                          >
                            <div className="flex flex-col items-center text-center">
                              <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                                Both Occupied
                              </span>
                              <span className="text-[9px] text-slate-500">
                                {evalResult.classAssignment?.subjectCode}
                              </span>
                            </div>
                          </td>
                        );
                      }

                      if (evalResult.type === 'room_busy') {
                        return (
                          <td
                            key={slot.slotIndex}
                            title={evalResult.description}
                            className="p-2 border-l border-slate-100 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300"
                          >
                            <div className="flex flex-col items-center text-center">
                              <span className="text-[10px] font-semibold">Room Busy</span>
                              <span className="text-[9px] text-rose-700">{evalResult.roomAssignment?.divisionName}</span>
                            </div>
                          </td>
                        );
                      }

                      // Default class_busy
                      return (
                        <td
                          key={slot.slotIndex}
                          title={evalResult.description}
                          className="p-2 border-l border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                        >
                          <div className="flex flex-col items-center text-center">
                            <span className="font-semibold text-[11px] truncate max-w-[120px]">
                              {evalResult.label}
                            </span>
                            <span className="text-[9px] text-slate-500 truncate max-w-[120px]">
                              {evalResult.classAssignment?.roomNumber}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Slot Summary Card & Actions */}
        {selectedSlot ? (
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                  Confirmed Selection:
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                  {selectedSlot.day} · Period {selectedSlot.slotIndex + 1}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                <strong>{selectedSubject.code} ({selectedSubject.name})</strong> for <strong>{selectedDivision?.name}</strong> in Room <strong>{rooms.find(r => r.id === selectedRoomId)?.roomNumber}</strong>.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                A high-priority notice will automatically be broadcasted to all {selectedDivision?.studentCount} students in this class.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Change Slot
              </button>
              <button
                type="button"
                onClick={handleConfirmSchedule}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Publish Lecture</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
            Click on any green <span className="font-semibold text-emerald-700 dark:text-emerald-400">"Available Slot"</span> in the matrix above to select your preferred time.
          </div>
        )}
      </div>
    </Modal>
  );
};
