"""
Import des scénarios pré-enrichis dans la table scenarios (SQLite synchrone).
Usage : python3 import_scenarios.py
"""

import json
import sqlite3
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).parent / "vendmieux.db"
JSON_PATH = Path(__file__).parent / "scenarios_pre_enrichis.json"


def main():
    if not JSON_PATH.exists():
        print(f"Fichier introuvable : {JSON_PATH}")
        return

    with open(JSON_PATH, "r", encoding="utf-8") as f:
        scenarios = json.load(f)

    print(f"Fichier chargé : {len(scenarios)} scénarios")

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Ensure table exists
    cur.execute("""
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

    inserted = []
    for sc in scenarios:
        sid = sc["id"]
        cur.execute(
            """INSERT OR REPLACE INTO scenarios
               (id, description_originale, extraction_json, persona_json, objections_json,
                brief_json, difficulty_default, secteur, tags, is_template, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)""",
            (
                sid,
                sc.get("extraction", {}).get("objectif_formation", ""),
                json.dumps(sc.get("extraction", {}), ensure_ascii=False),
                json.dumps(sc.get("persona", {}), ensure_ascii=False),
                json.dumps(sc.get("objections", {}), ensure_ascii=False),
                json.dumps(sc.get("brief_commercial", {}), ensure_ascii=False),
                sc.get("metadata", {}).get("difficulte_defaut", 2),
                sc.get("metadata", {}).get("secteur", ""),
                json.dumps(sc.get("metadata", {}).get("tags", []), ensure_ascii=False),
                datetime.now().isoformat(),
            ),
        )
        inserted.append(sid)

    conn.commit()
    conn.close()

    print(f"\n{len(inserted)} scénarios insérés/mis à jour :")
    for sid in inserted:
        print(f"  - {sid}")


if __name__ == "__main__":
    main()
