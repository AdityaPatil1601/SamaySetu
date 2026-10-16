from typing import List, Dict, Set, Tuple, Any
from app.models import (
    TimetableConfig,
    ScheduledSession,
    ValidationReport,
    ConstraintViolation,
    SessionType,
    RoomType,
)


def validate_timetable(
    config: TimetableConfig,
    sessions: List[ScheduledSession],
    expected_requirements: bool = True,
) -> ValidationReport:
    """
    Independent validation service that checks the generated schedule
    against all mandatory hard constraints (H1 to H13) and requirements.
    """
    violations: List[ConstraintViolation] = []
    checked_rules = [
        "H1_DIVISION_OVERLAP",
        "H2_FACULTY_OVERLAP",
        "H3_ROOM_OVERLAP",
        "H4_FACULTY_ELIGIBILITY",
        "H5_ROOM_CAPACITY",
        "H6_ROOM_SUITABILITY",
        "H7_FACULTY_AVAILABILITY",
        "H8_ROOM_AVAILABILITY",
        "H9_DIVISION_AVAILABILITY",
        "H10_SESSION_DURATION_AND_BREAKS",
        "H11_WEEKLY_REQUIREMENTS",
        "H12_PRACTICAL_CONTINUITY",
        "H13_FACULTY_WORKLOAD_LIMITS",
    ]

    # Pre-build lookup dictionaries
    divisions_by_id = {d.id: d for d in config.divisions}
    faculty_by_id = {f.id: f for f in config.faculty}
    rooms_by_id = {r.id: r for r in config.rooms}
    subjects_by_id = {s.id: s for s in config.subjects}
    requirements_by_id = {r.id: r for r in config.requirements}
    time_slots_by_index = {ts.slot_index: ts for ts in config.time_slots}
    break_slot_indices = {ts.slot_index for ts in config.time_slots if ts.is_break}

    # Tracking sets for simultaneous usage: (day, slot_index) -> list of session_ids
    division_occupancy: Dict[Tuple[str, str, int], List[str]] = {}  # (div_id, day, slot) -> [sess_id]
    faculty_occupancy: Dict[Tuple[str, str, int], List[str]] = {}   # (fac_id, day, slot) -> [sess_id]
    room_occupancy: Dict[Tuple[str, str, int], List[str]] = {}      # (room_id, day, slot) -> [sess_id]

    # Tracking for faculty workload: fac_id -> {day: count}, fac_id -> weekly_count
    faculty_daily_workload: Dict[Tuple[str, str], int] = {}  # (fac_id, day) -> count of hours/slots
    faculty_weekly_workload: Dict[str, int] = {}             # fac_id -> total slots

    # Tracking for requirement satisfaction: req_id -> count of scheduled sessions
    requirement_counts: Dict[str, int] = {req.id: 0 for req in config.requirements}

    for sess in sessions:
        req = requirements_by_id.get(sess.requirement_id)
        div = divisions_by_id.get(sess.division_id)
        fac = faculty_by_id.get(sess.faculty_id)
        room = rooms_by_id.get(sess.room_id)
        subj = subjects_by_id.get(sess.subject_id)

        # Basic integrity check
        if not req or not div or not fac or not room or not subj:
            violations.append(
                ConstraintViolation(
                    rule_id="INTEGRITY",
                    category="Missing Entity",
                    message=f"Session {sess.session_id} references non-existent entities (Req: {sess.requirement_id}, Div: {sess.division_id}, Fac: {sess.faculty_id}, Room: {sess.room_id}, Subj: {sess.subject_id})",
                    affected_entities={"session_id": sess.session_id},
                )
            )
            continue

        requirement_counts[req.id] = requirement_counts.get(req.id, 0) + 1

        # Check H10: Session duration and breaks
        if len(sess.slots) != req.duration_slots:
            violations.append(
                ConstraintViolation(
                    rule_id="H10_SESSION_DURATION_AND_BREAKS",
                    category="Session Duration",
                    message=f"Session {sess.session_id} occupies {len(sess.slots)} slots, but requirement specifies {req.duration_slots} slots.",
                    affected_entities={"session_id": sess.session_id, "requirement_id": req.id},
                )
            )

        for s_idx in sess.slots:
            if s_idx in break_slot_indices:
                break_name = time_slots_by_index.get(s_idx, {}).break_name or "Break"
                violations.append(
                    ConstraintViolation(
                        rule_id="H10_SESSION_DURATION_AND_BREAKS",
                        category="Break Conflict",
                        message=f"Session {sess.session_id} scheduled across break period (slot {s_idx}: {break_name}) on {sess.day}.",
                        affected_entities={"session_id": sess.session_id, "day": sess.day, "slot": s_idx},
                    )
                )

        # Check H12: Practical session continuity
        if req.duration_slots > 1:
            sorted_slots = sorted(sess.slots)
            is_consecutive = all(sorted_slots[i] + 1 == sorted_slots[i + 1] for i in range(len(sorted_slots) - 1))
            if not is_consecutive:
                violations.append(
                    ConstraintViolation(
                        rule_id="H12_PRACTICAL_CONTINUITY",
                        category="Practical Continuity",
                        message=f"Multi-period session {sess.session_id} has non-consecutive slots: {sess.slots}.",
                        affected_entities={"session_id": sess.session_id, "slots": sess.slots},
                    )
                )

        # Check H4: Faculty qualification
        if subj.id not in fac.qualified_subject_ids:
            violations.append(
                ConstraintViolation(
                    rule_id="H4_FACULTY_ELIGIBILITY",
                    category="Faculty Qualification",
                    message=f"Faculty {fac.name} is not qualified to teach subject {subj.name} ({subj.code}).",
                    affected_entities={"faculty_id": fac.id, "subject_id": subj.id, "session_id": sess.session_id},
                )
            )

        if sess.session_type not in fac.qualified_session_types:
            violations.append(
                ConstraintViolation(
                    rule_id="H4_FACULTY_ELIGIBILITY",
                    category="Session Type Eligibility",
                    message=f"Faculty {fac.name} is not qualified for session type '{sess.session_type}'.",
                    affected_entities={"faculty_id": fac.id, "session_type": sess.session_type, "session_id": sess.session_id},
                )
            )

        # Check H5: Room capacity
        if room.capacity < div.student_strength:
            violations.append(
                ConstraintViolation(
                    rule_id="H5_ROOM_CAPACITY",
                    category="Room Capacity",
                    message=f"Room {room.name} (capacity {room.capacity}) cannot accommodate division {div.name} (strength {div.student_strength}).",
                    affected_entities={"room_id": room.id, "division_id": div.id, "room_capacity": room.capacity, "student_strength": div.student_strength},
                )
            )

        # Check H6: Room type and equipment suitability
        if req.requires_lab and room.room_type != RoomType.LAB:
            violations.append(
                ConstraintViolation(
                    rule_id="H6_ROOM_SUITABILITY",
                    category="Room Type Mismatch",
                    message=f"Session {sess.session_id} requires a laboratory, but room {room.name} is a {room.room_type}.",
                    affected_entities={"room_id": room.id, "required_type": "lab", "actual_type": room.room_type},
                )
            )

        for eq in req.required_equipment:
            if eq not in room.equipment:
                violations.append(
                    ConstraintViolation(
                        rule_id="H6_ROOM_SUITABILITY",
                        category="Missing Equipment",
                        message=f"Room {room.name} lacks required equipment '{eq}' for session {sess.session_id}.",
                        affected_entities={"room_id": room.id, "missing_equipment": eq},
                    )
                )

        # Check H7: Faculty availability
        fac_unavail_coords = {(u.day, u.slot_index) for u in fac.unavailable_slots}
        for s_idx in sess.slots:
            if (sess.day, s_idx) in fac_unavail_coords:
                violations.append(
                    ConstraintViolation(
                        rule_id="H7_FACULTY_AVAILABILITY",
                        category="Faculty Unavailable",
                        message=f"Faculty {fac.name} is marked unavailable on {sess.day} at slot {s_idx}.",
                        affected_entities={"faculty_id": fac.id, "day": sess.day, "slot": s_idx},
                    )
                )

        # Check H8: Room availability
        room_unavail_coords = {(u.day, u.slot_index) for u in room.unavailable_slots}
        for s_idx in sess.slots:
            if (sess.day, s_idx) in room_unavail_coords:
                violations.append(
                    ConstraintViolation(
                        rule_id="H8_ROOM_AVAILABILITY",
                        category="Room Unavailable",
                        message=f"Room {room.name} is marked unavailable on {sess.day} at slot {s_idx}.",
                        affected_entities={"room_id": room.id, "day": sess.day, "slot": s_idx},
                    )
                )

        # Check H9: Division availability / blocked periods
        div_blocked_coords = {(b.day, b.slot_index) for b in div.blocked_slots}
        for s_idx in sess.slots:
            if (sess.day, s_idx) in div_blocked_coords:
                violations.append(
                    ConstraintViolation(
                        rule_id="H9_DIVISION_AVAILABILITY",
                        category="Division Blocked Slot",
                        message=f"Division {div.name} has slot {s_idx} on {sess.day} marked as blocked.",
                        affected_entities={"division_id": div.id, "day": sess.day, "slot": s_idx},
                    )
                )

        # Record occupancy for overlap checking (H1, H2, H3)
        for s_idx in sess.slots:
            div_key = (div.id, sess.day, s_idx)
            division_occupancy.setdefault(div_key, []).append(sess.session_id)

            fac_key = (fac.id, sess.day, s_idx)
            faculty_occupancy.setdefault(fac_key, []).append(sess.session_id)

            room_key = (room.id, sess.day, s_idx)
            room_occupancy.setdefault(room_key, []).append(sess.session_id)

        # Record workload
        num_slots = len(sess.slots)
        faculty_daily_workload[(fac.id, sess.day)] = (
            faculty_daily_workload.get((fac.id, sess.day), 0) + num_slots
        )
        faculty_weekly_workload[fac.id] = (
            faculty_weekly_workload.get(fac.id, 0) + num_slots
        )

    # Check H1: Division overlaps
    for (div_id, day, slot), s_list in division_occupancy.items():
        if len(s_list) > 1:
            div_name = divisions_by_id.get(div_id, div_id).name if div_id in divisions_by_id else div_id
            violations.append(
                ConstraintViolation(
                    rule_id="H1_DIVISION_OVERLAP",
                    category="Division Overlap",
                    message=f"Division {div_name} has multiple simultaneous sessions on {day} at slot {slot}: {s_list}",
                    affected_entities={"division_id": div_id, "day": day, "slot": slot, "conflicting_sessions": s_list},
                )
            )

    # Check H2: Faculty overlaps
    for (fac_id, day, slot), s_list in faculty_occupancy.items():
        if len(s_list) > 1:
            fac_name = faculty_by_id.get(fac_id, fac_id).name if fac_id in faculty_by_id else fac_id
            violations.append(
                ConstraintViolation(
                    rule_id="H2_FACULTY_OVERLAP",
                    category="Faculty Overlap",
                    message=f"Faculty {fac_name} is scheduled for multiple simultaneous sessions on {day} at slot {slot}: {s_list}",
                    affected_entities={"faculty_id": fac_id, "day": day, "slot": slot, "conflicting_sessions": s_list},
                )
            )

    # Check H3: Room overlaps
    for (room_id, day, slot), s_list in room_occupancy.items():
        if len(s_list) > 1:
            room_name = rooms_by_id.get(room_id, room_id).name if room_id in rooms_by_id else room_id
            violations.append(
                ConstraintViolation(
                    rule_id="H3_ROOM_OVERLAP",
                    category="Room Overlap",
                    message=f"Room {room_name} has multiple simultaneous sessions on {day} at slot {slot}: {s_list}",
                    affected_entities={"room_id": room_id, "day": day, "slot": slot, "conflicting_sessions": s_list},
                )
            )

    # Check H13: Faculty workload limits
    for (fac_id, day), count in faculty_daily_workload.items():
        fac = faculty_by_id.get(fac_id)
        if fac and count > fac.max_daily_sessions:
            violations.append(
                ConstraintViolation(
                    rule_id="H13_FACULTY_WORKLOAD_LIMITS",
                    category="Daily Workload Exceeded",
                    message=f"Faculty {fac.name} is scheduled for {count} slots on {day}, exceeding daily limit of {fac.max_daily_sessions}.",
                    affected_entities={"faculty_id": fac.id, "day": day, "actual_count": count, "max_allowed": fac.max_daily_sessions},
                )
            )

    for fac_id, count in faculty_weekly_workload.items():
        fac = faculty_by_id.get(fac_id)
        if fac and count > fac.max_weekly_sessions:
            violations.append(
                ConstraintViolation(
                    rule_id="H13_FACULTY_WORKLOAD_LIMITS",
                    category="Weekly Workload Exceeded",
                    message=f"Faculty {fac.name} is scheduled for {count} total slots, exceeding weekly limit of {fac.max_weekly_sessions}.",
                    affected_entities={"faculty_id": fac.id, "actual_count": count, "max_allowed": fac.max_weekly_sessions},
                )
            )

    # Check H11: Weekly session requirements
    total_required = sum(req.weekly_count for req in config.requirements)
    total_assigned = len(sessions)
    unassigned_count = 0

    if expected_requirements:
        for req in config.requirements:
            actual = requirement_counts.get(req.id, 0)
            if actual < req.weekly_count:
                diff = req.weekly_count - actual
                unassigned_count += diff
                subj_name = subjects_by_id.get(req.subject_id, req.subject_id).name if req.subject_id in subjects_by_id else req.subject_id
                div_name = divisions_by_id.get(req.division_id, req.division_id).name if req.division_id in divisions_by_id else req.division_id
                violations.append(
                    ConstraintViolation(
                        rule_id="H11_WEEKLY_REQUIREMENTS",
                        category="Unfulfilled Requirement",
                        message=f"Requirement {req.id} ({subj_name} for {div_name}, {req.session_type}) scheduled {actual}/{req.weekly_count} times ({diff} missing).",
                        affected_entities={"requirement_id": req.id, "scheduled": actual, "required": req.weekly_count},
                    )
                )

    hard_violations = [v for v in violations if v.severity == "ERROR"]
    is_valid = len(hard_violations) == 0

    status_summary = (
        "VALID: All mandatory constraints and requirements satisfied."
        if is_valid
        else f"INVALID: {len(hard_violations)} hard-constraint violation(s) detected."
    )

    return ValidationReport(
        is_valid=is_valid,
        status_summary=status_summary,
        hard_violations_count=len(hard_violations),
        warning_count=len(violations) - len(hard_violations),
        violations=violations,
        total_required_sessions=total_required,
        total_assigned_sessions=total_assigned,
        unassigned_count=unassigned_count,
        checked_rules=checked_rules,
    )
