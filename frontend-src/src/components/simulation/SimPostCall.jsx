import React from 'react';
import { useColors } from '../../shared';

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

export default function SimPostCall({ persona, duration, transcriptEntries, evalLoading, evalError, children }) {
  const c = useColors();

  let exchanges = 0, lastWho = null;
  for (const e of transcriptEntries) {
    if (e.who !== lastWho) { exchanges++; lastWho = e.who; }
  }
  const totalWords = transcriptEntries.reduce((acc, e) => acc + e.text.split(/\s+/).filter(w => w).length, 0);

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Appel terminé</div>
        {persona && (
          <div style={{ color: c.mt, fontSize: 14 }}>
            {persona.prenom} {persona.nom} — {persona.poste}, {persona.entreprise.nom}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="sim-post-stats" style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 28 }}>
        {[
          { value: formatTime(duration), label: 'Durée' },
          { value: exchanges, label: 'Échanges' },
          { value: totalWords, label: 'Mots' },
        ].map((s, i) => (
          <div key={i} style={{
            background: c.bgC, border: `1px solid ${c.bd}`, borderRadius: 10,
            padding: '16px 24px', textAlign: 'center', minWidth: 120,
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: c.dm, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Evaluation loading / error / results */}
      {evalLoading && (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: c.mt }}>
          <div style={{
            display: 'inline-block', width: 36, height: 36,
            border: `3px solid ${c.bd}`, borderTopColor: c.ac,
            borderRadius: '50%', animation: 'spin 0.6s linear infinite', marginBottom: 16,
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Évaluation FORCE 3D en cours...</div>
          <div style={{ fontSize: 12, color: c.dm }}>Claude analyse votre performance commerciale</div>
        </div>
      )}

      {evalError && (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: c.dn }}>
          Erreur évaluation : {evalError}
        </div>
      )}

      {/* Evaluation results injected as children */}
      {children}
    </div>
  );
}
