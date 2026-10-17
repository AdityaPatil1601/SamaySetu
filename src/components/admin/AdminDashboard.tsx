import React from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarRange,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Wrench,
  TrendingUp,
  Clock,
  ArrowRight,
  Download,
  Building2,
} from 'lucide-react';
import {
  Branch,
  Division,
  Faculty,
  Room,
  Subject,
  ScheduleVersion,
  ValidationResult,
  Student,
} from '../../types';
import { ActivityItem } from '../../services/storage/collegeStorage';
import { NavItemKey } from '../layout/Sidebar';
import { exportMasterTimetableCsv } from '../../services/export/csvExporter';
import { ComparisonBarChart, DonutChart } from '../common/SimpleCharts';

interface AdminDashboardProps {
  branches: Branch[];
  divisions: Division[];
  faculty: Faculty[];
  rooms: Room[];
  subjects: Subject[];
  students: Student[];
  activeVersion: ScheduleVersion | null;
  validation: ValidationResult;
  activities: ActivityItem[];
  onNavigate: (tab: NavItemKey) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  branches,
  divisions,
  faculty,
  rooms,
  subjects,
  students,
  activeVersion,
  validation,
  activities,
  onNavigate,
}) => {
  const activeDivisions = divisions.filter(d => d.active);
  const activeFaculty = faculty.filter(f => f.active);
  const scheduledCount = activeVersion?.assignments.length || 0;

  // Workload Chart Data
  const facultyHoursMap = new Map<string, number>();
  activeVersion?.assignments.forEach(a => {
    const cur = facultyHoursMap.get(a.facultyId) || 0;
    facultyHoursMap.set(a.facultyId, cur + a.durationSlots);
  });

  const facultyWorkloadData = faculty.slice(0, 6).map(f => ({
    name: f.name.replace('Prof. ', '').replace('Dr. ', ''),
    value1: facultyHoursMap.get(f.id) || 0,
    value2: f.maxWeeklyHours,
    label1: 'Assigned',
    label2: 'Quota',
    color1: '#244B3B',
    color2: '#E2D5B8',
  }));

  // Session Distribution Data (Theory vs Practical)
  const theoryCount = activeVersion?.assignments.filter(a => a.sessionType === 'Theory').length || 0;
  const practicalCount = activeVersion?.assignments.filter(a => a.sessionType === 'Practical').length || 0;
  const sessionData = [
    { name: 'Theory Lectures', value: theoryCount, color: '#244B3B' },
    { name: 'Lab Practicals', value: practicalCount, color: '#C66A4A' },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* College Banner & Admin Actions */}
      <div className="bg-white rounded-xl border border-[#E2D5B8] p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#244B3B] mb-1">
            <Building2 className="w-4 h-4" />
            <span>Sardar Patel Institute of Technology & Engineering</span>
            <span aria-hidden="true">•</span>
            <span>Odd Term 2026-27</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#22252A] tracking-tight">
            Institutional Administration Command Center
          </h1>
          <p className="text-xs sm:text-sm text-[#535965] mt-1">
            Centralized governance of multi-department academic timetables, faculty assignments, and students.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('admin_repair')}
            className="px-3.5 py-2 text-xs font-bold text-[#C66A4A] bg-[#FDF3EF] hover:bg-[#C66A4A]/20 border border-[#C66A4A]/30 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Emergency Repair</span>
          </button>
          <button
            onClick={() => onNavigate('admin_generator')}
            className="px-4 py-2 text-xs font-bold text-white bg-[#244B3B] hover:bg-[#1A372B] rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Cpu className="w-4 h-4 text-[#E2D5B8]" />
            <span>Generate Timetable</span>
          </button>
          {activeVersion && (
            <button
              onClick={() => exportMasterTimetableCsv(activeVersion)}
              className="px-3.5 py-2 text-xs font-semibold text-[#22252A] bg-[#F6F1E8] hover:bg-[#E2D5B8]/40 border border-[#E2D5B8] rounded-xl transition-colors flex items-center gap-1.5"
              title="Download Master CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#535965]" />
              <span>Export Master</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigate('admin_students')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Students</span>
            <Users className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
            {students.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span>Enrolled across {activeDivisions.length} divisions</span>
          </div>
        </div>

        {/* Total Teachers */}
        <div
          onClick={() => onNavigate('admin_teachers')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Teachers</span>
            <GraduationCap className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
            {activeFaculty.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Cross-branch faculty pool
          </div>
        </div>

        {/* Total Courses / Classes */}
        <div
          onClick={() => onNavigate('admin_courses')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Courses & Classes</span>
            <BookOpen className="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
            {subjects.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {activeDivisions.length} active class sections
          </div>
        </div>

        {/* Conflict Diagnostics */}
        <div
          onClick={() => onNavigate('admin_diagnostics')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Constraint Status</span>
            {validation.isValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />
            )}
          </div>
          <div className={`text-2xl font-bold font-mono ${validation.isValid ? 'text-emerald-600' : 'text-rose-600'}`}>
            {validation.isValid ? 'Conflict-Free' : `${validation.criticalCount} Clashes`}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {scheduledCount} active sessions verified
          </div>
        </div>
      </div>

      {/* Visual Charts: Faculty Workload & Attendance Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Faculty Workload Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Faculty Weekly Teaching Quota</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Assigned lecture hours vs maximum allowed capacity</p>
            </div>
            <button
              onClick={() => onNavigate('admin_teachers')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
            >
              <span>Manage Teachers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <ComparisonBarChart data={facultyWorkloadData} height={200} />
        </div>

        {/* Academic Session Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Session Type Breakdown</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Classroom theory lectures vs laboratory practical sessions</p>
          </div>

          <div className="py-4">
            <DonutChart data={sessionData} size={150} centerLabel="Sessions" centerValue={scheduledCount} />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Theory: <strong className="font-mono text-indigo-600">{theoryCount}</strong></span>
            <span>Labs: <strong className="font-mono text-emerald-600">{practicalCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recent Campus & Schedule Activity</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live audit trail of timetable changes, attendance, and administrative events</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{activities.length} entries</span>
        </div>

        <div className="space-y-2.5 max-h-60 overflow-y-auto">
          {activities.slice(0, 5).map(act => (
            <div
              key={act.id}
              className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-3"
            >
              <div className="p-2 rounded-lg bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {act.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {act.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
