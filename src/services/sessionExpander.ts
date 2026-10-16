import {
  Subject,
  Division,
  StudentBatch,
  RequiredSession,
  Room,
} from '../types';

export function expandRequiredSessions(
  subjects: Subject[],
  divisions: Division[],
  batches: StudentBatch[],
  rooms: Room[]
): RequiredSession[] {
  const sessions: RequiredSession[] = [];
  const divisionMap = new Map(divisions.map(d => [d.id, d]));
  const batchesByDiv = new Map<string, StudentBatch[]>();

  batches.forEach(b => {
    const list = batchesByDiv.get(b.divisionId) || [];
    list.push(b);
    batchesByDiv.set(b.divisionId, list);
  });

  for (const subject of subjects) {
    const compatibleRooms = rooms.filter(r => {
      if (!r.active) return false;
      if (subject.permittedRoomIds.length > 0 && !subject.permittedRoomIds.includes(r.id)) {
        return false;
      }
      return true;
    });

    const activeDivisions = subject.divisionIds
      .map(id => divisionMap.get(id))
      .filter((d): d is Division => !!d && d.active);

    if (subject.isShared && subject.sharedDivisionIds && subject.sharedDivisionIds.length > 1) {
      const participatingDivs = subject.sharedDivisionIds
        .map(id => divisionMap.get(id))
        .filter((d): d is Division => !!d && d.active);
      const totalStudentCount = participatingDivs.reduce((sum, d) => sum + d.studentCount, 0);

      for (let i = 0; i < subject.theorySessionsPerWeek; i++) {
        sessions.push({
          id: `req-${subject.id}-shared-th-${i + 1}`,
          subjectId: subject.id,
          subjectCode: subject.code,
          subjectName: subject.name,
          sessionType: 'Theory',
          branchId: subject.branchId,
          academicYear: subject.academicYear,
          divisionId: participatingDivs[0]?.id || '',
          participatingDivisionIds: participatingDivs.map(d => d.id),
          durationSlots: 1,
          eligibleFacultyIds: subject.eligibleFacultyIds,
          permittedRoomIds: subject.permittedRoomIds.length > 0
            ? subject.permittedRoomIds
            : compatibleRooms.filter(r => r.type === 'Classroom' || r.type === 'Seminar Hall').map(r => r.id),
          requiredRoomType: totalStudentCount > 70 ? 'Seminar Hall' : 'Classroom',
          minCapacity: totalStudentCount,
        });
      }
    } else {
      for (const division of activeDivisions) {
        // Theory
        for (let i = 0; i < subject.theorySessionsPerWeek; i++) {
          sessions.push({
            id: `req-${subject.id}-${division.id}-th-${i + 1}`,
            subjectId: subject.id,
            subjectCode: subject.code,
            subjectName: subject.name,
            sessionType: 'Theory',
            branchId: subject.branchId,
            academicYear: subject.academicYear,
            divisionId: division.id,
            participatingDivisionIds: [division.id],
            durationSlots: 1,
            eligibleFacultyIds: subject.eligibleFacultyIds,
            permittedRoomIds: subject.permittedRoomIds.length > 0
              ? subject.permittedRoomIds
              : compatibleRooms.filter(r => r.permittedSessionTypes.includes('Theory')).map(r => r.id),
            requiredRoomType: 'Classroom',
            minCapacity: division.studentCount,
          });
        }

        // Practical
        if (subject.practicalSessionsPerWeek > 0) {
          const divBatches = subject.hasBatches ? (batchesByDiv.get(division.id) || []) : [];
          if (divBatches.length > 0) {
            for (const batch of divBatches) {
              for (let p = 0; p < subject.practicalSessionsPerWeek; p++) {
                sessions.push({
                  id: `req-${subject.id}-${division.id}-${batch.id}-pr-${p + 1}`,
                  subjectId: subject.id,
                  subjectCode: subject.code,
                  subjectName: `${subject.name} (Batch ${batch.name})`,
                  sessionType: 'Practical',
                  branchId: subject.branchId,
                  academicYear: subject.academicYear,
                  divisionId: division.id,
                  batchId: batch.id,
                  batchName: batch.name,
                  participatingDivisionIds: [division.id],
                  durationSlots: subject.practicalSlotDuration || 2,
                  eligibleFacultyIds: subject.eligibleFacultyIds,
                  permittedRoomIds: compatibleRooms
                    .filter(r => r.type === subject.requiredRoomType && r.permittedSessionTypes.includes('Practical'))
                    .map(r => r.id),
                  requiredRoomType: subject.requiredRoomType,
                  minCapacity: batch.studentCount,
                });
              }
            }
          } else {
            for (let p = 0; p < subject.practicalSessionsPerWeek; p++) {
              sessions.push({
                id: `req-${subject.id}-${division.id}-pr-${p + 1}`,
                subjectId: subject.id,
                subjectCode: subject.code,
                subjectName: `${subject.name} (Practical)`,
                sessionType: 'Practical',
                branchId: subject.branchId,
                academicYear: subject.academicYear,
                divisionId: division.id,
                participatingDivisionIds: [division.id],
                durationSlots: subject.practicalSlotDuration || 2,
                eligibleFacultyIds: subject.eligibleFacultyIds,
                permittedRoomIds: compatibleRooms
                  .filter(r => r.type === subject.requiredRoomType && r.permittedSessionTypes.includes('Practical'))
                  .map(r => r.id),
                requiredRoomType: subject.requiredRoomType,
                minCapacity: division.studentCount,
              });
            }
          }
        }
      }
    }
  }

  return sessions;
}
