import React from 'react';
import { Download, Printer, X, FileText, CheckCircle2 } from 'lucide-react';
import { Modal } from './Modal';
import {
  ScheduleAssignment,
  CollegeSettings,
  Subject,
} from '../../types';
import { downloadTimetablePdf, TimetableExportMeta } from '../../services/export/pdfExporter';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  meta?: TimetableExportMeta;
  title?: string;
  subtitle?: string;
  settings: CollegeSettings;
  assignments: ScheduleAssignment[];
  subjects: Subject[];
  viewType?: 'class' | 'teacher' | 'department';
  onDownloaded?: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  meta,
  title,
  subtitle,
  settings,
  assignments,
  subjects,
  viewType = 'class',
  onDownloaded,
}) => {
  if (!isOpen) return null;

  const resolvedMeta: TimetableExportMeta = meta || {
    type: (viewType === 'teacher' ? 'Teacher' : viewType === 'class' ? 'Class' : 'Department'),
    title: title || 'Academic Timetable',
    subTitle: subtitle || settings.collegeName,
    collegeName: settings.collegeName,
    academicTerm: settings.academicTerm,
    generatedDate: new Date().toLocaleString(),
    filenameIdentifier: (title || 'Timetable').replace(/[^a-zA-Z0-9-_]/g, '_'),
  };

  const handleDownload = () => {
    downloadTimetablePdf(resolvedMeta, settings, assignments, subjects, viewType);
    if (onDownloaded) onDownloaded();
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="PDF Layout Preview (Landscape A4)"
      subtitle="Verify high-fidelity formatting, table headers, and page margins prior to generating PDF"
      maxWidth="5xl"
    >
      <div className="space-y-4">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Target: <strong>Landscape A4 (297 x 210 mm)</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg border border-slate-300 dark:border-slate-600 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF File</span>
            </button>
          </div>
        </div>

        {/* Paper Sheet Simulation */}
        <div className="p-4 sm:p-6 bg-slate-200 dark:bg-slate-950 rounded-xl overflow-x-auto flex justify-center">
          <div className="w-[880px] min-w-[880px] bg-white text-slate-900 p-6 rounded-lg shadow-xl border border-slate-300 font-sans print:shadow-none print:border-none print:w-full">
            {/* Header Box */}
            <div className="flex items-center justify-between border border-slate-200 bg-slate-50 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  SS
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                    {resolvedMeta.collegeName}
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    {resolvedMeta.academicTerm}   |   <span className="text-indigo-700 font-bold">{resolvedMeta.title}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">{resolvedMeta.subTitle}</p>
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-500 font-mono">
                <div>Date: {resolvedMeta.generatedDate || new Date().toLocaleDateString()}</div>
                <div>Format: A4 Landscape</div>
              </div>
            </div>

            {/* Timetable Table Grid */}
            <table className="w-full border-collapse border border-slate-300 text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold">
                  <th className="border border-slate-300 p-2 text-left w-24">Day</th>
                  {settings.slots.map(slot => (
                    <React.Fragment key={slot.slotIndex}>
                      <th className="border border-slate-300 p-1.5 text-center">
                        <div>Period {slot.slotIndex + 1}</div>
                        <div className="text-[9px] font-normal text-slate-500 font-mono">
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </th>
                      {settings.teaBreakSlotIndex !== undefined && slot.slotIndex === settings.teaBreakSlotIndex && (
                        <th className="border border-slate-300 p-1 bg-slate-200 text-slate-600 text-[9px] w-12 text-center uppercase">
                          Tea
                        </th>
                      )}
                      {slot.slotIndex === settings.lunchBreakSlotIndex && (
                        <th className="border border-slate-300 p-1 bg-amber-100 text-amber-800 text-[9px] w-16 text-center uppercase">
                          Lunch Break
                        </th>
                      )}
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {settings.workingDays.map(day => (
                  <tr key={day} className="border-b border-slate-200">
                    <td className="border border-slate-300 p-2 font-bold bg-slate-50 text-slate-900">
                      {day}
                    </td>
                    {settings.slots.map(slot => {
                      const matches = assignments.filter(a => {
                        if (a.day !== day) return false;
                        const endSlot = a.startSlotIndex + a.durationSlots - 1;
                        return slot.slotIndex >= a.startSlotIndex && slot.slotIndex <= endSlot;
                      });

                      const isTeaBreakAfter = settings.teaBreakSlotIndex !== undefined && slot.slotIndex === settings.teaBreakSlotIndex;
                      const isLunchAfter = slot.slotIndex === settings.lunchBreakSlotIndex;

                      return (
                        <React.Fragment key={slot.slotIndex}>
                          <td className="border border-slate-300 p-1 text-center align-middle h-14">
                            {matches.length === 0 ? (
                              <span className="text-slate-300 font-mono italic text-[10px]">Free</span>
                            ) : (
                              <div className="p-1 rounded bg-indigo-50/90 text-indigo-950 border border-indigo-200 leading-tight">
                                <div className="font-bold text-[11px] font-mono">{matches[0].subjectCode}</div>
                                <div className="text-[9px] text-slate-600 truncate">
                                  {viewType === 'teacher'
                                    ? `${matches[0].divisionName} ${matches[0].batchName || ''}`
                                    : matches[0].facultyName.replace('Prof. ', '')}
                                </div>
                                <div className="text-[9px] font-mono text-slate-500 font-semibold">{matches[0].roomNumber}</div>
                              </div>
                            )}
                          </td>
                          {isTeaBreakAfter && (
                            <td className="border border-slate-300 p-1 bg-slate-100 text-slate-400 text-[9px] text-center font-mono">
                              |
                            </td>
                          )}
                          {isLunchAfter && (
                            <td className="border border-slate-300 p-1 bg-amber-50 text-amber-800 text-[9px] text-center font-semibold">
                              LUNCH
                            </td>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
              <span>Generated by SamaySetu Timetable Management System</span>
              <span>Page 1 of 1</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
