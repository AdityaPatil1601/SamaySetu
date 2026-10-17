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
    { key: 'admin_generator', label: 'Constraint Generator', icon: Cpu },
    { key: 'admin_repair', label: 'Emergency Rescheduler', icon: Wrench, highlight: true },
    { key: 'admin_diagnostics', label: 'Conflict Diagnostics', icon: AlertTriangle, badge: diagnosticCount, badgeType: 'danger' },
    { key: 'admin_teachers', label: 'Faculty & Workload', icon: GraduationCap },
    { key: 'admin_students', label: 'Students & Batches', icon: Users },
    { key: 'admin_courses', label: 'Curriculum & Courses', icon: BookOpen },
    { key: 'admin_rooms', label: 'Classrooms & Labs', icon: DoorOpen },
    { key: 'admin_availability', label: 'Availability Matrix', icon: CalendarCheck },
    { key: 'admin_reports', label: 'Analytics & Reports', icon: BarChart3 },
    { key: 'admin_announcements', label: 'Campus Notices', icon: Bell },
    { key: 'admin_settings', label: 'College Settings', icon: Settings },
  ];

  const teacherNavItems: NavItemDef[] = [
    { key: 'teacher_dashboard', label: 'My Teaching Schedule', icon: Clock },
    { key: 'teacher_schedule_class', label: 'Schedule a Class', icon: CalendarPlus, highlight: true, isAction: true },
    { key: 'teacher_timetable', label: 'Institutional Timetable', icon: CalendarRange },
    {
      key: 'teacher_substitutions',
      label: 'Proxy & Substitutions',
      icon: UserCheck,
      badge: pendingSubstitutionsCount > 0 ? pendingSubstitutionsCount : undefined,
      badgeType: 'warning',
    },
    { key: 'teacher_availability', label: 'Slot Preferences', icon: CalendarCheck },
    { key: 'teacher_announcements', label: 'Schedule Bulletins', icon: Bell },
  ];

  const studentNavItems: NavItemDef[] = [
    { key: 'student_dashboard', label: 'Today’s Class Feed', icon: Clock },
    { key: 'student_timetable', label: 'Division Timetable', icon: CalendarRange },
    { key: 'student_freerooms', label: 'Vacant Study Rooms', icon: Compass },
    { key: 'student_faculty', label: 'Faculty Directory', icon: Building },
    { key: 'student_announcements', label: 'Timetable Notices', icon: Bell },
  ];

  const navItems = {
    admin: adminNavItems,
    teacher: teacherNavItems,
    student: studentNavItems,
  }[role || 'admin'];

  // Palette: Forest Green (#244B3B), Terracotta (#C66A4A), Soft Sand (#E2D5B8), Warm Ivory (#F6F1E8)
  const roleTheme = {
    admin: {
      activeBg: 'bg-[#EDF3F0] text-[#244B3B] border-l-[3px] border-[#244B3B] font-bold',
      activeBadge: 'bg-[#244B3B] text-white',
      accentColor: 'text-[#244B3B]',
      roleTitle: 'Administration Portal',
    },
    teacher: {
      activeBg: 'bg-[#EDF3F0] text-[#244B3B] border-l-[3px] border-[#244B3B] font-bold',
      activeBadge: 'bg-[#244B3B] text-white',
      accentColor: 'text-[#244B3B]',
      roleTitle: 'Faculty Workspace',
    },
    student: {
      activeBg: 'bg-[#FDF3EF] text-[#C66A4A] border-l-[3px] border-[#C66A4A] font-bold',
      activeBadge: 'bg-[#C66A4A] text-white',
      accentColor: 'text-[#C66A4A]',
      roleTitle: 'Student Portal',
    },
  }[role || 'admin'];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-[#22252A] border-r border-[#E2D5B8] shadow-xs">
      {/* Brand & Workspace Indicator */}
      <div className="px-4 py-3.5 border-b border-[#E2D5B8] flex items-center justify-between bg-[#F6F1E8]/70">
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-[#535965] font-bold">
              {roleTheme.roleTitle}
            </span>
            <span className="text-xs font-bold text-[#244B3B] tracking-tight">
              SPIT Timetable Engine
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-[#244B3B] text-[#E2D5B8] flex items-center justify-center font-bold text-xs mx-auto shadow-xs">
            SS
          </div>
        )}

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden text-[#535965] hover:text-[#22252A] p-1"
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
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left bg-[#C66A4A] hover:bg-[#A95437] text-white shadow-xs my-1.5"
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
                  : 'text-[#535965] hover:bg-[#F6F1E8] hover:text-[#22252A] font-medium'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? roleTheme.accentColor : 'text-[#535965]'}`} />
              {!collapsed && (
                <span className="truncate flex-1">{item.label}</span>
              )}
              {!collapsed && item.badge !== undefined && Number(item.badge) > 0 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? roleTheme.activeBadge
                      : item.badgeType === 'danger'
                      ? 'bg-[#FDF3EF] text-[#C66A4A] border border-[#C66A4A]/30'
                      : item.badgeType === 'warning'
                      ? 'bg-[#F6F1E8] text-[#535965] border border-[#E2D5B8]'
                      : 'bg-[#F6F1E8] text-[#535965]'
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
      <div className="p-3 border-t border-[#E2D5B8] bg-[#F6F1E8]/60">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="truncate mr-2">
              <div className="text-xs font-bold text-[#22252A] truncate">
                {currentUser?.name || 'User'}
              </div>
              <div className="text-[11px] text-[#535965] truncate">
                {currentUser?.department || currentUser?.rollNumber || currentUser?.email}
              </div>
            </div>
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 text-[#535965] hover:text-[#22252A] hover:bg-[#E2D5B8]/40 rounded-md transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="w-full flex justify-center p-1.5 text-[#535965] hover:text-[#22252A] hover:bg-[#E2D5B8]/40 rounded-md transition-colors"
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
          className="fixed inset-0 z-40 bg-[#22252A]/40 backdrop-blur-xs md:hidden"
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
