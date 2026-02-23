import React from 'react';
import { useColors } from '../../shared';
import SimTranscript from './SimTranscript';

const vizBarStyle = `
@keyframes sim-bar { 0%,100%{height:3px} 50%{height:28px} }
@keyframes sim-glow { 0%,100%{box-shadow:0 0 40px var(--sim-glow)} 50%{box-shadow:0 0 60px var(--sim-glow),0 0 90px rgba(212,133,74,0.08)} }
`;

function VizBars({ active, color }) {
  const delays = [0, 0.12, 0.22, 0.08, 0.18, 0.28, 0.05];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, height: 36, marginBottom: 20 }}>
      {delays.map((d, i) => (
        <div key={i} style={{
          width: 3.5, background: color, borderRadius: 2,
          height: active ? undefined : 3,
          animation: active ? `sim-bar 0.75s ease-in-out infinite ${d}s` : 'none',
          transition: 'height 0.1s',
        }} />
      ))}
    </div>
  );
}

export default function SimCall({ persona, status, statusMsg, timer, muted, transcriptEntries, pendingSegments, onStart, onMute, onStop, isRdvPhysique }) {
  const c = useColors();
  const isIntro = status === 'intro';
  const isLive = status === 'connected' || status === 'ringing' || isIntro;
  const showGoBtn = status === 'idle' || status === 'error';
  const showControls = !showGoBtn && !isIntro;

  const statusClass = status === 'connected' ? 'ok' : status === 'error' ? 'err' : '';
  const statusColor = isIntro ? c.ac : statusClass === 'ok' ? c.ok : statusClass === 'err' ? c.dn : c.mt;

  return (
    <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
      <style>{vizBarStyle}</style>

      {/* Avatar */}
      <div style={{
        '--sim-glow': c.acD,
        width: 110, height: 110, borderRadius: '50%',
        background: c.bgC, border: `3px solid ${isLive ? c.ac : c.bd}`,
        display: 'grid', placeItems: 'center', margin: '0 auto 22px',
        fontSize: 44, transition: 'all 0.3s',
        boxShadow: isLive ? `0 0 40px ${c.acD}` : 'none',
        animation: isLive ? 'sim-glow 1.8s ease-in-out infinite' : 'none',
      }}>
        {isIntro ? '\u{1F3E2}' : '\u{1F464}'}
      </div>

      {/* Name & role */}
      {persona && (
        <>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 3, letterSpacing: -0.3 }}>
            {persona.prenom} {persona.nom}
          </div>
          <div style={{ color: c.mt, fontSize: 13, marginBottom: 28 }}>
            {persona.poste} — {persona.entreprise.nom}
          </div>
        </>
      )}

      {/* Visualizer */}
      <VizBars active={status === 'connected'} color={c.ac} />

      {/* Status */}
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
        color: statusColor, marginBottom: 20, minHeight: 18,
      }}>
        {statusMsg || 'Prêt à appeler'}
      </div>

      {/* Timer */}
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 32, fontWeight: 300,
        color: c.tx, marginBottom: 28, letterSpacing: 3,
      }}>
        {timer}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
        {showGoBtn && (
          <button onClick={onStart} style={{
            width: 58, height: 58, borderRadius: '50%', border: 'none',
            display: 'grid', placeItems: 'center', fontSize: 22, cursor: 'pointer',
            transition: 'all 0.15s', background: c.ok, color: '#fff',
            boxShadow: `0 4px 20px ${c.okD}`,
          }}>
            📞
          </button>
        )}
        {showControls && (
          <>
            <button onClick={onMute} style={{
              width: 58, height: 58, borderRadius: '50%', border: muted ? 'none' : `1px solid ${c.bd}`,
              display: 'grid', placeItems: 'center', fontSize: 22, cursor: 'pointer',
              transition: 'all 0.15s',
              background: muted ? c.dn : c.bgC, color: muted ? '#fff' : c.tx,
            }}>
              {muted ? '\u{1F507}' : '\u{1F399}\u{FE0F}'}
            </button>
            <button onClick={onStop} style={{
              width: 58, height: 58, borderRadius: '50%', border: 'none',
              display: 'grid', placeItems: 'center', fontSize: 22, cursor: 'pointer',
              transition: 'all 0.15s', background: c.dn, color: '#fff',
              boxShadow: `0 4px 20px ${c.dnD}`,
            }}>
              ✕
            </button>
          </>
        )}
      </div>

      {/* Transcript */}
      <SimTranscript entries={transcriptEntries} pending={pendingSegments} />
    </div>
  );
}
