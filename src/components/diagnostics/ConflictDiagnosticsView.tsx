import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Info,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Filter,
} from 'lucide-react';
import {
  ValidationResult,
  ValidationIssue,
  DiagnosticSeverity,
  ScheduleVersion,
} from '../../types';
import { NavItemKey } from '../layout/Sidebar';

interface ConflictDiagnosticsViewProps {
  validation: ValidationResult;
  version: ScheduleVersion | null;
  onRevalidate: () => void;
  onNavigate: (tab: NavItemKey) => void;
  onSelectFaculty?: (facultyId: string) => void;
  onSelectRoom?: (roomId: string) => void;
}

export const ConflictDiagnosticsView: React.FC<ConflictDiagnosticsViewProps> = ({
  validation,
  version,
  onRevalidate,
  onNavigate,
  onSelectFaculty,
  onSelectRoom,
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const issues = validation.issues || [];
  const filteredIssues = issues.filter(issue => {
    const matchesSev = severityFilter === 'ALL' || issue.severity === severityFilter;
    const matchesCat = categoryFilter === 'ALL' || issue.category === categoryFilter;
    return matchesSev && matchesCat;
  });

  const getSeverityBadge = (severity: DiagnosticSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>Critical Violation</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Soft Warning</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-500" />
            <span>Info</span>
          </span>
        );
    }
  };

  const handleFixAction = (issue: ValidationIssue) => {
    if (issue.affectedFacultyId) {
      if (onSelectFaculty) onSelectFaculty(issue.affectedFacultyId);
      onNavigate('admin_teachers');
    } else if (issue.affectedRoomId) {
      if (onSelectRoom) onSelectRoom(issue.affectedRoomId);
      onNavigate('admin_rooms');
    } else if (issue.category === 'UNASSIGNED_SESSION') {
      onNavigate('admin_generator');
    } else {
      onNavigate('timetable');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>Independent Verification Layer</span>
            <span aria-hidden="true">•</span>
            <span>13 Hard Constraint Invariants</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Schedule Conflict Diagnostics & Integrity Audit
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Evaluates the active master schedule against physical room collisions, double-booked professors, and batch conflicts.
          </p>
        </div>

        <button
          onClick={onRevalidate}
          className="px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Re-verify Constraints</span>
        </button>
      </div>

      {/* Audit Status Banner */}
      <div
        className={`p-5 rounded-2xl border flex items-start gap-3.5 ${
          validation.isValid
            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
            : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
        }`}
      >
        {validation.isValid ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold">
              {validation.isValid
                ? 'Master Timetable is 100% Conflict-Free'
                : `${validation.criticalCount} Critical Violations Detected`}
            </h2>
            <span className="text-[11px] font-mono opacity-70">
              Verified: {new Date(validation.checkedAt).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-xs opacity-90 mt-1">
            {validation.isValid
              ? 'No overlapping sessions for faculty, rooms, or student divisions. All laboratory types and faculty qualifications are honored.'
              : 'The timetable contains conflicting assignments that must be resolved prior to official college publication.'}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 dark:text-slate-400 font-medium">Severity:</span>
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {['ALL', 'CRITICAL', 'WARNING'].map(s => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-3 py-1 font-medium transition-colors ${
                  severityFilter === s
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <span className="text-slate-500 dark:text-slate-400 font-mono">
          Showing {filteredIssues.length} of {issues.length} diagnostic findings
        </span>
      </div>

      {/* Diagnostic Issues List */}
      {filteredIssues.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Zero Invariants Violated</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All timetable assignments satisfy physical room capacity, professor availability, and student division constraints.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIssues.map(issue => (
            <div
              key={issue.id}
              className={`p-4 bg-white dark:bg-slate-900 rounded-2xl border transition-all space-y-3 shadow-xs ${
                issue.severity === 'CRITICAL' ? 'border-rose-200 dark:border-rose-800/80' : 'border-amber-200 dark:border-amber-800/80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(issue.severity)}
                    <span className="text-xs font-mono font-semibold text-slate-500">
                      {issue.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{issue.title}</h3>
                </div>
                {issue.day && issue.slotLabel && (
                  <div className="text-right font-mono text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{issue.day}</span>
                    <div>{issue.slotLabel}</div>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                {issue.explanation}
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-800 dark:text-slate-200">Suggested Action: </strong>
                  {issue.suggestedAction}
                </div>
                <button
                  onClick={() => handleFixAction(issue)}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 rounded-xl transition-colors flex items-center gap-1 shrink-0"
                >
                  <span>Resolve Constraint</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
