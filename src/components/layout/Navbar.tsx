import React, { useState } from 'react';
import {
  LogOut,
  Users,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  ChevronDown,
  Menu,
  Bell,
  Code2,
  CalendarRange,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, User } from '../../types';

interface NavbarProps {
  onToggleSidebarMobile: () => void;
  onOpenBackendDocs?: () => void;
  unreadAnnouncementsCount?: number;
  onNavigateAnnouncements?: () => void;
  onOpenScheduleClass?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebarMobile,
  onOpenBackendDocs,
  unreadAnnouncementsCount = 0,
  onNavigateAnnouncements,
  onOpenScheduleClass,
}) => {
  const { currentUser, role, logout, availableUsers, switchUser } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Modern corporate academic theme badges: Deep Sapphire, Ocean Azure, Warm Amber
  const roleStyles = {
    admin: {
      badgeBg: 'bg-indigo-50 text-indigo-900 border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-200 dark:border-indigo-800',
      dotColor: 'bg-indigo-600',
      label: 'Admin Portal',
      icon: ShieldCheck,
      color: 'indigo',
    },
    teacher: {
      badgeBg: 'bg-sky-50 text-sky-950 border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-800',
      dotColor: 'bg-sky-600',
      label: 'Faculty Portal',
      icon: GraduationCap,
      color: 'sky',
    },
    student: {
      badgeBg: 'bg-amber-50 text-amber-950 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800',
      dotColor: 'bg-amber-600',
      label: 'Student Portal',
      icon: BookOpen,
      color: 'amber',
    },
  };

  const currentRoleStyle = role ? roleStyles[role] : roleStyles.admin;
  const RoleIcon = currentRoleStyle.icon;

  const adminUsers = availableUsers.filter(u => u.role === 'admin');
  const teacherUsers = availableUsers.filter(u => u.role === 'teacher');
  const studentUsers = availableUsers.filter(u => u.role === 'student');

  return (
    <header className="h-16 px-4 sm:px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0 z-30 sticky top-0 shadow-xs">
      {/* Left: Mobile hamburger & Institutional title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebarMobile}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-700 dark:from-indigo-900 dark:via-blue-800 dark:to-cyan-600 flex items-center justify-center font-bold text-white text-base shadow-sm ring-1 ring-white/20 shrink-0">
            <span className="tracking-tight">SS</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white truncate">
                SamaySetu
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
                Term 2026-27
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden sm:block">
              Sardar Patel Institute of Technology & Engineering · Central Timetable Suite
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls: Schedule Class (for Faculty), Role Badge, Announcements, Solver Docs, Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick "Schedule a Class" button directly in Navbar for Teacher */}
        {role === 'teacher' && onOpenScheduleClass && (
          <button
            onClick={onOpenScheduleClass}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow transition-all"
            title="Schedule a missed lecture or lab"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Schedule a Class</span>
          </button>
        )}

        {/* Role Badge */}
        {role && (
          <div
            className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${currentRoleStyle.badgeBg}`}
          >
            <RoleIcon className="w-3.5 h-3.5" />
            <span>{currentRoleStyle.label}</span>
          </div>
        )}

        {/* Announcements Notification */}
        {onNavigateAnnouncements && (
          <button
            onClick={onNavigateAnnouncements}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Timetable Announcements & Notices"
          >
            <Bell className="w-4 h-4" />
            {unreadAnnouncementsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>
        )}

        {/* Solver Engine Doc button */}
        {onOpenBackendDocs && (
          <button
            onClick={onOpenBackendDocs}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
            title="FastAPI & OR-Tools CP-SAT Architecture"
          >
            <Code2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Solver Engine</span>
          </button>
        )}

        {/* User Profile & Demo Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            title="Account & Role Switcher"
          >
            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser?.name ? currentUser.name[0] : 'U'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                {currentUser?.name || 'Guest'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                {currentUser?.role || 'Guest'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Switcher Dropdown Panel */}
          {userDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-80 max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 text-xs animate-in fade-in zoom-in-95"
              onClick={() => setUserDropdownOpen(false)}
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-slate-100">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{currentUser?.email}</p>
                <div className="mt-1">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Active Role: {currentUser?.role}
                  </span>
                </div>
              </div>

              {/* Grouped Profiles for Quick Role Switch */}
              <div className="p-2 space-y-2">
                <div>
                  <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-indigo-600" />
                    <span>Administrator Profiles</span>
                  </div>
                  {adminUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => switchUser(u)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                        currentUser?.id === u.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{u.name}</span>
                      <span className="text-[10px] text-slate-400">Admin</span>
                    </button>
                  ))}
                </div>

                <div>
                  <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-3 h-3 text-sky-600" />
                    <span>Faculty Profiles</span>
                  </div>
                  {teacherUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => switchUser(u)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                        currentUser?.id === u.id
                          ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-950 dark:text-sky-200 font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="truncate">
                        <div>{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.department}</div>
                      </div>
                      <span className="text-[10px] text-slate-400">Faculty</span>
                    </button>
                  ))}
                </div>

                <div>
                  <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-amber-600" />
                    <span>Student Profiles</span>
                  </div>
                  {studentUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => switchUser(u)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                        currentUser?.id === u.id
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-950 dark:text-amber-200 font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div>{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.rollNumber}</div>
                      </div>
                      <span className="text-[10px] text-slate-400">Student</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 px-2">
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out of Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
