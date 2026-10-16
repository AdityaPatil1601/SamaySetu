import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  Edit2,
  Users,
  GraduationCap,
  BookOpen,
  AlertTriangle,
  Send,
  Calendar,
} from 'lucide-react';
import { Announcement, Division, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';

interface AdminAnnouncementsProps {
  announcements: Announcement[];
  divisions: Division[];
  onSaveAnnouncements: (announcements: Announcement[]) => void;
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const AdminAnnouncements: React.FC<AdminAnnouncementsProps> = ({
  announcements,
  divisions,
  onSaveAnnouncements,
  onShowToast,
}) => {
  const { currentUser } = useAuth();
  const [filterAudience, setFilterAudience] = useState<string>('all_filter');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'teachers' | 'students' | 'class'>('all');
  const [selectedDivId, setSelectedDivId] = useState<string>(divisions[0]?.id || '');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');

  const filteredAnnouncements = announcements.filter(a => {
    if (filterAudience === 'all_filter') return true;
    return a.targetAudience === filterAudience;
  });

  const handleOpenAdd = () => {
    setEditingAnn(null);
    setTitle('');
    setContent('');
    setTargetAudience('all');
    setPriority('normal');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditingAnn(ann);
    setTitle(ann.title);
    setContent(ann.content);
    setTargetAudience(ann.targetAudience);
    setSelectedDivId(ann.divisionId || divisions[0]?.id || '');
    setPriority(ann.priority);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this notice?');
    if (!confirm) return;
    const updated = announcements.filter(a => a.id !== id);
    onSaveAnnouncements(updated);
    if (onShowToast) {
      onShowToast('info', 'Announcement Removed', 'The bulletin was archived.');
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    if (editingAnn) {
      const updated = announcements.map(a =>
        a.id === editingAnn.id
          ? {
              ...a,
              title,
              content,
              targetAudience,
              divisionId: targetAudience === 'class' ? selectedDivId : undefined,
              priority,
            }
          : a
      );
      onSaveAnnouncements(updated);
      if (onShowToast) {
        onShowToast('success', 'Announcement Updated', 'Changes broadcasted across campus.');
      }
    } else {
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        title,
        content,
        authorName: currentUser?.name || 'Academic Deanery',
        authorRole: (currentUser?.role || 'admin') as UserRole,
        targetAudience,
        divisionId: targetAudience === 'class' ? selectedDivId : undefined,
        createdAt: new Date().toISOString(),
        priority,
      };
      onSaveAnnouncements([newAnn, ...announcements]);
      if (onShowToast) {
        onShowToast('success', 'Announcement Published', 'Notice is now live for target users.');
      }
    }

    setIsModalOpen(false);
  };

  const getPriorityBadge = (p: 'normal' | 'important' | 'urgent') => {
    switch (p) {
      case 'urgent':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            Urgent Notice
          </span>
        );
      case 'important':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Important
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            General
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <Bell className="w-4 h-4 text-indigo-500" />
            <span>Institutional Notice Bulletin</span>
            <span aria-hidden="true">•</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
              {announcements.length} Published Notices
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Campus Announcements & Notices
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Broadcast official circulars, exam schedule releases, and academic instructions to teachers and students.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post Announcement</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'all_filter', label: 'All Notices' },
          { key: 'all', label: 'Campus-wide' },
          { key: 'teachers', label: 'Teachers Only' },
          { key: 'students', label: 'Students Only' },
          { key: 'class', label: 'Class Specific' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterAudience(tab.key)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
              filterAudience === tab.key
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map(ann => (
          <div
            key={ann.id}
            className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  {getPriorityBadge(ann.priority)}
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800 uppercase tracking-wide">
                    Audience: {ann.targetAudience}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(ann.createdAt).toLocaleDateString()} at{' '}
                    {new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{ann.title}</h3>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleOpenEdit(ann)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Edit Notice"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(ann.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  title="Delete Notice"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              {ann.content}
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <span>
                Posted by: <strong className="text-slate-800 dark:text-slate-200">{ann.authorName}</strong> ({ann.authorRole.toUpperCase()})
              </span>
              {ann.divisionId && (
                <span className="font-mono">
                  Section: {divisions.find(d => d.id === ann.divisionId)?.name || ann.divisionId}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Announcement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAnn ? 'Edit Notice' : 'Broadcast New Announcement'}
        subtitle="Publish institutional memo to teachers, students, or specific sections"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveForm} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
              Announcement Title / Headline
            </label>
            <input
              type="text"
              required
              placeholder="e.g. End Semester Practical Schedule Published"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Target Audience
              </label>
              <select
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value as any)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              >
                <option value="all">Campus-wide (All Teachers & Students)</option>
                <option value="teachers">Faculty / Teachers Only</option>
                <option value="students">Students Only</option>
                <option value="class">Specific Class Section Only</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              >
                <option value="normal">Normal Information</option>
                <option value="important">Important Notification</option>
                <option value="urgent">Urgent / Critical Notice</option>
              </select>
            </div>
          </div>

          {targetAudience === 'class' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Select Class Division
              </label>
              <select
                value={selectedDivId}
                onChange={e => setSelectedDivId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              >
                {divisions.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.academicYear} - {d.name} ({d.studentCount} students)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notice Body Content
            </label>
            <textarea
              required
              rows={4}
              placeholder="Enter comprehensive announcement text, schedule dates, or policy details..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
            />
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
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{editingAnn ? 'Save Changes' : 'Broadcast Notice'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
