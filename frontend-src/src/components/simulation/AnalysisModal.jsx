import React, { useEffect, useRef } from 'react';
import { useColors } from '../../shared';

const STEPS = [
  { pct: 8,  label: "Lecture du transcript...",                icon: "\u{1F4DD}" },
  { pct: 18, label: "Identification des moments cl\u00e9s...", icon: "\u{1F50D}" },
  { pct: 32, label: "Analyse de l'accroche FORCE 3D...",       icon: "\u26A1"     },
  { pct: 45, label: "\u00c9valuation de la d\u00e9couverte...",icon: "\u{1F3AF}" },
  { pct: 57, label: "Analyse du traitement des objections...", icon: "\u{1F6E1}\uFE0F" },
  { pct: 68, label: "Mesure de l'engagement prospect...",      icon: "\u{1F4CA}" },
  { pct: 78, label: "\u00c9valuation de la fermeture...",      icon: "\u{1F511}" },
  { pct: 87, label: "Profilage DISC du prospect...",           icon: "\u{1F9E0}" },
  { pct: 94, label: "G\u00e9n\u00e9ration des recommandations...", icon: "\u{1F4A1}" },
  { pct: 99, label: "Finalisation du rapport...",              icon: "\u2728"     },
];

export { STEPS as ANALYSIS_STEPS };

export default function AnalysisModal({ progress, currentStep, done }) {
  const c = useColors();
  const prevStepRef = useRef(-1);

  // Track previous step for completed list
  useEffect(() => {
    prevStepRef.current = currentStep;
  }, [currentStep]);

  const step = STEPS[Math.min(currentStep, STEPS.length - 1)];
  const pct = done ? 100 : Math.min(progress, 99);
  const completedSteps = STEPS.slice(0, currentStep);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: c.bgC,
        border: `1px solid ${c.ac}33`,
        borderRadius: 20,
        padding: '36px 32px 28px',
        maxWidth: 480, width: '92%',
        boxShadow: `0 0 60px ${c.ac}15, 0 24px 64px rgba(0,0,0,0.5)`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Top glow accent */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 200, height: 3,
          background: `linear-gradient(90deg, transparent, ${c.ac}, transparent)`,
          borderRadius: 2,
        }} />

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            animation: 'analysisLogoFloat 2.5s ease-in-out infinite',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: `linear-gradient(135deg, ${c.ac}, ${c.acL})`,
              display: 'grid', placeItems: 'center',
              fontWeight: 800, fontSize: 14, color: '#fff',
              boxShadow: `0 2px 12px ${c.acD}`,
            }}>VM</div>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.5 }}>
              Vend<span style={{ color: c.ac }}>Mieux</span>
            </div>
          </div>
        </div>

        {/* Completed steps (small, grayed) */}
        {completedSteps.length > 0 && (
          <div style={{ marginBottom: 16, maxHeight: 120, overflowY: 'auto' }}>
            {completedSteps.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 12, color: c.dm, padding: '3px 0',
                opacity: 0.6,
              }}>
                <span style={{ color: c.ok, fontSize: 11 }}>{'\u2713'}</span>
                <span>{s.label.replace('...', '')}</span>
              </div>
            ))}
          </div>
        )}

        {/* Current step */}
        {!done ? (
          <div style={{
            textAlign: 'center', padding: '8px 0 20px',
            animation: 'analysisFadeIn 0.3s ease',
          }} key={currentStep}>
            <div style={{
              fontSize: 42, marginBottom: 10,
              animation: 'analysisIconIn 0.4s ease',
            }}>{step.icon}</div>
            <div style={{
              fontSize: 15, fontWeight: 600, color: c.tx,
              animation: 'analysisFadeIn 0.3s ease',
            }}>{step.label}</div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: '8px 0 20px',
            animation: 'analysisFadeIn 0.3s ease',
          }}>
            <div style={{ fontSize: 42, marginBottom: 10 }}>{'\u2705'}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: c.ok }}>
              Analyse compl\u00e8te !
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 20,
        }}>
          <div style={{
            flex: 1, height: 8, borderRadius: 4,
            background: c.bgE,
            overflow: 'hidden', position: 'relative',
          }}>
            <div style={{
              width: `${pct}%`,
              height: '100%', borderRadius: 4,
              background: done
                ? c.ok
                : `linear-gradient(90deg, ${c.ac}, ${c.ok})`,
              transition: 'width 0.6s ease',
              boxShadow: done
                ? `0 0 12px ${c.ok}60`
                : `0 0 12px ${c.ac}50`,
              animation: done ? 'none' : 'analysisGlow 1.5s ease-in-out infinite',
            }} />
          </div>
          <div style={{
            fontSize: 13, fontWeight: 700, color: c.ac,
            minWidth: 38, textAlign: 'right',
          }}>{pct}%</div>
        </div>

        {/* Footer text */}
        <div style={{
          textAlign: 'center', fontSize: 12, color: c.dm,
          lineHeight: 1.5, borderTop: `1px solid ${c.bd}`,
          paddingTop: 16,
        }}>
          Claude analyse votre performance commerciale<br />
          selon les 5 axes de la m\u00e9thode FORCE 3D\u00ae
        </div>
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
      `}</style>
    </div>
  );
}
