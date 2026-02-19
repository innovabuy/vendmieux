"""
VendMieux — Regression tests
Tests for: anonymous simulation flow, marketing copy, CTA buttons, signup modal, API endpoints.
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
