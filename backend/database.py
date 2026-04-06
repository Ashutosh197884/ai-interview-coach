from __future__ import annotations

import json
import os
import sqlite3
import logging
from datetime import datetime, timezone
from typing import Any

DB_PATH = os.getenv("INTERVIEW_DB_PATH", "interviews.db")
logger = logging.getLogger("ai-interview-coach")


def _connect() -> sqlite3.Connection:
    """Create and return a database connection with row factory."""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        logger.error(f"Database connection failed: {e}")
        raise


def _ensure_column(cursor: sqlite3.Cursor, name: str, definition: str) -> None:
    """Ensure a column exists in the sessions table, creating if necessary."""
    try:
        cursor.execute("PRAGMA table_info(sessions)")
        columns = {row[1] for row in cursor.fetchall()}
        if name not in columns:
            logger.info(f"Adding column {name} to sessions table")
            cursor.execute(f"ALTER TABLE sessions ADD COLUMN {name} {definition}")
    except sqlite3.Error as e:
        logger.error(f"Column operation failed: {e}")
        raise


def init_db() -> None:
    """Initialize database and create sessions table if not exists."""
    try:
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
            logger.info("Database initialized successfully")
    except sqlite3.Error as e:
        logger.error(f"Database initialization failed: {e}")
        raise


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
    """Save an interview session to the database.
    
    Args:
        name: Candidate name
        role: Job role
        difficulty: Difficulty level
        question_type: Type of questions (Technical/HR/Mixed)
        overall_score: Overall score out of 10
        questions: List of questions asked
        answers: List of answers provided
        scores: List of scores for each answer
        
    Returns:
        Session ID of the saved session
        
    Raises:
        sqlite3.Error: If database operation fails
    """
    try:
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
                    name.strip(),
                    role.strip(),
                    difficulty.strip(),
                    question_type.strip(),
                    overall_score,
                    json.dumps(questions),
                    json.dumps(answers),
                    json.dumps(scores),
                    datetime.now(timezone.utc).isoformat(),
                ),
            )
            conn.commit()
            session_id = int(cursor.lastrowid)
            logger.info(f"Session {session_id} saved for {name}")
            return session_id
    except sqlite3.Error as e:
        logger.error(f"Failed to save session: {e}")
        raise


def get_history(name: str, limit: int = 20) -> list[dict[str, Any]]:
    """Retrieve interview history for a candidate.
    
    Args:
        name: Candidate name
        limit: Maximum number of sessions to retrieve (default: 20)
        
    Returns:
        List of session dictionaries
        
    Raises:
        sqlite3.Error: If database operation fails
    """
    if not name or not name.strip():
        return []

    try:
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
            result = [dict(row) for row in rows]
            logger.info(f"Retrieved {len(result)} sessions for {name}")
            return result
    except sqlite3.Error as e:
        logger.error(f"Failed to retrieve history: {e}")
        raise


init_db()
