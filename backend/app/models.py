from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class SessionType(str, Enum):
    THEORY = "theory"
    PRACTICAL = "practical"
    TUTORIAL = "tutorial"


class RoomType(str, Enum):
    CLASSROOM = "classroom"
    LAB = "lab"
    SEMINAR_HALL = "seminar_hall"


class SolverStatus(str, Enum):
    OPTIMAL = "OPTIMAL"
    FEASIBLE = "FEASIBLE"
    INFEASIBLE = "INFEASIBLE"
    TIMEOUT = "TIMEOUT"
    PARTIAL = "PARTIAL"
    UNKNOWN = "UNKNOWN"


class SlotCoord(BaseModel):
    day: str
    slot_index: int


class TimeSlot(BaseModel):
    slot_index: int
    label: str  # e.g., "09:00 - 10:00"
    start_time: str  # "09:00"
    end_time: str  # "10:00"
    is_break: bool = False
    break_name: Optional[str] = None


class Division(BaseModel):
    id: str
    name: str
    student_strength: int
    department: str
    blocked_slots: List[SlotCoord] = Field(default_factory=list)


class Subject(BaseModel):
    id: str
    code: str
    name: str
    department: str
    preferred_room_types: List[RoomType] = Field(default_factory=lambda: [RoomType.CLASSROOM])


class SessionRequirement(BaseModel):
    id: str
    subject_id: str
    division_id: str
    session_type: SessionType
    weekly_count: int  # Number of weekly occurrences
    duration_slots: int = 1  # 1 for lecture/tutorial, 2 for practical/lab
    preferred_faculty_ids: List[str] = Field(default_factory=list)
    requires_lab: bool = False
    required_equipment: List[str] = Field(default_factory=list)


class Faculty(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    department: str
    qualified_subject_ids: List[str] = Field(default_factory=list)
    qualified_session_types: List[SessionType] = Field(
        default_factory=lambda: [SessionType.THEORY, SessionType.PRACTICAL, SessionType.TUTORIAL]
    )
    max_daily_sessions: int = 4
    max_weekly_sessions: int = 16
    max_consecutive_sessions: int = 3
    unavailable_slots: List[SlotCoord] = Field(default_factory=list)
    preferred_slots: List[SlotCoord] = Field(default_factory=list)


class Room(BaseModel):
    id: str
    name: str
    room_type: RoomType
    capacity: int
    equipment: List[str] = Field(default_factory=list)
    unavailable_slots: List[SlotCoord] = Field(default_factory=list)


class SolverWeights(BaseModel):
    gap_weight: int = 4  # Minimize gaps in student schedule
    workload_balance_weight: int = 3  # Balance faculty load across days
    subject_spread_weight: int = 5  # Spread subject lectures over week
    consecutive_penalty_weight: int = 2  # Penalize >3 consecutive teaching periods
    preference_weight: int = 2  # Reward preferred faculty slots
    room_efficiency_weight: int = 1  # Efficient room usage


class TimetableConfig(BaseModel):
    academic_year: str = "2026-2027"
    semester: str = "Semester 5"
    department: str = "Computer Science & Engineering"
    working_days: List[str] = Field(
        default_factory=lambda: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    )
    time_slots: List[TimeSlot] = Field(default_factory=list)
    divisions: List[Division] = Field(default_factory=list)
    subjects: List[Subject] = Field(default_factory=list)
    requirements: List[SessionRequirement] = Field(default_factory=list)
    faculty: List[Faculty] = Field(default_factory=list)
    rooms: List[Room] = Field(default_factory=list)
    solver_time_limit: float = 15.0  # seconds
    allow_partial: bool = True  # If true and complete is infeasible, solver produces best partial
    weights: SolverWeights = Field(default_factory=SolverWeights)


class ScheduledSession(BaseModel):
    session_id: str
    requirement_id: str
    subject_id: str
    subject_name: str
    subject_code: str
    division_id: str
    division_name: str
    faculty_id: str
    faculty_name: str
    room_id: str
    room_name: str
    session_type: SessionType
    day: str
    start_slot_index: int
    duration_slots: int
    slots: List[int]
    start_time: str
    end_time: str


class UnassignedSession(BaseModel):
    requirement_id: str
    occurrence_index: int
    subject_id: str
    subject_name: str
    division_id: str
    division_name: str
    session_type: SessionType
    duration_slots: int
    primary_reasons: List[str] = Field(default_factory=list)
    heuristic_notes: List[str] = Field(default_factory=list)
    actionable_suggestions: List[str] = Field(default_factory=list)


class ConstraintViolation(BaseModel):
    rule_id: str  # e.g., "H1", "H2", "H3", etc.
    category: str
    message: str
    severity: str = "ERROR"  # "ERROR" or "WARNING"
    affected_entities: Dict[str, Any] = Field(default_factory=dict)


class ValidationReport(BaseModel):
    is_valid: bool
    status_summary: str
    hard_violations_count: int
    warning_count: int
    violations: List[ConstraintViolation] = Field(default_factory=list)
    total_required_sessions: int
    total_assigned_sessions: int
    unassigned_count: int
    checked_rules: List[str] = Field(default_factory=list)


class DiagnosticReport(BaseModel):
    overall_assessment: str
    has_unassigned: bool
    bottlenecks_detected: List[str] = Field(default_factory=list)
    detailed_unassigned: List[UnassignedSession] = Field(default_factory=list)
    resource_utilization: Dict[str, Any] = Field(default_factory=dict)
    recommendations: List[str] = Field(default_factory=list)


class TimetableResult(BaseModel):
    status: SolverStatus
    execution_time_seconds: float
    total_required_sessions: int
    scheduled_sessions_count: int
    unassigned_sessions_count: int
    sessions: List[ScheduledSession] = Field(default_factory=list)
    unassigned_sessions: List[UnassignedSession] = Field(default_factory=list)
    validation: Optional[ValidationReport] = None
    diagnostics: Optional[DiagnosticReport] = None
    generated_at: Optional[str] = None
