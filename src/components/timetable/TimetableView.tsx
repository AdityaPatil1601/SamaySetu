import React, { useState, useMemo } from 'react';
import {
  CalendarRange,
  Users,
  Building2,
  Layers,
  Download,
  FileSpreadsheet,
  Upload,
  Printer,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';
import {
  ScheduleAssignment,
  ScheduleVersion,
  Branch,
  Division,
  Faculty,
  Room,
  Subject,
  CollegeSettings,
  DayOfWeek,
  TimetableViewMode,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  downloadTimetablePdf,
  downloadAllClassTimetablesPdf,
  downloadAllTeacherTimetablesPdf,
  TimetableExportMeta,
} from '../../services/export/pdfExporter';
import { exportTimetableGridExcel } from '../../services/export/excelExporter';
import { PdfPreviewModal } from '../common/PdfPreviewModal';
import { ExcelImportModal } from '../common/ExcelImportModal';
import { BulkExportProgressModal } from '../common/BulkExportProgressModal';

interface TimetableViewProps {
  version: ScheduleVersion | null;
  branches: Branch[];
  divisions: Division[];
  faculty: Faculty[];
  rooms: Room[];
  subjects: Subject[];
  settings: CollegeSettings;
  onUpdateAssignments?: (newAssignments: ScheduleAssignment[]) => void;
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  initialFacultyId?: string;
  initialRoomId?: string;
}

// Soft Pastel colors per subject
const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CS101: { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-900 dark:text-indigo-200', border: 'border-indigo-200 dark:border-indigo-800' },
  IT301: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-900 dark:text-emerald-200', border: 'border-emerald-200 dark:border-emerald-800' },
  MA101: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-900 dark:text-amber-200', border: 'border-amber-200 dark:border-amber-800' },
  CS202: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-900 dark:text-purple-200', border: 'border-purple-200 dark:border-purple-800' },
  IT302: { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-900 dark:text-sky-200', border: 'border-sky-200 dark:border-sky-800' },
  IT101: { bg: 'bg-pink-50 dark:bg-pink-950/40', text: 'text-pink-900 dark:text-pink-200', border: 'border-pink-200 dark:border-pink-800' },
  EC201: { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-900 dark:text-orange-200', border: 'border-orange-200 dark:border-orange-800' },
  ME201: { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-900 dark:text-teal-200', border: 'border-teal-200 dark:border-teal-800' },
};

export const TimetableView: React.FC<TimetableViewProps> = ({
  version,
  branches,
  divisions,
  faculty,
  rooms,
  subjects,
  settings,
  onUpdateAssignments,
  onShowToast,
  initialFacultyId,
}) => {
  const { role, currentUser } = useAuth();

  // Mode selection: Class | Teacher | Department
  const [viewMode, setViewMode] = useState<TimetableViewMode>(() => {
    if (role === 'teacher') return 'teacher';
    if (role === 'student') return 'class';
    return initialFacultyId ? 'teacher' : 'class';
  });

  // Selected entities based on role
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>(() => {
    if (role === 'student' && currentUser?.divisionId) {
      return currentUser.divisionId;
    }
    return divisions[0]?.id || '';
  });

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(() => {
    if (role === 'teacher' && currentUser?.facultyId) {
      return currentUser.facultyId;
    }
    return initialFacultyId || faculty[0]?.id || '';
  });

  const [selectedDepartment, setSelectedDepartment] = useState<string>(() => {
    return branches[0]?.department || 'Computer Science';
  });

  // Mobile Day Tab state (Mon, Tue, Wed...)
  const [activeMobileDay, setActiveMobileDay] = useState<DayOfWeek>('Monday');

  // Modals state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{
    isOpen: boolean;
    title: string;
    current: number;
    total: number;
    message: string;
    isComplete: boolean;
  }>({
    isOpen: false,
    title: '',
    current: 0,
    total: 0,
    message: '',
    isComplete: false,
  });

  const assignments = version?.assignments || [];

  // Filter allowed options by role
  // Teachers can view: their own timetable OR timetables of classes they teach
  const teacherTaughtDivisionIds = useMemo(() => {
    if (role !== 'teacher' || !currentUser?.facultyId) return [];
    return Array.from(
      new Set(
        assignments
          .filter(a => a.facultyId === currentUser.facultyId)
          .map(a => a.divisionId)
      )
    );
  }, [assignments, role, currentUser]);

  const allowedDivisions = useMemo(() => {
    if (role === 'student') {
      return divisions.filter(d => d.id === currentUser?.divisionId);
    }
    if (role === 'teacher') {
      return divisions.filter(d => teacherTaughtDivisionIds.includes(d.id));
    }
    return divisions.filter(d => d.active);
  }, [divisions, role, currentUser, teacherTaughtDivisionIds]);

  const allowedFaculty = useMemo(() => {
    if (role === 'teacher') {
      return faculty.filter(f => f.id === currentUser?.facultyId);
    }
    return faculty.filter(f => f.active);
  }, [faculty, role, currentUser]);

  const departmentsList = useMemo(() => {
    return Array.from(new Set(branches.map(b => b.department)));
  }, [branches]);

  // Current entity lookups
  const activeDivision = divisions.find(d => d.id === selectedDivisionId) || allowedDivisions[0];
  const activeTeacher = faculty.find(f => f.id === selectedTeacherId) || allowedFaculty[0];
  const activeBranch = branches.find(b => b.id === activeDivision?.branchId);

  // Filtered assignments for active view
  const currentViewAssignments = useMemo(() => {
    if (viewMode === 'class') {
      if (!activeDivision) return [];
      return assignments.filter(
        a => a.divisionId === activeDivision.id || a.participatingDivisionIds?.includes(activeDivision.id)
      );
    }
    if (viewMode === 'teacher') {
      if (!activeTeacher) return [];
      return assignments.filter(a => a.facultyId === activeTeacher.id);
    }
    if (viewMode === 'department') {
      // Find all branches in selected department
      const deptBranchIds = branches.filter(b => b.department === selectedDepartment).map(b => b.id);
      return assignments.filter(a => deptBranchIds.includes(a.branchId));
    }
    return [];
  }, [viewMode, activeDivision, activeTeacher, selectedDepartment, assignments, branches]);

  // Export Metadata helper
  const getExportMeta = (): TimetableExportMeta => {
    const term = settings.academicTerm;
    const date = new Date().toLocaleDateString();

    if (viewMode === 'class' && activeDivision) {
      const code = activeBranch ? activeBranch.code : 'ENGG';
      return {
        type: 'Class',
        title: `Class Timetable - ${code} ${activeDivision.academicYear} ${activeDivision.name}`,
        subTitle: `Department of ${activeBranch?.department || 'Engineering'} | Term: ${term} | Intake: ${activeDivision.studentCount} Students`,
        collegeName: settings.collegeName,
        academicTerm: term,
        generatedDate: date,
        filenameIdentifier: `Class_${code}_${activeDivision.academicYear}_${activeDivision.name}`,
      };
    }

    if (viewMode === 'teacher' && activeTeacher) {
      const totalHours = currentViewAssignments.reduce((acc, a) => acc + a.durationSlots, 0);
      return {
        type: 'Teacher',
        title: `Faculty Timetable - ${activeTeacher.name}`,
        subTitle: `Employee ID: ${activeTeacher.employeeId} | ${activeTeacher.department} | Assigned Load: ${totalHours} / ${activeTeacher.maxWeeklyHours} hrs`,
        collegeName: settings.collegeName,
        academicTerm: term,
        generatedDate: date,
        filenameIdentifier: `Teacher_${activeTeacher.name.replace(/\s+/g, '_')}`,
      };
    }

    return {
      type: 'Department',
      title: `Department Timetable - ${selectedDepartment}`,
      subTitle: `Consolidated Class & Faculty Schedule | Term: ${term}`,
      collegeName: settings.collegeName,
      academicTerm: term,
      generatedDate: date,
      filenameIdentifier: `Dept_${selectedDepartment.replace(/\s+/g, '_')}`,
    };
  };

  // Direct PDF Download Handler
  const handleDownloadPdf = () => {
    const meta = getExportMeta();
    downloadTimetablePdf(meta, settings, currentViewAssignments, subjects, viewMode);
    if (onShowToast) {
      onShowToast('success', 'PDF Downloaded Successfully', `${meta.title} generated as Landscape A4.`);
    }
  };

  // Direct Excel Grid Download Handler
  const handleDownloadExcel = () => {
    const meta = getExportMeta();
    exportTimetableGridExcel(
      meta.title,
      meta.subTitle,
      settings,
      currentViewAssignments,
      subjects,
      viewMode,
      meta.filenameIdentifier
    );
    if (onShowToast) {
      onShowToast('success', 'Excel Spreadsheet Exported', `${meta.title} downloaded in table grid format.`);
    }
  };

  // Bulk Download: All Classes (Admin only)
  const handleBulkDownloadClasses = async () => {
    setBulkProgress({
      isOpen: true,
      title: 'Bulk Export: All Class Timetables',
      current: 0,
      total: divisions.filter(d => d.active).length,
      message: 'Preparing document layout...',
      isComplete: false,
    });

    await downloadAllClassTimetablesPdf(
      divisions,
      branches,
      settings,
      assignments,
      subjects,
      (curr, tot, msg) => {
        setBulkProgress(prev => ({
          ...prev,
          current: curr,
          total: tot,
          message: msg,
        }));
      }
    );

    setBulkProgress(prev => ({ ...prev, isComplete: true }));
    if (onShowToast) {
      onShowToast('success', 'Bulk Class Timetables Exported', 'Multi-page PDF containing all divisions downloaded.');
    }
  };

  // Bulk Download: All Teachers (Admin only)
  const handleBulkDownloadTeachers = async () => {
    setBulkProgress({
      isOpen: true,
      title: 'Bulk Export: All Faculty Timetables',
      current: 0,
      total: faculty.filter(f => f.active).length,
      message: 'Preparing document layout...',
      isComplete: false,
    });

    await downloadAllTeacherTimetablesPdf(
      faculty,
      settings,
      assignments,
      subjects,
      (curr, tot, msg) => {
        setBulkProgress(prev => ({
          ...prev,
          current: curr,
          total: tot,
          message: msg,
        }));
      }
    );

    setBulkProgress(prev => ({ ...prev, isComplete: true }));
    if (onShowToast) {
      onShowToast('success', 'Bulk Faculty Timetables Exported', 'Multi-page PDF containing all faculty schedules downloaded.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Renders cell in Grid
  const renderCellContent = (matchingAssignments: ScheduleAssignment[]) => {
    if (matchingAssignments.length === 0) {
      return (
        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono italic">
          Free
        </span>
      );
    }

    return (
      <div className="space-y-1.5 w-full">
        {matchingAssignments.map(a => {
          const colors = SUBJECT_COLORS[a.subjectCode] || {
            bg: 'bg-indigo-50 dark:bg-indigo-950/40',
            text: 'text-indigo-900 dark:text-indigo-200',
            border: 'border-indigo-200 dark:border-indigo-800',
          };
          const isPractical = a.sessionType === 'Practical';

          return (
            <div
              key={a.id}
              className={`p-2 rounded-lg border text-left shadow-2xs transition-all ${colors.bg} ${colors.border} ${colors.text}`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono font-bold text-xs tracking-tight">{a.subjectCode}</span>
                <span className="text-[9px] uppercase px-1 py-0.2 rounded font-bold tracking-wider bg-white/70 dark:bg-black/40">
                  {isPractical ? `${a.durationSlots}h Lab` : 'Lecture'}
                </span>
              </div>
              <div className="text-[11px] font-semibold truncate mt-0.5" title={a.subjectName}>
                {a.subjectName}
              </div>
              <div className="text-[10px] opacity-80 mt-1 flex items-center justify-between gap-1 border-t border-black/10 dark:border-white/10 pt-1">
                <span className="truncate">
                  {viewMode === 'teacher'
                    ? `${a.divisionName}${a.batchName ? ` (${a.batchName})` : ''}`
                    : a.facultyName.replace('Prof. ', '').replace('Dr. ', '')}
                </span>
                <span className="font-mono font-semibold bg-white/90 dark:bg-slate-900 px-1 rounded shrink-0 border border-slate-200 dark:border-slate-700">
                  {a.roomNumber}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Mode Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <CalendarRange className="w-4 h-4 text-indigo-500" />
            <span>Master Schedule Center</span>
            <span aria-hidden="true">•</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
              {currentViewAssignments.length} Scheduled Slots
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Interactive Timetable & Export Center
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Multi-perspective view across classes, faculty schedules, and departments with instant PDF & Excel downloads.
          </p>
        </div>

        {/* View By Selector (Class | Teacher | Department) */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          {/* Class View is accessible by all */}
          <button
            onClick={() => setViewMode('class')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'class'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Class-wise</span>
          </button>

          {/* Teacher View: Admin & Teacher */}
          {(role === 'admin' || role === 'teacher') && (
            <button
              onClick={() => setViewMode('teacher')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'teacher'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Teacher-wise</span>
            </button>
          )}

          {/* Department View: Admin only */}
          {role === 'admin' && (
            <button
              onClick={() => setViewMode('department')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'department'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Department-wise</span>
            </button>
          )}
        </div>
      </div>

      {/* Selector & Action Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-xs">
        {/* Dropdowns based on View Mode */}
        <div className="flex flex-wrap items-center gap-3">
          {viewMode === 'class' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Select Class:</span>
              <select
                value={activeDivision?.id || ''}
                onChange={e => setSelectedDivisionId(e.target.value)}
                disabled={role === 'student'} // Students are locked to their own class
                className="text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {allowedDivisions.map(d => {
                  const br = branches.find(b => b.id === d.branchId);
                  return (
                    <option key={d.id} value={d.id}>
                      {br?.code} {d.academicYear} - {d.name} ({d.studentCount} students)
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {viewMode === 'teacher' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Select Teacher:</span>
              <select
                value={activeTeacher?.id || ''}
                onChange={e => setSelectedTeacherId(e.target.value)}
                disabled={role === 'teacher'} // Teachers only view their own
                className="text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {allowedFaculty.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.employeeId} - {f.department})
                  </option>
                ))}
              </select>
            </div>
          )}

          {viewMode === 'department' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Department:</span>
              <select
                value={selectedDepartment}
                onChange={e => setSelectedDepartment(e.target.value)}
                className="text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {departmentsList.map(dept => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Action Buttons: Preview PDF, Download PDF, Export Excel, Print, Bulk Download, Import */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preview PDF */}
          <button
            onClick={() => setPreviewModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
            title="Preview formatted Landscape A4 layout before download"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>PDF Preview</span>
          </button>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPdf}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            title="Download Landscape A4 PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          {/* Export Excel */}
          <button
            onClick={handleDownloadExcel}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-colors flex items-center gap-1.5"
            title="Export Excel in Grid Format"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
            title="Print Timetable"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Admin Exclusive: Bulk Downloads & Import */}
          {role === 'admin' && (
            <>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />
              <button
                onClick={handleBulkDownloadClasses}
                className="px-2.5 py-1.5 text-[11px] font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 rounded-xl border border-indigo-200 dark:border-indigo-800 whitespace-nowrap"
                title="Download all class timetables in a single PDF"
              >
                Bulk All Classes
              </button>
              <button
                onClick={handleBulkDownloadTeachers}
                className="px-2.5 py-1.5 text-[11px] font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 rounded-xl border border-indigo-200 dark:border-indigo-800 whitespace-nowrap"
                title="Download all teacher timetables in a single PDF"
              >
                Bulk All Teachers
              </button>
              <button
                onClick={() => setImportModalOpen(true)}
                className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl flex items-center gap-1"
                title="Import timetable sheet and validate conflicts"
              >
                <Upload className="w-3 h-3" />
                <span>Import Sheet</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Responsive: Day Tabs (Mon - Sat) */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-1">
        {settings.workingDays.map(day => (
          <button
            key={day}
            onClick={() => setActiveMobileDay(day)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
              activeMobileDay === day
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Main Timetable Content: Desktop Table & Mobile View */}
      {currentViewAssignments.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
          <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">No Timetable Slots Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are currently no scheduled lectures for the selected filter. Try generating a master timetable or picking another class.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Timetable Grid (Rows = Days, Columns = Periods) */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs print:border-none print:shadow-none">
            <table className="w-full border-collapse text-xs table-fixed min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-3 text-left font-bold text-slate-700 dark:text-slate-300 w-28">
                    Day
                  </th>
                  {settings.slots.map(slot => (
                    <React.Fragment key={slot.slotIndex}>
                      <th className="py-2.5 px-2 font-bold text-slate-800 dark:text-slate-200 text-center min-w-[120px]">
                        <div>Period {slot.slotIndex + 1}</div>
                        <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400 font-mono">
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </th>
                      {/* Tea Break Column */}
                      {settings.teaBreakSlotIndex !== undefined && slot.slotIndex === settings.teaBreakSlotIndex && (
                        <th className="py-2 px-1 text-center font-bold text-[9px] uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 w-14">
                          Tea Break
                        </th>
                      )}
                      {/* Lunch Break Column */}
                      {slot.slotIndex === settings.lunchBreakSlotIndex && (
                        <th className="py-2 px-1 text-center font-bold text-[10px] uppercase tracking-wider bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 w-20">
                          Lunch Break
                        </th>
                      )}
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {settings.workingDays.map(day => (
                  <tr key={day} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100 bg-slate-50/60 dark:bg-slate-800/40">
                      {day}
                    </td>
                    {settings.slots.map(slot => {
                      const matches = currentViewAssignments.filter(a => {
                        if (a.day !== day) return false;
                        const endSlot = a.startSlotIndex + a.durationSlots - 1;
                        return slot.slotIndex >= a.startSlotIndex && slot.slotIndex <= endSlot;
                      });

                      const startingHere = matches.filter(a => a.startSlotIndex === slot.slotIndex);
                      const continuingHere = matches.filter(a => a.startSlotIndex < slot.slotIndex);

                      const isTeaBreakAfter = settings.teaBreakSlotIndex !== undefined && slot.slotIndex === settings.teaBreakSlotIndex;
                      const isLunchAfter = slot.slotIndex === settings.lunchBreakSlotIndex;

                      return (
                        <React.Fragment key={slot.slotIndex}>
                          <td className="p-1.5 align-middle text-center border-l border-slate-100 dark:border-slate-800 min-h-[64px]">
                            {startingHere.length > 0 ? (
                              renderCellContent(startingHere)
                            ) : continuingHere.length > 0 ? (
                              <div className="p-1 rounded bg-sky-50/50 dark:bg-sky-950/30 border border-dashed border-sky-300 text-[10px] text-sky-700 dark:text-sky-300 italic font-mono">
                                Lab Continued
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-300 dark:text-slate-600 font-mono italic">
                                Free
                              </span>
                            )}
                          </td>

                          {/* Merged Tea Break column */}
                          {isTeaBreakAfter && (
                            <td className="p-1 text-center align-middle bg-slate-50 dark:bg-slate-850 border-l border-r border-slate-200 dark:border-slate-800 text-slate-400 font-mono text-[9px]">
                              11:00
                            </td>
                          )}

                          {/* Merged Lunch Break column */}
                          {isLunchAfter && (
                            <td className="p-1 text-center align-middle bg-amber-50/60 dark:bg-amber-950/20 border-l border-r border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 font-semibold text-[10px] font-mono">
                              13:15
                            </td>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View: One Day at a Time */}
          <div className="md:hidden space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {activeMobileDay} Schedule
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {currentViewAssignments.filter(a => a.day === activeMobileDay).length} sessions
              </span>
            </div>

            <div className="space-y-2">
              {settings.slots.map(slot => {
                const matches = currentViewAssignments.filter(a => {
                  if (a.day !== activeMobileDay) return false;
                  const endSlot = a.startSlotIndex + a.durationSlots - 1;
                  return slot.slotIndex >= a.startSlotIndex && slot.slotIndex <= endSlot;
                });

                return (
                  <div
                    key={slot.slotIndex}
                    className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-1.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Period {slot.slotIndex + 1}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>

                    {matches.length === 0 ? (
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-mono italic py-1">
                        Free Period
                      </div>
                    ) : (
                      renderCellContent(matches)
                    )}

                    {slot.slotIndex === settings.lunchBreakSlotIndex && (
                      <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs font-semibold text-center border border-amber-200 dark:border-amber-900 mt-2">
                        🍱 Lunch Break (13:15 - 14:00)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* PDF Layout Preview Modal */}
      <PdfPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        meta={getExportMeta()}
        settings={settings}
        assignments={currentViewAssignments}
        subjects={subjects}
        viewType={viewMode}
        onDownloaded={() => {
          if (onShowToast) {
            onShowToast('success', 'PDF Saved to Downloads', 'Sharp bordered table saved.');
          }
        }}
      />

      {/* Excel Import Modal (Admin only) */}
      <ExcelImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        existingAssignments={assignments}
        settings={settings}
        faculty={faculty}
        rooms={rooms}
        divisions={divisions}
        subjects={subjects}
        onImportSuccess={newAssignments => {
          if (onUpdateAssignments) {
            onUpdateAssignments([...assignments, ...newAssignments]);
          }
          if (onShowToast) {
            onShowToast(
              'success',
              'Timetable Sheet Imported',
              `Added ${newAssignments.length} conflict-free session slots.`
            );
          }
        }}
      />

      {/* Bulk Export Progress Modal */}
      <BulkExportProgressModal
        isOpen={bulkProgress.isOpen}
        title={bulkProgress.title}
        current={bulkProgress.current}
        total={bulkProgress.total}
        statusMessage={bulkProgress.message}
        isComplete={bulkProgress.isComplete}
        onClose={() => setBulkProgress(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
