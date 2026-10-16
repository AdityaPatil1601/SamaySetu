from app.models import (
    TimetableConfig,
    TimeSlot,
    Division,
    Subject,
    SessionRequirement,
    Faculty,
    Room,
    SessionType,
    RoomType,
    SlotCoord,
    SolverWeights,
)


def get_default_timetable_config() -> TimetableConfig:
    time_slots = [
        TimeSlot(slot_index=0, label="09:00 - 10:00", start_time="09:00", end_time="10:00", is_break=False),
        TimeSlot(slot_index=1, label="10:00 - 11:00", start_time="10:00", end_time="11:00", is_break=False),
        TimeSlot(slot_index=2, label="11:00 - 12:00", start_time="11:00", end_time="12:00", is_break=False),
        TimeSlot(slot_index=3, label="12:00 - 13:00", start_time="12:00", end_time="13:00", is_break=False),
        TimeSlot(slot_index=4, label="13:00 - 14:00", start_time="13:00", end_time="14:00", is_break=True, break_name="Lunch Break"),
        TimeSlot(slot_index=5, label="14:00 - 15:00", start_time="14:00", end_time="15:00", is_break=False),
        TimeSlot(slot_index=6, label="15:00 - 16:00", start_time="15:00", end_time="16:00", is_break=False),
        TimeSlot(slot_index=7, label="16:00 - 17:00", start_time="16:00", end_time="17:00", is_break=False),
    ]

    working_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

    divisions = [
        Division(
            id="DIV_A",
            name="Computer Science - Division A",
            student_strength=55,
            department="Computer Science & Engineering",
            blocked_slots=[
                SlotCoord(day="Wednesday", slot_index=7)  # Sports / Club Hour
            ],
        ),
        Division(
            id="DIV_B",
            name="Computer Science - Division B",
            student_strength=50,
            department="Computer Science & Engineering",
            blocked_slots=[
                SlotCoord(day="Friday", slot_index=7)  # Mentorship / Assembly
            ],
        ),
    ]

    subjects = [
        Subject(id="SUB_CS501", code="CS501", name="Operating Systems", department="CSE", preferred_room_types=[RoomType.CLASSROOM]),
        Subject(id="SUB_CS502", code="CS502", name="Database Management Systems", department="CSE", preferred_room_types=[RoomType.CLASSROOM]),
        Subject(id="SUB_CS503", code="CS503", name="Computer Networks", department="CSE", preferred_room_types=[RoomType.CLASSROOM]),
        Subject(id="SUB_CS504", code="CS504", name="Artificial Intelligence & ML", department="CSE", preferred_room_types=[RoomType.CLASSROOM]),
        Subject(id="SUB_CS505", code="CS505", name="Software Engineering", department="CSE", preferred_room_types=[RoomType.CLASSROOM]),
    ]

    requirements = [
        # Division A
        SessionRequirement(id="REQ_A_CS501_TH", subject_id="SUB_CS501", division_id="DIV_A", session_type=SessionType.THEORY, weekly_count=3, duration_slots=1, preferred_faculty_ids=["FAC_ALAN"]),
        SessionRequirement(id="REQ_A_CS501_PR", subject_id="SUB_CS501", division_id="DIV_A", session_type=SessionType.PRACTICAL, weekly_count=1, duration_slots=2, requires_lab=True, required_equipment=["Linux Workstations"]),
        
        SessionRequirement(id="REQ_A_CS502_TH", subject_id="SUB_CS502", division_id="DIV_A", session_type=SessionType.THEORY, weekly_count=3, duration_slots=1, preferred_faculty_ids=["FAC_CODD"]),
        SessionRequirement(id="REQ_A_CS502_PR", subject_id="SUB_CS502", division_id="DIV_A", session_type=SessionType.PRACTICAL, weekly_count=1, duration_slots=2, requires_lab=True, required_equipment=["Database Workstations"]),
        
        SessionRequirement(id="REQ_A_CS503_TH", subject_id="SUB_CS503", division_id="DIV_A", session_type=SessionType.THEORY, weekly_count=3, duration_slots=1, preferred_faculty_ids=["FAC_SHANNON"]),
        SessionRequirement(id="REQ_A_CS503_PR", subject_id="SUB_CS503", division_id="DIV_A", session_type=SessionType.PRACTICAL, weekly_count=1, duration_slots=2, requires_lab=True, required_equipment=["Network Simulator"]),
        
        SessionRequirement(id="REQ_A_CS504_TH", subject_id="SUB_CS504", division_id="DIV_A", session_type=SessionType.THEORY, weekly_count=3, duration_slots=1, preferred_faculty_ids=["FAC_MCCARTHY"]),
        SessionRequirement(id="REQ_A_CS504_PR", subject_id="SUB_CS504", division_id="DIV_A", session_type=SessionType.PRACTICAL, weekly_count=1, duration_slots=2, requires_lab=True, required_equipment=["GPU Nodes"]),
        
        SessionRequirement(id="REQ_A_CS505_TH", subject_id="SUB_CS505", division_id="DIV_A", session_type=SessionType.THEORY, weekly_count=3, duration_slots=1, preferred_faculty_ids=["FAC_ADA"]),

        # Division B
        SessionRequirement(id="REQ_B_CS501_TH", subject_id="SUB_CS501", division_id="DIV_B", session_type=SessionType.THEORY, weekly_count=3, duration_slots=1, preferred_faculty_ids=["FAC_GRACE"]),
        SessionRequirement(id="REQ_B_CS501_PR", subject_id="SUB_CS501", division_id="DIV_B", session_type=SessionType.PRACTICAL, weekly_count=1, duration_slots=2, requires_lab=True, required_equipment=["Linux Workstations"]),
        
        SessionRequirement(id="REQ_B_CS502_TH", subject_id="SUB_CS502", division_id="DIV_B", session_type=SessionType.THEORY, weekly_count=3, duration_slots=1, preferred_faculty_ids=["FAC_CODD"]),
        SessionRequirement(id="REQ_B_CS502_PR", subject_id="SUB_CS502", division_id="DIV_B", session_type=SessionType.PRACTICAL, weekly_count=1, duration_slots=2, requires_lab=True, required_equipment=["Database Workstations"]),
        
        SessionRequirement(id="REQ_B_CS503_TH", subject_id="SUB_CS503", division_id="DIV_B", session_type=SessionType.THEORY, weekly_count=3, duration_slots=1, preferred_faculty_ids=["FAC_SHANNON"]),
        SessionRequirement(id="REQ_B_CS503_PR", subject_id="SUB_CS503", division_id="DIV_B", session_type=SessionType.PRACTICAL, weekly_count=1, duration_slots=2, requires_lab=True, required_equipment=["Network Simulator"]),
        
        SessionRequirement(id="REQ_B_CS504_TH", subject_id="SUB_CS504", division_id="DIV_B", session_type=SessionType.THEORY, weekly_count=3, duration_slots=1, preferred_faculty_ids=["FAC_MCCARTHY"]),
        SessionRequirement(id="REQ_B_CS504_PR", subject_id="SUB_CS504", division_id="DIV_B", session_type=SessionType.PRACTICAL, weekly_count=1, duration_slots=2, requires_lab=True, required_equipment=["GPU Nodes"]),
        
        SessionRequirement(id="REQ_B_CS505_TH", subject_id="SUB_CS505", division_id="DIV_B", session_type=SessionType.THEORY, weekly_count=3, duration_slots=1, preferred_faculty_ids=["FAC_ADA"]),
    ]

    faculty = [
        Faculty(
            id="FAC_ALAN",
            name="Dr. Alan Turing",
            email="alan.turing@campusflow.edu",
            department="CSE",
            qualified_subject_ids=["SUB_CS501", "SUB_CS503"],
            qualified_session_types=[SessionType.THEORY, SessionType.PRACTICAL],
            max_daily_sessions=4,
            max_weekly_sessions=14,
            max_consecutive_sessions=3,
            unavailable_slots=[SlotCoord(day="Friday", slot_index=6), SlotCoord(day="Friday", slot_index=7)],  # Research meeting
            preferred_slots=[SlotCoord(day="Monday", slot_index=0), SlotCoord(day="Tuesday", slot_index=0)],
        ),
        Faculty(
            id="FAC_CODD",
            name="Dr. Edgar F. Codd",
            email="edgar.codd@campusflow.edu",
            department="CSE",
            qualified_subject_ids=["SUB_CS502"],
            qualified_session_types=[SessionType.THEORY, SessionType.PRACTICAL],
            max_daily_sessions=4,
            max_weekly_sessions=14,
            max_consecutive_sessions=3,
            unavailable_slots=[SlotCoord(day="Wednesday", slot_index=0)],
            preferred_slots=[SlotCoord(day="Tuesday", slot_index=1), SlotCoord(day="Thursday", slot_index=1)],
        ),
        Faculty(
            id="FAC_ADA",
            name="Dr. Ada Lovelace",
            email="ada.lovelace@campusflow.edu",
            department="CSE",
            qualified_subject_ids=["SUB_CS505", "SUB_CS504"],
            qualified_session_types=[SessionType.THEORY, SessionType.PRACTICAL, SessionType.TUTORIAL],
            max_daily_sessions=4,
            max_weekly_sessions=14,
            max_consecutive_sessions=3,
            unavailable_slots=[],
            preferred_slots=[SlotCoord(day="Monday", slot_index=1), SlotCoord(day="Wednesday", slot_index=1)],
        ),
        Faculty(
            id="FAC_SHANNON",
            name="Dr. Claude Shannon",
            email="claude.shannon@campusflow.edu",
            department="CSE",
            qualified_subject_ids=["SUB_CS503"],
            qualified_session_types=[SessionType.THEORY, SessionType.PRACTICAL],
            max_daily_sessions=4,
            max_weekly_sessions=14,
            max_consecutive_sessions=3,
            unavailable_slots=[SlotCoord(day="Thursday", slot_index=6), SlotCoord(day="Thursday", slot_index=7)],
            preferred_slots=[SlotCoord(day="Monday", slot_index=2), SlotCoord(day="Wednesday", slot_index=2)],
        ),
        Faculty(
            id="FAC_MCCARTHY",
            name="Dr. John McCarthy",
            email="john.mccarthy@campusflow.edu",
            department="CSE",
            qualified_subject_ids=["SUB_CS504"],
            qualified_session_types=[SessionType.THEORY, SessionType.PRACTICAL],
            max_daily_sessions=4,
            max_weekly_sessions=14,
            max_consecutive_sessions=3,
            unavailable_slots=[],
            preferred_slots=[SlotCoord(day="Tuesday", slot_index=2), SlotCoord(day="Thursday", slot_index=2)],
        ),
        Faculty(
            id="FAC_GRACE",
            name="Prof. Grace Hopper",
            email="grace.hopper@campusflow.edu",
            department="CSE",
            qualified_subject_ids=["SUB_CS501", "SUB_CS502", "SUB_CS505"],
            qualified_session_types=[SessionType.THEORY, SessionType.PRACTICAL],
            max_daily_sessions=4,
            max_weekly_sessions=14,
            max_consecutive_sessions=3,
            unavailable_slots=[SlotCoord(day="Monday", slot_index=7)],
            preferred_slots=[SlotCoord(day="Tuesday", slot_index=3), SlotCoord(day="Friday", slot_index=1)],
        ),
    ]

    rooms = [
        Room(
            id="ROOM_301",
            name="Room 301 (Classroom A)",
            room_type=RoomType.CLASSROOM,
            capacity=65,
            equipment=["Projector", "Whiteboard", "Audio System"],
            unavailable_slots=[],
        ),
        Room(
            id="ROOM_302",
            name="Room 302 (Classroom B)",
            room_type=RoomType.CLASSROOM,
            capacity=65,
            equipment=["Projector", "Whiteboard", "Smart Board"],
            unavailable_slots=[],
        ),
        Room(
            id="LAB_1",
            name="Lab 101 - Systems & Network Lab",
            room_type=RoomType.LAB,
            capacity=60,
            equipment=["Projector", "Linux Workstations", "Network Simulator", "Whiteboard"],
            unavailable_slots=[SlotCoord(day="Monday", slot_index=0)],  # Morning Lab Maintenance
        ),
        Room(
            id="LAB_2",
            name="Lab 102 - AI & Database Lab",
            room_type=RoomType.LAB,
            capacity=60,
            equipment=["Projector", "Database Workstations", "GPU Nodes", "Whiteboard"],
            unavailable_slots=[SlotCoord(day="Wednesday", slot_index=0)],  # Morning Server Maintenance
        ),
        Room(
            id="SEMINAR_HALL",
            name="Seminar Hall 1",
            room_type=RoomType.SEMINAR_HALL,
            capacity=120,
            equipment=["Projector", "Audio System", "Stage"],
            unavailable_slots=[],
        ),
    ]

    return TimetableConfig(
        academic_year="2026-2027",
        semester="Semester 5",
        department="Computer Science & Engineering",
        working_days=working_days,
        time_slots=time_slots,
        divisions=divisions,
        subjects=subjects,
        requirements=requirements,
        faculty=faculty,
        rooms=rooms,
        solver_time_limit=15.0,
        allow_partial=True,
        weights=SolverWeights(),
    )
