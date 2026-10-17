import React, { useState, useMemo } from 'react';
import {
  CalendarPlus,
  Clock,
  DoorOpen,
  Users,
  AlertCircle,
  CheckCircle2,
  Calendar,
  BookOpen,
  ArrowRight,
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
  // Step 1: Subjects taught by this professor (or where eligible)
  const mySubjects = useMemo(() => {
    return subjects.filter(
      s =>
        s.eligibleFacultyIds.includes(currentFaculty.id) ||
        currentFaculty.qualifiedSubjectCodes.includes(s.code)
    );
  }, [subjects, currentFaculty]);

  // Step 2: Classes (divisions) that this professor teaches
  const eligibleDivisions = useMemo(() => {
    const divIdSet = new Set<string>();
    mySubjects.forEach(s => {
      s.divisionIds.forEach(id => divIdSet.add(id));
      if (s.sharedDivisionIds) {
        s.sharedDivisionIds.forEach(id => divIdSet.add(id));
      }
    });

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

  React.useEffect(() => {
    if (eligibleDivisions.length > 0 && !eligibleDivisions.some(d => d.id === selectedDivisionId)) {
      setSelectedDivisionId(eligibleDivisions[0].id);
    }
  }, [eligibleDivisions, selectedDivisionId]);

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

  const [sessionType, setSessionType] = useState<'Theory' | 'Practical'>('Theory');
  const [reason, setReason] = useState<string>('Compensatory Lecture for missed session');

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

  const workingDays = settings.workingDays;
  const timeSlots = settings.slots.filter(s => !s.isBreak);

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

    if (classAsg && profAsg) {
      return {
        type: 'both_busy',
        classAssignment: classAsg,
        profAssignment: profAsg,
        label: 'Both Occupied',
        description: `Class has ${classAsg.subjectCode}; You are in ${profAsg.divisionName}`,
      };
    }

    if (classAsg) {
      return {
        type: 'class_busy',
        classAssignment: classAsg,
        label: `${classAsg.subjectCode} (${classAsg.sessionType})`,
        description: `Taught by ${classAsg.facultyName} in ${classAsg.roomNumber}`,
      };
    }

    if (profAsg) {
      return {
        type: 'prof_busy',
        profAssignment: profAsg,
        label: "You're Unavailable",
        description: `You have ${profAsg.subjectCode} in ${profAsg.divisionName} (${profAsg.roomNumber})`,
      };
    }

    if (roomAsg) {
      return {
        type: 'room_busy',
        roomAssignment: roomAsg,
        label: 'Room Occupied',
        description: `Room booked for ${roomAsg.divisionName} (${roomAsg.subjectCode})`,
      };
    }

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
      content: `Notice for ${selectedDivision.name}: ${currentFaculty.name} has scheduled a compensatory ${sessionType.toLowerCase()} session on ${selectedSlot.day} during period ${slotConfig.label} in ${roomObj.roomNumber} (${roomObj.name}). Reason: ${reason}. Please attend promptly.`,
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
      subtitle="Select a class you teach, inspect conflict evaluation, and confirm a verified free slot."
      maxWidth="5xl"
    >
      <div className="p-5 sm:p-6 space-y-6 text-[#22252A]">
        {/* Step 1: Controls Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-[#F6F1E8] border border-[#E2D5B8]">
          {/* Target Class Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#244B3B] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>1. Target Class</span>
            </label>
            <select
              value={selectedDivisionId}
              onChange={e => {
                setSelectedDivisionId(e.target.value);
                setSelectedSlot(null);
              }}
              className="w-full text-xs font-semibold px-3 py-2 bg-white border border-[#D8CEBA] rounded-lg text-[#22252A] focus:outline-none focus:ring-2 focus:ring-[#244B3B]"
            >
              {eligibleDivisions.map(d => (
                <option key={d.id} value={d.id}>
                  {d.academicYear} - {d.name} ({d.studentCount} Students)
                </option>
              ))}
            </select>
          </div>

          {/* Subject Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#244B3B] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>2. Subject</span>
            </label>
            <select
              value={selectedSubjectId}
              onChange={e => {
                setSelectedSubjectId(e.target.value);
                setSelectedSlot(null);
              }}
              className="w-full text-xs font-semibold px-3 py-2 bg-white border border-[#D8CEBA] rounded-lg text-[#22252A] focus:outline-none focus:ring-2 focus:ring-[#244B3B]"
            >
              {subjectsForClass.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Format */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#244B3B] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>3. Format</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-white border border-[#D8CEBA] rounded-lg">
              <button
                type="button"
                onClick={() => setSessionType('Theory')}
                className={`py-1 text-xs rounded-md transition-all ${
                  sessionType === 'Theory'
                    ? 'bg-[#244B3B] text-white font-bold shadow-xs'
                    : 'text-[#535965] hover:text-[#22252A]'
                }`}
              >
                Theory (1 hr)
              </button>
              <button
                type="button"
                onClick={() => setSessionType('Practical')}
                className={`py-1 text-xs rounded-md transition-all ${
                  sessionType === 'Practical'
                    ? 'bg-[#244B3B] text-white font-bold shadow-xs'
                    : 'text-[#535965] hover:text-[#22252A]'
                }`}
              >
                Practical (2 hr)
              </button>
            </div>
          </div>

          {/* Room Allocation */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#244B3B] flex items-center gap-1.5">
              <DoorOpen className="w-3.5 h-3.5" />
              <span>4. Classroom / Lab</span>
            </label>
            <select
              value={selectedRoomId}
              onChange={e => setSelectedRoomId(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-white border border-[#D8CEBA] rounded-lg text-[#22252A] focus:outline-none focus:ring-2 focus:ring-[#244B3B]"
            >
              {permittedRooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.roomNumber} - {r.name} ({r.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reason / Notes */}
        <div className="flex items-center gap-3 px-3 py-2 bg-[#F6F1E8] border border-[#E2D5B8] rounded-xl">
          <Info className="w-4 h-4 text-[#244B3B] shrink-0" />
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs font-bold text-[#244B3B] whitespace-nowrap">
              Reason for scheduling:
            </span>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Compensating for missed lecture due to department event"
              className="flex-1 text-xs px-2.5 py-1 bg-white border border-[#D8CEBA] rounded-md text-[#22252A] focus:outline-none focus:ring-1 focus:ring-[#244B3B]"
            />
          </div>
        </div>

        {/* Step 2: Interactive Matrix */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-[#E2D5B8]">
            <div>
              <h4 className="text-sm font-bold text-[#22252A] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#244B3B]" />
                <span>
                  {selectedDivision?.academicYear} {selectedDivision?.name} Timetable vs. Your Availability
                </span>
              </h4>
              <p className="text-xs text-[#535965]">
                Green cells indicate free slots where neither the students nor you have conflicting sessions.
              </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EDF3F0] text-[#244B3B] border border-[#244B3B]/30">
                <span className="w-2 h-2 rounded-full bg-[#244B3B]"></span>
                Available Slot
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FDF3EF] text-[#C66A4A] border border-[#C66A4A]/30">
                <span className="w-2 h-2 rounded-full bg-[#C66A4A]"></span>
                You're Unavailable
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F6F1E8] text-[#535965] border border-[#E2D5B8]">
                <span className="w-2 h-2 rounded-full bg-[#D8CEBA]"></span>
                Class Has Lecture
              </span>
            </div>
          </div>

          {/* Table Grid */}
          <div className="overflow-x-auto rounded-xl border border-[#E2D5B8] shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F6F1E8] text-[#22252A] border-b border-[#E2D5B8]">
                  <th className="p-2.5 font-bold text-center w-24">Day</th>
                  {timeSlots.map(slot => (
                    <th key={slot.slotIndex} className="p-2.5 font-semibold text-center border-l border-[#E2D5B8] min-w-[130px]">
                      <div className="font-bold text-[#22252A]">P{slot.slotIndex + 1}</div>
                      <div className="text-[10px] font-mono text-[#535965]">{slot.label}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workingDays.map(day => (
                  <tr key={day} className="border-b border-[#E2D5B8] hover:bg-[#F6F1E8]/40 transition-colors">
                    <td className="p-2.5 font-bold text-[#22252A] bg-[#F6F1E8]/70 text-center">
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
                            className={`p-2 border-l border-[#E2D5B8] text-center cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#244B3B] text-white font-bold ring-2 ring-[#244B3B]'
                                : 'bg-[#EDF3F0] hover:bg-[#244B3B]/20 text-[#244B3B]'
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
                                  <span className="font-bold text-[11px] text-[#244B3B]">
                                    Click to Book
                                  </span>
                                  <span className="text-[9px] text-[#244B3B]/80 font-medium">
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
                            className="p-2 border-l border-[#E2D5B8] bg-[#FDF3EF] text-[#C66A4A]"
                          >
                            <div className="flex flex-col items-center text-center">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#C66A4A] text-white mb-0.5">
                                You're Unavailable
                              </span>
                              <span className="text-[10px] text-[#A95437] truncate max-w-[120px] font-semibold">
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
                            className="p-2 border-l border-[#E2D5B8] bg-[#F6F1E8] text-[#535965]"
                          >
                            <div className="flex flex-col items-center text-center">
                              <span className="text-[10px] font-bold text-[#22252A]">
                                Both Occupied
                              </span>
                              <span className="text-[9px] text-[#535965]">
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
                            className="p-2 border-l border-[#E2D5B8] bg-[#FDF3EF] text-[#C66A4A]"
                          >
                            <div className="flex flex-col items-center text-center">
                              <span className="text-[10px] font-bold">Room Booked</span>
                              <span className="text-[9px] text-[#A95437]">{evalResult.roomAssignment?.divisionName}</span>
                            </div>
                          </td>
                        );
                      }

                      // Default class_busy
                      return (
                        <td
                          key={slot.slotIndex}
                          title={evalResult.description}
                          className="p-2 border-l border-[#E2D5B8] bg-white text-[#22252A]"
                        >
                          <div className="flex flex-col items-center text-center">
                            <span className="font-semibold text-[11px] truncate max-w-[120px]">
                              {evalResult.label}
                            </span>
                            <span className="text-[9px] text-[#535965] truncate max-w-[120px]">
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

        {/* Selected Slot Summary Card */}
        {selectedSlot ? (
          <div className="p-4 rounded-xl bg-[#EDF3F0] border border-[#244B3B]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#244B3B]">
                  Confirmed Selection:
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#244B3B] text-white">
                  {selectedSlot.day} · Period {selectedSlot.slotIndex + 1}
                </span>
              </div>
              <p className="text-xs text-[#22252A]">
                <strong>{selectedSubject.code} ({selectedSubject.name})</strong> for <strong>{selectedDivision?.name}</strong> in Room <strong>{rooms.find(r => r.id === selectedRoomId)?.roomNumber}</strong>.
              </p>
              <p className="text-[11px] text-[#535965]">
                An official notice will be broadcasted to all {selectedDivision?.studentCount} students in this class.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-[#D8CEBA] text-[#535965] hover:bg-white transition-colors"
              >
                Change Slot
              </button>
              <button
                type="button"
                onClick={handleConfirmSchedule}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-[#244B3B] hover:bg-[#1A372B] text-white shadow-xs transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#E2D5B8]" />
                <span>Confirm & Publish Lecture</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg border border-dashed border-[#D8CEBA] text-center text-xs text-[#535965]">
            Click on any green <span className="font-bold text-[#244B3B]">"Available Slot"</span> in the matrix to book your session.
          </div>
        )}
      </div>
    </Modal>
  );
};
