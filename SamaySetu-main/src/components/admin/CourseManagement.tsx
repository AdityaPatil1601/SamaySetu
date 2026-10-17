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
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#BCE5D1] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#059669] mb-1">
            <BookOpen className="w-4 h-4 text-[#10B981]" />
            <span>Curriculum & Course Catalog</span>
            <span aria-hidden="true">•</span>
            <span className="font-mono text-[#133E35] font-bold">
              {subjects.length} Courses Offered
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#133E35] tracking-tight">
            Manage Courses, Classes & Teacher Assignments
          </h1>
          <p className="text-xs text-[#2D6A4F] mt-1">
            Configure weekly lecture quotas, laboratory requirements, and assign qualified teachers to courses.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#BCE5D1] shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#10B981] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by course code or subject title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-[#F8FCF9] border border-[#BCE5D1] rounded-xl text-[#133E35] placeholder-[#2D6A4F]/60 font-semibold focus:outline-none focus:ring-2 focus:ring-[#10B981]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#10B981]" />
          <span className="text-xs text-[#133E35] font-bold">Department Branch:</span>
          <select
            value={selectedBranchFilter}
            onChange={e => setSelectedBranchFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-[#F8FCF9] border border-[#BCE5D1] rounded-xl font-bold text-[#133E35] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
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
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#BCE5D1] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#E6FDF0] border-b border-[#BCE5D1] text-[#133E35] font-black text-[11px] tracking-wider uppercase">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Subject Title</th>
                <th className="py-3 px-4">Branch & Year</th>
                <th className="py-3 px-4">Sessions / Week</th>
                <th className="py-3 px-4">Facility Type</th>
                <th className="py-3 px-4">Assigned Teachers</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2F3EC]">
              {filteredSubjects.map(sub => {
                const br = branches.find(b => b.id === sub.branchId);
                const assignedFaculty = faculty.filter(f => sub.eligibleFacultyIds.includes(f.id));

                return (
                  <tr key={sub.id} className="hover:bg-[#F2FBF6] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-black text-[#133E35]">
                      {sub.code}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#133E35]">{sub.name}</div>
                      <div className="text-[11px] text-[#2D6A4F] font-medium mt-0.5">
                        {sub.divisionIds.length} enrolled class sections
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#14532D]">
                      {br?.code} {sub.academicYear}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded font-mono font-bold bg-[#E6FDF0] text-[#065F46] border border-[#A7F3D0] text-[11px]">
                          {sub.theorySessionsPerWeek} Theory
                        </span>
                        {sub.practicalSessionsPerWeek > 0 && (
                          <span className="px-2.5 py-0.5 rounded font-mono font-bold bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] text-[11px]">
                            {sub.practicalSessionsPerWeek} Lab ({sub.practicalSlotDuration}h)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
                        {sub.requiredRoomType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {assignedFaculty.length > 0 ? (
                        <div className="text-[#133E35] text-xs font-semibold">
                          {assignedFaculty.map(f => f.name.replace('Prof. ', '').replace('Dr. ', '')).join(', ')}
                        </div>
                      ) : (
                        <span className="text-red-600 font-bold flex items-center gap-1 text-[11px]">
                          <AlertTriangle className="w-3 h-3" />
                          <span>No teacher assigned</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(sub)}
                          className="p-1.5 text-[#2D6A4F] hover:text-[#059669] rounded-lg hover:bg-[#EAF6F0] transition-colors"
                          title="Edit Course"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="p-1.5 text-[#2D6A4F] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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
              <label className="block text-[11px] font-bold text-[#133E35] mb-1">
                Course Code
              </label>
              <input
                type="text"
                required
                placeholder="CS201"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-[#F8FCF9] border border-[#BCE5D1] rounded-xl font-mono uppercase text-[#133E35] font-bold focus:ring-2 focus:ring-[#10B981]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[#133E35] mb-1">
                Course Title
              </label>
              <input
                type="text"
                required
                placeholder="Design & Analysis of Algorithms"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-[#F8FCF9] border border-[#BCE5D1] rounded-xl text-[#133E35] font-semibold focus:ring-2 focus:ring-[#10B981]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#133E35] mb-1">
                Branch
              </label>
              <select
                value={branchId}
                onChange={e => setBranchId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-[#F8FCF9] border border-[#BCE5D1] rounded-xl text-[#133E35] font-semibold focus:ring-2 focus:ring-[#10B981]"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.code} ({b.name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#133E35] mb-1">
                Academic Year
              </label>
              <select
                value={academicYear}
                onChange={e => setAcademicYear(e.target.value as AcademicYear)}
                className="w-full text-xs px-3 py-2 bg-[#F8FCF9] border border-[#BCE5D1] rounded-xl text-[#133E35] font-semibold focus:ring-2 focus:ring-[#10B981]"
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
              <label className="block text-[11px] font-bold text-[#133E35] mb-1">
                Theory Lectures / Week
              </label>
              <input
                type="number"
                min={0}
                max={6}
                value={theorySessions}
                onChange={e => setTheorySessions(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-[#F8FCF9] border border-[#BCE5D1] rounded-xl font-mono text-[#133E35] font-bold focus:ring-2 focus:ring-[#10B981]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#133E35] mb-1">
                Practicals / Week
              </label>
              <input
                type="number"
                min={0}
                max={4}
                value={practicalSessions}
                onChange={e => setPracticalSessions(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-[#F8FCF9] border border-[#BCE5D1] rounded-xl font-mono text-[#133E35] font-bold focus:ring-2 focus:ring-[#10B981]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#133E35] mb-1">
                Facility Required
              </label>
              <select
                value={requiredRoomType}
                onChange={e => setRequiredRoomType(e.target.value as RoomType)}
                className="w-full text-xs px-3 py-2 bg-[#F8FCF9] border border-[#BCE5D1] rounded-xl text-[#133E35] font-semibold focus:ring-2 focus:ring-[#10B981]"
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
            <label className="block text-[11px] font-bold text-[#133E35] mb-1.5">
              Assign Eligible Teachers (Click to toggle)
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-[#F8FCF9] rounded-xl border border-[#BCE5D1] max-h-36 overflow-y-auto">
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
                        ? 'bg-[#133E35] text-white border-[#133E35] font-bold shadow-2xs'
                        : 'bg-white text-[#14532D] border border-[#BCE5D1] hover:bg-[#EAF6F0] font-semibold'
                    }`}
                  >
                    {f.name} ({f.department})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#BCE5D1]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#2D6A4F] hover:bg-[#EAF6F0] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] rounded-xl shadow-xs transition-colors"
            >
              {editingSubject ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
