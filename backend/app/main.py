import sys
import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.models import (
    TimetableConfig,
    TimetableResult,
    ValidationReport,
    DiagnosticReport,
    ScheduledSession,
    SolverStatus,
)
from app.solver import TimetableSolver
from app.validator import validate_timetable
from app.defaults import get_default_timetable_config
from app.storage import (
    load_config,
    save_config,
    load_timetable,
    save_timetable,
    load_diagnostics,
    save_diagnostics,
)

app = FastAPI(
    title="CampusFlow — Automatic Timetable Generation API",
    description="Constraint optimization engine powered by Google OR-Tools CP-SAT and independent validator",
    version="1.0.0",
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ValidatePayload(BaseModel):
    config: TimetableConfig
    sessions: List[ScheduledSession]


@app.get("/")
def root():
    return {
        "service": "CampusFlow Automatic Timetable Generator",
        "status": "online",
        "engine": "Google OR-Tools CP-SAT",
        "version": "1.0.0",
    }


@app.get("/api/timetable/config/default", response_model=TimetableConfig)
def get_default_config():
    """Retrieve realistic default academic scheduling data."""
    return get_default_timetable_config()


@app.get("/api/timetable/config", response_model=TimetableConfig)
def get_config():
    """Retrieve saved academic configuration."""
    return load_config()


@app.post("/api/timetable/config", response_model=TimetableConfig)
def update_config(config: TimetableConfig = Body(...)):
    """Save/update academic scheduling configuration."""
    save_config(config)
    return config


@app.post("/api/timetable/generate", response_model=TimetableResult)
def generate_timetable(config: Optional[TimetableConfig] = Body(None)):
    """
    Generate timetable using Google OR-Tools CP-SAT constraint optimization solver.
    If generation succeeds or yields a feasible partial, save and return.
    If generation fails (e.g., error/exception), preserve previously saved timetable.
    """
    active_config = config if config is not None else load_config()
    
    # Save active config so it persists
    save_config(active_config)

    # Load previously saved timetable for safety
    previous_timetable = load_timetable()

    try:
        solver = TimetableSolver(active_config)
        result = solver.solve()

        # If solver produced sessions, update persistence
        if result.sessions:
            save_timetable(result)
        elif previous_timetable is not None and result.status == SolverStatus.INFEASIBLE:
            # Preserve previously saved timetable on complete failure, but still report current infeasibility
            pass

        if result.diagnostics:
            save_diagnostics(result.diagnostics)

        return result
    except Exception as e:
        # Generation failed: preserve previously saved timetable
        raise HTTPException(
            status_code=500,
            detail=f"Solver execution failed: {str(e)}. Previous timetable was preserved.",
        )


@app.post("/api/timetable/validate", response_model=ValidationReport)
def validate_schedule(payload: ValidatePayload = Body(...)):
    """
    Independent validation service that checks any provided schedule
    against all mandatory constraints H1-H13 without relying on the solver.
    """
    report = validate_timetable(payload.config, payload.sessions)
    return report


@app.get("/api/timetable/current", response_model=Optional[TimetableResult])
def get_current_timetable():
    """Retrieve the last generated timetable."""
    result = load_timetable()
    if not result:
        # If no timetable exists yet, return None or 404
        return None
    return result


@app.get("/api/timetable/diagnostics", response_model=Optional[DiagnosticReport])
def get_current_diagnostics():
    """Retrieve the latest diagnostic report."""
    return load_diagnostics()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
