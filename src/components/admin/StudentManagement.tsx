import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Phone,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { Student, Division, StudentBatch, Branch, AcademicYear } from '../../types';
import { Modal } from '../common/Modal';

interface StudentManagementProps {
  students: Student[];
  divisions: Division[];
  batches: StudentBatch[];
  branches: Branch[];
  onSaveStudents: (students: Student[]) => void;
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  divisions,
  batches,
  branches,
  onSaveStudents,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivFilter, setSelectedDivFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form states
  const [rollNumber, setRollNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [divisionId, setDivisionId] = useState(divisions[0]?.id || '');
  const [batchId, setBatchId] = useState('');

  const activeBatchesForDiv = batches.filter(b => b.divisionId === divisionId);

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiv = selectedDivFilter === 'ALL' || s.divisionId === selectedDivFilter;
    return matchesSearch && matchesDiv;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setRollNumber(`FY-CMPN-1${String(students.length + 1).padStart(2, '0')}`);
    setName('');
    setEmail('');
    setPhone('+91 98200 12345');
    setDivisionId(divisions[0]?.id || '');
    setBatchId('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setRollNumber(student.rollNumber);
    setName(student.name);
    setEmail(student.email);
    setPhone(student.phone);
    setDivisionId(student.divisionId);
    setBatchId(student.batchId || '');
    setIsModalOpen(true);
  };

  const handleDelete = (studentId: string) => {
    const s = students.find(x => x.id === studentId);
    if (!s) return;
    const confirm = window.confirm(`Are you sure you want to remove student "${s.name}" (${s.rollNumber})?`);
    if (!confirm) return;

    const updated = students.filter(x => x.id !== studentId);
    onSaveStudents(updated);
    if (onShowToast) {
      onShowToast('info', 'Student Record Removed', `${s.name} was removed from the registry.`);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rollNumber) return;

    const targetDiv = divisions.find(d => d.id === divisionId);
    const branchId = targetDiv?.branchId || branches[0]?.id || '';
    const academicYear = targetDiv?.academicYear || 'FY';

    if (editingStudent) {
      const updated = students.map(s =>
        s.id === editingStudent.id
          ? {
              ...s,
              rollNumber,
              name,
              email: email || `${name.toLowerCase().replace(/[^a-z]/g, '')}@student.samaysetu.edu`,
              phone,
              divisionId,
              batchId: batchId || undefined,
              branchId,
              academicYear,
            }
          : s
      );
      onSaveStudents(updated);
      if (onShowToast) {
        onShowToast('success', 'Student Updated', `${name}'s profile and class assignment updated.`);
      }
    } else {
      const newStudent: Student = {
        id: `stud-${Date.now().toString().slice(-4)}`,
        rollNumber,
        name,
        email: email || `${name.toLowerCase().replace(/[^a-z]/g, '')}@student.samaysetu.edu`,
        phone,
        divisionId,
        batchId: batchId || undefined,
        branchId,
        academicYear,
      };
      onSaveStudents([...students, newStudent]);
      if (onShowToast) {
        onShowToast('success', 'Student Enrolled', `${name} successfully enrolled in ${targetDiv?.name || 'Class'}.`);
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
            <span>Student Administration</span>
            <span aria-hidden="true">•</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
              {students.length} Enrolled Students
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Manage Students & Class Assignments
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Search, enroll, assign students to class divisions, practical lab batches, and monitor attendance health.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Enroll New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Class Section:</span>
          <select
            value={selectedDivFilter}
            onChange={e => setSelectedDivFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Divisions</option>
            {divisions.map(d => {
              const br = branches.find(b => b.id === d.branchId);
              return (
                <option key={d.id} value={d.id}>
                  {br?.code} {d.academicYear} {d.name}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Assigned Division</th>
                <th className="py-3 px-4">Lab Batch</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map(student => {
                const div = divisions.find(d => d.id === student.divisionId);
                const br = branches.find(b => b.id === student.branchId);
                const batch = batches.find(b => b.id === student.batchId);

                return (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {student.rollNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{student.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{student.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {br?.code} {student.academicYear} - {div?.name || 'Assigned Div'}
                    </td>
                    <td className="py-3.5 px-4">
                      {batch ? (
                        <span className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          Batch {batch.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {student.phone}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {br?.name || 'Engineering'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit Student"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="Remove Student"
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

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? `Edit Student: ${editingStudent.name}` : 'Enroll New Student'}
        subtitle="Manage student demographic profile, division placement, and practical lab batch"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveForm} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Roll Number / Student ID
              </label>
              <input
                type="text"
                required
                value={rollNumber}
                onChange={e => setRollNumber(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Aarav Patel"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="aarav@student.samaysetu.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98200 12345"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Assign to Class / Division
              </label>
              <select
                value={divisionId}
                onChange={e => {
                  setDivisionId(e.target.value);
                  setBatchId('');
                }}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              >
                {divisions.map(d => {
                  const br = branches.find(b => b.id === d.branchId);
                  return (
                    <option key={d.id} value={d.id}>
                      {br?.code} {d.academicYear} - {d.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Assign to Lab Batch (Optional)
              </label>
              <select
                value={batchId}
                onChange={e => setBatchId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              >
                <option value="">No Batch Assigned</option>
                {activeBatchesForDiv.map(b => (
                  <option key={b.id} value={b.id}>
                    Batch {b.name} ({b.studentCount} students)
                  </option>
                ))}
              </select>
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
              {editingStudent ? 'Save Changes' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
