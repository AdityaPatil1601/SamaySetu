import jsPDF from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';
import {
  ScheduleAssignment,
  CollegeSettings,
  DayOfWeek,
  Division,
  Faculty,
  Branch,
  Subject,
} from '../../types';

export interface TimetableExportMeta {
  type: 'Class' | 'Teacher' | 'Department' | 'Master';
  title: string;
  subTitle: string;
  collegeName: string;
  academicTerm: string;
  generatedDate?: string;
  filenameIdentifier: string;
}

// Convert hex color to RGB array for jspdf-autotable styling
function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

// Map subject code to harmonious palette tints (Forest Green, Terracotta, Soft Sand, Warm Ivory)
const SUBJECT_PASTEL_COLORS: Record<string, [number, number, number]> = {
  CS101: [237, 243, 240], // Forest Green tint
  IT301: [253, 243, 239], // Terracotta tint
  MA101: [246, 241, 232], // Warm Ivory
  CS202: [226, 213, 184], // Soft Sand tint
  IT302: [237, 243, 240], // Forest Green tint
  IT101: [253, 243, 239], // Terracotta tint
  EC201: [240, 233, 217], // Sand subtle
  ME201: [237, 243, 240], // Forest Green tint
};

export function generateSingleTimetablePage(
  doc: jsPDF,
  meta: TimetableExportMeta,
  settings: CollegeSettings,
  assignments: ScheduleAssignment[],
  subjects: Subject[],
  viewType: 'class' | 'teacher' | 'department',
  pageNumber: number,
  totalPagesPlaceholder: string = '1',
  isNewPage: boolean = false
): void {
  if (isNewPage) {
    doc.addPage('a4', 'landscape');
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Header Background bar
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(margin, 10, pageWidth - margin * 2, 26, 'F');
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.rect(margin, 10, pageWidth - margin * 2, 26, 'S');

  // Institution Logo Badge Placeholder
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.roundedRect(margin + 4, 13, 20, 20, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SS', margin + 9, 27);

  // Institution Title
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(meta.collegeName, margin + 28, 19);

  // Subtitle / Department / Term
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(`${meta.academicTerm}   |   ${meta.title}`, margin + 28, 25);
  doc.text(meta.subTitle, margin + 28, 31);

  // Generated Timestamp
  const generatedTimeStr = meta.generatedDate || new Date().toLocaleString();
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${generatedTimeStr}`, pageWidth - margin - 4, 18, { align: 'right' });
  doc.text(`Format: ISO A4 Landscape`, pageWidth - margin - 4, 25, { align: 'right' });

  // Build Table Columns
  // Col 0 = Day
  // Subsequent columns = Slots, with Break / Lunch inserted at appropriate indices
  interface PeriodColumnDef {
    header: string;
    subHeader: string;
    isBreak?: boolean;
    isLunch?: boolean;
    slotIndex?: number;
  }

  const columns: PeriodColumnDef[] = [];
  settings.slots.forEach(slot => {
    columns.push({
      header: `Period ${slot.slotIndex + 1}`,
      subHeader: `${slot.startTime} - ${slot.endTime}`,
      slotIndex: slot.slotIndex,
    });

    if (settings.teaBreakSlotIndex !== undefined && slot.slotIndex === settings.teaBreakSlotIndex) {
      columns.push({
        header: 'TEA BREAK',
        subHeader: '11:00 - 11:15',
        isBreak: true,
      });
    }

    if (slot.slotIndex === settings.lunchBreakSlotIndex) {
      columns.push({
        header: 'LUNCH BREAK',
        subHeader: '13:15 - 14:00',
        isLunch: true,
      });
    }
  });

  const tableHead: any[] = [
    [
      { content: 'Day / Time', styles: { fontStyle: 'bold', halign: 'left' } },
      ...columns.map(c => ({
        content: `${c.header}\n${c.subHeader}`,
        styles: {
          fontStyle: 'bold',
          halign: 'center',
          fillColor: c.isLunch ? [254, 243, 199] : c.isBreak ? [241, 245, 249] : [241, 245, 249],
          textColor: c.isLunch ? [146, 64, 14] : [71, 85, 105],
        },
      })),
    ],
  ];

  // Build Table Rows per Day
  const tableRows: any[] = [];

  for (const day of settings.workingDays) {
    const rowCells: any[] = [
      {
        content: day,
        styles: { fontStyle: 'bold', halign: 'left', fillColor: [248, 250, 252], textColor: [15, 23, 42] },
      },
    ];

    for (const col of columns) {
      if (col.isLunch) {
        rowCells.push({
          content: 'LUNCH',
          styles: {
            halign: 'center',
            valign: 'middle',
            fillColor: [254, 243, 199],
            textColor: [180, 83, 9],
            fontStyle: 'bold',
            fontSize: 8,
          },
        });
        continue;
      }
      if (col.isBreak) {
        rowCells.push({
          content: 'BREAK',
          styles: {
            halign: 'center',
            valign: 'middle',
            fillColor: [241, 245, 249],
            textColor: [148, 163, 184],
            fontSize: 7,
          },
        });
        continue;
      }

      const slotIdx = col.slotIndex!;
      const matchingAssignments = assignments.filter(a => {
        if (a.day !== day) return false;
        const endSlot = a.startSlotIndex + a.durationSlots - 1;
        return slotIdx >= a.startSlotIndex && slotIdx <= endSlot;
      });

      if (matchingAssignments.length === 0) {
        rowCells.push({
          content: 'Free',
          styles: {
            halign: 'center',
            valign: 'middle',
            textColor: [160, 174, 192], // Light grey
            fontSize: 8,
            fontStyle: 'italic',
          },
        });
      } else {
        // Format cell content
        const first = matchingAssignments[0];
        let subText = '';
        if (viewType === 'teacher') {
          // In teacher view, show Class name
          subText = `${first.divisionName}${first.batchName ? ` (${first.batchName})` : ''}\n${first.roomNumber}`;
        } else {
          // In class or department view, show Teacher name
          subText = `${first.facultyName.replace('Prof. ', '').replace('Dr. ', '')}\n${first.roomNumber}`;
        }

        const cellContent = `${first.subjectCode}\n${subText}`;
        const fillColor = SUBJECT_PASTEL_COLORS[first.subjectCode] || [240, 249, 255];

        rowCells.push({
          content: cellContent,
          styles: {
            halign: 'center',
            valign: 'middle',
            fillColor,
            textColor: [15, 23, 42],
            fontSize: 8,
            fontStyle: 'bold',
          },
        });
      }
    }

    tableRows.push(rowCells);
  }

  // Render Table via autoTable
  autoTable(doc, {
    head: tableHead as any,
    body: tableRows as any,
    startY: 40,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [203, 213, 225], // slate-300
      lineWidth: 0.25,
      overflow: 'linebreak',
    },
    headStyles: {
      fontSize: 8,
      lineWidth: 0.3,
    },
    tableWidth: 'auto',
  });

  // Footer: Page number and "Generated by SamaySetu"
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Generated by SamaySetu Timetable Management System`, margin, pageHeight - 8);
  doc.text(`Page ${pageNumber} of ${totalPagesPlaceholder}`, pageWidth - margin, pageHeight - 8, {
    align: 'right',
  });
}

/**
 * Downloads a single Landscape A4 PDF for a given timetable
 */
export function downloadTimetablePdf(
  viewOrMeta: 'class' | 'teacher' | 'department' | TimetableExportMeta,
  idOrSettings: string | CollegeSettings,
  nameOrAssignments?: string | ScheduleAssignment[],
  assignmentsOrSubjects?: ScheduleAssignment[] | Subject[],
  settingsOrViewType?: CollegeSettings | 'class' | 'teacher' | 'department',
  subjectsOpt?: Subject[],
  divisionsOpt?: Division[],
  facultyOpt?: Faculty[]
): void {
  let meta: TimetableExportMeta;
  let settings: CollegeSettings;
  let assignments: ScheduleAssignment[];
  let subjects: Subject[];
  let viewType: 'class' | 'teacher' | 'department';

  if (typeof viewOrMeta === 'object') {
    meta = viewOrMeta;
    settings = idOrSettings as CollegeSettings;
    assignments = nameOrAssignments as ScheduleAssignment[];
    subjects = assignmentsOrSubjects as Subject[];
    viewType = (settingsOrViewType as 'class' | 'teacher' | 'department') || 'class';
  } else {
    viewType = viewOrMeta;
    const entityName = (nameOrAssignments as string) || 'Timetable';
    assignments = (assignmentsOrSubjects as ScheduleAssignment[]) || [];
    settings = (settingsOrViewType as CollegeSettings) || ({} as CollegeSettings);
    subjects = subjectsOpt || [];

    meta = {
      type: viewType === 'teacher' ? 'Teacher' : viewType === 'class' ? 'Class' : 'Department',
      title: viewType === 'teacher' ? `Faculty Timetable - ${entityName}` : `Class Timetable - ${entityName}`,
      subTitle: settings.collegeName || 'Institutional Academic Schedule',
      collegeName: settings.collegeName || 'SamaySetu College',
      academicTerm: settings.academicTerm || 'Odd Semester 2026-27',
      generatedDate: new Date().toLocaleString(),
      filenameIdentifier: entityName,
    };
  }

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  generateSingleTimetablePage(doc, meta, settings, assignments, subjects, viewType, 1, '1');

  const dateStr = new Date().toISOString().slice(0, 10);
  const cleanId = meta.filenameIdentifier.replace(/[^a-zA-Z0-9-_]/g, '_');
  const filename = `Timetable_${meta.type}_${cleanId}_${dateStr}.pdf`;

  doc.save(filename);
}

/**
 * Bulk Download: Generates a multi-page PDF containing all class timetables
 */
export async function downloadAllClassTimetablesPdf(
  divisions: Division[],
  branches: Branch[],
  settings: CollegeSettings,
  assignments: ScheduleAssignment[],
  subjects: Subject[],
  onProgress?: (current: number, total: number, message: string) => void
): Promise<void> {
  const activeDivs = divisions.filter(d => d.active);
  const total = activeDivs.length;
  if (total === 0) return;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const branchMap = new Map(branches.map(b => [b.id, b]));
  const dateStr = new Date().toISOString().slice(0, 10);

  for (let i = 0; i < total; i++) {
    const div = activeDivs[i];
    const branch = branchMap.get(div.branchId);
    const branchCode = branch ? branch.code : 'ENGG';

    if (onProgress) {
      onProgress(i + 1, total, `Generating timetable for ${branchCode} ${div.academicYear} ${div.name}...`);
      // Allow UI thread to breathe
      await new Promise(r => setTimeout(r, 20));
    }

    const divAssignments = assignments.filter(
      a => a.divisionId === div.id || a.participatingDivisionIds?.includes(div.id)
    );

    const meta: TimetableExportMeta = {
      type: 'Class',
      title: `Class Timetable - ${branchCode} ${div.academicYear} ${div.name}`,
      subTitle: `Department of ${branch ? branch.department : 'Engineering'} | Intake: ${div.studentCount} Students`,
      collegeName: settings.collegeName,
      academicTerm: settings.academicTerm,
      generatedDate: new Date().toLocaleString(),
      filenameIdentifier: `${branchCode}_${div.academicYear}_${div.name}`,
    };

    generateSingleTimetablePage(
      doc,
      meta,
      settings,
      divAssignments,
      subjects,
      'class',
      i + 1,
      `${total}`,
      i > 0 // Add new page for subsequent divisions
    );
  }

  doc.save(`Timetable_All_Classes_${dateStr}.pdf`);
}

/**
 * Bulk Download: Generates a multi-page PDF containing all teacher timetables
 */
export async function downloadAllTeacherTimetablesPdf(
  facultyList: Faculty[],
  settings: CollegeSettings,
  assignments: ScheduleAssignment[],
  subjects: Subject[],
  onProgress?: (current: number, total: number, message: string) => void
): Promise<void> {
  const activeFaculty = facultyList.filter(f => f.active);
  const total = activeFaculty.length;
  if (total === 0) return;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const dateStr = new Date().toISOString().slice(0, 10);

  for (let i = 0; i < total; i++) {
    const fac = activeFaculty[i];
    if (onProgress) {
      onProgress(i + 1, total, `Generating timetable for ${fac.name}...`);
      await new Promise(r => setTimeout(r, 20));
    }

    const facAssignments = assignments.filter(a => a.facultyId === fac.id);
    const weeklyHours = facAssignments.reduce((acc, a) => acc + a.durationSlots, 0);

    const meta: TimetableExportMeta = {
      type: 'Teacher',
      title: `Faculty Timetable - ${fac.name}`,
      subTitle: `Employee ID: ${fac.employeeId} | ${fac.department} | Assigned Load: ${weeklyHours} / ${fac.maxWeeklyHours} hrs`,
      collegeName: settings.collegeName,
      academicTerm: settings.academicTerm,
      generatedDate: new Date().toLocaleString(),
      filenameIdentifier: fac.name.replace(/\s+/g, '_'),
    };

    generateSingleTimetablePage(
      doc,
      meta,
      settings,
      facAssignments,
      subjects,
      'teacher',
      i + 1,
      `${total}`,
      i > 0
    );
  }

  doc.save(`Timetable_All_Teachers_${dateStr}.pdf`);
}
