import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarRange,
  Cpu,
  Wrench,
  AlertTriangle,
  DoorOpen,
  CalendarCheck,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Search,
  Compass,
  Building,
  Clock,
  X,
  CalendarPlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavItemKey =
  // Admin tabs
  | 'admin_dashboard'
  | 'timetable'
  | 'admin_generator'
  | 'admin_repair'
  | 'admin_diagnostics'
  | 'admin_teachers'
  | 'admin_students'
  | 'admin_courses'
  | 'admin_rooms'
  | 'admin_availability'
  | 'admin_reports'
  | 'admin_announcements'
  | 'admin_settings'
  // Teacher tabs
  | 'teacher_dashboard'
  | 'teacher_timetable'
  | 'teacher_schedule_class'
  | 'teacher_substitutions'
  | 'teacher_availability'
  | 'teacher_announcements'
  // Student tabs
  | 'student_dashboard'
  | 'student_timetable'
  | 'student_freerooms'
  | 'student_faculty'
  | 'student_announcements';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  diagnosticCount: number;
  pendingSubstitutionsCount?: number;
  onOpenScheduleClass?: () => void;
}

interface NavItemDef {
  key: NavItemKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'danger' | 'warning' | 'neutral' | 'success';
  highlight?: boolean;
  isAction?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  diagnosticCount,
  pendingSubstitutionsCount = 0,
  onOpenScheduleClass,
}) => {
  const { role, currentUser } = useAuth();

  const adminNavItems: NavItemDef[] = [
    { key: 'admin_dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { key: 'timetable', label: 'Master Timetable Grid', icon: CalendarRange },
    { key: 'admin_generator', label: 'AI Constraint Generator', icon: Cpu },
    { key: 'admin_repair', label: 'Emergency Rescheduler', icon: Wrench, highlight: true },
    { key: 'admin_diagnostics', label: 'Conflict Diagnostics', icon: AlertTriangle, badge: diagnosticCount, badgeType: 'danger' },
    { key: 'admin_teachers', label: 'Faculty Directory & Quota', icon: GraduationCap },
    { key: 'admin_students', label: 'Student Cohorts & Batches', icon: Users },
    { key: 'admin_courses', label: 'Curriculum & Courses', icon: BookOpen },
    { key: 'admin_rooms', label: 'Facilities & Labs', icon: DoorOpen },
    { key: 'admin_availability', label: 'Availability Matrix', icon: CalendarCheck },
    { key: 'admin_reports', label: 'Analytics & Export Reports', icon: BarChart3 },
    { key: 'admin_announcements', label: 'Campus Notices', icon: Bell },
    { key: 'admin_settings', label: 'System Configuration', icon: Settings },
  ];

  const teacherNavItems: NavItemDef[] = [
    { key: 'teacher_dashboard', label: 'Teaching Schedule', icon: Clock },
    { key: 'teacher_schedule_class', label: 'Schedule a Class', icon: CalendarPlus, highlight: true, isAction: true },
    { key: 'teacher_timetable', label: 'Institutional Timetable', icon: CalendarRange },
    {
      key: 'teacher_substitutions',
      label: 'Proxy & Substitution Hub',
      icon: UserCheck,
      badge: pendingSubstitutionsCount > 0 ? pendingSubstitutionsCount : undefined,
      badgeType: 'warning',
    },
    { key: 'teacher_availability', label: 'Slot Preferences Matrix', icon: CalendarCheck },
    { key: 'teacher_announcements', label: 'Schedule Bulletins', icon: Bell },
  ];

  const studentNavItems: NavItemDef[] = [
    { key: 'student_dashboard', label: 'Today’s Lecture Feed', icon: Clock },
    { key: 'student_timetable', label: 'Division Timetable', icon: CalendarRange },
    { key: 'student_freerooms', label: 'Vacant Study Rooms & Labs', icon: Compass },
    { key: 'student_faculty', label: 'Faculty Cabins & Directory', icon: Building },
    { key: 'student_announcements', label: 'Timetable Notices', icon: Bell },
  ];

  const navItems = {
    admin: adminNavItems,
    teacher: teacherNavItems,
    student: studentNavItems,
  }[role || 'admin'];

  // Distinct refined corporate roles palette: Deep Slate / Indigo, Ocean Azure, Warm Amber
  const roleTheme = {
    admin: {
      activeBg: 'bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 border-l-[3px] border-indigo-600 font-bold',
      activeBadge: 'bg-indigo-600 text-white',
      accentColor: 'text-indigo-600 dark:text-indigo-400',
      roleTitle: 'Administration Portal',
    },
    teacher: {
      activeBg: 'bg-sky-50/80 dark:bg-sky-950/50 text-sky-950 dark:text-sky-200 border-l-[3px] border-sky-600 font-bold',
      activeBadge: 'bg-sky-600 text-white',
      accentColor: 'text-sky-600 dark:text-sky-400',
      roleTitle: 'Faculty Workspace',
    },
    student: {
      activeBg: 'bg-amber-50/80 dark:bg-amber-950/50 text-amber-950 dark:text-amber-200 border-l-[3px] border-amber-600 font-bold',
      activeBadge: 'bg-amber-600 text-white',
      accentColor: 'text-amber-600 dark:text-amber-400',
      roleTitle: 'Student Portal',
    },
  }[role || 'admin'];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-r border-slate-200/80 dark:border-slate-800 shadow-xs">
      {/* Brand & Workspace Indicator */}
      <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/40">
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
              {roleTheme.roleTitle}
            </span>
            <span className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight">
              SPIT Timetable Engine
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs mx-auto shadow-xs">
            SS
          </div>
        )}

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden text-slate-500 hover:text-slate-900 dark:hover:text-white p-1"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-3 px-2 overflow-y-auto space-y-1">
        {navItems.map(item => {
          const isActive = currentTab === item.key;
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <button
                key={item.key}
                onClick={() => {
                  if (onOpenScheduleClass) {
                    onOpenScheduleClass();
                  } else {
                    onSelectTab(item.key);
                  }
                  onCloseMobile();
                }}
                title={collapsed ? item.label : undefined}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs hover:shadow-md hover:from-blue-700 hover:to-indigo-700 my-1.5"
              >
                <Icon className="w-4 h-4 shrink-0 text-white" />
                {!collapsed && (
                  <span className="truncate flex-1">{item.label}</span>
                )}
                {!collapsed && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20 uppercase tracking-wider font-extrabold">
                    New
                  </span>
                )}
              </button>
            );
          }

          return (
            <button
              key={item.key}
              onClick={() => {
                onSelectTab(item.key);
                onCloseMobile();
              }}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all text-left ${
                isActive
                  ? roleTheme.activeBg
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? roleTheme.accentColor : 'text-slate-400 dark:text-slate-500'}`} />
              {!collapsed && (
                <span className="truncate flex-1">{item.label}</span>
              )}
              {!collapsed && item.badge !== undefined && Number(item.badge) > 0 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? roleTheme.activeBadge
                      : item.badgeType === 'danger'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      : item.badgeType === 'warning'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Info strip */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="truncate mr-2">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {currentUser?.name || 'User'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {currentUser?.department || currentUser?.rollNumber || currentUser?.email}
              </div>
            </div>
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-md transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="w-full flex justify-center p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-md transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
