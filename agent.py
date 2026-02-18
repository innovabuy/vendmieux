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
import time
import logging
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
from livekit.plugins import deepgram, silero, anthropic
from livekit.plugins import google as google_tts

from tts_utils import normalize_tts_stream


load_dotenv()
logger = logging.getLogger("vendmieux")
logger.setLevel(logging.INFO)

# --- Répertoire des scénarios ---
SCENARIOS_DIR = Path(__file__).parent / "scenarios"


def load_scenario(scenario_id: str) -> dict | None:
    """Charge un scénario depuis la base intégrée ou le dossier scenarios/"""
    # 1. Vérifier la base de scénarios intégrée
    from scenarios_database import load_scenarios_database
    db = load_scenarios_database()
    if scenario_id in db:
        return db[scenario_id]
    # 2. Fallback sur les fichiers JSON (scénarios générés)
    filepath = SCENARIOS_DIR / f"{scenario_id}.json"
    if filepath.exists():
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    return None


class VendMieuxProspect(Agent):
    """Agent qui joue le rôle d'un prospect pour VendMieux"""

    def __init__(self, system_prompt: str, scenario_name: str = ""):
        super().__init__(
            instructions=system_prompt,
        )
        self.scenario_name = scenario_name
        logger.info(f"🎭 Prospect VendMieux initialisé : {scenario_name}")

    async def tts_node(
        self,
        text: AsyncIterable[str],
        model_settings: ModelSettings,
    ) -> AsyncIterable[rtc.AudioFrame]:
        """Override pour normaliser le texte avant envoi au TTS Google."""
        normalized_text = normalize_tts_stream(text)
        async for frame in super().tts_node(normalized_text, model_settings):
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


def build_system_prompt(scenario: dict, difficulty: int = 2, language: str = "fr") -> str:
    persona = scenario["persona"]
    objections = scenario["objections"]
    vendeur = scenario.get("vendeur", {})

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
- Si les références sont dans ton secteur, ça t'intéresse un peu plus
- Si la proposition résout un problème que tu VIS, tu ne peux pas l'ignorer
- Si c'est générique et pas adapté à ton métier, tu coupes court
"""

    # Blocs difficulté
    DIFF = {
        1: "DIFFICULTÉ : Débutant. Tu es plutôt ouvert. Une bonne accroche suffit pour que tu écoutes. Tu acceptes un RDV facilement si le vendeur le propose correctement.",
        2: "DIFFICULTÉ : Intermédiaire. Tu ne donnes pas ta confiance facilement. Le vendeur doit poser 2-3 bonnes questions avant que tu t'ouvres. Si son argumentation est générique, tu coupes court. Si elle est pertinente, tu peux accepter un RDV.",
        3: "DIFFICULTÉ : Expert. Tu es redoutable. Tu interromps, tu challenges tout, tu exiges des preuves. Tu ne lâches rien sans ROI chiffré et références vérifiables. Tu raccroches si le vendeur perd ton temps après 3 minutes."
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

    prompt = f"""Tu es {prenom} {nom}, {poste} chez {entreprise} ({secteur}).

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

DÉBUT : Le téléphone sonne. Tu décroches avec une phrase courte et naturelle. Ex: "Oui {nom}, j'écoute ?" ou "{entreprise} bonjour ?"

FIN :
- Intérêt >= 7 et next step proposé : accepte naturellement
- Intérêt 4-6 et bonne proposition : "envoyez-moi un résumé par mail"
- Intérêt < 4 après 3 min : mets fin poliment
"""
    return prompt


# --- Preload VAD ---
def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


# --- Entrypoint ---
server = AgentServer()


@server.rtc_session()
async def entrypoint(ctx: JobContext):
    logger.info("🎯 Nouvelle session VendMieux")

    await ctx.connect()

    # Charger le scénario et la difficulté depuis metadata (JSON ou string legacy)
    scenario_id = None
    difficulty = 2
    raw_meta = ctx.room.metadata or ""

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

    # Fallback difficulté depuis le scénario si pas dans la metadata
    if difficulty == 2 and not raw_meta:
        difficulty = scenario.get("simulation", {}).get("difficulte", 2)

    # Construire le prompt avec intelligence situationnelle
    system_prompt = build_system_prompt(scenario, difficulty, language=meta_language)
    logger.info(f"📝 System prompt (diff={difficulty}, lang={meta_language}) : {len(system_prompt)} caractères")

    # Créer l'agent prospect
    prospect = VendMieuxProspect(
        system_prompt=system_prompt,
        scenario_name=scenario["persona"]["identite"]["prenom"]
        + " "
        + scenario["persona"]["identite"]["nom"],
    )

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

    async def _do_close_evaluation():
        """Coroutine d'évaluation post-session."""
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
        """Sync callback — lance l'évaluation async via create_task."""
        asyncio.create_task(_do_close_evaluation())

    # Multi-language voice/STT configuration
    VOICE_MAP = {
        "fr": {"voice": "fr-FR-Chirp3-HD-Charon", "language_code": "fr-FR"},
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

    # Créer la session avec le pipeline STT → LLM → TTS
    session = AgentSession(
        vad=silero.VAD.load(),
        stt=deepgram.STT(
            model="nova-3",
            language=stt_lang,
        ),
        llm=anthropic.LLM(
            model="claude-haiku-4-5-20251001",
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

    # Le prospect décroche — première réplique
    await session.generate_reply(
        instructions="Le téléphone sonne. Tu décroches. Dis une courte phrase d'accueil naturelle comme un DG qui reçoit un appel. Maximum 5 mots."
    )


if __name__ == "__main__":
    agents.cli.run_app(server)
