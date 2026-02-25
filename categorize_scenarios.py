#!/usr/bin/env python3
"""Auto-catégorisation des scénarios 'Sur mesure' dans les types existants."""

import sqlite3
import json

DB_PATH = "/root/vendmieux/vendmieux.db"

# ── Mapping mots-clés → type_simulation ──────────────────────
# L'ordre compte : les catégories les plus spécifiques d'abord
KEYWORDS = {
    "barrage_secretaire":     ["secrétaire", "barrage", "standard", "assistante",
                               "filtrage", "accueil", "passer le barrage",
                               "secretary", "gatekeeper"],
    "multi_interlocuteurs":   ["multi-interlocuteurs", "multi interlocuteurs",
                               "comité", "plusieurs décideurs", "daf et dsi",
                               "daf", "dsi", "direction générale et",
                               "binôme", "trinôme", "double interlocuteur"],
    "rdv_physique":           ["rdv physique", "rendez-vous physique",
                               "en présentiel", "visite sur site", "visite client",
                               "entretien physique", "face à face", "face-à-face",
                               "en face", "bureau du client", "sur place"],
    "rdv_one_to_one":         ["rendez-vous", "rdv", "premier rdv",
                               "premier entretien", "découverte",
                               "rdv de découverte", "rdv commercial",
                               "entretien de découverte", "meeting",
                               "appointment", "discovery call"],
    "negociation":            ["négociation", "négocia", "négocier",
                               "tarif", "remise", "concession",
                               "prix", "budget", "devis",
                               "contrat", "closing", "closer",
                               "deal", "ristourne", "marge"],
    "gestion_reclamation":    ["réclamation", "plainte", "mécontent",
                               "insatisfait", "problème client", "litige",
                               "crise client", "client furieux", "client en colère",
                               "complaint", "claim", "retard de livraison",
                               "sav", "gestion de crise", "incident",
                               "erreur de commande", "non-conformité"],
    "relance_devis":          ["relance", "suivi", "rappel", "follow-up",
                               "follow up", "relance devis", "relance post",
                               "relance client", "sans nouvelles",
                               "pas donné suite", "n'a pas rappelé",
                               "recontacter"],
    "upsell":                 ["upsell", "up-sell", "montée en gamme",
                               "cross-sell", "cross sell", "fidélisation",
                               "renouvellement", "vente additionnelle",
                               "client existant", "client satisfait",
                               "service complémentaire", "upgrade",
                               "extension", "option supplémentaire"],
    "appel_entrant":          ["appel entrant", "entrant", "inbound",
                               "client appelle", "le client vous appelle",
                               "demande entrante", "lead entrant",
                               "demande de devis", "demande d'information"],
    "prospection_telephonique": ["prospect", "cold call", "appel froid",
                                 "appel à froid", "prospection",
                                 "prise de contact", "premier contact",
                                 "contact froid", "démarchage",
                                 "outbound", "téléprospection",
                                 "prospection froide", "prospection téléphonique",
                                 "vendre un", "vendre une", "vendre de",
                                 "vendre du", "vendre la", "vendre le",
                                 "convaincre un", "convaincre une",
                                 "convaincre le", "convaincre la"],
}


def auto_categorize(titre: str, description: str = "") -> str:
    """Catégorise un scénario en fonction de son titre et description."""
    text = (titre + " " + description).lower()
    for categorie, mots in KEYWORDS.items():
        if any(mot in text for mot in mots):
            return categorie
    return "Sur mesure"


def main():
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row

    # Ensure column exists
    try:
        db.execute("ALTER TABLE scenarios ADD COLUMN type_simulation TEXT DEFAULT 'Sur mesure'")
        db.commit()
        print("Colonne type_simulation ajoutée.")
    except Exception:
        pass  # Already exists

    # Get all scenarios needing categorization
    rows = db.execute("""
        SELECT id, description_originale, brief_json, persona_json, secteur
        FROM scenarios
        WHERE type_simulation IS NULL
           OR type_simulation = 'Sur mesure'
           OR type_simulation = 'custom'
           OR type_simulation = ''
    """).fetchall()

    print(f"\nScénarios à catégoriser : {len(rows)}")

    # Categorize
    updates = {}
    for r in rows:
        brief = {}
        if r["brief_json"]:
            try:
                brief = json.loads(r["brief_json"])
            except Exception:
                pass

        titre = brief.get("titre", "")
        desc = r["description_originale"] or ""

        cat = auto_categorize(titre, desc)
        updates[r["id"]] = cat

    # Apply updates
    for sid, cat in updates.items():
        db.execute(
            "UPDATE scenarios SET type_simulation = ? WHERE id = ?",
            (cat, sid),
        )
    db.commit()

    # Count by category AFTER update
    print("\n" + "=" * 50)
    print("DÉCOMPTE PAR CATÉGORIE (après mise à jour)")
    print("=" * 50)

    counts = db.execute("""
        SELECT type_simulation, COUNT(*) as cnt
        FROM scenarios
        GROUP BY type_simulation
        ORDER BY cnt DESC
    """).fetchall()

    total = 0
    for row in counts:
        t = row["type_simulation"] or "(NULL)"
        c = row["cnt"]
        total += c
        pct = (c / len(rows) * 100) if rows else 0
        bar = "█" * int(pct / 2)
        print(f"  {t:<30} {c:>4}  {pct:5.1f}%  {bar}")

    sur_mesure = sum(row["cnt"] for row in counts
                     if row["type_simulation"] in ("Sur mesure", None, ""))
    categorized = total - sur_mesure

    print(f"\n  {'TOTAL':<30} {total:>4}")
    print(f"  Catégorisés : {categorized} / {total} ({categorized/total*100:.1f}%)")
    print(f"  Restants 'Sur mesure' : {sur_mesure}")

    # Show some examples of each category
    print("\n" + "=" * 50)
    print("EXEMPLES PAR CATÉGORIE")
    print("=" * 50)
    for row in counts:
        cat = row["type_simulation"]
        if not cat or cat == "Sur mesure":
            continue
        examples = db.execute("""
            SELECT id, brief_json FROM scenarios
            WHERE type_simulation = ?
            LIMIT 2
        """, (cat,)).fetchall()
        print(f"\n  [{cat}]")
        for ex in examples:
            brief = json.loads(ex["brief_json"]) if ex["brief_json"] else {}
            titre = brief.get("titre", "?")[:60]
            print(f"    • {titre}")

    # Show remaining "Sur mesure" ones
    remaining = db.execute("""
        SELECT id, brief_json, description_originale FROM scenarios
        WHERE type_simulation = 'Sur mesure' OR type_simulation IS NULL
        LIMIT 10
    """).fetchall()
    if remaining:
        print(f"\n  [Sur mesure — restants]")
        for ex in remaining:
            brief = json.loads(ex["brief_json"]) if ex["brief_json"] else {}
            titre = brief.get("titre", "?")[:60]
            desc = (ex["description_originale"] or "")[:60]
            print(f"    • {titre}")
            if desc:
                print(f"      desc: {desc}")

    db.close()


if __name__ == "__main__":
    main()
