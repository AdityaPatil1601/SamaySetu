import { ScheduleAssignment, ScheduleVersion } from '../../types';

function triggerDownload(csvContent: string, filename: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvField(val: string | number | undefined): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export function exportClassTimetableCsv(
  assignments: ScheduleAssignment[],
  branchCode: string,
  academicYear: string,
  divisionName: string
): void {
  const filtered = assignments.filter(
    a => a.divisionName.toLowerCase() === divisionName.toLowerCase() &&
         a.academicYear === academicYear
  );

  const headers = ['Day', 'Time Range', 'Branch', 'Year', 'Division', 'Batch', 'Subject Code', 'Subject Name', 'Type', 'Faculty', 'Room'];
  const rows = filtered.map(a => [
    escapeCsvField(a.day),
    escapeCsvField(a.timeRange),
    escapeCsvField(a.branchId.replace('branch-', '').toUpperCase()),
    escapeCsvField(a.academicYear),
    escapeCsvField(a.divisionName),
    escapeCsvField(a.batchName || 'All Batches'),
    escapeCsvField(a.subjectCode),
    escapeCsvField(a.subjectName),
    escapeCsvField(a.sessionType),
    escapeCsvField(a.facultyName),
    escapeCsvField(`${a.roomNumber} (${a.roomName})`),
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  triggerDownload(csvContent, `SamaySetu_Timetable_${branchCode}_${academicYear}_${divisionName.replace(/\s+/g, '_')}.csv`);
}

export function exportFacultyTimetableCsv(
  assignments: ScheduleAssignment[],
  facultyId: string,
  facultyName: string
): void {
  const filtered = assignments.filter(a => a.facultyId === facultyId);
  const headers = ['Day', 'Time Range', 'Subject Code', 'Subject Name', 'Session Type', 'Branch', 'Year', 'Division', 'Batch', 'Room'];
  const rows = filtered.map(a => [
    escapeCsvField(a.day),
    escapeCsvField(a.timeRange),
    escapeCsvField(a.subjectCode),
    escapeCsvField(a.subjectName),
    escapeCsvField(a.sessionType),
    escapeCsvField(a.branchId.replace('branch-', '').toUpperCase()),
    escapeCsvField(a.academicYear),
    escapeCsvField(a.divisionName),
    escapeCsvField(a.batchName || '-'),
    escapeCsvField(`${a.roomNumber} (${a.roomName})`),
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  triggerDownload(csvContent, `SamaySetu_Faculty_${facultyName.replace(/\s+/g, '_')}.csv`);
}

export function exportRoomTimetableCsv(
  assignments: ScheduleAssignment[],
  roomId: string,
  roomNumber: string
): void {
  const filtered = assignments.filter(a => a.roomId === roomId);
  const headers = ['Day', 'Time Range', 'Room Number', 'Room Name', 'Subject Code', 'Subject Name', 'Type', 'Faculty', 'Division'];
  const rows = filtered.map(a => [
    escapeCsvField(a.day),
    escapeCsvField(a.timeRange),
    escapeCsvField(a.roomNumber),
    escapeCsvField(a.roomName),
    escapeCsvField(a.subjectCode),
    escapeCsvField(a.subjectName),
    escapeCsvField(a.sessionType),
    escapeCsvField(a.facultyName),
    escapeCsvField(`${a.divisionName}${a.batchName ? ` (Batch ${a.batchName})` : ''}`),
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  triggerDownload(csvContent, `SamaySetu_Room_${roomNumber.replace(/\s+/g, '_')}.csv`);
}

export function exportMasterTimetableCsv(version: ScheduleVersion): void {
  const headers = ['Day', 'Time Range', 'Branch', 'Year', 'Division', 'Batch', 'Subject Code', 'Subject Name', 'Session Type', 'Faculty', 'Room Number', 'Room Name'];
  const rows = version.assignments.map(a => [
    escapeCsvField(a.day),
    escapeCsvField(a.timeRange),
    escapeCsvField(a.branchId.replace('branch-', '').toUpperCase()),
    escapeCsvField(a.academicYear),
    escapeCsvField(a.divisionName),
    escapeCsvField(a.batchName || 'All'),
    escapeCsvField(a.subjectCode),
    escapeCsvField(a.subjectName),
    escapeCsvField(a.sessionType),
    escapeCsvField(a.facultyName),
    escapeCsvField(a.roomNumber),
    escapeCsvField(a.roomName),
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  triggerDownload(csvContent, `SamaySetu_Master_Timetable_v${version.versionNumber}.csv`);
}
