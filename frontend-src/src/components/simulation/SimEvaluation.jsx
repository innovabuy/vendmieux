import React, { useState } from 'react';
import { useColors } from '../../shared';
import { useAuth } from '../../auth';
import { COMP_KEYS, COMP_LABELS, RESULT_LABELS, DISC_LABELS } from './constants';
import SimRadarChart from './SimRadarChart';

function EvalBar({ score }) {
  const pct = (score / 20 * 100).toFixed(0);
  const c = useColors();
  const barColor = score >= 14 ? c.ok : score >= 8 ? c.wr : c.dn;
  return (
    <div style={{ height: 6, background: c.bgE, borderRadius: 3, marginBottom: 12, overflow: 'hidden' }}>
      <div style={{ height: '100%', borderRadius: 3, width: pct + '%', background: barColor, transition: 'width 0.6s ease' }} />
    </div>
  );
}

function ProgresItem({ p }) {
  const c = useColors();
  if (typeof p === 'string') return <div style={{ marginBottom: 3 }}>- {p}</div>;
  return (
    <div style={{ marginBottom: 10, padding: 10, background: c.bgE, borderRadius: 6, border: `1px solid ${c.bd}` }}>
      <div style={{ fontSize: 12, lineHeight: 1.5, color: c.dn, marginBottom: 6 }}>❌ Ce que vous avez dit : "{p.ce_que_vous_avez_dit || ''}"</div>
      <div style={{ fontSize: 12, lineHeight: 1.5, color: c.ok, marginBottom: 4 }}>✅ Version améliorée : "{p.ce_qui_aurait_ete_mieux || ''}"</div>
      {p.pourquoi && <div style={{ fontSize: 11, lineHeight: 1.4, color: c.dm, fontStyle: 'italic' }}>💡 {p.pourquoi}</div>}
    </div>
  );
}

function CompetenceCard({ compKey, comp }) {
  const c = useColors();
  const label = COMP_LABELS[compKey];
  const score = comp.score || 0;
  const scoreCol = score >= 14 ? c.ok : score >= 8 ? c.wr : c.dn;

  return (
    <div style={{ background: c.bgC, border: `1px solid ${c.bd}`, borderRadius: 10, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: c.dm }}>{label}</div>
        <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: scoreCol }}>{score}/20</div>
      </div>
      <EvalBar score={score} />
      {(comp.points_forts || []).length > 0 && (
        <div style={{ fontSize: 12, lineHeight: 1.55, marginBottom: 8 }}>
          <div style={{ fontWeight: 700, color: c.dm, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>Points forts</div>
          <div style={{ color: c.ok }}>{(comp.points_forts || []).map((p, i) => <div key={i}>+ {p}</div>)}</div>
        </div>
      )}
      {(comp.points_progres || []).length > 0 && (
        <div style={{ fontSize: 12, lineHeight: 1.55, marginBottom: 8 }}>
          <div style={{ fontWeight: 700, color: c.dm, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>Points de progrès</div>
          {(comp.points_progres || []).map((p, i) => <ProgresItem key={i} p={p} />)}
        </div>
      )}
      {comp.conseil && (
        <div style={{ fontStyle: 'italic', color: c.acL, fontSize: 12, marginTop: 6, paddingTop: 6, borderTop: `1px solid ${c.bd}` }}>{comp.conseil}</div>
      )}
    </div>
  );
}

function PostureSection({ pc }) {
  const c = useColors();
  if (!pc) return null;

  const renderBar = (score) => {
    const col = score >= 14 ? c.ok : score >= 8 ? c.wr : c.dn;
    return { col };
  };

  const ton = pc.ton_general || {};
  const ass = pc.assurance || {};
  const form = pc.formulation || {};
  const sp = pc.score_posture || 0;
  const spCol = renderBar(sp).col;

  const renderAmeliorer = (items, fields) => (items || []).map((m, i) => (
    <div key={i} style={{ marginBottom: 10, padding: 10, background: c.bgE, borderRadius: 6, border: `1px solid ${c.bd}` }}>
      <div style={{ fontSize: 12, color: c.dn, marginBottom: 6 }}>❌ "{m[fields.said] || ''}"</div>
      <div style={{ fontSize: 12, color: c.dm, fontStyle: 'italic', marginBottom: 4 }}>💡 {m[fields.why] || ''}</div>
      <div style={{ fontSize: 12, color: c.ok }}>✅ "{m[fields.better] || ''}"</div>
      {m[fields.tip] && <div style={{ fontSize: 11, color: c.acL, fontStyle: 'italic', marginTop: 4 }}>{m[fields.tip]}</div>}
    </div>
  ));

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
        🎤 Votre posture commerciale
      </div>
      <div style={{ background: c.bgC, border: `1px solid ${c.bd}`, borderRadius: 10, padding: 18, textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: spCol }}>
          {sp}<span style={{ fontSize: 14, color: c.dm, fontWeight: 400 }}>/20</span>
        </div>
        <EvalBar score={sp} />
        <div style={{ fontSize: 11, color: c.dm, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600, marginTop: 4 }}>Score posture globale</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14, marginBottom: 16 }}>
        {/* Ton */}
        <div style={{ background: c.bgC, border: `1px solid ${c.bd}`, borderRadius: 10, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: c.dm }}>🎤 Ton</div>
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: renderBar(ton.note || 0).col }}>{ton.note || 0}/20</div>
          </div>
          <EvalBar score={ton.note || 0} />
          {ton.description && <div style={{ fontSize: 13, color: c.mt, marginBottom: 10, fontStyle: 'italic' }}>{ton.description}</div>}
          {(ton.moments_positifs || []).length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 700, color: c.dm, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>Moments positifs</div>
              {(ton.moments_positifs || []).map((p, i) => <div key={i} style={{ fontSize: 12, color: c.ok, marginBottom: 3 }}>✅ {p}</div>)}
            </div>
          )}
          {(ton.moments_a_ameliorer || []).length > 0 && (
            <div>
              <div style={{ fontWeight: 700, color: c.dm, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>À améliorer</div>
              {renderAmeliorer(ton.moments_a_ameliorer, { said: 'ce_que_vous_avez_dit', why: 'probleme', better: 'version_amelioree', tip: 'conseil' })}
            </div>
          )}
        </div>
        {/* Assurance */}
        <div style={{ background: c.bgC, border: `1px solid ${c.bd}`, borderRadius: 10, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: c.dm }}>💪 Assurance</div>
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: renderBar(ass.note || 0).col }}>{ass.note || 0}/20</div>
          </div>
          <EvalBar score={ass.note || 0} />
          {ass.description && <div style={{ fontSize: 13, color: c.mt, marginBottom: 10, fontStyle: 'italic' }}>{ass.description}</div>}
          {(ass.marqueurs_confiance || []).length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 700, color: c.dm, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>Marqueurs de confiance</div>
              {(ass.marqueurs_confiance || []).map((p, i) => <div key={i} style={{ fontSize: 12, color: c.ok, marginBottom: 3 }}>✅ {p}</div>)}
            </div>
          )}
          {(ass.marqueurs_hesitation || []).length > 0 && (
            <div>
              <div style={{ fontWeight: 700, color: c.dm, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>Marqueurs d'hésitation</div>
              {renderAmeliorer(ass.marqueurs_hesitation, { said: 'verbatim', why: 'indice', better: 'reformulation', tip: null })}
            </div>
          )}
        </div>
        {/* Formulation */}
        <div style={{ background: c.bgC, border: `1px solid ${c.bd}`, borderRadius: 10, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: c.dm }}>✏️ Formulation</div>
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: renderBar(form.note || 0).col }}>{form.note || 0}/20</div>
          </div>
          <EvalBar score={form.note || 0} />
          {form.description && <div style={{ fontSize: 13, color: c.mt, marginBottom: 10, fontStyle: 'italic' }}>{form.description}</div>}
          {(form.points_forts || []).length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 700, color: c.dm, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>Points forts</div>
              {(form.points_forts || []).map((p, i) => <div key={i} style={{ fontSize: 12, color: c.ok, marginBottom: 3 }}>✅ {p}</div>)}
            </div>
          )}
          {(form.points_a_ameliorer || []).length > 0 && (
            <div>
              <div style={{ fontWeight: 700, color: c.dm, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>À améliorer</div>
              {renderAmeliorer(form.points_a_ameliorer, { said: 'ce_que_vous_avez_dit', why: 'probleme', better: 'version_amelioree', tip: 'principe' })}
            </div>
          )}
        </div>
      </div>
      {pc.conseil_posture && (
        <div style={{ background: c.acD, border: `1px solid ${c.ac}33`, borderRadius: 10, padding: '14px 18px', marginTop: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: c.ac, marginBottom: 4 }}>Conseil posture</div>
          <div style={{ fontSize: 13, color: c.tx, fontWeight: 500 }}>{pc.conseil_posture}</div>
        </div>
      )}
    </div>
  );
}

function DiscSection({ disc }) {
  const c = useColors();
  if (!disc) return null;

  const profil = disc.profil_prospect || {};
  const adapt = disc.adaptation_commerciale || {};
  const principal = (profil.type_principal || '').toUpperCase();
  const secondaire = profil.type_secondaire ? profil.type_secondaire.toUpperCase() : null;
  const adaptScore = adapt.score_adaptation || 0;
  const adaptCol = adaptScore >= 14 ? c.ok : adaptScore >= 8 ? c.wr : c.dn;

  const DISC_COLORS = { D: '#ef4444', I: '#eab308', S: '#22c55e', C: '#3b82f6' };

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
        🧠 Profil DISC de votre interlocuteur
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
        {['D', 'I', 'S', 'C'].map(l => {
          const isActive = l === principal;
          const isSec = l === secondaire;
          const color = DISC_COLORS[l];
          return (
            <div key={l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                display: 'grid', placeItems: 'center', fontSize: 28, fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace", transition: 'all 0.3s',
                border: `2px solid ${(isActive || isSec) ? color : c.bd}`,
                color: (isActive || isSec) ? color : c.dm,
                background: (isActive || isSec) ? `${color}14` : c.bgC,
                opacity: isActive ? 1 : isSec ? 0.75 : 0.35,
                transform: isActive ? 'scale(1.1)' : 'none',
                boxShadow: isActive ? `0 4px 20px ${color}4D` : 'none',
              }}>{l}</div>
              <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4, textAlign: 'center', color: (isActive || isSec) ? color : c.dm }}>
                {DISC_LABELS[l]}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ background: c.bgC, border: `1px solid ${c.bd}`, borderRadius: 10, padding: 18, marginBottom: 14 }}>
        {profil.description && <div style={{ fontSize: 14, lineHeight: 1.6, color: c.mt, marginBottom: 12 }}>{profil.description}</div>}
        {(profil.indices_detectes || []).length > 0 && (
          <div>
            <div style={{ fontWeight: 700, color: c.dm, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>Indices détectés</div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {(profil.indices_detectes || []).map((ind, i) => (
                <li key={i} style={{ fontSize: 12, color: c.mt, padding: '4px 0', borderBottom: `1px solid ${c.bd}33` }}>🔍 {ind}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div style={{ background: c.bgC, border: `1px solid ${c.bd}`, borderRadius: 10, padding: 18, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Votre adaptation à ce profil</div>
          <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: adaptCol }}>{adaptScore}/20</div>
        </div>
        <EvalBar score={adaptScore} />
        {(adapt.ce_qui_a_marche || []).length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 700, color: c.ok, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>Ce qui a marché</div>
            {(adapt.ce_qui_a_marche || []).map((m, i) => (
              <div key={i} style={{ fontSize: 12, padding: '8px 10px', marginBottom: 6, background: `${c.ok}0F`, borderRadius: 6, borderLeft: `3px solid ${c.ok}` }}>
                <div style={{ color: c.ok, fontWeight: 600, marginBottom: 2 }}>"{m.verbatim || ''}"</div>
                <div style={{ color: c.mt, fontStyle: 'italic' }}>{m.pourquoi_adapte || ''}</div>
              </div>
            ))}
          </div>
        )}
        {(adapt.ce_qui_na_pas_marche || []).length > 0 && (
          <div>
            <div style={{ fontWeight: 700, color: c.wr, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>Ce qui n'a pas marché</div>
            {(adapt.ce_qui_na_pas_marche || []).map((m, i) => (
              <div key={i} style={{ marginBottom: 10, padding: 10, background: c.bgE, borderRadius: 6, border: `1px solid ${c.bd}` }}>
                <div style={{ fontSize: 12, color: c.dn, marginBottom: 6 }}>❌ "{m.verbatim || ''}"</div>
                <div style={{ fontSize: 12, color: c.dm, marginBottom: 4 }}>💡 {m.pourquoi_inadapte || ''}</div>
                <div style={{ fontSize: 12, color: c.ok }}>✅ "{m.ce_quil_aurait_fallu_dire || ''}"</div>
                {m.principe_disc && <div style={{ fontSize: 11, color: c.bl, fontStyle: 'italic', marginTop: 4 }}>{m.principe_disc}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
      {adapt.strategie_ideale && (
        <div style={{ background: `${c.bl}0F`, border: `1px solid ${c.bl}40`, borderRadius: 10, padding: '16px 18px', marginTop: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: c.bl, marginBottom: 6 }}>🎯 Stratégie idéale pour ce profil</div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: c.tx }}>{adapt.strategie_ideale}</div>
        </div>
      )}
    </div>
  );
}

export default function SimEvaluation({ evaluation, transcriptEntries, isFreeMode }) {
  const c = useColors();
  const { token } = useAuth();
  const [showTranscript, setShowTranscript] = useState(false);

  if (!evaluation) return null;
  const ev = evaluation;

  const scoreColor = ev.score_global >= 14 ? c.ok : ev.score_global >= 10 ? c.wr : c.dn;
  const gradeColors = { A: c.ok, B: c.bl, C: c.wr, D: c.dn, E: c.dn };
  const gradeBgs = { A: c.okD, B: c.blD, C: c.wrD, D: c.dnD, E: c.dnD };
  const gradeColor = gradeColors[ev.note_lettre] || c.mt;
  const gradeBg = gradeBgs[ev.note_lettre] || c.bgE;
  const resultColor = {
    rdv_obtenu: c.ok, mail_envoi: c.bl, rappel_prevu: c.wr, echec_poli: c.wr, echec_dur: c.dn,
  }[ev.resultat_appel] || c.mt;

  const mk = ev.moment_cle;

  return (
    <div>
      {/* Score hero */}
      <div style={{ textAlign: 'center', marginBottom: 32, padding: 28, background: c.bgC, border: `1px solid ${c.bd}`, borderRadius: 14 }}>
        <div style={{ fontSize: 56, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", letterSpacing: -2, lineHeight: 1, color: scoreColor }}>
          {ev.score_global}<span style={{ fontSize: 20, color: c.dm, fontWeight: 400 }}>/20</span>
        </div>
        <div style={{ display: 'inline-block', padding: '4px 16px', borderRadius: 20, fontSize: 18, fontWeight: 800, marginTop: 10, background: gradeBg, color: gradeColor }}>
          {ev.note_lettre || '?'}
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: resultColor, fontWeight: 600 }}>
          {RESULT_LABELS[ev.resultat_appel] || ev.resultat_appel || ''}
        </div>
      </div>

      {/* Radar chart */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <SimRadarChart competences={ev.competences || {}} />
      </div>

      {/* Competence cards */}
      <div className="sim-eval-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
        {COMP_KEYS.map(key => (
          <CompetenceCard key={key} compKey={key} comp={(ev.competences || {})[key] || { score: 0 }} />
        ))}
      </div>

      {/* Posture */}
      <PostureSection pc={ev.posture_commerciale} />

      {/* DISC */}
      <DiscSection disc={ev.analyse_disc} />

      {/* Synthèse */}
      {ev.synthese && (
        <div style={{ background: c.bgC, border: `1px solid ${c.bd}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: c.dm, marginBottom: 10 }}>Synthèse</div>
          <div style={{ fontSize: 14, lineHeight: 1.65, color: c.mt }}>{ev.synthese}</div>
        </div>
      )}

      {/* Conseil prioritaire */}
      {ev.conseil_prioritaire && (
        <div style={{ background: c.acD, border: `1px solid ${c.ac}33`, borderRadius: 10, padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: c.ac, marginBottom: 6 }}>Conseil prioritaire</div>
          <div style={{ fontSize: 14, color: c.tx, fontWeight: 500 }}>{ev.conseil_prioritaire}</div>
        </div>
      )}

      {/* Moment clé */}
      {mk && mk.quand && (
        <div style={{ background: c.bgC, border: `1px solid ${c.bd}`, borderLeft: `4px solid ${c.wr}`, borderRadius: 10, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>⚡ Le moment décisif de votre appel</div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: c.dm, marginBottom: 4 }}>Contexte</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>{mk.quand}</div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: c.dn, marginBottom: 4 }}>Ce que vous avez dit</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.55, color: c.dn, background: c.dnD, padding: '8px 12px', borderRadius: 6 }}>"{mk.ce_que_vous_avez_dit || ''}"</div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: c.ok, marginBottom: 4 }}>Ce qu'il aurait fallu dire</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.55, color: c.ok, background: c.okD, padding: '8px 12px', borderRadius: 6 }}>"{mk.ce_qui_aurait_ete_ideal || ''}"</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: c.dm, marginBottom: 4 }}>Pourquoi</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.55, color: c.mt, fontStyle: 'italic' }}>{mk.pourquoi || ''}</div>
          </div>
        </div>
      )}

      {/* Transcript toggle */}
      {transcriptEntries.length > 0 && (
        <>
          <button onClick={() => setShowTranscript(!showTranscript)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: 14, borderRadius: 10,
            background: c.bgC, border: `1px solid ${c.bd}`, color: c.mt,
            fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', marginBottom: 16,
            fontFamily: 'inherit',
          }}>
            📝 Relire l'échange complet
          </button>
          {showTranscript && (
            <div style={{ maxHeight: 400, overflowY: 'auto', background: c.bgC, border: `1px solid ${c.bd}`, borderRadius: 10, padding: 16, marginBottom: 24 }}>
              {transcriptEntries.map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < transcriptEntries.length - 1 ? `1px solid ${c.bd}33` : 'none' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, flexShrink: 0, minWidth: 70, paddingTop: 2, color: e.who === 'user' ? c.bl : c.ac }}>
                    {e.who === 'user' ? 'Vous' : 'Prospect'}
                  </span>
                  <span style={{ fontSize: 13, lineHeight: 1.55, color: c.mt }}>{e.text}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Anonymous CTA */}
      {isFreeMode && !token && (
        <div style={{
          background: `linear-gradient(135deg, ${c.acD}, ${c.ac}08)`,
          border: `1px solid ${c.ac}33`, borderRadius: 14, padding: '28px 24px', textAlign: 'center', marginTop: 28,
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Impressionné ? Ce n'est que le début.</div>
          <div style={{ fontSize: 13, color: c.mt, lineHeight: 1.6, marginBottom: 20 }}>
            Cette simulation gratuite ne montre qu'un seul scénario. Créez votre compte pour débloquer toute la plateforme.
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
            {['\u{2713} 12 scénarios sectoriels', '\u{2713} 3 niveaux de difficulté', '\u{2713} Dashboard de progression', '\u{2713} Scénarios sur mesure'].map(f => (
              <div key={f} style={{ fontSize: 12, color: c.mt, background: c.bgC, border: `1px solid ${c.bd}`, borderRadius: 8, padding: '8px 14px' }}>{f}</div>
            ))}
          </div>
          <a href="/contact" style={{
            display: 'inline-block', padding: '14px 32px', borderRadius: 6,
            background: `linear-gradient(135deg, ${c.ac}, ${c.acL})`, color: '#fff',
            fontSize: 14, fontWeight: 600, textDecoration: 'none',
          }}>Créer mon compte — 49€/mois</a>
          <div style={{ fontSize: 11, color: c.dm, marginTop: 10 }}>Sans engagement · Annulable à tout moment</div>
        </div>
      )}
    </div>
  );
}
