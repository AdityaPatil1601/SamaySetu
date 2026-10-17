import React, { useState } from 'react';
import { Upload, AlertTriangle, CheckCircle2, FileSpreadsheet, X, HelpCircle, ArrowRight } from 'lucide-react';
import { Modal } from './Modal';
import {
  ScheduleAssignment,
  CollegeSettings,
  Faculty,
  Room,
  Division,
  Subject,
  ImportConflictIssue,
} from '../../types';
import { parseAndValidateTimetableCsv, ParseResult } from '../../services/import/timetableImporter';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingAssignments: ScheduleAssignment[];
  settings: CollegeSettings;
  faculty: Faculty[];
  rooms: Room[];
  divisions: Division[];
  subjects: Subject[];
  onImportSuccess: (newAssignments: ScheduleAssignment[]) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  existingAssignments,
  settings,
  faculty,
  rooms,
  divisions,
  subjects,
  onImportSuccess,
}) => {
  const [csvContent, setCsvContent] = useState<string>('');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState<string>('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setCsvContent(text);
      const res = parseAndValidateTimetableCsv(
        text,
        existingAssignments,
        settings,
        faculty,
        rooms,
        divisions,
        subjects
      );
      setParseResult(res);
    };
    reader.readAsText(file);
  };

  const handleLoadSampleSheet = () => {
    // Generate valid sample CSV with one deliberate conflict to demonstrate the conflict table!
    const sample = `Day,Period,Class,Subject,Teacher,Room
Monday,Period 1,Div A,CS101,Prof. Ramesh Sharma,CR-201
Monday,Period 2,Div A,MA101,Prof. Sneha Iyer,CR-201
Monday,Period 3,Div A,CS202,Prof. Priya Mehta,CR-203
Tuesday,Period 1,Div A,CS101,Prof. Ramesh Sharma,CR-201
Tuesday,Period 2,Div B,IT301,Prof. Ramesh Sharma,CR-202
Wednesday,Period 1,Div A,CS101,Prof. Ramesh Sharma,CR-201
Wednesday,Period 1,Div B,IT301,Prof. Ramesh Sharma,CR-202
Wednesday,Period 2,Div A,CS101,Prof. Ramesh Sharma,CR-201
Wednesday,Period 2,Div A,MA101,Prof. Sneha Iyer,CR-201`;

    setFileName('Sample_College_Timetable_Sheet.csv');
    setCsvContent(sample);
    const res = parseAndValidateTimetableCsv(
      sample,
      existingAssignments,
      settings,
      faculty,
      rooms,
      divisions,
      subjects
    );
    setParseResult(res);
  };

  const handleConfirmImport = () => {
    if (!parseResult) return;
    if (parseResult.issues.length > 0) {
      const proceed = window.confirm(
        `There are ${parseResult.issues.length} conflict(s) detected in this sheet. Invalid conflicting rows will be skipped, and valid rows will be merged. Proceed?`
      );
      if (!proceed) return;
    }
    onImportSuccess(parseResult.parsedAssignments);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Timetable Sheet (Excel / CSV)"
      subtitle="Upload institutional timetable spreadsheet with automated conflict diagnostics"
      maxWidth="4xl"
    >
      <div className="space-y-5">
        {/* Dropzone & Sample Loader */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {fileName || 'Upload CSV / Excel Timetable Export'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Supports standard comma-separated format: Day, Period, Class, Subject, Teacher, Room
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSampleSheet}
              className="px-3 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors whitespace-nowrap"
            >
              Load Demo Template
            </button>
            <label className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap">
              <Upload className="w-3.5 h-3.5" />
              <span>Browse File</span>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Validation Results Summary */}
        {parseResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Total Rows Evaluated</span>
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                  {parseResult.totalRowsProcessed}
                </span>
              </div>
              <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block">Valid Conflict-Free Slots</span>
                <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                  {parseResult.parsedAssignments.length}
                </span>
              </div>
              <div className={`p-3 rounded-xl border ${
                parseResult.issues.length === 0
                  ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                  : 'border-rose-200 dark:border-rose-800/40 bg-rose-50/50 dark:bg-rose-950/20'
              }`}>
                <span className={`text-[11px] block ${parseResult.issues.length === 0 ? 'text-slate-500' : 'text-rose-700 dark:text-rose-400'}`}>
                  Clashes & Violations Detected
                </span>
                <span className={`text-xl font-bold font-mono ${parseResult.issues.length === 0 ? 'text-slate-900 dark:text-slate-100' : 'text-rose-700 dark:text-rose-400'}`}>
                  {parseResult.issues.length}
                </span>
              </div>
            </div>

            {/* Conflicts Diagnostic Table */}
            {parseResult.issues.length > 0 ? (
              <div className="border border-rose-200 dark:border-rose-800/60 rounded-xl overflow-hidden shadow-xs">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-800/60 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span className="text-xs font-bold text-rose-950 dark:text-rose-200">
                    Conflict Diagnostics: Issues Found in Spreadsheet
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 font-semibold">
                        <th className="py-2 px-3 w-16">Row #</th>
                        <th className="py-2 px-3 w-24">Timing</th>
                        <th className="py-2 px-3 w-36">Conflict Type</th>
                        <th className="py-2 px-3">Violation Details</th>
                        <th className="py-2 px-3">Recommendation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                      {parseResult.issues.map((issue, idx) => (
                        <tr key={idx} className="hover:bg-rose-50/30 dark:hover:bg-rose-950/10">
                          <td className="py-2 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                            Line {issue.row}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-400">
                            {issue.day} <br />
                            <span className="text-[10px] text-slate-400">{issue.timeRange}</span>
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                              {issue.issueType.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-700 dark:text-slate-300 leading-snug">
                            {issue.details}
                          </td>
                          <td className="py-2 px-3 text-slate-500 dark:text-slate-400 italic">
                            {issue.recommendation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="text-xs text-emerald-900 dark:text-emerald-200">
                  <strong>Zero schedule conflicts detected!</strong> All rows satisfy teacher single-booking, room capacity, and division non-overlap rules.
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={parseResult.parsedAssignments.length === 0}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save {parseResult.parsedAssignments.length} Timetable Slots</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
