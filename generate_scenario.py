#!/usr/bin/env python3
"""
VendMieux — Générateur de scénarios
Prend une description en langage naturel et génère un scénario complet
(extraction + persona + objections) utilisable par l'agent vocal.

Usage :
  python generate_scenario.py "Mes commerciaux vendent de la formation aux DRH..."
  python generate_scenario.py --interactive
"""

import json
import sys
import os
import time
from pathlib import Path

import anthropic

MODEL = "claude-sonnet-4-5-20250929"
SCENARIOS_DIR = Path(__file__).parent / "scenarios"
SCENARIOS_DIR.mkdir(exist_ok=True)

client = anthropic.Anthropic()

# --- Prompts système (identiques à Phase 0) ---
SYSTEM_EXTRACTION = """Tu es un expert en analyse de situations commerciales B2B françaises.

MISSION : À partir d'une description en langage naturel d'un dirigeant de PME, extraire les éléments clés pour créer un scénario de simulation commerciale.

RÈGLES :
- Sois exhaustif mais ne fabule pas. Si une info manque, indique "NON_SPECIFIE"
- Déduis ce qui est implicite
- Identifie le VRAI problème des commerciaux
- Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks, sans commentaire

SCHÉMA DE SORTIE :
{
  "contexte": {
    "type_vente": "prospection_telephonique|rdv_physique|visio|relance|negociation",
    "canal": "telephone|visio|presentiel",
    "cycle_vente": "court|moyen|long",
    "temperature_prospect": "froid|tiede|chaud"
  },
  "cible": {
    "secteur": "string ou NON_SPECIFIE",
    "taille_entreprise": "string ou NON_SPECIFIE",
    "interlocuteur_principal": {
      "poste": "string",
      "niveau_hierarchique": "dirigeant|directeur|manager|operationnel"
    },
    "interlocuteurs_secondaires": [],
    "zone_geo": "string ou NON_SPECIFIE"
  },
  "offre": {
    "produit_service": "string",
    "proposition_valeur_presumee": "string",
    "fourchette_prix": "string ou NON_SPECIFIE",
    "concurrence_mentionnee": "string ou NON_SPECIFIE"
  },
  "problemes_commerciaux": {
    "explicites": [],
    "implicites": [],
    "probleme_racine": "string"
  },
  "objections_mentionnees": [],
  "objectif_formation": "string",
  "vendeur": {
    "entreprise_nom": "string — déduit de la description ou NON_SPECIFIE",
    "entreprise_secteur": "string",
    "entreprise_description": "string",
    "offre_nom": "string ou NON_SPECIFIE",
    "offre_description": "string",
    "proposition_valeur": "string",
    "prix_indicatif": "string ou NON_SPECIFIE",
    "references": [],
    "avantages_vs_concurrence": "string ou NON_SPECIFIE",
    "objectif_appel": "rdv_physique|rdv_visio|vente_directe|qualification",
    "type_prospection": "appel_froid|suite_salon|relance|recommandation"
  },
  "metadata": {
    "completude_input": "faible|moyenne|bonne|excellente",
    "confiance_deductions": "faible|moyenne|haute",
    "elements_manquants_critiques": []
  }
}"""

SYSTEM_PERSONA = """Tu es un expert en création de personas commerciaux ultra-réalistes pour la formation B2B en France.

MISSION : Créer un persona prospect crédible, nuancé et spécifiquement français.

RÈGLES :
1. SPÉCIFIQUE — pas de généralités
2. Inclure des ASPÉRITÉS : défauts, biais, tics de langage typiquement français
3. Comportement cohérent avec le niveau hiérarchique
4. Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks

SCHÉMA DE SORTIE :
{
  "identite": {
    "prenom": "string", "nom": "string", "age": "number", "poste": "string",
    "entreprise": { "nom": "string fictif réaliste", "secteur": "string", "taille": "string", "ca_approximatif": "string" }
  },
  "psychologie": {
    "traits_dominants": ["3 traits max"],
    "motivations_profondes": [],
    "peurs_freins": [],
    "rapport_aux_commerciaux": "string",
    "style_communication": "directif|analytique|expressif|aimable"
  },
  "comportement_en_rdv": {
    "ton_initial": "string",
    "signaux_interet": [],
    "signaux_rejet": [],
    "tics_langage": [],
    "debit_parole": "rapide|normal|lent",
    "tolerance_monologue_vendeur": "string"
  },
  "contexte_actuel": {
    "situation_entreprise": "string",
    "priorites_actuelles": [],
    "experience_avec_offre_similaire": "string",
    "fournisseur_actuel": "string ou null",
    "budget_disponible": "string"
  },
  "declencheurs": {
    "ce_qui_ouvre_la_porte": [],
    "ce_qui_ferme_instantanement": []
  }
}"""

SYSTEM_OBJECTIONS = """Tu es un expert en objections commerciales terrain B2B en France.

MISSION : Générer les objections réalistes pour cette simulation.

RÈGLES :
1. Objections VERBATIM — exactement comme le prospect les dirait à l'oral en français
2. Inclure le SOUS-TEXTE
3. Classer par moment dans l'entretien
4. Varier les types : réflexe, sincère, tactique, test
5. Cohérent avec le persona
6. Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks

SCHÉMA DE SORTIE :
{
  "objections": [
    {
      "moment": "accroche|decouverte|argumentation|closing",
      "verbatim": "string",
      "sous_texte": "string",
      "type": "reflexe|sincere|tactique|test",
      "difficulte": 1,
      "reponse_efficace_indice": "string"
    }
  ],
  "objection_finale": { "verbatim": "string", "condition_declenchement": "string" },
  "pattern_escalade": "string",
  "piege_classique": "string"
}"""


SYSTEM_BRIEF = """Tu rédiges le brief que verra le commercial AVANT la simulation.

Court, concret, immersif. Le commercial doit se sentir comme avant un vrai appel. 150 mots max.
Pas de conseils ni de tips — c'est un brief terrain, pas une formation.

Tu reçois en entrée l'extraction structurée, le persona prospect et les données vendeur.

SCHÉMA DE SORTIE — JSON STRICT, sans markdown, sans backticks :
{
  "titre": "string — titre court du scénario (ex: 'Prospection téléphonique — Maintenance prédictive IoT')",
  "vous_etes": "string — 1 phrase qui dit qui est le commercial",
  "vous_vendez": "string — 1 phrase produit + prix",
  "vous_appelez": "string — 1-2 phrases : nom, poste, entreprise, trait dominant",
  "ce_que_vous_savez": ["string — 3-5 infos connues avant l'appel"],
  "votre_objectif": "string — L'objectif en 1 phrase claire",
  "vos_atouts": ["string — 3-4 arguments/références clés"],
  "duree_estimee": "string — ex: '5-8 minutes'",
  "niveau_difficulte": "Débutant|Intermédiaire|Expert"
}"""


def safe_parse(text: str) -> dict:
    cleaned = text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return json.loads(cleaned.strip())


def call_claude(system: str, user_msg: str) -> dict:
    start = time.time()
    resp = client.messages.create(
        model=MODEL,
        max_tokens=8192,
        system=system,
        messages=[{"role": "user", "content": user_msg}],
    )
    elapsed = time.time() - start
    text = resp.content[0].text
    tokens_in = resp.usage.input_tokens
    tokens_out = resp.usage.output_tokens
    data = safe_parse(text)
    return {"data": data, "elapsed": elapsed, "tokens_in": tokens_in, "tokens_out": tokens_out}


def generate_scenario(description: str, scenario_id: str = None) -> dict:
    """Pipeline complet : description → scénario JSON"""

    print(f"\n{'='*60}")
    print(f"🚀 Génération de scénario VendMieux")
    print(f"📝 Input : \"{description[:80]}...\"")
    print(f"{'='*60}")

    # Étape 1 : Extraction
    print("\n🔍 Étape 1/4 : Extraction...")
    r1 = call_claude(
        SYSTEM_EXTRACTION,
        f'Description du dirigeant :\n\n"{description}"\n\nAnalyse et extrais au format JSON.',
    )
    extraction = r1["data"]
    print(f"   ✅ {r1['elapsed']:.1f}s — {r1['tokens_in']}+{r1['tokens_out']} tokens")

    # Étape 2 : Persona
    print("\n👤 Étape 2/4 : Persona...")
    r2 = call_claude(
        SYSTEM_PERSONA,
        f"Extraction structurée :\n\n{json.dumps(extraction, ensure_ascii=False, indent=2)}\n\nGénère un persona prospect ultra-réaliste.",
    )
    persona = r2["data"]
    print(f"   ✅ {r2['elapsed']:.1f}s — {persona['identite']['prenom']} {persona['identite']['nom']}, {persona['identite']['poste']}")

    # Étape 3 : Objections
    print("\n🛡️ Étape 3/4 : Objections...")
    r3 = call_claude(
        SYSTEM_OBJECTIONS,
        f"CONTEXTE :\n{json.dumps(extraction, ensure_ascii=False)}\n\nPERSONA :\n{json.dumps(persona, ensure_ascii=False)}\n\nGénère les objections réalistes.",
    )
    objections = r3["data"]
    nb_obj = len(objections.get("objections", []))
    print(f"   ✅ {r3['elapsed']:.1f}s — {nb_obj} objections générées")

    # Étape 4 : Brief commercial + vendeur
    print("\n📋 Étape 4/4 : Brief commercial...")

    # Build vendeur structure from extraction
    v_raw = extraction.get("vendeur", {})
    vendeur = {
        "entreprise": {
            "nom": v_raw.get("entreprise_nom", "NON_SPECIFIE"),
            "secteur": v_raw.get("entreprise_secteur", extraction.get("offre", {}).get("produit_service", "")),
            "description": v_raw.get("entreprise_description", ""),
        },
        "offre": {
            "nom": v_raw.get("offre_nom", extraction.get("offre", {}).get("produit_service", "NON_SPECIFIE")),
            "description": v_raw.get("offre_description", extraction.get("offre", {}).get("proposition_valeur_presumee", "")),
            "proposition_valeur": v_raw.get("proposition_valeur", ""),
            "prix": v_raw.get("prix_indicatif", extraction.get("offre", {}).get("fourchette_prix", "NON_SPECIFIE")),
            "references": v_raw.get("references", []),
            "avantages_vs_concurrence": v_raw.get("avantages_vs_concurrence", ""),
        },
        "objectif_appel": {
            "type": v_raw.get("objectif_appel", "rdv_physique"),
            "description": extraction.get("objectif_formation", "Obtenir un rendez-vous"),
            "criteres_succes": [],
        },
        "contexte_appel": {
            "type": v_raw.get("type_prospection", "appel_froid"),
            "historique": "Premier contact",
            "infos_connues": "",
        },
    }

    r4 = call_claude(
        SYSTEM_BRIEF,
        f"EXTRACTION :\n{json.dumps(extraction, ensure_ascii=False)}\n\nPERSONA :\n{json.dumps(persona, ensure_ascii=False)}\n\nVENDEUR :\n{json.dumps(vendeur, ensure_ascii=False)}\n\nRédige le brief commercial.",
    )
    brief_commercial = r4["data"]
    print(f"   ✅ {r4['elapsed']:.1f}s — Brief généré : \"{brief_commercial.get('titre', '?')}\"")

    # Assembler le scénario
    all_results = [r1, r2, r3, r4]
    total_tokens = sum(r["tokens_in"] + r["tokens_out"] for r in all_results)
    total_time = sum(r["elapsed"] for r in all_results)

    scenario = {
        "id": scenario_id or f"scenario_{int(time.time())}",
        "description_originale": description,
        "extraction": extraction,
        "persona": persona,
        "objections": objections,
        "vendeur": vendeur,
        "brief_commercial": brief_commercial,
        "metadata": {
            "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "model": MODEL,
            "total_tokens": total_tokens,
            "total_time_s": round(total_time, 1),
        },
    }

    # Sauvegarder
    filename = f"{scenario['id']}.json"
    filepath = SCENARIOS_DIR / filename
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(scenario, f, ensure_ascii=False, indent=2)

    print(f"\n{'─'*60}")
    print(f"✅ Scénario sauvegardé : {filepath}")
    print(f"👤 Prospect : {persona['identite']['prenom']} {persona['identite']['nom']}, {persona['identite']['poste']} chez {persona['identite']['entreprise']['nom']}")
    print(f"🛡️ {nb_obj} objections | ⏱️ {scenario['metadata']['total_time_s']}s | 🔤 {scenario['metadata']['total_tokens']} tokens")
    print(f"\n💡 Pour lancer la simulation avec ce scénario :")
    print(f"   Utilise l'ID : {scenario['id']}")

    return scenario


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] != "--interactive":
        description = " ".join(sys.argv[1:])
        generate_scenario(description)
    else:
        print("🎯 VendMieux — Générateur de scénarios")
        print("Décrivez la situation commerciale de votre équipe :\n")
        description = input("> ")
        if description.strip():
            scenario_id = input("\nID du scénario (Enter pour auto) : ").strip() or None
            generate_scenario(description, scenario_id)
        else:
            print("❌ Description vide.")
