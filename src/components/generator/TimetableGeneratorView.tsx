import React, { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Play,
  ShieldCheck,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  CollegeSettings,
  Branch,
  Division,
  Faculty,
  Room,
  Subject,
  ScheduleVersion,
  RequiredSession,
} from '../../types';
import { ConstraintSolver } from '../../services/solver/constraintEngine';
import { CollegeStorage } from '../../services/storage/collegeStorage';
import { NavItemKey } from '../layout/Sidebar';

interface TimetableGeneratorViewProps {
  settings: CollegeSettings;
  branches: Branch[];
  divisions: Division[];
  faculty: Faculty[];
  rooms: Room[];
  subjects: Subject[];
  requiredSessions: RequiredSession[];
  activeVersion: ScheduleVersion | null;
  onSaveVersion: (version: ScheduleVersion) => void;
  onPublishVersion: (version: ScheduleVersion) => void;
  onNavigate: (tab: NavItemKey) => void;
}

export const TimetableGeneratorView: React.FC<TimetableGeneratorViewProps> = ({
  settings,
  branches,
  divisions,
  faculty,
  rooms,
  subjects,
  requiredSessions,
  activeVersion,
  onSaveVersion,
  onPublishVersion,
  onNavigate,
}) => {
  const [isSolving, setIsSolving] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [progressPct, setProgressPct] = useState(0);
  const [cancelRequested, setCancelRequested] = useState(false);
  const [latestGenerated, setLatestGenerated] = useState<ScheduleVersion | null>(activeVersion);

  const activeDivisions = divisions.filter(d => d.active);
  const activeFaculty = faculty.filter(f => f.active);
  const activeRooms = rooms.filter(r => r.active);
  const unassignedSubjects = subjects.filter(s => s.eligibleFacultyIds.length === 0);

  const checklist = [
    {
      title: 'College Structure & Divisions',
      status: activeDivisions.length > 0,
      detail: `${activeDivisions.length} active divisions across ${branches.length} branches`,
    },
    {
      title: 'Faculty Qualifications',
      status: activeFaculty.length > 0 && unassignedSubjects.length === 0,
      detail: unassignedSubjects.length === 0
        ? `${activeFaculty.length} professors with qualified subject mappings`
        : `${unassignedSubjects.length} subject(s) lack assigned eligible faculty`,
    },
    {
      title: 'Laboratories & Classrooms',
      status: activeRooms.length > 0,
      detail: `${activeRooms.length} facilities ready (${rooms.filter(r => r.type.includes('Lab')).length} specialized labs)`,
    },
    {
      title: 'Working Hours & Slots',
      status: settings.slots.length >= 6,
      detail: `${settings.workingDays.length} working days, ${settings.slots.length} time slots per day`,
    },
  ];

  const isReadyToSolve = checklist.every(c => c.status);

  const handleGenerate = async () => {
    setIsSolving(true);
    setCancelRequested(false);
    setProgressMsg('Initializing constraint variables and domain intervals...');
    setProgressPct(10);

    const solver = new ConstraintSolver(
      settings,
      faculty,
      rooms,
      divisions,
      subjects
    );

    try {
      const generated = await solver.solve({
        timeoutMs: 9000,
        shouldCancel: () => cancelRequested,
        onProgress: p => {
          const pct = Math.min(95, Math.round((p.current / p.total) * 100));
          setProgressPct(pct);
          setProgressMsg(p.message);
        },
      });

      setLatestGenerated(generated);
      onSaveVersion(generated);
      CollegeStorage.logActivity(
        'GENERATE',
        `Timetable Generated (${generated.metrics.solverStatus})`,
        `Scheduled ${generated.assignments.length} of ${generated.metrics.totalRequiredSessions} required sessions in ${generated.metrics.executionTimeMs}ms.`
      );
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      setIsSolving(false);
      setProgressPct(100);
    }
  };

  const handlePublish = () => {
    if (!latestGenerated) return;
    onPublishVersion(latestGenerated);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>Scheduling Engine</span>
            <span aria-hidden="true">•</span>
            <span>Google OR-Tools CP-SAT Compatible Architecture</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Centralized College Timetable Generator
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Coordinates all academic years, branches, faculty, and laboratories simultaneously without isolated departmental silos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {latestGenerated && !latestGenerated.isPublished && (
            <button
              onClick={handlePublish}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Schedule</span>
            </button>
          )}

          <button
            onClick={handleGenerate}
            disabled={isSolving || !isReadyToSolve}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isSolving ? 'Solving Constraints...' : 'Generate Master Timetable'}</span>
          </button>
        </div>
      </div>

      {/* Progress Card during solve */}
      {isSolving && (
        <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
              <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                Constraint Programming Solver Active
              </span>
            </div>
            <button
              onClick={() => setCancelRequested(true)}
              className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline"
            >
              Cancel Solver
            </button>
          </div>
          <div className="w-full bg-indigo-100 dark:bg-indigo-900/50 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-indigo-900 dark:text-indigo-300 font-mono line-clamp-1">{progressMsg}</p>
        </div>
      )}

      {/* Grid: Readiness Checklist & Input Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Readiness Checklist */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Constraint Readiness Checklist</h2>
            <ShieldCheck className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {checklist.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                {item.status ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">{item.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              All mandatory hard constraints are compiled into multi-dimensional decision domains before execution.
            </span>
          </div>
        </div>

        {/* Solver Configuration & Metrics */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Input Metrics & Configuration</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Summary of resource capacity and lecture requirements</p>
            </div>
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
              Term: {settings.academicTerm}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Required Sessions</span>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">{requiredSessions.length}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Available Slots / Wk</span>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                {settings.workingDays.length * settings.slots.length}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Total Divisions</span>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">{activeDivisions.length}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Rooms & Labs</span>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">{activeRooms.length}</span>
            </div>
          </div>

          {/* Results Summary if Generated */}
          {latestGenerated && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Latest Solver Result:</span>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${
                    latestGenerated.metrics.solverStatus === 'OPTIMAL'
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
                      : 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300'
                  }`}
                >
                  Status: {latestGenerated.metrics.solverStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Scheduled</span>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-base">
                    {latestGenerated.assignments.length} / {latestGenerated.metrics.totalRequiredSessions}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Unassigned</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-slate-100 text-base">
                    {latestGenerated.metrics.unassignedSessions}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Hard Violations</span>
                  <span className={`font-bold font-mono text-base ${latestGenerated.metrics.hardConstraintViolations === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                    {latestGenerated.metrics.hardConstraintViolations}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Solve Time</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-slate-100 text-base">
                    {latestGenerated.metrics.executionTimeMs} ms
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Solver Core: <strong className="text-slate-700 dark:text-slate-300">{latestGenerated.metrics.engineUsed}</strong>
                </div>
                <button
                  onClick={() => onNavigate('timetable')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <span>Open Master Timetable</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
