/**
 * VCSplash — Splash screen for Visite Client scenario selection
 * @param {Array} scenarios - Array of scenario objects from vc-scenarios.js
 * @param {function} onLaunch - Callback with selected scenario object
 */
import React, { useState } from "react";
import { FACE_PRESETS } from "./vc-faces";

export default function VCSplash({ scenarios, onLaunch }) {
  const [selected, setSelected] = useState(scenarios[0]?.id || null);

  const handleLaunch = () => {
    const sc = scenarios.find(s => s.id === selected);
    if (sc && onLaunch) onLaunch(sc);
  };

  return (
    <div className="vc-splash">
      <div className="vc-sp-eyebrow">VendMieux · Simulation Visite Client</div>
      <div className="vc-sp-title">Entrez dans <em>la salle</em></div>
      <div className="vc-sp-subtitle">Choisissez votre scénario</div>
      <div className="vc-sp-rule" />

      <div className="vc-sp-grid">
        {scenarios.map(s => (
          <div
            key={s.id}
            className={`vc-sp-card${selected === s.id ? " vc-sel" : ""}`}
            onClick={() => setSelected(s.id)}
          >
            <span className={`vc-sc-type-badge ${s.mode}`}>
              {s.mode === "solo" ? "Solo" : "Multi"}
            </span>
            <div className="vc-sc-title">{s.title}</div>
            <div className="vc-sc-sub">{s.sub}</div>
            <div className="vc-sc-people">
              {s.participants.map(p => {
                const pre = FACE_PRESETS[p.preset] || {};
                return (
                  <div className="vc-sc-person" key={p.id}>
                    <div
                      className="vc-sc-avatar"
                      style={{ background: pre.suit || "#1A1C2A", color: p.color }}
                    >
                      {p.id.toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <span className="vc-sc-pname">{p.name}</span>{" "}
                      <span className="vc-sc-prole">
                        {p.role}
                        {p.arrivalDelay ? (
                          <span className="vc-sc-plater"> · arrive en cours</span>
                        ) : null}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button className="vc-sp-btn" onClick={handleLaunch}>
        Commencer la simulation →
      </button>
    </div>
  );
}
