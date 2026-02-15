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

import json
import os
import uuid
from datetime import datetime
from pathlib import Path

import anthropic
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel
from livekit.api import AccessToken, VideoGrants

from database import (
    init_db, create_demo, get_demo, use_demo_session, save_evaluation, save_demo_session,
    create_entreprise, create_user, get_user_by_email, update_last_login,
    create_session, complete_session, get_user_evaluations, get_user_stats,
    get_evaluation_detail, get_team_members, get_team_stats,
    COMPETENCE_KEYS, _parse_competences,
    get_all_scenario_templates, get_scenario_from_db,
)
from auth import (
    hash_password, verify_password, create_token, get_current_user, get_optional_user,
)
from scenarios_database import load_scenarios_database, get_sectors, get_simulation_types

load_dotenv()

app = FastAPI(title="VendMieux API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

class ScenarioRequest(BaseModel):
    description: str
    scenario_id: str | None = None

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


# --- Scenarios database (cached) ---
_SCENARIOS_DB: dict[str, dict] = {}


# --- Startup ---

@app.on_event("startup")
async def startup():
    global _SCENARIOS_DB
    await init_db()
    _SCENARIOS_DB = load_scenarios_database()


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


# --- Existing endpoints ---

@app.get("/")
async def serve_frontend():
    return FileResponse(STATIC_DIR / "index.html", headers={
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
    })


@app.post("/api/token")
async def get_token(req: TokenRequest, user: dict | None = Depends(get_optional_user)):
    api_key = os.environ.get("LIVEKIT_API_KEY")
    api_secret = os.environ.get("LIVEKIT_API_SECRET")
    livekit_url = os.environ.get("LIVEKIT_URL")

    if not api_key or not api_secret:
        raise HTTPException(500, "LiveKit credentials not configured")

    room_name = f"vm-{uuid.uuid4().hex[:8]}"
    identity = f"user-{uuid.uuid4().hex[:6]}"

    # If authenticated, create a DB session
    session_db_id = None
    user_id = None
    if user:
        user_id = user["id"]
        session_db_id = await create_session(
            user_id=user_id,
            scenario_id=req.scenario_id or "__default__",
            difficulty=req.difficulty,
            livekit_room_id=room_name,
        )

    # Room metadata now carries JSON with scenario_id + difficulty + optional user info
    room_metadata = json.dumps({
        "scenario_id": req.scenario_id or "__default__",
        "difficulty": req.difficulty,
        "user_id": user_id,
        "session_db_id": session_db_id,
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
    )

    return {
        "token": token.to_jwt(),
        "url": livekit_url,
        "room": room_name,
        "identity": identity,
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


@app.get("/api/scenarios")
async def list_scenarios(secteur: str = "", type: str = "", difficulty: int = 0):
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

        identite = persona.get("identite", {})
        entreprise = identite.get("entreprise", {})
        scenarios.append({
            "id": t["id"],
            "name": f"{identite.get('prenom', '?')} {identite.get('nom', '?')}",
            "poste": identite.get("poste", "?"),
            "entreprise": entreprise.get("nom", "?"),
            "secteur": t.get("secteur", entreprise.get("secteur", "?")),
            "type_simulation": "prospection_telephonique",
            "titre": brief.get("titre", ""),
            "difficulty": t.get("difficulty_default", 2),
            "tags": tags,
            "source": "template",
        })
        seen_ids.add(t["id"])

    # 2. Scénarios de la base intégrée (scenarios_database.py)
    for sid, data in _SCENARIOS_DB.items():
        if sid in seen_ids:
            continue
        persona = data.get("persona", {}).get("identite", {})
        sim = data.get("simulation", {})
        scenarios.append({
            "id": sid,
            "name": f"{persona.get('prenom', '?')} {persona.get('nom', '?')}",
            "poste": persona.get("poste", "?"),
            "entreprise": persona.get("entreprise", {}).get("nom", "?"),
            "secteur": sim.get("secteur", persona.get("entreprise", {}).get("secteur", "?")),
            "type_simulation": sim.get("type", "prospection_telephonique"),
            "titre": sim.get("titre", ""),
            "difficulty": 2,
            "tags": [],
            "source": "database",
        })
        seen_ids.add(sid)

    # 3. Scénarios générés par les utilisateurs (fichiers JSON)
    for f in sorted(SCENARIOS_DIR.glob("*.json")):
        if f.stem in seen_ids:
            continue
        try:
            with open(f, "r", encoding="utf-8") as fh:
                data = json.load(fh)
                persona = data.get("persona", {}).get("identite", {})
                scenarios.append({
                    "id": f.stem,
                    "name": f"{persona.get('prenom', '?')} {persona.get('nom', '?')}",
                    "poste": persona.get("poste", "?"),
                    "entreprise": persona.get("entreprise", {}).get("nom", "?"),
                    "secteur": persona.get("entreprise", {}).get("secteur", "?"),
                    "type_simulation": "custom",
                    "titre": data.get("brief_commercial", {}).get("titre", "Scénario personnalisé"),
                    "difficulty": data.get("metadata", {}).get("difficulte_defaut", 2),
                    "tags": data.get("metadata", {}).get("tags", []),
                    "source": "user",
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
        scenario = gen(req.description, req.scenario_id)
        return {
            "success": True,
            "scenario_id": scenario["id"],
            "persona": f"{scenario['persona']['identite']['prenom']} {scenario['persona']['identite']['nom']}",
            "poste": scenario["persona"]["identite"]["poste"],
            "entreprise": scenario["persona"]["identite"]["entreprise"]["nom"],
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


def _build_evaluation_prompt(scenario: dict, transcript_text: str, difficulty: int, duration_s: int) -> str:
    """Prompt d'évaluation FORCE 3D envoyé à Claude Sonnet."""
    persona = scenario["persona"]
    p = persona["identite"]
    ent = p.get("entreprise", {})

    return f"""Tu es un expert en évaluation de compétences commerciales selon la méthode FORCE 3D.

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

Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks :

{{
    "score_global": 0.0,
    "note_lettre": "A|B|C|D|E",
    "resultat_appel": "rdv_obtenu|mail_envoi|rappel_prevu|echec_poli|echec_dur",
    "competences": {{
        "accroche": {{
            "score": 0,
            "points_forts": ["string avec verbatim"],
            "points_progres": ["string avec verbatim + ce qu'il aurait dû dire"],
            "conseil": "string"
        }},
        "decouverte": {{ "score": 0, "points_forts": [], "points_progres": [], "conseil": "" }},
        "creation_enjeu": {{ "score": 0, "points_forts": [], "points_progres": [], "conseil": "" }},
        "argumentation": {{ "score": 0, "points_forts": [], "points_progres": [], "conseil": "" }},
        "traitement_objections": {{ "score": 0, "points_forts": [], "points_progres": [], "conseil": "" }},
        "engagement": {{ "score": 0, "points_forts": [], "points_progres": [], "conseil": "" }}
    }},
    "synthese": "2-3 phrases",
    "conseil_prioritaire": "LA chose à travailler en 1 phrase"
}}

RÈGLES :
- Sois exigeant mais juste. 15/20 est un très bon score.
- Note en fonction du niveau de difficulté : un 12/20 en difficulté 3 vaut mieux qu'un 16/20 en difficulté 1.
- Les verbatims doivent être EXACTS (copiés du transcript).
- Si le commercial n'a pas du tout couvert une compétence, note 2/20 max.
- Le conseil prioritaire doit être concret et actionnable."""


@app.post("/api/evaluate")
async def evaluate(req: EvaluateRequest):
    """Évalue un appel commercial via Claude Sonnet (FORCE 3D)."""
    # Formater le transcript
    transcript_text = _format_transcript(req.transcript)
    if not transcript_text.strip():
        raise HTTPException(400, "Transcript vide")

    # Vérifier minimum d'échanges (3 lignes)
    lines = [l for l in transcript_text.strip().split("\n") if l.strip()]
    if len(lines) < 3:
        raise HTTPException(400, "Appel trop court pour être évalué (minimum 3 échanges)")

    scenario = _load_scenario(req.scenario_id)
    prompt = _build_evaluation_prompt(scenario, transcript_text, req.difficulty, req.duration_s)

    try:
        client = anthropic.Anthropic()
        response = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = response.content[0].text.strip()

        # Parse JSON (handle potential markdown wrapping)
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        evaluation = json.loads(raw)

    except json.JSONDecodeError:
        raise HTTPException(500, "Erreur parsing évaluation (JSON invalide)")
    except Exception as e:
        raise HTTPException(500, f"Erreur évaluation : {str(e)}")

    # Save to DB
    score = evaluation.get("score_global", 0)
    transcript_str = transcript_text if isinstance(req.transcript, str) else json.dumps(
        [e.model_dump() for e in req.transcript], ensure_ascii=False
    )
    await save_evaluation(
        session_id=req.session_id or f"eval-{uuid.uuid4().hex[:8]}",
        scenario_id=req.scenario_id,
        difficulty=req.difficulty,
        transcript=transcript_str,
        evaluation_json=json.dumps(evaluation, ensure_ascii=False),
        score_global=score,
        user_id=req.user_id,
        session_ref_id=req.session_db_id,
    )

    # Complete the session if we have one
    if req.session_db_id:
        await complete_session(req.session_db_id, req.duration_s)

    return evaluation


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
    f = Path(__file__).parent / "sitemap.xml"
    if f.exists():
        return FileResponse(str(f), media_type="application/xml")
    raise HTTPException(404)


@app.get("/sitemap-blog.xml")
async def sitemap_blog():
    f = Path(__file__).parent / "sitemap-blog.xml"
    if f.exists():
        return FileResponse(str(f), media_type="application/xml")
    raise HTTPException(404)


@app.get("/robots.txt")
async def robots_txt():
    f = Path(__file__).parent / "robots.txt"
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


# --- SPA frontend routes (serve index.html for client-side routing) ---

@app.get("/produit")
@app.get("/tarifs")
@app.get("/scenarios")
@app.get("/ecoles")
@app.get("/contact")
@app.get("/mentions-legales")
@app.get("/confidentialite")
@app.get("/dashboard")
async def spa_page():
    return FileResponse(STATIC_DIR / "index.html", headers=_SPA_NO_CACHE)


@app.get("/demo.html")
async def serve_demo_html():
    return FileResponse(STATIC_DIR / "demo.html")


# Static files must be mounted LAST (catch-all)
app.mount("/assets", StaticFiles(directory=str(STATIC_DIR / "assets")), name="assets")
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
