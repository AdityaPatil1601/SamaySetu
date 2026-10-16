import {
  ScheduleAssignment,
  CollegeSettings,
  Faculty,
  Room,
  Division,
  Subject,
  DayOfWeek,
  ImportConflictIssue,
} from '../../types';

export interface ParseResult {
  parsedAssignments: ScheduleAssignment[];
  issues: ImportConflictIssue[];
  totalRowsProcessed: number;
}

export function parseAndValidateTimetableCsv(
  csvText: string,
  existingAssignments: ScheduleAssignment[],
  settings: CollegeSettings,
  facultyList: Faculty[],
  roomList: Room[],
  divisionList: Division[],
  subjectList: Subject[]
): ParseResult {
  const issues: ImportConflictIssue[] = [];
  const parsedAssignments: ScheduleAssignment[] = [];

  const facultyByName = new Map(facultyList.map(f => [f.name.toLowerCase(), f]));
  const facultyByCode = new Map(facultyList.map(f => [f.employeeId.toLowerCase(), f]));
  const roomByNumber = new Map(roomList.map(r => [r.roomNumber.toLowerCase(), r]));
  const divByName = new Map(divisionList.map(d => [d.name.toLowerCase(), d]));
  const subjectByCode = new Map(subjectList.map(s => [s.code.toLowerCase(), s]));

  // Split lines
  const rawLines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let totalRows = 0;

  // Track occupancy for conflict detection within the sheet and against existing
  // Key: `${teacherId}|${day}|${slotIndex}`
  const teacherOccupancy = new Map<string, { row: number; assignmentId: string; subject: string; class: string }>();
  // Key: `${roomId}|${day}|${slotIndex}`
  const roomOccupancy = new Map<string, { row: number; assignmentId: string; subject: string }>();
  // Key: `${divisionId}|${day}|${slotIndex}`
  const classOccupancy = new Map<string, { row: number; assignmentId: string; subject: string }>();

  // Helper to split CSV row handling quotes
  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let insideQuotes = false;
    let current = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  // Find header row or process rows
  let startIndex = 0;
  for (let i = 0; i < Math.min(10, rawLines.length); i++) {
    const lower = rawLines[i].toLowerCase();
    if (lower.includes('day') && (lower.includes('subject') || lower.includes('period') || lower.includes('time'))) {
      startIndex = i + 1;
      break;
    }
  }

  for (let idx = startIndex; idx < rawLines.length; idx++) {
    const rowNum = idx + 1;
    const cols = parseRow(rawLines[idx]);
    if (cols.length < 5) continue; // Skip incomplete or footer rows

    totalRows++;

    // Expected standard columns:
    // [Day, Slot/Time, Branch, Year, Division, SubjectCode, Faculty, Room, Duration/Type]
    // Or flexible format:
    const day = (cols[0] || 'Monday') as DayOfWeek;
    const timeOrSlot = cols[1] || '09:00 - 10:00';
    const divName = cols[2] || cols[4] || 'Div A';
    const subjectCode = (cols[3] || cols[5] || '').toUpperCase();
    const facultyNameOrId = cols[4] || cols[6] || '';
    const roomNumber = cols[5] || cols[7] || '';

    // Validate Day
    if (!settings.workingDays.includes(day)) {
      issues.push({
        row: rowNum,
        day,
        timeRange: timeOrSlot,
        issueType: 'INVALID_DATA',
        details: `Invalid day "${day}". Must be one of: ${settings.workingDays.join(', ')}.`,
        recommendation: 'Fix day spelling or check college working days setting.',
      });
      continue;
    }

    // Match Faculty
    let matchedFaculty = facultyByName.get(facultyNameOrId.toLowerCase()) ||
                         facultyByCode.get(facultyNameOrId.toLowerCase());
    if (!matchedFaculty) {
      // Try partial match
      matchedFaculty = facultyList.find(f =>
        f.name.toLowerCase().includes(facultyNameOrId.toLowerCase()) ||
        facultyNameOrId.toLowerCase().includes(f.name.toLowerCase())
      );
    }

    // Match Room
    const matchedRoom = roomByNumber.get(roomNumber.toLowerCase()) ||
                        roomList.find(r => r.roomNumber.toLowerCase().includes(roomNumber.toLowerCase()));

    // Match Division
    const matchedDiv = divByName.get(divName.toLowerCase()) || divisionList[0];

    // Match Subject
    const matchedSubject = subjectByCode.get(subjectCode.toLowerCase()) || subjectList[0];

    // Determine slot index
    let slotIdx = 0;
    const matchedSlot = settings.slots.find(s =>
      timeOrSlot.includes(s.startTime) ||
      timeOrSlot.toLowerCase().includes(`slot ${s.slotIndex + 1}`) ||
      timeOrSlot.toLowerCase().includes(`period ${s.slotIndex + 1}`)
    );
    if (matchedSlot) {
      slotIdx = matchedSlot.slotIndex;
    }

    // Check 1: Teacher Double-Booking Clash
    if (matchedFaculty) {
      const teacherKey = `${matchedFaculty.id}|${day}|${slotIdx}`;
      const existing = teacherOccupancy.get(teacherKey);
      if (existing) {
        issues.push({
          row: rowNum,
          day,
          timeRange: timeOrSlot,
          issueType: 'TEACHER_DOUBLE_BOOKING',
          details: `Teacher ${matchedFaculty.name} is double-booked in Period ${slotIdx + 1} on ${day}. Already scheduled in Row ${existing.row} for ${existing.subject} (${existing.class}).`,
          recommendation: 'Assign a different period or qualified substitute teacher.',
        });
      } else {
        teacherOccupancy.set(teacherKey, {
          row: rowNum,
          assignmentId: `import-${rowNum}`,
          subject: subjectCode,
          class: divName,
        });
      }
    }

    // Check 2: Room Clash
    if (matchedRoom) {
      const roomKey = `${matchedRoom.id}|${day}|${slotIdx}`;
      const existing = roomOccupancy.get(roomKey);
      if (existing) {
        issues.push({
          row: rowNum,
          day,
          timeRange: timeOrSlot,
          issueType: 'ROOM_CLASH',
          details: `Room ${matchedRoom.roomNumber} has a collision in Period ${slotIdx + 1} on ${day}. Already booked by Row ${existing.row} for ${existing.subject}.`,
          recommendation: 'Select another available classroom or laboratory.',
        });
      } else {
        roomOccupancy.set(roomKey, {
          row: rowNum,
          assignmentId: `import-${rowNum}`,
          subject: subjectCode,
        });
      }
    }

    // Check 3: Class / Division Overlap Clash
    if (matchedDiv) {
      const classKey = `${matchedDiv.id}|${day}|${slotIdx}`;
      const existing = classOccupancy.get(classKey);
      if (existing) {
        issues.push({
          row: rowNum,
          day,
          timeRange: timeOrSlot,
          issueType: 'CLASS_OVERLAP',
          details: `Class ${matchedDiv.name} has two concurrent subjects in Period ${slotIdx + 1} on ${day}: "${existing.subject}" (Row ${existing.row}) and "${subjectCode}" (Row ${rowNum}).`,
          recommendation: 'Reschedule one subject to a free period for this division.',
        });
      } else {
        classOccupancy.set(classKey, {
          row: rowNum,
          assignmentId: `import-${rowNum}`,
          subject: subjectCode,
        });
      }
    }

    if (matchedFaculty && matchedRoom && matchedSubject && matchedDiv) {
      parsedAssignments.push({
        id: `asgn-imported-${Date.now()}-${rowNum}`,
        requiredSessionId: `req-imported-${rowNum}`,
        subjectId: matchedSubject.id,
        subjectCode: matchedSubject.code,
        subjectName: matchedSubject.name,
        sessionType: matchedSubject.requiredRoomType.includes('Lab') ? 'Practical' : 'Theory',
        branchId: matchedDiv.branchId,
        academicYear: matchedDiv.academicYear,
        divisionId: matchedDiv.id,
        divisionName: matchedDiv.name,
        participatingDivisionIds: [matchedDiv.id],
        facultyId: matchedFaculty.id,
        facultyName: matchedFaculty.name,
        roomId: matchedRoom.id,
        roomNumber: matchedRoom.roomNumber,
        roomName: matchedRoom.name,
        day,
        startSlotIndex: slotIdx,
        durationSlots: 1,
        timeRange: settings.slots[slotIdx]?.label || timeOrSlot,
      });
    }
  }

  return {
    parsedAssignments,
    issues,
    totalRowsProcessed: totalRows,
  };
}
