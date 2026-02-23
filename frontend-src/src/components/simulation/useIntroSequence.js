import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Hook for the "office immersion" intro sequence used by rdv_physique scenarios.
 *
 * Flow:
 *   ambiance (loop, low volume)
 *   → 1.5s pause
 *   → TTS "Bonjour, vous avez rendez-vous avec M. Bertrand ? Un instant."
 *   → 1s silence
 *   → door_open.mp3
 *   → 0.5s silence
 *   → TTS "M. Bertrand vous reçoit, installez-vous."
 *   → 0.5s pause
 *   → caller connects LiveKit
 *   → caller calls fadeOutAmbiance() when agent speaks
 */

async function fetchTTS(text) {
  const r = await fetch('/api/tts/intro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!r.ok) throw new Error('TTS failed');
  const data = await r.json();
  return data.url;
}

function playAudioPromise(src, { volume = 1, loop = false } = {}) {
  return new Promise((resolve, reject) => {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.loop = loop;
    audio.onended = () => resolve(audio);
    audio.onerror = (e) => reject(e);
    audio.play().then(() => {
      if (loop) resolve(audio); // resolve immediately for looping audio
    }).catch(reject);
  });
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener('abort', () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
    }
  });
}

export function useIntroSequence() {
  const [isPlaying, setIsPlaying] = useState(false);
  const abortRef = useRef(null);
  const ambianceRef = useRef(null);
  const audiosRef = useRef([]); // track all audio elements for cleanup

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      audiosRef.current.forEach(a => { a.pause(); a.src = ''; });
      audiosRef.current = [];
      if (ambianceRef.current) {
        ambianceRef.current.pause();
        ambianceRef.current.src = '';
        ambianceRef.current = null;
      }
    };
  }, []);

  const play = useCallback(async (scenario) => {
    // Abort any previous sequence
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;

    setIsPlaying(true);

    try {
      // Determine prospect name and civilité
      const identite = scenario?.persona?.identite || {};
      const nom = identite.nom || 'le prospect';
      const genre = identite.genre || 'M';
      const civilite = genre === 'F' ? 'Madame' : 'Monsieur';

      // Get custom intro texts or build defaults
      const introData = scenario?.intro_assistante || {};
      const accueilText = introData.accueil ||
        `Bonjour, vous avez rendez-vous avec ${civilite.toLowerCase() === 'madame' ? 'madame' : 'monsieur'} ${nom} ? Un instant je vous prie.`;
      const introductionText = introData.introduction ||
        `${civilite} ${nom} vous reçoit, installez-vous.`;

      // Pre-fetch both TTS clips in parallel
      const [accueilUrl, introUrl] = await Promise.all([
        fetchTTS(accueilText),
        fetchTTS(introductionText),
      ]);

      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

      // 1. Start office ambiance (loop, low volume)
      const ambiance = new Audio('/static/sounds/office_ambiance.mp3');
      ambiance.loop = true;
      ambiance.volume = 0.15;
      ambianceRef.current = ambiance;
      audiosRef.current.push(ambiance);
      await ambiance.play();

      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

      // 2. Wait 1.5s immersion
      await sleep(1500, signal);

      // 3. Play TTS accueil
      const accueilAudio = await playAudioPromise(accueilUrl, { volume: 0.85 });
      audiosRef.current.push(accueilAudio);

      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

      // 4. 1s silence
      await sleep(1000, signal);

      // 5. Play door open sound
      const doorAudio = await playAudioPromise('/static/sounds/door_open.mp3', { volume: 0.7 });
      audiosRef.current.push(doorAudio);

      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

      // 6. 0.5s silence
      await sleep(500, signal);

      // 7. Play TTS introduction
      const introAudio = await playAudioPromise(introUrl, { volume: 0.85 });
      audiosRef.current.push(introAudio);

      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

      // 8. 0.5s pause before caller connects LiveKit
      await sleep(500, signal);

      setIsPlaying(false);
    } catch (e) {
      setIsPlaying(false);
      if (e.name === 'AbortError') return; // normal cancellation
      throw e;
    }
  }, []);

  const fadeOutAmbiance = useCallback((durationMs = 2000) => {
    const audio = ambianceRef.current;
    if (!audio) return;
    const startVol = audio.volume;
    const steps = 20;
    const interval = durationMs / steps;
    const decrement = startVol / steps;
    let step = 0;
    const id = setInterval(() => {
      step++;
      audio.volume = Math.max(0, startVol - decrement * step);
      if (step >= steps) {
        clearInterval(id);
        audio.pause();
        audio.src = '';
        ambianceRef.current = null;
      }
    }, interval);
  }, []);

  const stop = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    audiosRef.current.forEach(a => { a.pause(); a.src = ''; });
    audiosRef.current = [];
    if (ambianceRef.current) {
      ambianceRef.current.pause();
      ambianceRef.current.src = '';
      ambianceRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  return { play, stop, fadeOutAmbiance, isPlaying };
}
