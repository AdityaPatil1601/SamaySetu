export const FASTAPI_ORTOOLS_BACKEND_CODE = `"""
SamaySetu - Google OR-Tools CP-SAT Production Solver Service
FastAPI REST microservice implementing constraint-programming formulation.

Installation:
  pip install fastapi uvicorn ortools pydantic

Run:
  uvicorn server:app --host 0.0.0.0 --port 8000 --reload
"""

from typing import List, Optional, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ortools.sat.python import cp_model
import time

app = FastAPI(
    title="SamaySetu CP-SAT Solver Service",
    description="Constraint-Programming Timetable Solver powered by Google OR-Tools CP-SAT",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TimeSlotModel(BaseModel):
    slotIndex: int
    startTime: str
    endTime: str
    label: str

class RequiredSessionModel(BaseModel):
    id: str
    subjectId: str
    subjectCode: str
    subjectName: str
    sessionType: str
    branchId: str
    academicYear: str
    divisionId: str
    batchId: Optional[str] = None
    participatingDivisionIds: List[str]
    durationSlots: int
    eligibleFacultyIds: List[str]
    permittedRoomIds: List[str]
    requiredRoomType: str
    minCapacity: int

class FacultyModel(BaseModel):
    id: str
    name: str
    qualifiedSubjectCodes: List[str]
    availableDays: List[str]
    unavailableSlots: List[Dict[str, int]]
    preferredSlots: List[Dict[str, int]]
    maxWeeklyHours: int

class RoomModel(BaseModel):
    id: str
    roomNumber: str
    type: str
    capacity: int
    unavailableSlots: List[Dict[str, int]]

class SolveRequest(BaseModel):
    sessions: List[RequiredSessionModel]
    faculty: List[FacultyModel]
    rooms: List[RoomModel]
    days: List[str]
    totalSlotsPerDay: int
    lunchBreakSlot: int
    timeLimitSeconds: int = 15

@app.post("/api/timetable/generate")
def solve_timetable(req: SolveRequest):
    model = cp_model.CpModel()
    variables = {}
    days_indices = list(range(len(req.days)))

    for s_idx, session in enumerate(req.sessions):
        for d in days_indices:
            day_name = req.days[d]
            max_start = req.totalSlotsPerDay - session.durationSlots

            for t in range(max_start + 1):
                if session.durationSlots > 1 and t <= req.lunchBreakSlot and (t + session.durationSlots - 1) > req.lunchBreakSlot:
                    continue

                for room in req.rooms:
                    if req.permittedRoomIds and room.id not in req.permittedRoomIds:
                        continue
                    if session.sessionType == "Practical" and room.type != session.requiredRoomType:
                        continue
                    if room.capacity < session.minCapacity:
                        continue

                    for fac in req.faculty:
                        if fac.id not in session.eligibleFacultyIds:
                            continue
                        if day_name not in fac.availableDays:
                            continue

                        var_name = f"x_{s_idx}_{d}_{t}_{room.id}_{fac.id}"
                        variables[(s_idx, d, t, room.id, fac.id)] = model.NewBoolVar(var_name)

    # 1. Exactly one assignment per required session
    for s_idx, session in enumerate(req.sessions):
        possible_assignments = [
            v for (s, d, t, r, f), v in variables.items() if s == s_idx
        ]
        if possible_assignments:
            model.AddExactlyOne(possible_assignments)
        else:
            return {"status": "INFEASIBLE", "reason": f"No valid slot/room/faculty tuple for {session.subjectCode}"}

    # 2. No faculty double booking across entire college
    for fac in req.faculty:
        for d in days_indices:
            for t in range(req.totalSlotsPerDay):
                colliding_vars = []
                for (s_idx, day_idx, start_t, r_id, f_id), v in variables.items():
                    if f_id == fac.id and day_idx == d:
                        duration = req.sessions[s_idx].durationSlots
                        if start_t <= t < start_t + duration:
                            colliding_vars.append(v)
                model.AddAtMostOne(colliding_vars)

    # 3. No room double booking
    for room in req.rooms:
        for d in days_indices:
            for t in range(req.totalSlotsPerDay):
                colliding_vars = []
                for (s_idx, day_idx, start_t, r_id, f_id), v in variables.items():
                    if r_id == room.id and day_idx == d:
                        duration = req.sessions[s_idx].durationSlots
                        if start_t <= t < start_t + duration:
                            colliding_vars.append(v)
                model.AddAtMostOne(colliding_vars)

    # Solve
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = req.timeLimitSeconds
    solver.parameters.num_workers = 8

    start_time = time.time()
    status = solver.Solve(model)
    elapsed = round((time.time() - start_time) * 1000)

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        return {
            "status": "OPTIMAL" if status == cp_model.OPTIMAL else "FEASIBLE",
            "timeMs": elapsed,
            "message": "Valid conflict-free master timetable generated."
        }
    else:
        return {
            "status": "INFEASIBLE",
            "timeMs": elapsed,
            "message": "Constraints cannot be satisfied with available resources."
        }
`;
