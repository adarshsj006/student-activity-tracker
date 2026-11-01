"""Run with:  python -m pytest   (pip install pytest httpx first)"""
import os
import pytest
from fastapi.testclient import TestClient
import main

@pytest.fixture(autouse=True)
def fresh_db(tmp_path, monkeypatch):
    monkeypatch.setattr(main, "DB_FILE", str(tmp_path / "test.db"))
    main.init_db()

client = TestClient(main.app)

def test_add_and_list():
    r = client.post("/activities", json={"name": "Anjali", "activity": "Football", "hours": 2})
    assert r.status_code == 201
    assert len(client.get("/activities").json()) == 1

def test_validation():
    assert client.post("/activities", json={"name": "", "activity": "x", "hours": 1}).status_code == 422
    assert client.post("/activities", json={"name": "A", "activity": "x", "hours": -1}).status_code == 422
    assert client.post("/activities", json={"name": "A", "activity": "x", "hours": 30}).status_code == 422
    assert client.post("/activities", json={"name": "A", "activity": "x", "hours": "abc"}).status_code == 422

def test_summary():
    client.post("/activities", json={"name": "Anjali", "activity": "A", "hours": 2})
    client.post("/activities", json={"name": "Rahul", "activity": "B", "hours": 1})
    client.post("/activities", json={"name": "anjali", "activity": "C", "hours": 1.5})
    s = client.get("/summary").json()
    assert s == {"total_entries": 3, "total_hours": 4.5, "most_active_user": "Anjali"}

def test_empty_summary():
    assert client.get("/summary").json() == {"total_entries": 0, "total_hours": 0, "most_active_user": None}

def test_delete():
    i = client.post("/activities", json={"name": "A", "activity": "x", "hours": 1}).json()["id"]
    assert client.delete(f"/activities/{i}").status_code == 200
    assert client.delete(f"/activities/{i}").status_code == 404
