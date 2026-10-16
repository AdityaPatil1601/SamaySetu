import React, { useState } from 'react';
import {
  Download,
  Users,
  DoorOpen,
  Building2,
  History,
  TrendingUp,
} from 'lucide-react';
import {
  ScheduleVersion,
  Faculty,
  Room,
  Branch,
  Division,
  CollegeSettings,
} from '../../types';
import { exportMasterTimetableCsv } from '../../services/export/csvExporter';

interface ReportsAnalyticsViewProps {
  versions: ScheduleVersion[];
  activeVersion: ScheduleVersion | null;
  faculty: Faculty[];
  rooms: Room[];
  branches: Branch[];
  divisions: Division[];
  settings: CollegeSettings;
  onSelectVersion: (version: ScheduleVersion) => void;
}

export const ReportsAnalyticsView: React.FC<ReportsAnalyticsViewProps> = ({
  versions,
  activeVersion,
  faculty,
  rooms,
  branches,
  divisions,
  settings,
  onSelectVersion,
}) => {
  type SubTab = 'faculty_workload' | 'room_utilization' | 'branch_summary' | 'version_history';
  const [activeTab, setActiveTab] = useState<SubTab>('faculty_workload');
  const assignments = activeVersion?.assignments || [];

  // Faculty Workload
  const facultyReport = faculty.map(fac => {
    const facAssignments = assignments.filter(a => a.facultyId === fac.id);
    const theoryHours = facAssignments
      .filter(a => a.sessionType === 'Theory')
      .reduce((sum, a) => sum + a.durationSlots, 0);
    const practicalHours = facAssignments
      .filter(a => a.sessionType === 'Practical')
      .reduce((sum, a) => sum + a.durationSlots, 0);
    const totalHours = theoryHours + practicalHours;
    const utilizationPct = Math.round((totalHours / fac.maxWeeklyHours) * 100);

    return {
      fac,
      theoryHours,
      practicalHours,
      totalHours,
      utilizationPct,
    };
  });

  // Room Utilization
  const roomReport = rooms.map(room => {
    const rAssignments = assignments.filter(a => a.roomId === room.id);
    const weeklyHours = rAssignments.reduce((sum, a) => sum + a.durationSlots, 0);
    const maxCapacityHours = settings.workingDays.length * settings.slots.length;
    const utilizationPct = Math.round((weeklyHours / maxCapacityHours) * 100);

    return {
      room,
      weeklyHours,
      maxCapacityHours,
      utilizationPct,
      sessionCount: rAssignments.length,
    };
  });

  // Branch Summary
  const branchReport = branches.map(branch => {
    const bDivs = divisions.filter(d => d.branchId === branch.id && d.active);
    const bAssignments = assignments.filter(a => a.branchId === branch.id);
    const totalHours = bAssignments.reduce((sum, a) => sum + a.durationSlots, 0);

    return {
      branch,
      divisionsCount: bDivs.length,
      totalStudents: bDivs.reduce((sum, d) => sum + d.studentCount, 0),
      sessionsScheduled: bAssignments.length,
      weeklyHours: totalHours,
    };
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>Institutional Governance & Analytics</span>
            <span aria-hidden="true">•</span>
            <span>Accreditation Ready Audit Tables</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Workload Distribution & Campus Resource Analytics
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Comprehensive audit reports on faculty teaching load, physical laboratory utilization, and schedule version lineage.
          </p>
        </div>

        {activeVersion && (
          <button
            onClick={() => exportMasterTimetableCsv(activeVersion)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export Complete Master CSV</span>
          </button>
        )}
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('faculty_workload')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'faculty_workload'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Faculty Teaching Workload</span>
        </button>

        <button
          onClick={() => setActiveTab('room_utilization')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'room_utilization'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <DoorOpen className="w-3.5 h-3.5" />
          <span>Facility & Lab Utilization</span>
        </button>

        <button
          onClick={() => setActiveTab('branch_summary')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'branch_summary'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Departmental Coverage</span>
        </button>

        <button
          onClick={() => setActiveTab('version_history')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'version_history'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Schedule Versions ({versions.length})</span>
        </button>
      </div>

      {/* 1. FACULTY WORKLOAD TABLE */}
      {activeTab === 'faculty_workload' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs space-y-4 p-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Faculty Weekly Teaching Quota vs Actual Load</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Calculated directly from the active published master timetable.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">Emp ID</th>
                  <th className="py-2.5 px-3">Faculty Member</th>
                  <th className="py-2.5 px-3">Home Dept</th>
                  <th className="py-2.5 px-3">Theory Hours</th>
                  <th className="py-2.5 px-3">Lab Hours</th>
                  <th className="py-2.5 px-3">Total Assigned</th>
                  <th className="py-2.5 px-3">Max Agreed</th>
                  <th className="py-2.5 px-3">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {facultyReport.map(r => (
                  <tr key={r.fac.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-mono text-slate-500">{r.fac.employeeId}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {r.fac.name}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{r.fac.department}</td>
                    <td className="py-3 px-3 font-mono">{r.theoryHours} hrs</td>
                    <td className="py-3 px-3 font-mono">{r.practicalHours} hrs</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">{r.totalHours} hrs</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{r.fac.maxWeeklyHours} hrs</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              r.utilizationPct > 100
                                ? 'bg-rose-500'
                                : r.utilizationPct > 80
                                ? 'bg-amber-500'
                                : 'bg-indigo-600'
                            }`}
                            style={{ width: `${Math.min(100, r.utilizationPct)}%` }}
                          />
                        </div>
                        <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300 font-medium">
                          {r.utilizationPct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. ROOM UTILIZATION TABLE */}
      {activeTab === 'room_utilization' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs space-y-4 p-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Room & Laboratory Capacity Utilization</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Weekly occupancy based on available operating periods.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">Room #</th>
                  <th className="py-2.5 px-3">Facility Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Capacity</th>
                  <th className="py-2.5 px-3">Weekly Hours</th>
                  <th className="py-2.5 px-3">Total Sessions</th>
                  <th className="py-2.5 px-3">Utilization Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {roomReport.map(r => (
                  <tr key={r.room.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">{r.room.roomNumber}</td>
                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">{r.room.name}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        {r.room.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono">{r.room.capacity} seats</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">{r.weeklyHours} hrs</td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">{r.sessionCount}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-sky-500 rounded-full"
                            style={{ width: `${Math.min(100, r.utilizationPct)}%` }}
                          />
                        </div>
                        <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300 font-medium">
                          {r.utilizationPct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. BRANCH SUMMARY TABLE */}
      {activeTab === 'branch_summary' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs space-y-4 p-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Branch Academic Delivery Coverage</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total sessions and teaching hours delivered per engineering branch.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">Branch Code</th>
                  <th className="py-2.5 px-3">Branch Name</th>
                  <th className="py-2.5 px-3">Active Divisions</th>
                  <th className="py-2.5 px-3">Total Students</th>
                  <th className="py-2.5 px-3">Scheduled Sessions</th>
                  <th className="py-2.5 px-3">Total Teaching Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {branchReport.map(b => (
                  <tr key={b.branch.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">{b.branch.code}</td>
                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">{b.branch.name}</td>
                    <td className="py-3 px-3 font-mono">{b.divisionsCount} divs</td>
                    <td className="py-3 px-3 font-mono">{b.totalStudents} students</td>
                    <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{b.sessionsScheduled}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">{b.weeklyHours} hrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SCHEDULE VERSION HISTORY */}
      {activeTab === 'version_history' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs space-y-4 p-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Master Schedule Version Lineage</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Historical records of generated, repaired, and approved timetables.</p>
          </div>

          {versions.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 italic">No saved versions found.</p>
          ) : (
            <div className="space-y-3">
              {versions.map(ver => (
                <div
                  key={ver.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    ver.isPublished
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                        v{ver.versionNumber}.0
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                          ver.isPublished
                            ? 'bg-emerald-600 text-white'
                            : ver.status === 'Proposed Repair'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {ver.status}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(ver.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{ver.title}</h3>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-3">
                      <span>Sessions: <strong className="font-mono">{ver.assignments.length}</strong></span>
                      <span>Violations: <strong className="font-mono">{ver.metrics.hardConstraintViolations}</strong></span>
                      <span>Solver Engine: <span className="font-medium">{ver.metrics.engineUsed}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectVersion(ver)}
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 hover:bg-indigo-50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs"
                    >
                      Inspect Timetable
                    </button>
                    <button
                      onClick={() => exportMasterTimetableCsv(ver)}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 bg-white dark:bg-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 dark:border-slate-700"
                      title="Download CSV"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
