export type SessionType = 'theory' | 'practical' | 'tutorial';
export type RoomType = 'classroom' | 'lab' | 'seminar_hall';
export type SolverStatus = 'OPTIMAL' | 'FEASIBLE' | 'INFEASIBLE' | 'TIMEOUT' | 'PARTIAL' | 'UNKNOWN';

export interface SlotCoord {
  day: string;
  slot_index: number;
}

export interface TimeSlot {
  slot_index: number;
  label: string;
  start_time: string;
  end_time: string;
  is_break: boolean;
  break_name?: string | null;
}

export interface Division {
  id: string;
  name: string;
  student_strength: number;
  department: string;
  blocked_slots: SlotCoord[];
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  department: string;
  preferred_room_types: RoomType[];
}

export interface SessionRequirement {
  id: string;
  subject_id: string;
  division_id: string;
  session_type: SessionType;
  weekly_count: number;
  duration_slots: number;
  preferred_faculty_ids: string[];
  requires_lab: boolean;
  required_equipment: string[];
}

export interface Faculty {
  id: string;
  name: string;
  email?: string | null;
  department: string;
  qualified_subject_ids: string[];
  qualified_session_types: SessionType[];
  max_daily_sessions: number;
  max_weekly_sessions: number;
  max_consecutive_sessions: number;
  unavailable_slots: SlotCoord[];
  preferred_slots: SlotCoord[];
}

export interface Room {
  id: string;
  name: string;
  room_type: RoomType;
  capacity: number;
  equipment: string[];
  unavailable_slots: SlotCoord[];
}

export interface SolverWeights {
  gap_weight: number;
  workload_balance_weight: number;
  subject_spread_weight: number;
  consecutive_penalty_weight: number;
  preference_weight: number;
  room_efficiency_weight: number;
}

export interface TimetableConfig {
  academic_year: string;
  semester: string;
  department: string;
  working_days: string[];
  time_slots: TimeSlot[];
  divisions: Division[];
  subjects: Subject[];
  requirements: SessionRequirement[];
  faculty: Faculty[];
  rooms: Room[];
  solver_time_limit: number;
  allow_partial: boolean;
  weights: SolverWeights;
}

export interface ScheduledSession {
  session_id: string;
  requirement_id: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  division_id: string;
  division_name: string;
  faculty_id: string;
  faculty_name: string;
  room_id: string;
  room_name: string;
  session_type: SessionType;
  day: string;
  start_slot_index: number;
  duration_slots: number;
  slots: number[];
  start_time: string;
  end_time: string;
}

export interface UnassignedSession {
  requirement_id: string;
  occurrence_index: number;
  subject_id: string;
  subject_name: string;
  division_id: string;
  division_name: string;
  session_type: SessionType;
  duration_slots: number;
  primary_reasons: string[];
  heuristic_notes: string[];
  actionable_suggestions: string[];
}

export interface ConstraintViolation {
  rule_id: string;
  category: string;
  message: string;
  severity: string;
  affected_entities: Record<string, any>;
}

export interface ValidationReport {
  is_valid: boolean;
  status_summary: string;
  hard_violations_count: number;
  warning_count: number;
  violations: ConstraintViolation[];
  total_required_sessions: number;
  total_assigned_sessions: number;
  unassigned_count: number;
  checked_rules: string[];
}

export interface DiagnosticReport {
  overall_assessment: string;
  has_unassigned: boolean;
  bottlenecks_detected: string[];
  detailed_unassigned: UnassignedSession[];
  resource_utilization: Record<string, any>;
  recommendations: string[];
}

export interface TimetableResult {
  status: SolverStatus;
  execution_time_seconds: number;
  total_required_sessions: number;
  scheduled_sessions_count: number;
  unassigned_sessions_count: number;
  sessions: ScheduledSession[];
  unassigned_sessions: UnassignedSession[];
  validation?: ValidationReport | null;
  diagnostics?: DiagnosticReport | null;
  generated_at?: string | null;
}
