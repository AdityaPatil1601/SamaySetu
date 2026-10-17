import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Users,
  DoorOpen,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Subject, Branch, Division, Faculty, Room, RoomType, AcademicYear } from '../../types';
import { Modal } from '../common/Modal';

interface CourseManagementProps {
  subjects: Subject[];
  branches: Branch[];
  divisions: Division[];
  faculty: Faculty[];
  rooms: Room[];
  onSaveSubjects: (subjects: Subject[]) => void;
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const CourseManagement: React.FC<CourseManagementProps> = ({
  subjects,
  branches,
  divisions,
  faculty,
  rooms,
  onSaveSubjects,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [branchId, setBranchId] = useState(branches[0]?.id || '');
  const [academicYear, setAcademicYear] = useState<AcademicYear>('FY');
  const [theorySessions, setTheorySessions] = useState(3);
  const [practicalSessions, setPracticalSessions] = useState(1);
  const [practicalDuration, setPracticalDuration] = useState(2);
  const [requiredRoomType, setRequiredRoomType] = useState<RoomType>('Classroom');
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<string[]>([]);
  const [selectedDivisionIds, setSelectedDivisionIds] = useState<string[]>([]);

  const roomTypes: RoomType[] = [
    'Classroom',
    'Computer Lab',
    'Electronics Lab',
    'Mechanical Lab',
    'Civil Lab',
    'Seminar Hall',
  ];

  const filteredDivisions = divisions.filter(
    d => d.branchId === branchId && d.academicYear === academicYear && d.active
  );

  const filteredSubjects = subjects.filter(s => {
    const matchesSearch =
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = selectedBranchFilter === 'ALL' || s.branchId === selectedBranchFilter;
    return matchesSearch && matchesBranch;
  });

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setCode('');
    setName('');
    setBranchId(branches[0]?.id || '');
    setAcademicYear('FY');
    setTheorySessions(3);
    setPracticalSessions(1);
    setPracticalDuration(2);
    setRequiredRoomType('Classroom');
    setSelectedFacultyIds([]);
    setSelectedDivisionIds([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setCode(subject.code);
    setName(subject.name);
    setBranchId(subject.branchId);
    setAcademicYear(subject.academicYear);
    setTheorySessions(subject.theorySessionsPerWeek);
    setPracticalSessions(subject.practicalSessionsPerWeek);
    setPracticalDuration(subject.practicalSlotDuration);
    setRequiredRoomType(subject.requiredRoomType);
    setSelectedFacultyIds(subject.eligibleFacultyIds);
    setSelectedDivisionIds(subject.divisionIds);
    setIsModalOpen(true);
  };

  const handleDelete = (subjectId: string) => {
    const s = subjects.find(x => x.id === subjectId);
    if (!s) return;
    const confirm = window.confirm(`Are you sure you want to delete course "${s.code} - ${s.name}"?`);
    if (!confirm) return;

    const updated = subjects.filter(x => x.id !== subjectId);
    onSaveSubjects(updated);
    if (onShowToast) {
      onShowToast('info', 'Course Deleted', `${s.code} removed from catalog.`);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;

    if (editingSubject) {
      const updated = subjects.map(s =>
        s.id === editingSubject.id
          ? {
              ...s,
              code: code.toUpperCase(),
              name,
              branchId,
              academicYear,
              theorySessionsPerWeek: Number(theorySessions),
              practicalSessionsPerWeek: Number(practicalSessions),
              practicalSlotDuration: Number(practicalDuration),
              requiredRoomType,
              eligibleFacultyIds: selectedFacultyIds,
              divisionIds: selectedDivisionIds.length > 0 ? selectedDivisionIds : filteredDivisions.map(d => d.id),
            }
          : s
      );
      onSaveSubjects(updated);
      if (onShowToast) {
        onShowToast('success', 'Course Updated', `${code} details and assigned teachers updated.`);
      }
    } else {
      const newSub: Subject = {
        id: `sub-${code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`,
        code: code.toUpperCase(),
        name,
        branchId,
        academicYear,
        divisionIds: selectedDivisionIds.length > 0 ? selectedDivisionIds : filteredDivisions.map(d => d.id),
        theorySessionsPerWeek: Number(theorySessions),
        practicalSessionsPerWeek: Number(practicalSessions),
        practicalSlotDuration: Number(practicalDuration),
        eligibleFacultyIds: selectedFacultyIds,
        permittedRoomIds: [],
        requiredRoomType,
        hasBatches: Number(practicalSessions) > 0,
        isShared: false,
      };
      onSaveSubjects([...subjects, newSub]);
      if (onShowToast) {
        onShowToast('success', 'Course Created', `${code} added with assigned faculty.`);
      }
    }

    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>Curriculum & Course Catalog</span>
            <span aria-hidden="true">•</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
              {subjects.length} Courses Offered
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Manage Courses, Classes & Teacher Assignments
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Configure weekly lecture quotas, laboratory requirements, and assign qualified teachers to courses.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by course code or subject title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Department Branch:</span>
          <select
            value={selectedBranchFilter}
            onChange={e => setSelectedBranchFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Branches</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>
                {b.code} ({b.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Course Catalog Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Subject Title</th>
                <th className="py-3 px-4">Branch & Year</th>
                <th className="py-3 px-4">Sessions / Week</th>
                <th className="py-3 px-4">Facility Type</th>
                <th className="py-3 px-4">Assigned Teachers</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSubjects.map(sub => {
                const br = branches.find(b => b.id === sub.branchId);
                const assignedFaculty = faculty.filter(f => sub.eligibleFacultyIds.includes(f.id));

                return (
                  <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {sub.code}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{sub.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {sub.divisionIds.length} enrolled class sections
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {br?.code} {sub.academicYear}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded font-mono font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                          {sub.theorySessionsPerWeek} Theory
                        </span>
                        {sub.practicalSessionsPerWeek > 0 && (
                          <span className="px-2 py-0.5 rounded font-mono font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300">
                            {sub.practicalSessionsPerWeek} Lab ({sub.practicalSlotDuration}h)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {sub.requiredRoomType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {assignedFaculty.length > 0 ? (
                        <div className="text-slate-800 dark:text-slate-200 text-xs">
                          {assignedFaculty.map(f => f.name.replace('Prof. ', '').replace('Dr. ', '')).join(', ')}
                        </div>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 text-[11px]">
                          <AlertTriangle className="w-3 h-3" />
                          <span>No teacher assigned</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(sub)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit Course"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="Delete Course"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? `Edit Course: ${editingSubject.code}` : 'Define New Academic Course'}
        subtitle="Configure weekly periods, assigned faculty teachers, and room type"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveForm} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Course Code
              </label>
              <input
                type="text"
                required
                placeholder="CS201"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Course Title
              </label>
              <input
                type="text"
                required
                placeholder="Design & Analysis of Algorithms"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Branch
              </label>
              <select
                value={branchId}
                onChange={e => setBranchId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.code} ({b.name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Academic Year
              </label>
              <select
                value={academicYear}
                onChange={e => setAcademicYear(e.target.value as AcademicYear)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              >
                <option value="FY">First Year (FY)</option>
                <option value="SY">Second Year (SY)</option>
                <option value="TY">Third Year (TY)</option>
                <option value="BY">Final Year (BY)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Theory Lectures / Week
              </label>
              <input
                type="number"
                min={0}
                max={6}
                value={theorySessions}
                onChange={e => setTheorySessions(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Practicals / Week
              </label>
              <input
                type="number"
                min={0}
                max={4}
                value={practicalSessions}
                onChange={e => setPracticalSessions(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Facility Required
              </label>
              <select
                value={requiredRoomType}
                onChange={e => setRequiredRoomType(e.target.value as RoomType)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              >
                {roomTypes.map(rt => (
                  <option key={rt} value={rt}>
                    {rt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assigned Teachers Selector */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Assign Eligible Teachers (Click to toggle)
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 max-h-36 overflow-y-auto">
              {faculty.map(f => {
                const isSelected = selectedFacultyIds.includes(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedFacultyIds(selectedFacultyIds.filter(id => id !== f.id));
                      } else {
                        setSelectedFacultyIds([...selectedFacultyIds, f.id]);
                      }
                    }}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {f.name} ({f.department})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              {editingSubject ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
