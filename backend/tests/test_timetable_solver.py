import pytest
from app.models import (
    TimetableConfig,
    ScheduledSession,
    SolverStatus,
    SessionType,
    RoomType,
    SlotCoord,
    SessionRequirement,
)
from app.defaults import get_default_timetable_config
from app.solver import TimetableSolver
from app.validator import validate_timetable


# 1. Successful timetable generation from real input data
def test_01_successful_timetable_generation_real_data():
    config = get_default_timetable_config()
    solver = TimetableSolver(config)
    result = solver.solve()

    assert result.status in (SolverStatus.FEASIBLE, SolverStatus.OPTIMAL)
    assert result.scheduled_sessions_count == result.total_required_sessions
    assert result.unassigned_sessions_count == 0
    assert result.validation is not None
    assert result.validation.is_valid is True
    assert result.validation.hard_violations_count == 0


# 2. Faculty overlap prevention
def test_02_faculty_overlap_prevention():
    config = get_default_timetable_config()
    # Force single division with small requirement for speed
    config.requirements = config.requirements[:4]
    solver = TimetableSolver(config)
    result = solver.solve()

    # Verify no solver-generated session overlaps faculty
    fac_slots = {}
    for s in result.sessions:
        for slot in s.slots:
            key = (s.faculty_id, s.day, slot)
            assert key not in fac_slots, f"Faculty {s.faculty_id} has overlapping session at {key}"
            fac_slots[key] = s.session_id

    # Test independent validator catches artificially introduced faculty overlap
    corrupted = list(result.sessions)
    if corrupted:
        dup = corrupted[0].model_copy(update={"session_id": "CORRUPT_FAC_DUP", "division_id": "DIV_B"})
        report = validate_timetable(config, corrupted + [dup])
        assert report.is_valid is False
        assert any(v.rule_id == "H2_FACULTY_OVERLAP" for v in report.violations)


# 3. Room overlap prevention
def test_03_room_overlap_prevention():
    config = get_default_timetable_config()
    config.requirements = config.requirements[:4]
    solver = TimetableSolver(config)
    result = solver.solve()

    room_slots = {}
    for s in result.sessions:
        for slot in s.slots:
            key = (s.room_id, s.day, slot)
            assert key not in room_slots, f"Room {s.room_id} has overlapping session at {key}"
            room_slots[key] = s.session_id

    # Test validator catches artificially injected room overlap
    if result.sessions:
        dup = result.sessions[0].model_copy(update={"session_id": "CORRUPT_RM_DUP", "division_id": "DIV_B", "faculty_id": "FAC_ADA"})
        report = validate_timetable(config, result.sessions + [dup])
        assert report.is_valid is False
        assert any(v.rule_id == "H3_ROOM_OVERLAP" for v in report.violations)


# 4. Division overlap prevention
def test_04_division_overlap_prevention():
    config = get_default_timetable_config()
    config.requirements = config.requirements[:4]
    solver = TimetableSolver(config)
    result = solver.solve()

    div_slots = {}
    for s in result.sessions:
        for slot in s.slots:
            key = (s.division_id, s.day, slot)
            assert key not in div_slots, f"Division {s.division_id} has overlapping session at {key}"
            div_slots[key] = s.session_id

    # Test validator catches division overlap
    if result.sessions:
        dup = result.sessions[0].model_copy(update={"session_id": "CORRUPT_DIV_DUP", "room_id": "ROOM_302", "faculty_id": "FAC_ADA"})
        report = validate_timetable(config, result.sessions + [dup])
        assert report.is_valid is False
        assert any(v.rule_id == "H1_DIVISION_OVERLAP" for v in report.violations)


# 5. Faculty eligibility
def test_05_faculty_eligibility():
    config = get_default_timetable_config()
    config.requirements = config.requirements[:4]
    solver = TimetableSolver(config)
    result = solver.solve()

    faculty_map = {f.id: f for f in config.faculty}
    for s in result.sessions:
        fac = faculty_map[s.faculty_id]
        assert s.subject_id in fac.qualified_subject_ids
        assert s.session_type in fac.qualified_session_types

    # Validator catches assignment of unqualified faculty
    if result.sessions:
        bad_fac_session = result.sessions[0].model_copy(update={"faculty_id": "FAC_CODD", "subject_id": "SUB_CS501"})
        report = validate_timetable(config, [bad_fac_session], expected_requirements=False)
        assert report.is_valid is False
        assert any(v.rule_id == "H4_FACULTY_ELIGIBILITY" for v in report.violations)


# 6. Room capacity and suitability
def test_06_room_capacity_and_suitability():
    config = get_default_timetable_config()
    config.requirements = config.requirements[:4]
    solver = TimetableSolver(config)
    result = solver.solve()

    rooms_map = {r.id: r for r in config.rooms}
    divs_map = {d.id: d for d in config.divisions}
    for s in result.sessions:
        rm = rooms_map[s.room_id]
        div = divs_map[s.division_id]
        assert rm.capacity >= div.student_strength
        if s.session_type == SessionType.PRACTICAL:
            assert rm.room_type == RoomType.LAB

    # Validator catches room capacity violation
    if result.sessions:
        assigned_room_id = result.sessions[0].room_id
        # Replace that room with a 20-capacity room
        rooms_with_small = [
            r.model_copy(update={"capacity": 20}) if r.id == assigned_room_id else r
            for r in config.rooms
        ]
        bad_cfg = config.model_copy(update={"rooms": rooms_with_small})
        report = validate_timetable(bad_cfg, result.sessions[:1], expected_requirements=False)
        assert report.is_valid is False
        assert any(v.rule_id == "H5_ROOM_CAPACITY" for v in report.violations)


# 7. Availability constraints
def test_07_availability_constraints():
    config = get_default_timetable_config()
    # Mark Dr. Alan unavailable on Monday slot 0
    config.faculty[0].unavailable_slots.append(SlotCoord(day="Monday", slot_index=0))
    # Mark Division A blocked on Monday slot 1
    config.divisions[0].blocked_slots.append(SlotCoord(day="Monday", slot_index=1))

    solver = TimetableSolver(config)
    result = solver.solve()

    for s in result.sessions:
        if s.faculty_id == config.faculty[0].id:
            assert not (s.day == "Monday" and 0 in s.slots)
        if s.division_id == config.divisions[0].id:
            assert not (s.day == "Monday" and 1 in s.slots)


# 8. Continuous practical sessions
def test_08_continuous_practical_sessions():
    config = get_default_timetable_config()
    config.requirements = [r for r in config.requirements if r.session_type == SessionType.PRACTICAL][:2]
    solver = TimetableSolver(config)
    result = solver.solve()

    for s in result.sessions:
        if s.duration_slots > 1:
            # Must be consecutive
            assert len(s.slots) == s.duration_slots
            assert s.slots == list(range(s.start_slot_index, s.start_slot_index + s.duration_slots))

    # Validator catches non-continuous practical slots
    if result.sessions:
        corrupted_practical = result.sessions[0].model_copy(update={"slots": [0, 2]})  # non-consecutive
        report = validate_timetable(config, [corrupted_practical], expected_requirements=False)
        assert report.is_valid is False
        assert any(v.rule_id == "H12_PRACTICAL_CONTINUITY" for v in report.violations)


# 9. Weekly session counts
def test_09_weekly_session_counts():
    config = get_default_timetable_config()
    config.requirements = config.requirements[:3]
    total_req = sum(r.weekly_count for r in config.requirements)

    solver = TimetableSolver(config)
    result = solver.solve()

    assert result.scheduled_sessions_count == total_req


# 10. Insufficient-resource scenarios
def test_10_insufficient_resource_scenarios():
    config = get_default_timetable_config()
    # Remove all labs so practical sessions cannot find a suitable room
    config.rooms = [r for r in config.rooms if r.room_type != RoomType.LAB]
    config.allow_partial = True

    solver = TimetableSolver(config)
    result = solver.solve()

    # Practical sessions should be unassigned
    assert result.unassigned_sessions_count > 0
    assert result.status == SolverStatus.PARTIAL
    assert result.diagnostics is not None
    assert result.diagnostics.has_unassigned is True
    assert any("VERIFIED" in reason for u in result.unassigned_sessions for reason in u.primary_reasons)


# 11. Infeasible configurations
def test_11_infeasible_configurations():
    config = get_default_timetable_config()
    # Block almost all slots for Division A so it has only 1 available slot
    blocked = []
    for day in config.working_days:
        for slot in range(len(config.time_slots)):
            if not (day == "Monday" and slot == 0):
                blocked.append(SlotCoord(day=day, slot_index=slot))
    config.divisions[0].blocked_slots = blocked
    config.allow_partial = False  # Strictly require complete timetable

    solver = TimetableSolver(config)
    result = solver.solve()

    assert result.status == SolverStatus.INFEASIBLE
    assert result.scheduled_sessions_count == 0
    assert result.diagnostics is not None
    assert len(result.diagnostics.bottlenecks_detected) > 0


# 12. Solver timeouts
def test_12_solver_timeouts():
    config = get_default_timetable_config()
    # Extremely small timeout limit
    config.solver_time_limit = 0.0001
    config.allow_partial = False

    solver = TimetableSolver(config)
    result = solver.solve()

    # Must terminate cleanly within time limit without crashing
    assert result.status in (SolverStatus.TIMEOUT, SolverStatus.INFEASIBLE, SolverStatus.FEASIBLE)
    assert result.execution_time_seconds <= 5.0


# 13. Independent validator detection of corrupted output
def test_13_validator_detects_corrupted_output():
    config = get_default_timetable_config()
    # Create an intentionally corrupted session violating multiple rules:
    # 1. Scheduled on break slot 4
    # 2. Unqualified faculty
    # 3. Room capacity too small (capacity 20 vs 55)
    # 4. Non-continuous slots
    corrupted_session = ScheduledSession(
        session_id="SESS_CORRUPT_MULTI",
        requirement_id=config.requirements[0].id,
        subject_id="SUB_CS501",
        subject_name="Operating Systems",
        subject_code="CS501",
        division_id="DIV_A",
        division_name="Division A",
        faculty_id="FAC_CODD",  # Unqualified for CS501
        faculty_name="Dr. Edgar Codd",
        room_id="ROOM_301",
        room_name="Room 301",
        session_type=SessionType.PRACTICAL,
        day="Monday",
        start_slot_index=3,
        duration_slots=2,
        slots=[3, 4],  # Slot 4 is lunch break!
        start_time="12:00",
        end_time="14:00",
    )

    report = validate_timetable(config, [corrupted_session], expected_requirements=False)
    assert report.is_valid is False
    assert report.hard_violations_count >= 2
    rule_ids = {v.rule_id for v in report.violations}
    assert "H10_SESSION_DURATION_AND_BREAKS" in rule_ids
    assert "H4_FACULTY_ELIGIBILITY" in rule_ids


# 14. Updated configuration being used during regeneration
def test_14_updated_configuration_used_during_regeneration():
    config = get_default_timetable_config()
    config.requirements = [
        SessionRequirement(
            id="REQ_CUSTOM_A",
            subject_id="SUB_CS501",
            division_id="DIV_A",
            session_type=SessionType.THEORY,
            weekly_count=1,
            duration_slots=1,
        )
    ]
    solver1 = TimetableSolver(config)
    res1 = solver1.solve()
    assert res1.scheduled_sessions_count == 1

    # Update configuration: increase student strength to 100 (only SEMINAR_HALL can fit 100 students)
    config.divisions[0].student_strength = 100
    solver2 = TimetableSolver(config)
    res2 = solver2.solve()

    assert res2.scheduled_sessions_count == 1
    # Must use Seminar Hall because Room 301 and 302 have capacity 65 < 100
    assert res2.sessions[0].room_id == "SEMINAR_HALL"
