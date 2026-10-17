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
  Leaf,
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
import { BulbasaurNatureHero } from '../common/BulbasaurNatureHero';

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

// Bulbasaur Nature Palettes - Refined Pure Light Green Aesthetics
const BULBA_PALETTES = [
  // 1. Fresh Mint Sprout (CS101)
  { bg: 'bg-[#DCFCE7]', text: 'text-[#14532D]', border: 'border-[#86EFAC]' },
  // 2. Dew Sage (MA101)
  { bg: 'bg-[#E6FDF0]', text: 'text-[#065F46]', border: 'border-[#A7F3D0]' },
  // 3. Soft Spring Emerald (CS102)
  { bg: 'bg-[#ECFDF5]', text: 'text-[#047857]', border: 'border-[#6EE7B7]' },
  // 4. Pale Celadon Leaf (CS103)
  { bg: 'bg-[#F0FDF4]', text: 'text-[#166534]', border: 'border-[#BBF7D0]' },
  // 5. Lime Dew (CS104)
  { bg: 'bg-[#F4FCE8]', text: 'text-[#3F6212]', border: 'border-[#D9F99D]' },
  // 6. Emerald Frost (CS105)
  { bg: 'bg-[#E0F8EE]', text: 'text-[#065F46]', border: 'border-[#80ED99]' },
  // 7. Sage Grass (CS201)
  { bg: 'bg-[#E8FAF0]', text: 'text-[#14532D]', border: 'border-[#A7F3D0]' },
  // 8. Clover Glade (CS202)
  { bg: 'bg-[#D1FAE5]', text: 'text-[#065F46]', border: 'border-[#6EE7B7]' },
];

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CS101: BULBA_PALETTES[0],
  MA101: BULBA_PALETTES[1],
  CS102: BULBA_PALETTES[2],
  CS103: BULBA_PALETTES[3],
  CS104: BULBA_PALETTES[4],
  CS105: BULBA_PALETTES[5],
  CS201: BULBA_PALETTES[6],
  CS202: BULBA_PALETTES[7],
  IT101: BULBA_PALETTES[0],
  IT102: BULBA_PALETTES[1],
  IT103: BULBA_PALETTES[2],
  IT301: BULBA_PALETTES[3],
  IT302: BULBA_PALETTES[4],
  EC201: BULBA_PALETTES[5],
  ME201: BULBA_PALETTES[6],
};

const getBulbaSubjectColor = (code: string) => {
  if (SUBJECT_COLORS[code]) return SUBJECT_COLORS[code];
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BULBA_PALETTES.length;
  return BULBA_PALETTES[index];
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
          const colors = getBulbaSubjectColor(a.subjectCode);
          const isPractical = a.sessionType === 'Practical';

          return (
            <div
              key={a.id}
              className={`p-2.5 rounded-xl border text-left shadow-2xs transition-all ${colors.bg} ${colors.border} ${colors.text} hover:scale-[1.01]`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono font-black text-xs tracking-tight">{a.subjectCode}</span>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-md font-extrabold tracking-wider bg-white/95 text-[#14532D] border border-[#86EFAC] shadow-2xs">
                  {isPractical ? `${a.durationSlots}h Lab` : 'Lecture'}
                </span>
              </div>
              <div className="text-[11px] font-bold truncate mt-1 text-[#14532D]" title={a.subjectName}>
                {a.subjectName}
              </div>
              <div className="text-[10px] opacity-95 mt-1.5 flex items-center justify-between gap-1 border-t border-[#86EFAC]/40 pt-1 font-semibold text-[#14532D]">
                <span className="truncate">
                  {viewMode === 'teacher'
                    ? `${a.divisionName}${a.batchName ? ` (${a.batchName})` : ''}`
                    : a.facultyName.replace('Prof. ', '').replace('Dr. ', '')}
                </span>
                <span className="font-mono font-bold bg-white/95 text-[#14532D] px-1.5 py-0.5 rounded-md shrink-0 border border-[#86EFAC] shadow-2xs">
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
      {/* Bulbasaur Nature Hero Banner */}
      <BulbasaurNatureHero
        title="Master Academic Timetable Matrix"
        subtitle="Multi-perspective view across class divisions, faculty workloads, and departments with instant PDF & Excel generation."
        badgeText="🍃 Timetable Matrix"
      />

      {/* Top Banner & Mode Selector */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#BCE5D1] p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#059669] mb-1">
            <CalendarRange className="w-4 h-4" />
            <span>Master Schedule Center</span>
            <span aria-hidden="true">•</span>
            <span className="font-mono text-[#059669] font-bold">
              {currentViewAssignments.length} Scheduled Slots
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#133E35] tracking-tight">
            Institutional Timetable & Export Center
          </h1>
          <p className="text-xs text-[#3D6456] mt-1">
            Multi-perspective view across classes, faculty schedules, and departments with instant PDF & Excel downloads.
          </p>
        </div>

        {/* View By Selector (Class | Teacher | Department) */}
        <div className="flex items-center p-1 bg-[#F0F9F5] rounded-2xl border border-[#CCE8DD] shrink-0">
          {/* Class View is accessible by all */}
          <button
            onClick={() => setViewMode('class')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              viewMode === 'class'
                ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-xs'
                : 'text-[#3D6456] hover:text-[#133E35]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Class-wise</span>
          </button>

          {/* Teacher View: Admin & Teacher */}
          {(role === 'admin' || role === 'teacher') && (
            <button
              onClick={() => setViewMode('teacher')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                viewMode === 'teacher'
                  ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-xs'
                : 'text-[#3D6456] hover:text-[#133E35]'
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
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                viewMode === 'department'
                  ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-xs'
                : 'text-[#3D6456] hover:text-[#133E35]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Department-wise</span>
            </button>
          )}
        </div>
      </div>

      {/* Selector & Action Toolbar */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl border border-[#BCE5D1] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-xs">
        {/* Dropdowns based on View Mode */}
        <div className="flex flex-wrap items-center gap-3">
          {viewMode === 'class' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#535965]">Select Class:</span>
              <select
                value={activeDivision?.id || ''}
                onChange={e => setSelectedDivisionId(e.target.value)}
                disabled={role === 'student'} // Students are locked to their own class
                className="text-xs px-3 py-1.5 bg-[#F0F9F5] border border-[#CCE8DD] rounded-xl font-medium text-[#22252A] focus:outline-none focus:ring-2 focus:ring-[#059669]"
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
              <span className="text-xs font-bold text-[#535965]">Select Teacher:</span>
              <select
                value={activeTeacher?.id || ''}
                onChange={e => setSelectedTeacherId(e.target.value)}
                disabled={role === 'teacher'} // Teachers only view their own
                className="text-xs px-3 py-1.5 bg-[#F0F9F5] border border-[#CCE8DD] rounded-xl font-medium text-[#22252A] focus:outline-none focus:ring-2 focus:ring-[#059669]"
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
              <span className="text-xs font-bold text-[#535965]">Department:</span>
              <select
                value={selectedDepartment}
                onChange={e => setSelectedDepartment(e.target.value)}
                className="text-xs px-3 py-1.5 bg-[#F0F9F5] border border-[#CCE8DD] rounded-xl font-medium text-[#22252A] focus:outline-none focus:ring-2 focus:ring-[#059669]"
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
            className="px-3 py-1.5 text-xs font-medium text-[#22252A] bg-[#F0F9F5] hover:bg-[#CCE8DD]/40 border border-[#CCE8DD] rounded-xl transition-colors flex items-center gap-1.5"
            title="Preview formatted Landscape A4 layout before download"
          >
            <Eye className="w-3.5 h-3.5 text-[#535965]" />
            <span>PDF Preview</span>
          </button>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPdf}
            className="px-3 py-1.5 text-xs font-bold text-white bg-[#059669] hover:bg-[#047857] rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            title="Download Landscape A4 PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          {/* Export Excel */}
          <button
            onClick={handleDownloadExcel}
            className="px-3 py-1.5 text-xs font-bold text-[#059669] bg-[#E6F7F0] hover:bg-[#059669]/10 border border-[#059669]/30 rounded-xl transition-colors flex items-center gap-1.5"
            title="Export Excel in Grid Format"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#059669]" />
            <span>Export Excel</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="p-1.5 text-[#535965] hover:text-[#22252A] hover:bg-[#F0F9F5] rounded-xl border border-[#CCE8DD] transition-colors"
            title="Print Timetable"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Admin Exclusive: Bulk Downloads & Import */}
          {role === 'admin' && (
            <>
              <div className="h-4 w-px bg-[#CCE8DD] mx-1 hidden sm:block" />
              <button
                onClick={handleBulkDownloadClasses}
                className="px-2.5 py-1.5 text-[11px] font-bold text-[#059669] bg-[#E6F7F0] hover:bg-[#059669]/10 rounded-xl border border-[#059669]/20 whitespace-nowrap"
                title="Download all class timetables in a single PDF"
              >
                Bulk All Classes
              </button>
              <button
                onClick={handleBulkDownloadTeachers}
                className="px-2.5 py-1.5 text-[11px] font-bold text-[#059669] bg-[#E6F7F0] hover:bg-[#059669]/10 rounded-xl border border-[#059669]/20 whitespace-nowrap"
                title="Download all teacher timetables in a single PDF"
              >
                Bulk All Teachers
              </button>
              <button
                onClick={() => setImportModalOpen(true)}
                className="px-2.5 py-1.5 text-[11px] font-bold text-[#22252A] bg-[#F0F9F5] hover:bg-[#CCE8DD]/40 border border-[#CCE8DD] rounded-xl flex items-center gap-1"
                title="Import timetable sheet and validate conflicts"
              >
                <Upload className="w-3 h-3 text-[#535965]" />
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
            className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              activeMobileDay === day
                ? 'bg-[#059669] text-white shadow-xs'
                : 'bg-white text-[#535965] border border-[#CCE8DD]'
            }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Main Timetable Content: Desktop Table & Mobile View */}
      {currentViewAssignments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-[#CCE8DD] space-y-2">
          <Calendar className="w-8 h-8 text-[#535965] mx-auto" />
          <h3 className="text-sm font-bold text-[#22252A]">No Timetable Slots Found</h3>
          <p className="text-xs text-[#535965] max-w-sm mx-auto">
            There are currently no scheduled lectures for the selected filter. Try generating a master timetable or picking another class.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Timetable Grid (Rows = Days, Columns = Periods) */}
          <div className="hidden md:block bg-white/90 backdrop-blur-md rounded-xl border border-[#BCE5D1] overflow-x-auto shadow-xs print:border-none print:shadow-none">
            <table className="w-full border-collapse text-xs table-fixed min-w-[900px]">
              <thead>
                <tr className="bg-[#EAF6F0]/90 border-b border-[#BCE5D1]">
                  <th className="py-3 px-3 text-left font-bold text-[#059669] w-28">
                    Day
                  </th>
                  {settings.slots.map(slot => (
                    <React.Fragment key={slot.slotIndex}>
                      <th className="py-2.5 px-2 font-bold text-[#22252A] text-center min-w-[120px] border-l border-[#CCE8DD]">
                        <div>Period {slot.slotIndex + 1}</div>
                        <div className="text-[10px] font-normal text-[#535965] font-mono">
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </th>
                      {/* Tea Break Column */}
                      {settings.teaBreakSlotIndex !== undefined && slot.slotIndex === settings.teaBreakSlotIndex && (
                        <th className="py-2 px-1 text-center font-bold text-[9px] uppercase tracking-wider bg-[#F0F9F5] text-[#535965] w-14 border-l border-[#CCE8DD]">
                          Tea Break
                        </th>
                      )}
                      {/* Lunch Break Column */}
                      {slot.slotIndex === settings.lunchBreakSlotIndex && (
                        <th className="py-2 px-1 text-center font-bold text-[10px] uppercase tracking-wider bg-[#ECFDF5] text-[#10B981] w-20 border-l border-[#CCE8DD]">
                          Lunch Break
                        </th>
                      )}
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {settings.workingDays.map(day => (
                  <tr key={day} className="hover:bg-[#F0F9F5]/40 border-b border-[#CCE8DD] transition-colors">
                    <td className="py-3 px-3 font-bold text-[#22252A] bg-[#F0F9F5]/70 border-r border-[#CCE8DD]">
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
                          <td className="p-1.5 align-middle text-center border-l border-[#CCE8DD] min-h-[64px]">
                            {startingHere.length > 0 ? (
                              renderCellContent(startingHere)
                            ) : continuingHere.length > 0 ? (
                              <div className="p-1 rounded bg-[#E6F7F0] border border-dashed border-[#059669]/40 text-[10px] text-[#059669] italic font-mono font-bold">
                                Lab Continued
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#535965]/50 font-mono italic">
                                Free
                              </span>
                            )}
                          </td>

                          {/* Merged Tea Break column */}
                          {isTeaBreakAfter && (
                            <td className="p-1 text-center align-middle bg-[#F0F9F5] border-l border-r border-[#CCE8DD] text-[#535965] font-mono text-[9px]">
                              11:00
                            </td>
                          )}

                          {/* Merged Lunch Break column */}
                          {isLunchAfter && (
                            <td className="p-1 text-center align-middle bg-[#ECFDF5] border-l border-r border-[#10B981]/30 text-[#10B981] font-bold text-[10px] font-mono">
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
