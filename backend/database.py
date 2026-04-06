from __future__ import annotations

import json
import os
import sqlite3
from datetime import datetime, timezone
from typing import Any

DB_PATH = os.getenv("INTERVIEW_DB_PATH", "interviews.db")


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _ensure_column(cursor: sqlite3.Cursor, name: str, definition: str) -> None:
    cursor.execute("PRAGMA table_info(sessions)")
    columns = {row[1] for row in cursor.fetchall()}
    if name not in columns:
        cursor.execute(f"ALTER TABLE sessions ADD COLUMN {name} {definition}")


def init_db() -> None:
    with _connect() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                question_type TEXT DEFAULT 'Mixed',
                overall_score REAL NOT NULL,
                questions TEXT NOT NULL,
                answers TEXT NOT NULL,
                scores TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        _ensure_column(cursor, "question_type", "TEXT DEFAULT 'Mixed'")
        conn.commit()


def save_session(
    name: str,
    role: str,
    difficulty: str,
    question_type: str,
    overall_score: float,
    questions: list[str],
    answers: list[str],
    scores: list[float],
) -> int:
    with _connect() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO sessions (
                name, role, difficulty, question_type, overall_score,
                questions, answers, scores, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                name,
                role,
                difficulty,
                question_type,
                overall_score,
                json.dumps(questions),
                json.dumps(answers),
                json.dumps(scores),
                datetime.now(timezone.utc).isoformat(),
            ),
        )
        conn.commit()
        return int(cursor.lastrowid)


def get_history(name: str, limit: int = 20) -> list[dict[str, Any]]:
    if not name.strip():
        return []

    with _connect() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, name, role, difficulty, question_type, overall_score, created_at
            FROM sessions
            WHERE name = ?
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (name.strip(), limit),
        )
        rows = cursor.fetchall()

    return [dict(row) for row in rows]


init_db()
