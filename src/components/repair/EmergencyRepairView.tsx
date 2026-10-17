import React, { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  ScheduleVersion,
  Faculty,
  Room,
  Division,
  Subject,
  CollegeSettings,
  EmergencyRepairRequest,
  EmergencyRepairResult,
  ScheduleAssignment,
  DayOfWeek,
} from '../../types';
import { EmergencyRepairEngine } from '../../services/solver/emergencyRepairEngine';
import { CollegeStorage } from '../../services/storage/collegeStorage';
import { NavItemKey } from '../layout/Sidebar';

interface EmergencyRepairViewProps {
  publishedVersion: ScheduleVersion | null;
  faculty: Faculty[];
  rooms: Room[];
  divisions: Division[];
  subjects: Subject[];
  settings: CollegeSettings;
  onApproveRepair: (repairedVersion: ScheduleVersion) => void;
  onNavigate: (tab: NavItemKey) => void;
}

export const EmergencyRepairView: React.FC<EmergencyRepairViewProps> = ({
  publishedVersion,
  faculty,
  rooms,
  divisions,
  subjects,
  settings,
  onApproveRepair,
  onNavigate,
}) => {
  const [disruptionTarget, setDisruptionTarget] = useState<'faculty' | 'room'>('faculty');
  const [targetFacultyId, setTargetFacultyId] = useState<string>('fac-sharma');
  const [targetRoomId, setTargetRoomId] = useState<string>(rooms[0]?.id || '');
  const [affectedDay, setAffectedDay] = useState<DayOfWeek>('Wednesday');
  const [startSlotIndex, setStartSlotIndex] = useState<number>(1);
  const [endSlotIndex, setEndSlotIndex] = useState<number>(2);
  const [reason, setReason] = useState<string>('Medical emergency / external university inspection');
  const [allowSubstituteFaculty, setAllowSubstituteFaculty] = useState<boolean>(true);

  const [repairResult, setRepairResult] = useState<EmergencyRepairResult | null>(null);
  const [isRepairing, setIsRepairing] = useState<boolean>(false);

  const engine = publishedVersion
    ? new EmergencyRepairEngine(
        publishedVersion,
        settings,
        faculty,
        rooms,
        divisions,
        subjects
      )
    : null;

  const currentRequest: EmergencyRepairRequest = {
    targetFacultyId: disruptionTarget === 'faculty' ? targetFacultyId : undefined,
    targetRoomId: disruptionTarget === 'room' ? targetRoomId : undefined,
    affectedDay,
    startSlotIndex: Number(startSlotIndex),
    endSlotIndex: Number(endSlotIndex),
    reason,
    allowFacultySubstitution: allowSubstituteFaculty,
  };

  const previewAffected: ScheduleAssignment[] = engine
    ? engine.previewAffectedSessions(currentRequest)
    : [];

  const handleLoadDemoScenario = () => {
    setDisruptionTarget('faculty');
    setTargetFacultyId('fac-sharma');
    setAffectedDay('Wednesday');
    setStartSlotIndex(1);
    setEndSlotIndex(2);
    setReason('Prof. Ramesh Sharma urgent departmental committee meeting & medical leave');
    setAllowSubstituteFaculty(true);
    setRepairResult(null);
  };

  const handleRunRepair = () => {
    if (!engine) return;
    setIsRepairing(true);
    setTimeout(() => {
      const res = engine.repair(currentRequest);
      setRepairResult(res);
      setIsRepairing(false);
      CollegeStorage.logActivity(
        'REPAIR',
        `Emergency Timetable Repair Executed`,
        `Identified ${res.affectedCount} affected session(s), rescheduled ${res.rescheduledCount}.`
      );
    }, 400);
  };

  const handleApprove = () => {
    if (!repairResult || !repairResult.proposedVersion) return;
    onApproveRepair(repairResult.proposedVersion);
    setRepairResult(null);
  };

  const handleReject = () => {
    setRepairResult(null);
  };

  if (!publishedVersion) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="p-6 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl inline-block">
          <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
          <h2 className="text-base font-bold text-amber-950 dark:text-amber-200">No Published Timetable to Repair</h2>
          <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 max-w-md">
            Emergency repair operates against an existing, active master timetable. Please generate and publish a timetable first.
          </p>
        </div>
        <div>
          <button
            onClick={() => onNavigate('admin_generator')}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
          >
            Go to Timetable Generator
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">
            <Wrench className="w-3.5 h-3.5" />
            <span>Intelligent Constraint-Repair Engine</span>
            <span aria-hidden="true">•</span>
            <span>Active Master: v{publishedVersion.versionNumber}.0</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Emergency Timetable Disruption & Rescheduling
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Reschedules affected sessions while locking 100% of unaffected college lectures to avoid campus-wide schedule churn.
          </p>
        </div>

        <button
          onClick={handleLoadDemoScenario}
          className="px-3.5 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Load Demo: Prof. Sharma Disruption</span>
        </button>
      </div>

      {/* Disruption Configuration Form */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">1. Define Disruption Parameters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Disruption Target</label>
            <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setDisruptionTarget('faculty')}
                className={`flex-1 py-2 font-medium transition-colors ${
                  disruptionTarget === 'faculty' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => setDisruptionTarget('room')}
                className={`flex-1 py-2 font-medium transition-colors ${
                  disruptionTarget === 'room' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Room/Lab
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
              {disruptionTarget === 'faculty' ? 'Unavailable Professor' : 'Unavailable Room'}
            </label>
            {disruptionTarget === 'faculty' ? (
              <select
                value={targetFacultyId}
                onChange={e => setTargetFacultyId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
              >
                {faculty.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.employeeId})
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={targetRoomId}
                onChange={e => setTargetRoomId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.roomNumber} - {r.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Affected Day</label>
            <select
              value={affectedDay}
              onChange={e => setAffectedDay(e.target.value as DayOfWeek)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
            >
              {settings.workingDays.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Time Slot Window</label>
            <div className="flex items-center gap-1.5">
              <select
                value={startSlotIndex}
                onChange={e => setStartSlotIndex(Number(e.target.value))}
                className="text-xs px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex-1 font-mono text-slate-900 dark:text-slate-100"
              >
                {settings.slots.map(s => (
                  <option key={s.slotIndex} value={s.slotIndex}>
                    {s.startTime}
                  </option>
                ))}
              </select>
              <span className="text-slate-400 text-xs">to</span>
              <select
                value={endSlotIndex}
                onChange={e => setEndSlotIndex(Number(e.target.value))}
                className="text-xs px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex-1 font-mono text-slate-900 dark:text-slate-100"
              >
                {settings.slots.map(s => (
                  <option key={s.slotIndex} value={s.slotIndex}>
                    {s.endTime}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Reason for Emergency Disruption</label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="allowSub"
              checked={allowSubstituteFaculty}
              onChange={e => setAllowSubstituteFaculty(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600"
            />
            <label htmlFor="allowSub" className="text-xs text-slate-700 dark:text-slate-300">
              Allow eligible qualified substitute faculty
            </label>
          </div>
        </div>
      </div>

      {/* 2. Impact Preview Section */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">2. Affected Sessions Preview</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Detected in published schedule on {affectedDay} ({settings.slots[startSlotIndex]?.startTime} - {settings.slots[endSlotIndex]?.endTime})
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-2 py-1 rounded-lg">
            {previewAffected.length} Impacted Session{previewAffected.length === 1 ? '' : 's'}
          </span>
        </div>

        {previewAffected.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              No sessions scheduled during this window for the selected resource.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {previewAffected.map(a => (
              <div
                key={a.id}
                className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{a.subjectCode}</span>
                    <span className="text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 px-1.5 py-0.2 rounded font-semibold">
                      {a.sessionType} ({a.durationSlots}h)
                    </span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 font-medium mt-0.5">{a.subjectName}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Class: <span className="text-slate-800 dark:text-slate-200 font-medium">{a.divisionName}</span>
                    {a.batchName && ` (Batch ${a.batchName})`} • Room:{' '}
                    <span className="font-mono text-slate-800 dark:text-slate-200">{a.roomNumber}</span>
                  </div>
                </div>
                <div className="text-right font-mono text-[11px] text-slate-500 shrink-0">
                  <div>{a.day}</div>
                  <div className="font-semibold text-amber-900 dark:text-amber-300">{a.timeRange}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleRunRepair}
            disabled={previewAffected.length === 0 || isRepairing}
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Wrench className="w-4 h-4" />
            <span>{isRepairing ? 'Optimizing Repair...' : 'Execute Emergency Timetable Repair'}</span>
          </button>
        </div>
      </div>

      {/* 3. Proposed Repair Solution & Diff View */}
      {repairResult && (
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800 font-mono">
                  PROPOSED REVISION: v{repairResult.proposedVersion.versionNumber}.0
                </span>
                <span className="text-xs text-slate-500">
                  {repairResult.rescheduledCount} Rescheduled • {repairResult.unresolvedCount} Unresolved
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                Before & After Schedule Comparison
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{repairResult.explanation}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReject}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                Reject Changes
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Publish Revised Timetable</span>
              </button>
            </div>
          </div>

          {/* Delta Changes Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">Subject & Class</th>
                  <th className="py-2.5 px-3">Original Schedule</th>
                  <th className="py-2.5 px-3">Proposed Reschedule</th>
                  <th className="py-2.5 px-3">Faculty Assignment</th>
                  <th className="py-2.5 px-3">Room Assignment</th>
                  <th className="py-2.5 px-3">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {repairResult.changes.map(chg => (
                  <tr key={chg.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{chg.subjectName}</div>
                      <div className="text-slate-500 text-[11px]">{chg.divisionName}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-rose-800 dark:text-rose-300 bg-rose-50/50 dark:bg-rose-950/20">
                      <div>{chg.originalAssignment?.day}</div>
                      <div>{chg.originalAssignment?.timeRange}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20">
                      <div>{chg.newAssignment?.day}</div>
                      <div>{chg.newAssignment?.timeRange}</div>
                    </td>
                    <td className="py-3 px-3">
                      {chg.originalAssignment?.facultyName !== chg.newAssignment?.facultyName ? (
                        <div>
                          <span className="line-through text-slate-400 block text-[11px]">
                            {chg.originalAssignment?.facultyName}
                          </span>
                          <span className="font-semibold text-indigo-700 dark:text-indigo-400">
                            {chg.newAssignment?.facultyName} (Substitute)
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-700 dark:text-slate-300">{chg.newAssignment?.facultyName}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {chg.originalAssignment?.roomNumber !== chg.newAssignment?.roomNumber ? (
                        <div>
                          <span className="line-through text-slate-400 block text-[11px]">
                            {chg.originalAssignment?.roomNumber}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {chg.newAssignment?.roomNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-700 dark:text-slate-300">{chg.newAssignment?.roomNumber}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-500 dark:text-slate-400 max-w-xs">
                      {chg.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
