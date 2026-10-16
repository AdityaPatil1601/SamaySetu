from typing import List, Dict, Set, Tuple, Any
from app.models import (
    TimetableConfig,
    DiagnosticReport,
    UnassignedSession,
    ScheduledSession,
    SessionType,
    RoomType,
)


def generate_diagnostic_report(
    config: TimetableConfig,
    unassigned_items: List[Tuple[str, int]],  # list of (requirement_id, occurrence_index)
    scheduled_sessions: List[ScheduledSession],
    solver_status_str: str,
) -> DiagnosticReport:
    """
    Comprehensive infeasibility and diagnostic engine.
    Analyzes root causes for unassigned sessions, distinguishes verified conflicts
    from heuristic explanations, and generates actionable suggestions.
    """
    requirements_by_id = {r.id: r for r in config.requirements}
    subjects_by_id = {s.id: s for s in config.subjects}
    divisions_by_id = {d.id: d for d in config.divisions}
    faculty_by_id = {f.id: f for f in config.faculty}
    rooms_by_id = {r.id: r for r in config.rooms}

    # Teaching slots (non-break)
    teaching_slots = [ts for ts in config.time_slots if not ts.is_break]
    num_days = len(config.working_days)
    total_slots_per_week = len(teaching_slots) * num_days

    bottlenecks: List[str] = []
    recommendations: List[str] = []
    detailed_unassigned: List[UnassignedSession] = []

    # 1. Division slot availability analysis
    for div in config.divisions:
        div_blocked_count = len(div.blocked_slots)
        div_available_slots = total_slots_per_week - div_blocked_count
        div_reqs = [r for r in config.requirements if r.division_id == div.id]
        div_required_slots = sum(r.weekly_count * r.duration_slots for r in div_reqs)

        if div_required_slots > div_available_slots:
            b_msg = (
                f"Division '{div.name}' requires {div_required_slots} slots, but only "
                f"{div_available_slots} non-break slots are available after blocked periods ({div_blocked_count} blocked)."
            )
            bottlenecks.append(b_msg)
            recommendations.append(
                f"Reduce blocked slots for '{div.name}' or adjust weekly session counts to be <= {div_available_slots}."
            )

    # 2. Room capacity and type suitability analysis
    for req in config.requirements:
        div = divisions_by_id.get(req.division_id)
        subj = subjects_by_id.get(req.subject_id)
        if not div or not subj:
            continue

        # Check candidate rooms
        suitable_rooms = []
        for rm in config.rooms:
            # Capacity check
            if rm.capacity < div.student_strength:
                continue
            # Lab requirement check
            if req.requires_lab and rm.room_type != RoomType.LAB:
                continue
            # Equipment check
            if not all(eq in rm.equipment for eq in req.required_equipment):
                continue
            suitable_rooms.append(rm)

        if not suitable_rooms:
            b_msg = (
                f"Zero candidate rooms for requirement '{req.id}' ({subj.name} for {div.name}). "
                f"Needs capacity >= {div.student_strength}, type={'LAB' if req.requires_lab else 'CLASSROOM/ANY'}, "
                f"equipment={req.required_equipment}."
            )
            bottlenecks.append(b_msg)
            recommendations.append(
                f"Add or upgrade a room with capacity >= {div.student_strength} and equipment {req.required_equipment}."
            )

    # 3. Faculty qualification and capacity analysis
    for req in config.requirements:
        subj = subjects_by_id.get(req.subject_id)
        if not subj:
            continue

        eligible_faculty = [
            fac for fac in config.faculty
            if req.subject_id in fac.qualified_subject_ids
            and req.session_type in fac.qualified_session_types
        ]

        if not eligible_faculty:
            b_msg = (
                f"Zero qualified faculty for requirement '{req.id}' "
                f"(Subject: {subj.name}, Type: {req.session_type.value})."
            )
            bottlenecks.append(b_msg)
            recommendations.append(
                f"Assign qualification for '{subj.name}' ({req.session_type.value}) to at least one faculty member."
            )

    # 4. Detailed diagnosis per unassigned session
    for req_id, occ_idx in unassigned_items:
        req = requirements_by_id.get(req_id)
        if not req:
            continue
        subj = subjects_by_id.get(req.subject_id)
        div = divisions_by_id.get(req.division_id)
        subj_name = subj.name if subj else req.subject_id
        div_name = div.name if div else req.division_id

        primary_reasons = []
        heuristic_notes = []
        suggestions = []

        # Faculty checks
        eligible_fac = [
            f for f in config.faculty
            if req.subject_id in f.qualified_subject_ids
            and req.session_type in f.qualified_session_types
        ]
        if not eligible_fac:
            primary_reasons.append("VERIFIED: No faculty member is qualified for this subject and session type.")
            suggestions.append(f"Add subject qualification for '{subj_name}' to a faculty profile.")
        else:
            total_fac_capacity = sum(f.max_weekly_sessions for f in eligible_fac)
            if total_fac_capacity < req.duration_slots:
                primary_reasons.append(
                    f"VERIFIED: Eligible faculty have exhausted available weekly teaching limits (sum of limits={total_fac_capacity})."
                )
                suggestions.append("Increase faculty weekly workload limit in configuration.")
            else:
                heuristic_notes.append(
                    f"Faculty qualified ({len(eligible_fac)} found: {', '.join(f.name for f in eligible_fac)}), "
                    "but may be constrained by overlapping assignments or unavailable hours."
                )

        # Room checks
        candidate_rooms = []
        for rm in config.rooms:
            if rm.capacity < (div.student_strength if div else 0):
                continue
            if req.requires_lab and rm.room_type != RoomType.LAB:
                continue
            if not all(eq in rm.equipment for eq in req.required_equipment):
                continue
            candidate_rooms.append(rm)

        if not candidate_rooms:
            primary_reasons.append(
                f"VERIFIED: No room satisfies division strength ({div.student_strength if div else 'N/A'}), "
                f"room type ({'lab' if req.requires_lab else 'classroom'}), and equipment requirements ({req.required_equipment})."
            )
            suggestions.append(f"Allocate a suitable room with capacity >= {div.student_strength if div else 0}.")
        else:
            heuristic_notes.append(
                f"Candidate rooms available ({len(candidate_rooms)} found: {', '.join(r.name for r in candidate_rooms)}), "
                "but all may have been occupied by concurrent sessions."
            )

        # Duration & continuity checks
        if req.duration_slots > 1:
            heuristic_notes.append(
                f"Session requires {req.duration_slots} continuous non-break periods (H12 practical constraint), "
                "which strictly narrows feasible placement windows across the week."
            )
            suggestions.append(
                "Verify that morning or afternoon schedules contain uninterrupted 2-hour blocks free from breaks or blocked periods."
            )

        if not primary_reasons and not suggestions:
            heuristic_notes.append(
                "Probable joint scheduling conflict: simultaneous constraints on faculty availability, "
                "room contention, and division time limits prevented feasible slot assignment."
            )
            suggestions.append("Increase solver time limit in settings or slightly adjust faculty unavailable slots.")

        detailed_unassigned.append(
            UnassignedSession(
                requirement_id=req_id,
                occurrence_index=occ_idx,
                subject_id=req.subject_id,
                subject_name=subj_name,
                division_id=req.division_id,
                division_name=div_name,
                session_type=req.session_type,
                duration_slots=req.duration_slots,
                primary_reasons=primary_reasons,
                heuristic_notes=heuristic_notes,
                actionable_suggestions=suggestions,
            )
        )

    # 5. Resource utilization summary
    resource_utilization = {
        "total_teaching_slots_available": total_slots_per_week,
        "divisions_count": len(config.divisions),
        "faculty_count": len(config.faculty),
        "rooms_count": len(config.rooms),
        "total_required_sessions": sum(r.weekly_count for r in config.requirements),
        "total_scheduled_sessions": len(scheduled_sessions),
        "total_scheduled_hours": sum(s.duration_slots for s in scheduled_sessions),
    }

    if not bottlenecks and not detailed_unassigned:
        overall_assessment = "All resources are sufficient and all constraints were satisfactorily fulfilled."
    elif detailed_unassigned:
        overall_assessment = (
            f"{len(detailed_unassigned)} session(s) could not be assigned. "
            f"Review the primary verified conflicts and heuristic explanations below."
        )
    else:
        overall_assessment = f"Solver returned status {solver_status_str} with resource warnings."

    return DiagnosticReport(
        overall_assessment=overall_assessment,
        has_unassigned=len(detailed_unassigned) > 0,
        bottlenecks_detected=list(dict.fromkeys(bottlenecks)),
        detailed_unassigned=detailed_unassigned,
        resource_utilization=resource_utilization,
        recommendations=list(dict.fromkeys(recommendations)),
    )
