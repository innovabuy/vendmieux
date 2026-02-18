"""
VendMieux — Database (SQLite via aiosqlite)
Tables : demos, demo_sessions, evaluations, entreprises, users, sessions
"""

import aiosqlite
from pathlib import Path
from datetime import datetime, timedelta
import json
import secrets

DB_PATH = Path(__file__).parent / "vendmieux.db"


def _gen_id() -> str:
    """Génère un ID hex 16 chars (équivalent hex(randomblob(8)))."""
    return secrets.token_hex(8)


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
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                user_id TEXT,
                session_ref_id TEXT
            )
        """)

        # --- Sprint 2 tables ---
        await db.execute("""
            CREATE TABLE IF NOT EXISTS entreprises (
                id TEXT PRIMARY KEY,
                nom TEXT NOT NULL,
                secteur TEXT DEFAULT '',
                nb_commerciaux INTEGER DEFAULT 1,
                plan TEXT DEFAULT 'essai',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                nom TEXT NOT NULL,
                prenom TEXT NOT NULL,
                role TEXT DEFAULT 'commercial',
                entreprise_id TEXT REFERENCES entreprises(id),
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT REFERENCES users(id),
                scenario_id TEXT,
                difficulty INTEGER DEFAULT 2,
                started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                ended_at DATETIME,
                duration_seconds INTEGER,
                transcript_json TEXT,
                status TEXT DEFAULT 'started',
                livekit_room_id TEXT
            )
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS scenarios (
                id TEXT PRIMARY KEY,
                description_originale TEXT,
                extraction_json TEXT,
                persona_json TEXT,
                objections_json TEXT,
                brief_json TEXT,
                difficulty_default INTEGER DEFAULT 2,
                secteur TEXT,
                tags TEXT,
                is_template INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # ALTER evaluations for older DBs (idempotent)
        for col, coltype in [("user_id", "TEXT"), ("session_ref_id", "TEXT")]:
            try:
                await db.execute(f"ALTER TABLE evaluations ADD COLUMN {col} {coltype}")
            except Exception:
                pass

        # Sprint Persistance — language columns
        for table, col, coltype, default in [
            ("sessions", "language", "TEXT", "'fr'"),
            ("evaluations", "language", "TEXT", "'fr'"),
            ("scenarios", "language", "TEXT", "'fr'"),
        ]:
            try:
                await db.execute(f"ALTER TABLE {table} ADD COLUMN {col} {coltype} DEFAULT {default}")
            except Exception:
                pass

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
    user_id: str | None = None,
    session_ref_id: str | None = None,
    language: str = "fr",
) -> int:
    """Sauvegarde une évaluation. Dédoublonnage : si session_ref_id existe déjà, UPDATE."""
    async with aiosqlite.connect(DB_PATH) as db:
        # Deduplication: if an evaluation already exists for this session_ref_id, update it
        if session_ref_id:
            db.row_factory = aiosqlite.Row
            async with db.execute(
                "SELECT id FROM evaluations WHERE session_ref_id = ?", (session_ref_id,)
            ) as cur:
                existing = await cur.fetchone()
            if existing:
                await db.execute(
                    """UPDATE evaluations SET transcript = ?, evaluation_json = ?, score_global = ?,
                       user_id = COALESCE(?, user_id), language = ?
                       WHERE session_ref_id = ?""",
                    (transcript, evaluation_json, score_global, user_id, language, session_ref_id),
                )
                await db.commit()
                return existing["id"]

        cursor = await db.execute(
            """INSERT INTO evaluations (session_id, scenario_id, difficulty, transcript, evaluation_json, score_global, user_id, session_ref_id, language)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (session_id, scenario_id, difficulty, transcript, evaluation_json, score_global, user_id, session_ref_id, language),
        )
        await db.commit()
        return cursor.lastrowid


# ═══════════════════════════════════════════════════════════════
# Sprint 2 — Users / Entreprises / Sessions
# ═══════════════════════════════════════════════════════════════

async def create_entreprise(nom: str, secteur: str = "") -> dict:
    eid = _gen_id()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO entreprises (id, nom, secteur) VALUES (?, ?, ?)",
            (eid, nom, secteur),
        )
        await db.commit()
    return {"id": eid, "nom": nom, "secteur": secteur}


async def create_user(
    email: str, nom: str, prenom: str, password_hash: str,
    role: str = "commercial", entreprise_id: str | None = None,
) -> dict:
    uid = _gen_id()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT INTO users (id, email, nom, prenom, role, entreprise_id, password_hash)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (uid, email, nom, prenom, role, entreprise_id, password_hash),
        )
        await db.commit()
    return {"id": uid, "email": email, "nom": nom, "prenom": prenom, "role": role, "entreprise_id": entreprise_id}


async def get_user_by_email(email: str) -> dict | None:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM users WHERE email = ?", (email,)) as cur:
            row = await cur.fetchone()
            return dict(row) if row else None


async def get_user_by_id(user_id: str) -> dict | None:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM users WHERE id = ?", (user_id,)) as cur:
            row = await cur.fetchone()
            return dict(row) if row else None


async def update_last_login(user_id: str):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE users SET last_login = ? WHERE id = ?",
            (datetime.utcnow().isoformat(), user_id),
        )
        await db.commit()


async def create_session(
    user_id: str, scenario_id: str, difficulty: int = 2, livekit_room_id: str = "",
    language: str = "fr",
) -> str:
    sid = _gen_id()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT INTO sessions (id, user_id, scenario_id, difficulty, livekit_room_id, language)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (sid, user_id, scenario_id, difficulty, livekit_room_id, language),
        )
        await db.commit()
    return sid


async def complete_session(session_id: str, duration_seconds: int):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """UPDATE sessions SET status = 'completed', ended_at = ?, duration_seconds = ?
               WHERE id = ?""",
            (datetime.utcnow().isoformat(), duration_seconds, session_id),
        )
        await db.commit()


COMPETENCE_KEYS = ["accroche", "decouverte", "creation_enjeu", "argumentation", "traitement_objections", "engagement"]


def _parse_competences(evaluation_json_str: str) -> dict[str, float]:
    """Extrait les scores par compétence depuis evaluation_json."""
    try:
        ev = json.loads(evaluation_json_str) if isinstance(evaluation_json_str, str) else evaluation_json_str
        comps = ev.get("competences", {})
        return {k: comps.get(k, {}).get("score", 0) for k in COMPETENCE_KEYS}
    except Exception:
        return {k: 0 for k in COMPETENCE_KEYS}


async def get_user_evaluations(user_id: str, limit: int = 20) -> list[dict]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            """SELECT e.*, s.livekit_room_id FROM evaluations e
               LEFT JOIN sessions s ON e.session_ref_id = s.id
               WHERE e.user_id = ? ORDER BY e.created_at DESC LIMIT ?""",
            (user_id, limit),
        ) as cur:
            return [dict(r) for r in await cur.fetchall()]


async def get_user_stats(user_id: str) -> dict:
    evals = await get_user_evaluations(user_id, limit=100)
    if not evals:
        return {
            "sessions_total": 0, "score_moyen": 0, "meilleur_score": 0,
            "progression_30j": 0, "competences": {k: {"moyenne": 0, "evolution": 0, "derniere": 0} for k in COMPETENCE_KEYS},
            "competence_prioritaire": None, "serie_en_cours": 0,
        }

    scores = [e["score_global"] or 0 for e in evals]
    now = datetime.utcnow()
    cutoff_30j = (now - timedelta(days=30)).isoformat()
    recent = [e for e in evals if (e.get("created_at") or "") >= cutoff_30j]
    older = [e for e in evals if (e.get("created_at") or "") < cutoff_30j]

    # Competences
    comp_scores = {k: [] for k in COMPETENCE_KEYS}
    comp_recent = {k: [] for k in COMPETENCE_KEYS}
    comp_older = {k: [] for k in COMPETENCE_KEYS}
    for e in evals:
        cs = _parse_competences(e.get("evaluation_json", "{}"))
        for k in COMPETENCE_KEYS:
            if cs[k] > 0:
                comp_scores[k].append(cs[k])
    for e in recent:
        cs = _parse_competences(e.get("evaluation_json", "{}"))
        for k in COMPETENCE_KEYS:
            if cs[k] > 0:
                comp_recent[k].append(cs[k])
    for e in older:
        cs = _parse_competences(e.get("evaluation_json", "{}"))
        for k in COMPETENCE_KEYS:
            if cs[k] > 0:
                comp_older[k].append(cs[k])

    def avg(lst): return round(sum(lst) / len(lst), 1) if lst else 0

    competences = {}
    for k in COMPETENCE_KEYS:
        moy = avg(comp_scores[k])
        moy_recent = avg(comp_recent[k])
        moy_older = avg(comp_older[k])
        evolution = round(moy_recent - moy_older, 1) if moy_older > 0 and moy_recent > 0 else 0
        derniere = _parse_competences(evals[0].get("evaluation_json", "{}")).get(k, 0) if evals else 0
        competences[k] = {"moyenne": moy, "evolution": evolution, "derniere": derniere}

    # Competence prioritaire = la plus faible
    prioritaire = min(competences, key=lambda k: competences[k]["moyenne"]) if any(competences[k]["moyenne"] > 0 for k in COMPETENCE_KEYS) else None

    # Progression 30j
    score_recent = avg([e["score_global"] or 0 for e in recent]) if recent else 0
    score_older = avg([e["score_global"] or 0 for e in older]) if older else 0
    progression = round(score_recent - score_older, 1) if score_older > 0 and score_recent > 0 else 0

    # Série en cours (sessions consécutives >= 10/20)
    serie = 0
    for e in evals:
        if (e["score_global"] or 0) >= 10:
            serie += 1
        else:
            break

    return {
        "sessions_total": len(evals),
        "score_moyen": avg(scores),
        "meilleur_score": max(scores) if scores else 0,
        "progression_30j": progression,
        "competences": competences,
        "competence_prioritaire": prioritaire,
        "serie_en_cours": serie,
    }


async def get_evaluation_detail(eval_id: int, user_id: str | None = None) -> dict | None:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        q = "SELECT * FROM evaluations WHERE id = ?"
        params = [eval_id]
        if user_id:
            q += " AND user_id = ?"
            params.append(user_id)
        async with db.execute(q, params) as cur:
            row = await cur.fetchone()
            return dict(row) if row else None


async def get_team_members(entreprise_id: str) -> list[dict]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT id, email, nom, prenom, role, created_at, last_login FROM users WHERE entreprise_id = ?",
            (entreprise_id,),
        ) as cur:
            return [dict(r) for r in await cur.fetchall()]


async def get_team_stats(entreprise_id: str) -> dict:
    members = await get_team_members(entreprise_id)
    if not members:
        return {"nb_commerciaux": 0, "sessions_total": 0, "score_moyen": 0}

    total_sessions = 0
    all_scores = []
    for m in members:
        stats = await get_user_stats(m["id"])
        total_sessions += stats["sessions_total"]
        if stats["score_moyen"] > 0:
            all_scores.append(stats["score_moyen"])

    return {
        "nb_commerciaux": len(members),
        "sessions_total": total_sessions,
        "score_moyen": round(sum(all_scores) / len(all_scores), 1) if all_scores else 0,
    }


# ═══════════════════════════════════════════════════════════════
# Scenarios templates (pre-enriched)
# ═══════════════════════════════════════════════════════════════

async def get_all_scenario_templates() -> list[dict]:
    """Retourne tous les scénarios templates depuis la DB."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM scenarios WHERE is_template = 1") as cur:
            rows = await cur.fetchall()
            return [dict(r) for r in rows]


async def get_scenario_from_db(scenario_id: str) -> dict | None:
    """Retourne un scénario complet depuis la DB, avec JSON parsés."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM scenarios WHERE id = ?", (scenario_id,)) as cur:
            row = await cur.fetchone()
            if not row:
                return None
            d = dict(row)
            for field in ("extraction_json", "persona_json", "objections_json", "brief_json", "tags"):
                if d.get(field):
                    try:
                        d[field] = json.loads(d[field])
                    except Exception:
                        pass
            return d
