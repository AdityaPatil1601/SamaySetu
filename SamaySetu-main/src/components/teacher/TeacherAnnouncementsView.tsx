import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  Edit2,
  Send,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Announcement, Division, Faculty } from '../../types';
import { Modal } from '../common/Modal';

interface TeacherAnnouncementsViewProps {
  currentFaculty: Faculty | undefined;
  announcements: Announcement[];
  divisions: Division[];
  onSaveAnnouncements: (announcements: Announcement[]) => void;
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const TeacherAnnouncementsView: React.FC<TeacherAnnouncementsViewProps> = ({
  currentFaculty,
  announcements,
  divisions,
  onSaveAnnouncements,
  onShowToast,
}) => {
  const facId = currentFaculty?.id || 'fac-sharma';
  const authorName = currentFaculty?.name || 'Professor';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedDivId, setSelectedDivId] = useState<string>(divisions[0]?.id || '');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');

  // Filter announcements authored by this teacher or targeted to their classes
  const myAnnouncements = announcements.filter(
    a => a.authorName === authorName || a.targetAudience === 'teachers' || a.targetAudience === 'all'
  );

  const handleOpenAdd = () => {
    setEditingAnn(null);
    setTitle('');
    setContent('');
    setSelectedDivId(divisions[0]?.id || '');
    setPriority('normal');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditingAnn(ann);
    setTitle(ann.title);
    setContent(ann.content);
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
      onShowToast('info', 'Notice Deleted', 'Class bulletin removed.');
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
              divisionId: selectedDivId,
              priority,
            }
          : a
      );
      onSaveAnnouncements(updated);
      if (onShowToast) {
        onShowToast('success', 'Announcement Updated', 'Changes posted to student dashboard.');
      }
    } else {
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        title,
        content,
        authorName,
        authorRole: 'teacher',
        targetAudience: 'class',
        divisionId: selectedDivId,
        createdAt: new Date().toISOString(),
        priority,
      };
      onSaveAnnouncements([newAnn, ...announcements]);
      if (onShowToast) {
        onShowToast('success', 'Announcement Published', 'Notice published to class section.');
      }
    }

    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">
            <Bell className="w-4 h-4" />
            <span>Class Communication</span>
            <span aria-hidden="true">•</span>
            <span>Broadcast Circulars</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Class Announcements & Notes
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Send reminders about assignment deadlines, lab prerequisites, and class scheduling updates directly to students.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post Class Notice</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {myAnnouncements.map(ann => {
          const isMyNotice = ann.authorName === authorName;
          const targetDiv = divisions.find(d => d.id === ann.divisionId);

          return (
            <div
              key={ann.id}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Target: {targetDiv ? `${targetDiv.academicYear} - ${targetDiv.name}` : ann.targetAudience}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{ann.title}</h3>
                </div>

                {isMyNotice && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(ann)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(ann.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                {ann.content}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span>
                  Author: <strong className="text-slate-800 dark:text-slate-200">{ann.authorName}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Post Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAnn ? 'Edit Notice' : 'Post New Class Announcement'}
        subtitle="Broadcast directly to student portals in the selected division"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveForm} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notice Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Lab Exercise 03 Deadline Extended"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Target Class Section
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

            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              >
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
              Message Content
            </label>
            <textarea
              required
              rows={4}
              placeholder="Type instructions or details for students..."
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
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast to Students</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
