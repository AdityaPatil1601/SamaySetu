import time
from typing import List, Dict, Tuple, Optional, Any, Set
from ortools.sat.python import cp_model

from app.models import (
    TimetableConfig,
    ScheduledSession,
    TimetableResult,
    SolverStatus,
    UnassignedSession,
    SessionType,
    RoomType,
)
from app.validator import validate_timetable
from app.diagnostics import generate_diagnostic_report


class TimetableSolver:
    def __init__(self, config: TimetableConfig):
        self.config = config
        self.divisions_by_id = {d.id: d for d in config.divisions}
        self.faculty_by_id = {f.id: f for f in config.faculty}
        self.rooms_by_id = {r.id: r for r in config.rooms}
        self.subjects_by_id = {s.id: s for s in config.subjects}
        self.requirements_by_id = {r.id: r for r in config.requirements}
        self.time_slots_by_index = {ts.slot_index: ts for ts in config.time_slots}
        self.break_indices = {ts.slot_index for ts in config.time_slots if ts.is_break}

    def solve(self) -> TimetableResult:
        start_time = time.time()
        model = cp_model.CpModel()

        # Build list of discrete session instances to schedule: (req_id, occurrence_index)
        session_instances: List[Tuple[str, int, int]] = []  # (req_id, occ_idx, duration)
        for req in self.config.requirements:
            for k in range(req.weekly_count):
                session_instances.append((req.id, k, req.duration_slots))

        total_required_sessions = len(session_instances)

        # Decision variables:
        # x[(req_id, occ_idx, day, start_slot, fac_id, room_id)] -> bool
        x: Dict[Tuple[str, int, str, int, str, str], cp_model.IntVar] = {}
        # assigned[(req_id, occ_idx)] -> bool
        assigned: Dict[Tuple[str, int], cp_model.IntVar] = {}

        # Candidate mapping for each session instance
        candidates_per_instance: Dict[Tuple[str, int], List[Tuple[str, int, str, str]]] = {}

        for req_id, occ_idx, duration in session_instances:
            inst_key = (req_id, occ_idx)
            req = self.requirements_by_id[req_id]
            div = self.divisions_by_id.get(req.division_id)
            subj = self.subjects_by_id.get(req.subject_id)
            if not div or not subj:
                continue

            candidates = []

            # 1. Candidate Faculty (H4: Faculty must be qualified for subject & session type)
            eligible_faculty = [
                f for f in self.config.faculty
                if req.subject_id in f.qualified_subject_ids
                and req.session_type in f.qualified_session_types
            ]
            if req.preferred_faculty_ids:
                # Keep all eligible, but we can prioritize preferred faculty in soft weights
                pass

            # 2. Candidate Rooms (H5: Room capacity >= student strength, H6: Room type and equipment)
            eligible_rooms = []
            for r in self.config.rooms:
                if r.capacity < div.student_strength:
                    continue
                if req.requires_lab and r.room_type != RoomType.LAB:
                    continue
                if not all(eq in r.equipment for eq in req.required_equipment):
                    continue
                eligible_rooms.append(r)

            # 3. Candidate Days and Start Slots (H9: Division unblocked, H10: Session duration & Breaks, H12: Continuous)
            div_blocked = {(b.day, b.slot_index) for b in div.blocked_slots}

            for day in self.config.working_days:
                for start_slot in range(len(self.config.time_slots) - duration + 1):
                    slots_span = list(range(start_slot, start_slot + duration))

                    # Must not span across any break (H10)
                    if any(s in self.break_indices for s in slots_span):
                        continue

                    # Must not fall on division's blocked periods (H9)
                    if any((day, s) in div_blocked for s in slots_span):
                        continue

                    for fac in eligible_faculty:
                        fac_unavail = {(u.day, u.slot_index) for u in fac.unavailable_slots}
                        # H7: Faculty availability
                        if any((day, s) in fac_unavail for s in slots_span):
                            continue

                        for rm in eligible_rooms:
                            rm_unavail = {(u.day, u.slot_index) for u in rm.unavailable_slots}
                            # H8: Room availability
                            if any((day, s) in rm_unavail for s in slots_span):
                                continue

                            candidates.append((day, start_slot, fac.id, rm.id))

            candidates_per_instance[inst_key] = candidates

            # Create assigned variable
            assigned_var = model.NewBoolVar(f"assigned_{req_id}_{occ_idx}")
            assigned[inst_key] = assigned_var

            # Create placement variables for this instance
            inst_vars = []
            for day, start_slot, fac_id, rm_id in candidates:
                var = model.NewBoolVar(f"x_{req_id}_{occ_idx}_{day}_{start_slot}_{fac_id}_{rm_id}")
                x[(req_id, occ_idx, day, start_slot, fac_id, rm_id)] = var
                inst_vars.append(var)

            # Assignment constraint: exactly 1 placement if assigned, 0 if unassigned
            model.Add(sum(inst_vars) == assigned_var)

        # -------------------------------------------------------------
        # MANDATORY HARD CONSTRAINTS
        # -------------------------------------------------------------

        # H1: Division cannot have two sessions at the same time
        for div in self.config.divisions:
            for day in self.config.working_days:
                for slot in range(len(self.config.time_slots)):
                    if slot in self.break_indices:
                        continue
                    active_vars_at_slot = []
                    for (req_id, occ_idx, duration) in session_instances:
                        req = self.requirements_by_id[req_id]
                        if req.division_id != div.id:
                            continue
                        for (c_day, start_slot, fac_id, rm_id) in candidates_per_instance.get((req_id, occ_idx), []):
                            if c_day == day and start_slot <= slot < start_slot + duration:
                                active_vars_at_slot.append(x[(req_id, occ_idx, day, start_slot, fac_id, rm_id)])
                    if active_vars_at_slot:
                        model.Add(sum(active_vars_at_slot) <= 1)

        # H2: Faculty cannot teach two sessions simultaneously
        for fac in self.config.faculty:
            for day in self.config.working_days:
                for slot in range(len(self.config.time_slots)):
                    if slot in self.break_indices:
                        continue
                    fac_vars_at_slot = []
                    for (req_id, occ_idx, duration) in session_instances:
                        for (c_day, start_slot, f_id, rm_id) in candidates_per_instance.get((req_id, occ_idx), []):
                            if f_id == fac.id and c_day == day and start_slot <= slot < start_slot + duration:
                                fac_vars_at_slot.append(x[(req_id, occ_idx, day, start_slot, f_id, rm_id)])
                    if fac_vars_at_slot:
                        model.Add(sum(fac_vars_at_slot) <= 1)

        # H3: Room cannot host multiple sessions simultaneously
        for rm in self.config.rooms:
            for day in self.config.working_days:
                for slot in range(len(self.config.time_slots)):
                    if slot in self.break_indices:
                        continue
                    room_vars_at_slot = []
                    for (req_id, occ_idx, duration) in session_instances:
                        for (c_day, start_slot, f_id, r_id) in candidates_per_instance.get((req_id, occ_idx), []):
                            if r_id == rm.id and c_day == day and start_slot <= slot < start_slot + duration:
                                room_vars_at_slot.append(x[(req_id, occ_idx, day, start_slot, f_id, r_id)])
                    if room_vars_at_slot:
                        model.Add(sum(room_vars_at_slot) <= 1)

        # H13: Faculty daily and weekly workload limits
        for fac in self.config.faculty:
            all_fac_slots = []
            for day in self.config.working_days:
                daily_slots = []
                for (req_id, occ_idx, duration) in session_instances:
                    for (c_day, start_slot, f_id, rm_id) in candidates_per_instance.get((req_id, occ_idx), []):
                        if f_id == fac.id and c_day == day:
                            daily_slots.append(duration * x[(req_id, occ_idx, day, start_slot, f_id, rm_id)])
                if daily_slots:
                    model.Add(sum(daily_slots) <= fac.max_daily_sessions)
                    all_fac_slots.extend(daily_slots)
            if all_fac_slots:
                model.Add(sum(all_fac_slots) <= fac.max_weekly_sessions)

        # H11: If allow_partial is False, all sessions MUST be assigned
        if not self.config.allow_partial:
            for inst_key in assigned:
                model.Add(assigned[inst_key] == 1)

        # -------------------------------------------------------------
        # SOFT OPTIMIZATION OBJECTIVES
        # -------------------------------------------------------------
        obj_terms = []

        # Objective 1: Primary goal - Maximize assigned session hours
        # Massive coefficient ensures hard assignment is never sacrificed for soft preferences
        ASSIGNMENT_WEIGHT = 50000
        for (req_id, occ_idx, duration) in session_instances:
            inst_key = (req_id, occ_idx)
            if inst_key in assigned:
                obj_terms.append(ASSIGNMENT_WEIGHT * duration * assigned[inst_key])

        # Objective 2: Subject distribution across the week (Spread subject lectures across different days)
        # Penalize having >= 2 lectures of the same subject for the same division on the same day
        weights = self.config.weights
        if weights.subject_spread_weight > 0:
            for div in self.config.divisions:
                for subj in self.config.subjects:
                    for day in self.config.working_days:
                        day_subj_vars = []
                        for (req_id, occ_idx, duration) in session_instances:
                            req = self.requirements_by_id[req_id]
                            if req.division_id == div.id and req.subject_id == subj.id and req.session_type == SessionType.THEORY:
                                for (c_day, start_slot, f_id, rm_id) in candidates_per_instance.get((req_id, occ_idx), []):
                                    if c_day == day:
                                        day_subj_vars.append(x[(req_id, occ_idx, day, start_slot, f_id, rm_id)])
                        if len(day_subj_vars) > 1:
                            excess = model.NewIntVar(0, len(day_subj_vars), f"excess_{div.id}_{subj.id}_{day}")
                            model.Add(sum(day_subj_vars) - 1 <= excess)
                            obj_terms.append(-1 * weights.subject_spread_weight * 100 * excess)

        # Objective 3: Preferred faculty slots & preferred faculty assignment
        if weights.preference_weight > 0:
            for (req_id, occ_idx, duration) in session_instances:
                req = self.requirements_by_id[req_id]
                for (c_day, start_slot, f_id, rm_id) in candidates_per_instance.get((req_id, occ_idx), []):
                    fac = self.faculty_by_id.get(f_id)
                    var = x[(req_id, occ_idx, c_day, start_slot, f_id, rm_id)]
                    bonus = 0

                    # Reward preferred faculty if requested in requirement
                    if req.preferred_faculty_ids and f_id in req.preferred_faculty_ids:
                        bonus += 50

                    # Reward faculty preferred slots
                    if fac and any(p.day == c_day and p.slot_index == start_slot for p in fac.preferred_slots):
                        bonus += 30

                    if bonus > 0:
                        obj_terms.append(weights.preference_weight * bonus * var)

        # Objective 4: Room suitability & efficiency preference
        if weights.room_efficiency_weight > 0:
            for (req_id, occ_idx, duration) in session_instances:
                req = self.requirements_by_id[req_id]
                subj = self.subjects_by_id.get(req.subject_id)
                div = self.divisions_by_id.get(req.division_id)
                for (c_day, start_slot, f_id, rm_id) in candidates_per_instance.get((req_id, occ_idx), []):
                    rm = self.rooms_by_id.get(rm_id)
                    var = x[(req_id, occ_idx, c_day, start_slot, f_id, rm_id)]
                    bonus = 0
                    if rm and subj and rm.room_type in subj.preferred_room_types:
                        bonus += 20
                    # Reward better capacity fit (don't waste 120-seat seminar hall for 50-student class)
                    if rm and div:
                        diff = rm.capacity - div.student_strength
                        if 0 <= diff <= 15:
                            bonus += 15
                    if bonus > 0:
                        obj_terms.append(weights.room_efficiency_weight * bonus * var)

        # Objective 5: Reduce gaps in division schedules (fewer unnecessary idle slots)
        if weights.gap_weight > 0:
            # Reward consecutive slots or penalize isolated slots
            # For each division, day, reward adjacent active slots
            for div in self.config.divisions:
                for day in self.config.working_days:
                    for s in range(len(self.config.time_slots) - 1):
                        if s in self.break_indices or (s + 1) in self.break_indices:
                            continue
                        # Slot s active var
                        s_vars = []
                        s1_vars = []
                        for (req_id, occ_idx, duration) in session_instances:
                            req = self.requirements_by_id[req_id]
                            if req.division_id != div.id:
                                continue
                            for (c_day, start_slot, f_id, rm_id) in candidates_per_instance.get((req_id, occ_idx), []):
                                if c_day == day:
                                    if start_slot <= s < start_slot + duration:
                                        s_vars.append(x[(req_id, occ_idx, day, start_slot, f_id, rm_id)])
                                    if start_slot <= (s + 1) < start_slot + duration:
                                        s1_vars.append(x[(req_id, occ_idx, day, start_slot, f_id, rm_id)])

                        if s_vars and s1_vars:
                            # Both active together is good!
                            # s_act is sum(s_vars), s1_act is sum(s1_vars)
                            # Reward both being active together
                            pass

        model.Maximize(sum(obj_terms))

        # Search strategy: Prioritize making sure sessions are assigned
        all_assigned_vars = [assigned[k] for k in assigned]
        if all_assigned_vars:
            model.AddDecisionStrategy(
                all_assigned_vars,
                cp_model.CHOOSE_FIRST,
                cp_model.SELECT_MAX_VALUE,
            )

        # Solve model
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = float(self.config.solver_time_limit)
        solver.parameters.num_workers = 4  # multithreaded solving

        solver_status = solver.Solve(model)
        elapsed_time = round(time.time() - start_time, 3)

        # Interpret status
        scheduled_sessions: List[ScheduledSession] = []
        unassigned_items: List[Tuple[str, int]] = []

        if solver_status == cp_model.OPTIMAL:
            final_status = SolverStatus.OPTIMAL
        elif solver_status == cp_model.FEASIBLE:
            final_status = SolverStatus.FEASIBLE
        elif solver_status == cp_model.INFEASIBLE:
            final_status = SolverStatus.INFEASIBLE
        else:
            final_status = SolverStatus.TIMEOUT

        # Extract scheduled sessions if a solution exists
        if solver_status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            for (req_id, occ_idx, duration) in session_instances:
                inst_key = (req_id, occ_idx)
                is_assigned = (solver.Value(assigned[inst_key]) == 1)

                if is_assigned:
                    for (c_day, start_slot, f_id, rm_id) in candidates_per_instance.get(inst_key, []):
                        var = x[(req_id, occ_idx, c_day, start_slot, f_id, rm_id)]
                        if solver.Value(var) == 1:
                            req = self.requirements_by_id[req_id]
                            subj = self.subjects_by_id[req.subject_id]
                            div = self.divisions_by_id[req.division_id]
                            fac = self.faculty_by_id[f_id]
                            rm = self.rooms_by_id[rm_id]

                            slots_span = list(range(start_slot, start_slot + duration))
                            start_time_label = self.time_slots_by_index[start_slot].start_time
                            end_time_label = self.time_slots_by_index[start_slot + duration - 1].end_time

                            scheduled_sessions.append(
                                ScheduledSession(
                                    session_id=f"SESS_{div.id}_{subj.code}_{c_day}_{start_slot}_{occ_idx}",
                                    requirement_id=req_id,
                                    subject_id=subj.id,
                                    subject_name=subj.name,
                                    subject_code=subj.code,
                                    division_id=div.id,
                                    division_name=div.name,
                                    faculty_id=fac.id,
                                    faculty_name=fac.name,
                                    room_id=rm.id,
                                    room_name=rm.name,
                                    session_type=req.session_type,
                                    day=c_day,
                                    start_slot_index=start_slot,
                                    duration_slots=duration,
                                    slots=slots_span,
                                    start_time=start_time_label,
                                    end_time=end_time_label,
                                )
                            )
                            break
                else:
                    unassigned_items.append((req_id, occ_idx))
        else:
            # INFEASIBLE or TIMEOUT without solution
            for (req_id, occ_idx, duration) in session_instances:
                unassigned_items.append((req_id, occ_idx))

        # Check if partial
        if unassigned_items and scheduled_sessions:
            final_status = SolverStatus.PARTIAL

        # Independent validation
        validation_report = validate_timetable(
            self.config,
            scheduled_sessions,
            expected_requirements=(len(unassigned_items) == 0),
        )

        # Diagnostics
        diagnostic_report = generate_diagnostic_report(
            self.config,
            unassigned_items,
            scheduled_sessions,
            final_status.value,
        )

        return TimetableResult(
            status=final_status,
            execution_time_seconds=elapsed_time,
            total_required_sessions=total_required_sessions,
            scheduled_sessions_count=len(scheduled_sessions),
            unassigned_sessions_count=len(unassigned_items),
            sessions=scheduled_sessions,
            unassigned_sessions=diagnostic_report.detailed_unassigned,
            validation=validation_report,
            diagnostics=diagnostic_report,
            generated_at=time.strftime("%Y-%m-%d %H:%M:%S"),
        )
