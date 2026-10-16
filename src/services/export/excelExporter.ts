import {
  ScheduleAssignment,
  CollegeSettings,
  Subject,
} from '../../types';

function triggerDownload(csvContent: string, filename: string) {
  // UTF-8 BOM for Microsoft Excel compatibility
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

function escapeCsv(val: string | number | undefined): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Exports a timetable in the exact same Grid layout as the PDF/on-screen view
 * Rows = Days, Columns = Periods (with breaks and lunch)
 */
export function exportTimetableGridExcel(
  title: string,
  subTitle: string,
  settings: CollegeSettings,
  assignments: ScheduleAssignment[],
  subjects: Subject[],
  viewType: 'class' | 'teacher' | 'department',
  filenamePrefix: string
): void {
  const lines: string[] = [];

  // Header metadata rows
  lines.push(`${escapeCsv(settings.collegeName)}`);
  lines.push(`${escapeCsv(settings.academicTerm)} - ${escapeCsv(title)}`);
  lines.push(`${escapeCsv(subTitle)}`);
  lines.push(`${escapeCsv('Generated on: ' + new Date().toLocaleString())}`);
  lines.push(''); // Blank row

  // Period Columns
  interface ColDef {
    label: string;
    time: string;
    isBreak?: boolean;
    isLunch?: boolean;
    slotIndex?: number;
  }

  const columns: ColDef[] = [];
  settings.slots.forEach(slot => {
    columns.push({
      label: `Period ${slot.slotIndex + 1}`,
      time: `${slot.startTime} - ${slot.endTime}`,
      slotIndex: slot.slotIndex,
    });

    if (settings.teaBreakSlotIndex !== undefined && slot.slotIndex === settings.teaBreakSlotIndex) {
      columns.push({
        label: 'TEA BREAK',
        time: '11:00 - 11:15',
        isBreak: true,
      });
    }

    if (slot.slotIndex === settings.lunchBreakSlotIndex) {
      columns.push({
        label: 'LUNCH BREAK',
        time: '13:15 - 14:00',
        isLunch: true,
      });
    }
  });

  // Table header rows (Period row & Time row)
  const headerRow1 = ['Day / Period', ...columns.map(c => c.label)];
  const headerRow2 = ['Working Days', ...columns.map(c => c.time)];
  lines.push(headerRow1.map(escapeCsv).join(','));
  lines.push(headerRow2.map(escapeCsv).join(','));

  // Day Rows
  for (const day of settings.workingDays) {
    const rowValues: string[] = [day];

    for (const col of columns) {
      if (col.isLunch) {
        rowValues.push('LUNCH BREAK');
        continue;
      }
      if (col.isBreak) {
        rowValues.push('TEA BREAK');
        continue;
      }

      const slotIdx = col.slotIndex!;
      const matches = assignments.filter(a => {
        if (a.day !== day) return false;
        const endSlot = a.startSlotIndex + a.durationSlots - 1;
        return slotIdx >= a.startSlotIndex && slotIdx <= endSlot;
      });

      if (matches.length === 0) {
        rowValues.push('Free');
      } else {
        const item = matches[0];
        let cellText = '';
        if (viewType === 'teacher') {
          cellText = `${item.subjectCode} (${item.divisionName} ${item.batchName || ''} - ${item.roomNumber})`;
        } else {
          cellText = `${item.subjectCode} (${item.facultyName.replace('Prof. ', '')} - ${item.roomNumber})`;
        }
        rowValues.push(cellText);
      }
    }

    lines.push(rowValues.map(escapeCsv).join(','));
  }

  lines.push('');
  lines.push(`${escapeCsv('Exported from SamaySetu Timetable Management System')}`);

  const dateStr = new Date().toISOString().slice(0, 10);
  const cleanPrefix = filenamePrefix.replace(/[^a-zA-Z0-9-_]/g, '_');
  triggerDownload(lines.join('\n'), `Timetable_${cleanPrefix}_${dateStr}.csv`);
}

export function exportTimetableCsv(
  viewType: 'class' | 'teacher' | 'department',
  entityId: string,
  entityName: string,
  assignments: ScheduleAssignment[],
  settings: CollegeSettings,
  subjects: Subject[]
): void {
  const title = viewType === 'teacher' ? `Faculty Timetable - ${entityName}` : `Class Timetable - ${entityName}`;
  const subTitle = settings.collegeName;
  exportTimetableGridExcel(
    title,
    subTitle,
    settings,
    assignments,
    subjects,
    viewType,
    `${viewType}_${entityName}`
  );
}
