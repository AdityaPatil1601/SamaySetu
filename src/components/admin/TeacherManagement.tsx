import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Clock,
  ExternalLink,
  X,
  CheckCircle2,
  Mail,
  Building2,
} from 'lucide-react';
import { Faculty, Subject, Branch, ScheduleAssignment } from '../../types';
import { Modal } from '../common/Modal';

interface TeacherManagementProps {
  faculty: Faculty[];
  subjects: Subject[];
  branches: Branch[];
  assignments: ScheduleAssignment[];
  onSaveFaculty: (faculty: Faculty[]) => void;
  onViewTeacherTimetable: (facultyId: string) => void;
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const TeacherManagement: React.FC<TeacherManagementProps> = ({
  faculty,
  subjects,
  branches,
  assignments,
  onSaveFaculty,
  onViewTeacherTimetable,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

  // Form states
  const [empId, setEmpId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dept, setDept] = useState('Computer Science');
  const [maxHours, setMaxHours] = useState(16);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // Compute teaching hours for each faculty
  const facultyHoursMap = new Map<string, number>();
  assignments.forEach(a => {
    const cur = facultyHoursMap.get(a.facultyId) || 0;
    facultyHoursMap.set(a.facultyId, cur + a.durationSlots);
  });

  const departments = ['ALL', ...Array.from(new Set(faculty.map(f => f.department)))];

  const filteredFaculty = faculty.filter(f => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || f.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const handleOpenAdd = () => {
    setEditingFaculty(null);
    setEmpId(`FAC-00${faculty.length + 1}`);
    setName('');
    setEmail('');
    setDept('Computer Science');
    setMaxHours(18);
    setSelectedSubjects([]);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (fac: Faculty) => {
    setEditingFaculty(fac);
    setEmpId(fac.employeeId);
    setName(fac.name);
    setEmail(fac.email || `${fac.name.toLowerCase().replace(/[^a-z]/g, '')}@samaysetu.edu`);
    setDept(fac.department);
    setMaxHours(fac.maxWeeklyHours);
    setSelectedSubjects(fac.qualifiedSubjectCodes);
    setIsAddEditModalOpen(true);
  };

  const handleDelete = (facId: string) => {
    const fac = faculty.find(f => f.id === facId);
    if (!fac) return;
    const confirm = window.confirm(
      `Are you sure you want to remove ${fac.name}? This teacher will be unassigned from any active courses.`
    );
    if (!confirm) return;

    const updated = faculty.filter(f => f.id !== facId);
    onSaveFaculty(updated);
    if (onShowToast) {
      onShowToast('info', 'Faculty Member Removed', `${fac.name} has been removed from registry.`);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !empId) return;

    if (editingFaculty) {
      // Edit
      const updated = faculty.map(f =>
        f.id === editingFaculty.id
          ? {
              ...f,
              employeeId: empId,
              name,
              email,
              department: dept,
              maxWeeklyHours: Number(maxHours) || 16,
              qualifiedSubjectCodes: selectedSubjects,
            }
          : f
      );
      onSaveFaculty(updated);
      if (onShowToast) {
        onShowToast('success', 'Faculty Updated', `${name}'s profile and qualifications updated.`);
      }
    } else {
      // Add
      const newFac: Faculty = {
        id: `fac-${Date.now().toString().slice(-4)}`,
        employeeId: empId,
        name,
        email: email || `${name.toLowerCase().replace(/[^a-z]/g, '')}@samaysetu.edu`,
        department: dept,
        qualifiedSubjectCodes: selectedSubjects,
        eligibleAssignments: [],
        maxWeeklyHours: Number(maxHours) || 16,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        unavailableSlots: [],
        preferredSlots: [],
        active: true,
      };
      onSaveFaculty([...faculty, newFac]);
      if (onShowToast) {
        onShowToast('success', 'Faculty Registered', `${name} successfully added to college roster.`);
      }
    }

    setIsAddEditModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>Academic Faculty Registry</span>
            <span aria-hidden="true">•</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              {faculty.length} Registered Teachers
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Manage Teachers & Teaching Quotas
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Configure professor workloads, subject qualifications, and cross-department teaching eligibility.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Teacher</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by teacher name, employee ID, or department..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Department:</span>
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            {departments.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Teachers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFaculty.map(fac => {
          const scheduledHours = facultyHoursMap.get(fac.id) || 0;
          const utilizationPct = Math.round((scheduledHours / fac.maxWeeklyHours) * 100);

          return (
            <div
              key={fac.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                      {fac.name.replace('Prof. ', '').replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                          {fac.employeeId}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight mt-0.5">
                        {fac.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{fac.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(fac)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Teacher"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(fac.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete Teacher"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Email */}
                {fac.email && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{fac.email}</span>
                  </div>
                )}

                {/* Qualified Subjects */}
                <div className="mt-3">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                    Qualified Subjects:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {fac.qualifiedSubjectCodes.map(code => (
                      <span
                        key={code}
                        className="text-[10px] font-mono px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md"
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Workload Progress & Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Weekly Load:</span>
                  </span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                    {scheduledHours} / {fac.maxWeeklyHours} hrs ({utilizationPct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      utilizationPct > 100
                        ? 'bg-rose-500'
                        : utilizationPct > 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, utilizationPct)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    {fac.availableDays.length} working days/wk
                  </span>
                  <button
                    onClick={() => onViewTeacherTimetable(fac.id)}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1"
                  >
                    <span>View Schedule</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Teacher Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingFaculty ? `Edit Teacher: ${editingFaculty.name}` : 'Register New Faculty Member'}
        subtitle="Manage professor credentials, department affiliation, and qualified course subjects"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveForm} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Employee ID
              </label>
              <input
                type="text"
                required
                value={empId}
                onChange={e => setEmpId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name (with Prefix)
              </label>
              <input
                type="text"
                required
                placeholder="Prof. Ramesh Sharma"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Institutional Email
              </label>
              <input
                type="email"
                placeholder="sharma@samaysetu.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <input
                type="text"
                required
                value={dept}
                onChange={e => setDept(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
              Max Weekly Teaching Hours
            </label>
            <input
              type="number"
              min={4}
              max={30}
              required
              value={maxHours}
              onChange={e => setMaxHours(Number(e.target.value))}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Qualified Subjects selector */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Qualified Subject Codes (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 max-h-36 overflow-y-auto">
              {subjects.map(s => {
                const isSelected = selectedSubjects.includes(s.code);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedSubjects(selectedSubjects.filter(c => c !== s.code));
                      } else {
                        setSelectedSubjects([...selectedSubjects, s.code]);
                      }
                    }}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-mono font-bold">{s.code}</span> - {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddEditModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              {editingFaculty ? 'Save Changes' : 'Register Teacher'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
