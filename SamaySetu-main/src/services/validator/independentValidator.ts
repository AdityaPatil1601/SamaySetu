import {
  ScheduleAssignment,
  RequiredSession,
  Faculty,
  Room,
  Division,
  Subject,
  CollegeSettings,
  ValidationResult,
  ValidationIssue,
  DayOfWeek,
} from '../../types';

export function runIndependentValidation(
  assignments: ScheduleAssignment[],
  requiredSessions: RequiredSession[],
  facultyList: Faculty[],
  roomList: Room[],
  divisionList: Division[],
  subjectList: Subject[],
  settings: CollegeSettings
): ValidationResult {
  const issues: ValidationIssue[] = [];

  const facultyMap = new Map(facultyList.map(f => [f.id, f]));
  const roomMap = new Map(roomList.map(r => [r.id, r]));
  const divisionMap = new Map(divisionList.map(d => [d.id, d]));
  const subjectMap = new Map(subjectList.map(s => [s.id, s]));

  // 1. Check for unassigned required sessions
  const scheduledReqIds = new Set(assignments.map(a => a.requiredSessionId));
  for (const req of requiredSessions) {
    if (!scheduledReqIds.has(req.id)) {
      issues.push({
        id: `unassigned-${req.id}`,
        severity: 'CRITICAL',
        category: 'UNASSIGNED_SESSION',
        title: `Unscheduled Session: ${req.subjectCode} (${req.sessionType})`,
        explanation: `Required session "${req.subjectName}" for division ${divisionMap.get(req.divisionId)?.name || req.divisionId} ${req.batchName ? `Batch ${req.batchName}` : ''} could not be placed in any conflict-free time slot.`,
        suggestedAction: 'Increase room/faculty availability or loosen slot constraints.',
        affectedSessionIds: [req.id],
        affectedDivisionId: req.divisionId,
        affectedDivisionName: divisionMap.get(req.divisionId)?.name,
      });
    }
  }

  // 2. Expand assignments into occupied slot intervals
  interface OccupiedSlot {
    assignment: ScheduleAssignment;
    day: DayOfWeek;
    slotIndex: number;
  }

  const occupiedSlots: OccupiedSlot[] = [];
  for (const a of assignments) {
    for (let offset = 0; offset < a.durationSlots; offset++) {
      occupiedSlots.push({
        assignment: a,
        day: a.day,
        slotIndex: a.startSlotIndex + offset,
      });
    }
  }

  // 3. HARD CONSTRAINT 1: No overlapping sessions for the same faculty member
  const facultySlotMap = new Map<string, OccupiedSlot[]>();
  for (const occ of occupiedSlots) {
    const key = `${occ.assignment.facultyId}|${occ.day}|${occ.slotIndex}`;
    const list = facultySlotMap.get(key) || [];
    list.push(occ);
    facultySlotMap.set(key, list);
  }

  facultySlotMap.forEach((slots, key) => {
    if (slots.length > 1) {
      const [facId, day, slotIdx] = key.split('|');
      const faculty = facultyMap.get(facId);
      const slotLabel = settings.slots[parseInt(slotIdx)]?.label || `Slot ${slotIdx}`;
      const sessionTitles = slots.map(s => `${s.assignment.subjectCode} (${s.assignment.divisionName})`).join(' AND ');
      issues.push({
        id: `fac-double-${key}`,
        severity: 'CRITICAL',
        category: 'FACULTY_DOUBLE_BOOKING',
        title: `Faculty Double-Booking: ${faculty?.name || facId}`,
        explanation: `${faculty?.name || facId} is assigned to multiple overlapping sessions on ${day} during ${slotLabel}: ${sessionTitles}.`,
        suggestedAction: 'Move one session to a different slot or assign another qualified faculty member.',
        affectedSessionIds: slots.map(s => s.assignment.id),
        affectedFacultyId: facId,
        affectedFacultyName: faculty?.name,
        day: day as DayOfWeek,
        slotLabel,
      });
    }
  });

  // 4. HARD CONSTRAINT 2: No overlapping sessions in the same room
  const roomSlotMap = new Map<string, OccupiedSlot[]>();
  for (const occ of occupiedSlots) {
    const key = `${occ.assignment.roomId}|${occ.day}|${occ.slotIndex}`;
    const list = roomSlotMap.get(key) || [];
    list.push(occ);
    roomSlotMap.set(key, list);
  }

  roomSlotMap.forEach((slots, key) => {
    if (slots.length > 1) {
      const [roomId, day, slotIdx] = key.split('|');
      const room = roomMap.get(roomId);
      const slotLabel = settings.slots[parseInt(slotIdx)]?.label || `Slot ${slotIdx}`;
      const sessionTitles = slots.map(s => `${s.assignment.subjectCode} (${s.assignment.divisionName})`).join(' AND ');
      issues.push({
        id: `room-double-${key}`,
        severity: 'CRITICAL',
        category: 'ROOM_DOUBLE_BOOKING',
        title: `Room Double-Booking: ${room?.roomNumber || roomId}`,
        explanation: `Room "${room?.roomNumber} - ${room?.name}" is booked for multiple sessions simultaneously on ${day} at ${slotLabel}: ${sessionTitles}.`,
        suggestedAction: 'Reassign one session to another available room with matching capacity and type.',
        affectedSessionIds: slots.map(s => s.assignment.id),
        affectedRoomId: roomId,
        affectedRoomNumber: room?.roomNumber,
        day: day as DayOfWeek,
        slotLabel,
      });
    }
  });

  // 5. HARD CONSTRAINT 3: No overlapping sessions for the same division or practical batch
  const divSlotMap = new Map<string, OccupiedSlot[]>();
  for (const occ of occupiedSlots) {
    const divId = occ.assignment.divisionId;
    const batchId = occ.assignment.batchId;
    if (batchId) {
      const batchKey = `batch|${batchId}|${occ.day}|${occ.slotIndex}`;
      const list = divSlotMap.get(batchKey) || [];
      list.push(occ);
      divSlotMap.set(batchKey, list);
    } else {
      const divKey = `div|${divId}|${occ.day}|${occ.slotIndex}`;
      const list = divSlotMap.get(divKey) || [];
      list.push(occ);
      divSlotMap.set(divKey, list);
    }
  }

  // Cross-check: full division lectures cannot happen while any batch of that division is in a practical
  const fullDivSlots = occupiedSlots.filter(s => !s.assignment.batchId);
  const batchSlots = occupiedSlots.filter(s => !!s.assignment.batchId);

  for (const full of fullDivSlots) {
    const conflictingBatches = batchSlots.filter(
      b => b.assignment.divisionId === full.assignment.divisionId &&
           b.day === full.day &&
           b.slotIndex === full.slotIndex
    );
    if (conflictingBatches.length > 0) {
      const slotLabel = settings.slots[full.slotIndex]?.label || `Slot ${full.slotIndex}`;
      issues.push({
        id: `div-batch-conflict-${full.assignment.id}-${full.day}-${full.slotIndex}`,
        severity: 'CRITICAL',
        category: 'DIVISION_DOUBLE_BOOKING',
        title: `Division vs Batch Conflict: ${full.assignment.divisionName}`,
        explanation: `Full-division lecture "${full.assignment.subjectName}" is scheduled at the same time (${full.day} ${slotLabel}) as batch practical "${conflictingBatches[0].assignment.subjectName}".`,
        suggestedAction: 'Reschedule either the theory lecture or the batch practical to a different time.',
        affectedSessionIds: [full.assignment.id, conflictingBatches[0].assignment.id],
        affectedDivisionId: full.assignment.divisionId,
        affectedDivisionName: full.assignment.divisionName,
        day: full.day,
        slotLabel,
      });
    }
  }

  divSlotMap.forEach((slots, key) => {
    if (slots.length > 1) {
      const [, , day, slotIdx] = key.split('|');
      const slotLabel = settings.slots[parseInt(slotIdx)]?.label || `Slot ${slotIdx}`;
      issues.push({
        id: `div-overlap-${key}`,
        severity: 'CRITICAL',
        category: 'DIVISION_DOUBLE_BOOKING',
        title: `Student Group Overlap: ${slots[0].assignment.divisionName}`,
        explanation: `Students in ${slots[0].assignment.divisionName} are scheduled for overlapping sessions on ${day} at ${slotLabel}.`,
        suggestedAction: 'Ensure parallel sessions only occur for distinct practical batches.',
        affectedSessionIds: slots.map(s => s.assignment.id),
        day: day as DayOfWeek,
        slotLabel,
      });
    }
  });

  // 6. Faculty qualifications & availability
  for (const a of assignments) {
    const faculty = facultyMap.get(a.facultyId);
    if (!faculty) continue;

    const subject = subjectMap.get(a.subjectId);
    if (subject && !faculty.qualifiedSubjectCodes.includes(subject.code)) {
      issues.push({
        id: `fac-ineligible-${a.id}`,
        severity: 'CRITICAL',
        category: 'FACULTY_INELIGIBLE',
        title: `Unqualified Faculty: ${faculty.name}`,
        explanation: `${faculty.name} is not certified to teach ${subject.code} (${subject.name}).`,
        suggestedAction: `Reassign to one of the qualified faculty: ${subject.eligibleFacultyIds.map(fid => facultyMap.get(fid)?.name || fid).join(', ')}.`,
        affectedSessionIds: [a.id],
        affectedFacultyId: faculty.id,
        affectedFacultyName: faculty.name,
      });
    }

    if (!faculty.availableDays.includes(a.day)) {
      issues.push({
        id: `fac-unavail-day-${a.id}`,
        severity: 'CRITICAL',
        category: 'FACULTY_UNAVAILABLE',
        title: `Faculty Day Unavailable: ${faculty.name}`,
        explanation: `${faculty.name} does not work on ${a.day}, but is assigned ${a.subjectCode}.`,
        suggestedAction: `Reschedule ${a.subjectCode} to one of their working days (${faculty.availableDays.join(', ')}).`,
        affectedSessionIds: [a.id],
        affectedFacultyId: faculty.id,
        affectedFacultyName: faculty.name,
        day: a.day,
      });
    }
  }

  // 7. Room lab compatibility & capacity
  for (const a of assignments) {
    const room = roomMap.get(a.roomId);
    if (!room) continue;

    const subject = subjectMap.get(a.subjectId);
    if (a.sessionType === 'Practical') {
      if (subject && subject.requiredRoomType && room.type !== subject.requiredRoomType) {
        issues.push({
          id: `room-type-incompat-${a.id}`,
          severity: 'CRITICAL',
          category: 'LAB_INCOMPATIBLE',
          title: `Laboratory Incompatibility: ${room.roomNumber}`,
          explanation: `Practical session "${a.subjectName}" requires a "${subject.requiredRoomType}", but is assigned to "${room.type}" (${room.roomNumber}).`,
          suggestedAction: `Reassign to an eligible ${subject.requiredRoomType}.`,
          affectedSessionIds: [a.id],
          affectedRoomId: room.id,
          affectedRoomNumber: room.roomNumber,
        });
      }
    }
  }

  // 8. Weekly Faculty Workload Check
  const facultyHoursMap = new Map<string, number>();
  for (const a of assignments) {
    const current = facultyHoursMap.get(a.facultyId) || 0;
    facultyHoursMap.set(a.facultyId, current + a.durationSlots);
  }

  facultyHoursMap.forEach((hours, facId) => {
    const faculty = facultyMap.get(facId);
    if (faculty && hours > faculty.maxWeeklyHours) {
      issues.push({
        id: `fac-overload-${facId}`,
        severity: 'WARNING',
        category: 'FACULTY_OVERWORKED',
        title: `Faculty Workload Exceeded: ${faculty.name}`,
        explanation: `${faculty.name} is scheduled for ${hours} hours/week, which exceeds their agreed maximum limit of ${faculty.maxWeeklyHours} hours.`,
        suggestedAction: 'Distribute some sessions to co-faculty or teaching assistants.',
        affectedSessionIds: [],
        affectedFacultyId: facId,
        affectedFacultyName: faculty.name,
      });
    }
  });

  const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
  const warningCount = issues.filter(i => i.severity === 'WARNING').length;

  return {
    isValid: criticalCount === 0,
    canPublish: criticalCount === 0 && scheduledReqIds.size === requiredSessions.length,
    criticalCount,
    warningCount,
    issues,
    checkedAt: new Date().toISOString(),
  };
}
