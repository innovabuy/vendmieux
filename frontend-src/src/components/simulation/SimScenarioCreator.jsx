import React, { useState, useRef } from 'react';
import { useColors } from '../../shared';
import { useAuth } from '../../auth';

const SECTORS = [
  { value: '', label: 'Détection automatique' },
  { value: 'industrie', label: 'Industrie / Manufacturing' },
  { value: 'services', label: 'Services aux entreprises' },
  { value: 'tech', label: 'Tech / SaaS / Digital' },
  { value: 'commerce', label: 'Commerce / Distribution' },
  { value: 'sante', label: 'Santé / Médical' },
  { value: 'batiment', label: 'BTP / Bâtiment' },
  { value: 'finance', label: 'Finance / Assurance / Banque' },
  { value: 'formation', label: 'Formation / Éducation' },
  { value: 'immobilier', label: 'Immobilier' },
  { value: 'autre', label: 'Autre' },
];

const TYPES = [
  { value: 'prospection', label: 'Prospection à froid' },
  { value: 'relance', label: 'Relance / Suivi' },
  { value: 'negociation', label: 'Négociation' },
  { value: 'reclamation', label: 'Réclamation client' },
  { value: 'upsell', label: 'Upsell / Cross-sell' },
];

const STEPS = [
  'Étape 1/4 : Analyse de votre situation...',
  'Étape 2/4 : Création du prospect...',
  'Étape 3/4 : Génération des objections...',
  'Étape 4/4 : Préparation du brief commercial...',
];

export default function SimScenarioCreator({ language, onBack, onLaunchScenario }) {
  const c = useColors();
  const { token } = useAuth();
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('');
  const [type, setType] = useState('prospection');
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState('');
  const [result, setResult] = useState(null);
  const stepInterval = useRef(null);

  const selectStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 6,
    background: c.bgE, border: `1px solid ${c.bd}`,
    color: c.tx, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
  };

  async function handleGenerate() {
    if (!description || description.length < 30) {
      alert('Décrivez votre situation en au moins quelques phrases (30 caractères minimum).');
      return;
    }

    setGenerating(true);
    setResult(null);
    setStep(STEPS[0]);

    let stepIdx = 0;
    stepInterval.current = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, STEPS.length - 1);
      setStep(STEPS[stepIdx]);
    }, 4000);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = 'Bearer ' + token;

      const r = await fetch('/api/scenarios/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          description,
          sector: sector || null,
          type: type || 'prospection',
          language,
        }),
      });

      clearInterval(stepInterval.current);
      const scenario = await r.json();
      if (!r.ok) throw new Error(scenario.detail || scenario.error || 'Erreur serveur');

      setResult(scenario);
    } catch (e) {
      alert('Erreur lors de la génération : ' + e.message);
    } finally {
      clearInterval(stepInterval.current);
      setGenerating(false);
    }
  }

  return (
    <div>
      <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
        Créez votre scénario de simulation
      </h2>
      <p style={{ textAlign: 'center', color: c.mt, fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
        Décrivez la situation commerciale que vous voulez entraîner. L'IA génère tout automatiquement : le prospect, ses objections et le brief commercial.
      </p>

      {!generating && !result && (
        <>
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: c.dm, marginBottom: 8, display: 'block' }}>
            Décrivez votre situation commerciale
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={6}
            placeholder="Ex: Je vends des logiciels de comptabilité aux cabinets comptables de 5-20 personnes..."
            style={{
              width: '100%', padding: 16, borderRadius: 10,
              background: c.bgE, border: `1px solid ${c.bd}`,
              color: c.tx, fontSize: 14, lineHeight: 1.6, resize: 'vertical',
              fontFamily: 'inherit', outline: 'none',
            }}
          />

          <div className="sim-creator-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, margin: '18px 0' }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: c.dm, marginBottom: 6, display: 'block' }}>
                Secteur (optionnel)
              </label>
              <select value={sector} onChange={e => setSector(e.target.value)} style={selectStyle}>
                {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: c.dm, marginBottom: 6, display: 'block' }}>
                Type d'appel
              </label>
              <select value={type} onChange={e => setType(e.target.value)} style={selectStyle}>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
        </>
      )}

      {generating && (
        <div style={{ textAlign: 'center', padding: '32px 20px' }}>
          <div style={{
            display: 'inline-block', width: 36, height: 36,
            border: `3px solid ${c.bd}`, borderTopColor: c.ac,
            borderRadius: '50%', animation: 'spin 0.6s linear infinite', marginBottom: 16,
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Génération en cours...</div>
          <div style={{ fontSize: 12, color: c.dm }}>L'IA crée votre prospect, ses objections et le brief commercial.</div>
          <div style={{ fontSize: 13, color: c.ac, fontWeight: 600, marginTop: 8 }}>{step}</div>
        </div>
      )}

      {result && (
        <div style={{ background: c.bgC, border: `1px solid ${c.bd}`, borderRadius: 14, padding: 24, marginTop: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: c.ok }}>Scénario généré avec succès</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: c.mt, marginBottom: 20 }}>
            <div><strong style={{ color: c.tx }}>Prospect :</strong> {result.persona?.identite?.prenom} {result.persona?.identite?.nom}, {result.persona?.identite?.poste}</div>
            <div><strong style={{ color: c.tx }}>Entreprise :</strong> {result.persona?.identite?.entreprise?.nom} — {result.persona?.identite?.entreprise?.secteur}</div>
            <div><strong style={{ color: c.tx }}>Titre :</strong> {result.brief_commercial?.titre || 'Scénario personnalisé'}</div>
            <div><strong style={{ color: c.tx }}>Objections :</strong> {result.objections?.objections?.length || '?'} objections générées</div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => onLaunchScenario(result.id || result.scenario_id)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '12px 24px', borderRadius: 6, border: 'none',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              background: `linear-gradient(135deg, ${c.ac}, ${c.acL})`, color: '#fff',
              boxShadow: `0 4px 16px ${c.acD}`, fontFamily: 'inherit',
            }}>Lancer la simulation</button>
            <button onClick={() => { setResult(null); setGenerating(false); }} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '12px 24px', borderRadius: 6,
              background: c.bgE, border: `1px solid ${c.bd}`, color: c.tx,
              fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>Modifier et régénérer</button>
          </div>
        </div>
      )}

      {!generating && !result && (
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28 }}>
          <button onClick={handleGenerate} style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '12px 24px', borderRadius: 6, border: 'none',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            background: `linear-gradient(135deg, ${c.ac}, ${c.acL})`, color: '#fff',
            boxShadow: `0 4px 16px ${c.acD}`, fontFamily: 'inherit',
          }}>Générer le scénario</button>
          <button onClick={onBack} style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '12px 24px', borderRadius: 6,
            background: c.bgE, border: `1px solid ${c.bd}`, color: c.tx,
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>Retour</button>
        </div>
      )}
    </div>
  );
}
