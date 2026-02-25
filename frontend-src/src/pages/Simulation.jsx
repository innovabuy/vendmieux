import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useColors } from '../shared';
import { useAuth } from '../auth';
import { useRingTone } from '../components/simulation/useRingTone';
import { useIntroSequence } from '../components/simulation/useIntroSequence';
import { useLiveKit } from '../components/simulation/useLiveKit';
import SimBriefing from '../components/simulation/SimBriefing';
import SimCall from '../components/simulation/SimCall';
import SimPostCall from '../components/simulation/SimPostCall';
import SimEvaluation from '../components/simulation/SimEvaluation';
import SimScenarioCreator from '../components/simulation/SimScenarioCreator';
import SimSignupModal from '../components/simulation/SimSignupModal';
import AnalysisModal, { ANALYSIS_STEPS } from '../components/simulation/AnalysisModal';

// State machine: loading → briefing → call → postcall → error | creator
export default function Simulation() {
  const c = useColors();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const scenarioIdParam = searchParams.get('scenario') || '__default__';
  const isFreeMode = true; // SPA simulation is always "free mode" (or authenticated)

  const [phase, setPhase] = useState('loading'); // loading | briefing | call | postcall | error | creator
  const [errorMsg, setErrorMsg] = useState('');
  const [scenario, setScenario] = useState(null);
  const [scenarioId, setScenarioId] = useState(scenarioIdParam);
  const [language, setLanguage] = useState('fr');
  const [difficulty, setDifficulty] = useState(2);
  const [signupOpen, setSignupOpen] = useState(false);
  const [sessionDbId, setSessionDbId] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [evaluation, setEvaluation] = useState(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisDone, setAnalysisDone] = useState(false);
  const analysisStartRef = useRef(null);
  const chunkCountRef = useRef(0);

  const ringTone = useRingTone();
  const introSequence = useIntroSequence();
  const liveKit = useLiveKit();
  const prefetchedTokenRef = useRef(null);

  // Load scenario on mount
  useEffect(() => {
    loadScenario(scenarioIdParam);
  }, [scenarioIdParam]);

  async function loadScenario(id) {
    setPhase('loading');
    setEvaluation(null);
    setEvalLoading(false);
    setEvalError('');

    try {
      const r = await fetch('/api/scenarios/' + encodeURIComponent(id));
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || 'Scénario introuvable');
      }
      const data = await r.json();
      setScenario(data);
      setScenarioId(id);
      setDifficulty(data.metadata?.difficulte_defaut || 2);
      setPhase('briefing');
    } catch (e) {
      setErrorMsg(e.message);
      setPhase('error');
    }
  }

  // Pre-fetch LiveKit token (called when user clicks "Lancer")
  async function prefetchToken() {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = 'Bearer ' + token;
      const r = await fetch('/api/token', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          scenario_id: scenarioId !== '__default__' ? scenarioId : null,
          difficulty,
          user_name: 'Commercial',
          language,
        }),
      });
      if (r.ok) {
        prefetchedTokenRef.current = await r.json();
      }
    } catch (_) {
      // Silently fail — will retry in handleStartCall
    }
  }

  const [conversionModalOpen, setConversionModalOpen] = useState(false);

  // Launch simulation
  function handleLaunch() {
    setPhase('call');
    // Pre-fetch token while user sees the call UI
    prefetchToken();
  }

  // Show conversion modal 8s after debrief for anonymous users
  useEffect(() => {
    if (phase === 'postcall' && evaluation && !evalLoading && !token) {
      const timer = setTimeout(() => setConversionModalOpen(true), 8000);
      return () => clearTimeout(timer);
    }
  }, [phase, evaluation, evalLoading, token]);

  // Detect physical scenario type (rdv_physique, multi_interlocuteurs, negociation, etc.)
  const isRdvPhysique = scenario?._is_physical
    || scenario?.simulation?.type === 'rdv_physique'
    || scenario?.scenario_type === 'rdv_physique';

  // Start call (when user clicks the phone/start button)
  async function handleStartCall() {
    const connectConfig = {
      tokenUrl: '/api/token',
      scenarioId: scenarioId !== '__default__' ? scenarioId : null,
      difficulty,
      userName: 'Commercial',
      language,
      authToken: token,
      prefetchedToken: prefetchedTokenRef.current,
    };

    if (isRdvPhysique) {
      try {
        await introSequence.play(scenario);
        const result = await liveKit.connect({
          ...connectConfig,
          onPickup: () => introSequence.fadeOutAmbiance(2000),
        });
        prefetchedTokenRef.current = null;
        setSessionDbId(result.sessionDbId);
      } catch (e) {
        prefetchedTokenRef.current = null;
        introSequence.stop();
      }
    } else {
      // Default phone call flow
      await ringTone.play();
      try {
        const result = await liveKit.connect({
          ...connectConfig,
          onPickup: () => ringTone.stop(),
        });
        prefetchedTokenRef.current = null;
        setSessionDbId(result.sessionDbId);
      } catch (e) {
        prefetchedTokenRef.current = null;
        ringTone.stop();
      }
    }
  }

  // End call
  function handleEndCall() {
    ringTone.stop();
    introSequence.stop();
    const duration = liveKit.disconnect();
    const entries = liveKit.transcriptEntries;
    const hadTranscript = entries.length > 0;
    const longEnough = duration > 3000;

    if (hadTranscript && longEnough) {
      setCallDuration(duration);
      setPhase('postcall');
      runEvaluation(duration, entries);
    } else {
      // Short/empty call — stay on call page, reset state
      setPhase('briefing');
    }
  }

  // Progressive JSON parse: extract JSON from potentially dirty text
  function tryProgressiveParse(text) {
    try {
      // Clean markdown fences and surrounding text
      let s = text.replace(/```json/g, '').replace(/```/g, '').trim();
      // Find the first { and last }
      const start = s.indexOf('{');
      const end = s.lastIndexOf('}');
      if (start === -1) return null;

      if (end > start) {
        // We have a complete-looking JSON block — try direct parse
        try {
          const parsed = JSON.parse(s.slice(start, end + 1));
          if (parsed && typeof parsed.score_global === 'number') return parsed;
        } catch {
          // Fall through to progressive close
        }
      }

      // Progressive close: take from first { and close open braces/brackets
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
    // Map elapsed time to steps (each step ~1.5-2.5s, total ~15-25s)
    const timeStep = Math.min(Math.floor(elapsed / 2000), ANALYSIS_STEPS.length - 1);
    // Also advance based on chunk count (fallback for fast/slow responses)
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
      setEvalError('Appel trop court pour être évalué (minimum 3 échanges requis)');
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
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = 'Bearer ' + token;

      const r = await fetch('/api/evaluate/stream', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          session_id: 'free-' + scenarioId + '-' + Date.now(),
          transcript: transcriptArray,
          scenario_id: scenarioId,
          difficulty,
          duration_s: Math.floor(duration / 1000),
          session_db_id: sessionDbId,
          language,
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
        buffer = lines.pop(); // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('event: done')) {
            continue;
          }
          if (line.startsWith('event: error')) {
            continue;
          }
          if (!line.startsWith('data: ')) continue;

          const payload = line.slice(6);
          try {
            const msg = JSON.parse(payload);

            if (msg.type === 'chunk') {
              accumulated += msg.text;
              advanceAnalysis();
              // Try progressive parse
              const partial = tryProgressiveParse(accumulated);
              if (partial) setEvaluation(partial);
            } else if (msg.score_global !== undefined) {
              // Final done event
              const finalData = msg;
              finalizeAnalysis(() => {
                setEvaluation(finalData);
                setEvalLoading(false);
                if (!token) localStorage.setItem('vm-free-used', 'true');
              });
              return;
            } else if (msg.error) {
              setShowAnalysis(false);
              setEvalError(msg.error);
              setEvalLoading(false);
              return;
            }
          } catch {
            // Ignore unparseable lines
          }
        }
      }

      // Stream ended without explicit done event
      if (accumulated) {
        const partial = tryProgressiveParse(accumulated);
        if (partial) {
          finalizeAnalysis(() => {
            setEvaluation(partial);
            setEvalLoading(false);
            if (!token) localStorage.setItem('vm-free-used', 'true');
          });
          return;
        }
      }
      setShowAnalysis(false);
      setEvalLoading(false);
      if (!token) localStorage.setItem('vm-free-used', 'true');

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
    loadScenario(scenarioId);
  }

  // Creator
  function handleShowCreator() {
    if (!token) {
      setSignupOpen(true);
      return;
    }
    setPhase('creator');
  }

  function handleLaunchScenario(newId) {
    navigate('/simulation?scenario=' + encodeURIComponent(newId));
    loadScenario(newId);
  }

  const persona = scenario?.persona?.identite || null;
  const brief = scenario?.brief_commercial || {};

  // Compute elapsed seconds from timer string (MM:SS) for phase indicator
  const elapsedSeconds = (() => {
    const parts = liveKit.timer.split(':');
    if (parts.length !== 2) return 0;
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  })();

  return (
    <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto', padding: '32px 24px', minHeight: '100vh' }}>
      {/* Background gradients */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: isRdvPhysique && phase === 'call'
          ? 'radial-gradient(ellipse at center, rgba(20,30,50,0.8) 0%, #080D1A 70%)'
          : `radial-gradient(ellipse at 15% -10%, ${c.ac}12 0%, transparent 55%), radial-gradient(ellipse at 85% 110%, ${c.bl}0A 0%, transparent 55%)`,
      }} />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `linear-gradient(135deg, ${c.ac}, ${c.acL})`,
            display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 16, color: '#fff',
            boxShadow: `0 2px 16px ${c.acD}`,
          }}>VM</div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>
            Vend<span style={{ color: c.ac }}>Mieux</span>
          </div>
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, letterSpacing: -0.3 }}>
          {phase === 'loading' ? 'Chargement...' : brief.titre || 'Simulation libre'}
        </div>
        <div style={{ color: c.mt, fontSize: 14 }}>
          Simulation FORCE 3D — Entraînement commercial par IA
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 20,
          fontSize: 12, fontWeight: 600,
          background: c.acD, border: `1px solid ${c.ac}33`, color: c.ac, marginTop: 12,
        }}>
          Mode libre
        </div>

        {/* Nav buttons */}
        {phase !== 'loading' && (
          <div style={{ marginTop: 12 }}>
            <button onClick={handleShowCreator} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 20,
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              background: 'transparent', border: `1px solid ${c.ac}`, color: c.ac, fontFamily: 'inherit',
            }}>+ Créer un scénario</button>
          </div>
        )}
      </div>

      {/* Content based on phase */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Loading */}
        {phase === 'loading' && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{
              display: 'inline-block', width: 36, height: 36,
              border: `3px solid ${c.bd}`, borderTopColor: c.ac,
              borderRadius: '50%', animation: 'spin 0.6s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error */}
        {phase === 'error' && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <div style={{ fontSize: 16, color: c.mt }}>{errorMsg || 'Lien invalide ou expiré.'}</div>
          </div>
        )}

        {/* Briefing */}
        {phase === 'briefing' && scenario && (
          <SimBriefing
            scenario={scenario}
            language={language}
            difficulty={difficulty}
            onLanguageChange={setLanguage}
            onDifficultyChange={setDifficulty}
            onLaunch={handleLaunch}
          />
        )}

        {/* Call */}
        {phase === 'call' && (
          <SimCall
            persona={persona}
            status={introSequence.isPlaying ? 'intro' : liveKit.status}
            statusMsg={introSequence.isPlaying ? 'Arrivée dans les locaux...' : liveKit.statusMsg}
            timer={liveKit.timer}
            muted={liveKit.muted}
            transcriptEntries={liveKit.transcriptEntries}
            pendingSegments={liveKit.pendingSegments}
            onStart={handleStartCall}
            onMute={liveKit.toggleMute}
            onStop={handleEndCall}
            isRdvPhysique={isRdvPhysique}
            scenario={scenario}
            elapsedSeconds={elapsedSeconds}
          />
        )}

        {/* Post-call */}
        {phase === 'postcall' && (
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
                isFreeMode={isFreeMode}
              />
            )}
          </SimPostCall>
        )}

        {/* Creator */}
        {phase === 'creator' && (
          <SimScenarioCreator
            language={language}
            onBack={() => setPhase(scenario ? 'briefing' : 'loading')}
            onLaunchScenario={handleLaunchScenario}
          />
        )}
      </div>

      {/* Post-call action buttons */}
      {phase === 'postcall' && (
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 28 }}>
          {evaluation && evaluation.eval_id && token && (
            <a href={'/debrief?session=' + evaluation.eval_id} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '12px 24px', borderRadius: 6, border: 'none',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
              background: `linear-gradient(135deg, ${c.ac}, ${c.acL})`, color: '#fff',
              boxShadow: `0 4px 16px ${c.acD}`, fontFamily: 'inherit',
            }}>📊 Voir le débrief complet</a>
          )}
          <button onClick={handleRestart} style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '12px 24px', borderRadius: 6,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            background: evaluation && evaluation.eval_id && token ? 'transparent' : `linear-gradient(135deg, ${c.ac}, ${c.acL})`,
            color: evaluation && evaluation.eval_id && token ? c.mt : '#fff',
            border: evaluation && evaluation.eval_id && token ? `1px solid ${c.bd}` : 'none',
            boxShadow: evaluation && evaluation.eval_id && token ? 'none' : `0 4px 16px ${c.acD}`,
            fontFamily: 'inherit',
          }}>🔄 Nouvelle session</button>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '40px 20px', borderTop: `1px solid ${c.bd}`, marginTop: 40 }}>
        <div style={{ color: c.mt, fontSize: 14, marginBottom: 12 }}>
          Cette simulation est propulsée par l'IA VendMieux
        </div>
        <div style={{ color: c.ac, fontSize: 16, fontWeight: 700 }}>
          Vous voulez ça pour vos étudiants ? Contactez-nous
        </div>
      </div>

      {/* Analysis modal */}
      {showAnalysis && (
        <AnalysisModal
          progress={analysisProgress}
          currentStep={analysisStep}
          done={analysisDone}
        />
      )}

      {/* Signup modal */}
      <SimSignupModal
        open={signupOpen || conversionModalOpen}
        onClose={() => { setSignupOpen(false); setConversionModalOpen(false); }}
        onLogin={() => { window.location.href = '/login'; }}
      />
    </div>
  );
}
