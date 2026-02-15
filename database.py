"""
VendMieux — Database (SQLite via aiosqlite)
Tables : demos, demo_sessions, evaluations
"""

import aiosqlite
from pathlib import Path
from datetime import datetime, timedelta
import json
import secrets

DB_PATH = Path(__file__).parent / "vendmieux.db"


async def init_db():
    """Crée les tables si elles n'existent pas."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS demos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                token TEXT UNIQUE NOT NULL,
                nom_ecole TEXT NOT NULL,
                contact_email TEXT,
                scenario_id TEXT NOT NULL,
                difficulty INTEGER DEFAULT 2,
                sessions_max INTEGER DEFAULT 3,
                sessions_used INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME NOT NULL,
                is_active BOOLEAN DEFAULT 1
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS demo_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                demo_id INTEGER REFERENCES demos(id),
                started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                duration_s INTEGER,
                transcript_json TEXT,
                evaluation_json TEXT,
                score_global REAL
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS evaluations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                scenario_id TEXT,
                difficulty INTEGER,
                transcript TEXT,
                evaluation_json TEXT,
                score_global REAL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.commit()


async def create_demo(
    nom_ecole: str,
    scenario_id: str,
    difficulty: int = 2,
    nb_sessions: int = 3,
    contact_email: str | None = None,
    expire_days: int = 7,
) -> dict:
    """Crée un lien démo unique pour une école."""
    token = secrets.token_urlsafe(16)
    expires_at = datetime.utcnow() + timedelta(days=expire_days)

    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT INTO demos (token, nom_ecole, contact_email, scenario_id, difficulty, sessions_max, expires_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (token, nom_ecole, contact_email, scenario_id, difficulty, nb_sessions, expires_at.isoformat()),
        )
        await db.commit()

    return {
        "demo_token": token,
        "nom_ecole": nom_ecole,
        "sessions_max": nb_sessions,
        "expires_at": expires_at.isoformat(),
    }


async def get_demo(token: str) -> dict | None:
    """Récupère une démo par son token."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM demos WHERE token = ?", (token,)) as cursor:
            row = await cursor.fetchone()
            if not row:
                return None
            return dict(row)


async def use_demo_session(token: str) -> bool:
    """Incrémente sessions_used. Retourne False si plus de sessions disponibles."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM demos WHERE token = ?", (token,)) as cursor:
            row = await cursor.fetchone()
            if not row:
                return False
            demo = dict(row)

        if demo["sessions_used"] >= demo["sessions_max"]:
            return False
        if not demo["is_active"]:
            return False
        if datetime.fromisoformat(demo["expires_at"]) < datetime.utcnow():
            return False

        await db.execute(
            "UPDATE demos SET sessions_used = sessions_used + 1 WHERE token = ?",
            (token,),
        )
        await db.commit()
        return True


async def save_demo_session(
    demo_id: int,
    duration_s: int,
    transcript_json: str,
    evaluation_json: str,
    score_global: float,
) -> int:
    """Sauvegarde une session démo."""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            """INSERT INTO demo_sessions (demo_id, duration_s, transcript_json, evaluation_json, score_global)
               VALUES (?, ?, ?, ?, ?)""",
            (demo_id, duration_s, transcript_json, evaluation_json, score_global),
        )
        await db.commit()
        return cursor.lastrowid


async def save_evaluation(
    session_id: str,
    scenario_id: str,
    difficulty: int,
    transcript: str,
    evaluation_json: str,
    score_global: float,
) -> int:
    """Sauvegarde une évaluation (sessions régulières ou démo)."""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            """INSERT INTO evaluations (session_id, scenario_id, difficulty, transcript, evaluation_json, score_global)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (session_id, scenario_id, difficulty, transcript, evaluation_json, score_global),
        )
        await db.commit()
        return cursor.lastrowid
