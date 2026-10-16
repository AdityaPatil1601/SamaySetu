import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models import TimetableConfig

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "Google OR-Tools" in data["engine"]


def test_get_default_config():
    response = client.get("/api/timetable/config/default")
    assert response.status_code == 200
    cfg = response.json()
    assert cfg["academic_year"] == "2026-2027"
    assert len(cfg["divisions"]) == 2
    assert len(cfg["faculty"]) >= 5
    assert len(cfg["rooms"]) >= 4


def test_get_and_update_config():
    # Update config
    default_resp = client.get("/api/timetable/config/default")
    cfg = default_resp.json()
    cfg["academic_year"] = "2027-2028"

    update_resp = client.post("/api/timetable/config", json=cfg)
    assert update_resp.status_code == 200
    assert update_resp.json()["academic_year"] == "2027-2028"

    # Verify persistence
    get_resp = client.get("/api/timetable/config")
    assert get_resp.status_code == 200
    assert get_resp.json()["academic_year"] == "2027-2028"


def test_generate_and_current_endpoints():
    default_resp = client.get("/api/timetable/config/default")
    cfg = default_resp.json()
    # Use smaller requirement set for fast API integration test
    cfg["requirements"] = cfg["requirements"][:4]

    gen_resp = client.post("/api/timetable/generate", json=cfg)
    assert gen_resp.status_code == 200
    res = gen_resp.json()
    assert res["status"] in ("OPTIMAL", "FEASIBLE")
    assert res["scheduled_sessions_count"] > 0
    assert len(res["sessions"]) > 0

    # Retrieve current
    cur_resp = client.get("/api/timetable/current")
    assert cur_resp.status_code == 200
    cur_data = cur_resp.json()
    assert cur_data is not None
    assert cur_data["scheduled_sessions_count"] == res["scheduled_sessions_count"]


def test_independent_validation_endpoint():
    default_resp = client.get("/api/timetable/config/default")
    cfg = default_resp.json()
    cfg["requirements"] = cfg["requirements"][:2]

    # Generate small timetable
    gen_resp = client.post("/api/timetable/generate", json=cfg)
    timetable_data = gen_resp.json()

    # Call independent validation endpoint
    val_resp = client.post(
        "/api/timetable/validate",
        json={"config": cfg, "sessions": timetable_data["sessions"]},
    )
    assert val_resp.status_code == 200
    val_report = val_resp.json()
    assert val_report["is_valid"] is True
    assert val_report["hard_violations_count"] == 0
    assert "H1_DIVISION_OVERLAP" in val_report["checked_rules"]
