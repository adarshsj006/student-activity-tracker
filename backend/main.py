"""Student Activity Tracker - FastAPI backend (SQLite storage)."""
import sqlite3
from contextlib import contextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator

DB_FILE = "activities.db"

app = FastAPI(title="Student Activity Tracker")

# CORS: lets the React dev server (different port) call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Database helpers ----------
@contextmanager
def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    with get_db() as db:
        db.execute(
            """CREATE TABLE IF NOT EXISTS activities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                activity TEXT NOT NULL,
                hours REAL NOT NULL
            )"""
        )


init_db()


# ---------- Request model with validation ----------
class ActivityIn(BaseModel):
    name: str
    activity: str
    hours: float

    @field_validator("name", "activity")
    @classmethod
    def not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("must not be empty")
        return v

    @field_validator("hours")
    @classmethod
    def hours_valid(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("must be greater than 0")
        if v > 24:
            raise ValueError("must not be more than 24")
        return v


# ---------- Routes ----------
@app.post("/activities", status_code=status.HTTP_201_CREATED)
def add_activity(data: ActivityIn):
    with get_db() as db:
        cur = db.execute(
            "INSERT INTO activities (name, activity, hours) VALUES (?, ?, ?)",
            (data.name, data.activity, data.hours),
        )
        new_id = cur.lastrowid
    return {"id": new_id, "name": data.name, "activity": data.activity, "hours": data.hours}


@app.get("/activities")
def get_activities():
    with get_db() as db:
        rows = db.execute("SELECT * FROM activities ORDER BY id DESC").fetchall()
    return [dict(r) for r in rows]


@app.delete("/activities/{activity_id}")
def delete_activity(activity_id: int):
    with get_db() as db:
        cur = db.execute("DELETE FROM activities WHERE id = ?", (activity_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Activity not found")
    return {"message": "Deleted"}


@app.get("/summary")
def get_summary():
    with get_db() as db:
        totals = db.execute(
            "SELECT COUNT(*) AS n, COALESCE(SUM(hours), 0) AS total FROM activities"
        ).fetchone()
        top = db.execute(
            """SELECT name, SUM(hours) AS h FROM activities
               GROUP BY LOWER(name) ORDER BY h DESC LIMIT 1"""
        ).fetchone()
    return {
        "total_entries": totals["n"],
        "total_hours": round(totals["total"], 2),
        "most_active_user": top["name"] if top else None,
    }
