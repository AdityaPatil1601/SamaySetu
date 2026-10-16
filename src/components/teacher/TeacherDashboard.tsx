import React, { useMemo } from 'react';
import {
  CalendarRange,
  Clock,
  Download,
  Printer,
  FileSpreadsheet,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  UserCheck,
  DoorOpen,
  Sparkles,
  CalendarPlus,
} from 'lucide-react';
import {
  Faculty,
  ScheduleVersion,
  CollegeSettings,
  Division,
  Room,
  Subject,
  DayOfWeek,
  SubstitutionRequest,
} from '../../types';
import { NavItemKey } from '../layout/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { downloadTimetablePdf } from '../../services/export/pdfExporter';
import { exportTimetableCsv } from '../../services/export/excelExporter';

interface TeacherDashboardProps {
  currentFaculty: Faculty;
  activeVersion: ScheduleVersion | null;
  settings: CollegeSettings;
  divisions: Division[];
  rooms: Room[];
  subjects: Subject[];
  substitutions: SubstitutionRequest[];
  onNavigate: (tab: NavItemKey) => void;
  onOpenPdfPreview: () => void;
  onOpenScheduleClass?: () => void;
  allFaculty?: Faculty[];
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentFaculty,
  activeVersion,
  settings,
  divisions,
  rooms,
  subjects,
  substitutions,
  onNavigate,
  onOpenPdfPreview,
  onOpenScheduleClass,
  allFaculty = [],
}) => {
  const { availableUsers, switchUser } = useAuth();

  // Current Day
  const todayDayName = useMemo<DayOfWeek>(() => {
    const days: DayOfWeek[] = ['Sunday' as DayOfWeek, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const current = days[new Date().getDay()];
    return settings.workingDays.includes(current) ? current : settings.workingDays[0] || 'Monday';
  }, [settings.workingDays]);

  // All assignments for this faculty
  const myAssignments = useMemo(() => {
    if (!activeVersion) return [];
    return activeVersion.assignments.filter(a => a.facultyId === currentFaculty.id);
  }, [activeVersion, currentFaculty.id]);

  // Today's assignments sorted by slot
  const todaysAssignments = useMemo(() => {
    return myAssignments
      .filter(a => a.day === todayDayName)
      .sort((a, b) => a.startSlotIndex - b.startSlotIndex);
  }, [myAssignments, todayDayName]);

  // Workload metrics
  const totalWeeklyHours = useMemo(() => {
    return myAssignments.reduce((acc, a) => acc + a.durationSlots, 0);
  }, [myAssignments]);

  const theoryHours = useMemo(() => {
    return myAssignments.filter(a => a.sessionType === 'Theory').length;
  }, [myAssignments]);

  const practicalHours = useMemo(() => {
    return myAssignments.filter(a => a.sessionType === 'Practical').reduce((sum, a) => sum + a.durationSlots, 0);
  }, [myAssignments]);

  // Pending substitutions involving this faculty
  const pendingRequests = useMemo(() => {
    return substitutions.filter(
      s => s.status === 'PENDING' && (s.targetFacultyId === currentFaculty.id || !s.targetFacultyId)
    );
  }, [substitutions, currentFaculty.id]);

  const handleTeacherSelect = (teacherUserId: string) => {
    const user = availableUsers.find(u => u.id === teacherUserId);
    if (user) {
      switchUser(user);
    }
  };

  const handleDownloadPdf = () => {
    if (!activeVersion) return;
    downloadTimetablePdf(
      {
        type: 'Teacher',
        title: `Faculty Timetable - ${currentFaculty.name}`,
        subTitle: `${currentFaculty.department} · ${settings.collegeName}`,
        collegeName: settings.collegeName,
        academicTerm: settings.academicTerm,
        filenameIdentifier: `Faculty_${currentFaculty.name.replace(/\s+/g, '_')}`,
      },
      settings,
      myAssignments,
      subjects,
      'teacher'
    );
  };

  const handleExportCsv = () => {
    if (!activeVersion) return;
    exportTimetableCsv(
      'teacher',
      currentFaculty.id,
      currentFaculty.name,
      myAssignments,
      settings,
      subjects
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Top Banner: Faculty Identity & Quick Schedule Action */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider text-[10px]">
              Faculty Workspace
            </span>
            <span aria-hidden="true">·</span>
            <span>{currentFaculty.department}</span>
            {currentFaculty.cabin && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Cabin: {currentFaculty.cabin}</span>
              </>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>{currentFaculty.name}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-800">
              Active Instructor
            </span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Assigned to <strong>{myAssignments.length} sessions</strong> ({totalWeeklyHours} teaching hours/wk) across undergraduate curricula.
          </p>
        </div>

        {/* Action Buttons: Schedule Class, PDF, CSV */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {onOpenScheduleClass && (
            <button
              onClick={onOpenScheduleClass}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Schedule a Class</span>
            </button>
          )}

          {/* Quick Switch Teacher Dropdown */}
          <div className="flex flex-col text-left">
            <select
              value={availableUsers.find(u => u.facultyId === currentFaculty.id)?.id || ''}
              onChange={e => handleTeacherSelect(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {availableUsers
                .filter(u => u.role === 'teacher')
                .map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.department})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 self-end">
            <button
              onClick={handleDownloadPdf}
              className="p-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Download Schedule PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportCsv}
              className="p-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Export CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenPdfPreview}
              className="p-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Print Preview"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Feature Highlight Card: Schedule Missed Class Callout */}
      {onOpenScheduleClass && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-sky-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Missed a lecture or lab? Schedule a Compensatory Class
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Select any class you teach to inspect both your timetable and the students' schedule side-by-side, verify free slots, and notify students instantly.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenScheduleClass}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span>Book Compensatory Slot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Key Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Today ({todayDayName})
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {todaysAssignments.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Lectures & practicals scheduled
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Weekly Teaching Hours
          </div>
          <div className="text-2xl font-extrabold text-sky-700 dark:text-sky-400 mt-1">
            {totalWeeklyHours} <span className="text-xs font-normal text-slate-500">/ {currentFaculty.maxWeeklyHours} hrs</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {theoryHours} hrs Theory · {practicalHours} hrs Labs
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Cohorts & Divisions
          </div>
          <div className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-400 mt-1">
            {new Set(myAssignments.map(a => a.divisionId)).size}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Distinct student cohorts taught
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Proxy / Leave Requests
          </div>
          <div className="text-2xl font-extrabold text-teal-700 dark:text-teal-400 mt-1">
            {pendingRequests.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            <button
              onClick={() => onNavigate('teacher_substitutions')}
              className="text-sky-700 dark:text-sky-400 font-bold hover:underline"
            >
              Open Proxy Hub &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Timeline + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Chronological Today's Schedule Timeline */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Today’s Teaching Schedule ({todayDayName})</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Periods strictly aligned with institutional operating hours (09:00 - 17:00).
              </p>
            </div>
            <button
              onClick={() => onNavigate('teacher_timetable')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
            >
              <span>Weekly Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todaysAssignments.map((asg) => {
              const isLab = asg.sessionType === 'Practical';
              return (
                <div
                  key={asg.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isLab
                      ? 'bg-sky-50/50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 font-extrabold text-xs flex flex-col items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                        <span>P{asg.startSlotIndex + 1}</span>
                        {asg.durationSlots > 1 && (
                          <span className="text-[9px] font-mono">+{asg.durationSlots - 1}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{asg.subjectName}</span>
                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                            ({asg.subjectCode})
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              isLab
                                ? 'bg-sky-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {asg.sessionType}
                            {asg.batchName ? ` · Batch ${asg.batchName}` : ''}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-2 mt-1">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">Class: {asg.divisionName}</span>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1 font-medium text-blue-700 dark:text-blue-300">
                            <DoorOpen className="w-3.5 h-3.5" />
                            {asg.roomNumber} ({asg.roomName})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg inline-block border border-slate-200 dark:border-slate-700">
                        {asg.timeRange}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {todaysAssignments.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-1">
                <CheckCircle2 className="w-6 h-6 text-sky-600 mx-auto" />
                <p className="font-bold text-slate-800 dark:text-slate-200">No scheduled sessions for today ({todayDayName}).</p>
                <p>This is a research, paper evaluation, or mentoring day according to the master schedule.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Actions, Free Periods & Substitution Shortcut */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Schedule a Class Shortcut Tile */}
          {onOpenScheduleClass && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                <CalendarPlus className="w-4 h-4 text-blue-600" />
                <span>Need to Make Up a Class?</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Check open time slots for any class you teach, ensure no clash with students or your other lectures, and publish with 1 click.
              </p>
              <button
                onClick={onOpenScheduleClass}
                className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>Launch Schedule Assistant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick Substitution Banner */}
          <div className="bg-gradient-to-br from-teal-50 to-sky-50 dark:from-teal-950/30 dark:to-sky-950/30 border border-teal-200 dark:border-teal-900/60 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wider">
              <UserCheck className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>Need Leave Coverage?</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Going on academic leave or attending a conference? Request a substitute in 1 click. The system identifies free colleagues automatically.
            </p>
            <button
              onClick={() => onNavigate('teacher_substitutions')}
              className="w-full py-2 px-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <span>Open Substitution Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Schedule Navigation */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Timetable Workspace
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('teacher_timetable')}
                className="w-full p-2.5 text-left text-xs rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition-colors font-medium text-slate-800 dark:text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <CalendarRange className="w-4 h-4 text-blue-600" />
                  <span>Master College Timetable</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('teacher_availability')}
                className="w-full p-2.5 text-left text-xs rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition-colors font-medium text-slate-800 dark:text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <CalendarCheck className="w-4 h-4 text-sky-600" />
                  <span>Slot Preferences & Max Hours</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('teacher_announcements')}
                className="w-full p-2.5 text-left text-xs rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition-colors font-medium text-slate-800 dark:text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>Timetable Notices & Room Shifts</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
