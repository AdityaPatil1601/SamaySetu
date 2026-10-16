import React, { useState } from 'react';
import {
  ShieldCheck,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  UserCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CalendarPlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, User } from '../../types';

export const LoginView: React.FC = () => {
  const { login, availableUsers } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('teacher');
  const [selectedUserId, setSelectedUserId] = useState<string>('user-teacher-sharma');
  const [passwordInput, setPasswordInput] = useState('demo123');

  // Sophisticated collegiate palette: Indigo (Admin), Ocean Sky (Faculty), Warm Amber (Student)
  const roleMeta = {
    admin: {
      title: 'Administrator',
      color: 'indigo',
      badge: 'Master College Governance',
      border: 'border-indigo-500',
      bgActive: 'bg-indigo-600 text-white',
      badgeBg: 'bg-indigo-50 text-indigo-900 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-200 dark:border-indigo-800',
      icon: ShieldCheck,
      description: 'Central automated solver, constraint configuration, classroom & lab allocations, emergency repair, and institution workload reports.',
      demoUsers: availableUsers.filter(u => u.role === 'admin'),
      buttonBg: 'bg-indigo-600 hover:bg-indigo-700',
      accentColor: 'text-indigo-700 dark:text-indigo-400',
    },
    teacher: {
      title: 'Faculty / Teacher',
      color: 'sky',
      badge: 'Academic Instruction & Compensatory Classes',
      border: 'border-sky-500',
      bgActive: 'bg-sky-600 text-white',
      badgeBg: 'bg-sky-50 text-sky-950 border-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-800',
      icon: GraduationCap,
      description: 'Personalized weekly schedule, "Schedule a Class" for compensatory lectures, peer proxy requests, and slot preference matrix.',
      demoUsers: availableUsers.filter(u => u.role === 'teacher'),
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      accentColor: 'text-blue-600 dark:text-blue-400',
    },
    student: {
      title: 'Student Portal',
      color: 'amber',
      badge: 'Timetable & Campus Navigation',
      border: 'border-amber-500',
      bgActive: 'bg-amber-600 text-white',
      badgeBg: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800',
      icon: BookOpen,
      description: 'Weekly division timetable, batch filter (A1/A2 practicals), real-time vacant classroom & lab locator, and professor cabin directory.',
      demoUsers: availableUsers.filter(u => u.role === 'student'),
      buttonBg: 'bg-amber-600 hover:bg-amber-700',
      accentColor: 'text-amber-700 dark:text-amber-400',
    },
  };

  const currentMeta = roleMeta[selectedRole];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    const firstUser = roleMeta[role].demoUsers[0];
    if (firstUser) {
      setSelectedUserId(firstUser.id);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole, selectedUserId);
  };

  const selectedUserObj = availableUsers.find(u => u.id === selectedUserId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/30 flex items-center justify-center p-4 sm:p-6 text-slate-900 font-sans">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 bg-white">
        
        {/* Left Side: Institutional Presentation */}
        <div className="md:col-span-5 p-6 sm:p-8 bg-slate-900 text-white flex flex-col justify-between space-y-6 relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-700 flex items-center justify-center font-extrabold text-white text-xl shadow-lg ring-1 ring-white/20">
                SS
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-white">SamaySetu</h1>
                <p className="text-xs text-slate-400">Autonomous Timetable Orchestrator</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-inner space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Sardar Patel Institute of Tech
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Centralized multi-department academic scheduler managing Computer, IT, Electronics, and Mechanical divisions with zero teacher or room clashes.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Smart <strong>"Schedule a Class"</strong> compensatory module for faculty</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Deterministic constraint-based engine for theory & 2-hour labs</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Automated substitution & peer proxy coverage with instant free-slot detection</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between relative z-10">
            <span>Odd Term 2026-27</span>
            <span className="font-mono text-blue-400 font-bold">100% Conflict-Free Matrix</span>
          </div>
        </div>

        {/* Right Side: Role Selector & Direct User Login */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="mb-5">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Sign In to Academic Workspace
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select your institution role and choose your profile to proceed.
              </p>
            </div>

            {/* Role Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-5 p-1 bg-slate-100 rounded-2xl">
              {(['admin', 'teacher', 'student'] as UserRole[]).map(roleKey => {
                const meta = roleMeta[roleKey];
                const Icon = meta.icon;
                const isSelected = selectedRole === roleKey;
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => handleRoleSelect(roleKey)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${meta.accentColor}`} />
                    <span>{meta.title.split('/')[0].trim()}</span>
                  </button>
                );
              })}
            </div>

            {/* Role Description */}
            <div className="mb-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>{currentMeta.badge}</span>
              </div>
              <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                {currentMeta.description}
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select {currentMeta.title} Profile ({currentMeta.demoUsers.length} available)
                </label>
                <select
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                >
                  {currentMeta.demoUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} · {user.department || user.rollNumber}
                    </option>
                  ))}
                </select>
              </div>

              {selectedUserObj && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between shadow-xs">
                  <div>
                    <div className="font-bold text-slate-900">{selectedUserObj.name}</div>
                    <div className="text-[11px] text-slate-500">{selectedUserObj.email}</div>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                    {selectedUserObj.department || selectedUserObj.rollNumber}
                  </span>
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-3 px-4 ${currentMeta.buttonBg} text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg`}
              >
                <span>Enter as {selectedUserObj?.name || currentMeta.title}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="text-center pt-2">
            <span className="text-[11px] text-slate-400">
              Zero mock LMS clutter · 100% Institutional Academic Timetable Suite
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
