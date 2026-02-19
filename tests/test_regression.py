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

class TestMarketingCopy:
    """Verify marketing copy is consistent: 40+ scenarios (not 200+), 1 free simulation (not 3)."""

    def test_no_200_scenarios_in_react_assets(self, react_asset_contents):
        """200+ scénarios should NOT appear anywhere in React compiled assets."""
        for name, content in react_asset_contents.items():
            # Look for "200" near "scénario" text — but allow other numeric uses of 200
            assert "200+ scénarios" not in content, f"Found '200+ scénarios' in {name}"
            assert "200 scénarios" not in content, f"Found '200 scénarios' in {name}"

    def test_40_plus_scenarios_present(self, react_asset_contents):
        """40+ scénarios should appear in the main landing page assets."""
        all_content = "".join(react_asset_contents.values())
        assert "40+" in all_content, "Expected '40+' to appear in React assets"

    def test_no_3_simulations_gratuites(self, react_asset_contents):
        """'3 simulations gratuites' should NOT appear anywhere."""
        for name, content in react_asset_contents.items():
            assert "3 simulations gratuites" not in content, f"Found '3 simulations gratuites' in {name}"
            assert "3 séances offertes" not in content, f"Found '3 séances offertes' in {name}"

    def test_1_simulation_gratuite_present(self, react_asset_contents):
        """'1 simulation gratuite' should be used."""
        all_content = "".join(react_asset_contents.values())
        assert "1 simulation gratuite" in all_content, "Expected '1 simulation gratuite' in React assets"

    def test_index_html_meta_40_scenarios(self, index_html_content):
        """index.html meta description should reference 40+ scénarios."""
        assert "40+" in index_html_content, "Expected '40+' in index.html"
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

    def test_disc_feature_mentioned(self, react_asset_contents):
        """Product page should mention DISC profiling."""
        produit_files = [n for n in react_asset_contents if n.startswith("Produit")]
        assert len(produit_files) > 0, "No Produit asset file found"
        for name in produit_files:
            content = react_asset_contents[name]
            assert 'DISC' in content, f"Expected DISC mention in {name}"

    def test_posture_feature_mentioned(self, react_asset_contents):
        """Product page should mention posture analysis."""
        produit_files = [n for n in react_asset_contents if n.startswith("Produit")]
        for name in produit_files:
            content = react_asset_contents[name]
            assert 'posture' in content.lower() or 'Posture' in content, \
                f"Expected posture mention in {name}"


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
        except httpx.ConnectError:
            pytest.skip("VendMieux API not running")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "ok"
        assert data["service"] == "vendmieux-api"

    def test_default_scenario_accessible(self, http_client):
        """GET /api/scenarios/__default__ should work."""
        try:
            r = http_client.get("/api/scenarios/__default__")
        except httpx.ConnectError:
            pytest.skip("VendMieux API not running")
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
        except httpx.ConnectError:
            pytest.skip("VendMieux API not running")
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
        except httpx.ConnectError:
            pytest.skip("VendMieux API not running")
        # Should be blocked (401)
        assert r.status_code == 401, f"Expected 401 for anonymous custom scenario, got {r.status_code}: {r.text}"
        data = r.json()
        assert "Inscription requise" in data.get("detail", ""), \
            "Error should mention 'Inscription requise'"

    def test_scenarios_list_endpoint(self, http_client):
        """GET /api/scenarios should return scenarios data."""
        try:
            r = http_client.get("/api/scenarios")
        except httpx.ConnectError:
            pytest.skip("VendMieux API not running")
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
        except httpx.ConnectError:
            pytest.skip("VendMieux API not running")
        assert r.status_code == 200
        # demo.html has "FORCE 3D" in its title, not the React SPA
        assert "FORCE 3D" in r.text or "demo-app" in r.text, \
            "GET /dashboard should serve demo.html"

    def test_simulation_serves_demo_html(self, http_client):
        """GET /simulation should serve demo.html."""
        try:
            r = http_client.get("/simulation", follow_redirects=True)
        except httpx.ConnectError:
            pytest.skip("VendMieux API not running")
        assert r.status_code == 200
        assert "FORCE 3D" in r.text or "demo-app" in r.text, \
            "GET /simulation should serve demo.html"
