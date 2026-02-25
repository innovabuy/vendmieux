import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useColors } from '../shared';
import { useRingTone } from '../components/simulation/useRingTone';
import { useLiveKit } from '../components/simulation/useLiveKit';
import SimCall from '../components/simulation/SimCall';
import SimPostCall from '../components/simulation/SimPostCall';
import SimEvaluation from '../components/simulation/SimEvaluation';
import AnalysisModal, { ANALYSIS_STEPS } from '../components/simulation/AnalysisModal';

// ── Multi-language demo configuration ──
const DEMO_LANGS = {
  fr: {
    flag: '\u{1F1EB}\u{1F1F7}',
    label: 'Fran\u00e7ais',
    scenario_id: 'demo_bertrand_prospection_froide_v1',
    persona: {
      prenom: 'Olivier', nom: 'Bertrand', age: 52,
      poste: 'Directeur G\u00e9n\u00e9ral',
      entreprise: { nom: 'M\u00e9caPress', secteur: 'M\u00e9canique de pr\u00e9cision', taille: '45 salari\u00e9s' },
    },
    ui: {
      title: 'Vivez une vraie simulation\ncommerciale en 5 minutes',
      subtitle: 'Vous \u00eates commercial. Vous appelez <b>Olivier Bertrand</b>, DG de M\u00e9caPress (Lyon).<br/>Objectif\u00a0: d\u00e9crocher un rendez-vous.',
      cta: 'Lancer ma simulation',
      brief_title: 'Votre brief commercial',
      brief_subtitle: 'Lisez attentivement avant de lancer l\u2019appel',
      brief_items: [
        { icon: '\u{1F3AF}', label: 'Objectif', value: 'D\u00e9crochez un RDV de 30\u00a0min sur site' },
        { icon: '\u{1F9D1}\u200D\u{1F4BC}', label: 'Vous \u00eates', value: 'Commercial chez IoT Predict \u2014 capteurs de maintenance pr\u00e9dictive pour l\u2019industrie' },
        { icon: '\u{1F4DE}', label: 'Vous appelez', value: 'Olivier Bertrand \u2014 DG M\u00e9caPress, PME 45 salari\u00e9s, m\u00e9canique de pr\u00e9cision, Lyon' },
        { icon: '\u26A0\uFE0F', label: 'Attention', value: 'Contact froid. Il est direct, m\u00e9fiant envers les commerciaux. Il a d\u00e9j\u00e0 un prestataire maintenance.' },
      ],
      tip: 'Dur\u00e9e cible\u00a0: <strong>3 \u00e0 5 minutes</strong>. Parlez naturellement, comme au t\u00e9l\u00e9phone.',
      launch_cta: 'C\u2019est parti \u2014 Je lance l\u2019appel',
      back: '\u2190 Retour',
      rate_limit: 'Vous avez atteint la limite de 3 simulations de d\u00e9monstration par 24h. Cr\u00e9ez un compte gratuit pour continuer.',
      connection_error: 'Erreur de connexion. Veuillez r\u00e9essayer.',
      value_props: [
        { icon: '\u{1F399}\uFE0F', title: 'Appel vocal IA', desc: 'Un prospect r\u00e9aliste qui r\u00e9agit en temps r\u00e9el' },
        { icon: '\u{1F4CA}', title: '\u00c9valuation FORCE 3D', desc: 'Score + verbatims + conseils personnalis\u00e9s' },
        { icon: '\u26A1', title: '5 minutes', desc: 'Aucune inscription, aucune carte bancaire' },
      ],
      badge: 'Session de d\u00e9couverte gratuite \u2014 Sans inscription',
      cta_post_title: 'Vos commerciaux m\u00e9ritent ce niveau d\u2019entra\u00eenement',
      cta_post_desc: '240+ sc\u00e9narios sectoriels, suivi de progression, dashboard manager. Cr\u00e9ez votre compte en 30\u00a0secondes.',
      cta_post_btn: 'Essayer gratuitement \u2014 Cr\u00e9er mon compte',
      cta_post_tarifs: 'Voir les tarifs',
      restart: 'Nouvelle session de d\u00e9mo',
    },
  },
  en: {
    flag: '\u{1F1EC}\u{1F1E7}',
    label: 'English',
    scenario_id: 'demo_english_cold_call_v1',
    persona: {
      prenom: 'James', nom: 'Hargreaves', age: 50,
      poste: 'Managing Director',
      entreprise: { nom: 'Hartwell Engineering', secteur: 'Industrial equipment manufacturing', taille: '60 employees' },
    },
    ui: {
      title: 'Experience a real sales\nsimulation in 5 minutes',
      subtitle: 'You are a sales rep. You\u2019re calling <b>James Hargreaves</b>, MD of Hartwell Engineering (Birmingham).<br/>Goal: secure a meeting.',
      cta: 'Start my simulation',
      brief_title: 'Your sales brief',
      brief_subtitle: 'Read carefully before starting the call',
      brief_items: [
        { icon: '\u{1F3AF}', label: 'Objective', value: 'Secure a 30-minute on-site appointment' },
        { icon: '\u{1F9D1}\u200D\u{1F4BC}', label: 'You are', value: 'Sales rep at IoT Predict \u2014 predictive maintenance sensors for manufacturing' },
        { icon: '\u{1F4DE}', label: 'You\u2019re calling', value: 'James Hargreaves \u2014 MD Hartwell Engineering, 60 employees, precision engineering, Birmingham' },
        { icon: '\u26A0\uFE0F', label: 'Warning', value: 'Cold call. He\u2019s direct, suspicious of salespeople. He already has a maintenance contractor.' },
      ],
      tip: 'Target duration: <strong>3 to 5 minutes</strong>. Speak naturally, as if on the phone.',
      launch_cta: 'Let\u2019s go \u2014 Start the call',
      back: '\u2190 Back',
      rate_limit: 'You\u2019ve reached the limit of 3 demo simulations per 24h. Create a free account to continue.',
      connection_error: 'Connection error. Please try again.',
      value_props: [
        { icon: '\u{1F399}\uFE0F', title: 'AI voice call', desc: 'A realistic prospect who reacts in real time' },
        { icon: '\u{1F4CA}', title: 'FORCE 3D evaluation', desc: 'Score + verbatims + personalised coaching' },
        { icon: '\u26A1', title: '5 minutes', desc: 'No sign-up, no credit card' },
      ],
      badge: 'Free discovery session \u2014 No sign-up required',
      cta_post_title: 'Your sales team deserves this level of training',
      cta_post_desc: '240+ industry scenarios, progress tracking, manager dashboard. Create your account in 30 seconds.',
      cta_post_btn: 'Try free \u2014 Create my account',
      cta_post_tarifs: 'See pricing',
      restart: 'New demo session',
    },
  },
  es: {
    flag: '\u{1F1EA}\u{1F1F8}',
    label: 'Espa\u00f1ol',
    scenario_id: 'demo_espanol_llamada_fria_v1',
    persona: {
      prenom: 'Carlos', nom: 'Mendoza', age: 48,
      poste: 'Director General',
      entreprise: { nom: 'MetalMec Ib\u00e9rica', secteur: 'Mecanizado de precisi\u00f3n', taille: '55 empleados' },
    },
    ui: {
      title: 'Vive una simulaci\u00f3n comercial\nreal en 5 minutos',
      subtitle: 'Eres comercial. Llamas a <b>Carlos Mendoza</b>, Director General de MetalMec Ib\u00e9rica (Barcelona).<br/>Objetivo: conseguir una cita.',
      cta: 'Iniciar mi simulaci\u00f3n',
      brief_title: 'Tu brief comercial',
      brief_subtitle: 'Lee atentamente antes de iniciar la llamada',
      brief_items: [
        { icon: '\u{1F3AF}', label: 'Objetivo', value: 'Consigue una cita de 30\u00a0min en planta' },
        { icon: '\u{1F9D1}\u200D\u{1F4BC}', label: 'T\u00fa eres', value: 'Comercial en IoT Predict \u2014 sensores de mantenimiento predictivo para la industria' },
        { icon: '\u{1F4DE}', label: 'Llamas a', value: 'Carlos Mendoza \u2014 DG MetalMec Ib\u00e9rica, 55 empleados, mecanizado de precisi\u00f3n, Barcelona' },
        { icon: '\u26A0\uFE0F', label: 'Atenci\u00f3n', value: 'Contacto fr\u00edo. Es directo, desconfiado con los comerciales. Ya tiene un proveedor de mantenimiento.' },
      ],
      tip: 'Duraci\u00f3n objetivo: <strong>3 a 5 minutos</strong>. Habla con naturalidad, como por tel\u00e9fono.',
      launch_cta: 'Vamos \u2014 Inicio la llamada',
      back: '\u2190 Volver',
      rate_limit: 'Has alcanzado el l\u00edmite de 3 simulaciones demo por 24h. Crea una cuenta gratuita para continuar.',
      connection_error: 'Error de conexi\u00f3n. Int\u00e9ntalo de nuevo.',
      value_props: [
        { icon: '\u{1F399}\uFE0F', title: 'Llamada vocal IA', desc: 'Un prospect realista que reacciona en tiempo real' },
        { icon: '\u{1F4CA}', title: 'Evaluaci\u00f3n FORCE 3D', desc: 'Puntuaci\u00f3n + verbatims + consejos personalizados' },
        { icon: '\u26A1', title: '5 minutos', desc: 'Sin registro, sin tarjeta de cr\u00e9dito' },
      ],
      badge: 'Sesi\u00f3n de descubrimiento gratuita \u2014 Sin registro',
      cta_post_title: 'Tus comerciales merecen este nivel de entrenamiento',
      cta_post_desc: '240+ escenarios sectoriales, seguimiento de progreso, dashboard manager. Crea tu cuenta en 30\u00a0segundos.',
      cta_post_btn: 'Probar gratis \u2014 Crear mi cuenta',
      cta_post_tarifs: 'Ver tarifas',
      restart: 'Nueva sesi\u00f3n demo',
    },
  },
  de: {
    flag: '\u{1F1E9}\u{1F1EA}',
    label: 'Deutsch',
    scenario_id: 'demo_deutsch_kaltakquise_v1',
    persona: {
      prenom: 'Klaus', nom: 'Hoffmann', age: 54,
      poste: 'Gesch\u00e4ftsf\u00fchrer',
      entreprise: { nom: 'Pr\u00e4zision Werk GmbH', secteur: 'Maschinenbau / Pr\u00e4zisionsfertigung', taille: '70 Mitarbeiter' },
    },
    ui: {
      title: 'Erleben Sie eine echte\nVerkaufssimulation in 5\u00a0Minuten',
      subtitle: 'Sie sind Vertriebsmitarbeiter. Sie rufen <b>Klaus Hoffmann</b> an, GF von Pr\u00e4zision Werk GmbH (Stuttgart).<br/>Ziel: einen Termin vereinbaren.',
      cta: 'Simulation starten',
      brief_title: 'Ihr Verkaufs-Briefing',
      brief_subtitle: 'Lesen Sie aufmerksam, bevor Sie den Anruf starten',
      brief_items: [
        { icon: '\u{1F3AF}', label: 'Ziel', value: 'Vereinbaren Sie einen 30-Minuten-Vor-Ort-Termin' },
        { icon: '\u{1F9D1}\u200D\u{1F4BC}', label: 'Sie sind', value: 'Vertrieb bei IoT Predict \u2014 pr\u00e4diktive Wartungssensoren f\u00fcr die Fertigung' },
        { icon: '\u{1F4DE}', label: 'Sie rufen an', value: 'Klaus Hoffmann \u2014 GF Pr\u00e4zision Werk GmbH, 70 Mitarbeiter, Pr\u00e4zisionsfertigung, Stuttgart' },
        { icon: '\u26A0\uFE0F', label: 'Achtung', value: 'Kaltakquise. Er ist analytisch, skeptisch gegen\u00fcber Verk\u00e4ufern. Er hat bereits einen Wartungsdienstleister.' },
      ],
      tip: 'Zieldauer: <strong>3 bis 5 Minuten</strong>. Sprechen Sie nat\u00fcrlich, wie am Telefon.',
      launch_cta: 'Los geht\u2019s \u2014 Anruf starten',
      back: '\u2190 Zur\u00fcck',
      rate_limit: 'Sie haben das Limit von 3 Demo-Simulationen pro 24h erreicht. Erstellen Sie ein kostenloses Konto.',
      connection_error: 'Verbindungsfehler. Bitte erneut versuchen.',
      value_props: [
        { icon: '\u{1F399}\uFE0F', title: 'KI-Sprachanruf', desc: 'Ein realistischer Prospect, der in Echtzeit reagiert' },
        { icon: '\u{1F4CA}', title: 'FORCE 3D Bewertung', desc: 'Score + Verbatims + pers\u00f6nliches Coaching' },
        { icon: '\u26A1', title: '5 Minuten', desc: 'Keine Anmeldung, keine Kreditkarte' },
      ],
      badge: 'Kostenlose Entdeckungssession \u2014 Ohne Registrierung',
      cta_post_title: 'Ihr Vertriebsteam verdient dieses Trainingsniveau',
      cta_post_desc: '240+ Branchen-Szenarien, Fortschrittsverfolgung, Manager-Dashboard. Konto in 30\u00a0Sekunden erstellen.',
      cta_post_btn: 'Kostenlos testen \u2014 Konto erstellen',
      cta_post_tarifs: 'Preise ansehen',
      restart: 'Neue Demo-Session',
    },
  },
  it: {
    flag: '\u{1F1EE}\u{1F1F9}',
    label: 'Italiano',
    scenario_id: 'demo_italiano_chiamata_fredda_v1',
    persona: {
      prenom: 'Marco', nom: 'Ferretti', age: 47,
      poste: 'Direttore Generale',
      entreprise: { nom: 'MeccanicaPro Srl', secteur: 'Lavorazioni meccaniche di precisione', taille: '50 dipendenti' },
    },
    ui: {
      title: 'Vivi una vera simulazione\ncommerciale in 5 minuti',
      subtitle: 'Sei un commerciale. Stai chiamando <b>Marco Ferretti</b>, DG di MeccanicaPro Srl (Milano).<br/>Obiettivo: ottenere un appuntamento.',
      cta: 'Avvia la mia simulazione',
      brief_title: 'Il tuo brief commerciale',
      brief_subtitle: 'Leggi attentamente prima di avviare la chiamata',
      brief_items: [
        { icon: '\u{1F3AF}', label: 'Obiettivo', value: 'Ottieni un appuntamento di 30\u00a0min in stabilimento' },
        { icon: '\u{1F9D1}\u200D\u{1F4BC}', label: 'Tu sei', value: 'Commerciale presso IoT Predict \u2014 sensori di manutenzione predittiva per l\u2019industria' },
        { icon: '\u{1F4DE}', label: 'Chiami', value: 'Marco Ferretti \u2014 DG MeccanicaPro Srl, 50 dipendenti, meccanica di precisione, Milano' },
        { icon: '\u26A0\uFE0F', label: 'Attenzione', value: 'Chiamata a freddo. \u00c8 diretto, relazionale ma diffidente verso i commerciali generici. Ha gi\u00e0 un fornitore di manutenzione.' },
      ],
      tip: 'Durata target: <strong>3 a 5 minuti</strong>. Parla con naturalezza, come al telefono.',
      launch_cta: 'Via \u2014 Avvio la chiamata',
      back: '\u2190 Indietro',
      rate_limit: 'Hai raggiunto il limite di 3 simulazioni demo per 24h. Crea un account gratuito per continuare.',
      connection_error: 'Errore di connessione. Riprova.',
      value_props: [
        { icon: '\u{1F399}\uFE0F', title: 'Chiamata vocale IA', desc: 'Un prospect realistico che reagisce in tempo reale' },
        { icon: '\u{1F4CA}', title: 'Valutazione FORCE 3D', desc: 'Punteggio + verbatim + consigli personalizzati' },
        { icon: '\u26A1', title: '5 minuti', desc: 'Nessuna registrazione, nessuna carta di credito' },
      ],
      badge: 'Sessione di scoperta gratuita \u2014 Senza registrazione',
      cta_post_title: 'I tuoi commerciali meritano questo livello di formazione',
      cta_post_desc: '240+ scenari settoriali, monitoraggio progressi, dashboard manager. Crea il tuo account in 30\u00a0secondi.',
      cta_post_btn: 'Prova gratis \u2014 Crea il mio account',
      cta_post_tarifs: 'Vedi i prezzi',
      restart: 'Nuova sessione demo',
    },
  },
};

const LANG_KEYS = Object.keys(DEMO_LANGS);

// Detect language: URL param > browser language > fr
function detectLang(urlLang) {
  if (urlLang && DEMO_LANGS[urlLang]) return urlLang;
  const bl = (navigator.language || 'fr').slice(0, 2).toLowerCase();
  return DEMO_LANGS[bl] ? bl : 'fr';
}

export default function DemoPage() {
  const c = useColors();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlLang = searchParams.get('lang');
  const urlDiff = parseInt(searchParams.get('difficulty'), 10);
  const demoDifficulty = [1, 2, 3].includes(urlDiff) ? urlDiff : 2;
  const [lang, setLang] = useState(() => detectLang(urlLang));
  const [phase, setPhase] = useState('landing');
  // landing | brief | simulation | postcall | error

  const [callDuration, setCallDuration] = useState(0);
  const [evaluation, setEvaluation] = useState(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState('');
  const [sessionDbId, setSessionDbId] = useState(null);
  const [apiError, setApiError] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisDone, setAnalysisDone] = useState(false);
  const analysisStartRef = useRef(null);
  const chunkCountRef = useRef(0);

  const ringTone = useRingTone();
  const liveKit = useLiveKit();

  const cfg = DEMO_LANGS[lang];
  const ui = cfg.ui;
  const persona = cfg.persona;

  // Launch: landing -> brief (no API call)
  function handleLaunch() {
    setPhase('brief');
  }

  // Start simulation: brief -> simulation (no API call yet)
  function handleStartSimulation() {
    setApiError('');
    setPhase('simulation');
  }

  // Start call — SINGLE /api/token call happens here only
  async function handleStartCall() {
    await ringTone.play();
    try {
      const result = await liveKit.connect({
        tokenUrl: '/api/token',
        scenarioId: cfg.scenario_id,
        difficulty: demoDifficulty,
        userName: 'Commercial',
        language: lang,
        authToken: null,
        demo: true,
        onPickup: () => ringTone.stop(),
        on429: () => setApiError(ui.rate_limit),
      });
      setSessionDbId(result.sessionDbId);
    } catch (e) {
      ringTone.stop();
      if (!apiError) setApiError(ui.connection_error);
      setPhase('brief');
    }
  }

  // End call
  function handleEndCall() {
    ringTone.stop();
    const duration = liveKit.disconnect();
    const entries = liveKit.transcriptEntries;
    const hadTranscript = entries.length > 0;
    const longEnough = duration > 3000;

    if (hadTranscript && longEnough) {
      setCallDuration(duration);
      setPhase('postcall');
      runEvaluation(duration, entries);
    } else {
      setPhase('brief');
    }
  }

  // Progressive JSON parse: extract JSON from potentially dirty text
  function tryProgressiveParse(text) {
    try {
      let s = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const start = s.indexOf('{');
      const end = s.lastIndexOf('}');
      if (start === -1) return null;

      if (end > start) {
        try {
          const parsed = JSON.parse(s.slice(start, end + 1));
          if (parsed && typeof parsed.score_global === 'number') return parsed;
        } catch {
          // Fall through to progressive close
        }
      }

      s = s.slice(start);
      s = s.replace(/,\s*$/, '');
      let braces = 0, brackets = 0;
      for (const ch of s) {
        if (ch === '{') braces++;
        else if (ch === '}') braces--;
        else if (ch === '[') brackets++;
        else if (ch === ']') brackets--;
      }
      s = s.replace(/,\s*$/, '');
      for (let i = 0; i < brackets; i++) s += ']';
      for (let i = 0; i < braces; i++) s += '}';
      const parsed = JSON.parse(s);
      if (parsed && typeof parsed.score_global === 'number') return parsed;
      return null;
    } catch {
      return null;
    }
  }

  // Advance analysis modal step based on elapsed time and chunk count
  function advanceAnalysis() {
    chunkCountRef.current++;
    const elapsed = Date.now() - analysisStartRef.current;
    const timeStep = Math.min(Math.floor(elapsed / 2000), ANALYSIS_STEPS.length - 1);
    const chunkStep = Math.min(Math.floor(chunkCountRef.current / 3), ANALYSIS_STEPS.length - 1);
    const step = Math.max(timeStep, chunkStep);
    setAnalysisStep(step);
    setAnalysisProgress(ANALYSIS_STEPS[step].pct);
  }

  // Finalize analysis modal: show 100% then close after delay
  function finalizeAnalysis(callback) {
    setAnalysisDone(true);
    setAnalysisProgress(100);
    setAnalysisStep(ANALYSIS_STEPS.length - 1);
    setTimeout(() => {
      setShowAnalysis(false);
      setAnalysisDone(false);
      setAnalysisProgress(0);
      setAnalysisStep(0);
      chunkCountRef.current = 0;
      if (callback) callback();
    }, 800);
  }

  // Evaluation (SSE streaming)
  async function runEvaluation(duration, entries) {
    setEvalLoading(true);
    setEvalError('');
    setEvaluation(null);

    if (entries.length < 3) {
      setEvalLoading(false);
      setEvalError('Appel trop court pour \u00eatre \u00e9valu\u00e9 (minimum 3 \u00e9changes requis)');
      return;
    }

    // Start analysis modal
    setShowAnalysis(true);
    setAnalysisProgress(0);
    setAnalysisStep(0);
    setAnalysisDone(false);
    analysisStartRef.current = Date.now();
    chunkCountRef.current = 0;

    const transcriptArray = entries.map(e => ({
      role: e.who === 'user' ? 'vendeur' : 'prospect',
      text: e.text,
      timestamp: e.time / 1000,
    }));

    try {
      const r = await fetch('/api/evaluate/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: 'demo-' + Date.now(),
          transcript: transcriptArray,
          scenario_id: cfg.scenario_id,
          difficulty: demoDifficulty,
          duration_s: Math.floor(duration / 1000),
          session_db_id: sessionDbId,
          language: lang,
        }),
      });

      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || 'Erreur serveur');
      }

      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('event: done') || line.startsWith('event: error')) continue;
          if (!line.startsWith('data: ')) continue;

          const payload = line.slice(6);
          try {
            const msg = JSON.parse(payload);
            if (msg.type === 'chunk') {
              accumulated += msg.text;
              advanceAnalysis();
              const partial = tryProgressiveParse(accumulated);
              if (partial) setEvaluation(partial);
            } else if (msg.score_global !== undefined) {
              const finalData = msg;
              finalizeAnalysis(() => {
                setEvaluation(finalData);
                setEvalLoading(false);
              });
              return;
            } else if (msg.error) {
              setShowAnalysis(false);
              setEvalError(msg.error);
              setEvalLoading(false);
              return;
            }
          } catch {}
        }
      }

      // Stream ended without explicit done event
      if (accumulated) {
        const partial = tryProgressiveParse(accumulated);
        if (partial) {
          finalizeAnalysis(() => {
            setEvaluation(partial);
            setEvalLoading(false);
          });
          return;
        }
      }
      setShowAnalysis(false);
      setEvalLoading(false);
    } catch (e) {
      setShowAnalysis(false);
      setEvalLoading(false);
      setEvalError(e.message);
    }
  }

  // Restart
  function handleRestart() {
    setEvaluation(null);
    setEvalLoading(false);
    setEvalError('');
    setCallDuration(0);
    setApiError('');
    setPhase('landing');
  }

  // --- Shared styles ---
  const btnPrimary = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '16px 36px', borderRadius: 10, border: 'none',
    fontSize: 17, fontWeight: 700, cursor: 'pointer',
    background: `linear-gradient(135deg, ${c.ac}, ${c.acL})`, color: '#fff',
    boxShadow: `0 4px 24px ${c.acD}`, fontFamily: 'inherit',
    transition: 'transform 0.15s, box-shadow 0.15s',
  };

  const btnSecondary = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '12px 24px', borderRadius: 8, cursor: 'pointer',
    fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
    background: 'transparent', border: `1.5px solid ${c.bd}`, color: c.tx,
    transition: 'all 0.15s',
  };

  const card = {
    background: c.bgC, border: `1px solid ${c.bd}`, borderRadius: 14,
    padding: '20px 24px',
  };

  // Language selector component
  const LangSelector = () => (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
      {LANG_KEYS.map(k => {
        const active = k === lang;
        return (
          <button
            key={k}
            onClick={() => setLang(k)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 48, height: 48, borderRadius: 12, cursor: 'pointer',
              fontSize: 24, border: active ? `2px solid ${c.ac}` : `1px solid ${c.bd}`,
              background: active ? `${c.ac}15` : 'transparent',
              boxShadow: active ? `0 0 12px ${c.ac}25` : 'none',
              transition: 'all 0.15s',
            }}
            title={DEMO_LANGS[k].label}
          >
            {DEMO_LANGS[k].flag}
          </button>
        );
      })}
    </div>
  );

  return (
    <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto', padding: '32px 24px', minHeight: '100vh' }}>
      {/* Background gradients */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(ellipse at 15% -10%, ${c.ac}12 0%, transparent 55%), radial-gradient(ellipse at 85% 110%, ${c.bl}0A 0%, transparent 55%)`,
      }} />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative', zIndex: 1 }}>
        <a href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `linear-gradient(135deg, ${c.ac}, ${c.acL})`,
            display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 16, color: '#fff',
            boxShadow: `0 2px 16px ${c.acD}`,
          }}>VM</div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>
            Vend<span style={{ color: c.ac }}>Mieux</span>
          </div>
        </a>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 20,
          fontSize: 11, fontWeight: 600,
          background: `${c.ok}18`, border: `1px solid ${c.ok}33`, color: c.ok,
        }}>
          {ui.badge}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ══ PHASE: LANDING ══ */}
        {phase === 'landing' && (
          <div style={{ textAlign: 'center' }}>
            <LangSelector />

            <h1 style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.25, marginBottom: 16, letterSpacing: -0.5, whiteSpace: 'pre-line' }}>
              {ui.title}
            </h1>
            <p
              style={{ color: c.mt, fontSize: 16, lineHeight: 1.6, maxWidth: 560, margin: '0 auto 32px' }}
              dangerouslySetInnerHTML={{ __html: ui.subtitle }}
            />

            <button onClick={handleLaunch} style={btnPrimary}>
              {ui.cta}
            </button>

            {/* 3 value props */}
            <div className="sim-post-stats" style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 48, flexWrap: 'wrap' }}>
              {ui.value_props.map((v, i) => (
                <div key={i} style={{ ...card, flex: '1 1 200px', maxWidth: 240, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{v.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{v.title}</div>
                  <div style={{ fontSize: 12, color: c.dm, lineHeight: 1.5 }}>{v.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ color: c.dm, fontSize: 11, marginTop: 40 }}>
              {cfg.flag} {cfg.label} &middot; {persona.prenom} {persona.nom}, {persona.poste} &mdash; {persona.entreprise.nom}
            </div>
          </div>
        )}

        {/* ══ PHASE: BRIEF ══ */}
        {phase === 'brief' && (
          <div style={{ maxWidth: 580, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{ui.brief_title}</div>
              <div style={{ color: c.mt, fontSize: 13 }}>{ui.brief_subtitle}</div>
            </div>

            <div style={{ ...card, marginBottom: 20 }}>
              {ui.brief_items.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  padding: '12px 0',
                  borderBottom: i < ui.brief_items.length - 1 ? `1px solid ${c.bd}` : 'none',
                }}>
                  <div style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: c.dm, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: 14, lineHeight: 1.5 }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 14px', background: `${c.wr}12`, border: `1px solid ${c.wr}33`, borderRadius: 8, marginBottom: 24, fontSize: 12, color: c.wr, lineHeight: 1.5 }}
            >
              <span style={{ fontSize: 16 }}>{'\u{1F4A1}'}</span>
              <span dangerouslySetInnerHTML={{ __html: ui.tip }} />
            </div>

            {apiError && (
              <div style={{ textAlign: 'center', padding: '12px 16px', background: `${c.dn}15`, border: `1px solid ${c.dn}33`, borderRadius: 8, marginBottom: 16, color: c.dn, fontSize: 13 }}>
                {apiError}
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <button onClick={handleStartSimulation} style={btnPrimary}>
                {ui.launch_cta}
              </button>
              <div style={{ marginTop: 12 }}>
                <button onClick={() => setPhase('landing')} style={{ ...btnSecondary, border: 'none', fontSize: 12, color: c.dm }}>
                  {ui.back}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ PHASE: SIMULATION ══ */}
        {phase === 'simulation' && (
          <SimCall
            persona={persona}
            status={liveKit.status}
            statusMsg={liveKit.statusMsg}
            timer={liveKit.timer}
            muted={liveKit.muted}
            transcriptEntries={liveKit.transcriptEntries}
            pendingSegments={liveKit.pendingSegments}
            onStart={handleStartCall}
            onMute={liveKit.toggleMute}
            onStop={handleEndCall}
          />
        )}

        {/* ══ PHASE: POSTCALL (Debrief + CTA) ══ */}
        {phase === 'postcall' && (
          <>
            <SimPostCall
              persona={persona}
              duration={callDuration}
              transcriptEntries={liveKit.transcriptEntries}
              evalLoading={evalLoading}
              evalError={evalError}
            >
              {evaluation && (
                <SimEvaluation
                  evaluation={evaluation}
                  transcriptEntries={liveKit.transcriptEntries}
                  isFreeMode={true}
                />
              )}
            </SimPostCall>

            {/* CTA Conversion */}
            {(evaluation || evalError) && !evalLoading && (
              <div style={{
                textAlign: 'center', marginTop: 48, padding: '40px 24px',
                background: `linear-gradient(135deg, ${c.ac}08, ${c.bl}06)`,
                border: `1px solid ${c.ac}22`, borderRadius: 16,
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, letterSpacing: -0.3 }}>
                  {ui.cta_post_title}
                </div>
                <p style={{ color: c.mt, fontSize: 14, lineHeight: 1.6, maxWidth: 480, margin: '0 auto 28px' }}>
                  {ui.cta_post_desc}
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => navigate('/app/login')} style={btnPrimary}>
                    {ui.cta_post_btn}
                  </button>
                  <button onClick={() => navigate('/tarifs')} style={btnSecondary}>
                    {ui.cta_post_tarifs}
                  </button>
                </div>
                <div style={{ marginTop: 16 }}>
                  <a href="/produit" style={{ color: c.dm, fontSize: 12, textDecoration: 'underline' }}>
                    FORCE 3D\u00ae
                  </a>
                </div>
              </div>
            )}

            {/* Restart button */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28 }}>
              <button onClick={handleRestart} style={{
                ...btnSecondary, fontSize: 13,
              }}>{ui.restart}</button>
            </div>
          </>
        )}

        {/* ══ ERROR ══ */}
        {phase === 'error' && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{'\u26A0\uFE0F'}</div>
            <div style={{ fontSize: 16, color: c.mt }}>{apiError || 'An error occurred.'}</div>
            <button onClick={handleRestart} style={{ ...btnSecondary, marginTop: 24 }}>{ui.restart}</button>
          </div>
        )}

      </div>

      {/* Analysis modal */}
      {showAnalysis && (
        <AnalysisModal
          progress={analysisProgress}
          currentStep={analysisStep}
          done={analysisDone}
        />
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '40px 20px', borderTop: `1px solid ${c.bd}`, marginTop: 40 }}>
        <div style={{ color: c.dm, fontSize: 11 }}>
          VendMieux &middot; FORCE 3D\u00ae &middot; <a href="/mentions-legales" style={{ color: c.dm }}>Mentions l\u00e9gales</a>
        </div>
      </div>
    </div>
  );
}
