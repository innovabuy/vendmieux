/**
 * VisiteClient — Page component for immersive Visite Client simulation
 * Routes: /visite (splash) and /app/visite/:scenarioId (simulation)
 * Phase machine: splash → simulation → end
 */
import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SCENARIOS } from "../components/simulation/vc-scenarios";
import VCSplash from "../components/simulation/VCSplash";
import "../components/simulation/visite-client.css";

export default function VisiteClient() {
  const { scenarioId } = useParams();
  const navigate = useNavigate();

  // Phase machine: splash | simulation | end
  const [phase, setPhase] = useState(scenarioId ? "simulation" : "splash");
  const [scenario, setScenario] = useState(() =>
    scenarioId ? SCENARIOS.find(s => s.id === scenarioId) || null : null
  );

  const handleLaunch = useCallback((sc) => {
    setScenario(sc);
    setPhase("simulation");
    navigate(`/app/visite/${sc.id}`, { replace: true });
  }, [navigate]);

  // Splash phase
  if (phase === "splash") {
    return <VCSplash scenarios={SCENARIOS} onLaunch={handleLaunch} />;
  }

  // Simulation phase (placeholder — full implementation in Step 2+)
  if (phase === "simulation" && scenario) {
    return (
      <div className="vc-sim-placeholder">
        <div className="vc-sim-placeholder-inner">
          <h2>{scenario.title}</h2>
          <p>{scenario.roomLabel} · {scenario.participants.length} participant{scenario.participants.length > 1 ? "s" : ""}</p>
          <p style={{ marginTop: 16, color: "var(--amber)", fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Simulation en cours de développement — Step 2+
          </p>
        </div>
      </div>
    );
  }

  // Fallback: scenario not found from URL param
  return (
    <div className="vc-sim-placeholder">
      <div className="vc-sim-placeholder-inner">
        <h2>Scénario introuvable</h2>
        <p>Le scénario « {scenarioId} » n'existe pas.</p>
        <button className="vc-sp-btn" style={{ marginTop: 24 }} onClick={() => { setPhase("splash"); navigate("/visite", { replace: true }); }}>
          Retour à la sélection
        </button>
      </div>
    </div>
  );
}
