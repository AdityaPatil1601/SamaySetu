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
  Leaf,
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
import { BulbasaurNatureHero } from '../common/BulbasaurNatureHero';

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
    color1: '#059669',
    color2: '#A7F3D0',
  }));

  // Session Distribution Data (Theory vs Practical)
  const theoryCount = activeVersion?.assignments.filter(a => a.sessionType === 'Theory').length || 0;
  const practicalCount = activeVersion?.assignments.filter(a => a.sessionType === 'Practical').length || 0;
  const sessionData = [
    { name: 'Theory Lectures', value: theoryCount, color: '#059669' },
    { name: 'Lab Practicals', value: practicalCount, color: '#FB7185' },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Bulbasaur Nature Hero Banner */}
      <BulbasaurNatureHero
        title="Admin Sanctuary · Timetable Engine"
        subtitle={`Managing ${branches.length} branches, ${divisions.length} divisions, and ${faculty.length} faculty members with zero constraint conflicts.`}
        badgeText="🌿 Admin Sanctuary"
      />

      {/* College Banner & Admin Actions */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#BCE5D1] p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#059669] mb-1">
            <Building2 className="w-4 h-4" />
            <span>Shree L.R. Tiwari College of Engineering</span>
            <span aria-hidden="true">•</span>
            <span className="font-mono">Term 2026-27</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#133E35] tracking-tight">
            Institutional Administration Command Center
          </h1>
          <p className="text-xs sm:text-sm text-[#3D6456] mt-1">
            Centralized governance of multi-department academic timetables, faculty assignments, and students.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('admin_repair')}
            className="px-3.5 py-2 text-xs font-bold text-[#E11D48] bg-[#FFE4E6] hover:bg-[#FECDD3] border border-[#FDA4AF] rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Emergency Repair</span>
          </button>
          <button
            onClick={() => onNavigate('admin_generator')}
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Cpu className="w-4 h-4 text-[#D1FAE5]" />
            <span>Generate Timetable</span>
          </button>
          {activeVersion && (
            <button
              onClick={() => exportMasterTimetableCsv(activeVersion)}
              className="px-3.5 py-2 text-xs font-semibold text-[#133E35] bg-[#F0F9F5] hover:bg-[#CCE8DD]/40 border border-[#CCE8DD] rounded-xl transition-colors flex items-center gap-1.5"
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
          className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-[#BCE5D1] hover:border-[#10B981] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-[#3D6456] mb-2">
            <span className="text-xs font-semibold">Total Students</span>
            <Users className="w-4 h-4 text-[#10B981] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#133E35]">
            {students.length}
          </div>
          <div className="text-[11px] text-[#3D6456] mt-1 flex items-center gap-1">
            <span>Enrolled across {activeDivisions.length} divisions</span>
          </div>
        </div>

        {/* Total Teachers */}
        <div
          onClick={() => onNavigate('admin_teachers')}
          className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-[#BCE5D1] hover:border-[#10B981] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-[#3D6456] mb-2">
            <span className="text-xs font-semibold">Total Teachers</span>
            <GraduationCap className="w-4 h-4 text-[#10B981] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#133E35]">
            {activeFaculty.length}
          </div>
          <div className="text-[11px] text-[#3D6456] mt-1">
            Cross-branch faculty pool
          </div>
        </div>

        {/* Total Courses / Classes */}
        <div
          onClick={() => onNavigate('admin_courses')}
          className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-[#BCE5D1] hover:border-[#10B981] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-[#3D6456] mb-2">
            <span className="text-xs font-semibold">Courses & Classes</span>
            <BookOpen className="w-4 h-4 text-[#10B981] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#133E35]">
            {subjects.length}
          </div>
          <div className="text-[11px] text-[#3D6456] mt-1">
            {activeDivisions.length} active class sections
          </div>
        </div>

        {/* Conflict Diagnostics */}
        <div
          onClick={() => onNavigate('admin_diagnostics')}
          className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-[#BCE5D1] hover:border-[#10B981] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-[#3D6456] mb-2">
            <span className="text-xs font-semibold">Constraint Status</span>
            {validation.isValid ? (
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-[#FB7185] animate-bounce" />
            )}
          </div>
          <div className={`text-2xl font-bold font-mono ${validation.isValid ? 'text-[#059669]' : 'text-[#E11D48]'}`}>
            {validation.isValid ? 'Conflict-Free' : `${validation.criticalCount} Clashes`}
          </div>
          <div className="text-[11px] text-[#3D6456] mt-1">
            {scheduledCount} active sessions verified
          </div>
        </div>
      </div>

      {/* Visual Charts: Faculty Workload & Attendance Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Faculty Workload Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0D2F27] p-5 rounded-2xl border border-[#CCE8DD] dark:border-[#1B5244] space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#133E35] dark:text-white">Faculty Weekly Teaching Quota</h2>
              <p className="text-xs text-[#3D6456] dark:text-[#A7F3D0]">Assigned lecture hours vs maximum allowed capacity</p>
            </div>
            <button
              onClick={() => onNavigate('admin_teachers')}
              className="text-xs text-[#059669] dark:text-[#80ED99] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Manage Teachers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <ComparisonBarChart data={facultyWorkloadData} height={200} />
        </div>

        {/* Academic Session Breakdown */}
        <div className="bg-white dark:bg-[#0D2F27] p-5 rounded-2xl border border-[#CCE8DD] dark:border-[#1B5244] flex flex-col justify-between shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-[#133E35] dark:text-white">Session Type Breakdown</h2>
            <p className="text-xs text-[#3D6456] dark:text-[#A7F3D0]">Classroom theory lectures vs laboratory practical sessions</p>
          </div>

          <div className="py-4">
            <DonutChart data={sessionData} size={150} centerLabel="Sessions" centerValue={scheduledCount} />
          </div>

          <div className="pt-3 border-t border-[#CCE8DD] dark:border-[#1B5244] flex items-center justify-between text-xs text-[#3D6456] dark:text-[#A7F3D0]">
            <span>Theory: <strong className="font-mono text-[#059669] dark:text-[#80ED99]">{theoryCount}</strong></span>
            <span>Labs: <strong className="font-mono text-[#FB7185]">{practicalCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="bg-white dark:bg-[#0D2F27] p-5 rounded-2xl border border-[#CCE8DD] dark:border-[#1B5244] space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#133E35] dark:text-white">Recent Campus & Schedule Activity</h2>
            <p className="text-xs text-[#3D6456] dark:text-[#A7F3D0]">Live audit trail of timetable changes, attendance, and administrative events</p>
          </div>
          <span className="text-xs font-mono text-[#059669] dark:text-[#80ED99] font-bold">{activities.length} entries</span>
        </div>

        <div className="space-y-2.5 max-h-60 overflow-y-auto">
          {activities.slice(0, 5).map(act => (
            <div
              key={act.id}
              className="p-3 bg-[#F0F9F5] dark:bg-[#133E35]/60 rounded-xl border border-[#CCE8DD] dark:border-[#1B5244] flex items-start gap-3"
            >
              <div className="p-2 rounded-lg bg-white dark:bg-[#0D2F27] text-[#059669] dark:text-[#80ED99] shadow-2xs shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#133E35] dark:text-white truncate">
                    {act.title}
                  </span>
                  <span className="text-[10px] text-[#3D6456] dark:text-[#A7F3D0] font-mono shrink-0">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-[#3D6456] dark:text-[#A7F3D0] mt-0.5 leading-relaxed">
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
