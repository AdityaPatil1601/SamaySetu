import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/auth/LoginView';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TeacherManagement } from './components/admin/TeacherManagement';
import { StudentManagement } from './components/admin/StudentManagement';
import { CourseManagement } from './components/admin/CourseManagement';
import { AdminAnnouncements } from './components/admin/AdminAnnouncements';
import { RoomManagementView } from './components/rooms/RoomManagementView';
import { AvailabilityMatrixView } from './components/availability/AvailabilityMatrixView';
import { TimetableGeneratorView } from './components/generator/TimetableGeneratorView';
import { EmergencyRepairView } from './components/repair/EmergencyRepairView';
import { ConflictDiagnosticsView } from './components/diagnostics/ConflictDiagnosticsView';
import { ReportsAnalyticsView } from './components/reports/ReportsAnalyticsView';
import { SettingsView } from './components/settings/SettingsView';
import { BackendIntegrationModal } from './components/settings/BackendIntegrationModal';

// Teacher Components
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { TeacherSubstitutionView } from './components/teacher/TeacherSubstitutionView';
import { TeacherAvailabilityView } from './components/teacher/TeacherAvailabilityView';
import { TeacherAnnouncementsView } from './components/teacher/TeacherAnnouncementsView';

// Student Components
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentTimetableView } from './components/student/StudentTimetableView';
import { StudentFreeRoomsView } from './components/student/StudentFreeRoomsView';
import { StudentFacultyDirectoryView } from './components/student/StudentFacultyDirectoryView';
import { StudentAnnouncementsView } from './components/student/StudentAnnouncementsView';

// Unified Timetable Component
import { TimetableView } from './components/timetable/TimetableView';

// Common Components
import { Toast, ToastProps } from './components/common/Toast';
import { PdfPreviewModal } from './components/common/PdfPreviewModal';
import { ScheduleClassModal } from './components/common/ScheduleClassModal';

// Storage & Services
import { CollegeStorage, ActivityItem } from './services/storage/collegeStorage';
import { expandRequiredSessions } from './services/sessionExpander';
import { runIndependentValidation } from './services/validator/independentValidator';
import {
  Branch,
  Division,
  StudentBatch,
  Faculty,
  Room,
  Subject,
  CollegeSettings,
  ScheduleVersion,
  ValidationResult,
  Student,
  Announcement,
  SubstitutionRequest,
  ScheduleAssignment,
} from './types';

const AppContent: React.FC = () => {
  const { currentUser, role, isAuthenticated, hasRole } = useAuth();

  // Navigation & UI state
  const [currentTab, setCurrentTab] = useState<NavItemKey>(() => {
    if (role === 'teacher') return 'teacher_dashboard';
    if (role === 'student') return 'student_dashboard';
    return 'admin_dashboard';
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState<boolean>(false);
  const [backendDocsOpen, setBackendDocsOpen] = useState<boolean>(false);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState<boolean>(false);
  const [scheduleClassOpen, setScheduleClassOpen] = useState<boolean>(false);
  const [inspectFacultyId, setInspectFacultyId] = useState<string | undefined>(undefined);
  const [inspectRoomId, setInspectRoomId] = useState<string | undefined>(undefined);

  // Toasts
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, type, title, message, onClose: removeToast }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Persistent Core Entities
  const [settings, setSettings] = useState<CollegeSettings>(() => CollegeStorage.loadSettings());
  const [branches, setBranches] = useState<Branch[]>(() => CollegeStorage.loadBranches());
  const [divisions, setDivisions] = useState<Division[]>(() => CollegeStorage.loadDivisions());
  const [batches, setBatches] = useState<StudentBatch[]>(() => CollegeStorage.loadBatches());
  const [faculty, setFaculty] = useState<Faculty[]>(() => CollegeStorage.loadFaculty());
  const [rooms, setRooms] = useState<Room[]>(() => CollegeStorage.loadRooms());
  const [subjects, setSubjects] = useState<Subject[]>(() => CollegeStorage.loadSubjects());
  const [versions, setVersions] = useState<ScheduleVersion[]>(() => CollegeStorage.loadVersions());
  const [activeVersionId, setActiveVersionId] = useState<string | null>(() => CollegeStorage.loadActiveVersionId());
  const [activities, setActivities] = useState<ActivityItem[]>(() => CollegeStorage.loadActivities());

  // Role-Specific Entities
  const [students, setStudents] = useState<Student[]>(() => CollegeStorage.loadStudents());
  const [substitutions, setSubstitutions] = useState<SubstitutionRequest[]>(() => CollegeStorage.loadSubstitutions());
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => CollegeStorage.loadAnnouncements());

  // Ensure Initial Master Timetable is generated and active
  useEffect(() => {
    if (versions.length === 0) {
      CollegeStorage.ensureInitialTimetable().then(initialVer => {
        setVersions([initialVer]);
        setActiveVersionId(initialVer.id);
        setActivities(CollegeStorage.loadActivities());
      });
    }
  }, [versions.length]);

  // Route protection & role boundary enforcement
  useEffect(() => {
    if (!role) return;

    // Student boundary: cannot open admin or teacher tabs
    if (role === 'student' && !currentTab.startsWith('student_')) {
      setCurrentTab('student_dashboard');
      addToast('info', 'Access Restricted', 'Redirected to your student dashboard.');
    }

    // Teacher boundary: cannot open admin tabs
    if (role === 'teacher' && currentTab.startsWith('admin_')) {
      setCurrentTab('teacher_dashboard');
      addToast('info', 'Access Restricted', 'Redirected to your faculty workspace.');
    }

    // When role changes, switch to default dashboard for that role if on an alien tab
    if (role === 'admin' && (currentTab.startsWith('teacher_') || currentTab.startsWith('student_'))) {
      setCurrentTab('admin_dashboard');
    }
  }, [role, currentTab]);

  // Compute required sessions
  const requiredSessions = useMemo(() => {
    return expandRequiredSessions(subjects, divisions, batches, rooms);
  }, [subjects, divisions, batches, rooms]);

  // Active Schedule Version
  const activeVersion = useMemo(() => {
    if (!activeVersionId) {
      return versions.find(v => v.isPublished) || versions[0] || null;
    }
    return versions.find(v => v.id === activeVersionId) || versions[0] || null;
  }, [versions, activeVersionId]);

  // Independent Conflict Diagnostics Validation
  const validation = useMemo<ValidationResult>(() => {
    if (!activeVersion) {
      return {
        isValid: false,
        canPublish: false,
        criticalCount: 0,
        warningCount: 0,
        issues: [],
        checkedAt: new Date().toISOString(),
      };
    }
    return runIndependentValidation(
      activeVersion.assignments,
      requiredSessions,
      faculty,
      rooms,
      divisions,
      subjects,
      settings
    );
  }, [activeVersion, requiredSessions, faculty, rooms, divisions, subjects, settings]);

  // Current logged in teacher or student model
  const currentFaculty = useMemo(() => {
    if (role !== 'teacher') return undefined;
    if (currentUser?.facultyId) {
      return faculty.find(f => f.id === currentUser.facultyId);
    }
    return faculty[0];
  }, [role, currentUser, faculty]);

  const currentStudent = useMemo(() => {
    if (role !== 'student') return undefined;
    if (currentUser?.studentId) {
      return students.find(s => s.id === currentUser.studentId);
    }
    return students[0];
  }, [role, currentUser, students]);

  // Entity update handlers
  const handleSaveFaculty = (newFaculty: Faculty[]) => {
    setFaculty(newFaculty);
    CollegeStorage.saveFaculty(newFaculty);
    CollegeStorage.logActivity('FACULTY_CHANGE', 'Faculty Directory Updated', `Total faculty: ${newFaculty.length}`);
    setActivities(CollegeStorage.loadActivities());
  };

  const handleUpdateSingleFaculty = (updated: Faculty) => {
    const newFacultyList = faculty.map(f => (f.id === updated.id ? updated : f));
    handleSaveFaculty(newFacultyList);
  };

  const handleSaveStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    CollegeStorage.saveStudents(newStudents);
    CollegeStorage.logActivity('STRUCTURE_CHANGE', 'Student Records Updated', `Total students: ${newStudents.length}`);
    setActivities(CollegeStorage.loadActivities());
  };

  const handleSaveSubjects = (newSubjects: Subject[]) => {
    setSubjects(newSubjects);
    CollegeStorage.saveSubjects(newSubjects);
    CollegeStorage.logActivity('STRUCTURE_CHANGE', 'Courses & Subjects Updated', `Total subjects: ${newSubjects.length}`);
    setActivities(CollegeStorage.loadActivities());
  };

  const handleSaveRooms = (newRooms: Room[]) => {
    setRooms(newRooms);
    CollegeStorage.saveRooms(newRooms);
    CollegeStorage.logActivity('ROOM_CHANGE', 'Campus Facilities Updated', `Total rooms: ${newRooms.length}`);
    setActivities(CollegeStorage.loadActivities());
  };

  const handleSaveSettings = (newSettings: CollegeSettings) => {
    setSettings(newSettings);
    CollegeStorage.saveSettings(newSettings);
    setActivities(CollegeStorage.loadActivities());
  };

  const handleSaveSubstitutions = (newSubstitutions: SubstitutionRequest[]) => {
    setSubstitutions(newSubstitutions);
    CollegeStorage.saveSubstitutions(newSubstitutions);
    CollegeStorage.logActivity('SUBSTITUTION', 'Substitution Log Updated', `Total requests: ${newSubstitutions.length}`);
    setActivities(CollegeStorage.loadActivities());
  };

  const handleSaveAnnouncements = (newAnnouncements: Announcement[]) => {
    setAnnouncements(newAnnouncements);
    CollegeStorage.saveAnnouncements(newAnnouncements);
  };

  // Timetable Versions & Changes
  const handleSaveVersion = (newVersion: ScheduleVersion) => {
    const updated = [newVersion, ...versions.filter(v => v.id !== newVersion.id)];
    setVersions(updated);
    setActiveVersionId(newVersion.id);
    CollegeStorage.saveVersions(updated);
    CollegeStorage.saveActiveVersionId(newVersion.id);
    CollegeStorage.logActivity(
      'GENERATE',
      `Schedule Generated: ${newVersion.title}`,
      `Created with ${newVersion.assignments.length} assignments (${newVersion.metrics.solverStatus}).`
    );
    setActivities(CollegeStorage.loadActivities());
  };

  const handlePublishVersion = (versionOrId: ScheduleVersion | string) => {
    const versionId = typeof versionOrId === 'string' ? versionOrId : versionOrId.id;
    const updated = versions.map(v => ({
      ...v,
      isPublished: v.id === versionId,
      status: (v.id === versionId ? 'Published' : 'Archived') as ScheduleVersion['status'],
      publishedAt: v.id === versionId ? new Date().toISOString() : v.publishedAt,
    }));
    setVersions(updated);
    setActiveVersionId(versionId);
    CollegeStorage.saveVersions(updated);
    CollegeStorage.saveActiveVersionId(versionId);
    CollegeStorage.logActivity(
      'PUBLISH',
      'Timetable Published to Campus',
      `Schedule version ${versionId} is now visible to all students and teachers.`
    );
    setActivities(CollegeStorage.loadActivities());
    addToast('success', 'Timetable Published', 'All students and faculty now see this active timetable.');
  };

  const handleApproveRepair = (repairedVersion: ScheduleVersion) => {
    handleSaveVersion(repairedVersion);
    handlePublishVersion(repairedVersion.id);
    addToast('success', 'Emergency Reschedule Applied', 'Timetable substitutions and room reassignments are live.');
  };

  const handleUpdateAssignments = (newAssignments: ScheduleAssignment[]) => {
    if (!activeVersion) return;
    const updatedVersion: ScheduleVersion = {
      ...activeVersion,
      assignments: newAssignments,
    };
    handleSaveVersion(updatedVersion);
  };

  const handleScheduleClassConfirmed = (
    newAssignment: ScheduleAssignment,
    newAnnouncement: Announcement
  ) => {
    if (!activeVersion) return;
    const updatedAssignments = [newAssignment, ...activeVersion.assignments];
    const updatedVersion: ScheduleVersion = {
      ...activeVersion,
      assignments: updatedAssignments,
    };
    handleSaveVersion(updatedVersion);

    // Save announcement and alert students
    const updatedAnnouncements = [newAnnouncement, ...announcements];
    handleSaveAnnouncements(updatedAnnouncements);

    addToast(
      'success',
      'Class Scheduled & Announced',
      `Session booked for ${newAssignment.divisionName} on ${newAssignment.day}. Students notified!`
    );
  };

  const handleResetDemoData = () => {
    CollegeStorage.resetToDemoData();
    setSettings(CollegeStorage.loadSettings());
    setBranches(CollegeStorage.loadBranches());
    setDivisions(CollegeStorage.loadDivisions());
    setBatches(CollegeStorage.loadBatches());
    setFaculty(CollegeStorage.loadFaculty());
    setRooms(CollegeStorage.loadRooms());
    setSubjects(CollegeStorage.loadSubjects());
    setStudents(CollegeStorage.loadStudents());
    setSubstitutions(CollegeStorage.loadSubstitutions());
    setAnnouncements(CollegeStorage.loadAnnouncements());
    setVersions([]);
    setActiveVersionId(null);
    CollegeStorage.ensureInitialTimetable().then(initialVer => {
      setVersions([initialVer]);
      setActiveVersionId(initialVer.id);
      setActivities(CollegeStorage.loadActivities());
    });
    addToast('info', 'System Reset', 'Restored default college configuration, teachers, and timetable.');
  };

  // Cross-view quick navigation
  const handleViewFacultyTimetable = (fId: string) => {
    setInspectFacultyId(fId);
    setInspectRoomId(undefined);
    setCurrentTab('timetable');
  };

  const handleViewRoomTimetable = (rId: string) => {
    setInspectRoomId(rId);
    setInspectFacultyId(undefined);
    setCurrentTab('timetable');
  };

  // PDF Preview Data helper
  const pdfPreviewAssignments = useMemo(() => {
    if (!activeVersion) return [];
    if (role === 'teacher' && currentFaculty) {
      return activeVersion.assignments.filter(a => a.facultyId === currentFaculty.id);
    }
    if (role === 'student' && currentStudent) {
      return activeVersion.assignments.filter(
        a => a.divisionId === currentStudent.divisionId && (!a.batchName || a.batchName === currentStudent.batchName)
      );
    }
    return activeVersion.assignments;
  }, [activeVersion, role, currentFaculty, currentStudent]);

  const pdfPreviewTitle = useMemo(() => {
    if (role === 'teacher' && currentFaculty) {
      return `Faculty Timetable - ${currentFaculty.name}`;
    }
    if (role === 'student' && currentStudent) {
      const div = divisions.find(d => d.id === currentStudent.divisionId);
      return `Class Timetable - ${div?.academicYear || 'FY'} ${div?.name || 'Div A'}`;
    }
    return 'Institutional Master Academic Timetable';
  }, [role, currentFaculty, currentStudent, divisions]);

  // If not logged in, render the login view
  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="flex h-screen bg-[#F6F1E8] text-[#22252A] overflow-hidden font-sans transition-colors">
      {/* Role-Aware Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={tab => {
          if (tab === 'teacher_schedule_class') {
            setScheduleClassOpen(true);
            return;
          }
          setInspectFacultyId(undefined);
          setInspectRoomId(undefined);
          setCurrentTab(tab);
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={sidebarMobileOpen}
        onCloseMobile={() => setSidebarMobileOpen(false)}
        diagnosticCount={validation.criticalCount}
        pendingSubstitutionsCount={substitutions.filter(s => s.status === 'PENDING').length}
        onOpenScheduleClass={() => setScheduleClassOpen(true)}
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar with User info & Role Badge */}
        <Navbar
          onToggleSidebarMobile={() => setSidebarMobileOpen(true)}
          onOpenBackendDocs={() => setBackendDocsOpen(true)}
          unreadAnnouncementsCount={announcements.length}
          onNavigateAnnouncements={() => {
            if (role === 'admin') setCurrentTab('admin_announcements');
            else if (role === 'teacher') setCurrentTab('teacher_announcements');
            else setCurrentTab('student_announcements');
          }}
          onOpenScheduleClass={() => setScheduleClassOpen(true)}
        />

        {/* Tab Content Canvas */}
        <main className="flex-1 overflow-y-auto">
          {/* ================= ADMIN TABS ================= */}
          {currentTab === 'admin_dashboard' && hasRole(['admin']) && (
            <AdminDashboard
              branches={branches}
              divisions={divisions}
              faculty={faculty}
              rooms={rooms}
              subjects={subjects}
              students={students}
              activeVersion={activeVersion}
              validation={validation}
              activities={activities}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'admin_teachers' && hasRole(['admin']) && (
            <TeacherManagement
              faculty={faculty}
              subjects={subjects}
              branches={branches}
              assignments={activeVersion?.assignments || []}
              onSaveFaculty={handleSaveFaculty}
              onViewTeacherTimetable={handleViewFacultyTimetable}
              onShowToast={addToast}
            />
          )}

          {currentTab === 'admin_students' && hasRole(['admin']) && (
            <StudentManagement
              students={students}
              divisions={divisions}
              batches={batches}
              branches={branches}
              onSaveStudents={handleSaveStudents}
              onShowToast={addToast}
            />
          )}

          {currentTab === 'admin_courses' && hasRole(['admin']) && (
            <CourseManagement
              subjects={subjects}
              branches={branches}
              divisions={divisions}
              faculty={faculty}
              rooms={rooms}
              onSaveSubjects={handleSaveSubjects}
              onShowToast={addToast}
            />
          )}

          {currentTab === 'admin_generator' && hasRole(['admin']) && (
            <TimetableGeneratorView
              settings={settings}
              branches={branches}
              divisions={divisions}
              faculty={faculty}
              rooms={rooms}
              subjects={subjects}
              requiredSessions={requiredSessions}
              activeVersion={activeVersion}
              onSaveVersion={handleSaveVersion}
              onPublishVersion={handlePublishVersion}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'admin_repair' && hasRole(['admin']) && (
            <EmergencyRepairView
              publishedVersion={activeVersion}
              faculty={faculty}
              rooms={rooms}
              divisions={divisions}
              subjects={subjects}
              settings={settings}
              onApproveRepair={handleApproveRepair}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'admin_diagnostics' && hasRole(['admin']) && (
            <ConflictDiagnosticsView
              validation={validation}
              version={activeVersion}
              onRevalidate={() => {
                setActivities(CollegeStorage.loadActivities());
                addToast('info', 'Constraints Re-audited', 'Invariants validated against current schedule.');
              }}
              onNavigate={setCurrentTab}
              onSelectFaculty={handleViewFacultyTimetable}
              onSelectRoom={handleViewRoomTimetable}
            />
          )}

          {currentTab === 'admin_rooms' && hasRole(['admin']) && (
            <RoomManagementView
              rooms={rooms}
              assignments={activeVersion?.assignments || []}
              onSaveRooms={handleSaveRooms}
              onViewRoomTimetable={handleViewRoomTimetable}
            />
          )}

          {currentTab === 'admin_availability' && hasRole(['admin']) && (
            <AvailabilityMatrixView
              faculty={faculty}
              rooms={rooms}
              settings={settings}
              onSaveFaculty={handleSaveFaculty}
              onSaveRooms={handleSaveRooms}
            />
          )}

          {currentTab === 'admin_reports' && hasRole(['admin']) && (
            <ReportsAnalyticsView
              versions={versions}
              activeVersion={activeVersion}
              faculty={faculty}
              rooms={rooms}
              branches={branches}
              divisions={divisions}
              settings={settings}
              onSelectVersion={ver => {
                setActiveVersionId(ver.id);
                CollegeStorage.saveActiveVersionId(ver.id);
                setCurrentTab('timetable');
              }}
            />
          )}

          {currentTab === 'admin_announcements' && hasRole(['admin']) && (
            <AdminAnnouncements
              announcements={announcements}
              divisions={divisions}
              onSaveAnnouncements={handleSaveAnnouncements}
              onShowToast={addToast}
            />
          )}

          {currentTab === 'admin_settings' && hasRole(['admin']) && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onResetDemoData={handleResetDemoData}
              onOpenBackendDocs={() => setBackendDocsOpen(true)}
              onShowToast={addToast}
            />
          )}

          {/* ================= TEACHER TABS ================= */}
          {currentTab === 'teacher_dashboard' && hasRole(['teacher']) && currentFaculty && (
            <TeacherDashboard
              currentFaculty={currentFaculty}
              activeVersion={activeVersion}
              settings={settings}
              divisions={divisions}
              rooms={rooms}
              subjects={subjects}
              substitutions={substitutions}
              onNavigate={setCurrentTab}
              onOpenPdfPreview={() => setPdfPreviewOpen(true)}
              onOpenScheduleClass={() => setScheduleClassOpen(true)}
            />
          )}

          {currentTab === 'teacher_timetable' && hasRole(['teacher']) && (
            <TimetableView
              version={activeVersion}
              branches={branches}
              divisions={divisions}
              faculty={faculty}
              rooms={rooms}
              subjects={subjects}
              settings={settings}
              initialFacultyId={currentFaculty?.id}
              onUpdateAssignments={handleUpdateAssignments}
              onShowToast={addToast}
            />
          )}

          {currentTab === 'teacher_substitutions' && hasRole(['teacher']) && currentFaculty && (
            <TeacherSubstitutionView
              currentFaculty={currentFaculty}
              allFaculty={faculty}
              activeVersion={activeVersion}
              settings={settings}
              divisions={divisions}
              substitutions={substitutions}
              onSaveSubstitutions={handleSaveSubstitutions}
              onAddToast={addToast}
            />
          )}

          {currentTab === 'teacher_availability' && hasRole(['teacher']) && currentFaculty && (
            <TeacherAvailabilityView
              currentFaculty={currentFaculty}
              settings={settings}
              activeVersion={activeVersion}
              onUpdateFaculty={handleUpdateSingleFaculty}
              onAddToast={addToast}
            />
          )}

          {currentTab === 'teacher_announcements' && hasRole(['teacher']) && (
            <TeacherAnnouncementsView
              currentFaculty={currentFaculty}
              announcements={announcements}
              divisions={divisions}
              onSaveAnnouncements={handleSaveAnnouncements}
              onShowToast={addToast}
            />
          )}

          {/* ================= STUDENT TABS ================= */}
          {currentTab === 'student_dashboard' && hasRole(['student']) && currentStudent && (
            <StudentDashboard
              currentStudent={currentStudent}
              activeVersion={activeVersion}
              settings={settings}
              divisions={divisions}
              rooms={rooms}
              subjects={subjects}
              faculty={faculty}
              announcements={announcements}
              onNavigate={setCurrentTab}
              onOpenPdfPreview={() => setPdfPreviewOpen(true)}
            />
          )}

          {currentTab === 'student_timetable' && hasRole(['student']) && currentStudent && (
            <StudentTimetableView
              currentStudent={currentStudent}
              activeVersion={activeVersion}
              settings={settings}
              divisions={divisions}
              rooms={rooms}
              subjects={subjects}
              faculty={faculty}
              onOpenPdfPreview={() => setPdfPreviewOpen(true)}
            />
          )}

          {currentTab === 'student_freerooms' && hasRole(['student']) && (
            <StudentFreeRoomsView
              rooms={rooms}
              activeVersion={activeVersion}
              settings={settings}
            />
          )}

          {currentTab === 'student_faculty' && hasRole(['student']) && currentStudent && (
            <StudentFacultyDirectoryView
              currentStudent={currentStudent}
              allFaculty={faculty}
              subjects={subjects}
              activeVersion={activeVersion}
              settings={settings}
              divisions={divisions}
            />
          )}

          {currentTab === 'student_announcements' && hasRole(['student']) && (
            <StudentAnnouncementsView
              currentStudent={currentStudent}
              announcements={announcements}
              divisions={divisions}
            />
          )}

          {/* ================= SHARED TIMETABLE TAB ================= */}
          {currentTab === 'timetable' && (
            <TimetableView
              version={activeVersion}
              branches={branches}
              divisions={divisions}
              faculty={faculty}
              rooms={rooms}
              subjects={subjects}
              settings={settings}
              initialFacultyId={inspectFacultyId}
              onUpdateAssignments={handleUpdateAssignments}
              onShowToast={addToast}
            />
          )}
        </main>
      </div>

      {/* Backend Specs Modal */}
      <BackendIntegrationModal
        isOpen={backendDocsOpen}
        onClose={() => setBackendDocsOpen(false)}
      />

      {/* Universal PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={pdfPreviewOpen}
        onClose={() => setPdfPreviewOpen(false)}
        title={pdfPreviewTitle}
        subtitle={`${settings.collegeName} · ${settings.academicTerm}`}
        assignments={pdfPreviewAssignments}
        settings={settings}
        subjects={subjects}
      />

      {/* Faculty "Schedule a Class" Modal */}
      {currentFaculty && (
        <ScheduleClassModal
          isOpen={scheduleClassOpen}
          onClose={() => setScheduleClassOpen(false)}
          currentFaculty={currentFaculty}
          activeVersion={activeVersion}
          divisions={divisions}
          subjects={subjects}
          rooms={rooms}
          settings={settings}
          onScheduleConfirmed={handleScheduleClassConfirmed}
        />
      )}

      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
