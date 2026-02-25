import React, { useState, useEffect, useRef } from 'react';
import { useColors } from '../../shared';
import SimTranscript from './SimTranscript';

const vizBarStyle = `
@keyframes sim-bar { 0%,100%{height:3px} 50%{height:28px} }
@keyframes sim-bar-rdv { 0%,100%{height:4px} 50%{height:32px} }
@keyframes sim-glow { 0%,100%{box-shadow:0 0 40px var(--sim-glow)} 50%{box-shadow:0 0 60px var(--sim-glow),0 0 90px rgba(212,133,74,0.08)} }
@keyframes sim-glow-rdv { 0%,100%{box-shadow:0 0 50px var(--sim-glow)} 50%{box-shadow:0 0 70px var(--sim-glow),0 0 100px rgba(212,133,74,0.1)} }
`;

function VizBars({ active, color, isRdv }) {
  const delays = [0, 0.12, 0.22, 0.08, 0.18, 0.28, 0.05];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: isRdv ? 4 : 3, height: isRdv ? 40 : 36, marginBottom: 20,
      width: isRdv ? '100%' : 'auto',
    }}>
      {delays.map((d, i) => (
        <div key={i} style={{
          width: isRdv ? 3 : 3.5,
          background: isRdv ? undefined : color,
          backgroundImage: isRdv ? `linear-gradient(to top, transparent, ${color})` : undefined,
          borderRadius: 2,
          height: active ? undefined : (isRdv ? 4 : 3),
          animation: active ? `${isRdv ? 'sim-bar-rdv' : 'sim-bar'} 0.75s ease-in-out infinite ${d}s` : 'none',
          transition: 'height 0.1s',
        }} />
      ))}
    </div>
  );
}

/* Phase indicator bar for RDV physique */
function PhaseIndicator({ elapsedSeconds, accentColor }) {
  const c = useColors();
  const phases = [
    { label: 'Accroche', color: c.wr, maxSec: 120 },
    { label: 'Découverte', color: c.bl, maxSec: 300 },
    { label: 'Proposition', color: c.ok, maxSec: Infinity },
  ];
  const activeIdx = elapsedSeconds < 120 ? 0 : elapsedSeconds < 300 ? 1 : 2;

  return (
    <div style={{ display: 'flex', gap: 2, width: '100%', marginBottom: 16, borderRadius: 6, overflow: 'hidden' }}>
      {phases.map((p, i) => (
        <div key={i} style={{
          flex: 1, position: 'relative', height: 6,
          background: i === activeIdx ? p.color : `${p.color}33`,
          transition: 'background 0.5s',
          borderRadius: i === 0 ? '6px 0 0 6px' : i === 2 ? '0 6px 6px 0' : 0,
        }}>
          <span style={{
            position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
            fontSize: 9, fontWeight: 600, letterSpacing: 0.3, whiteSpace: 'nowrap',
            color: i === activeIdx ? p.color : c.dm,
            transition: 'color 0.5s',
          }}>
            {p.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* Dynamic status badge for RDV physique */
function StatusBadge({ status, transcriptEntries, pendingSegments }) {
  const c = useColors();

  // Determine who is currently active
  let label = '● Écoute active';
  let color = c.ok;

  const pendingArr = Object.values(pendingSegments || {});
  const hasPendingAgent = pendingArr.some(s => s.who === 'agent');
  const hasPendingUser = pendingArr.some(s => s.who === 'user');

  if (status !== 'connected') {
    label = '● En attente';
    color = c.mt;
  } else if (hasPendingAgent) {
    label = '● Parle';
    color = c.ac;
  } else if (hasPendingUser) {
    label = '● Écoute active';
    color = c.ok;
  } else {
    // Check last transcript entry
    const lastEntry = transcriptEntries[transcriptEntries.length - 1];
    if (lastEntry && Date.now() - (lastEntry.time || 0) < 3000) {
      label = lastEntry.who === 'agent' ? '● Réfléchit...' : '● Écoute active';
      color = lastEntry.who === 'agent' ? c.wr : c.ok;
    }
  }

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 12px', borderRadius: 20,
      fontSize: 11, fontWeight: 600,
      background: `${color}18`, color,
      transition: 'all 0.3s',
    }}>
      {label}
    </div>
  );
}

export default function SimCall({ persona, status, statusMsg, timer, muted, transcriptEntries, pendingSegments, onStart, onMute, onStop, isRdvPhysique, scenario, elapsedSeconds }) {
  const c = useColors();
  const isIntro = status === 'intro';
  const isLive = status === 'connected' || status === 'ringing' || isIntro;
  const showGoBtn = status === 'idle' || status === 'error';
  const showControls = !showGoBtn && !isIntro;

  const statusClass = status === 'connected' ? 'ok' : status === 'error' ? 'err' : '';
  const statusColor = isIntro ? c.ac : statusClass === 'ok' ? c.ok : statusClass === 'err' ? c.dn : c.mt;

  // Determine active speaker for waveform label (RDV physique)
  const pendingArr = Object.values(pendingSegments || {});
  const hasPendingAgent = pendingArr.some(s => s.who === 'agent');
  const hasPendingUser = pendingArr.some(s => s.who === 'user');
  const speakerLabel = hasPendingUser ? 'Vous' : hasPendingAgent && persona ? `${persona.prenom} ${persona.nom}` : null;

  const entreprise = persona?.entreprise;

  // ===== RDV PHYSIQUE VARIANT =====
  if (isRdvPhysique) {
    return (
      <div style={{
        textAlign: 'center', maxWidth: 560, margin: '0 auto',
        position: 'relative',
      }}>
        <style>{vizBarStyle}</style>

        {/* Subtle radial gradient background */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: 'radial-gradient(ellipse at center, rgba(20,30,50,0.8) 0%, #080D1A 70%)',
        }} />

        {/* Header: Entretien en cours */}
        <div style={{ marginBottom: 8, position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            🏢 Entretien en cours
          </div>
          {entreprise && (
            <div style={{ color: c.mt, fontSize: 13, marginBottom: 6 }}>
              {entreprise.nom}{entreprise.siege ? ` · ${entreprise.siege}` : ''}{entreprise.ville ? ` · ${entreprise.ville}` : ''}
            </div>
          )}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
            color: c.mt, marginBottom: 16,
          }}>
            Durée de l'entretien : {timer}
          </div>
        </div>

        {/* Prospect card */}
        <div style={{
          width: 280, margin: '0 auto', padding: '24px 20px 20px',
          background: c.bgC, border: `1px solid ${c.bd}`, borderRadius: 18,
          position: 'relative', zIndex: 1,
        }}>
          {/* Phase indicator bar */}
          <PhaseIndicator elapsedSeconds={elapsedSeconds || 0} accentColor={c.ac} />

          {/* Avatar 72px */}
          <div style={{
            '--sim-glow': c.acD,
            width: 72, height: 72, borderRadius: '50%',
            background: c.bgE, border: `3px solid ${isLive ? c.ac : c.bd}`,
            display: 'grid', placeItems: 'center', margin: '8px auto 14px',
            fontSize: 30, transition: 'all 0.3s',
            boxShadow: isLive ? `0 0 50px ${c.acD}` : 'none',
            animation: isLive ? 'sim-glow-rdv 1.8s ease-in-out infinite' : 'none',
          }}>
            {isIntro ? '🏢' : '👤'}
          </div>

          {/* Nom + titre + entreprise */}
          {persona && (
            <>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 2, letterSpacing: -0.3 }}>
                {persona.prenom} {persona.nom}
              </div>
              <div style={{ color: c.mt, fontSize: 12, marginBottom: 4 }}>
                {persona.poste}
              </div>
              <div style={{ color: c.dm, fontSize: 11, marginBottom: 12 }}>
                {entreprise?.nom}
              </div>
            </>
          )}

          {/* Status badge */}
          <StatusBadge
            status={status}
            transcriptEntries={transcriptEntries}
            pendingSegments={pendingSegments}
          />

          {/* Waveform: 100% width, 3px bars, gradient */}
          <div style={{ marginTop: 16 }}>
            <VizBars active={status === 'connected'} color={c.ac} isRdv />
            {/* Speaker label */}
            {speakerLabel && status === 'connected' && (
              <div style={{ fontSize: 11, color: c.mt, marginTop: -14, marginBottom: 8 }}>
                {speakerLabel}
              </div>
            )}
          </div>

          {/* Status message */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
            color: statusColor, marginBottom: 16, minHeight: 16,
          }}>
            {isIntro ? 'Arrivée dans les locaux...' : statusMsg || 'Prêt pour l\'entretien'}
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
                🏢
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
                  {muted ? '🔇' : '🎙️'}
                </button>
                <button onClick={onStop} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  height: 46, padding: '0 20px', borderRadius: 23, border: 'none',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s', background: c.dn, color: '#fff',
                  boxShadow: `0 4px 20px ${c.dnD}`, fontFamily: 'inherit',
                }}>
                  🤝 Mettre fin à l'entretien
                </button>
              </>
            )}
          </div>
        </div>

        {/* Ambiance bureau indicator */}
        {isLive && (
          <div style={{
            position: 'fixed', bottom: 24, left: 24,
            display: 'flex', alignItems: 'center', gap: 6,
            opacity: 0.5, fontSize: 12, color: c.mt, zIndex: 2,
          }}>
            🔊 <span>Ambiance bureau</span>
          </div>
        )}

        {/* Transcript */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <SimTranscript entries={transcriptEntries} pending={pendingSegments} />
        </div>
      </div>
    );
  }

  // ===== TELEPHONIQUE VARIANT (unchanged) =====
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
