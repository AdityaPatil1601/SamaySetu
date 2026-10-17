import {
  Branch,
  Division,
  StudentBatch,
  Faculty,
  Room,
  Subject,
  CollegeSettings,
  ScheduleVersion,
  Student,
  Announcement,
  SubstitutionRequest,
  User,
} from '../../types';
import {
  INITIAL_SETTINGS,
  INITIAL_BRANCHES,
  INITIAL_DIVISIONS,
  INITIAL_BATCHES,
  INITIAL_ROOMS,
  INITIAL_FACULTY,
  INITIAL_SUBJECTS,
  INITIAL_STUDENTS,
  INITIAL_SUBSTITUTIONS,
  INITIAL_ANNOUNCEMENTS,
  DEMO_USERS,
  generateFullMasterSchedule,
} from '../../data/seedData';
import { ConstraintSolver } from '../solver/constraintEngine';

export interface ActivityItem {
  id: string;
  timestamp: string;
  type: 'GENERATE' | 'REPAIR' | 'PUBLISH' | 'STRUCTURE_CHANGE' | 'FACULTY_CHANGE' | 'ROOM_CHANGE' | 'SUBSTITUTION';
  title: string;
  description: string;
}

const STORAGE_KEYS = {
  SETTINGS: 'samaysetu_settings_v4',
  BRANCHES: 'samaysetu_branches_v4',
  DIVISIONS: 'samaysetu_divisions_v4',
  BATCHES: 'samaysetu_batches_v4',
  ROOMS: 'samaysetu_rooms_v4',
  FACULTY: 'samaysetu_faculty_v4',
  SUBJECTS: 'samaysetu_subjects_v4',
  VERSIONS: 'samaysetu_versions_v4',
  ACTIVE_VER: 'samaysetu_active_ver_v4',
  ACTIVITIES: 'samaysetu_activities_v4',
  STUDENTS: 'samaysetu_students_v4',
  SUBSTITUTIONS: 'samaysetu_substitutions_v4',
  ANNOUNCEMENTS: 'samaysetu_announcements_v4',
  CURRENT_USER: 'samaysetu_current_user_v4',
};

export class CollegeStorage {
  private static get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch (e) {
      console.warn(`Failed reading key ${key} from localStorage:`, e);
      return defaultValue;
    }
  }

  private static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Failed writing key ${key} to localStorage:`, e);
    }
  }

  // Settings
  public static loadSettings(): CollegeSettings {
    return this.get(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }
  public static saveSettings(settings: CollegeSettings): void {
    this.set(STORAGE_KEYS.SETTINGS, settings);
  }

  // Branches
  public static loadBranches(): Branch[] {
    return this.get(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES);
  }
  public static saveBranches(branches: Branch[]): void {
    this.set(STORAGE_KEYS.BRANCHES, branches);
  }

  // Divisions
  public static loadDivisions(): Division[] {
    return this.get(STORAGE_KEYS.DIVISIONS, INITIAL_DIVISIONS);
  }
  public static saveDivisions(divisions: Division[]): void {
    this.set(STORAGE_KEYS.DIVISIONS, divisions);
  }

  // Batches
  public static loadBatches(): StudentBatch[] {
    return this.get(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
  }
  public static saveBatches(batches: StudentBatch[]): void {
    this.set(STORAGE_KEYS.BATCHES, batches);
  }

  // Rooms
  public static loadRooms(): Room[] {
    return this.get(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
  }
  public static saveRooms(rooms: Room[]): void {
    this.set(STORAGE_KEYS.ROOMS, rooms);
  }

  // Faculty
  public static loadFaculty(): Faculty[] {
    return this.get(STORAGE_KEYS.FACULTY, INITIAL_FACULTY);
  }
  public static saveFaculty(faculty: Faculty[]): void {
    this.set(STORAGE_KEYS.FACULTY, faculty);
  }

  // Subjects
  public static loadSubjects(): Subject[] {
    return this.get(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  }
  public static saveSubjects(subjects: Subject[]): void {
    this.set(STORAGE_KEYS.SUBJECTS, subjects);
  }

  // Versions
  public static loadVersions(): ScheduleVersion[] {
    return this.get(STORAGE_KEYS.VERSIONS, []);
  }
  public static saveVersions(versions: ScheduleVersion[]): void {
    this.set(STORAGE_KEYS.VERSIONS, versions);
  }

  public static loadActiveVersionId(): string | null {
    return this.get(STORAGE_KEYS.ACTIVE_VER, null);
  }
  public static saveActiveVersionId(id: string | null): void {
    this.set(STORAGE_KEYS.ACTIVE_VER, id);
  }

  // Students
  public static loadStudents(): Student[] {
    return this.get(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  }
  public static saveStudents(students: Student[]): void {
    this.set(STORAGE_KEYS.STUDENTS, students);
  }

  // Substitutions
  public static loadSubstitutions(): SubstitutionRequest[] {
    return this.get(STORAGE_KEYS.SUBSTITUTIONS, INITIAL_SUBSTITUTIONS);
  }
  public static saveSubstitutions(substitutions: SubstitutionRequest[]): void {
    this.set(STORAGE_KEYS.SUBSTITUTIONS, substitutions);
  }

  // Announcements
  public static loadAnnouncements(): Announcement[] {
    return this.get(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  }
  public static saveAnnouncements(announcements: Announcement[]): void {
    this.set(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
  }

  // Active User
  public static loadCurrentUser(): User | null {
    return this.get(STORAGE_KEYS.CURRENT_USER, DEMO_USERS[0]);
  }
  public static saveCurrentUser(user: User | null): void {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
  }

  // Activities
  public static loadActivities(): ActivityItem[] {
    return this.get(STORAGE_KEYS.ACTIVITIES, [
      {
        id: 'act-init-1',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        type: 'STRUCTURE_CHANGE',
        title: 'Master Academic Structure Loaded',
        description: 'Configured CMPN, IT, EXTC, and MECH departments with 16 faculty profiles and full curricula.',
      },
      {
        id: 'act-init-2',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        type: 'PUBLISH',
        title: 'Academic Timetable Active',
        description: 'Full coordinated schedule across all classes and lab practicals synchronized.',
      },
      {
        id: 'act-init-3',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        type: 'SUBSTITUTION',
        title: 'Substitution Request Registered',
        description: 'Prof. Ramesh Sharma requested Wednesday coverage from Dr. Ananya Bose.',
      },
    ]);
  }

  public static logActivity(type: ActivityItem['type'], title: string, description: string): void {
    const list = this.loadActivities();
    const item: ActivityItem = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      title,
      description,
    };
    this.set(STORAGE_KEYS.ACTIVITIES, [item, ...list].slice(0, 35));
  }

  // Reset to Demo Data
  public static resetToDemoData(): void {
    this.set(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    this.set(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES);
    this.set(STORAGE_KEYS.DIVISIONS, INITIAL_DIVISIONS);
    this.set(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
    this.set(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    this.set(STORAGE_KEYS.FACULTY, INITIAL_FACULTY);
    this.set(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    this.set(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    this.set(STORAGE_KEYS.SUBSTITUTIONS, INITIAL_SUBSTITUTIONS);
    this.set(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    this.set(STORAGE_KEYS.VERSIONS, []);
    this.set(STORAGE_KEYS.ACTIVE_VER, null);
    this.logActivity('STRUCTURE_CHANGE', 'System Reset to Demo State', 'All college master configuration and roles restored to pristine state.');
  }

  // Initial Solved & Published Timetable with Full Data
  public static async ensureInitialTimetable(): Promise<ScheduleVersion> {
    const versions = this.loadVersions();
    const published = versions.find(v => v.isPublished && v.assignments && v.assignments.length >= 35);
    if (published) return published;

    const fullAssignments = generateFullMasterSchedule();
    const initialVersion: ScheduleVersion = {
      id: 'ver-master-published-v4',
      versionNumber: 1,
      title: 'Published Master Academic Timetable 2026-27',
      isPublished: true,
      status: 'Published',
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      assignments: fullAssignments,
      metrics: {
        totalRequiredSessions: fullAssignments.length,
        scheduledSessions: fullAssignments.length,
        unassignedSessions: 0,
        hardConstraintViolations: 0,
        softScore: 98.4,
        executionTimeMs: 420,
        solverStatus: 'OPTIMAL',
        engineUsed: 'Deterministic CSP Engine',
      },
      changes: [],
      unassignedSessions: [],
    };

    this.saveVersions([initialVersion]);
    this.saveActiveVersionId(initialVersion.id);
    this.logActivity(
      'PUBLISH',
      'Master Timetable Published (v4.0)',
      `Coordinated ${fullAssignments.length} sessions across all 4 departments and 16 faculty.`
    );
    return initialVersion;
  }
}
