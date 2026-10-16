import React, { useMemo } from 'react';
import {
  CalendarRange,
  Clock,
  DoorOpen,
  GraduationCap,
  Download,
  Printer,
  Compass,
  Building,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Users,
} from 'lucide-react';
import {
  Student,
  Division,
  ScheduleVersion,
  CollegeSettings,
  Room,
  Subject,
  DayOfWeek,
  Faculty,
  Announcement,
} from '../../types';
import { NavItemKey } from '../layout/Sidebar';
import { downloadTimetablePdf } from '../../services/export/pdfExporter';

interface StudentDashboardProps {
  currentStudent: Student;
  activeVersion: ScheduleVersion | null;
  settings: CollegeSettings;
  divisions: Division[];
  rooms: Room[];
  subjects: Subject[];
  faculty: Faculty[];
  announcements: Announcement[];
  onNavigate: (tab: NavItemKey) => void;
  onOpenPdfPreview: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentStudent,
  activeVersion,
  settings,
  divisions,
  rooms,
  subjects,
  faculty,
  announcements,
  onNavigate,
  onOpenPdfPreview,
}) => {
  const currentDivision = useMemo(() => {
    return divisions.find(d => d.id === currentStudent.divisionId) || divisions[0];
  }, [divisions, currentStudent.divisionId]);

  // Current Day
  const todayDayName = useMemo<DayOfWeek>(() => {
    const days: DayOfWeek[] = ['Sunday' as DayOfWeek, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const current = days[new Date().getDay()];
    return settings.workingDays.includes(current) ? current : settings.workingDays[0] || 'Monday';
  }, [settings.workingDays]);

  // All assignments for this division
  const classAssignments = useMemo(() => {
    if (!activeVersion || !currentDivision) return [];
    return activeVersion.assignments.filter(a => a.divisionId === currentDivision.id);
  }, [activeVersion, currentDivision]);

  // Today's assignments sorted by slot
  const todaysAssignments = useMemo(() => {
    return classAssignments
      .filter(a => a.day === todayDayName)
      .filter(a => !a.batchName || a.batchName === currentStudent.batchName)
      .sort((a, b) => a.startSlotIndex - b.startSlotIndex);
  }, [classAssignments, todayDayName, currentStudent.batchName]);

  const totalWeeklyHours = useMemo(() => {
    return classAssignments.reduce((acc, a) => acc + a.durationSlots, 0);
  }, [classAssignments]);

  const liveLecture = useMemo(() => {
    if (todaysAssignments.length === 0) return null;
    return {
      status: 'UPCOMING' as const,
      assignment: todaysAssignments[0],
    };
  }, [todaysAssignments]);

  const liveFaculty = useMemo(() => {
    if (!liveLecture) return null;
    return faculty.find(f => f.id === liveLecture.assignment.facultyId) || null;
  }, [liveLecture, faculty]);

  const handleDownloadClassPdf = () => {
    if (!activeVersion || !currentDivision) return;
    downloadTimetablePdf(
      {
        type: 'Class',
        title: `${currentDivision.name} (${currentDivision.academicYear}) - Academic Timetable`,
        subTitle: `${settings.collegeName} · ${settings.academicTerm}`,
        collegeName: settings.collegeName,
        academicTerm: settings.academicTerm,
        filenameIdentifier: `Class_${currentDivision.name.replace(/\s+/g, '_')}`,
      },
      settings,
      classAssignments,
      subjects,
      'class'
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Student Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-emerald-700">Student Academic Workspace</span>
            <span aria-hidden="true">·</span>
            <span>{currentDivision.academicYear} {currentDivision.name}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{currentStudent.rollNumber}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Welcome, {currentStudent.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Assigned Lab Batch: <span className="font-bold text-amber-700">{currentStudent.batchName || 'A1'}</span> · {totalWeeklyHours} Hours of Scheduled Lectures & Practical Labs this week
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadClassPdf}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Timetable PDF</span>
          </button>
          <button
            onClick={() => onNavigate('student_freerooms')}
            className="px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Find Free Room / Lab</span>
          </button>
        </div>
      </div>

      {/* Live Class Spotlight & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Classroom Live Radar: {todayDayName}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {todaysAssignments.length} session{todaysAssignments.length === 1 ? '' : 's'} today
              </span>
            </div>

            {liveLecture ? (
              <div className="mt-4 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-1">
                  <span>UPCOMING / NEXT LECTURE</span>
                  <span className="font-mono bg-emerald-100 px-2 py-0.5 rounded">{liveLecture.assignment.timeRange}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {liveLecture.assignment.subjectName}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-semibold text-slate-900">
                    <DoorOpen className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{liveLecture.assignment.roomNumber} ({liveLecture.assignment.roomName})</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                    <span>{liveLecture.assignment.facultyName}</span>
                  </span>
                  {liveFaculty?.cabin && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-500 font-medium">Cabin: {liveFaculty.cabin}</span>
                    </>
                  )}
                  {liveLecture.assignment.batchName && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-bold text-amber-800">
                        Batch {liveLecture.assignment.batchName} Lab
                      </span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 py-8 text-center text-slate-500 text-xs">
                No classes scheduled for {todayDayName}. Enjoy your self-study / project day!
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Looking for an empty room or computer lab during free periods?</span>
            <button
              onClick={() => onNavigate('student_freerooms')}
              className="text-emerald-700 hover:underline font-semibold flex items-center gap-1"
            >
              <span>Explore Vacant Rooms</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Schedule Info Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Cohort Summary
              </span>
              <span className="text-xs font-mono text-slate-500">
                {currentDivision.name}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Academic Year</span>
                <span className="font-semibold text-slate-800">
                  {currentDivision.academicYear} (Odd Term 2026-27)
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Assigned Practical Batch</span>
                <span className="font-mono font-bold text-amber-700">
                  {currentStudent.batchName || 'A1'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Weekly Lecture Hours</span>
                <span className="font-mono font-bold text-emerald-800">
                  {totalWeeklyHours} hrs / week
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Lunch Break Time</span>
                <span className="font-mono text-slate-800 font-semibold">
                  13:15 - 14:00 (Daily)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs flex items-center justify-between">
            <button
              onClick={() => onNavigate('student_faculty')}
              className="text-slate-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              <Building className="w-3.5 h-3.5" />
              <span>Faculty Cabins</span>
            </button>
            <button
              onClick={() => onNavigate('student_timetable')}
              className="text-emerald-700 hover:underline font-semibold flex items-center gap-1"
            >
              <span>Weekly Grid</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Today's Full Schedule Timeline */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Today's Classes ({todayDayName})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalized for {currentDivision.name} · Batch {currentStudent.batchName || 'A1'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('student_timetable')}
            className="text-xs text-emerald-700 hover:underline font-semibold flex items-center gap-1"
          >
            <span>Full Weekly Timetable</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {settings.slots.map((slot) => {
            const assignment = todaysAssignments.find(
              a => slot.slotIndex >= a.startSlotIndex && slot.slotIndex < a.startSlotIndex + a.durationSlots
            );
            const isStart = assignment && slot.slotIndex === assignment.startSlotIndex;
            const isLunch = slot.slotIndex === settings.lunchBreakSlotIndex;
            const isTea = slot.slotIndex === settings.teaBreakSlotIndex;

            if (assignment && !isStart) return null; // Continuation slot of practical

            if (assignment) {
              const isLab = assignment.sessionType === 'Practical';
              return (
                <div
                  key={`slot-${slot.slotIndex}`}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
                    isLab
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-20 text-xs font-mono font-semibold text-slate-700 shrink-0">
                      {assignment.timeRange}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>{assignment.subjectName}</span>
                        <span className="text-[11px] font-mono text-slate-500">({assignment.subjectCode})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-slate-800">
                          {assignment.roomNumber} ({assignment.roomName})
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Instructor: {assignment.facultyName}</span>
                        {assignment.batchName && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-amber-700 font-semibold">
                              Batch {assignment.batchName} Practical
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold shrink-0 ${
                    isLab ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {assignment.sessionType} ({assignment.durationSlots} hr{assignment.durationSlots > 1 ? 's' : ''})
                  </span>
                </div>
              );
            }

            return (
              <div
                key={`slot-${slot.slotIndex}`}
                className={`px-3.5 py-2.5 rounded-xl border text-xs flex items-center justify-between ${
                  isLunch || isTea
                    ? 'border-dashed border-amber-200 bg-amber-50/40 text-amber-900'
                    : 'border-slate-200/80 bg-slate-50 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-20 font-mono text-[11px]">{slot.label}</span>
                  <span className="font-medium">{isLunch ? 'Official College Lunch Break' : isTea ? 'Short Tea Break' : 'Free Self-Study / Library Period'}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {isLunch ? '45 mins' : isTea ? '15 mins' : 'Free Slot'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
