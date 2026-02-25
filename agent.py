"""
VendMieux — Agent vocal temps réel
Simulateur de prospect IA pour formation commerciale

Architecture :
  Micro du commercial → Deepgram STT → Claude LLM (persona prospect) → ElevenLabs TTS → Haut-parleur

L'agent joue le rôle d'un prospect français réaliste,
généré dynamiquement à partir d'un scénario FORCE 3D.
"""

import asyncio
import json
import os
import random
import time
import logging
import threading
from collections.abc import AsyncIterable
from pathlib import Path
from dotenv import load_dotenv
import httpx

from livekit import agents, rtc
from livekit.agents import (
    Agent,
    AgentSession,
    AgentServer,
    JobContext,
    JobProcess,
    RunContext,
    function_tool,
)
from livekit.agents.voice.agent import ModelSettings
from livekit.agents import llm
from livekit.plugins import deepgram, silero, anthropic
from livekit.plugins import google as google_tts
import anthropic as anthropic_sdk

from tts_utils import normalize_tts_stream


load_dotenv()
logger = logging.getLogger("vendmieux")
logger.setLevel(logging.INFO)

# --- Client Anthropic pour détection de genre ---
_anthropic_client = anthropic_sdk.Anthropic()

# --- Voix TTS par genre (Google Cloud TTS — Chirp3-HD) ---
VOIX_FEMININES = [
    'fr-FR-Chirp3-HD-Kore',          # Naturelle, claire
    'fr-FR-Chirp3-HD-Aoede',         # Alternative
    'fr-FR-Chirp3-HD-Leda',          # Alternative 2
]
VOIX_MASCULINES = [
    'fr-FR-Chirp3-HD-Charon',        # Naturel, posé
    'fr-FR-Chirp3-HD-Orus',          # Alternative
    'fr-FR-Chirp3-HD-Puck',          # Alternative 2
]

# --- Cache genre par scenario_id (évite appels Claude répétés) ---
_gender_cache: dict[str, str] = {}


# Prénoms français avec genre connu (évite un appel LLM inutile)
_PRENOMS_M = {
    "laurent", "marc", "jean", "pierre", "thomas", "michel", "philippe", "stéphane",
    "stephane", "frédéric", "frederic", "olivier", "nicolas", "christophe", "david",
    "patrick", "alain", "éric", "eric", "thierry", "bernard", "françois", "francois",
    "yves", "jacques", "gilles", "rémi", "remi", "mathieu", "julien", "antoine",
    "bruno", "vincent", "sébastien", "sebastien", "mehdi", "karim", "yannick",
    "guillaume", "fabrice", "jérôme", "jerome", "pascal", "hervé", "herve",
    "arnaud", "didier", "serge", "denis", "emmanuel", "raphaël", "raphael",
    "maxime", "benjamin", "alexandre", "paul", "louis", "hugo", "lucas", "léo",
    "arthur", "adam", "gabriel", "nathan", "théo", "ethan", "noah",
    "franck", "matthieu", "bertrand", "sylvain", "étienne", "rachid", "gérard",
    "gerard", "jean-marc", "jean-pierre", "jean-luc", "jean-paul", "jean-françois",
}
_PRENOMS_F = {
    "marie", "nathalie", "isabelle", "sophie", "catherine", "sandrine", "valérie",
    "valerie", "christine", "céline", "celine", "amandine", "aurélie", "aurelie",
    "caroline", "anne", "claire", "julie", "laura", "émilie", "emilie", "marine",
    "elodie", "élodie", "virginie", "delphine", "patricia", "sylvie", "martine",
    "françoise", "francoise", "monique", "nicole", "florence", "béatrice", "beatrice",
    "agathe", "léa", "manon", "chloé", "chloe", "emma", "jade", "alice", "lina",
    "sarah", "fatima", "aïcha", "aicha", "mélanie", "melanie",
    "véronique", "veronique", "corinne", "mathilde", "cécile", "cecile",
}


def detect_gender_from_persona(prompt_persona: str) -> str:
    """
    Détecte le genre du persona : d'abord par lookup prénom,
    puis fallback Claude Haiku si prénom inconnu.
    """
    # Tenter extraction du prénom depuis "Tu es {Prénom}" ou "INTERLOCUTEUR 1 : {Prénom}"
    import re
    m = re.search(r'(?:Tu es|INTERLOCUTEUR 1 : )([\w-]+)', prompt_persona)
    if m:
        prenom = m.group(1).lower()
        if prenom in _PRENOMS_M:
            return 'M'
        if prenom in _PRENOMS_F:
            return 'F'

    # Fallback LLM pour prénoms ambigus (Dominique, Camille, Claude...)
    try:
        response = _anthropic_client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=10,
            messages=[{
                "role": "user",
                "content": f"""Ce persona est-il masculin ou féminin ?
Réponds UNIQUEMENT par 'M' ou 'F'.
Persona : {prompt_persona[:300]}"""
            }]
        )
        gender = response.content[0].text.strip().upper()
        return 'F' if gender == 'F' else 'M'
    except Exception as e:
        logger.warning(f"⚠️ Détection genre échouée, fallback M: {e}")
        return 'M'


def get_cached_gender(scenario_id: str, prompt_persona: str) -> str:
    """Retourne le genre détecté, avec cache par scenario_id."""
    if scenario_id not in _gender_cache:
        _gender_cache[scenario_id] = detect_gender_from_persona(prompt_persona)
        logger.info(f"🔍 Genre détecté pour {scenario_id}: {_gender_cache[scenario_id]}")
    return _gender_cache[scenario_id]

# --- Répertoire des scénarios ---
SCENARIOS_DIR = Path(__file__).parent / "scenarios"


# --- Cache scénarios en mémoire (évite re-conversion à chaque session) ---
_scenarios_cache: dict[str, dict] = {}
_scenarios_db_loaded = False

# Historique conversation par room pour résilience reconnexion
_room_history: dict[str, dict] = {}
_room_history_lock = threading.Lock()
_ROOM_HISTORY_TTL = 900  # 15 min


def _save_room_history(room_name: str, session: AgentSession):
    """Sauvegarde l'historique de conversation pour reconnexion."""
    with _room_history_lock:
        _room_history[room_name] = {
            "history": session.history.to_dict(),
            "ts": time.time(),
        }
        # Purger les entrées périmées
        cutoff = time.time() - _ROOM_HISTORY_TTL
        stale = [k for k, v in _room_history.items() if v["ts"] < cutoff]
        for k in stale:
            del _room_history[k]


def _pop_room_history(room_name: str) -> dict | None:
    """Récupère et supprime l'historique stocké. None si absent/expiré."""
    with _room_history_lock:
        entry = _room_history.pop(room_name, None)
        if entry and (time.time() - entry["ts"]) < _ROOM_HISTORY_TTL:
            return entry["history"]
        return None


def _ensure_scenarios_db():
    """Charge la base de scénarios en cache une seule fois."""
    global _scenarios_db_loaded
    if not _scenarios_db_loaded:
        from scenarios_database import load_scenarios_database
        _scenarios_cache.update(load_scenarios_database())
        _scenarios_db_loaded = True
        logger.info(f"📦 Cache scénarios initialisé : {len(_scenarios_cache)} scénarios")


def _load_scenario_from_sqlite(scenario_id: str) -> dict | None:
    """Charge un scénario depuis SQLite et reconstitue le format agent."""
    import sqlite3 as _sqlite3
    db_path = Path(__file__).parent / "vendmieux.db"
    if not db_path.exists():
        return None
    try:
        conn = _sqlite3.connect(str(db_path))
        conn.row_factory = _sqlite3.Row
        row = conn.execute("SELECT * FROM scenarios WHERE id = ?", (scenario_id,)).fetchone()
        conn.close()
        if not row:
            return None
        persona = json.loads(row["persona_json"]) if row["persona_json"] else {}
        objections = json.loads(row["objections_json"]) if row["objections_json"] else {}
        brief = json.loads(row["brief_json"]) if row["brief_json"] else {}
        vendeur = json.loads(row["extraction_json"]) if row["extraction_json"] else {}
        return {
            "persona": persona,
            "objections": objections,
            "brief_commercial": brief,
            "vendeur": vendeur,
            "simulation": {
                "type": row["type_simulation"] or "prospection_telephonique",
                "difficulte": row["difficulty_default"] or 2,
            },
        }
    except Exception as e:
        logger.warning(f"⚠️ SQLite load failed for {scenario_id}: {e}")
        return None


def load_scenario(scenario_id: str) -> dict | None:
    """Charge un scénario depuis le cache, SQLite ou les fichiers JSON."""
    _ensure_scenarios_db()
    if scenario_id in _scenarios_cache:
        return _scenarios_cache[scenario_id]
    # Multi-interlocuteurs (sc_multi_*) : les fichiers JSON contiennent persona_2/dynamique_multi
    # qui ne sont pas dans le schéma SQLite → prioriser le fichier JSON
    if scenario_id.startswith("sc_multi_"):
        filepath = SCENARIOS_DIR / f"{scenario_id}.json"
        if filepath.exists():
            with open(filepath, "r", encoding="utf-8") as f:
                scenario = json.load(f)
            _scenarios_cache[scenario_id] = scenario
            return scenario
    # SQLite (scénarios diversifiés avec persona_json mis à jour)
    scenario = _load_scenario_from_sqlite(scenario_id)
    if scenario:
        _scenarios_cache[scenario_id] = scenario
        return scenario
    # Fallback fichiers JSON (scénarios générés par l'utilisateur, démo, etc.)
    filepath = SCENARIOS_DIR / f"{scenario_id}.json"
    if filepath.exists():
        with open(filepath, "r", encoding="utf-8") as f:
            scenario = json.load(f)
        _scenarios_cache[scenario_id] = scenario
        return scenario
    return None


MAX_CONTEXT_ITEMS = 40  # ~20 échanges (user + assistant) — au-delà, troncature
TTS_SILENCE_PREFIX_MS = 150  # Silence avant chaque réponse TTS pour éviter le premier mot coupé
TTS_SAMPLE_RATE = 24000


def _make_silence_frame(duration_ms: int = TTS_SILENCE_PREFIX_MS,
                        sample_rate: int = TTS_SAMPLE_RATE) -> rtc.AudioFrame:
    """Crée un AudioFrame de silence (int16 zeros)."""
    num_samples = int(sample_rate * duration_ms / 1000)
    silence_data = bytes(num_samples * 2)  # 2 bytes per int16 sample, all zeros
    return rtc.AudioFrame(
        data=silence_data,
        sample_rate=sample_rate,
        num_channels=1,
        samples_per_channel=num_samples,
    )


class VendMieuxProspect(Agent):
    """Agent qui joue le rôle d'un prospect pour VendMieux"""

    def __init__(self, system_prompt: str, scenario_name: str = ""):
        super().__init__(
            instructions=system_prompt,
        )
        self.scenario_name = scenario_name
        logger.info(f"🎭 Prospect VendMieux initialisé : {scenario_name}")

    def llm_node(
        self,
        chat_ctx: llm.ChatContext,
        tools: list[llm.Tool],
        model_settings: ModelSettings,
    ):
        """Tronque le contexte avant envoi au LLM pour éviter la latence sur longues sessions."""
        chat_ctx.truncate(max_items=MAX_CONTEXT_ITEMS)
        return super().llm_node(chat_ctx, tools, model_settings)

    async def tts_node(
        self,
        text: AsyncIterable[str],
        model_settings: ModelSettings,
    ) -> AsyncIterable[rtc.AudioFrame]:
        """Override : silence de 300ms + normalisation avant TTS Google."""
        normalized_text = normalize_tts_stream(text)
        first = True
        async for frame in super().tts_node(normalized_text, model_settings):
            if first:
                yield _make_silence_frame()
                first = False
            yield frame


# --- Scénario par défaut (hardcodé pour le premier test) ---
DEFAULT_SCENARIO = {
    "extraction": {
        "contexte": {"type_vente": "prospection_telephonique"},
        "objectif_formation": "Passer le barrage et créer l'urgence",
    },
    "persona": {
        "identite": {
            "prenom": "Olivier",
            "nom": "Bertrand",
            "age": 52,
            "poste": "Directeur Général",
            "entreprise": {
                "nom": "Mécapress Rhône-Alpes",
                "secteur": "Industrie mécanique",
                "taille": "85 salariés",
                "ca_approximatif": "12M€",
            },
        },
        "psychologie": {
            "traits_dominants": ["pragmatique", "direct", "méfiant envers les commerciaux"],
            "motivations_profondes": [
                "Réduire les coûts de maintenance",
                "Moderniser sans prendre de risque",
            ],
            "peurs_freins": [
                "Perdre du temps avec un vendeur",
                "S'engager sur une techno non éprouvée",
            ],
            "rapport_aux_commerciaux": "Les tolère s'ils sont concrets et rapides, déteste le blabla commercial",
            "style_communication": "directif",
        },
        "comportement_en_rdv": {
            "ton_initial": "Neutre-froid, pas hostile mais pas accueillant",
            "signaux_interet": [
                "pose des questions techniques",
                "demande des références dans son secteur",
                "évoque ses propres problèmes de maintenance",
            ],
            "signaux_rejet": [
                "soupire",
                "répond par monosyllabes",
                "dit 'bon écoutez...'",
            ],
            "tics_langage": [
                "Bon...",
                "Concrètement ?",
                "Et donc ?",
                "Écoutez...",
            ],
            "debit_parole": "rapide",
            "tolerance_monologue_vendeur": "15 secondes",
        },
        "contexte_actuel": {
            "situation_entreprise": "PME industrielle en croissance, 2 pannes machines imprévues le mois dernier qui ont coûté 40K€, mais le prestataire maintenance actuel est là depuis 15 ans",
            "priorites_actuelles": [
                "Livrer la commande Airbus à temps",
                "Recruter 3 usineurs",
            ],
            "experience_avec_offre_similaire": "Un commercial IoT est passé il y a 6 mois, n'a pas convaincu",
            "fournisseur_actuel": "Maintenance Plus SARL, prestataire historique depuis 15 ans",
            "budget_disponible": "Pas de budget prévu, mais pourrait débloquer si ROI démontré",
        },
    },
    "objections": {
        "objections": [
            {
                "moment": "accroche",
                "verbatim": "C'est à quel sujet ? J'ai pas beaucoup de temps là.",
                "type": "reflexe",
                "difficulte": 3,
                "sous_texte": "Filtrage automatique",
            },
            {
                "moment": "accroche",
                "verbatim": "On a déjà un prestataire qui nous connaît depuis 15 ans et qui fait le job.",
                "type": "sincere",
                "difficulte": 5,
                "sous_texte": "Relation de confiance établie, peur du changement",
            },
            {
                "moment": "decouverte",
                "verbatim": "Ces nouvelles technos, c'est jamais aussi bien qu'annoncé. Le dernier qui est venu m'a fait perdre une heure.",
                "type": "sincere",
                "difficulte": 4,
                "sous_texte": "Échaudé par une mauvaise expérience récente",
            },
            {
                "moment": "argumentation",
                "verbatim": "Rappelez-moi dans 6 mois, là c'est pas le moment.",
                "type": "tactique",
                "difficulte": 3,
                "sous_texte": "Veut se débarrasser poliment",
            },
            {
                "moment": "argumentation",
                "verbatim": "Combien ça coûte tout compris ? Parce que là on a zéro budget pour ça.",
                "type": "test",
                "difficulte": 4,
                "sous_texte": "Teste si le vendeur justifie ou questionne",
            },
            {
                "moment": "closing",
                "verbatim": "Envoyez-moi un mail avec une doc, je regarderai quand j'aurai 5 minutes.",
                "type": "tactique",
                "difficulte": 4,
                "sous_texte": "Façon polie de dire non sans dire non",
            },
        ],
        "objection_finale": {
            "verbatim": "Bon écoutez, j'ai une réunion qui commence. Si c'est vraiment intéressant, envoyez-moi un truc concret par mail et on verra.",
            "condition_declenchement": "Si le commercial n'a pas créé d'enjeu après 5 minutes",
        },
        "pattern_escalade": "Filtrage → prestataire actuel → scepticisme techno → report → prix → mail poubelle",
    },
    "vendeur": {
        "entreprise": {
            "nom": "TechMaint Solutions",
            "secteur": "Maintenance prédictive industrielle",
            "description": "Éditeur de solutions IoT de surveillance machines en temps réel",
        },
        "offre": {
            "nom": "PredictLine",
            "description": "Capteurs IoT + plateforme IA qui détecte les pannes machines 48h avant qu'elles arrivent",
            "proposition_valeur": "Réduction de 70% des arrêts machines non planifiés, ROI en 6 mois",
            "prix": "À partir de 800€/mois pour un parc de 10 machines",
            "references": [
                "Fonderies du Rhône (72 sal.) — 3 pannes évitées en 6 mois",
                "Précis'Usinage Lyon — ROI atteint en 4 mois",
            ],
            "avantages_vs_concurrence": "Seule solution avec IA prédictive certifiée pour l'usinage CN, installation en 1 journée sans arrêt de production",
        },
        "objectif_appel": {
            "type": "rdv_physique",
            "description": "Décrocher un RDV de 30 minutes sur site pour une démonstration live sur une machine",
            "criteres_succes": [
                "Obtenir une date et un créneau",
                "Identifier si le DG est le décideur final",
                "Comprendre le parc machines et les problèmes récents",
            ],
        },
        "contexte_appel": {
            "type": "appel_froid",
            "historique": "Premier contact, aucun historique",
            "infos_connues": "PME industrielle Rhône-Alpes, 85 salariés, secteur mécanique de précision. Trouvé via annuaire industriel.",
        },
    },
    "brief_commercial": {
        "titre": "Prospection téléphonique — Maintenance prédictive IoT",
        "vous_etes": "Commercial chez TechMaint Solutions, éditeur de solutions IoT de maintenance prédictive.",
        "vous_vendez": "PredictLine : capteurs + IA qui détectent les pannes machines 48h à l'avance. À partir de 800€/mois.",
        "vous_appelez": "Olivier Bertrand, DG de MécaPress Rhône-Alpes (85 sal., mécanique de précision). Pragmatique, direct, fidèle à son prestataire actuel depuis 15 ans.",
        "ce_que_vous_savez": [
            "PME industrielle en croissance, secteur mécanique de précision",
            "Trouvé via annuaire industriel — premier contact",
            "Le secteur souffre d'arrêts machines imprévus coûteux",
        ],
        "votre_objectif": "Décrocher un RDV de 30 min sur site pour une démo live.",
        "vos_atouts": [
            "Référence : Fonderies du Rhône, 3 pannes évitées en 6 mois",
            "ROI moyen clients : 4-6 mois",
            "Installation en 1 journée, sans arrêt de production",
        ],
        "duree_estimee": "5-8 minutes",
        "niveau_difficulte": "Intermédiaire",
    },
}


LANGUAGE_INFO = {
    "fr": {"name": "français", "nationality": "français(e)", "country": "la France"},
    "en": {"name": "English", "nationality": "British", "country": "the UK"},
    "es": {"name": "español", "nationality": "español(a)", "country": "España"},
    "de": {"name": "Deutsch", "nationality": "deutsch", "country": "Deutschland"},
    "it": {"name": "italiano", "nationality": "italiano/a", "country": "l'Italia"},
}

# --- Greetings pré-scriptés (bypass LLM pour la 1ère réplique) ---
GREETINGS = {
    "fr": [
        "Oui allô ?",
        "Allô, oui ?",
        "{prenom} {nom}, j'écoute.",
        "Oui bonjour ?",
        "{entreprise}, bonjour.",
    ],
    "en": [
        "Hello?",
        "Yes, hello?",
        "{prenom} {nom} speaking.",
        "Hello, who's calling?",
        "Yes? {nom}.",
    ],
    "es": [
        "¿Sí, dígame?",
        "¿Hola?",
        "{prenom} {nom}, dígame.",
        "Dígame.",
    ],
    "de": [
        "Ja, hallo?",
        "{nom}, guten Tag.",
        "Hallo, wer spricht?",
        "{nom}.",
    ],
    "it": [
        "Pronto?",
        "Sì, pronto?",
        "{prenom} {nom}, mi dica.",
        "Pronto, {nom}.",
    ],
}


GREETINGS_MULTI = {
    "fr": [
        "[{prenom1}] Bonjour, entrez. Asseyez-vous. Je vous présente {prenom2} {nom2}, {poste2}.",
        "[{prenom1}] Bonjour. Installez-vous. Vous connaissez {prenom2} {nom2}, notre {poste2} ?",
        "[{prenom1}] Bienvenue. On est tous les deux là, {prenom2} et moi. On vous écoute.",
    ],
    "en": [
        "[{prenom1}] Hello, come in. Let me introduce {prenom2} {nom2}, our {poste2}.",
        "[{prenom1}] Hi there. Have a seat. You know {prenom2} {nom2}?",
    ],
    "es": [
        "[{prenom1}] Buenos días, pasen. Les presento a {prenom2} {nom2}, {poste2}.",
    ],
    "de": [
        "[{prenom1}] Guten Tag, kommen Sie rein. Das ist {prenom2} {nom2}, unser {poste2}.",
    ],
    "it": [
        "[{prenom1}] Buongiorno, si accomodi. Le presento {prenom2} {nom2}, {poste2}.",
    ],
}


def get_greeting(language: str, persona: dict, persona_2: dict = None) -> str:
    """Génère une phrase d'accueil pré-scriptée (bypass LLM, gain ~2-3s)."""
    if persona_2:
        templates = GREETINGS_MULTI.get(language, GREETINGS_MULTI["fr"])
        template = random.choice(templates)
        id1 = persona.get("identite", {})
        id2 = persona_2.get("identite", {})
        return template.format(
            prenom1=id1.get("prenom", ""),
            nom1=id1.get("nom", ""),
            prenom2=id2.get("prenom", ""),
            nom2=id2.get("nom", ""),
            poste2=id2.get("poste", ""),
        )
    templates = GREETINGS.get(language, GREETINGS["fr"])
    template = random.choice(templates)
    identite = persona.get("identite", {})
    return template.format(
        prenom=identite.get("prenom", ""),
        nom=identite.get("nom", ""),
        entreprise=identite.get("entreprise", {}).get("nom", ""),
    )


PROMPT_CONSTRAINTS = """CONTRAINTE ABSOLUE PRIORITÉ MAXIMALE :
Tu ne peux JAMAIS affirmer avoir entendu quelque chose que le commercial n'a pas dit dans CETTE conversation.
Tu ne mentionnes JAMAIS de tarifs, chiffres, documents ou échanges antérieurs que le commercial n'a pas cités explicitement.
Si contesté sur des paroles : "Ah, peut-être que j'ai mal compris" — jamais "Non vous l'avez dit."
Tu ne connais PAS les références clients du commercial — tu poses des questions dessus, tu ne complètes jamais.
Tu ne répètes JAMAIS la même objection plus de 2 fois. Après 2 fois : nuancer, poser une question, révéler ta douleur cachée, ou mettre fin à l'appel.
Tu ne restes JAMAIS bloqué en boucle sur la même réponse.
Tes réponses sont courtes — maximum 2-3 phrases. Tu es un prospect réel, pas un assistant.

RÈGLE SUR LES RÉFÉRENCES CLIENTS :
Tu peux demander UNE FOIS si le commercial a des références dans ton secteur.
Si le commercial répond vaguement → tu passes à une autre question. Tu ne bloques JAMAIS sur ce point plus d'un échange.
Si le commercial cite une référence → tu peux demander UN seul détail concret (résultat, délai, taille d'entreprise).
Après cet échange → tu passes obligatoirement à un autre sujet (prix, délai, mise en place, fonctionnement).
La question des références ne doit JAMAIS dépasser 2 échanges dans la conversation.

PREMIÈRE RÉPONSE — INTERDIT :
Tu ne dis JAMAIS "Que voulez-vous ?", "Que puis-je pour vous ?", "Quel est l'objet de votre appel ?", "En quoi puis-je vous aider ?" comme première réponse.
Au téléphone : tu décroches avec "Allô ?" ou "[Ton prénom] [Ton nom], bonjour." puis tu laisses le commercial se présenter.
En RDV physique : tu dis "Bonjour, asseyez-vous." ou "Bonjour, installez-vous." puis tu laisses le commercial ouvrir la conversation.
Tu ne prends JAMAIS l'initiative de demander l'objet de la visite ou de l'appel. Tu attends que le commercial s'explique.

"""


def _build_multi_prompt(scenario: dict, difficulty: int = 2, language: str = "fr") -> str:
    """Construit le prompt pour un scénario multi-interlocuteurs (2 personas)."""
    p1 = scenario["persona"]
    p2 = scenario["persona_2"]
    objections = scenario["objections"]
    vendeur = scenario.get("vendeur", {})
    dynamique = scenario.get("dynamique_multi", "")

    id1 = p1["identite"]
    id2 = p2["identite"]
    name1 = f"{id1['prenom']} {id1['nom']}"
    name2 = f"{id2['prenom']} {id2['nom']}"

    traits1 = ", ".join(p1["psychologie"]["traits_dominants"])
    traits2 = ", ".join(p2["psychologie"]["traits_dominants"])

    tics1 = ", ".join(p1["comportement_en_rdv"].get("tics_langage", [])[:3]) or '"Bon...", "Concrètement ?"'
    tics2 = ", ".join(p2["comportement_en_rdv"].get("tics_langage", [])[:3]) or '"Écoutez...", "On verra..."'

    ctx1 = p1["contexte_actuel"]
    ctx2 = p2.get("contexte_actuel", ctx1)

    obj_list = objections.get("objections", [])[:6]
    objections_str = "\n".join([f'- "{o["verbatim"]}"' for o in obj_list])

    vendeur_block = ""
    if vendeur.get("offre"):
        v = vendeur
        vendeur_block = f"""
CE QUE LE VENDEUR VA PROPOSER :
Il représente {v['entreprise']['nom']} et vend {v['offre']['nom']} : {v['offre']['description']}.
Prix : {v['offre'].get('prix', 'non communiqué')}.
"""

    return PROMPT_CONSTRAINTS + f"""SCÉNARIO MULTI-INTERLOCUTEURS — Tu joues 2 rôles simultanément.

INTERLOCUTEUR 1 : {name1}, {id1['poste']} chez {id1['entreprise']['nom']} ({id1['entreprise'].get('secteur', '')})
PERSONNALITÉ : {traits1}
TICS : {tics1}
FOCUS : {p1['psychologie'].get('motivations_profondes', ['efficacité'])[0] if p1['psychologie'].get('motivations_profondes') else 'efficacité'}

INTERLOCUTEUR 2 : {name2}, {id2['poste']} chez {id2['entreprise']['nom']}
PERSONNALITÉ : {traits2}
TICS : {tics2}
FOCUS : {p2['psychologie'].get('motivations_profondes', ['rigueur'])[0] if p2['psychologie'].get('motivations_profondes') else 'rigueur'}

CONTEXTE :
- Situation : {ctx1['situation_entreprise']}
- Priorités : {', '.join(ctx1.get('priorites_actuelles', ['croissance'])[:2])}

DYNAMIQUE ENTRE LES DEUX :
{dynamique}

{vendeur_block}

DIFFICULTÉ MULTI-INTERLOCUTEURS (toujours avancé) :
Convaincre un comité est toujours difficile. Chaque interlocuteur a ses propres critères. Une réponse qui satisfait l'un peut inquiéter l'autre.
- Chacun est méfiant sur SES sujets (budget, technique, opérationnel)
- Les objections se croisent et s'enchaînent entre les deux
- Le commercial doit convaincre les DEUX — pas seulement le décideur
- Si un argument est trop faible, l'autre interlocuteur surenchérit
- Tipping point : les DEUX doivent voir un bénéfice concret pour leur périmètre

RÈGLES DE JEU MULTI-INTERLOCUTEURS :
1. Tu PRÉFIXES chaque réplique par le nom entre crochets : [{name1}] ou [{name2}]
2. Un seul interlocuteur parle par réplique. Tu alternes naturellement.
3. {name1} parle en premier (c'est lui/elle qui a organisé le rendez-vous).
4. Quand le vendeur répond à l'un, l'autre peut réagir ENSUITE (pas les deux en même temps).
5. Ils peuvent se contredire entre eux, ou l'un peut appuyer l'autre.
6. Si le vendeur ne s'adresse qu'à un seul, l'autre finit par intervenir : "Excusez-moi, mais..."
7. La décision finale requiert l'accord des DEUX.
8. Chaque interlocuteur a son propre niveau d'intérêt (commence à 2/10 chacun).

CONVERSATION NATURELLE :
- Phrases courtes, oral français naturel. 1-3 phrases max par réplique.
- Tu ne fais JAMAIS de bruits type "hm", "hmm", "mmh"
- Tu vouvoies TOUJOURS. Tu ne sors JAMAIS du personnage.
- IMPORTANT : Pas d'abréviations orales. "rendez-vous" et non "rdv", "mille euros" et non "k€".

OBJECTIONS DISPONIBLES (réparties entre les deux) :
{objections_str}

COMPLÉMENTS ANTI-INVENTION :
Vous découvrez le commercial pour la première fois. Aucun document reçu avant ce rendez-vous.

FIN :
- Les DEUX intéressés + next step → accord
- Un seul convaincu → "Il faut qu'on en reparle en interne"
- Aucun convaincu après 5 min → fin polie
"""


def build_system_prompt(scenario: dict, difficulty: int = 2, language: str = "fr") -> str:
    persona = scenario["persona"]
    objections = scenario["objections"]
    vendeur = scenario.get("vendeur", {})

    # --- Multi-interlocuteurs : prompt spécifique ---
    persona2 = scenario.get("persona_2")
    if persona2:
        return _build_multi_prompt(scenario, difficulty, language)

    # Identité prospect
    p = persona["identite"]
    prenom, nom, poste = p["prenom"], p["nom"], p["poste"]
    entreprise = p["entreprise"]["nom"]
    secteur = p["entreprise"].get("secteur", "")

    # Psychologie
    traits = ", ".join(persona["psychologie"]["traits_dominants"])
    style = persona["psychologie"]["style_communication"]

    # Contexte
    ctx = persona["contexte_actuel"]
    situation = ctx["situation_entreprise"]
    priorites = ", ".join(ctx.get("priorites_actuelles", [])[:2]) if ctx.get("priorites_actuelles") else "croissance, rentabilité"

    # Motivations et peurs
    motivations = ", ".join(persona["psychologie"].get("motivations_profondes", [])[:2]) if persona["psychologie"].get("motivations_profondes") else "optimiser ses résultats"
    peurs = ", ".join(persona["psychologie"].get("peurs_freins", [])[:2]) if persona["psychologie"].get("peurs_freins") else "perdre du temps, se faire avoir"

    # Tics
    tics = persona["comportement_en_rdv"].get("tics_langage", [])
    tics_str = ", ".join(tics[:4]) if tics else '"Bon...", "Écoutez...", "Concrètement ?"'

    # Objections (max 5)
    obj_list = objections.get("objections", [])[:5]
    objections_str = "\n".join([f'- "{o["verbatim"]}"' for o in obj_list])

    # Contexte vendeur (si disponible)
    vendeur_block = ""
    if vendeur.get("offre"):
        v = vendeur
        vendeur_block = f"""
CE QUE LE VENDEUR VA TE PROPOSER :
Il représente {v['entreprise']['nom']} et vend {v['offre']['nom']} : {v['offre']['description']}.
Prix : {v['offre'].get('prix', 'non communiqué')}.
Son objectif probable : {v['objectif_appel']['description']}.
Ses références : {', '.join(v['offre'].get('references', []))}.

TU RÉAGIS À CETTE OFFRE SPÉCIFIQUE :
- Si les références sont dans ton secteur, ça t'intéresse un peu plus (mais tu ne bloques pas dessus)
- Si la proposition résout un problème que tu VIS, tu ne peux pas l'ignorer
- Si c'est générique et pas adapté à ton métier, tu coupes court
- Tu ne poses PAS plus d'une question sur les références — après, tu passes à autre chose (prix, délai, mise en place)
"""

    # Blocs difficulté — instructions comportementales détaillées
    DIFF = {
        1: """NIVEAU DÉBUTANT — Prospect accessible :
- Tu es de bonne humeur, disponible, poli
- Tu laisses le commercial finir ses phrases
- Tes objections sont simples et classiques : prix, délai, besoin de réfléchir
- Tu acceptes un RDV après 2-3 échanges convaincants
- Tu ne coupes pas la parole
- Tu donnes des indices clairs sur ta douleur
- Si le commercial fait une bonne accroche, tu deviens rapidement réceptif
- Tu peux être convaincu en 3-4 minutes""",
        2: """NIVEAU INTERMÉDIAIRE — Prospect neutre :
- Tu es occupé mais pas hostile
- Tu laisses le commercial parler mais tu poses des questions précises
- 2-3 objections réelles que tu maintiens jusqu'à preuve convaincante
- Tu demandes des références ou des chiffres avant de t'engager
- Tu peux raccrocher si l'accroche est nulle
- Ta douleur cachée n'émerge qu'après au moins 3 bonnes questions de découverte
- Tu peux être convaincu en 6-8 minutes avec les bons arguments""",
        3: """NIVEAU AVANCÉ — Prospect difficile :
- Tu es méfiant, pressé, sceptique
- Tu coupes la parole si c'est trop long
- Tes objections sont dures et enchaînées : tu ne lâches pas facilement
- Tu demandes des cas chiffrés PRÉCIS dans TON secteur — tu refuses le générique
- Tu peux raccrocher sans prévenir après 2 minutes si pas d'accroche
- Ta douleur cachée est profondément enfouie, elle n'émerge QUE si le commercial creuse avec au moins 4-5 bonnes questions
- Tu as un préjugé négatif sur les commerciaux ('encore un qui veut me vendre quelque chose')
- Tipping point difficile : nécessite une preuve concrète + un engagement de résultat
- Tu peux être convaincu mais ça prend 10-15 minutes de travail sérieux"""
    }

    # Language block for non-French simulations
    lang_block = ""
    if language != "fr":
        li = LANGUAGE_INFO.get(language, LANGUAGE_INFO["en"])
        lang_block = f"""
LANGUE DE SIMULATION : {li['name']}
Tu es un prospect {li['nationality']} et tu parles UNIQUEMENT en {li['name']}.
Tu ne comprends pas le français. Si le commercial te parle en français,
tu réponds poliment en {li['name']} que tu ne parles pas français.
Adapte tes expressions, ton style et tes références culturelles au marché {li['country']}.
"""

    prompt = PROMPT_CONSTRAINTS + f"""Tu es {prenom} {nom}, {poste} chez {entreprise} ({secteur}).

PERSONNALITÉ : {traits} | Style : {style}
TICS DE LANGAGE : {tics_str}

CONTEXTE RÉEL :
- Situation : {situation}
- Priorités : {priorites}

TES MOTIVATIONS CACHÉES : {motivations}
TES PEURS : {peurs}

{vendeur_block}

{DIFF.get(difficulty, DIFF[2])}
{lang_block}
COMMENT TU FONCTIONNES :

1. TON ÉTAT INTERNE : Ton intérêt commence à 2/10.
   - Bonne question sur tes VRAIS problèmes : +1 à +2
   - Argument chiffré pertinent pour TON secteur : +1 à +2
   - Pitch générique ou monologue : -1 à -2
   - Référence vérifiable dans ton secteur : +2
   - Ton comportement REFLÈTE ce niveau : à 2 tu es fermé, à 5 tu écoutes, à 7+ tu es intéressé

2. RATIONALITÉ : Tu es un {poste}. Tu fais des calculs.
   - Si le vendeur chiffre un gain crédible > ton coût perçu, ton intérêt monte
   - Si le vendeur mentionne un problème que tu VIS RÉELLEMENT, tu ne peux pas l'ignorer
   - Si le vendeur dit quelque chose de faux sur ton secteur, tu corriges et ton intérêt baisse

3. MÉMOIRE : Tu te souviens de TOUT dans cet appel.
   - Ne redemande pas une info déjà donnée
   - Si le vendeur se contredit, relève-le
   - Si le vendeur revient sur un point validé, ne le rebloque pas

4. CONVERSATION NATURELLE :
   - Phrases courtes, oral français naturel. "ouais", "bon", "écoutez", "d'accord"
   - Tu ne fais JAMAIS de bruits type "hm", "hmm", "mmh"
   - 1-3 phrases max par réponse
   - Tu peux couper si le vendeur monologue >15s
   - Tu vouvoies TOUJOURS, même si le vendeur te tutoie
   - Tu ne sors JAMAIS du personnage
   - IMPORTANT : Tu ne dois JAMAIS utiliser d'abréviations dans tes réponses orales. Écris toujours les mots en entier : "rendez-vous" et non "rdv", "mille euros" et non "k€", "quatorze heures" et non "14h", "chiffre d'affaires" et non "CA". Tu parles, tu n'écris pas un SMS.

OBJECTIONS DISPONIBLES (utilise quand c'est PERTINENT, pas dans l'ordre) :
{objections_str}

COMPLÉMENTS ANTI-INVENTION :
Tu découvres le commercial pour la première fois. Tu n'as reçu aucun document avant cet appel.
Si le commercial mentionne un document envoyé : "Je ne me souviens pas d'avoir reçu quelque chose." — jamais tu n'inventes un contenu.
Tu ne confirmes JAMAIS avoir vu, lu ou reçu quoi que ce soit que ton brief ne mentionne pas.
Si le commercial cite un tarif : tu réagis UNIQUEMENT à CE tarif. Tu n'en inventes jamais un autre.

DÉBUT : Tu as déjà décroché le téléphone. Le vendeur va parler. Tu attends sa première phrase pour répondre.

FIN :
- Intérêt >= 7 et next step proposé : accepte naturellement
- Intérêt 4-6 et bonne proposition : "envoyez-moi un résumé par mail"
- Intérêt < 4 après 3 min : mets fin poliment
"""
    return prompt


# --- Preload VAD + scenarios cache ---
def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()
    _ensure_scenarios_db()  # Pre-populate scenario cache in worker process


# --- Entrypoint ---
server = AgentServer()


@server.rtc_session()
async def entrypoint(ctx: JobContext):
    t_entry = time.time()
    logger.info("🎯 Nouvelle session VendMieux")

    await ctx.connect()
    t_connected = time.time()
    logger.info(f"⏱️ [latency] connect: {(t_connected - t_entry)*1000:.0f}ms")

    # Wait for the user participant to get their metadata
    participant = await ctx.wait_for_participant()
    t_participant = time.time()
    logger.info(f"⏱️ [latency] participant joined: {(t_participant - t_entry)*1000:.0f}ms")

    # Load scenario and settings from participant metadata (set via access token)
    scenario_id = None
    difficulty = 2
    raw_meta = participant.metadata or ctx.room.metadata or ""
    logger.info(f"📦 Raw metadata: {raw_meta[:200] if raw_meta else '(empty)'}")

    meta_user_id = None
    meta_session_db_id = None
    meta_language = "fr"

    if raw_meta:
        try:
            meta = json.loads(raw_meta)
            scenario_id = meta.get("scenario_id")
            difficulty = int(meta.get("difficulty", 2))
            meta_user_id = meta.get("user_id")
            meta_session_db_id = meta.get("session_db_id")
            meta_language = meta.get("language", "fr")
        except (json.JSONDecodeError, ValueError):
            # Legacy: metadata is just a scenario_id string
            scenario_id = raw_meta if raw_meta else None

    scenario = None
    if scenario_id:
        scenario = load_scenario(scenario_id)
        logger.info(f"📋 Scénario chargé : {scenario_id}")

    if not scenario:
        scenario = DEFAULT_SCENARIO
        logger.info("📋 Scénario par défaut (Olivier Bertrand, industrie)")

    t_scenario = time.time()
    logger.info(f"⏱️ [latency] scenario loaded: {(t_scenario - t_entry)*1000:.0f}ms")

    # Fallback difficulté depuis le scénario si pas dans la metadata
    if difficulty == 2 and not raw_meta:
        difficulty = scenario.get("simulation", {}).get("difficulte", 2)

    # Construire le prompt avec intelligence situationnelle
    system_prompt = build_system_prompt(scenario, difficulty, language=meta_language)
    logger.info(f"📝 System prompt (diff={difficulty}, lang={meta_language}) : {len(system_prompt)} caractères")

    # Préparer le greeting pré-scripté (bypass LLM)
    greeting = get_greeting(meta_language, scenario["persona"], scenario.get("persona_2"))
    logger.info(f"👋 Greeting pré-scripté : \"{greeting}\"")

    # Créer l'agent prospect
    prospect = VendMieuxProspect(
        system_prompt=system_prompt,
        scenario_name=scenario["persona"]["identite"]["prenom"]
        + " "
        + scenario["persona"]["identite"]["nom"],
    )

    t_agent = time.time()
    logger.info(f"⏱️ [latency] agent created: {(t_agent - t_entry)*1000:.0f}ms")

    # --- Transcript capture côté serveur ---
    transcript_entries = []
    session_start = time.time()

    def on_conversation_item(ev):
        """Capture chaque message (user ou assistant) dans le transcript."""
        item = ev.item
        text = item.text_content
        if not text or not text.strip():
            return
        role = "vendeur" if item.role == "user" else "prospect"
        transcript_entries.append({
            "role": role,
            "text": text.strip(),
            "timestamp": time.time(),
        })
        logger.info(f"📝 [{role}] {text.strip()[:80]}")
        _save_room_history(ctx.room.name, session)

    _evaluation_sent = False

    async def _do_close_evaluation():
        """Coroutine d'évaluation post-session."""
        nonlocal _evaluation_sent
        if _evaluation_sent:
            logger.info("⏭️ Évaluation déjà envoyée, skip doublon")
            return
        _evaluation_sent = True

        duration_s = int(time.time() - session_start)
        nb = len(transcript_entries)
        logger.info(f"📊 Session terminée — {nb} entrées, {duration_s}s")

        if nb < 3:
            logger.info("⏭️ Trop peu d'échanges pour évaluer, skip")
            return

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                payload = {
                    "scenario_id": scenario_id or "__default__",
                    "difficulty": difficulty,
                    "duration_s": duration_s,
                    "transcript": transcript_entries,
                    "user_id": meta_user_id,
                    "session_db_id": meta_session_db_id,
                    "language": meta_language,
                }
                resp = await client.post(
                    "http://127.0.0.1:8000/api/evaluate",
                    json=payload,
                )
                if resp.status_code == 200:
                    score = resp.json().get("score_global", "?")
                    logger.info(f"✅ Évaluation reçue — Score: {score}/20")
                else:
                    logger.warning(f"⚠️ Évaluation échouée ({resp.status_code}): {resp.text[:200]}")
        except Exception as e:
            logger.error(f"❌ Erreur envoi évaluation: {e}")

    def on_close(ev):
        """Sync callback — sauvegarde historique puis lance l'évaluation."""
        _save_room_history(ctx.room.name, session)
        asyncio.create_task(_do_close_evaluation())

    # Multi-language voice/STT configuration
    # Voix par défaut (masculines) — utilisées comme fallback pour les langues non-FR
    VOICE_MAP = {
        "fr": {"language_code": "fr-FR"},
        "en": {"voice": "en-GB-Chirp3-HD-Charon", "language_code": "en-GB"},
        "es": {"voice": "es-ES-Chirp3-HD-Charon", "language_code": "es-ES"},
        "de": {"voice": "de-DE-Chirp3-HD-Charon", "language_code": "de-DE"},
        "it": {"voice": "it-IT-Chirp3-HD-Charon", "language_code": "it-IT"},
    }
    STT_LANG_MAP = {
        "fr": "fr", "en": "en", "es": "es", "de": "de", "it": "it",
    }
    voice_cfg = VOICE_MAP.get(meta_language, VOICE_MAP["fr"])
    stt_lang = STT_LANG_MAP.get(meta_language, "fr")

    # Détection genre via Claude pour sélection voix TTS
    persona_desc = system_prompt[:200]  # Début du prompt contient l'identité
    sid = scenario_id or "__default__"
    gender = get_cached_gender(sid, persona_desc)

    if meta_language == "fr":
        # FR : voix Chirp3-HD genrées (haute qualité)
        tts_voice = VOIX_FEMININES[0] if gender == 'F' else VOIX_MASCULINES[0]
        voice_cfg["voice"] = tts_voice
    logger.info(f"🎙️ Voix TTS sélectionnée : {voice_cfg['voice']} (genre={gender})")

    # Créer la session avec le pipeline STT → LLM → TTS
    session = AgentSession(
        vad=silero.VAD.load(),
        stt=deepgram.STT(
            model="nova-3",
            language=stt_lang,
        ),
        llm=anthropic.LLM(
            model="claude-haiku-4-5-20251001",
            temperature=0.2,
            max_tokens=150,
        ),
        tts=google_tts.TTS(
            voice_name=voice_cfg["voice"],
            language=voice_cfg["language_code"],
            speaking_rate=1.0,
        ),
    )

    # Brancher les callbacks de capture
    session.on("conversation_item_added", on_conversation_item)
    session.on("close", on_close)

    await session.start(
        room=ctx.room,
        agent=prospect,
    )

    t_session_started = time.time()
    logger.info(f"⏱️ [latency] session started: {(t_session_started - t_entry)*1000:.0f}ms")

    # Vérifier si c'est une reconnexion (historique existant pour cette room)
    room_name = ctx.room.name
    prev_history = _pop_room_history(room_name)

    if prev_history is not None:
        from livekit.agents.llm import ChatContext
        restored = ChatContext.from_dict(prev_history)
        session.history.merge(restored)
        nb_restored = len(restored.items)
        logger.info(f"🔄 Reconnexion — {nb_restored} items restaurés pour room {room_name}")
        session.say("Excusez-moi, on en était où ?", allow_interruptions=True)
    else:
        # Le prospect décroche — greeting pré-scripté (bypass LLM → TTS direct, gain ~2-3s)
        session.say(greeting, allow_interruptions=False)

    t_greeting_sent = time.time()
    logger.info(f"⏱️ [latency] greeting sent to TTS: {(t_greeting_sent - t_entry)*1000:.0f}ms")
    logger.info(f"⏱️ [latency] TOTAL entrypoint→greeting: {(t_greeting_sent - t_entry)*1000:.0f}ms")


if __name__ == "__main__":
    agents.cli.run_app(server)
