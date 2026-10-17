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
          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black font-mono uppercase bg-[#DC2626] text-white shadow-2xs flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-white" />
            <span>Critical Violation</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black font-mono uppercase bg-[#F59E0B] text-white shadow-2xs flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-white" />
            <span>Soft Warning</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold font-mono uppercase bg-[#10B981] text-white shadow-2xs flex items-center gap-1">
            <Info className="w-3 h-3 text-white" />
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
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#BCE5D1] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#059669] mb-1">
            <span>Independent Verification Layer</span>
            <span aria-hidden="true">•</span>
            <span className="font-mono font-bold">13 Hard Constraint Invariants</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#133E35] tracking-tight">
            Schedule Conflict Diagnostics & Integrity Audit
          </h1>
          <p className="text-xs text-[#2D6A4F] mt-1">
            Evaluates the active master schedule against physical room collisions, double-booked professors, and batch conflicts.
          </p>
        </div>

        <button
          onClick={onRevalidate}
          className="px-3.5 py-2 text-xs font-bold text-[#134E3E] bg-[#EAF6F0] hover:bg-[#D7F2E3] border border-[#BCE5D1] rounded-xl transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#059669]" />
          <span>Re-verify Constraints</span>
        </button>
      </div>

      {/* Audit Status Banner - Vivid & Crisp */}
      <div
        className={`p-5 rounded-2xl border-2 flex items-start gap-4 shadow-sm ${
          validation.isValid
            ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46]'
            : 'bg-[#FEF2F2] border-[#EF4444] text-[#991B1B]'
        }`}
      >
        {validation.isValid ? (
          <CheckCircle2 className="w-6 h-6 text-[#10B981] shrink-0 mt-0.5" />
        ) : (
          <ShieldAlert className="w-6 h-6 text-[#DC2626] shrink-0 mt-0.5" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm sm:text-base font-black tracking-tight">
              {validation.isValid
                ? 'Master Timetable is 100% Conflict-Free'
                : `${validation.criticalCount} Critical Violations Detected`}
            </h2>
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border bg-white ${
              validation.isValid ? 'text-[#065F46] border-[#A7F3D0]' : 'text-[#DC2626] border-[#FCA5A5]'
            }`}>
              Verified: {new Date(validation.checkedAt).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-xs font-semibold mt-1 opacity-90">
            {validation.isValid
              ? 'No overlapping sessions for faculty, rooms, or student divisions. All laboratory types and faculty qualifications are honored.'
              : 'The timetable contains conflicting assignments that must be resolved prior to official college publication.'}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#BCE5D1] flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#059669]" />
          <span className="text-[#133E35] font-bold">Severity:</span>
          <div className="flex rounded-xl border border-[#BCE5D1] overflow-hidden p-0.5 bg-[#EAF6F0]">
            {(['ALL', 'CRITICAL', 'WARNING'] as const).map(s => {
              const isActive = severityFilter === s;
              let activeClass = 'bg-[#10B981] text-white shadow-xs';
              if (s === 'CRITICAL') activeClass = 'bg-[#DC2626] text-white shadow-xs';
              if (s === 'WARNING') activeClass = 'bg-[#F59E0B] text-white shadow-xs';

              return (
                <button
                  key={s}
                  onClick={() => setSeverityFilter(s)}
                  className={`px-3 py-1 font-extrabold rounded-lg text-[11px] transition-all ${
                    isActive
                      ? activeClass
                      : 'text-[#235848] hover:bg-[#D7F2E3]'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <span className="text-[#2D6A4F] font-mono text-xs font-semibold">
          Showing {filteredIssues.length} of {issues.length} diagnostic findings
        </span>
      </div>

      {/* Diagnostic Issues List */}
      {filteredIssues.length === 0 ? (
        <div className="p-12 text-center bg-white/95 backdrop-blur-md rounded-2xl border border-[#BCE5D1] space-y-2">
          <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto" />
          <h3 className="text-sm font-bold text-[#133E35]">Zero Invariants Violated</h3>
          <p className="text-xs text-[#2D6A4F] max-w-sm mx-auto">
            All timetable assignments satisfy physical room capacity, professor availability, and student division constraints.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIssues.map(issue => (
            <div
              key={issue.id}
              className={`p-4 sm:p-5 bg-white/95 backdrop-blur-md rounded-2xl border-2 transition-all space-y-3 shadow-xs ${
                issue.severity === 'CRITICAL' ? 'border-[#FCA5A5]' : 'border-[#FDE68A]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(issue.severity)}
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#F0FDF4] text-[#14532D] border border-[#86EFAC]">
                      {issue.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-[#133E35]">{issue.title}</h3>
                </div>
                {issue.day && issue.slotLabel && (
                  <div className="text-right font-mono text-xs text-[#14532D] bg-[#F0FDF4] px-2.5 py-1.5 rounded-xl border border-[#86EFAC]">
                    <span className="font-bold">{issue.day}</span>
                    <div className="text-[10px] opacity-80">{issue.slotLabel}</div>
                  </div>
                )}
              </div>

              <p className="text-xs text-[#14532D] leading-relaxed bg-[#F8FCF9] p-3 rounded-xl border border-[#86EFAC]/60 font-medium">
                {issue.explanation}
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-[#CCE8DD]/50">
                <div className="text-xs text-[#2D6A4F]">
                  <strong className="text-[#133E35]">Suggested Action: </strong>
                  {issue.suggestedAction}
                </div>
                <button
                  onClick={() => handleFixAction(issue)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                >
                  <span>Resolve Constraint</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
