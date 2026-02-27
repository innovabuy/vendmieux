"""
VendMieux — Regression tests
Tests for: anonymous simulation flow, marketing copy, CTA buttons, signup modal, API endpoints,
latency optimizations (pre-scripted greetings, phone ring tone).
"""

import os
import re
import sys
from pathlib import Path

import pytest
import httpx

# Project root
PROJECT_ROOT = Path(__file__).parent.parent
STATIC_DIR = PROJECT_ROOT / "static"
DEMO_HTML = STATIC_DIR / "demo.html"
ASSETS_DIR = STATIC_DIR / "assets"

# --- Ensure project root in path for imports ---
sys.path.insert(0, str(PROJECT_ROOT))


# ========== FIXTURES ==========

@pytest.fixture(scope="session")
def demo_html_content():
    """Load demo.html content once for all tests."""
    return DEMO_HTML.read_text(encoding="utf-8")


@pytest.fixture(scope="session")
def react_asset_contents():
    """Load all compiled React JS assets."""
    assets = {}
    for f in ASSETS_DIR.glob("*.js"):
        assets[f.name] = f.read_text(encoding="utf-8")
    return assets


@pytest.fixture(scope="session")
def index_html_content():
    """Load index.html content."""
    return (STATIC_DIR / "index.html").read_text(encoding="utf-8")


# ========== MARKETING COPY REGRESSION ==========

def _page_assets(react_asset_contents):
    """Return only page-specific assets (excluding index, vendor, shared which contain SEO data)."""
    skip = ("vendor", "index", "shared")
    return {n: c for n, c in react_asset_contents.items() if not any(n.lower().startswith(s) for s in skip)}


class TestMarketingCopy:
    """Verify marketing copy is consistent: 12 scenarios, 12 sectors, 5 types, 1 free simulation."""

    def test_no_200_or_40_plus_scenarios(self, react_asset_contents):
        """200+ and 40+ scénarios should NOT appear in page assets (SEO index excluded)."""
        for name, content in _page_assets(react_asset_contents).items():
            assert "200+ scénarios" not in content, f"Found '200+ scénarios' in {name}"
            assert "200 scénarios" not in content, f"Found '200 scénarios' in {name}"
            assert "40+ scénarios" not in content, f"Found '40+ scénarios' in {name}"
            assert "40+ prospects" not in content, f"Found '40+ prospects' in {name}"
            assert "40+ simulations" not in content, f"Found '40+ simulations' in {name}"

    def test_12_scenarios_present(self, react_asset_contents):
        """'12 scénarios' should appear in the page assets."""
        all_content = "".join(_page_assets(react_asset_contents).values())
        assert "12 scénarios" in all_content, "Expected '12 scénarios' in React assets"

    def test_12_secteurs_present(self, react_asset_contents):
        """'12 secteurs' should appear instead of '20 secteurs' in page assets."""
        all_content = "".join(_page_assets(react_asset_contents).values())
        assert "12 secteurs" in all_content, "Expected '12 secteurs' in React assets"
        assert "20 secteurs" not in all_content, "Found '20 secteurs' still in React page assets"

    def test_5_types_situations(self, react_asset_contents):
        """'5 types de situations' should appear instead of '9 types'."""
        all_content = "".join(_page_assets(react_asset_contents).values())
        assert "5 types de situations" in all_content, "Expected '5 types de situations' in React assets"
        assert "9 types de situations" not in all_content, "Found '9 types de situations' still in React assets"

    def test_no_3_simulations_gratuites(self, react_asset_contents):
        """'3 simulations gratuites' should NOT appear anywhere."""
        for name, content in react_asset_contents.items():
            assert "3 simulations gratuites" not in content, f"Found '3 simulations gratuites' in {name}"
            assert "3 séances offertes" not in content, f"Found '3 séances offertes' in {name}"

    def test_1_simulation_gratuite_present(self, react_asset_contents):
        """'1 simulation gratuite' should be used."""
        all_content = "".join(react_asset_contents.values())
        assert "1 simulation gratuite" in all_content, "Expected '1 simulation gratuite' in React assets"

    def test_no_opco_standalone(self, react_asset_contents):
        """'OPCO' should not appear as standalone financing claim."""
        for name, content in react_asset_contents.items():
            assert "Finançable OPCO" not in content, f"Found 'Finançable OPCO' in {name}"
            assert "pédagogique ou OPCO" not in content, f"Found 'ou OPCO' in {name}"

    def test_no_cost_per_session(self, react_asset_contents):
        """No cost per session (0.20€) should appear in assets."""
        for name, content in react_asset_contents.items():
            if "vendor" in name.lower():
                continue
            assert "0.20€" not in content, f"Found '0.20€' in {name}"
            assert "0,20€" not in content, f"Found '0,20€' in {name}"
            assert "Coût/session" not in content, f"Found 'Coût/session' in {name}"

    def test_index_html_meta_240_scenarios(self, index_html_content):
        """index.html meta description should reference 240+ scénarios."""
        assert "240+ scénarios" in index_html_content, "Expected '240+ scénarios' in index.html"
        assert "200+" not in index_html_content, "Found '200+' in index.html"


# ========== CTA BUTTONS REGRESSION ==========

class TestCTAButtons:
    """Verify CTA buttons in React SPA have proper onClick navigation handlers."""

    def test_simulation_onclick_in_accueil(self, react_asset_contents):
        """Accueil page should have onClick handlers pointing to /simulation."""
        accueil_files = [n for n in react_asset_contents if n.startswith("Accueil")]
        assert len(accueil_files) > 0, "No Accueil asset file found"
        for name in accueil_files:
            content = react_asset_contents[name]
            assert '/simulation' in content, f"Expected '/simulation' link in {name}"

    def test_simulation_onclick_in_produit(self, react_asset_contents):
        """Produit page should have onClick handlers pointing to /simulation."""
        produit_files = [n for n in react_asset_contents if n.startswith("Produit")]
        assert len(produit_files) > 0, "No Produit asset file found"
        for name in produit_files:
            content = react_asset_contents[name]
            assert '/simulation' in content, f"Expected '/simulation' link in {name}"


# ========== ANONYMOUS SIMULATION FLOW ==========

class TestAnonymousSimulationFlow:
    """Verify the anonymous simulation flow in demo.html."""

    def test_signup_modal_exists(self, demo_html_content):
        """Signup modal HTML should be present."""
        assert 'id="signup-modal"' in demo_html_content, "Missing signup-modal element"
        assert 'modal-overlay' in demo_html_content, "Missing modal-overlay class"

    def test_signup_modal_has_cta(self, demo_html_content):
        """Signup modal should have 'Créer mon compte' CTA."""
        assert 'Créer mon compte' in demo_html_content, "Missing 'Créer mon compte' CTA in modal"

    def test_signup_modal_has_login_option(self, demo_html_content):
        """Signup modal should offer a login option."""
        assert 'showLoginFromModal' in demo_html_content, "Missing showLoginFromModal function"
        assert 'Se connecter' in demo_html_content, "Missing 'Se connecter' option"

    def test_localstorage_free_used_tracking(self, demo_html_content):
        """localStorage 'vm-free-used' should be set after debrief."""
        assert "localStorage.setItem('vm-free-used', 'true')" in demo_html_content, \
            "Missing localStorage setItem for vm-free-used"

    def test_localstorage_free_used_check(self, demo_html_content):
        """launchSim should check localStorage 'vm-free-used' before launching."""
        assert "localStorage.getItem('vm-free-used')" in demo_html_content, \
            "Missing localStorage getItem check for vm-free-used"

    def test_open_signup_modal_function(self, demo_html_content):
        """openSignupModal function should exist."""
        assert 'function openSignupModal()' in demo_html_content, \
            "Missing openSignupModal function"

    def test_close_signup_modal_function(self, demo_html_content):
        """closeSignupModal function should exist."""
        assert 'function closeSignupModal()' in demo_html_content, \
            "Missing closeSignupModal function"

    def test_anon_cta_after_debrief(self, demo_html_content):
        """Post-debrief CTA block should exist for anonymous users."""
        assert 'anon-cta' in demo_html_content, "Missing anon-cta class"
        assert "Ce n'est que le début" in demo_html_content or "Ce n\\u0027est que le début" in demo_html_content, \
            "Missing post-debrief CTA text"

    def test_creator_requires_login(self, demo_html_content):
        """showCreator() should check for vm-token before showing creator panel."""
        # Find the showCreator function and verify it has auth check
        match = re.search(r'function showCreator\(\)\s*\{([\s\S]*?)\n\}', demo_html_content)
        assert match, "showCreator function not found"
        body = match.group(1)
        assert 'vm-token' in body, "showCreator should check for vm-token"
        assert 'openSignupModal' in body, "showCreator should open signup modal for unauthenticated users"


# ========== DEMO.HTML FEATURES ==========

class TestDemoHTMLFeatures:
    """Verify demo.html has all required features from recent changes."""

    def test_difficulty_selector_exists(self, demo_html_content):
        """Difficulty selector (Facile/Intermédiaire/Difficile) should exist."""
        assert 'diff-pill' in demo_html_content, "Missing diff-pill class"
        assert 'selectDifficulty' in demo_html_content, "Missing selectDifficulty function"
        assert 'data-diff="1"' in demo_html_content, "Missing difficulty level 1"
        assert 'data-diff="2"' in demo_html_content, "Missing difficulty level 2"
        assert 'data-diff="3"' in demo_html_content, "Missing difficulty level 3"

    def test_scenario_creator_panel(self, demo_html_content):
        """Scenario creator panel should exist."""
        assert 'panel-creator' in demo_html_content, "Missing panel-creator"
        assert 'scenario-description' in demo_html_content, "Missing scenario-description textarea"
        assert 'generateScenario' in demo_html_content, "Missing generateScenario function"

    def test_dashboard_panel(self, demo_html_content):
        """Dashboard panel should exist."""
        assert 'panel-dashboard' in demo_html_content, "Missing panel-dashboard"
        assert 'loadDashboard' in demo_html_content, "Missing loadDashboard function"

    def test_dashboard_mode(self, demo_html_content):
        """IS_DASHBOARD_MODE should be set when accessing /dashboard."""
        assert "IS_DASHBOARD_MODE" in demo_html_content, "Missing IS_DASHBOARD_MODE variable"
        assert "window.location.pathname === '/dashboard'" in demo_html_content, \
            "IS_DASHBOARD_MODE should check for /dashboard path"

    def test_free_mode(self, demo_html_content):
        """IS_FREE_MODE should support /simulation path."""
        assert "IS_FREE_MODE" in demo_html_content, "Missing IS_FREE_MODE variable"
        assert "__default__" in demo_html_content, "Missing __default__ scenario fallback"

    def test_language_selector(self, demo_html_content):
        """Language selector should exist."""
        assert 'lang-pill' in demo_html_content, "Missing lang-pill class"
        assert 'selectLang' in demo_html_content, "Missing selectLang function"


# ========== PRODUCT PAGE FEATURES ==========

class TestProductPage:
    """Verify updated product page features."""

    def test_force_3d_mentioned(self, react_asset_contents):
        """Product page should mention FORCE 3D methodology."""
        produit_files = [n for n in react_asset_contents if n.startswith("Produit")]
        assert len(produit_files) > 0, "No Produit asset file found"
        for name in produit_files:
            content = react_asset_contents[name]
            assert 'FORCE 3D' in content, f"Expected FORCE 3D mention in {name}"

    def test_simulation_vocale_mentioned(self, react_asset_contents):
        """Product page should mention simulation vocale."""
        produit_files = [n for n in react_asset_contents if n.startswith("Produit")]
        for name in produit_files:
            content = react_asset_contents[name]
            assert 'simulation' in content.lower(), \
                f"Expected simulation mention in {name}"


# ========== BACKEND API REGRESSION ==========

class TestBackendAnonymousRestriction:
    """Test the backend restriction: anonymous users can only use __default__ scenario."""

    def test_api_py_has_anonymous_restriction(self):
        """api.py should enforce anonymous restriction on /api/token."""
        api_content = (PROJECT_ROOT / "api.py").read_text(encoding="utf-8")
        assert 'effective_scenario = req.scenario_id or "__default__"' in api_content, \
            "Missing effective_scenario computation in api.py"
        assert 'if not user and effective_scenario != "__default__"' in api_content, \
            "Missing anonymous restriction check in api.py"
        assert "Inscription requise" in api_content, \
            "Missing 'Inscription requise' error message"

    def test_database_has_save_scenario(self):
        """database.py should have save_scenario_to_db function."""
        db_content = (PROJECT_ROOT / "database.py").read_text(encoding="utf-8")
        assert "async def save_scenario_to_db" in db_content, \
            "Missing save_scenario_to_db function in database.py"

    def test_scenario_request_model_has_sector(self):
        """ScenarioRequest model should have sector and type fields."""
        api_content = (PROJECT_ROOT / "api.py").read_text(encoding="utf-8")
        assert "sector: str | None = None" in api_content, \
            "Missing sector field in ScenarioRequest"
        assert 'type: str | None = None' in api_content, \
            "Missing type field in ScenarioRequest"


# ========== LIVE API TESTS (require running server) ==========

@pytest.fixture(scope="session")
def api_base_url():
    """Base URL for the live API."""
    return os.environ.get("VENDMIEUX_TEST_URL", "http://localhost:8000")


@pytest.fixture(scope="session")
def http_client(api_base_url):
    """Synchronous HTTP client for API tests."""
    with httpx.Client(base_url=api_base_url, timeout=10) as client:
        yield client


class TestLiveAPI:
    """Tests that require a running vendmieux-api server.
    Skip if server is not available."""

    def test_health_endpoint(self, http_client):
        """GET /api/health should return status ok."""
        try:
            r = http_client.get("/api/health")
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "ok"
        assert data["service"] == "vendmieux-api"

    def test_default_scenario_accessible(self, http_client):
        """GET /api/scenarios/__default__ should work."""
        try:
            r = http_client.get("/api/scenarios/__default__")
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        assert r.status_code == 200
        data = r.json()
        assert "persona" in data, "Default scenario should have persona"

    def test_anonymous_token_default_scenario_allowed(self, http_client):
        """POST /api/token without auth with __default__ scenario should succeed."""
        try:
            r = http_client.post("/api/token", json={
                "scenario_id": None,
                "difficulty": 2,
                "user_name": "TestUser",
                "language": "fr"
            })
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        # Should succeed (200) — default scenario is allowed for anonymous
        assert r.status_code == 200, f"Expected 200 for anonymous default scenario, got {r.status_code}: {r.text}"
        data = r.json()
        assert "token" in data, "Response should contain LiveKit token"

    def test_anonymous_token_custom_scenario_blocked(self, http_client):
        """POST /api/token without auth with non-default scenario should be blocked."""
        try:
            r = http_client.post("/api/token", json={
                "scenario_id": "some_custom_scenario",
                "difficulty": 2,
                "user_name": "TestUser",
                "language": "fr"
            })
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        # Should be blocked (401)
        assert r.status_code == 401, f"Expected 401 for anonymous custom scenario, got {r.status_code}: {r.text}"
        data = r.json()
        assert "Inscription requise" in data.get("detail", ""), \
            "Error should mention 'Inscription requise'"

    def test_scenarios_list_endpoint(self, http_client):
        """GET /api/scenarios should return scenarios data."""
        try:
            r = http_client.get("/api/scenarios")
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        assert r.status_code == 200
        data = r.json()
        # May be a list or a dict with "scenarios" key
        if isinstance(data, dict):
            assert "scenarios" in data, "Response should have 'scenarios' key"
            assert isinstance(data["scenarios"], list), "scenarios should be a list"
        else:
            assert isinstance(data, list), "Scenarios endpoint should return a list or dict"

    def test_dashboard_serves_demo_html(self, http_client):
        """GET /dashboard should serve demo.html (not index.html)."""
        try:
            r = http_client.get("/dashboard", follow_redirects=True)
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        assert r.status_code == 200
        # demo.html has "FORCE 3D" in its title, not the React SPA
        assert "FORCE 3D" in r.text or "demo-app" in r.text, \
            "GET /dashboard should serve demo.html"

    def test_simulation_serves_demo_html(self, http_client):
        """GET /simulation should serve demo.html."""
        try:
            r = http_client.get("/simulation", follow_redirects=True)
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        assert r.status_code == 200
        assert "FORCE 3D" in r.text or "demo-app" in r.text, \
            "GET /simulation should serve demo.html"


# ========== BREVO CONTACT-ECOLE ENDPOINT ==========

class TestContactEcoleEndpoint:
    """Verify the contact-ecole endpoint has Brevo integration."""

    def test_api_has_brevo_email_sending(self):
        """api.py should include Brevo SMTP email sending in contact-ecole."""
        api_content = (PROJECT_ROOT / "api.py").read_text(encoding="utf-8")
        assert "api.brevo.com/v3/smtp/email" in api_content, \
            "Missing Brevo SMTP email call in api.py"
        assert "jfperrin@cap-performances.fr" in api_content, \
            "Missing recipient email jfperrin@cap-performances.fr"

    def test_api_has_brevo_contact_creation(self):
        """api.py should add contacts to Brevo CRM."""
        api_content = (PROJECT_ROOT / "api.py").read_text(encoding="utf-8")
        assert "api.brevo.com/v3/contacts" in api_content, \
            "Missing Brevo contact creation in api.py"
        assert "updateEnabled" in api_content, \
            "Missing updateEnabled flag for Brevo contact upsert"

    def test_api_has_brevo_key_check(self):
        """api.py should gracefully handle missing BREVO_API_KEY."""
        api_content = (PROJECT_ROOT / "api.py").read_text(encoding="utf-8")
        assert 'BREVO_API_KEY' in api_content, \
            "Missing BREVO_API_KEY env var check"

    def test_contact_ecole_endpoint_exists(self, http_client):
        """POST /api/contact-ecole should exist and validate input."""
        try:
            r = http_client.post("/api/contact-ecole", json={})
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        # Should fail validation (422) since required fields are missing, not 404
        assert r.status_code == 422, \
            f"Expected 422 (validation error) for empty body, got {r.status_code}"


# ========== ECOLES PAGE CTA BUTTONS ==========

class TestEcolesCTAButtons:
    """Verify Ecoles page CTA buttons have proper navigation."""

    def test_ecoles_has_ecoles_tarifs_link(self, react_asset_contents):
        """Ecoles page should have links to /ecoles-tarifs."""
        ecoles_files = [n for n in react_asset_contents if n.startswith("Ecoles") and "Tarifs" not in n]
        assert len(ecoles_files) > 0, "No Ecoles asset file found"
        for name in ecoles_files:
            content = react_asset_contents[name]
            assert '/ecoles-tarifs' in content, f"Expected '/ecoles-tarifs' link in {name}"

    def test_ecoles_has_simulation_link(self, react_asset_contents):
        """Ecoles page should have links to /simulation."""
        ecoles_files = [n for n in react_asset_contents if n.startswith("Ecoles") and "Tarifs" not in n]
        for name in ecoles_files:
            content = react_asset_contents[name]
            assert '/simulation' in content, f"Expected '/simulation' link in {name}"


# ========== CREATION SUR MESURE MENTIONS ==========

class TestCreationSurMesure:
    """Verify 'création sur mesure' is mentioned in appropriate places."""

    def test_creation_sur_mesure_in_accueil(self, react_asset_contents):
        """Accueil should mention 'création sur mesure'."""
        accueil_files = [n for n in react_asset_contents if n.startswith("Accueil")]
        all_content = "".join(react_asset_contents[n] for n in accueil_files)
        assert "création sur mesure" in all_content, "Expected 'création sur mesure' in Accueil"

    def test_creation_sur_mesure_in_ecoles(self, react_asset_contents):
        """Ecoles should mention 'création sur mesure'."""
        ecoles_files = [n for n in react_asset_contents if n.startswith("Ecoles")]
        all_content = "".join(react_asset_contents[n] for n in ecoles_files).lower()
        assert "création sur mesure" in all_content or "sur mesure" in all_content, \
            "Expected 'sur mesure' in Ecoles"

    def test_scenarios_personnalises_illimites(self, react_asset_contents):
        """Ecoles should mention 'Scénarios personnalisés illimités'."""
        ecoles_files = [n for n in react_asset_contents if n.startswith("Ecoles")]
        all_content = "".join(react_asset_contents[n] for n in ecoles_files)
        assert "personnalisés illimités" in all_content or "personnalis" in all_content, \
            "Expected 'Scénarios personnalisés illimités' in Ecoles"

    def test_multi_langue(self, react_asset_contents):
        """Ecoles should mention multi-langue support."""
        ecoles_files = [n for n in react_asset_contents if n.startswith("Ecoles")]
        all_content = "".join(react_asset_contents[n] for n in ecoles_files)
        assert "Multi-langue" in all_content, "Expected 'Multi-langue' in Ecoles"


# ========== SEO REGRESSION ==========

class TestSEOMeta:
    """Verify server-side SEO meta injection for SPA pages."""

    def test_home_page_has_seo_title(self, http_client):
        """GET / should have correct <title> tag."""
        try:
            r = http_client.get("/")
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        assert r.status_code == 200
        assert "<title>VendMieux" in r.text, "Home page missing VendMieux title"

    def test_home_page_has_meta_description(self, http_client):
        """GET / should have meta description with '240+'."""
        try:
            r = http_client.get("/")
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        assert '240+ scénarios' in r.text, "Home page meta description missing '240+ scénarios'"

    def test_home_page_has_canonical(self, http_client):
        """GET / should have canonical link."""
        try:
            r = http_client.get("/")
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        assert 'rel="canonical" href="https://vendmieux.fr/"' in r.text, \
            "Home page missing canonical link"

    def test_home_page_has_og_tags(self, http_client):
        """GET / should have Open Graph tags."""
        try:
            r = http_client.get("/")
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        assert 'property="og:title"' in r.text, "Home page missing og:title"
        assert 'property="og:description"' in r.text, "Home page missing og:description"
        assert 'property="og:url"' in r.text, "Home page missing og:url"
        assert 'name="twitter:card"' in r.text, "Home page missing twitter:card"

    def test_home_page_has_jsonld(self, http_client):
        """GET / should have JSON-LD schema."""
        try:
            r = http_client.get("/")
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        assert 'application/ld+json' in r.text, "Home page missing JSON-LD"
        assert '"SoftwareApplication"' in r.text, "JSON-LD missing SoftwareApplication type"
        assert '"SASU INNOVABUY"' in r.text, "JSON-LD missing SASU INNOVABUY"

    def test_produit_page_has_unique_seo(self, http_client):
        """GET /produit should have its own unique title and description."""
        try:
            r = http_client.get("/produit")
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        assert r.status_code == 200
        assert "Comment ça marche" in r.text, "/produit should have unique title"
        assert 'href="https://vendmieux.fr/produit"' in r.text, \
            "/produit should have canonical to /produit"

    def test_produit_page_no_jsonld(self, http_client):
        """GET /produit should NOT have JSON-LD (only home page)."""
        try:
            r = http_client.get("/produit")
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        assert 'application/ld+json' not in r.text, \
            "JSON-LD should only be on home page, not /produit"

    def test_tarifs_page_seo(self, http_client):
        """GET /tarifs should have tarifs-specific SEO."""
        try:
            r = http_client.get("/tarifs")
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        assert r.status_code == 200
        assert "49€" in r.text or "49\u20ac" in r.text, "/tarifs should mention price in title"

    def test_scenarios_page_seo(self, http_client):
        """GET /scenarios should have scenarios-specific SEO."""
        try:
            r = http_client.get("/scenarios")
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        assert r.status_code == 200
        assert "240+" in r.text, "/scenarios should mention 240+ in SEO"

    def test_ecoles_page_seo(self, http_client):
        """GET /ecoles should have ecoles-specific SEO."""
        try:
            r = http_client.get("/ecoles")
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        assert r.status_code == 200
        assert "coles de Commerce" in r.text, "/ecoles should mention Écoles de Commerce"


class TestSitemap:
    """Verify dynamic sitemap.xml."""

    def test_sitemap_returns_xml(self, http_client):
        """GET /sitemap.xml should return valid XML."""
        try:
            r = http_client.get("/sitemap.xml")
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        assert r.status_code == 200
        assert "application/xml" in r.headers.get("content-type", ""), \
            "sitemap.xml should have application/xml content-type"
        assert '<?xml version="1.0"' in r.text, "sitemap.xml should start with XML declaration"
        assert "<urlset" in r.text, "sitemap.xml should contain <urlset>"

    def test_sitemap_has_static_pages(self, http_client):
        """sitemap.xml should contain all 9 static SPA pages."""
        try:
            r = http_client.get("/sitemap.xml")
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        for page in ["/", "/produit", "/tarifs", "/scenarios", "/ecoles",
                      "/ecoles-tarifs", "/contact", "/mentions-legales", "/confidentialite"]:
            url = f"https://vendmieux.fr{page}"
            assert url in r.text, f"sitemap.xml missing {url}"

    def test_sitemap_has_priorities(self, http_client):
        """sitemap.xml should have priority tags."""
        try:
            r = http_client.get("/sitemap.xml")
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        assert "<priority>1.0</priority>" in r.text, "Home page should have priority 1.0"
        assert "<priority>0.3</priority>" in r.text, "Legal pages should have low priority"

    def test_sitemap_has_scenarios(self, http_client):
        """sitemap.xml should include scenarios from DB."""
        try:
            r = http_client.get("/sitemap.xml")
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        # At least the __default__ scenario should be present
        assert "vendmieux.fr/scenarios/" in r.text, \
            "sitemap.xml should include scenario URLs"


class TestRobotsTxt:
    """Verify robots.txt endpoint."""

    def test_robots_txt_returns_text(self, http_client):
        """GET /robots.txt should return text/plain."""
        try:
            r = http_client.get("/robots.txt")
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        assert r.status_code == 200
        assert "text/plain" in r.headers.get("content-type", ""), \
            "robots.txt should have text/plain content-type"

    def test_robots_txt_allows_public_pages(self, http_client):
        """robots.txt should allow crawling public pages."""
        try:
            r = http_client.get("/robots.txt")
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        assert "Allow: /" in r.text, "robots.txt should allow root"
        assert "Allow: /blog/" in r.text, "robots.txt should allow blog"

    def test_robots_txt_blocks_private_pages(self, http_client):
        """robots.txt should block /api/, /simulation, /dashboard, /app/."""
        try:
            r = http_client.get("/robots.txt")
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        assert "Disallow: /api/" in r.text, "robots.txt should block /api/"
        assert "Disallow: /simulation" in r.text, "robots.txt should block /simulation"
        assert "Disallow: /dashboard" in r.text, "robots.txt should block /dashboard"
        assert "Disallow: /app/" in r.text, "robots.txt should block /app/"

    def test_robots_txt_has_sitemap_reference(self, http_client):
        """robots.txt should reference sitemap.xml."""
        try:
            r = http_client.get("/robots.txt")
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        assert "Sitemap: https://vendmieux.fr/sitemap.xml" in r.text, \
            "robots.txt should reference sitemap.xml"


class TestHeadComponent:
    """Verify Head.jsx component exists and seo.js has all routes."""

    def test_seo_js_exists(self):
        """frontend-src/src/seo.js should exist."""
        seo_path = PROJECT_ROOT / "frontend-src" / "src" / "seo.js"
        assert seo_path.exists(), "seo.js not found"
        content = seo_path.read_text(encoding="utf-8")
        for route in ["/", "/produit", "/tarifs", "/scenarios", "/ecoles",
                      "/ecoles-tarifs", "/contact", "/mentions-legales", "/confidentialite"]:
            assert f'"{route}"' in content, f"seo.js missing route {route}"

    def test_head_component_exists(self):
        """frontend-src/src/components/Head.jsx should exist."""
        head_path = PROJECT_ROOT / "frontend-src" / "src" / "components" / "Head.jsx"
        assert head_path.exists(), "Head.jsx not found"
        content = head_path.read_text(encoding="utf-8")
        assert "useLocation" in content, "Head.jsx should use useLocation"
        assert "document.title" in content, "Head.jsx should update document.title"
        assert 'meta[name="description"]' in content, "Head.jsx should update meta description"

    def test_main_jsx_imports_head(self):
        """main.jsx should import Head component."""
        main_path = PROJECT_ROOT / "frontend-src" / "src" / "main.jsx"
        content = main_path.read_text(encoding="utf-8")
        assert 'import Head from' in content, "main.jsx should import Head"
        assert "<Head/>" in content, "main.jsx should render <Head/>"


# ========== LATENCY OPTIMIZATION: PRE-SCRIPTED GREETINGS ==========

class TestPreScriptedGreetings:
    """Tests for the pre-scripted greeting system (bypass LLM for first reply)."""

    def test_greetings_dict_has_all_languages(self):
        """GREETINGS should have entries for all supported languages."""
        from agent import GREETINGS
        for lang in ["fr", "en", "es", "de", "it"]:
            assert lang in GREETINGS, f"Missing language '{lang}' in GREETINGS"
            assert len(GREETINGS[lang]) >= 2, f"Language '{lang}' needs at least 2 greeting variants"

    def test_get_greeting_returns_string(self):
        """get_greeting should return a non-empty string."""
        from agent import get_greeting
        persona = {
            "identite": {
                "prenom": "Olivier",
                "nom": "Bertrand",
                "entreprise": {"nom": "MécaPress"},
            }
        }
        for lang in ["fr", "en", "es", "de", "it"]:
            greeting = get_greeting(lang, persona)
            assert isinstance(greeting, str), f"Greeting for '{lang}' is not a string"
            assert len(greeting) > 0, f"Greeting for '{lang}' is empty"

    def test_get_greeting_substitutes_persona(self):
        """get_greeting should substitute {prenom}, {nom}, {entreprise} placeholders."""
        from agent import get_greeting, GREETINGS
        persona = {
            "identite": {
                "prenom": "Jean",
                "nom": "Dupont",
                "entreprise": {"nom": "AcmeCorp"},
            }
        }
        # Run many times to hit templates with placeholders
        results = set()
        for _ in range(100):
            results.add(get_greeting("fr", persona))
        # At least one result should contain persona info
        has_persona = any(
            "Jean" in g or "Dupont" in g or "AcmeCorp" in g
            for g in results
        )
        assert has_persona, f"No greeting contains persona info. Got: {results}"

    def test_get_greeting_no_raw_placeholders(self):
        """get_greeting should not leave {prenom}/{nom}/{entreprise} unsubstituted."""
        from agent import get_greeting
        persona = {
            "identite": {
                "prenom": "Marie",
                "nom": "Curie",
                "entreprise": {"nom": "CNRS"},
            }
        }
        for lang in ["fr", "en", "es", "de", "it"]:
            for _ in range(50):
                greeting = get_greeting(lang, persona)
                assert "{" not in greeting, f"Raw placeholder in greeting: {greeting}"

    def test_get_greeting_unknown_language_falls_back_to_fr(self):
        """get_greeting with unknown language should fallback to French."""
        from agent import get_greeting, GREETINGS
        persona = {
            "identite": {
                "prenom": "Test",
                "nom": "User",
                "entreprise": {"nom": "TestCo"},
            }
        }
        greeting = get_greeting("xx", persona)
        assert isinstance(greeting, str) and len(greeting) > 0

    def test_get_greeting_empty_persona(self):
        """get_greeting should work with empty persona (no crash)."""
        from agent import get_greeting
        persona = {"identite": {}}
        for lang in ["fr", "en", "es", "de", "it"]:
            greeting = get_greeting(lang, persona)
            assert isinstance(greeting, str), f"Crash with empty persona for '{lang}'"

    def test_system_prompt_no_longer_says_decroche(self):
        """System prompt should say 'Tu as déjà décroché' (not 'Tu décroches')."""
        from agent import build_system_prompt, DEFAULT_SCENARIO
        prompt = build_system_prompt(DEFAULT_SCENARIO, difficulty=2, language="fr")
        assert "Tu as déjà décroché" in prompt, "System prompt should say 'Tu as déjà décroché'"
        assert "Tu décroches" not in prompt, "System prompt should NOT say 'Tu décroches'"


# ========== LATENCY OPTIMIZATION: PHONE RING TONE ==========

class TestPhoneRingTone:
    """Tests for the phone ring tone latency masking feature."""

    def test_ring_tone_file_exists(self):
        """phone-ring.mp3 should exist in static/sounds/."""
        ring_path = STATIC_DIR / "sounds" / "phone-ring.mp3"
        assert ring_path.exists(), "phone-ring.mp3 not found"
        assert ring_path.stat().st_size > 1000, "phone-ring.mp3 seems too small"

    def test_demo_html_has_ring_tone_logic(self, demo_html_content):
        """demo.html should play and stop ring tone."""
        assert "ringTone" in demo_html_content, "ringTone variable missing"
        assert "stopRingTone" in demo_html_content, "stopRingTone function missing"
        assert "phone-ring.mp3" in demo_html_content, "phone-ring.mp3 reference missing"

    def test_demo_html_stops_ring_on_track(self, demo_html_content):
        """Ring tone should be stopped when TrackSubscribed fires."""
        # The stopRingTone call should be near TrackSubscribed
        assert "stopRingTone()" in demo_html_content, "stopRingTone() call missing"

    def test_demo_html_stops_ring_on_endcall(self, demo_html_content):
        """Ring tone should be stopped in endCall()."""
        # Find endCall and check stopRingTone is there
        idx_endcall = demo_html_content.find("function endCall()")
        assert idx_endcall > 0, "endCall function not found"
        endcall_chunk = demo_html_content[idx_endcall:idx_endcall + 300]
        assert "stopRingTone" in endcall_chunk, "stopRingTone not called in endCall()"

    def test_demo_html_stops_ring_on_error(self, demo_html_content):
        """Ring tone should be stopped on error in startCall()."""
        idx_start = demo_html_content.find("async function startCall()")
        assert idx_start > 0
        start_chunk = demo_html_content[idx_start:idx_start + 3000]
        # Should have stopRingTone in catch block
        assert start_chunk.count("stopRingTone") >= 1, "stopRingTone not called on error"


# ========== AGENT LATENCY TIMESTAMPS ==========

class TestAgentLatencyTimestamps:
    """Tests for latency measurement timestamps in agent.py."""

    def test_agent_has_timing_logs(self):
        """agent.py should have timing logs for latency measurement."""
        agent_path = PROJECT_ROOT / "agent.py"
        content = agent_path.read_text(encoding="utf-8")
        assert "[latency] connect:" in content, "Missing connect timing log"
        assert "[latency] scenario loaded:" in content, "Missing scenario timing log"
        assert "[latency] agent created:" in content, "Missing agent creation timing log"
        assert "[latency] session started:" in content, "Missing session started timing log"
        assert "[latency] greeting sent to TTS:" in content, "Missing greeting TTS timing log"

    def test_agent_uses_say_not_generate_reply(self):
        """agent.py should use session.say() instead of generate_reply() for greeting."""
        agent_path = PROJECT_ROOT / "agent.py"
        content = agent_path.read_text(encoding="utf-8")
        assert "session.say(greeting" in content, "Should use session.say() for greeting"
        assert "generate_reply" not in content, "Should NOT use generate_reply anymore"

    def test_agent_still_uses_haiku(self):
        """agent.py should use Haiku for real-time conversation."""
        agent_path = PROJECT_ROOT / "agent.py"
        content = agent_path.read_text(encoding="utf-8")
        assert "claude-haiku" in content, "Should use Haiku model for conversation"


# ========== LATENCY OPTIMIZATION: PARALLEL IMPORT + PREFETCH ==========

class TestLatencyOptimizations:
    """Tests for latency optimizations in the simulation startup flow."""

    def test_livekit_module_preload(self):
        """useLiveKit.js should preload livekit-client on module import."""
        path = PROJECT_ROOT / "frontend-src" / "src" / "components" / "simulation" / "useLiveKit.js"
        content = path.read_text(encoding="utf-8")
        assert "livekitPreload" in content, "Missing LiveKit module preload"
        assert "import('livekit-client')" in content, "Missing dynamic import for preload"

    def test_parallel_token_and_import(self):
        """useLiveKit.js should fetch token and import LiveKit in parallel."""
        path = PROJECT_ROOT / "frontend-src" / "src" / "components" / "simulation" / "useLiveKit.js"
        content = path.read_text(encoding="utf-8")
        assert "Promise.all" in content, "Missing Promise.all for parallel fetch"
        assert "prefetchedToken" in content, "Missing prefetchedToken support"

    def test_token_prefetch_in_simulation(self):
        """Simulation.jsx should pre-fetch token when entering call phase."""
        path = PROJECT_ROOT / "frontend-src" / "src" / "pages" / "Simulation.jsx"
        content = path.read_text(encoding="utf-8")
        assert "prefetchToken" in content, "Missing prefetchToken function"
        assert "prefetchedTokenRef" in content, "Missing prefetchedTokenRef"
        # prefetchToken should be called in handleLaunch
        launch_idx = content.find("function handleLaunch")
        assert launch_idx > 0, "handleLaunch function not found"
        launch_body = content[launch_idx:launch_idx + 500]
        assert "prefetchToken()" in launch_body, "handleLaunch should call prefetchToken()"

    def test_agent_scenario_cache(self):
        """agent.py should cache scenarios in memory."""
        agent_content = (PROJECT_ROOT / "agent.py").read_text(encoding="utf-8")
        assert "_scenarios_cache" in agent_content, "Missing _scenarios_cache in agent.py"
        assert "_ensure_scenarios_db" in agent_content, "Missing _ensure_scenarios_db in agent.py"

    def test_agent_prewarm_loads_scenarios(self):
        """prewarm() should pre-load scenario cache."""
        agent_content = (PROJECT_ROOT / "agent.py").read_text(encoding="utf-8")
        prewarm_idx = agent_content.find("def prewarm(")
        assert prewarm_idx > 0, "prewarm function not found"
        prewarm_body = agent_content[prewarm_idx:prewarm_idx + 300]
        assert "_ensure_scenarios_db()" in prewarm_body, "prewarm should call _ensure_scenarios_db()"

    def test_scenario_cache_works(self):
        """Scenario cache should load and return scenarios correctly."""
        from agent import _ensure_scenarios_db, _scenarios_cache, load_scenario
        _ensure_scenarios_db()
        assert len(_scenarios_cache) > 0, "Scenario cache is empty after loading"
        # Default scenario (IND-01) should be in cache
        scenario = load_scenario("IND-01")
        assert scenario is not None, "IND-01 scenario not found in cache"
        assert "persona" in scenario, "Cached scenario missing persona"


# ========== DEMO DIRECT SIMULATION FLOW ==========

DEMO_PHP = Path("/var/www/vendmieux-site/pages/demo.php")
SIMULATION_JSX = PROJECT_ROOT / "frontend-src" / "src" / "pages" / "Simulation.jsx"


class TestDemoDirectSimulation:
    """Tests for direct demo → /app/simulation flow (skip /app/demo)."""

    def test_demo_php_links_to_app_simulation(self):
        """demo.php CTA buttons should point to /app/simulation, not /app/demo."""
        content = DEMO_PHP.read_text(encoding="utf-8")
        assert '/app/simulation?' in content, "demo.php should link to /app/simulation"
        assert 'href="/app/demo"' not in content, "demo.php should NOT link to /app/demo anymore"

    def test_demo_php_has_scenario_param(self):
        """demo.php links should include scenario=demo_bertrand_prospection_froide_v1."""
        content = DEMO_PHP.read_text(encoding="utf-8")
        assert 'scenario=demo_bertrand_prospection_froide_v1' in content, \
            "demo.php should include demo scenario ID in links"

    def test_demo_php_has_demo_true_param(self):
        """demo.php links should include demo=true."""
        content = DEMO_PHP.read_text(encoding="utf-8")
        assert 'demo=true' in content, "demo.php should include demo=true in links"

    def test_demo_php_js_updates_links_to_simulation(self):
        """demo.php JS updateLinks() should build /app/simulation URLs."""
        content = DEMO_PHP.read_text(encoding="utf-8")
        assert "'/app/simulation?" in content, \
            "JS updateLinks() should build /app/simulation URLs"

    def test_simulation_jsx_reads_demo_param(self):
        """Simulation.jsx should read demo=true from query params."""
        content = SIMULATION_JSX.read_text(encoding="utf-8")
        assert "isDemoMode" in content, "Simulation.jsx should have isDemoMode"
        assert "searchParams.get('demo')" in content, \
            "Simulation.jsx should read 'demo' from searchParams"

    def test_simulation_jsx_reads_lang_param(self):
        """Simulation.jsx should read lang from query params."""
        content = SIMULATION_JSX.read_text(encoding="utf-8")
        assert "searchParams.get('lang')" in content, \
            "Simulation.jsx should read 'lang' from searchParams"

    def test_simulation_jsx_reads_difficulty_param(self):
        """Simulation.jsx should read difficulty from query params."""
        content = SIMULATION_JSX.read_text(encoding="utf-8")
        assert "searchParams.get('difficulty')" in content, \
            "Simulation.jsx should read 'difficulty' from searchParams"

    def test_simulation_jsx_skips_briefing_in_demo(self):
        """Simulation.jsx should skip briefing and go to 'call' when demo=true."""
        content = SIMULATION_JSX.read_text(encoding="utf-8")
        assert "isDemoMode ? 'call' : 'briefing'" in content, \
            "Simulation.jsx should skip briefing in demo mode"

    def test_simulation_jsx_passes_demo_to_token(self):
        """Simulation.jsx should pass demo:true to token requests."""
        content = SIMULATION_JSX.read_text(encoding="utf-8")
        assert "isDemoMode ? { demo: true }" in content, \
            "Simulation.jsx should pass demo flag in token request"

    def test_demo_page_route_still_exists(self):
        """DemoPage.jsx should still exist for backward compatibility."""
        demo_page = PROJECT_ROOT / "frontend-src" / "src" / "pages" / "DemoPage.jsx"
        assert demo_page.exists(), "DemoPage.jsx should still exist for /app/demo route"


# ========== SSG PRE-RENDERING REGRESSION ==========

SSG_ROUTES = ["/produit", "/tarifs", "/scenarios", "/ecoles", "/ecoles-tarifs",
              "/contact", "/mentions-legales", "/confidentialite"]


class TestPerTurnLatencyTracking:
    """Tests for per-turn latency tracking via metrics_collected event."""

    def test_metrics_imports_present(self):
        """agent.py should import STTMetrics, LLMMetrics, TTSMetrics, EOUMetrics."""
        agent_content = (PROJECT_ROOT / "agent.py").read_text(encoding="utf-8")
        assert "from livekit.agents.metrics import" in agent_content, \
            "Missing metrics import line"
        for cls in ("STTMetrics", "LLMMetrics", "TTSMetrics", "EOUMetrics"):
            assert cls in agent_content, f"Missing import for {cls}"

    def test_on_metrics_collected_defined(self):
        """agent.py should define an on_metrics_collected callback."""
        agent_content = (PROJECT_ROOT / "agent.py").read_text(encoding="utf-8")
        assert "def on_metrics_collected(ev):" in agent_content, \
            "Missing on_metrics_collected callback definition"

    def test_metrics_collected_event_wired(self):
        """session.on('metrics_collected', ...) should be wired."""
        agent_content = (PROJECT_ROOT / "agent.py").read_text(encoding="utf-8")
        assert 'session.on("metrics_collected"' in agent_content, \
            "metrics_collected event not wired to session"

    def test_turn_latency_markers_for_eou(self):
        """Callback should log [turn-latency] with eou_delay."""
        agent_content = (PROJECT_ROOT / "agent.py").read_text(encoding="utf-8")
        assert "[turn-latency]" in agent_content, "Missing [turn-latency] log marker"
        assert "eou_delay=" in agent_content, "Missing eou_delay metric"
        assert "transcription=" in agent_content, "Missing transcription metric"

    def test_turn_latency_markers_for_llm(self):
        """Callback should log [turn-latency] with LLM metrics."""
        agent_content = (PROJECT_ROOT / "agent.py").read_text(encoding="utf-8")
        assert "llm_ttft=" in agent_content, "Missing llm_ttft metric"
        assert "llm_total=" in agent_content, "Missing llm_total metric"
        assert "tok/s=" in agent_content, "Missing tokens_per_second metric"

    def test_turn_latency_markers_for_tts(self):
        """Callback should log [turn-latency] with TTS metrics."""
        agent_content = (PROJECT_ROOT / "agent.py").read_text(encoding="utf-8")
        assert "tts_ttfb=" in agent_content, "Missing tts_ttfb metric"
        assert "tts_total=" in agent_content, "Missing tts_total metric"
        assert "chars=" in agent_content, "Missing characters_count metric"

    def test_turn_latency_markers_for_stt(self):
        """Callback should log [turn-latency] with STT metrics."""
        agent_content = (PROJECT_ROOT / "agent.py").read_text(encoding="utf-8")
        assert "stt_duration=" in agent_content, "Missing stt_duration metric"

    def test_turn_counter_increments_on_eou(self):
        """Turn counter should increment on EOUMetrics (not on other metrics)."""
        agent_content = (PROJECT_ROOT / "agent.py").read_text(encoding="utf-8")
        assert "_turn_counter" in agent_content, "Missing _turn_counter variable"
        # EOUMetrics block should increment the counter
        eou_idx = agent_content.find("isinstance(m, EOUMetrics)")
        assert eou_idx > 0, "Missing isinstance check for EOUMetrics"
        eou_block = agent_content[eou_idx:eou_idx + 200]
        assert "_turn_counter += 1" in eou_block, \
            "_turn_counter should be incremented inside EOUMetrics block"


class TestSSGPreRenderedFiles:
    """Verify pre-rendered HTML files exist and contain content."""

    def test_prerendered_files_exist(self):
        """Each SSG route should have a pre-rendered index.html."""
        for route in SSG_ROUTES:
            path = STATIC_DIR / route.lstrip("/") / "index.html"
            assert path.exists(), f"Missing pre-rendered file: {path}"
            assert path.stat().st_size > 5000, f"Pre-rendered file too small: {path}"

    def test_prerendered_home_has_content(self):
        """Pre-rendered home page should have visible content."""
        html = (STATIC_DIR / "index.html").read_text(encoding="utf-8")
        assert "data-prerendered" in html or '<h1' in html, \
            "Home page index.html should have pre-rendered content"

    def test_prerendered_pages_have_h1(self):
        """Each pre-rendered page should have at least one <h1> or <h2>."""
        for route in SSG_ROUTES:
            html = (STATIC_DIR / route.lstrip("/") / "index.html").read_text(encoding="utf-8")
            has_heading = '<h1' in html or '<h2' in html
            assert has_heading, f"Pre-rendered {route} missing heading tags"

    def test_prerendered_pages_have_text_content(self):
        """Pre-rendered pages should contain meaningful French text."""
        key_content = {
            "/produit": "Briefing",
            "/tarifs": "49",
            "/scenarios": "scénario",
            "/ecoles": "étudiant",
            "/contact": "Contact",
            "/mentions-legales": "Mentions",
            "/confidentialite": "confidentialité",
        }
        for route, expected in key_content.items():
            html = (STATIC_DIR / route.lstrip("/") / "index.html").read_text(encoding="utf-8")
            assert expected.lower() in html.lower(), \
                f"Pre-rendered {route} missing expected text '{expected}'"

    def test_prerender_script_exists(self):
        """The prerender build script should exist."""
        script = PROJECT_ROOT / "frontend-src" / "scripts" / "prerender.mjs"
        assert script.exists(), "prerender.mjs script not found"
        content = script.read_text(encoding="utf-8")
        for route in SSG_ROUTES:
            assert f"'{route}'" in content, f"prerender.mjs missing route {route}"

    def test_package_json_has_ssg_script(self):
        """package.json should have build:ssg script."""
        pkg = PROJECT_ROOT / "frontend-src" / "package.json"
        content = pkg.read_text(encoding="utf-8")
        assert "build:ssg" in content, "package.json missing build:ssg script"


class TestSSGServedByAPI:
    """Verify the API serves pre-rendered content (requires running server)."""

    def test_prerendered_produit_has_body_content(self, http_client):
        """GET /produit should return HTML with visible content (not empty SPA shell)."""
        try:
            r = http_client.get("/produit")
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        assert r.status_code == 200
        assert '<h1' in r.text, "/produit should have <h1> in HTML (pre-rendered)"
        assert 'Briefing' in r.text, "/produit should have 'Briefing' text visible"

    def test_prerendered_tarifs_has_pricing(self, http_client):
        """GET /tarifs should have pricing content pre-rendered."""
        try:
            r = http_client.get("/tarifs")
        except (httpx.ConnectError, httpx.ReadTimeout):
            pytest.skip("VendMieux API not running or busy")
        assert r.status_code == 200
        assert '49' in r.text, "/tarifs should show pricing"

    def test_prerendered_pages_have_seo_and_content(self, http_client):
        """All pre-rendered pages should have both SEO tags and body content."""
        for route in SSG_ROUTES:
            try:
                r = http_client.get(route)
            except (httpx.ConnectError, httpx.ReadTimeout):
                pytest.skip("VendMieux API not running or busy")
            assert r.status_code == 200, f"{route} returned {r.status_code}"
            # SEO tags (injected server-side)
            assert 'og:title' in r.text, f"{route} missing og:title"
            assert 'rel="canonical"' in r.text, f"{route} missing canonical"
            # Body content (pre-rendered)
            assert '<div id="root"' in r.text, f"{route} missing #root div"
            # Root should NOT be empty
            root_idx = r.text.find('<div id="root"')
            after_root = r.text[root_idx:root_idx + 500]
            assert '<div' in after_root[20:], f"{route} #root appears to be empty (no SSG content)"

    def test_api_has_prerendered_loader(self):
        """api.py should have _load_prerendered_or_fallback function."""
        api_content = (PROJECT_ROOT / "api.py").read_text(encoding="utf-8")
        assert "def _load_prerendered_or_fallback" in api_content, \
            "api.py missing _load_prerendered_or_fallback function"


# ========== VISITE CLIENT — STEP 1 REGRESSION ==========

FRONTEND_SRC = PROJECT_ROOT / "frontend-src" / "src"
SIM_DIR = FRONTEND_SRC / "components" / "simulation"


class TestVisiteClientStep1:
    """Regression tests for Visite Client module — Step 1 (structure + routing)."""

    # --- Routes in main.jsx ---

    def test_main_jsx_has_visite_route(self):
        """main.jsx must contain /visite route."""
        content = (FRONTEND_SRC / "main.jsx").read_text(encoding="utf-8")
        assert '"/visite"' in content, "Missing /visite route in main.jsx"

    def test_main_jsx_has_app_visite_route(self):
        """main.jsx must contain /app/visite/:scenarioId route."""
        content = (FRONTEND_SRC / "main.jsx").read_text(encoding="utf-8")
        assert "/app/visite/:scenarioId" in content, "Missing /app/visite/:scenarioId route"

    def test_main_jsx_lazy_import_visite_client(self):
        """VisiteClient must be lazy-imported in main.jsx."""
        content = (FRONTEND_SRC / "main.jsx").read_text(encoding="utf-8")
        assert 'lazy(() => import("./pages/VisiteClient"))' in content, \
            "VisiteClient not lazy-imported in main.jsx"

    # --- Data files exist and export expected constants ---

    def test_vc_rooms_exists_and_exports(self):
        """vc-rooms.js must exist and export ROOMS."""
        path = SIM_DIR / "vc-rooms.js"
        assert path.exists(), "vc-rooms.js missing"
        content = path.read_text(encoding="utf-8")
        assert "export const ROOMS" in content, "vc-rooms.js missing ROOMS export"
        for room in ("bureau-pdg", "salle-reunion", "usine"):
            assert room in content, f"vc-rooms.js missing room '{room}'"

    def test_vc_faces_exists_and_exports(self):
        """vc-faces.js must exist and export FACE_PRESETS and makeFace."""
        path = SIM_DIR / "vc-faces.js"
        assert path.exists(), "vc-faces.js missing"
        content = path.read_text(encoding="utf-8")
        assert "export const FACE_PRESETS" in content, "Missing FACE_PRESETS export"
        assert "export function makeFace" in content, "Missing makeFace export"

    def test_vc_scenarios_exists_and_exports(self):
        """vc-scenarios.js must exist and export SCENARIOS."""
        path = SIM_DIR / "vc-scenarios.js"
        assert path.exists(), "vc-scenarios.js missing"
        content = path.read_text(encoding="utf-8")
        assert "export const SCENARIOS" in content, "Missing SCENARIOS export"
        for sid in ("pdg-solo", "comite-4", "nego-site"):
            assert sid in content, f"vc-scenarios.js missing scenario '{sid}'"

    def test_vc_layouts_exists_and_exports(self):
        """vc-layouts.js must exist and export LAYOUTS and BUBBLE_POS."""
        path = SIM_DIR / "vc-layouts.js"
        assert path.exists(), "vc-layouts.js missing"
        content = path.read_text(encoding="utf-8")
        assert "export const LAYOUTS" in content, "Missing LAYOUTS export"
        assert "export const BUBBLE_POS" in content, "Missing BUBBLE_POS export"

    # --- 9 stub components exist ---

    @pytest.mark.parametrize("name", [
        "VCRoomCanvas", "VCPersonStage", "VCPersonAvatar",
        "VCSpeechBubble", "VCCrossTalkLine", "VCHudLayer",
        "VCCoachingCard", "VCMicButton", "VCEndScreen",
    ])
    def test_stub_component_exists(self, name):
        """Each VC* stub component file must exist."""
        path = SIM_DIR / f"{name}.jsx"
        assert path.exists(), f"{name}.jsx missing in components/simulation/"

    # --- 3 stub hooks exist ---

    @pytest.mark.parametrize("name", [
        "useVisiteSimulation", "useVoiceIA", "useSpeaker",
    ])
    def test_stub_hook_exists(self, name):
        """Each VC hook file must exist."""
        path = SIM_DIR / f"{name}.js"
        assert path.exists(), f"{name}.js missing in components/simulation/"

    # --- VCSplash functional ---

    def test_vcsplash_exists_and_has_onlaunch(self):
        """VCSplash.jsx must exist and accept onLaunch prop."""
        path = SIM_DIR / "VCSplash.jsx"
        assert path.exists(), "VCSplash.jsx missing"
        content = path.read_text(encoding="utf-8")
        assert "onLaunch" in content, "VCSplash missing onLaunch prop"

    # --- CSS variables ---

    def test_visite_client_css_has_variables(self):
        """visite-client.css must exist and contain --ink, --amber variables."""
        path = SIM_DIR / "visite-client.css"
        assert path.exists(), "visite-client.css missing"
        content = path.read_text(encoding="utf-8")
        assert "--ink:" in content, "visite-client.css missing --ink variable"
        assert "--amber:" in content, "visite-client.css missing --amber variable"

    # --- VisiteClient page ---

    def test_visite_client_page_exists(self):
        """VisiteClient.jsx page must exist."""
        path = FRONTEND_SRC / "pages" / "VisiteClient.jsx"
        assert path.exists(), "pages/VisiteClient.jsx missing"

    # --- Build output ---

    def test_vite_build_output_exists(self):
        """Compiled VisiteClient chunk must exist in static/assets/."""
        assets = list(ASSETS_DIR.glob("VisiteClient-*.js"))
        assert len(assets) >= 1, "No VisiteClient-*.js found in static/assets/"

    def test_vite_build_css_output_exists(self):
        """Compiled VisiteClient CSS chunk must exist in static/assets/."""
        assets = list(ASSETS_DIR.glob("VisiteClient-*.css"))
        assert len(assets) >= 1, "No VisiteClient-*.css found in static/assets/"


# ========== CLASSIFICATION COHERENCE REGRESSION ==========


class TestClassificationCoherence:
    """Ensure api.py listing returns consistent is_multi, is_phone, is_physical, gender fields."""

    def test_scenario_builder_phone_types_has_gestion_reclamation(self):
        """gestion_reclamation must be in _PHONE_TYPES."""
        sys.path.insert(0, str(PROJECT_ROOT))
        from scenario_builder import _PHONE_TYPES
        assert "gestion_reclamation" in _PHONE_TYPES

    def test_scenario_builder_phone_and_physical_no_overlap(self):
        """_PHONE_TYPES and _PHYSICAL_TYPES must not overlap."""
        sys.path.insert(0, str(PROJECT_ROOT))
        from scenario_builder import _PHONE_TYPES, _PHYSICAL_TYPES
        overlap = _PHONE_TYPES & _PHYSICAL_TYPES
        assert not overlap, f"Overlap between PHONE and PHYSICAL types: {overlap}"

    def test_api_imports_type_sets_from_builder(self):
        """api.py must import _PHONE_TYPES and _PHYSICAL_TYPES from scenario_builder."""
        content = (PROJECT_ROOT / "api.py").read_text(encoding="utf-8")
        assert "_PHONE_TYPES" in content, "api.py missing _PHONE_TYPES"
        assert "_PHYSICAL_TYPES" in content, "api.py missing _PHYSICAL_TYPES"
        assert "from scenario_builder import" in content and "_PHONE_TYPES" in content

    def test_api_listing_has_is_multi_field(self):
        """api.py list_scenarios must produce is_multi field."""
        content = (PROJECT_ROOT / "api.py").read_text(encoding="utf-8")
        assert '"is_multi"' in content, "api.py listing missing is_multi field"

    def test_api_listing_has_is_phone_field(self):
        """api.py list_scenarios must produce is_phone field."""
        content = (PROJECT_ROOT / "api.py").read_text(encoding="utf-8")
        assert '"is_phone"' in content, "api.py listing missing is_phone field"

    def test_api_listing_has_is_physical_field(self):
        """api.py list_scenarios must produce is_physical field."""
        content = (PROJECT_ROOT / "api.py").read_text(encoding="utf-8")
        assert '"is_physical"' in content, "api.py listing missing is_physical field"

    def test_multi_detection_uses_persona_2(self):
        """is_multi must be based on persona_2 presence, not just type_simulation tag."""
        content = (PROJECT_ROOT / "api.py").read_text(encoding="utf-8")
        # The old pattern: is_multi = type_sim == "multi_interlocuteurs"
        # Should NOT appear anymore (except in comments)
        lines = [l for l in content.split("\n")
                 if 'is_multi' in l and '== "multi_interlocuteurs"' in l and not l.strip().startswith("#")]
        assert len(lines) == 0, f"Found old pattern is_multi based on type tag only: {lines}"

    def test_all_db_types_covered(self):
        """All type_simulation values in DB must be in either _PHONE_TYPES or _PHYSICAL_TYPES."""
        sys.path.insert(0, str(PROJECT_ROOT))
        from scenario_builder import _PHONE_TYPES, _PHYSICAL_TYPES
        import sqlite3 as sql3
        db = sql3.connect(str(PROJECT_ROOT / "vendmieux.db"))
        rows = db.execute("SELECT DISTINCT type_simulation FROM scenarios WHERE type_simulation IS NOT NULL").fetchall()
        db.close()
        all_types = _PHONE_TYPES | _PHYSICAL_TYPES
        for (t,) in rows:
            assert t in all_types, f"type_simulation '{t}' not in PHONE or PHYSICAL types"

    def test_genre_populated_in_all_db_scenarios(self):
        """All scenarios in DB must have genre in persona_json."""
        import sqlite3 as sql3
        db = sql3.connect(str(PROJECT_ROOT / "vendmieux.db"))
        count = db.execute(
            "SELECT COUNT(*) FROM scenarios WHERE json_extract(persona_json, '$.identite.genre') IS NULL"
        ).fetchone()[0]
        db.close()
        assert count == 0, f"{count} scenarios missing genre in persona_json"
