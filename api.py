"""
VendMieux — API Backend V2
Endpoints :
1. Générer un token LiveKit (connexion à une room) — avec difficulté
2. Créer un scénario depuis une description
3. Lister les scénarios disponibles
4. POST /api/evaluate — Évaluation FORCE 3D post-appel
5. POST /api/demo/create — Créer un lien démo école
6. GET /demo/{token} — Page démo standalone
7. Auth (register, login, me)
8. Dashboard commercial (stats, historique, session, radar)
9. Dashboard manager (equipe, stats, commercial)
"""

import asyncio
import hashlib as _hashlib_mod
import json
import os
import re
import uuid
from datetime import datetime, timedelta
from pathlib import Path

import aiosqlite
import anthropic
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse, StreamingResponse
from pydantic import BaseModel
from livekit.api import AccessToken, VideoGrants

from database import (
    init_db, create_demo, get_demo, use_demo_session, save_evaluation, save_demo_session,
    create_entreprise, create_user, get_user_by_email, update_last_login,
    create_session, complete_session, get_user_evaluations, get_user_stats,
    get_evaluation_detail, get_team_members, get_team_stats,
    COMPETENCE_KEYS, _parse_competences, DB_PATH,
    get_all_scenario_templates, get_scenario_from_db, save_scenario_to_db,
)
from auth import (
    hash_password, verify_password, create_token, get_current_user, get_optional_user,
)
from scenarios_database import load_scenarios_database, get_sectors, get_simulation_types

load_dotenv()

app = FastAPI(title="VendMieux API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://vendmieux.fr"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# --- Security + Cache headers middleware ---
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: StarletteRequest, call_next):
        response = await call_next(request)
        # Security headers
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Permissions-Policy"] = "geolocation=()"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' data: https://fonts.gstatic.com; "
            "img-src 'self' data:; "
            "connect-src 'self' https://vendmieux.fr wss://*.livekit.cloud https://*.livekit.cloud https://cdn.jsdelivr.net; "
            "media-src 'self' blob:; "
            "worker-src 'self' blob:"
        )
        # Cache: immutable for hashed assets, short for HTML
        path = request.url.path
        if path.startswith("/assets/"):
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# --- Rate limiting ---
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

import hashlib
import time as _time

# --- Demo rate limiting (in-memory) ---
_demo_rate: dict[str, list[float]] = {}

def _hash_ip(ip: str) -> str:
    return hashlib.sha256(ip.encode()).hexdigest()[:16]

def _check_demo_rate_limit(ip: str) -> bool:
    h = _hash_ip(ip)
    now = _time.time()
    _demo_rate[h] = [t for t in _demo_rate.get(h, []) if now - t < 86400]
    if len(_demo_rate.get(h, [])) >= 3:
        return False
    _demo_rate.setdefault(h, []).append(now)
    return True


SCENARIOS_DIR = Path(__file__).parent / "scenarios"
SCENARIOS_DIR.mkdir(exist_ok=True)
STATIC_DIR = Path(__file__).parent / "static"
STATIC_DIR.mkdir(exist_ok=True)

_SPA_NO_CACHE = {"Cache-Control": "no-cache, no-store, must-revalidate"}


# --- Pydantic models ---

class TokenRequest(BaseModel):
    scenario_id: str | None = None
    difficulty: int = 2
    user_name: str = "Commercial"
    language: str = "fr"
    demo: bool = False

class ScenarioRequest(BaseModel):
    description: str
    scenario_id: str | None = None
    sector: str | None = None
    type: str | None = None
    language: str = "fr"

class TranscriptEntry(BaseModel):
    role: str
    text: str
    timestamp: float = 0

class EvaluateRequest(BaseModel):
    session_id: str = ""
    transcript: str | list[TranscriptEntry] = ""
    scenario_id: str = "__default__"
    difficulty: int = 2
    duration_s: int = 0
    user_id: str | None = None
    session_db_id: str | None = None
    language: str = "fr"

class DemoCreateRequest(BaseModel):
    nom_ecole: str
    nb_sessions: int = 3
    scenario_id: str = "__default__"
    difficulty: int = 2
    expire_days: int = 7
    contact_email: str | None = None

class RegisterRequest(BaseModel):
    email: str
    password: str
    nom: str
    prenom: str
    entreprise_nom: str = ""

class LoginRequest(BaseModel):
    email: str
    password: str

class TTSIntroRequest(BaseModel):
    text: str
    voice: str = "fr-FR-Wavenet-C"
    language_code: str = "fr-FR"
    speaking_rate: float = 1.0


# --- Scenarios database (cached) ---
_SCENARIOS_DB: dict[str, dict] = {}


# --- Startup ---

@app.on_event("startup")
async def startup():
    global _SCENARIOS_DB
    await init_db()
    _SCENARIOS_DB = load_scenarios_database()
    (STATIC_DIR / "sounds" / "tts_cache").mkdir(parents=True, exist_ok=True)


# --- Helper: auto-categorize scenarios ---

_AUTO_CAT_KEYWORDS = {
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
                               "complaint", "retard de livraison",
                               "sav", "gestion de crise", "incident"],
    "relance_devis":          ["relance", "suivi", "rappel", "follow-up",
                               "follow up", "relance devis", "relance post",
                               "relance client", "sans nouvelles",
                               "recontacter"],
    "upsell":                 ["upsell", "up-sell", "montée en gamme",
                               "cross-sell", "cross sell", "fidélisation",
                               "renouvellement", "vente additionnelle",
                               "client existant", "client satisfait",
                               "service complémentaire", "upgrade",
                               "extension", "option supplémentaire"],
    "appel_entrant":          ["appel entrant", "entrant", "inbound",
                               "client appelle", "le client vous appelle",
                               "demande entrante", "lead entrant"],
    "prospection_telephonique": ["prospect", "cold call", "appel froid",
                                 "appel à froid", "prospection",
                                 "prise de contact", "premier contact",
                                 "contact froid", "démarchage",
                                 "outbound", "téléprospection",
                                 "vendre un", "vendre une", "vendre de",
                                 "vendre du", "vendre la", "vendre le",
                                 "convaincre un", "convaincre une",
                                 "convaincre le", "convaincre la"],
}


def _auto_categorize(titre: str, description: str = "") -> str:
    """Catégorise un scénario en fonction de son titre et description."""
    text = (titre + " " + description).lower()
    for categorie, mots in _AUTO_CAT_KEYWORDS.items():
        if any(mot in text for mot in mots):
            return categorie
    return "prospection_telephonique"


async def _get_scenario_types_from_db() -> dict[str, str]:
    """Retourne un dict {scenario_id: type_simulation} depuis la DB."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT id, type_simulation FROM scenarios WHERE type_simulation IS NOT NULL") as cur:
            rows = await cur.fetchall()
            return {r["id"]: r["type_simulation"] for r in rows}


# --- Helper: load scenario ---

def _load_scenario(scenario_id: str) -> dict:
    if scenario_id == "__default__":
        from agent import DEFAULT_SCENARIO
        return DEFAULT_SCENARIO
    # 1. Check database scenarios (in-memory from scenarios_database.py)
    if scenario_id in _SCENARIOS_DB:
        return _SCENARIOS_DB[scenario_id]
    # 2. Check enriched JSON files on disk
    filepath = SCENARIOS_DIR / f"{scenario_id}.json"
    if filepath.exists():
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    # 3. Not found
    raise HTTPException(404, "Scénario introuvable")


# --- Health check ---

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "vendmieux-api"}


# --- TTS Intro (immersion RDV physique) ---

@app.post("/api/tts/intro")
@limiter.limit("10/minute")
async def tts_intro(req: TTSIntroRequest, request: Request):
    """Synthesize short TTS clip for office intro sequence. Returns cached URL."""
    if len(req.text) > 200:
        raise HTTPException(400, "Texte trop long (max 200 caractères)")

    cache_key = _hashlib_mod.md5(
        f"{req.text}|{req.voice}|{req.language_code}|{req.speaking_rate}".encode()
    ).hexdigest()
    cache_path = STATIC_DIR / "sounds" / "tts_cache" / f"{cache_key}.mp3"
    url = f"/static/sounds/tts_cache/{cache_key}.mp3"

    if cache_path.exists():
        return {"url": url}

    from google.cloud import texttospeech

    def _synthesize():
        client = texttospeech.TextToSpeechClient()
        synthesis_input = texttospeech.SynthesisInput(text=req.text)
        voice = texttospeech.VoiceSelectionParams(
            language_code=req.language_code, name=req.voice
        )
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=req.speaking_rate,
        )
        return client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )

    response = await asyncio.to_thread(_synthesize)
    cache_path.write_bytes(response.audio_content)
    return {"url": url}


# --- Existing endpoints ---

@app.get("/")
async def serve_frontend(request: Request):
    html = _load_prerendered_or_fallback("/")
    html = _inject_seo_meta(html, request.url.path)
    return HTMLResponse(content=html, headers=_SPA_NO_CACHE)


@app.post("/api/token")
async def get_token(req: TokenRequest, request: Request, user: dict | None = Depends(get_optional_user)):
    api_key = os.environ.get("LIVEKIT_API_KEY")
    api_secret = os.environ.get("LIVEKIT_API_SECRET")
    livekit_url = os.environ.get("LIVEKIT_URL")

    if not api_key or not api_secret:
        raise HTTPException(500, "LiveKit credentials not configured")

    is_demo = req.demo
    client_ip = request.client.host if request.client else "unknown"

    if is_demo:
        # Demo mode: rate limit by IP (3 per 24h), no auth required
        if not _check_demo_rate_limit(client_ip):
            raise HTTPException(429, "Limite de démos atteinte (3 par 24h). Créez un compte pour continuer.")
        user_id = None
    else:
        # Normal mode: anonymous users can only use __default__ scenario
        effective_scenario = req.scenario_id or "__default__"
        if not user and effective_scenario != "__default__":
            raise HTTPException(
                401,
                "Inscription requise pour accéder aux scénarios avancés. Créez votre compte gratuitement."
            )
        user_id = user["id"] if user else None

    room_name = f"vm-{uuid.uuid4().hex[:8]}"
    identity = f"user-{uuid.uuid4().hex[:6]}"

    # Create a DB session
    session_db_id = None
    if is_demo:
        session_db_id = await create_session(
            user_id=None,
            scenario_id=req.scenario_id or "demo_bertrand_prospection_froide_v1",
            difficulty=req.difficulty,
            livekit_room_id=room_name,
            language=req.language,
            is_demo=True,
            ip_hash=_hash_ip(client_ip),
        )
    elif user:
        session_db_id = await create_session(
            user_id=user_id,
            scenario_id=req.scenario_id or "__default__",
            difficulty=req.difficulty,
            livekit_room_id=room_name,
            language=req.language,
        )

    # Room metadata now carries JSON with scenario_id + difficulty + optional user info
    room_metadata = json.dumps({
        "scenario_id": req.scenario_id or ("demo_bertrand_prospection_froide_v1" if is_demo else "__default__"),
        "difficulty": req.difficulty,
        "user_id": user_id,
        "session_db_id": session_db_id,
        "language": req.language,
    })

    token = (
        AccessToken(api_key, api_secret)
        .with_identity(identity)
        .with_name(req.user_name)
        .with_grants(
            VideoGrants(
                room_join=True,
                room=room_name,
            )
        )
        .with_metadata(room_metadata)
        .with_ttl(timedelta(minutes=10))
    )

    return {
        "token": token.to_jwt(),
        "url": livekit_url,
        "room": room_name,
        "identity": identity,
        "session_db_id": session_db_id,
    }


@app.get("/api/scenarios/{scenario_id}")
async def get_scenario(scenario_id: str):
    return _load_scenario(scenario_id)


@app.get("/api/scenarios/{scenario_id}/brief")
async def get_scenario_brief(scenario_id: str):
    """Retourne le brief commercial d'un scénario."""
    scenario = _load_scenario(scenario_id)
    brief = scenario.get("brief_commercial")
    if not brief:
        raise HTTPException(404, "Pas de brief commercial pour ce scénario")
    return brief


def _auto_difficulty(type_sim: str, default: int = 2) -> int:
    """Auto-assign difficulty based on type_simulation when not explicitly set."""
    hard = {"barrage_secretaire", "multi_interlocuteurs", "negociation"}
    easy = {"gestion_reclamation", "appel_entrant"}
    if type_sim in hard:
        return 3
    if type_sim in easy:
        return 1
    return default


def _infer_disc_from_style(style: str, traits: list) -> dict:
    """Infer a simplified DISC profile from communication style and traits."""
    profiles = {
        "directif": {"D": 80, "I": 30, "S": 20, "C": 40},
        "analytique": {"D": 40, "I": 20, "S": 30, "C": 80},
        "expressif": {"D": 30, "I": 80, "S": 40, "C": 20},
        "aimable": {"D": 20, "I": 40, "S": 80, "C": 30},
    }
    base = profiles.get(style, profiles["directif"])
    # Slight variation from traits
    trait_str = " ".join(traits).lower() if traits else ""
    if "direct" in trait_str or "pragmatique" in trait_str:
        base["D"] = min(100, base["D"] + 10)
    if "chaleureu" in trait_str or "expressif" in trait_str:
        base["I"] = min(100, base["I"] + 10)
    if "rigoureu" in trait_str or "méthodique" in trait_str:
        base["C"] = min(100, base["C"] + 10)
    return base


def _extract_preview_fields(full_data: dict) -> dict:
    """Extract enriched fields from a full scenario for the list endpoint."""
    persona = full_data.get("persona", {})
    identite = persona.get("identite", {})
    psycho = persona.get("psychologie", {})
    contexte = persona.get("contexte_actuel", {})
    objections_data = full_data.get("objections", {})
    brief = full_data.get("brief_commercial", {})
    sim = full_data.get("simulation", {})

    # DISC profile
    style = psycho.get("style_communication", "directif")
    traits = psycho.get("traits_dominants", [])
    disc = _infer_disc_from_style(style, traits)

    # Objections preview (first 3 verbatims)
    obj_list = objections_data.get("objections", [])
    obj_preview = [o.get("verbatim", "") for o in obj_list[:3] if o.get("verbatim")]

    # Main objection type
    obj_type_principal = obj_list[0].get("type", "") if obj_list else ""

    # Douleur cachée
    situation = contexte.get("situation_entreprise", "")

    # Objectif commercial
    objectif = brief.get("votre_objectif", "")

    # Durée estimée
    duree = brief.get("duree_estimee", "5-8 minutes")

    # Nb interlocuteurs
    is_multi = sim.get("type", "") == "multi_interlocuteurs" or "prospect_2" in full_data
    nb_inter = "multi" if is_multi else "mono"

    # Gender
    genre = identite.get("genre", "M")

    # Taille entreprise
    taille = identite.get("entreprise", {}).get("taille", "")

    return {
        "gender": genre,
        "taille": taille,
        "disc": disc,
        "objections_preview": obj_preview,
        "objection_type_principal": obj_type_principal,
        "douleur_cachee": situation,
        "objectif_commercial": objectif,
        "duree_estimee": duree,
        "nb_interlocuteurs": nb_inter,
    }


@app.get("/api/scenarios")
async def list_scenarios(secteur: str = "", type: str = "", difficulty: int = 0, interlocuteurs: str = ""):
    scenarios = []
    seen_ids = set()

    # 1. Scénarios pré-enrichis depuis la table DB
    templates = await get_all_scenario_templates()
    for t in templates:
        persona = t.get("persona_json", {})
        if isinstance(persona, str):
            try:
                persona = json.loads(persona)
            except Exception:
                persona = {}
        brief = t.get("brief_json", {})
        if isinstance(brief, str):
            try:
                brief = json.loads(brief)
            except Exception:
                brief = {}
        tags = t.get("tags", "[]")
        if isinstance(tags, str):
            try:
                tags = json.loads(tags)
            except Exception:
                tags = []
        objections_json = t.get("objections_json", {})
        if isinstance(objections_json, str):
            try:
                objections_json = json.loads(objections_json)
            except Exception:
                objections_json = {}

        identite = persona.get("identite", {})
        entreprise = identite.get("entreprise", {})
        psycho = persona.get("psychologie", {})
        contexte = persona.get("contexte_actuel", {})
        style = psycho.get("style_communication", "directif")
        traits = psycho.get("traits_dominants", [])
        disc = _infer_disc_from_style(style, traits)
        obj_list = objections_json.get("objections", []) if isinstance(objections_json, dict) else []
        obj_preview = [o.get("verbatim", "") for o in obj_list[:3] if o.get("verbatim")]
        type_sim = t.get("type_simulation") or "prospection_telephonique"
        is_multi = type_sim == "multi_interlocuteurs"

        scenarios.append({
            "id": t["id"],
            "name": f"{identite.get('prenom', '?')} {identite.get('nom', '?')}",
            "poste": identite.get("poste", "?"),
            "entreprise": entreprise.get("nom", "?"),
            "secteur": t.get("secteur", entreprise.get("secteur", "?")),
            "type_simulation": type_sim,
            "titre": brief.get("titre", ""),
            "difficulty": _auto_difficulty(type_sim, t.get("difficulty_default", 2)),
            "tags": tags,
            "source": "template",
            "gender": identite.get("genre", "M"),
            "taille": entreprise.get("taille", ""),
            "disc": disc,
            "objections_preview": obj_preview,
            "objection_type_principal": obj_list[0].get("type", "") if obj_list else "",
            "douleur_cachee": contexte.get("situation_entreprise", ""),
            "objectif_commercial": brief.get("votre_objectif", ""),
            "duree_estimee": brief.get("duree_estimee", "5-8 minutes"),
            "nb_interlocuteurs": "multi" if is_multi else "mono",
        })
        seen_ids.add(t["id"])

    # 2. Scénarios de la base intégrée (scenarios_database.py)
    for sid, data in _SCENARIOS_DB.items():
        if sid in seen_ids:
            continue
        persona = data.get("persona", {}).get("identite", {})
        sim = data.get("simulation", {})
        preview = _extract_preview_fields(data)
        scenarios.append({
            "id": sid,
            "name": f"{persona.get('prenom', '?')} {persona.get('nom', '?')}",
            "poste": persona.get("poste", "?"),
            "entreprise": persona.get("entreprise", {}).get("nom", "?"),
            "secteur": sim.get("secteur", persona.get("entreprise", {}).get("secteur", "?")),
            "type_simulation": sim.get("type", "prospection_telephonique"),
            "titre": sim.get("titre", ""),
            "difficulty": sim.get("difficulte", 2),
            "tags": [],
            "source": "database",
            **preview,
        })
        seen_ids.add(sid)

    # 3. Scénarios générés par les utilisateurs (fichiers JSON)
    # Pre-load type_simulation from DB for categorized scenarios
    db_types = await _get_scenario_types_from_db()
    for f in sorted(SCENARIOS_DIR.glob("*.json")):
        if f.stem in seen_ids:
            continue
        try:
            with open(f, "r", encoding="utf-8") as fh:
                data = json.load(fh)
                persona_data = data.get("persona", {})
                identite = persona_data.get("identite", {})
                ent = identite.get("entreprise", {})
                psycho = persona_data.get("psychologie", {})
                contexte = persona_data.get("contexte_actuel", {})
                brief = data.get("brief_commercial", {})
                titre = brief.get("titre", "Scénario personnalisé")
                obj_data = data.get("objections", {})
                obj_list = obj_data.get("objections", []) if isinstance(obj_data, dict) else []

                # Use DB type_simulation if available, else auto-categorize
                type_sim = db_types.get(f.stem)
                if not type_sim or type_sim in ("Sur mesure", "custom"):
                    type_sim = _auto_categorize(
                        titre,
                        data.get("metadata", {}).get("description_originale", ""),
                    )

                style = psycho.get("style_communication", "directif")
                traits = psycho.get("traits_dominants", [])
                disc = _infer_disc_from_style(style, traits)
                is_multi = type_sim == "multi_interlocuteurs"

                scenarios.append({
                    "id": f.stem,
                    "name": f"{identite.get('prenom', '?')} {identite.get('nom', '?')}",
                    "poste": identite.get("poste", "?"),
                    "entreprise": ent.get("nom", "?"),
                    "secteur": ent.get("secteur", "?"),
                    "type_simulation": type_sim,
                    "titre": titre,
                    "difficulty": _auto_difficulty(type_sim, data.get("metadata", {}).get("difficulte_defaut", 2)),
                    "tags": data.get("metadata", {}).get("tags", []),
                    "source": "user",
                    "gender": identite.get("genre", "M"),
                    "taille": ent.get("taille", ""),
                    "disc": disc,
                    "objections_preview": [o.get("verbatim", "") for o in obj_list[:3] if o.get("verbatim")],
                    "objection_type_principal": obj_list[0].get("type", "") if obj_list else "",
                    "douleur_cachee": contexte.get("situation_entreprise", ""),
                    "objectif_commercial": brief.get("votre_objectif", ""),
                    "duree_estimee": brief.get("duree_estimee", "5-8 minutes"),
                    "nb_interlocuteurs": "multi" if is_multi else "mono",
                })
        except Exception:
            continue

    # 4. Filtrage
    if secteur:
        scenarios = [s for s in scenarios if s["secteur"].lower() == secteur.lower()]
    if type:
        scenarios = [s for s in scenarios if s["type_simulation"] == type]
    if difficulty > 0:
        scenarios = [s for s in scenarios if s.get("difficulty") == difficulty]
    if interlocuteurs in ("mono", "multi"):
        scenarios = [s for s in scenarios if s.get("nb_interlocuteurs") == interlocuteurs]

    # Collect all unique secteurs and types from current results + static lists
    all_secteurs = sorted(set(get_sectors() + [s["secteur"] for s in scenarios]))
    all_types = sorted(set(get_simulation_types() + [s["type_simulation"] for s in scenarios]))

    return {
        "scenarios": scenarios,
        "secteurs": all_secteurs,
        "types": all_types,
        "total": len(scenarios),
    }


@app.post("/api/scenarios/generate")
async def generate_scenario_endpoint(req: ScenarioRequest):
    if not req.description.strip():
        raise HTTPException(400, "Description vide")

    try:
        from generate_scenario import generate_scenario as gen
        # Enrich description with sector/type context if provided
        enriched = req.description
        if req.sector:
            enriched += f"\n[Secteur : {req.sector}]"
        if req.type:
            enriched += f"\n[Type d'appel : {req.type}]"

        scenario = await asyncio.to_thread(gen, enriched, req.scenario_id)

        # Save to DB
        await save_scenario_to_db(scenario, language=req.language)

        return {
            "success": True,
            "id": scenario["id"],
            "scenario_id": scenario["id"],
            "persona": scenario.get("persona", {}),
            "objections": scenario.get("objections", {}),
            "brief_commercial": scenario.get("brief_commercial", {}),
            "vendeur": scenario.get("vendeur", {}),
            "difficulty": 2,
            "metadata": scenario.get("metadata", {}),
        }
    except Exception as e:
        raise HTTPException(500, f"Erreur génération : {str(e)}")


# --- Evaluation endpoint ---

def _format_transcript(transcript) -> str:
    """Convertit le transcript (string ou array) en texte lisible."""
    if isinstance(transcript, str):
        return transcript
    lines = []
    for entry in transcript:
        role_label = "VENDEUR" if entry.role == "vendeur" else "PROSPECT"
        lines.append(f"{role_label}: {entry.text}")
    return "\n".join(lines)


EVAL_LANG_CONFIG = {
    "fr": {"instruction": "", "language_name": "français"},
    "en": {"instruction": "IMPORTANT: Write your ENTIRE evaluation in English. All field values (synthese, conseil, points_forts, points_progres, moment_cle, posture_commerciale, analyse_disc) must be in English.", "language_name": "English"},
    "es": {"instruction": "IMPORTANTE: Escribe TODA tu evaluación en español. Todos los valores (synthese, conseil, points_forts, points_progres, moment_cle, posture_commerciale, analyse_disc) deben estar en español.", "language_name": "español"},
    "de": {"instruction": "WICHTIG: Schreibe deine GESAMTE Bewertung auf Deutsch. Alle Feldwerte (synthese, conseil, points_forts, points_progres, moment_cle, posture_commerciale, analyse_disc) müssen auf Deutsch sein.", "language_name": "Deutsch"},
    "it": {"instruction": "IMPORTANTE: Scrivi TUTTA la tua valutazione in italiano. Tutti i valori (synthese, conseil, points_forts, points_progres, moment_cle, posture_commerciale, analyse_disc) devono essere in italiano.", "language_name": "italiano"},
}


def _build_evaluation_prompt(scenario: dict, transcript_text: str, difficulty: int, duration_s: int, language: str = "fr") -> str:
    """Prompt d'évaluation FORCE 3D envoyé à Claude Sonnet."""
    persona = scenario["persona"]
    p = persona["identite"]
    ent = p.get("entreprise", {})

    lang_cfg = EVAL_LANG_CONFIG.get(language, EVAL_LANG_CONFIG["fr"])
    lang_instruction = f"\n{lang_cfg['instruction']}\n" if lang_cfg["instruction"] else ""

    return f"""Tu es un expert en évaluation de compétences commerciales selon la méthode FORCE 3D.
{lang_instruction}

CONTEXTE DE LA SIMULATION :
- Prospect : {p.get("prenom", "?")} {p.get("nom", "?")}, {p.get("poste", "?")} chez {ent.get("nom", "?")}
- Secteur : {ent.get("secteur", "N/A")}
- Difficulté : {difficulty}/3
- Durée : {duration_s} secondes

TRANSCRIPT :
{transcript_text}

Évalue la performance du commercial sur 6 compétences. Pour chaque compétence, donne un score /20, cite les points forts et points de progrès avec les verbatims EXACTS du commercial, et donne un conseil actionnable.

COMPÉTENCES :

ACCROCHE : A-t-il capté l'attention en <15s ? Phrase personnalisée ? Évité le pitch d'entrée ?

DÉCOUVERTE : A-t-il posé des questions AVANT de pitcher ? Questions ouvertes orientées enjeux ? Écoute et rebond sur les réponses ?

CRÉATION D'ENJEU : A-t-il fait émerger le coût de l'inaction ? Le prospect a-t-il pris conscience d'un problème ? Impact chiffré ?

ARGUMENTATION : Arguments adaptés aux enjeux découverts ? Preuves et références ? Lien solution-problème spécifique ?

TRAITEMENT D'OBJECTIONS : A-t-il questionné l'objection plutôt que justifié ? Rebond vers les enjeux ? Calme et posture ?

ENGAGEMENT : Next step concret proposé ? Engagement obtenu ? Verrouillage (date, heure) ?

MOMENT CLÉ : Identifie LE moment de l'appel qui a fait basculer la conversation. C'est soit le moment où le commercial a perdu le prospect (erreur), soit le moment où il l'a convaincu (réussite). Cite les verbatims EXACTS des deux parties à ce moment précis.

POINTS DE PROGRÈS : Pour chaque point de progrès dans une compétence, tu dois OBLIGATOIREMENT fournir le verbatim exact du commercial ET la version améliorée. Le commercial doit voir côte à côte ce qu'il a dit et ce qu'il aurait dû dire. C'est la clé de la progression.

POSTURE COMMERCIALE :
Évalue le TON, L'ASSURANCE et la FORMULATION du commercial. Ce n'est pas ce qu'il dit, c'est COMMENT il le dit.

TON (/20) :
- Le commercial a-t-il un ton engageant, dynamique, professionnel ?
- Repère les moments où le ton est descendant (fin de phrase qui tombe = manque de conviction)
- Repère les moments où le ton est trop agressif ou trop mou
- Le rythme est-il adapté (pas trop rapide, pas trop lent) ?

ASSURANCE (/20) :
- Le commercial utilise-t-il des mots parasites qui trahissent le doute ? ("peut-être", "je pense", "éventuellement", "un petit peu", "en quelque sorte", "voilà")
- Ses phrases sont-elles affirmatives ou interrogatives quand elles ne devraient pas l'être ?
- Face aux objections, garde-t-il sa posture ou se dégonfle-t-il ?
- Laisse-t-il des silences de confiance ou comble-t-il les blancs nerveusement ?

FORMULATION (/20) :
- Les phrases sont-elles concises et percutantes ?
- Le vocabulaire est-il adapté au niveau du prospect (pas trop technique, pas trop vague) ?
- Utilise-t-il des questions fermées de validation ("Ça fait sens pour vous ?", "Vous voyez ce que je veux dire ?") ?
- Évite-t-il le jargon et les phrases creuses ("solution innovante", "accompagnement sur mesure") ?

ANALYSE DISC DU PROSPECT :
À partir du transcript, identifie le profil DISC du prospect :
- D (Dominance) : direct, impatient, orienté résultats, coupe la parole, veut des faits pas des sentiments
- I (Influence) : bavard, enthousiaste, aime la relation, digresse, réagit aux histoires et témoignages
- S (Stabilité) : prudent, posé, n'aime pas le changement, a besoin de réassurance, demande du temps
- C (Conformité) : analytique, demande des détails, des preuves, des chiffres, méfiant envers les promesses

Identifie le type principal et secondaire du prospect à partir de SES répliques (pas celles du commercial).
Puis évalue si le commercial a adapté son approche au profil DISC détecté.

Un commercial qui pitch 5 minutes de features à un profil D a tout faux.
Un commercial qui balance des chiffres secs à un profil I perd le lien.
Un commercial qui pousse à décider vite un profil S le braque.
Un commercial qui reste vague avec un profil C perd toute crédibilité.

Réponds UNIQUEMENT avec un objet JSON valide.
Pas de texte avant. Pas de texte après.
Pas de balises markdown. Pas de ```json.
Commence directement par {{ et termine par }}.
UNIQUEMENT du JSON :

{{
    "score_global": 0.0,
    "note_lettre": "A|B|C|D|E",
    "resultat_appel": "rdv_obtenu|mail_envoi|rappel_prevu|echec_poli|echec_dur",
    "competences": {{
        "accroche": {{
            "score": 0,
            "points_forts": ["Verbatim exact du commercial entre guillemets montrant ce qu'il a bien fait"],
            "points_progres": [
                {{
                    "ce_que_vous_avez_dit": "Verbatim exact du commercial",
                    "ce_qui_aurait_ete_mieux": "La formulation idéale à utiliser",
                    "pourquoi": "Explication courte de la différence d'impact"
                }}
            ],
            "conseil": "Conseil actionnable en 1 phrase"
        }},
        "decouverte": {{ "score": 0, "points_forts": [], "points_progres": [], "conseil": "" }},
        "creation_enjeu": {{ "score": 0, "points_forts": [], "points_progres": [], "conseil": "" }},
        "argumentation": {{ "score": 0, "points_forts": [], "points_progres": [], "conseil": "" }},
        "traitement_objections": {{ "score": 0, "points_forts": [], "points_progres": [], "conseil": "" }},
        "engagement": {{ "score": 0, "points_forts": [], "points_progres": [], "conseil": "" }}
    }},
    "synthese": "2-3 phrases",
    "conseil_prioritaire": "LA chose à travailler en 1 phrase",
    "moment_cle": {{
        "quand": "Le contexte précis du moment",
        "ce_que_vous_avez_dit": "Verbatim EXACT du commercial à ce moment",
        "ce_qui_aurait_ete_ideal": "La réponse idéale formulée comme un exemple à suivre",
        "pourquoi": "Explication en 1-2 phrases de pourquoi c'est le moment décisif"
    }},
    "posture_commerciale": {{
        "ton_general": {{
            "note": 0,
            "description": "Ex: Ton hésitant et monotone, manque d'énergie",
            "moments_positifs": ["Verbatim exact où le ton était bon + pourquoi"],
            "moments_a_ameliorer": [
                {{
                    "ce_que_vous_avez_dit": "Verbatim exact",
                    "probleme": "Ex: Voix descendante en fin de phrase",
                    "version_amelioree": "La même phrase reformulée avec le bon ton/énergie",
                    "conseil": "Conseil concret sur le ton à adopter"
                }}
            ]
        }},
        "assurance": {{
            "note": 0,
            "description": "Ex: Le commercial semble sûr de lui sur le produit mais perd confiance face aux objections",
            "marqueurs_confiance": ["Verbatims montrant de l'assurance"],
            "marqueurs_hesitation": [
                {{
                    "verbatim": "Verbatim exact montrant l'hésitation",
                    "indice": "Ex: utilisation de 'peut-être', phrases inachevées",
                    "reformulation": "Comment formuler la même idée avec assurance"
                }}
            ]
        }},
        "formulation": {{
            "note": 0,
            "description": "Ex: Trop de jargon technique, phrases trop longues",
            "points_forts": ["Formulations efficaces avec verbatim"],
            "points_a_ameliorer": [
                {{
                    "ce_que_vous_avez_dit": "Verbatim exact",
                    "probleme": "Ex: Phrase de 40 mots sans pause",
                    "version_amelioree": "Reformulation plus percutante et concise",
                    "principe": "Ex: Règle des 15 mots max par idée"
                }}
            ]
        }},
        "score_posture": 0,
        "conseil_posture": "Le conseil #1 pour améliorer sa posture globale"
    }},
    "analyse_disc": {{
        "profil_prospect": {{
            "type_principal": "D|I|S|C",
            "type_secondaire": null,
            "description": "Ex: Dominance forte avec composante Conformité",
            "indices_detectes": [
                "Ex: Coupe la parole après 10 secondes → Dominance",
                "Ex: Demande des chiffres concrets → Conformité"
            ]
        }},
        "adaptation_commerciale": {{
            "score_adaptation": 0,
            "ce_qui_a_marche": [
                {{
                    "verbatim": "Ce que le commercial a dit",
                    "pourquoi_adapte": "En quoi c'était adapté au profil DISC du prospect"
                }}
            ],
            "ce_qui_na_pas_marche": [
                {{
                    "verbatim": "Ce que le commercial a dit",
                    "pourquoi_inadapte": "En quoi c'était inadapté au profil DISC",
                    "ce_quil_aurait_fallu_dire": "Reformulation adaptée au profil DISC du prospect",
                    "principe_disc": "Ex: Avec un D, allez droit au but."
                }}
            ],
            "strategie_ideale": "En 3-4 phrases : comment ce prospect aurait dû être abordé selon son profil DISC."
        }}
    }}
}}

RÈGLES :
- Sois exigeant mais juste. 15/20 est un très bon score.
- Note en fonction du niveau de difficulté : un 12/20 en difficulté 3 vaut mieux qu'un 16/20 en difficulté 1.
- Les verbatims doivent être EXACTS (copiés du transcript).
- Si le commercial n'a pas du tout couvert une compétence, note 2/20 max.
- Le conseil prioritaire doit être concret et actionnable.
- Chaque point_progres est un objet avec ce_que_vous_avez_dit, ce_qui_aurait_ete_mieux et pourquoi.
- Le moment_cle est LE moment décisif qui a fait basculer l'appel (en bien ou en mal).
- score_posture est la moyenne arrondie des 3 notes de posture (ton, assurance, formulation).
- analyse_disc.profil_prospect.type_secondaire est null si un seul profil DISC est détecté.
- score_adaptation (/20) mesure à quel point le commercial a adapté son style au profil DISC détecté."""


def _clean_json(text: str) -> str:
    """Nettoie la réponse Claude pour extraire le JSON valide."""
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    text = text.strip()
    # Extraire uniquement la partie JSON si texte parasite
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        return match.group(0)
    return text


def _repair_truncated_json(text: str) -> str:
    """Tente de réparer un JSON tronqué en fermant les structures ouvertes."""
    # Supprimer une éventuelle valeur string tronquée (pas de guillemet fermant)
    # Ex: ..."pourquoi": "Explication tron
    text = text.rstrip()
    # Si on termine sur une valeur string incomplète, couper jusqu'au dernier champ complet
    last_quote = text.rfind('"')
    if last_quote > 0:
        # Vérifier si c'est un guillemet ouvrant non fermé (valeur tronquée)
        before = text[:last_quote]
        # Compter les guillemets — si impair, le dernier est ouvrant sans fermeture
        quote_count = text.count('"')
        if quote_count % 2 != 0:
            # Tronquer à la dernière virgule ou accolade/crochet fermant avant ce guillemet
            cut_pos = max(before.rfind(','), before.rfind('}'), before.rfind(']'))
            if cut_pos > 0:
                text = text[:cut_pos + 1]

    # Supprimer les virgules pendantes
    text = re.sub(r',\s*$', '', text)

    # Fermer les structures ouvertes
    stack = []
    in_string = False
    escape = False
    for ch in text:
        if escape:
            escape = False
            continue
        if ch == '\\' and in_string:
            escape = True
            continue
        if ch == '"':
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch in ('{', '['):
            stack.append('}' if ch == '{' else ']')
        elif ch in ('}', ']'):
            if stack:
                stack.pop()

    # Fermer tout ce qui est resté ouvert
    closing = ''.join(reversed(stack))
    return text + closing


@app.post("/api/evaluate")
async def evaluate(req: EvaluateRequest, user: dict | None = Depends(get_optional_user)):
    """Évalue un appel commercial via Claude Sonnet (FORCE 3D)."""
    # Resolve user_id: explicit body > JWT auth
    if not req.user_id and user:
        req.user_id = user["id"]

    # Formater le transcript
    transcript_text = _format_transcript(req.transcript)
    if not transcript_text.strip():
        raise HTTPException(400, "Transcript vide")

    # Vérifier minimum d'échanges (3 lignes)
    lines = [l for l in transcript_text.strip().split("\n") if l.strip()]
    if len(lines) < 3:
        raise HTTPException(400, "Appel trop court pour être évalué (minimum 3 échanges)")

    scenario = _load_scenario(req.scenario_id)
    prompt = _build_evaluation_prompt(scenario, transcript_text, req.difficulty, req.duration_s, language=req.language)

    try:
        client = anthropic.Anthropic()
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=8192,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = response.content[0].text.strip()
        cleaned = _clean_json(raw)
        try:
            evaluation = json.loads(cleaned)
        except json.JSONDecodeError:
            print(f"[EVAL] JSON tronqué détecté, tentative de réparation...", flush=True)
            repaired = _repair_truncated_json(cleaned)
            evaluation = json.loads(repaired)

    except json.JSONDecodeError:
        print(f"[EVAL ERROR] Réponse brute : {raw[:500]}")
        raise HTTPException(500, "Erreur parsing évaluation (JSON invalide)")
    except Exception as e:
        raise HTTPException(500, f"Erreur évaluation : {str(e)}")

    # Save to DB
    score = evaluation.get("score_global", 0)
    transcript_str = transcript_text if isinstance(req.transcript, str) else json.dumps(
        [e.model_dump() for e in req.transcript], ensure_ascii=False
    )
    eval_id = await save_evaluation(
        session_id=req.session_id or f"eval-{uuid.uuid4().hex[:8]}",
        scenario_id=req.scenario_id,
        difficulty=req.difficulty,
        transcript=transcript_str,
        evaluation_json=json.dumps(evaluation, ensure_ascii=False),
        score_global=score,
        user_id=req.user_id,
        session_ref_id=req.session_db_id,
        language=req.language,
    )

    # Complete the session if we have one
    if req.session_db_id:
        await complete_session(req.session_db_id, req.duration_s)

    evaluation["eval_id"] = eval_id
    return evaluation


# --- Streaming evaluation endpoint ---

@app.post("/api/evaluate/stream")
async def evaluate_stream(req: EvaluateRequest, user: dict | None = Depends(get_optional_user)):
    """Évalue un appel commercial via Claude Haiku en streaming SSE (FORCE 3D)."""
    # Resolve user_id: explicit body > JWT auth
    if not req.user_id and user:
        req.user_id = user["id"]

    # Formater le transcript
    transcript_text = _format_transcript(req.transcript)
    if not transcript_text.strip():
        raise HTTPException(400, "Transcript vide")

    # Vérifier minimum d'échanges (3 lignes)
    lines = [l for l in transcript_text.strip().split("\n") if l.strip()]
    if len(lines) < 3:
        raise HTTPException(400, "Appel trop court pour être évalué (minimum 3 échanges)")

    scenario = _load_scenario(req.scenario_id)
    prompt = _build_evaluation_prompt(scenario, transcript_text, req.difficulty, req.duration_s, language=req.language)

    async def event_generator():
        accumulated = ""
        try:
            client = anthropic.AsyncAnthropic()
            async with client.messages.stream(
                model="claude-haiku-4-5-20251001",
                max_tokens=8192,
                messages=[{"role": "user", "content": prompt}],
            ) as stream:
                async for text_chunk in stream.text_stream:
                    accumulated += text_chunk
                    yield f"data: {json.dumps({'type': 'chunk', 'text': text_chunk}, ensure_ascii=False)}\n\n"

            # Stream finished — parse full JSON
            raw = accumulated.strip()
            print(f"[EVAL RAW] Longueur: {len(raw)} chars", flush=True)
            print(f"[EVAL RAW] Premiers 500 chars: {raw[:500]}", flush=True)
            print(f"[EVAL RAW] Derniers 200 chars: {raw[-200:]}", flush=True)
            cleaned = _clean_json(raw)
            print(f"[EVAL CLEANED] Longueur: {len(cleaned)} chars", flush=True)
            print(f"[EVAL CLEANED] Premiers 500 chars: {cleaned[:500]}", flush=True)
            try:
                evaluation = json.loads(cleaned)
            except json.JSONDecodeError:
                print(f"[EVAL] JSON tronqué détecté, tentative de réparation...", flush=True)
                repaired = _repair_truncated_json(cleaned)
                print(f"[EVAL REPAIRED] Derniers 200 chars: ...{repaired[-200:]}", flush=True)
                evaluation = json.loads(repaired)

            # Save to DB
            score = evaluation.get("score_global", 0)
            transcript_str = transcript_text if isinstance(req.transcript, str) else json.dumps(
                [e.model_dump() for e in req.transcript], ensure_ascii=False
            )
            eval_id = await save_evaluation(
                session_id=req.session_id or f"eval-{uuid.uuid4().hex[:8]}",
                scenario_id=req.scenario_id,
                difficulty=req.difficulty,
                transcript=transcript_str,
                evaluation_json=json.dumps(evaluation, ensure_ascii=False),
                score_global=score,
                user_id=req.user_id,
                session_ref_id=req.session_db_id,
                language=req.language,
            )

            # Complete session if we have one
            if req.session_db_id:
                await complete_session(req.session_db_id, req.duration_s)

            # Include eval_id in done event for debrief link
            evaluation["eval_id"] = eval_id
            yield f"event: done\ndata: {json.dumps(evaluation, ensure_ascii=False)}\n\n"

        except json.JSONDecodeError as jde:
            print(f"[EVAL ERROR] JSONDecodeError: {jde}", flush=True)
            print(f"[EVAL ERROR] Réponse brute streaming ({len(accumulated)} chars): {accumulated[:500]}", flush=True)
            print(f"[EVAL ERROR] Fin brute: ...{accumulated[-300:]}", flush=True)
            try:
                err_cleaned = _clean_json(accumulated.strip())
                print(f"[EVAL ERROR] Cleaned ({len(err_cleaned)} chars): {err_cleaned[:500]}", flush=True)
                print(f"[EVAL ERROR] Fin cleaned: ...{err_cleaned[-300:]}", flush=True)
            except Exception:
                print("[EVAL ERROR] _clean_json a aussi échoué", flush=True)
            yield f"event: error\ndata: {json.dumps({'error': 'Erreur parsing évaluation (JSON invalide)'})}\n\n"
        except Exception as e:
            yield f"event: error\ndata: {json.dumps({'error': f'Erreur évaluation : {str(e)}'})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"},
    )


# --- NEW: Demo endpoints ---

@app.post("/api/demo/create")
async def create_demo_endpoint(req: DemoCreateRequest):
    """Crée un lien démo unique pour une école."""
    result = await create_demo(
        nom_ecole=req.nom_ecole,
        scenario_id=req.scenario_id,
        difficulty=req.difficulty,
        nb_sessions=req.nb_sessions,
        contact_email=req.contact_email,
        expire_days=req.expire_days,
    )
    # Build full URL
    result["url"] = f"/demo/{result['demo_token']}"
    return result


@app.get("/demo/{token}")
async def serve_demo(token: str):
    """Sert la page démo standalone."""
    demo = await get_demo(token)
    if not demo:
        raise HTTPException(404, "Lien démo introuvable")

    if not demo["is_active"]:
        raise HTTPException(410, "Ce lien démo a été désactivé")

    if datetime.fromisoformat(demo["expires_at"]) < datetime.utcnow():
        raise HTTPException(410, "Ce lien démo a expiré")

    if demo["sessions_used"] >= demo["sessions_max"]:
        raise HTTPException(410, "Toutes les sessions de cette démo ont été utilisées")

    return FileResponse(STATIC_DIR / "demo.html")


@app.post("/api/demo/{token}/use")
async def use_demo(token: str):
    """Consomme une session démo. Appelé par le frontend avant de lancer l'appel."""
    success = await use_demo_session(token)
    if not success:
        raise HTTPException(410, "Plus de sessions disponibles ou démo expirée")

    demo = await get_demo(token)
    return {
        "ok": True,
        "sessions_used": demo["sessions_used"],
        "sessions_max": demo["sessions_max"],
    }


@app.get("/api/demo/{token}/info")
async def demo_info(token: str):
    """Retourne les infos publiques d'une démo (pour le frontend)."""
    demo = await get_demo(token)
    if not demo:
        raise HTTPException(404, "Lien démo introuvable")

    scenario = _load_scenario(demo["scenario_id"])

    return {
        "nom_ecole": demo["nom_ecole"],
        "scenario_id": demo["scenario_id"],
        "difficulty": demo["difficulty"],
        "sessions_used": demo["sessions_used"],
        "sessions_max": demo["sessions_max"],
        "expires_at": demo["expires_at"],
        "is_active": demo["is_active"],
        "scenario": scenario,
    }


@app.post("/api/demo/{token}/save-session")
async def save_demo_session_endpoint(token: str, data: dict):
    """Sauvegarde les résultats d'une session démo."""
    demo = await get_demo(token)
    if not demo:
        raise HTTPException(404, "Démo introuvable")

    session_id = await save_demo_session(
        demo_id=demo["id"],
        duration_s=data.get("duration_s", 0),
        transcript_json=json.dumps(data.get("transcript", []), ensure_ascii=False),
        evaluation_json=json.dumps(data.get("evaluation", {}), ensure_ascii=False),
        score_global=data.get("score_global", 0),
    )
    return {"ok": True, "session_id": session_id}


# ═══════════════════════════════════════════════════════════════
# AUTH ENDPOINTS
# ═══════════════════════════════════════════════════════════════

def _user_public(u: dict) -> dict:
    return {k: u[k] for k in ("id", "email", "nom", "prenom", "role", "entreprise_id") if k in u}


@app.post("/api/auth/register")
async def register(req: RegisterRequest):
    if not req.email or not req.password or len(req.password) < 6:
        raise HTTPException(400, "Email et mot de passe (6+ caractères) requis")

    existing = await get_user_by_email(req.email)
    if existing:
        raise HTTPException(409, "Cet email est déjà utilisé")

    # Create entreprise if provided
    entreprise_id = None
    if req.entreprise_nom.strip():
        ent = await create_entreprise(req.entreprise_nom.strip())
        entreprise_id = ent["id"]

    # First user of an entreprise becomes manager
    role = "manager" if entreprise_id else "commercial"

    pwd_hash = hash_password(req.password)
    user = await create_user(
        email=req.email, nom=req.nom, prenom=req.prenom,
        password_hash=pwd_hash, role=role, entreprise_id=entreprise_id,
    )

    token = create_token(user["id"], user["email"], user["role"])
    return {"token": token, "user": _user_public(user)}


@app.post("/api/auth/login")
async def login(req: LoginRequest):
    user = await get_user_by_email(req.email)
    if not user:
        raise HTTPException(401, "Email ou mot de passe incorrect")

    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(401, "Email ou mot de passe incorrect")

    await update_last_login(user["id"])
    token = create_token(user["id"], user["email"], user["role"])
    return {"token": token, "user": _user_public(user)}


@app.get("/api/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return _user_public(user)


# ═══════════════════════════════════════════════════════════════
# DASHBOARD COMMERCIAL
# ═══════════════════════════════════════════════════════════════

@app.get("/api/dashboard/stats")
async def dashboard_stats(user: dict = Depends(get_current_user)):
    return await get_user_stats(user["id"])


@app.get("/api/dashboard/historique")
async def dashboard_historique(limit: int = 20, user: dict = Depends(get_current_user)):
    evals = await get_user_evaluations(user["id"], limit=limit)
    result = []
    for e in evals:
        result.append({
            "id": e["id"],
            "scenario_id": e["scenario_id"],
            "difficulty": e["difficulty"],
            "score_global": e["score_global"],
            "created_at": e["created_at"],
        })
    return result


@app.get("/api/dashboard/session/{eval_id}")
async def dashboard_session(eval_id: int, user: dict = Depends(get_current_user)):
    ev = await get_evaluation_detail(eval_id, user_id=user["id"])
    if not ev:
        raise HTTPException(404, "Session introuvable")

    # Parse evaluation_json and transcript
    evaluation = {}
    try:
        evaluation = json.loads(ev["evaluation_json"]) if ev.get("evaluation_json") else {}
    except Exception:
        pass

    transcript = []
    try:
        raw = ev.get("transcript", "")
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            transcript = parsed
    except Exception:
        # It's a text transcript, split into lines
        if ev.get("transcript"):
            for line in ev["transcript"].split("\n"):
                line = line.strip()
                if line.startswith("VENDEUR:"):
                    transcript.append({"role": "vendeur", "text": line[8:].strip()})
                elif line.startswith("PROSPECT:"):
                    transcript.append({"role": "prospect", "text": line[9:].strip()})

    # Load scenario brief if available
    brief = None
    try:
        scenario = _load_scenario(ev["scenario_id"])
        brief = scenario.get("brief_commercial")
    except Exception:
        pass

    return {
        "id": ev["id"],
        "scenario_id": ev["scenario_id"],
        "difficulty": ev["difficulty"],
        "score_global": ev["score_global"],
        "created_at": ev["created_at"],
        "evaluation": evaluation,
        "transcript": transcript,
        "brief": brief,
    }


@app.get("/api/dashboard/radar")
async def dashboard_radar(user: dict = Depends(get_current_user)):
    from datetime import timedelta as td
    evals = await get_user_evaluations(user["id"], limit=100)
    cutoff = (datetime.utcnow() - td(days=30)).isoformat()

    current = {k: [] for k in COMPETENCE_KEYS}
    old = {k: [] for k in COMPETENCE_KEYS}
    for e in evals:
        cs = _parse_competences(e.get("evaluation_json", "{}"))
        target = current if (e.get("created_at") or "") >= cutoff else old
        for k in COMPETENCE_KEYS:
            if cs[k] > 0:
                target[k].append(cs[k])

    def avg(lst): return round(sum(lst) / len(lst), 1) if lst else 0

    return {
        "current": {k: avg(current[k]) for k in COMPETENCE_KEYS},
        "previous": {k: avg(old[k]) for k in COMPETENCE_KEYS},
    }


# ═══════════════════════════════════════════════════════════════
# DASHBOARD MANAGER
# ═══════════════════════════════════════════════════════════════

def _require_manager(user: dict):
    if user.get("role") not in ("manager", "admin"):
        raise HTTPException(403, "Accès réservé aux managers")


@app.get("/api/manager/equipe")
async def manager_equipe(user: dict = Depends(get_current_user)):
    _require_manager(user)
    members = await get_team_members(user["entreprise_id"])
    result = []
    for m in members:
        stats = await get_user_stats(m["id"])
        result.append({**m, "stats": stats})
    return result


@app.get("/api/manager/stats")
async def manager_stats(user: dict = Depends(get_current_user)):
    _require_manager(user)
    return await get_team_stats(user["entreprise_id"])


@app.get("/api/manager/commercial/{uid}")
async def manager_commercial(uid: str, user: dict = Depends(get_current_user)):
    _require_manager(user)
    # Verify the user belongs to the same entreprise
    from database import get_user_by_id
    target = await get_user_by_id(uid)
    if not target or target.get("entreprise_id") != user.get("entreprise_id"):
        raise HTTPException(404, "Commercial introuvable")
    stats = await get_user_stats(uid)
    evals = await get_user_evaluations(uid, limit=20)
    return {"user": _user_public(target), "stats": stats, "historique": evals}


# ═══════════════════════════════════════════════════════════════
# SPA ROUTE /app/*
# ═══════════════════════════════════════════════════════════════

@app.get("/app/{path:path}")
async def spa_app(path: str = ""):
    return FileResponse(STATIC_DIR / "index.html", headers=_SPA_NO_CACHE)


# ═══════════════════════════════════════════════════════════════
# BLOG ROUTES
# ═══════════════════════════════════════════════════════════════

from blog_engine import (
    load_index as blog_load_index,
    get_published as blog_get_published,
    md_to_html,
    generate_batch as blog_generate_batch,
    generate_sitemaps as blog_generate_sitemaps,
    optimize_seo as blog_optimize_seo,
    save_article as blog_save_article,
    delete_article as blog_delete_article,
    get_article as blog_get_article,
    suggest_topics as blog_suggest_topics,
    maillage_graph as blog_maillage_graph,
    calculate_seo_score as blog_calculate_seo_score,
    generate_single_article as blog_generate_single,
    get_related_articles as blog_get_related,
    rebuild_all_links as blog_rebuild_all_links,
    CATEGORIES as BLOG_CATEGORIES,
    BLOG_DIR,
    ARTICLES_DIR,
)

BLOG_TEMPLATES_DIR = BLOG_DIR / "templates"

MONTHS_FR = ["", "janvier", "février", "mars", "avril", "mai", "juin",
             "juillet", "août", "septembre", "octobre", "novembre", "décembre"]

CAT_CODE_MAP = {}
for cat_id, cat_info in BLOG_CATEGORIES.items():
    CAT_CODE_MAP[cat_info["name"]] = cat_info["code"]


def _render_blog_index() -> str:
    template = (BLOG_TEMPLATES_DIR / "index.html").read_text(encoding="utf-8")
    articles = [a for a in blog_load_index() if a.get("status") == "published"]
    articles.sort(key=lambda a: a.get("date", ""), reverse=True)

    # Collect used categories
    used_cats = []
    for a in articles:
        code = CAT_CODE_MAP.get(a.get("category", ""), "")
        if code and code not in used_cats:
            used_cats.append(code)

    # Filter buttons
    cat_labels = {v["code"]: v["name"] for v in BLOG_CATEGORIES.values()}
    filter_buttons = ""
    for code in used_cats:
        label = cat_labels.get(code, code)
        filter_buttons += f'<button class="blog-filter" data-cat="{code}">{label}</button>\n'

    # Category icons
    cat_icons = {v["code"]: v["icon"] for v in BLOG_CATEGORIES.values()}

    # Articles grid
    if articles:
        grid = '<div class="blog-grid" id="blogGrid">\n'
        for a in articles:
            cat_code = CAT_CODE_MAP.get(a.get("category", ""), "")
            icon = cat_icons.get(cat_code, "?")
            d = datetime.fromisoformat(a.get("date", datetime.now().isoformat()))
            date_fmt = f"{d.day} {MONTHS_FR[d.month]} {d.year}"
            tags_html = "".join(f'<span>{t}</span>' for t in (a.get("tags") or [])[:4])
            og_img = BLOG_DIR / "images" / "og" / f"{a['slug']}.png"
            img_html = f'<img src="/blog/images/og/{a["slug"]}.png" alt="{a["title"]}" loading="lazy" class="blog-card-img">' if og_img.exists() else ""
            grid += f'''<a href="/blog/{a["slug"]}" class="blog-card" data-cat="{cat_code}" data-date="{a.get("date", "")}" data-title="{a["title"]}">
    {img_html}
    <div class="blog-card-top"><div class="blog-card-cat">{a.get("category", "")}</div><div class="blog-card-icon">{icon}</div></div>
    <div class="blog-card-title">{a["title"]}</div>
    <div class="blog-card-desc">{a.get("meta_description", "")}</div>
    <div class="blog-card-tags">{tags_html}</div>
    <div class="blog-card-bottom"><span class="blog-card-date">{date_fmt}</span><span class="blog-card-read">{a.get("read_time", "5")} min</span></div>
</a>\n'''
        grid += "</div>"
    else:
        grid = ""

    return (template
        .replace("{{filter_buttons}}", filter_buttons)
        .replace("{{articles_grid}}", grid)
        .replace("{{empty_display}}", "" if not articles else "display:none")
        .replace("{{year}}", str(datetime.now().year)))


def _render_blog_article(slug: str) -> str:
    articles = blog_load_index()
    article = next((a for a in articles if a["slug"] == slug and a.get("status") == "published"), None)
    if not article:
        return None

    md_file = BLOG_DIR / "data" / "articles" / article.get("file", f"{slug}.md")
    if not md_file.exists():
        return None

    md_content = md_file.read_text(encoding="utf-8")
    html_content = md_to_html(md_content)

    template = (BLOG_TEMPLATES_DIR / "article.html").read_text(encoding="utf-8")

    # Date
    d = datetime.fromisoformat(article.get("date", datetime.now().isoformat()))
    date_fmt = f"{d.day} {MONTHS_FR[d.month]} {d.year}"

    # Tags (as links like cap-numerik)
    tags_html = "".join(f'<a href="/blog/">{t}</a>' for t in (article.get("tags") or []))

    # OG image
    og_path = BLOG_DIR / "images" / "og" / f"{slug}.png"
    og_tag = f'<meta property="og:image" content="https://vendmieux.fr/blog/images/og/{slug}.png">' if og_path.exists() else ""

    # Hero image
    hero_html = f'<img src="/blog/images/og/{slug}.png" alt="{article["title"]}" class="article-hero-img">' if og_path.exists() else ""

    # Schema.org
    schema = json.dumps({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article["title"],
        "description": article.get("meta_description", ""),
        "datePublished": article.get("date", ""),
        "author": {"@type": "Person", "name": "Jean-François Perrin"},
        "publisher": {"@type": "Organization", "name": "VendMieux", "url": "https://vendmieux.fr"},
        "mainEntityOfPage": f"https://vendmieux.fr/blog/{slug}",
    }, ensure_ascii=False)

    # Related articles (smart scoring: category +10, tags +3, cross-cat +2, recency bonus)
    related = blog_get_related(slug, article.get("category", ""), article.get("tags", []), limit=3)
    related_html = ""
    if related:
        related_html = '<div class="blog-related"><h3>// Articles liés</h3><div class="blog-related-list">'
        for r in related:
            desc = (r.get("meta_description", "") or "")[:120]
            if len(r.get("meta_description", "")) > 120:
                desc += "..."
            related_html += f'<a href="/blog/{r["slug"]}" class="blog-related-card"><h4>{r["title"]}</h4><p>{desc}</p><span class="blog-related-meta">{r.get("read_time", "5")} min de lecture</span></a>'
        related_html += "</div></div>"

    return (template
        .replace("{{title}}", article["title"])
        .replace("{{meta_description}}", article.get("meta_description", ""))
        .replace("{{slug}}", slug)
        .replace("{{category}}", article.get("category", ""))
        .replace("{{content_html}}", html_content)
        .replace("{{date_formatted}}", date_fmt)
        .replace("{{read_time}}", article.get("read_time", "5"))
        .replace("{{tags_html}}", tags_html)
        .replace("{{og_image_tag}}", og_tag)
        .replace("{{hero_image}}", hero_html)
        .replace("{{schema_json}}", schema)
        .replace("{{related_html}}", related_html)
        .replace("{{year}}", str(datetime.now().year)))


@app.get("/blog/")
async def blog_index():
    return HTMLResponse(_render_blog_index())


@app.get("/blog/{slug}")
async def blog_article(slug: str):
    # Serve OG images
    if slug.startswith("images/"):
        img_path = BLOG_DIR / slug
        if img_path.exists():
            return FileResponse(str(img_path))
        raise HTTPException(404)

    html = _render_blog_article(slug)
    if not html:
        raise HTTPException(404, "Article non trouvé")
    return HTMLResponse(html)


@app.get("/blog/images/{path:path}")
async def blog_images(path: str):
    img_path = BLOG_DIR / "images" / path
    if img_path.exists():
        return FileResponse(str(img_path))
    raise HTTPException(404)


@app.get("/sitemap.xml")
async def sitemap():
    """Dynamic sitemap: static pages + scenarios from DB + blog articles."""
    from fastapi.responses import Response
    import sqlite3, glob as _glob
    today = datetime.now().strftime("%Y-%m-%d")

    urls = []

    # Static SPA pages
    static_pages = [
        ("https://vendmieux.fr/", "weekly", "1.0"),
        ("https://vendmieux.fr/produit", "monthly", "0.9"),
        ("https://vendmieux.fr/tarifs", "monthly", "0.9"),
        ("https://vendmieux.fr/scenarios", "weekly", "0.8"),
        ("https://vendmieux.fr/ecoles", "monthly", "0.8"),
        ("https://vendmieux.fr/ecoles-tarifs", "monthly", "0.7"),
        ("https://vendmieux.fr/contact", "monthly", "0.7"),
        ("https://vendmieux.fr/mentions-legales", "yearly", "0.3"),
        ("https://vendmieux.fr/confidentialite", "yearly", "0.3"),
    ]
    for loc, freq, prio in static_pages:
        urls.append(f"  <url>\n    <loc>{loc}</loc>\n    <lastmod>{today}</lastmod>\n    <changefreq>{freq}</changefreq>\n    <priority>{prio}</priority>\n  </url>")

    # Scenarios from DB
    try:
        db = sqlite3.connect(str(Path(__file__).parent / "vendmieux.db"))
        scenarios = db.execute("SELECT id FROM scenarios WHERE is_template = 1 OR is_template IS NULL").fetchall()
        for (sc_id,) in scenarios:
            urls.append(f"  <url>\n    <loc>https://vendmieux.fr/scenarios/{sc_id}</loc>\n    <lastmod>{today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>")
        db.close()
    except Exception:
        pass

    # Blog articles from data files
    blog_data_dir = Path(__file__).parent / "blog" / "data" / "articles"
    if blog_data_dir.exists():
        urls.append(f"  <url>\n    <loc>https://vendmieux.fr/blog</loc>\n    <lastmod>{today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>")
        for f in sorted(blog_data_dir.glob("*.md")):
            slug = f.stem
            urls.append(f"  <url>\n    <loc>https://vendmieux.fr/blog/{slug}</loc>\n    <lastmod>{today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>")

    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>"""
    return Response(content=xml, media_type="application/xml")


@app.get("/sitemap-blog.xml")
async def sitemap_blog():
    f = Path(__file__).parent / "sitemap-blog.xml"
    if f.exists():
        return FileResponse(str(f), media_type="application/xml")
    raise HTTPException(404)


@app.get("/robots.txt")
async def robots_txt():
    from fastapi.responses import Response
    content = """User-agent: *
Allow: /
Allow: /blog/
Allow: /scenarios/
Disallow: /api/
Disallow: /simulation
Disallow: /dashboard
Disallow: /app/

Sitemap: https://vendmieux.fr/sitemap.xml"""
    return Response(content=content, media_type="text/plain")


@app.get("/llms.txt")
async def llms_txt():
    f = Path(__file__).parent / "llms.txt"
    if f.exists():
        return FileResponse(str(f), media_type="text/plain")
    raise HTTPException(404)


@app.get("/llms-full.txt")
async def llms_full_txt():
    f = Path(__file__).parent / "llms-full.txt"
    if f.exists():
        return FileResponse(str(f), media_type="text/plain")
    raise HTTPException(404)


@app.post("/api/blog/generate")
async def api_blog_generate(data: dict):
    """Generate articles from topic queue. POST {count: 3}"""
    count = data.get("count", 3)
    category = data.get("category", "")
    result = blog_generate_batch(count=count, category_filter=category)
    return result


@app.post("/api/blog/optimize-seo")
async def api_blog_optimize_seo(data: dict):
    """Run 15-point SEO check on an article. POST {slug: "..."} or {title, keyword, content, ...}"""
    slug = data.get("slug", "")

    # If slug provided, load from published articles
    if slug and not data.get("content"):
        articles = blog_load_index()
        article = next((a for a in articles if a["slug"] == slug), None)
        if not article:
            raise HTTPException(404, "Article non trouvé")
        md_file = ARTICLES_DIR / article.get("file", f"{slug}.md")
        if not md_file.exists():
            raise HTTPException(404, "Fichier markdown non trouvé")
        data["title"] = data.get("title", article["title"])
        data["keyword"] = data.get("keyword", "")
        data["meta_description"] = data.get("meta_description", article.get("meta_description", ""))
        data["content"] = md_file.read_text(encoding="utf-8")
        data["category"] = data.get("category", article.get("category", ""))
        data["tags"] = data.get("tags", article.get("tags", []))

    return blog_optimize_seo(
        title=data.get("title", ""),
        slug=slug,
        meta=data.get("meta_description", ""),
        keyword=data.get("keyword", ""),
        content=data.get("content", ""),
        category=data.get("category", ""),
        tags=data.get("tags", []),
        fix=data.get("fix"),
    )


# ═══════════════════════════════════════════════════════════════
# BLOG ADMIN API
# ═══════════════════════════════════════════════════════════════

@app.get("/api/blog/articles")
async def api_blog_articles_list(slug: str = ""):
    """GET articles list or single article with content."""
    if slug:
        article = blog_get_article(slug)
        if not article:
            raise HTTPException(404, "Article non trouvé")
        return article
    return blog_load_index()


@app.post("/api/blog/articles")
async def api_blog_articles_save(data: dict):
    """POST create/update article."""
    return blog_save_article(data)


@app.delete("/api/blog/articles")
async def api_blog_articles_delete(slug: str):
    """DELETE article by slug."""
    result = blog_delete_article(slug)
    if not result.get("ok"):
        raise HTTPException(404, result.get("error", "Not found"))
    return result


@app.post("/api/blog/suggest-topics")
async def api_blog_suggest_topics(data: dict = {}):
    """AI editorial planning with caching."""
    return blog_suggest_topics(force_refresh=data.get("refresh", False))


@app.get("/api/blog/maillage-graph")
async def api_blog_maillage_graph():
    """Link network graph data."""
    return blog_maillage_graph()


@app.post("/api/blog/generate-article")
async def api_blog_generate_article(data: dict):
    """Generate a single article via AI for the editor."""
    return blog_generate_single(data)


@app.post("/api/blog/rebuild-links")
async def api_blog_rebuild_links():
    """Rebuild bidirectional links for all published articles."""
    report = blog_rebuild_all_links()
    total_added = sum(report.values())
    return {"ok": True, "report": report, "total_added": total_added, "articles_modified": len(report)}


@app.get("/api/blog/seo-scores")
async def api_blog_seo_scores():
    """SEO scores for all articles (dashboard table)."""
    articles = blog_load_index()
    scored = []
    for art in articles:
        seo = blog_calculate_seo_score(art)
        art_copy = dict(art)
        art_copy.update(seo)
        scored.append(art_copy)
    scored.sort(key=lambda a: a.get("seo_score", 0))
    return scored


# ═══════════════════════════════════════════════════════════════
# ADMIN HTML PAGES
# ═══════════════════════════════════════════════════════════════

ADMIN_DIR = Path(__file__).parent / "admin"


@app.get("/admin/")
async def admin_dashboard():
    """Admin dashboard."""
    f = ADMIN_DIR / "index.html"
    if f.exists():
        return HTMLResponse(f.read_text(encoding="utf-8"))
    raise HTTPException(404, "Admin dashboard not found")


@app.get("/admin/articles")
async def admin_articles():
    """Admin articles list."""
    f = ADMIN_DIR / "articles.html"
    if f.exists():
        return HTMLResponse(f.read_text(encoding="utf-8"))
    raise HTTPException(404)


@app.get("/admin/article-edit")
async def admin_article_edit():
    """Admin article editor."""
    f = ADMIN_DIR / "article-edit.html"
    if f.exists():
        return HTMLResponse(f.read_text(encoding="utf-8"))
    raise HTTPException(404)


# --- Favicon ---
@app.get("/favicon.svg")
async def serve_favicon():
    return FileResponse(STATIC_DIR / "favicon.svg", media_type="image/svg+xml",
                        headers={"Cache-Control": "public, max-age=31536000, immutable"})


# --- Contact école endpoint ---

class ContactEcoleRequest(BaseModel):
    nom: str
    prenom: str
    email: str
    telephone: str = ""
    etablissement: str
    type: str
    nb_apprenants: str
    message: str = ""
    website: str = ""  # honeypot

@app.post("/api/contact-ecole")
@limiter.limit("3/minute")
async def contact_ecole(request: Request, data: ContactEcoleRequest):
    # Anti-bot: honeypot field
    if data.website:
        return {"status": "ok"}
    # Validate required fields
    if not data.nom or not data.prenom or not data.email or not data.etablissement or not data.type or not data.nb_apprenants:
        raise HTTPException(status_code=422, detail="Champs obligatoires manquants")
    if len(data.nom) > 100 or len(data.prenom) > 100 or len(data.email) > 200:
        raise HTTPException(status_code=422, detail="Champ trop long")
    if len(data.message) > 2000:
        raise HTTPException(status_code=422, detail="Message trop long (max 2000 caractères)")
    # Store in a simple JSON log (always, as backup)
    log_path = Path(__file__).parent / "contact_ecole_log.json"
    entry = {
        "timestamp": datetime.now().isoformat(),
        "nom": data.nom,
        "prenom": data.prenom,
        "email": data.email,
        "telephone": data.telephone,
        "etablissement": data.etablissement,
        "type": data.type,
        "nb_apprenants": data.nb_apprenants,
        "message": data.message,
    }
    try:
        existing = json.loads(log_path.read_text()) if log_path.exists() else []
    except Exception:
        existing = []
    existing.append(entry)
    log_path.write_text(json.dumps(existing, ensure_ascii=False, indent=2))

    # Send email via Brevo if API key is configured
    brevo_key = os.getenv("BREVO_API_KEY")
    if brevo_key:
        import httpx as _httpx
        try:
            async with _httpx.AsyncClient(timeout=10) as client:
                # Send notification email to Jeff
                await client.post(
                    "https://api.brevo.com/v3/smtp/email",
                    headers={"api-key": brevo_key, "Content-Type": "application/json"},
                    json={
                        "sender": {"name": "VendMieux", "email": "noreply@vendmieux.fr"},
                        "to": [{"email": "jfperrin@cap-performances.fr"}],
                        "subject": f"Demande de devis école — {data.etablissement}",
                        "htmlContent": (
                            "<h2>Nouvelle demande de devis école</h2>"
                            f"<p><b>Établissement :</b> {data.etablissement}</p>"
                            f"<p><b>Type :</b> {data.type}</p>"
                            f"<p><b>Contact :</b> {data.prenom} {data.nom}</p>"
                            f"<p><b>Email :</b> {data.email}</p>"
                            f"<p><b>Tél :</b> {data.telephone or 'Non renseigné'}</p>"
                            f"<p><b>Apprenants :</b> {data.nb_apprenants}</p>"
                            f"<p><b>Message :</b> {data.message or 'Aucun'}</p>"
                        ),
                    },
                )
                # Add contact to Brevo CRM
                try:
                    await client.post(
                        "https://api.brevo.com/v3/contacts",
                        headers={"api-key": brevo_key, "Content-Type": "application/json"},
                        json={
                            "email": data.email,
                            "attributes": {
                                "NOM": data.nom,
                                "PRENOM": data.prenom,
                                "ETABLISSEMENT": data.etablissement,
                            },
                            "updateEnabled": True,
                        },
                    )
                except Exception:
                    pass  # Don't block if contact creation fails
        except Exception as exc:
            # Log error but don't fail the request
            import traceback
            traceback.print_exc()

    return {"status": "ok", "message": "Demande enregistrée. Réponse sous 24h."}


# --- SSG: serve pre-rendered HTML when available ---

def _load_prerendered_or_fallback(path: str) -> str:
    """Load pre-rendered HTML for a route, or fall back to index.html."""
    if path == "/":
        # Home page: pre-rendered as static/index.html (replaced during deploy)
        return (STATIC_DIR / "index.html").read_text(encoding="utf-8")
    # e.g. /produit → static/produit/index.html
    prerendered = STATIC_DIR / path.lstrip("/") / "index.html"
    if prerendered.exists():
        return prerendered.read_text(encoding="utf-8")
    # Fallback to SPA index.html
    return (STATIC_DIR / "index.html").read_text(encoding="utf-8")


# --- SEO meta data per route ---

_SEO_DATA = {
    "/": {
        "title": "VendMieux — Simulateur vocal IA de formation commerciale",
        "description": "Entraînez vos commerciaux avec des prospects IA réalistes. 240+ scénarios, méthode FORCE 3D, évaluation instantanée. Conçu pour les PME françaises.",
        "canonical": "https://vendmieux.fr/",
    },
    "/produit": {
        "title": "Comment ça marche — VendMieux | Briefing, Simulation vocale, Débriefing FORCE 3D",
        "description": "Découvrez le fonctionnement de VendMieux : briefing commercial, simulation vocale avec un prospect IA, débriefing FORCE 3D avec analyse DISC et posture.",
        "canonical": "https://vendmieux.fr/produit",
    },
    "/tarifs": {
        "title": "Tarifs VendMieux — 49€/mois par commercial | Formation commerciale IA",
        "description": "49€ HT/mois par commercial, 20 sessions incluses. Sans engagement. 240+ scénarios sectoriels + création illimitée sur mesure. Dashboard de progression.",
        "canonical": "https://vendmieux.fr/tarifs",
    },
    "/scenarios": {
        "title": "Scénarios de simulation — VendMieux | 240+ situations commerciales réalistes",
        "description": "240+ scénarios de vente couvrant 20 secteurs, 6 types d'appel, 2 niveaux. Prospection, négociation, réclamation, upsell, multi-interlocuteurs.",
        "canonical": "https://vendmieux.fr/scenarios",
    },
    "/ecoles": {
        "title": "VendMieux pour les Écoles de Commerce et BTS | Simulateur de vente IA",
        "description": "Remplacez les jeux de rôle entre étudiants par des simulations IA. Évaluation FORCE 3D standardisée, multi-langue, dashboard professeur.",
        "canonical": "https://vendmieux.fr/ecoles",
    },
    "/ecoles-tarifs": {
        "title": "Tarifs Écoles — VendMieux | Simulateur IA pour enseignement commercial",
        "description": "Tarifs sur devis pour écoles de commerce, BTS, universités. Scénarios personnalisés illimités, multi-langue, dashboard professeur.",
        "canonical": "https://vendmieux.fr/ecoles-tarifs",
    },
    "/contact": {
        "title": "Contact VendMieux — Réservez une démo ou demandez un devis",
        "description": "Contactez l'équipe VendMieux pour une démo gratuite, un devis école, ou toute question. Réponse sous 24h.",
        "canonical": "https://vendmieux.fr/contact",
    },
    "/mentions-legales": {
        "title": "Mentions légales — VendMieux | SASU INNOVABUY",
        "description": "Mentions légales du site vendmieux.fr édité par SASU INNOVABUY.",
        "canonical": "https://vendmieux.fr/mentions-legales",
    },
    "/confidentialite": {
        "title": "Politique de confidentialité — VendMieux | RGPD",
        "description": "Politique de confidentialité et protection des données personnelles de VendMieux. Conforme RGPD.",
        "canonical": "https://vendmieux.fr/confidentialite",
    },
}

def _inject_seo_meta(html: str, path: str) -> str:
    """Inject per-route SEO meta tags into the SPA HTML."""
    seo = _SEO_DATA.get(path, _SEO_DATA["/"])
    import re
    # Replace <title>
    html = re.sub(r"<title>[^<]*</title>", f"<title>{seo['title']}</title>", html)
    # Replace meta description
    html = re.sub(
        r'<meta name="description" content="[^"]*"',
        f'<meta name="description" content="{seo["description"]}"',
        html,
    )
    # Add canonical + OG tags before </head>
    og_tags = f"""    <link rel="canonical" href="{seo['canonical']}" />
    <meta property="og:title" content="{seo['title']}" />
    <meta property="og:description" content="{seo['description']}" />
    <meta property="og:url" content="{seo['canonical']}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="VendMieux" />
    <meta property="og:image" content="https://vendmieux.fr/og-home.png" />
    <meta name="twitter:card" content="summary_large_image" />"""
    html = html.replace("</head>", f"{og_tags}\n  </head>")
    # JSON-LD schema on home page only
    if path == "/":
        jsonld = json.dumps({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "VendMieux",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "description": seo["description"],
            "url": "https://vendmieux.fr/",
            "offers": {
                "@type": "Offer",
                "price": "49",
                "priceCurrency": "EUR",
                "priceValidUntil": "2027-12-31",
            },
            "author": {
                "@type": "Organization",
                "name": "SASU INNOVABUY",
                "url": "https://vendmieux.fr/",
            },
        }, ensure_ascii=False)
        html = html.replace("</head>", f'    <script type="application/ld+json">{jsonld}</script>\n  </head>')
    return html


# --- SPA frontend routes (serve pre-rendered HTML or fallback to index.html) ---

@app.get("/produit")
@app.get("/tarifs")
@app.get("/scenarios")
@app.get("/ecoles")
@app.get("/ecoles-tarifs")
@app.get("/contact")
@app.get("/mentions-legales")
@app.get("/confidentialite")
async def spa_page(request: Request):
    html = _load_prerendered_or_fallback(request.url.path)
    html = _inject_seo_meta(html, request.url.path)
    return HTMLResponse(content=html, headers=_SPA_NO_CACHE)


@app.get("/dashboard")
async def serve_dashboard():
    """Sert demo.html en mode dashboard."""
    return FileResponse(STATIC_DIR / "demo.html", headers=_SPA_NO_CACHE)


@app.get("/demo.html")
async def serve_demo_html():
    return FileResponse(STATIC_DIR / "demo.html")


@app.get("/simulation")
async def serve_simulation():
    """Sert la SPA React (avec ?scenario=ID)."""
    return FileResponse(STATIC_DIR / "index.html", headers=_SPA_NO_CACHE)


@app.get("/demo")
async def serve_demo_page(request: Request):
    """Page de démo libre d'accès — sans authentification."""
    html = (STATIC_DIR / "index.html").read_text(encoding="utf-8")
    import re
    html = re.sub(r"<title>[^<]*</title>", "<title>Démo gratuite — VendMieux | Simulation commerciale IA</title>", html)
    html = re.sub(
        r'<meta name="description" content="[^"]*"',
        '<meta name="description" content="Vivez une simulation commerciale IA en 5 minutes. Sans inscription. Appelez un prospect virtuel et recevez votre évaluation FORCE 3D."',
        html,
    )
    return HTMLResponse(content=html, headers=_SPA_NO_CACHE)


# Static files must be mounted LAST (catch-all)
app.mount("/assets", StaticFiles(directory=str(STATIC_DIR / "assets")), name="assets")
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
