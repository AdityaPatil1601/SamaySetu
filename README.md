# CampusFlow — Automatic Timetable Generation Engine

> Smart College Timetable Management System with constraint optimization powered by **Google OR-Tools CP-SAT** and an independent multi-rule validation service.

---

## 1. Feature Architecture & Scope

This implementation strictly implements the **Automatic Timetable Generation feature**:
- **Constraint Optimization Engine**: Modeled in Python using `ortools.sat.python.cp_model` with exact integer programming formulation.
- **Independent Validation Service**: Standalone validator that audits generated timetables against all mandatory hard constraints (H1–H13) independently of the solver.
- **Diagnostic Engine**: Infeasibility and bottleneck analysis isolating verified resource shortages from heuristic contention factors and outputting actionable recommendations.
- **REST Backend Integration**: FastAPI service with CORS, Pydantic schemas, persistent JSON/file storage, and error recovery preserving previous valid timetables upon failures.
- **Frontend Interface**: Focused, responsive React + TypeScript interface matching the specified pastel aesthetic (light lavender/pale blue-gray background `#f2f4fa`, white rounded panels, dark typography, pastel purple for theory, pastel green for labs, pastel yellow for breaks, and pastel rose for alerts).

---

## 2. Mandatory Hard Constraints Enforced (H1 – H13)

| Constraint ID | Description | Solver Enforcement | Validator Enforcement |
|---|---|---|---|
| **H1** | **Division Overlap Prevention** | Division can have $\le 1$ session at any given `(day, slot)`. | Audits division occupancy map across all days/slots. |
| **H2** | **Faculty Overlap Prevention** | Faculty member can teach $\le 1$ session simultaneously. | Checks faculty occupancy map for concurrent allocations. |
| **H3** | **Room Overlap Prevention** | Room can host $\le 1$ session at any given `(day, slot)`. | Verifies physical room occupancy conflicts. |
| **H4** | **Faculty Eligibility** | Faculty must be qualified for the assigned subject and session type (Theory / Practical / Tutorial). | Checks subject ID and session type against faculty's qualification rosters. |
| **H5** | **Room Capacity** | Room capacity must accommodate division's student strength. | Asserts `room.capacity >= division.student_strength`. |
| **H6** | **Room Type & Equipment** | Practicals requiring labs must be scheduled in a Lab with required hardware/software equipment. | Asserts `room.room_type == LAB` and all required equipment are subsets of room equipment. |
| **H7** | **Faculty Availability** | Faculty unavailable slots are strictly respected. | Validates session slots against faculty's unavailable slots. |
| **H8** | **Room Availability** | Scheduled room unavailable periods are strictly respected. | Checks session slots against room maintenance/unavailable slots. |
| **H9** | **Division Availability** | Division blocked periods (assemblies, sports, mentorship) are respected. | Checks session slots against division's blocked slots. |
| **H10** | **Session Duration & Breaks** | Multi-slot sessions cannot cross break periods or exceed working hours. | Verifies all constituent slots are non-break teaching periods within bounds. |
| **H11** | **Weekly Session Counts** | Required weekly occurrences per subject/type must be fulfilled for a complete schedule. | Audits scheduled count vs required weekly count for all curriculum requirements. |
| **H12** | **Practical Continuity** | Practical sessions requiring consecutive slots must occupy contiguous time slots on the same day with the same faculty in the same room. | Validates contiguous slot sequence `slots[i+1] == slots[i] + 1` with invariant faculty and room. |
| **H13** | **Faculty Workload Limits** | Configured daily and weekly maximum teaching hours cannot be exceeded. | Verifies daily slots $\le$ `max_daily_sessions` and weekly slots $\le$ `max_weekly_sessions`. |

---

## 3. Soft Optimization Objectives

Configurable weights allow balancing academic quality without weakening hard constraints:
- **Fewer Gaps**: Penalizes idle periods between classes for student divisions.
- **Subject Spread**: Spreads lectures of the same subject across different weekdays instead of clustering them on a single day.
- **Faculty Preferences**: Rewards assigning faculty to their preferred time slots and subjects.
- **Room Efficiency**: Favors optimal room capacity utilization (avoiding assigning 120-capacity seminar halls to 50-student divisions when 65-capacity classrooms are free).

---

## 4. How to Run the Application

### Prerequisites
- Python 3.10+ (Installed: Python 3.13)
- Node.js 18+ (Installed: Node.js v24.14)

### Step 1: Start Backend
```bash
# In the project root:
python run_backend.py
```
*The FastAPI backend will start on `http://127.0.0.1:8000` (interactive API docs available at `http://127.0.0.1:8000/docs`).*

### Step 2: Start Frontend
```bash
# In another terminal:
cd frontend
npm run dev
```
*The React frontend will be accessible at `http://localhost:5173`.*

---

## 5. Automated Test Suite (19 Passed)

Run the full automated test suite with pytest:
```bash
python -m pytest backend/tests/ -v
```

### Verified Test Cases:
1. `test_01_successful_timetable_generation_real_data`: Verifies successful generation from real academic data with 100% fulfillment and 0 violations.
2. `test_02_faculty_overlap_prevention`: Proves solver and validator prevent and catch simultaneous faculty bookings.
3. `test_03_room_overlap_prevention`: Proves solver and validator prevent and catch simultaneous room bookings.
4. `test_04_division_overlap_prevention`: Proves solver and validator prevent and catch simultaneous division bookings.
5. `test_05_faculty_eligibility`: Proves unqualified faculty are never assigned and flags violations if manually injected.
6. `test_06_room_capacity_and_suitability`: Verifies capacity and room equipment suitability checks.
7. `test_07_availability_constraints`: Verifies faculty, room, and division unavailable/blocked slots are respected.
8. `test_08_continuous_practical_sessions`: Verifies practical sessions remain continuous without interruption.
9. `test_09_weekly_session_counts`: Verifies exact matching of weekly session requirements.
10. `test_10_insufficient_resource_scenarios`: Tests behavior when lab resources are constrained, producing partial schedule with diagnostic cause analysis.
11. `test_11_infeasible_configurations`: Proves strict `allow_partial=False` detects unsatisfiable problems and returns `INFEASIBLE`.
12. `test_12_solver_timeouts`: Verifies clean termination and reporting when time limits expire.
13. `test_13_validator_detects_corrupted_output`: Verifies validator detects multi-category corrupted schedules.
14. `test_14_updated_configuration_used_during_regeneration`: Verifies config mutations dynamically alter solver decisions on re-generation.
15. `test_root_endpoint`, `test_get_default_config`, `test_get_and_update_config`, `test_generate_and_current_endpoints`, `test_independent_validation_endpoint`: Full API integration suite.
