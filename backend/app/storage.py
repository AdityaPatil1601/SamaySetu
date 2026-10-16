import json
import os
from typing import Optional
from app.models import TimetableConfig, TimetableResult, DiagnosticReport
from app.defaults import get_default_timetable_config

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
CONFIG_FILE = os.path.join(DATA_DIR, "config.json")
TIMETABLE_FILE = os.path.join(DATA_DIR, "timetable.json")
DIAGNOSTICS_FILE = os.path.join(DATA_DIR, "diagnostics.json")


def ensure_data_dir():
    os.makedirs(DATA_DIR, exist_ok=True)


def load_config() -> TimetableConfig:
    ensure_data_dir()
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            return TimetableConfig.model_validate(data)
        except Exception:
            pass
    # Fallback to default
    default_cfg = get_default_timetable_config()
    save_config(default_cfg)
    return default_cfg


def save_config(config: TimetableConfig) -> None:
    ensure_data_dir()
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(config.model_dump(), f, indent=2)


def load_timetable() -> Optional[TimetableResult]:
    ensure_data_dir()
    if os.path.exists(TIMETABLE_FILE):
        try:
            with open(TIMETABLE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            return TimetableResult.model_validate(data)
        except Exception:
            return None
    return None


def save_timetable(result: TimetableResult) -> None:
    ensure_data_dir()
    with open(TIMETABLE_FILE, "w", encoding="utf-8") as f:
        json.dump(result.model_dump(), f, indent=2)


def load_diagnostics() -> Optional[DiagnosticReport]:
    ensure_data_dir()
    if os.path.exists(DIAGNOSTICS_FILE):
        try:
            with open(DIAGNOSTICS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            return DiagnosticReport.model_validate(data)
        except Exception:
            return None
    return None


def save_diagnostics(diagnostics: DiagnosticReport) -> None:
    ensure_data_dir()
    with open(DIAGNOSTICS_FILE, "w", encoding="utf-8") as f:
        json.dump(diagnostics.model_dump(), f, indent=2)
