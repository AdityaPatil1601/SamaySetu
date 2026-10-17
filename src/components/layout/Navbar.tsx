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
  CalendarPlus,
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

  // Palette: Forest Green (#244B3B), Terracotta (#C66A4A), Soft Sand (#E2D5B8), Warm Ivory (#F6F1E8)
  const roleStyles = {
    admin: {
      badgeBg: 'bg-[#EDF3F0] text-[#244B3B] border-[#244B3B]/30',
      label: 'Admin Portal',
      icon: ShieldCheck,
    },
    teacher: {
      badgeBg: 'bg-[#FDF3EF] text-[#C66A4A] border-[#C66A4A]/30',
      label: 'Faculty Portal',
      icon: GraduationCap,
    },
    student: {
      badgeBg: 'bg-[#F6F1E8] text-[#535965] border-[#D8CEBA]',
      label: 'Student Portal',
      icon: BookOpen,
    },
  };

  const currentRoleStyle = role ? roleStyles[role] : roleStyles.admin;
  const RoleIcon = currentRoleStyle.icon;

  const adminUsers = availableUsers.filter(u => u.role === 'admin');
  const teacherUsers = availableUsers.filter(u => u.role === 'teacher');
  const studentUsers = availableUsers.filter(u => u.role === 'student');

  return (
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-[#E2D5B8] flex items-center justify-between gap-4 shrink-0 z-30 sticky top-0 shadow-xs">
      {/* Left: Mobile menu toggle & Institutional identity */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebarMobile}
          className="lg:hidden p-2 text-[#535965] hover:text-[#22252A] hover:bg-[#F6F1E8] rounded-lg transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#244B3B] flex items-center justify-center font-extrabold text-[#E2D5B8] text-sm shrink-0 shadow-xs">
            SS
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-[#22252A] truncate">
                SamaySetu
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F6F1E8] text-[#244B3B] border border-[#E2D5B8] font-mono">
                Term 2026-27
              </span>
            </div>
            <p className="text-[11px] text-[#535965] truncate hidden sm:block">
              Sardar Patel Institute of Technology · Academic Timetable Suite
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls: Role Badge, Schedule a Class button, Notices, Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Schedule a Class primary button for teacher */}
        {role === 'teacher' && onOpenScheduleClass && (
          <button
            onClick={onOpenScheduleClass}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#C66A4A] hover:bg-[#A95437] text-white shadow-xs transition-colors"
            title="Schedule a missed lecture or practical"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>Schedule a Class</span>
          </button>
        )}

        {/* Role Badge */}
        {role && (
          <div
            className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentRoleStyle.badgeBg}`}
          >
            <RoleIcon className="w-3.5 h-3.5" />
            <span>{currentRoleStyle.label}</span>
          </div>
        )}

        {/* Notices */}
        {onNavigateAnnouncements && (
          <button
            onClick={onNavigateAnnouncements}
            className="relative p-2 text-[#535965] hover:text-[#22252A] hover:bg-[#F6F1E8] rounded-lg transition-colors border border-transparent hover:border-[#E2D5B8]"
            title="Official Schedule Notices"
          >
            <Bell className="w-4 h-4" />
            {unreadAnnouncementsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C66A4A] ring-2 ring-white" />
            )}
          </button>
        )}

        {/* Solver Architecture button */}
        {onOpenBackendDocs && (
          <button
            onClick={onOpenBackendDocs}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#244B3B] hover:bg-[#EDF3F0] rounded-lg transition-colors border border-[#244B3B]/30"
            title="Constraint Solver Specifications"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Solver Core</span>
          </button>
        )}

        {/* User Account / Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-[#D8CEBA] hover:bg-[#F6F1E8] text-[#22252A] transition-colors"
            title="Switch User Profile"
          >
            <div className="w-7 h-7 rounded-full bg-[#244B3B] text-[#E2D5B8] flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser?.name ? currentUser.name[0] : 'U'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-[#22252A] truncate max-w-[120px]">
                {currentUser?.name || 'Guest'}
              </span>
              <span className="text-[10px] text-[#535965] capitalize">
                {currentUser?.role || 'Guest'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#535965]" />
          </button>

          {/* Switcher Dropdown Panel */}
          {userDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-80 max-h-[80vh] overflow-y-auto bg-white rounded-xl shadow-lg border border-[#E2D5B8] py-2 z-50 text-xs animate-in fade-in"
              onClick={() => setUserDropdownOpen(false)}
            >
              <div className="px-3 py-2 border-b border-[#E2D5B8] bg-[#F6F1E8]">
                <p className="font-bold text-[#22252A]">{currentUser?.name}</p>
                <p className="text-[11px] text-[#535965]">{currentUser?.email}</p>
                <div className="mt-1">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white text-[#244B3B] border border-[#E2D5B8]">
                    Role: {currentUser?.role}
                  </span>
                </div>
              </div>

              {/* Profiles */}
              <div className="p-2 space-y-2">
                <div>
                  <div className="px-2 py-1 text-[10px] uppercase font-bold text-[#244B3B] tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Administrator Profiles</span>
                  </div>
                  {adminUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => switchUser(u)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                        currentUser?.id === u.id
                          ? 'bg-[#EDF3F0] text-[#244B3B] font-bold border border-[#244B3B]/20'
                          : 'hover:bg-[#F6F1E8] text-[#22252A]'
                      }`}
                    >
                      <span>{u.name}</span>
                      <span className="text-[10px] text-[#535965]">Admin</span>
                    </button>
                  ))}
                </div>

                <div>
                  <div className="px-2 py-1 text-[10px] uppercase font-bold text-[#C66A4A] tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-3 h-3" />
                    <span>Faculty Profiles</span>
                  </div>
                  {teacherUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => switchUser(u)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                        currentUser?.id === u.id
                          ? 'bg-[#FDF3EF] text-[#C66A4A] font-bold border border-[#C66A4A]/20'
                          : 'hover:bg-[#F6F1E8] text-[#22252A]'
                      }`}
                    >
                      <div className="truncate">
                        <div>{u.name}</div>
                        <div className="text-[10px] text-[#535965]">{u.department}</div>
                      </div>
                      <span className="text-[10px] text-[#535965]">Faculty</span>
                    </button>
                  ))}
                </div>

                <div>
                  <div className="px-2 py-1 text-[10px] uppercase font-bold text-[#535965] tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" />
                    <span>Student Profiles</span>
                  </div>
                  {studentUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => switchUser(u)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                        currentUser?.id === u.id
                          ? 'bg-[#F6F1E8] text-[#22252A] font-bold border border-[#D8CEBA]'
                          : 'hover:bg-[#F6F1E8] text-[#535965]'
                      }`}
                    >
                      <div>
                        <div>{u.name}</div>
                        <div className="text-[10px] text-[#535965]">{u.rollNumber}</div>
                      </div>
                      <span className="text-[10px] text-[#535965]">Student</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#E2D5B8] px-2">
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#C66A4A] hover:bg-[#FDF3EF] font-bold flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
