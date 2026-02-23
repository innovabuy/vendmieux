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

  // Launch simulation
  function handleLaunch() {
    // Check free-use wall for anonymous users
    if (!token) {
      if (localStorage.getItem('vm-free-used') === 'true') {
        setSignupOpen(true);
        return;
      }
    }
    setPhase('call');
    // Pre-fetch token while user sees the call UI
    prefetchToken();
  }

  // Detect rdv_physique scenario type
  const isRdvPhysique = scenario?.simulation?.type === 'rdv_physique'
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

  // Progressive JSON parse: try to close open braces/brackets and parse
  function tryProgressiveParse(text) {
    try {
      let s = text.trim();
      // Strip markdown code fence if present
      if (s.startsWith('```')) {
        s = s.replace(/^```(?:json)?\n?/, '');
        s = s.replace(/```\s*$/, '');
      }
      // Remove trailing comma before closing
      s = s.replace(/,\s*$/, '');
      // Count open braces/brackets
      let braces = 0, brackets = 0;
      for (const ch of s) {
        if (ch === '{') braces++;
        else if (ch === '}') braces--;
        else if (ch === '[') brackets++;
        else if (ch === ']') brackets--;
      }
      // Close open brackets then braces
      // First, remove any trailing comma before we close
      s = s.replace(/,\s*$/, '');
      for (let i = 0; i < brackets; i++) s += ']';
      for (let i = 0; i < braces; i++) s += '}';
      const parsed = JSON.parse(s);
      // Only return if we have score_global (meaningful partial data)
      if (parsed && typeof parsed.score_global === 'number') return parsed;
      return null;
    } catch {
      return null;
    }
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
            // Next data line contains the final evaluation
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
              // Try progressive parse
              const partial = tryProgressiveParse(accumulated);
              if (partial) setEvaluation(partial);
            } else if (msg.score_global !== undefined) {
              // This is the final "done" event payload
              setEvaluation(msg);
              setEvalLoading(false);
              if (!token) localStorage.setItem('vm-free-used', 'true');
              return;
            } else if (msg.error) {
              // This is the "error" event payload
              setEvalError(msg.error);
              setEvalLoading(false);
              return;
            }
          } catch {
            // Ignore unparseable lines
          }
        }
      }

      // If we reach here without a done event, use accumulated text
      if (accumulated) {
        const partial = tryProgressiveParse(accumulated);
        if (partial) setEvaluation(partial);
      }
      setEvalLoading(false);
      if (!token) localStorage.setItem('vm-free-used', 'true');

    } catch (e) {
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

  return (
    <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto', padding: '32px 24px', minHeight: '100vh' }}>
      {/* Background gradients */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(ellipse at 15% -10%, ${c.ac}12 0%, transparent 55%), radial-gradient(ellipse at 85% 110%, ${c.bl}0A 0%, transparent 55%)`,
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

      {/* New session button (post-call) */}
      {phase === 'postcall' && (
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28 }}>
          <button onClick={handleRestart} style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '12px 24px', borderRadius: 6, border: 'none',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            background: `linear-gradient(135deg, ${c.ac}, ${c.acL})`, color: '#fff',
            boxShadow: `0 4px 16px ${c.acD}`, fontFamily: 'inherit',
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

      {/* Signup modal */}
      <SimSignupModal
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        onLogin={() => {
          setSignupOpen(false);
          navigate('/app/login');
        }}
      />
    </div>
  );
}
