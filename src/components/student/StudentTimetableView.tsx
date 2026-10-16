import React, { useState, useMemo } from 'react';
import {
  CalendarRange,
  Download,
  Printer,
  FileSpreadsheet,
  Filter,
  Users,
  DoorOpen,
  GraduationCap,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import {
  Student,
  Division,
  ScheduleVersion,
  CollegeSettings,
  Room,
  Subject,
  DayOfWeek,
  Faculty,
  ScheduleAssignment,
} from '../../types';
import { downloadTimetablePdf } from '../../services/export/pdfExporter';
import { exportTimetableCsv } from '../../services/export/excelExporter';

interface StudentTimetableViewProps {
  currentStudent: Student;
  activeVersion: ScheduleVersion | null;
  settings: CollegeSettings;
  divisions: Division[];
  rooms: Room[];
  subjects: Subject[];
  faculty: Faculty[];
  onOpenPdfPreview: () => void;
}

export const StudentTimetableView: React.FC<StudentTimetableViewProps> = ({
  currentStudent,
  activeVersion,
  settings,
  divisions,
  rooms,
  subjects,
  faculty,
  onOpenPdfPreview,
}) => {
  const currentDivision = useMemo(() => {
    return divisions.find(d => d.id === currentStudent.divisionId) || divisions[0];
  }, [divisions, currentStudent.divisionId]);

  // Batch Filter: 'ALL' or specific batch name like 'A1', 'A2'
  const [selectedBatch, setSelectedBatch] = useState<string>(currentStudent.batchName || 'A1');
  const [sessionFilter, setSessionFilter] = useState<'ALL' | 'Theory' | 'Practical'>('ALL');

  // All assignments for this division
  const rawAssignments = useMemo(() => {
    if (!activeVersion || !currentDivision) return [];
    return activeVersion.assignments.filter(a => a.divisionId === currentDivision.id);
  }, [activeVersion, currentDivision]);

  // Available batches for this division
  const availableBatches = useMemo(() => {
    const set = new Set<string>();
    rawAssignments.forEach(a => {
      if (a.batchName) set.add(a.batchName);
    });
    return Array.from(set).sort();
  }, [rawAssignments]);

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return rawAssignments.filter(a => {
      if (sessionFilter !== 'ALL' && a.sessionType !== sessionFilter) return false;
      if (selectedBatch !== 'ALL' && a.batchName && a.batchName !== selectedBatch) {
        return false;
      }
      return true;
    });
  }, [rawAssignments, selectedBatch, sessionFilter]);

  // Soft Subject color map
  const subjectColorMap = useMemo(() => {
    const map = new Map<string, string>();
    const colors = [
      'bg-emerald-50 border-emerald-200 text-emerald-950',
      'bg-teal-50 border-teal-200 text-teal-950',
      'bg-amber-50 border-amber-200 text-amber-950',
      'bg-sky-50 border-sky-200 text-sky-950',
      'bg-purple-50 border-purple-200 text-purple-950',
      'bg-rose-50 border-rose-200 text-rose-950',
    ];
    subjects.forEach((sub, i) => {
      map.set(sub.id, colors[i % colors.length]);
    });
    return map;
  }, [subjects]);

  const handleDownloadPdf = () => {
    downloadTimetablePdf(
      'class',
      currentDivision.id,
      `${currentDivision.name} (${currentDivision.academicYear})`,
      filteredAssignments,
      settings,
      subjects,
      divisions,
      faculty
    );
  };

  const handleExportCsv = () => {
    exportTimetableCsv(
      'class',
      currentDivision.id,
      `${currentDivision.name} (${currentDivision.academicYear})`,
      filteredAssignments,
      settings,
      subjects
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-emerald-700">Official Class Timetable</span>
            <span aria-hidden="true">·</span>
            <span>{currentDivision.academicYear} {currentDivision.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Weekly Class Timetable
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Odd Semester 2026-27 · Filter by practical lab batch or export landscape A4 PDF.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={onOpenPdfPreview}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>PDF Preview</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            className="px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-4">
          {/* Batch Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Practical Batch:</span>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setSelectedBatch('ALL')}
                className={`px-2.5 py-1 rounded-md transition-colors font-semibold ${
                  selectedBatch === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Batches
              </button>
              {availableBatches.map(b => (
                <button
                  key={b}
                  onClick={() => setSelectedBatch(b)}
                  className={`px-2.5 py-1 rounded-md transition-colors font-semibold ${
                    selectedBatch === b
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Batch {b} {currentStudent.batchName === b ? '(Mine)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Session Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Type:</span>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              {(['ALL', 'Theory', 'Practical'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setSessionFilter(type)}
                  className={`px-2.5 py-1 rounded-md transition-colors font-semibold ${
                    sessionFilter === type
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-500">
          Showing <span className="font-bold text-slate-900">{filteredAssignments.length}</span> class sessions
        </div>
      </div>

      {/* Main Weekly Timetable Grid */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-3 font-semibold text-slate-700 w-28 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                  Day / Time
                </th>
                {settings.slots.map(slot => (
                  <th
                    key={slot.slotIndex}
                    className="py-3 px-2 font-semibold text-slate-700 text-center min-w-[140px] border-r border-slate-200/80 last:border-r-0"
                  >
                    <div>Period {slot.slotIndex + 1}</div>
                    <div className="text-[10px] text-slate-500 font-mono font-normal">
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {settings.workingDays.map(day => (
                <tr key={day} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-800 sticky left-0 bg-white z-10 border-r border-slate-200">
                    {day}
                  </td>
                  {settings.slots.map(slot => {
                    const isLunch = slot.slotIndex === settings.lunchBreakSlotIndex;
                    const isTea = slot.slotIndex === settings.teaBreakSlotIndex;

                    const match = filteredAssignments.find(
                      a => a.day === day && a.startSlotIndex === slot.slotIndex
                    );

                    // Check if this slot is covered by a multi-slot assignment that started earlier
                    const isCovered = filteredAssignments.some(
                      a =>
                        a.day === day &&
                        slot.slotIndex > a.startSlotIndex &&
                        slot.slotIndex < a.startSlotIndex + a.durationSlots
                    );

                    if (isCovered) {
                      return null; // Spanned by colSpan
                    }

                    if (match) {
                      const colorClass = subjectColorMap.get(match.subjectId) || 'bg-slate-50 border-slate-200 text-slate-900';
                      return (
                        <td
                          key={slot.slotIndex}
                          colSpan={match.durationSlots}
                          className="p-1.5 border border-slate-200/80 align-top"
                        >
                          <div
                            className={`h-full min-h-[82px] p-2.5 rounded-lg border flex flex-col justify-between ${colorClass}`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-mono font-bold text-xs truncate">
                                  {match.subjectCode}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-white/80 border border-slate-200 shrink-0">
                                  {match.sessionType}
                                </span>
                              </div>
                              <div className="text-[11px] font-semibold mt-1 leading-snug line-clamp-2">
                                {match.subjectName}
                              </div>
                            </div>

                            <div className="mt-2 pt-1 border-t border-slate-200/60 text-[10px] flex items-center justify-between gap-1">
                              <span className="font-semibold truncate">
                                {match.roomNumber}
                              </span>
                              <span className="truncate text-slate-600">
                                {match.facultyName.replace('Prof. ', '').replace('Dr. ', '')}
                              </span>
                              {match.batchName && (
                                <span className="px-1 rounded bg-amber-200 text-amber-900 font-bold shrink-0">
                                  {match.batchName}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={slot.slotIndex}
                        className={`p-1 border border-slate-200/80 text-center ${
                          isLunch || isTea ? 'bg-amber-50/20' : 'bg-slate-50/20'
                        }`}
                      >
                        <div className="h-full min-h-[82px] flex items-center justify-center text-[11px] text-slate-400">
                          {isLunch ? 'Lunch' : isTea ? 'Tea' : '—'}
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
    </div>
  );
};
