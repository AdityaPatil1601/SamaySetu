export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  facultyId?: string; // Links to Faculty record if teacher
  studentId?: string; // Links to Student record if student
  divisionId?: string; // For student
  branchId?: string;
  academicYear?: AcademicYear;
  rollNumber?: string;
}

export type AcademicYear = 'FY' | 'SY' | 'TY' | 'BY';

export type RoomType =
  | 'Classroom'
  | 'Computer Lab'
  | 'Electronics Lab'
  | 'Mechanical Lab'
  | 'Civil Lab'
  | 'Seminar Hall';

export type SessionType = 'Theory' | 'Practical';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface Branch {
  id: string;
  code: string;
  name: string;
  department: string;
  active: boolean;
}

export interface Division {
  id: string;
  branchId: string;
  academicYear: AcademicYear;
  name: string; // e.g. "Div A"
  studentCount: number;
  active: boolean;
}

export interface StudentBatch {
  id: string;
  divisionId: string;
  name: string; // e.g. "A1", "A2"
  studentCount: number;
}

export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  divisionId: string;
  batchId?: string; // e.g. "A1", "A2"
  batchName?: string;
  branchId: string;
  academicYear: AcademicYear;
  phone: string;
  avatarSeed?: string;
}

export interface FacultyAssignmentEligibility {
  branchId: string;
  academicYear: AcademicYear;
  divisionId?: string;
}

export interface Faculty {
  id: string;
  employeeId: string;
  name: string;
  email?: string;
  department: string;
  qualifiedSubjectCodes: string[];
  eligibleAssignments: FacultyAssignmentEligibility[];
  maxWeeklyHours: number;
  availableDays: DayOfWeek[];
  unavailableSlots: { day: DayOfWeek; slotIndex: number }[];
  preferredSlots: { day: DayOfWeek; slotIndex: number }[];
  active: boolean;
  cabin?: string;
  phone?: string;
  avatarSeed?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  branchId: string;
  academicYear: AcademicYear;
  divisionIds: string[]; // Can apply to multiple divisions
  theorySessionsPerWeek: number; // e.g. 3 lectures/wk
  practicalSessionsPerWeek: number; // e.g. 2 practicals/wk
  practicalSlotDuration: number; // e.g. 2 slots (2 hours consecutive)
  eligibleFacultyIds: string[];
  permittedRoomIds: string[];
  requiredRoomType: RoomType;
  hasBatches: boolean; // if true, practicals are split by batch (A1, A2, etc.)
  isShared: boolean; // if true, shared lecture across multiple divisions
  sharedDivisionIds?: string[];
  color?: string; // soft color tag for timetable display
}

export interface Room {
  id: string;
  roomNumber: string;
  name: string;
  type: RoomType;
  capacity: number;
  equipment: string[];
  permittedSessionTypes: SessionType[];
  unavailableSlots: { day: DayOfWeek; slotIndex: number }[];
  active: boolean;
}

export interface TimeSlotConfig {
  slotIndex: number;
  startTime: string; // "09:00"
  endTime: string;   // "10:00"
  label: string;     // "09:00 - 10:00"
  isBreak?: boolean;
  breakLabel?: string;
}

export interface CollegeSettings {
  collegeName: string;
  academicTerm: string; // "Odd Semester 2026-27"
  workingDays: DayOfWeek[];
  operatingStartTime: string; // "09:00"
  operatingEndTime: string;   // "17:00"
  lectureDurationMinutes: number; // 60
  practicalDurationMinutes: number; // 120
  slots: TimeSlotConfig[];
  lunchBreakSlotIndex: number; // slot after which lunch occurs
  teaBreakSlotIndex?: number;  // slot after which tea break occurs
}

export interface RequiredSession {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  sessionType: SessionType;
  branchId: string;
  academicYear: AcademicYear;
  divisionId: string;
  batchId?: string; // e.g. "A1"
  batchName?: string;
  participatingDivisionIds: string[];
  durationSlots: number; // 1 for theory, 2 for practical
  eligibleFacultyIds: string[];
  permittedRoomIds: string[];
  requiredRoomType: RoomType;
  minCapacity: number;
}

export interface ScheduleAssignment {
  id: string;
  requiredSessionId: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  sessionType: SessionType;
  branchId: string;
  academicYear: AcademicYear;
  divisionId: string;
  divisionName: string;
  batchId?: string;
  batchName?: string;
  participatingDivisionIds: string[];
  facultyId: string;
  facultyName: string;
  roomId: string;
  roomNumber: string;
  roomName: string;
  day: DayOfWeek;
  startSlotIndex: number;
  durationSlots: number; // e.g., 2 slots for 2-hour practical
  timeRange: string; // e.g. "10:00 - 12:00"
}

export interface ScheduleMetrics {
  totalRequiredSessions: number;
  scheduledSessions: number;
  unassignedSessions: number;
  hardConstraintViolations: number;
  softScore: number;
  executionTimeMs: number;
  solverStatus: 'OPTIMAL' | 'FEASIBLE' | 'PARTIAL' | 'INFEASIBLE' | 'TIMEOUT' | 'NOT_RUN';
  engineUsed: 'OR-Tools CP-SAT (Native Core)' | 'Deterministic CSP Engine';
}

export interface ScheduleChange {
  id: string;
  timestamp: string;
  sessionId: string;
  subjectName: string;
  divisionName: string;
  originalAssignment?: {
    day: DayOfWeek;
    timeRange: string;
    roomNumber: string;
    facultyName: string;
  };
  newAssignment?: {
    day: DayOfWeek;
    timeRange: string;
    roomNumber: string;
    facultyName: string;
  };
  reason: string;
  approved: boolean;
}

export interface ScheduleVersion {
  id: string;
  versionNumber: number;
  title: string;
  createdAt: string;
  isPublished: boolean;
  publishedAt?: string;
  status: 'Published' | 'Draft' | 'Proposed Repair' | 'Archived';
  assignments: ScheduleAssignment[];
  metrics: ScheduleMetrics;
  changes: ScheduleChange[];
  unassignedSessions: RequiredSession[];
}

export type DiagnosticSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export type DiagnosticCategory =
  | 'FACULTY_DOUBLE_BOOKING'
  | 'ROOM_DOUBLE_BOOKING'
  | 'DIVISION_DOUBLE_BOOKING'
  | 'FACULTY_UNAVAILABLE'
  | 'ROOM_UNAVAILABLE'
  | 'CAPACITY_EXCEEDED'
  | 'LAB_INCOMPATIBLE'
  | 'FACULTY_INELIGIBLE'
  | 'UNASSIGNED_SESSION'
  | 'FACULTY_OVERWORKED'
  | 'MULTI_SLOT_SPLIT';

export interface ValidationIssue {
  id: string;
  severity: DiagnosticSeverity;
  category: DiagnosticCategory;
  title: string;
  explanation: string;
  suggestedAction: string;
  affectedSessionIds: string[];
  affectedFacultyId?: string;
  affectedFacultyName?: string;
  affectedRoomId?: string;
  affectedRoomNumber?: string;
  affectedDivisionId?: string;
  affectedDivisionName?: string;
  day?: DayOfWeek;
  slotLabel?: string;
}

export interface ValidationResult {
  isValid: boolean;
  canPublish: boolean;
  criticalCount: number;
  warningCount: number;
  issues: ValidationIssue[];
  checkedAt: string;
}

export interface EmergencyRepairRequest {
  targetFacultyId?: string;
  targetRoomId?: string;
  affectedDay: DayOfWeek;
  startSlotIndex: number;
  endSlotIndex: number;
  reason: string;
  allowFacultySubstitution: boolean;
}

export interface EmergencyRepairResult {
  success: boolean;
  proposedVersion: ScheduleVersion;
  changes: ScheduleChange[];
  affectedCount: number;
  rescheduledCount: number;
  unresolvedCount: number;
  explanation: string;
}

// Timetable Substitution & Leave Cover Requests
export interface SubstitutionRequest {
  id: string;
  requestingFacultyId: string;
  requestingFacultyName: string;
  targetFacultyId?: string;
  targetFacultyName?: string;
  assignmentId: string;
  subjectCode: string;
  subjectName: string;
  divisionId: string;
  divisionName: string;
  batchName?: string;
  roomNumber: string;
  day: DayOfWeek;
  slotIndex: number;
  timeRange: string;
  date: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'RESOLVED';
  reason: string;
  createdAt: string;
  notes?: string;
}

// Announcements Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: UserRole;
  targetAudience: 'all' | 'teachers' | 'students' | 'class';
  divisionId?: string;
  createdAt: string;
  priority: 'normal' | 'important' | 'urgent';
}

// Timetable View Types
export type TimetableViewMode = 'class' | 'teacher' | 'department';

export interface ImportConflictIssue {
  row: number;
  day: string;
  timeRange: string;
  issueType: 'TEACHER_DOUBLE_BOOKING' | 'ROOM_CLASH' | 'CLASS_OVERLAP' | 'INVALID_DATA';
  details: string;
  recommendation: string;
}
