import React from 'react';
import { useColors } from '../../shared';
import { LANGUAGES, DIFFICULTIES } from './constants';

function BriefCard({ title, icon, children, fullWidth }) {
  const c = useColors();
  return (
    <div style={{
      background: c.bgC, border: `1px solid ${c.bd}`, borderRadius: 10, padding: 16,
      gridColumn: fullWidth ? '1 / -1' : undefined,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: c.dm, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon} {title}
      </div>
      <div style={{ fontSize: 13.5, lineHeight: 1.6, color: c.mt }}>{children}</div>
    </div>
  );
}

export default function SimBriefing({ scenario, language, difficulty, onLanguageChange, onDifficultyChange, onLaunch }) {
  const c = useColors();
  if (!scenario) return null;

  const p = scenario.persona;
  const id = p.identite;
  const ent = id.entreprise;
  const psy = p.psychologie;
  const ctx = p.contexte_actuel;
  const obj = scenario.objections;
  const objList = (obj?.objections || []).slice(0, 6);

  return (
    <div>
      {/* Briefing grid */}
      <div className="sim-brief-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <BriefCard title="Profil" icon="👤">
          <strong style={{ color: c.tx, fontWeight: 600 }}>{id.prenom} {id.nom}</strong>, {id.age || '?'} ans<br />
          {id.poste} chez <strong style={{ color: c.tx, fontWeight: 600 }}>{ent.nom}</strong><br />
          {ent.secteur} — {ent.taille || '?'} — CA {ent.ca_approximatif || '?'}
        </BriefCard>

        <BriefCard title="Psychologie" icon="🧠">
          <strong style={{ color: c.tx, fontWeight: 600 }}>Traits :</strong> {psy.traits_dominants.join(', ')}<br />
          <strong style={{ color: c.tx, fontWeight: 600 }}>Style :</strong> {psy.style_communication}<br />
          <strong style={{ color: c.tx, fontWeight: 600 }}>Rapport aux commerciaux :</strong> {psy.rapport_aux_commerciaux || '?'}
        </BriefCard>

        <BriefCard title="Contexte" icon="📋" fullWidth>
          <strong style={{ color: c.tx, fontWeight: 600 }}>Situation :</strong> {ctx.situation_entreprise}<br />
          <strong style={{ color: c.tx, fontWeight: 600 }}>Priorités :</strong> {(ctx.priorites_actuelles || []).join(', ')}<br />
          <strong style={{ color: c.tx, fontWeight: 600 }}>Fournisseur actuel :</strong> {ctx.fournisseur_actuel || 'Aucun'}<br />
          <strong style={{ color: c.tx, fontWeight: 600 }}>Budget :</strong> {ctx.budget_disponible || '?'}
        </BriefCard>

        <BriefCard title="Objections à anticiper" icon="⚡" fullWidth>
          {objList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {objList.map((o, i) => (
                <div key={i} style={{
                  background: c.bgE, border: `1px solid ${c.bd}`, borderRadius: 6,
                  padding: '10px 12px', fontSize: 13, lineHeight: 1.5,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: c.ac, marginRight: 8 }}>{o.moment}</span>
                  <span style={{ float: 'right', fontSize: 10, color: c.dm, fontFamily: "'JetBrains Mono', monospace" }}>diff: {o.difficulte}/5</span>
                  <br />
                  <span style={{ color: c.tx, fontStyle: 'italic' }}>"{o.verbatim}"</span>
                </div>
              ))}
            </div>
          ) : (
            'Aucune objection définie.'
          )}
        </BriefCard>
      </div>

      {/* Language selector */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: c.dm, marginBottom: 10, textAlign: 'center' }}>
          Langue de la simulation
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => onLanguageChange(l.code)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 20,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              background: language === l.code ? c.acD : 'transparent',
              border: `1px solid ${language === l.code ? c.ac : c.bd}`,
              color: language === l.code ? c.ac : c.mt,
              boxShadow: language === l.code ? `0 0 12px ${c.acD}` : 'none',
              fontFamily: 'inherit',
            }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>{l.flag}</span> {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty selector */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: c.dm, marginBottom: 10, textAlign: 'center' }}>
          Niveau de difficulté
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {DIFFICULTIES.map(d => {
            const selected = difficulty === d.value;
            const diffColors = { 1: c.ok, 2: c.wr, 3: c.dn };
            const diffBg = { 1: c.okD, 2: c.wrD, 3: c.dnD };
            return (
              <button key={d.value} onClick={() => onDifficultyChange(d.value)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '10px 18px', borderRadius: 20,
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                background: selected ? diffBg[d.value] : 'transparent',
                border: `1px solid ${selected ? diffColors[d.value] : c.bd}`,
                color: selected ? diffColors[d.value] : c.mt,
                boxShadow: selected ? `0 0 12px ${diffBg[d.value]}` : 'none',
                textAlign: 'center', fontFamily: 'inherit',
              }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{d.emoji} {d.label}</span>
                <span style={{ fontSize: 10, fontWeight: 400, color: selected ? 'inherit' : c.dm, maxWidth: 170, lineHeight: 1.3, opacity: selected ? 0.8 : 1 }}>{d.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Launch button */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28 }}>
        <button onClick={onLaunch} style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '12px 24px', borderRadius: 6, border: 'none',
          fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
          background: `linear-gradient(135deg, ${c.ac}, ${c.acL})`, color: '#fff',
          boxShadow: `0 4px 16px ${c.acD}`, fontFamily: 'inherit',
        }}>
          🎙️ Lancer la simulation
        </button>
      </div>
    </div>
  );
}
