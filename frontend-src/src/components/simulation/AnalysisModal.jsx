import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useColors } from '../../shared';
import confetti from 'canvas-confetti';

// ─── FORCE 3D Analysis Steps ────────────────────────────────────────
const ANALYSIS_STEPS = [
  { label: "Lecture du transcript",              icon: "\u{1F4DD}", bar: "Transcript" },
  { label: "Analyse de l'accroche FORCE 3D",    icon: "\u26A1",     bar: "Accroche" },
  { label: "Évaluation de la découverte",       icon: "\u{1F3AF}", bar: "Découverte" },
  { label: "Traitement des objections",          icon: "\u{1F6E1}\uFE0F", bar: "Objections" },
  { label: "Mesure de l'engagement prospect",    icon: "\u{1F4CA}", bar: "Engagement" },
  { label: "Évaluation de la fermeture",         icon: "\u{1F511}", bar: "Closing" },
  { label: "Profilage DISC du prospect",         icon: "\u{1F9E0}", bar: "DISC" },
];

export { ANALYSIS_STEPS };

// ─── Animated counter 0 → target ────────────────────────────────────
function AnimatedCounter({ target, duration = 1500 }) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    startRef.current = performance.now();
    function tick(now) {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return <>{value.toFixed(1)}</>;
}

// ─── Score tier logic ───────────────────────────────────────────────
function getScoreTier(score) {
  if (score > 14) return {
    emoji: "\u{1F3C6}", label: "Excellent !", color: "#f59e0b",
    sound: "/sounds/success-fanfare.mp3", confetti: true,
  };
  if (score >= 10) return {
    emoji: "\u2705", label: "Bon travail !", color: "#22c55e",
    sound: "/sounds/success-chime.mp3", confetti: false,
  };
  return {
    emoji: "\u{1F4AA}", label: "Continuez !", color: "#6366f1",
    sound: null, confetti: false,
  };
}

// ─── Main Component ─────────────────────────────────────────────────
export default function AnalysisModal({
  phase,          // 'analyzing' | 'revealing'
  currentStep,    // 0-6 for analyzing phase
  progress,       // 0-100 global bar
  score,          // final score (number) for revealing phase
  evalId,         // evaluation ID for debrief link
  onViewDebrief,  // callback for debrief button
}) {
  const c = useColors();
  const soundRef = useRef(null);
  const confettiDone = useRef(false);

  // Bar fill percentages (steps 0-6 fill sequentially)
  const barFills = useMemo(() => {
    return ANALYSIS_STEPS.map((_, i) => {
      if (i < currentStep) return 100;
      if (i === currentStep) return phase === 'revealing' ? 100 : Math.min(90, (progress / 100) * 90 + 10);
      return 0;
    });
  }, [currentStep, progress, phase]);

  // Score reveal effects
  useEffect(() => {
    if (phase !== 'revealing' || !score) return;
    const tier = getScoreTier(score);

    // Play sound
    if (tier.sound) {
      try {
        soundRef.current = new Audio(tier.sound);
        soundRef.current.volume = 0.5;
        soundRef.current.play().catch(() => {});
      } catch (_) {}
    }

    // Confetti burst
    if (tier.confetti && !confettiDone.current) {
      confettiDone.current = true;
      const duration = 2000;
      const end = Date.now() + duration;
      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#f59e0b', '#eab308', '#fbbf24'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#f59e0b', '#eab308', '#fbbf24'],
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.pause();
        soundRef.current = null;
      }
    };
  }, [phase, score]);

  // Reset confetti flag when phase changes
  useEffect(() => {
    if (phase === 'analyzing') confettiDone.current = false;
  }, [phase]);

  const tier = score ? getScoreTier(score) : null;
  const step = ANALYSIS_STEPS[Math.min(currentStep, ANALYSIS_STEPS.length - 1)];
  const pct = phase === 'revealing' ? 100 : Math.min(progress, 99);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: c.bgC,
        border: `1px solid ${c.ac}33`,
        borderRadius: 20,
        padding: '36px 32px 28px',
        maxWidth: 500, width: '92%',
        boxShadow: `0 0 60px ${c.ac}15, 0 24px 64px rgba(0,0,0,0.5)`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Top glow */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 200, height: 3,
          background: `linear-gradient(90deg, transparent, ${phase === 'revealing' && tier ? tier.color : c.ac}, transparent)`,
          borderRadius: 2,
        }} />

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            animation: 'analysisLogoFloat 2.5s ease-in-out infinite',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${c.ac}, ${c.acL})`,
              display: 'grid', placeItems: 'center',
              fontWeight: 800, fontSize: 13, color: '#fff',
            }}>VM</div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.5 }}>
              Vend<span style={{ color: c.ac }}>Mieux</span>
            </div>
          </div>
        </div>

        {/* ═══ ANALYZING PHASE ═══ */}
        {phase === 'analyzing' && (
          <>
            {/* Current step icon + label */}
            <div style={{
              textAlign: 'center', padding: '4px 0 16px',
              animation: 'analysisFadeIn 0.35s ease',
            }} key={currentStep}>
              <div style={{
                fontSize: 38, marginBottom: 8,
                animation: 'analysisIconIn 0.4s ease',
              }}>{step.icon}</div>
              <div style={{
                fontSize: 14, fontWeight: 600, color: c.tx,
              }}>{step.label}...</div>
            </div>

            {/* 6 mini bars (FORCE 3D axes) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
              {ANALYSIS_STEPS.slice(1).map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 600, color: i + 1 <= currentStep ? c.ac : c.dm,
                    minWidth: 72, textAlign: 'right',
                    transition: 'color 0.3s',
                  }}>{s.bar}</div>
                  <div style={{
                    flex: 1, height: 6, borderRadius: 3,
                    background: c.bgE, overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${barFills[i + 1]}%`,
                      height: '100%', borderRadius: 3,
                      background: barFills[i + 1] >= 100
                        ? c.ok
                        : `linear-gradient(90deg, ${c.ac}, ${c.acL})`,
                      transition: 'width 0.8s ease, background 0.3s',
                      boxShadow: barFills[i + 1] > 0 ? `0 0 6px ${c.ac}40` : 'none',
                    }} />
                  </div>
                  {barFills[i + 1] >= 100 && (
                    <span style={{ fontSize: 11, color: c.ok, animation: 'analysisFadeIn 0.3s ease' }}>{'\u2713'}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Global progress bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
            }}>
              <div style={{
                flex: 1, height: 8, borderRadius: 4,
                background: c.bgE, overflow: 'hidden', position: 'relative',
              }}>
                <div style={{
                  width: `${pct}%`,
                  height: '100%', borderRadius: 4,
                  background: `linear-gradient(90deg, ${c.ac}, ${c.ok})`,
                  transition: 'width 0.6s ease',
                  animation: 'analysisGlow 1.5s ease-in-out infinite',
                }} />
              </div>
              <div style={{
                fontSize: 13, fontWeight: 700, color: c.ac,
                minWidth: 38, textAlign: 'right',
              }}>{pct}%</div>
            </div>

            {/* Footer */}
            <div style={{
              textAlign: 'center', fontSize: 11, color: c.dm,
              lineHeight: 1.5, borderTop: `1px solid ${c.bd}`, paddingTop: 14,
            }}>
              Claude analyse votre performance commerciale<br />
              selon les 5 axes de la méthode FORCE 3D®
            </div>
          </>
        )}

        {/* ═══ REVEALING PHASE ═══ */}
        {phase === 'revealing' && tier && (
          <div style={{ textAlign: 'center', animation: 'analysisRevealIn 0.5s ease' }}>
            {/* Emoji */}
            <div style={{
              fontSize: 56, marginBottom: 8,
              animation: 'analysisScorePop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}>{tier.emoji}</div>

            {/* Label */}
            <div style={{
              fontSize: 18, fontWeight: 700, color: tier.color,
              marginBottom: 16,
            }}>{tier.label}</div>

            {/* Score circle */}
            <div style={{
              display: 'inline-flex', alignItems: 'baseline', gap: 4,
              marginBottom: 20,
            }}>
              <div style={{
                fontSize: 56, fontWeight: 800, color: tier.color,
                lineHeight: 1,
                textShadow: `0 0 30px ${tier.color}40`,
              }}>
                <AnimatedCounter target={score} duration={1500} />
              </div>
              <div style={{
                fontSize: 22, fontWeight: 600, color: c.dm,
              }}>/20</div>
            </div>

            {/* Mini recap bars (all filled) */}
            <div style={{
              display: 'flex', gap: 4, justifyContent: 'center',
              marginBottom: 24,
            }}>
              {ANALYSIS_STEPS.slice(1).map((s, i) => (
                <div key={i} style={{
                  width: 36, height: 4, borderRadius: 2,
                  background: c.ok,
                  animation: `analysisFadeIn 0.3s ease ${i * 0.08}s both`,
                }} title={s.bar} />
              ))}
            </div>

            {/* CTA button */}
            {(evalId || onViewDebrief) && (
              <button onClick={onViewDebrief} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', borderRadius: 10,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                background: `linear-gradient(135deg, ${c.ac}, ${c.acL})`,
                color: '#fff', border: 'none', fontFamily: 'inherit',
                boxShadow: `0 4px 20px ${c.acD}`,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}>
                Voir mon analyse complète →
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes analysisLogoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes analysisFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes analysisIconIn {
          from { opacity: 0; transform: translateY(10px) scale(0.85); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes analysisGlow {
          0%, 100% { box-shadow: 0 0 8px ${c.ac}40; }
          50% { box-shadow: 0 0 18px ${c.ac}70; }
        }
        @keyframes analysisRevealIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes analysisScorePop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
