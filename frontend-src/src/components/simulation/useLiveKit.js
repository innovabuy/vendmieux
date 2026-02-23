import { useRef, useState, useCallback, useEffect } from 'react';

// Preload livekit-client module as soon as this module is imported (warm cache)
const livekitPreload = import('livekit-client');

export function useLiveKit() {
  const roomRef = useRef(null);
  const timerRef = useRef(null);
  const t0Ref = useRef(null);
  const localIdentityRef = useRef(null);

  const [status, setStatus] = useState('idle'); // idle | connecting | ringing | connected | error
  const [statusMsg, setStatusMsg] = useState('');
  const [timer, setTimer] = useState('00:00');
  const [muted, setMuted] = useState(false);
  const [transcriptEntries, setTranscriptEntries] = useState([]);
  const [pendingSegments, setPendingSegments] = useState({});

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Remove any audio elements added by livekit
      document.querySelectorAll('audio[data-lk-sim]').forEach(e => e.remove());
    };
  }, []);

  const handleTranscription = useCallback((segments, participant) => {
    if (!segments || !segments.length) return;
    const isAgent = participant && participant.identity !== localIdentityRef.current;
    const who = isAgent ? 'agent' : 'user';

    const newEntries = [];
    const pendingUpdates = {};
    const pendingDeletes = [];

    for (const seg of segments) {
      const text = seg.text || seg.final || '';
      if (!text.trim()) continue;
      const segId = seg.id || seg.sid || (who + '-' + Date.now());

      if (seg.final !== undefined ? seg.final : seg.isFinal) {
        pendingDeletes.push(segId);
        newEntries.push({ who, text: text.trim(), time: t0Ref.current ? Date.now() - t0Ref.current : 0 });
      } else {
        pendingUpdates[segId] = { who, text: text.trim() };
      }
    }

    if (newEntries.length > 0) {
      setTranscriptEntries(prev => [...prev, ...newEntries]);
    }
    if (pendingDeletes.length > 0 || Object.keys(pendingUpdates).length > 0) {
      setPendingSegments(prev => {
        const next = { ...prev, ...pendingUpdates };
        for (const id of pendingDeletes) delete next[id];
        return next;
      });
    }
  }, []);

  const connect = useCallback(async ({ tokenUrl, scenarioId, difficulty, userName, language, authToken, onPickup, prefetchedToken }) => {
    setStatus('connecting');
    setStatusMsg('Appel en cours...');
    setTranscriptEntries([]);
    setPendingSegments({});
    setMuted(false);

    try {
      // Parallel: fetch token (or use prefetched) + import livekit-client
      const tokenPromise = prefetchedToken
        ? Promise.resolve(prefetchedToken)
        : (async () => {
            const headers = { 'Content-Type': 'application/json' };
            if (authToken) headers['Authorization'] = 'Bearer ' + authToken;
            const r = await fetch(tokenUrl, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                scenario_id: scenarioId !== '__default__' ? scenarioId : null,
                difficulty,
                user_name: userName,
                language,
              }),
            });
            if (!r.ok) throw new Error('Erreur serveur (token)');
            return r.json();
          })();

      const [tk, LivekitClient] = await Promise.all([
        tokenPromise,
        import('livekit-client'),
      ]);

      localIdentityRef.current = tk.identity;
      const sessionDbId = tk.session_db_id || null;

      const room = new LivekitClient.Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      room.on(LivekitClient.RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === 'audio') {
          onPickup?.();
          const el = track.attach();
          el.setAttribute('data-lk-sim', 'true');
          document.body.appendChild(el);
          setStatus('connected');
          setStatusMsg('En communication');
        }
      });

      room.on(LivekitClient.RoomEvent.Disconnected, () => {
        disconnect();
      });

      room.on(LivekitClient.RoomEvent.TranscriptionReceived, (segments, participant) => {
        handleTranscription(segments, participant);
      });

      await room.connect(tk.url, tk.token);

      setStatusMsg('Activation du micro...');
      await room.localParticipant.setMicrophoneEnabled(true);

      setStatus('ringing');
      setStatusMsg('Ça sonne...');

      const hasAgent = Array.from(room.remoteParticipants.values()).length > 0;
      if (hasAgent) {
        setStatus('connected');
        setStatusMsg('En communication');
      } else {
        room.on(LivekitClient.RoomEvent.ParticipantConnected, () => {
          setStatus('connected');
          setStatusMsg('En communication');
        });
      }

      t0Ref.current = Date.now();
      timerRef.current = setInterval(() => {
        if (!t0Ref.current) return;
        const s = Math.floor((Date.now() - t0Ref.current) / 1000);
        setTimer(String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'));
      }, 1000);

      return { sessionDbId };
    } catch (e) {
      setStatus('error');
      setStatusMsg('Erreur : ' + e.message);
      throw e;
    }
  }, [handleTranscription]);

  const disconnect = useCallback(() => {
    const duration = t0Ref.current ? Date.now() - t0Ref.current : 0;
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    document.querySelectorAll('audio[data-lk-sim]').forEach(e => e.remove());
    setStatus('idle');
    return duration;
  }, []);

  const toggleMute = useCallback(() => {
    if (!roomRef.current) return;
    setMuted(prev => {
      const next = !prev;
      roomRef.current.localParticipant.setMicrophoneEnabled(!next);
      return next;
    });
  }, []);

  const getTranscriptEntries = useCallback(() => {
    // Return current entries (for evaluation submission)
    // We use a ref-based getter because state may be stale in callbacks
    return null; // Caller should use the state directly
  }, []);

  return {
    status,
    statusMsg,
    timer,
    muted,
    transcriptEntries,
    pendingSegments,
    connect,
    disconnect,
    toggleMute,
    t0Ref,
  };
}
