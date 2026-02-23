import { useRef, useEffect, useCallback } from 'react';

export function useRingTone() {
  const audioRef = useRef(null);
  const preloadedRef = useRef(false);

  // Preload the audio file on mount
  useEffect(() => {
    if (preloadedRef.current) return;
    preloadedRef.current = true;
    const audio = new Audio('/static/sounds/phone-ring.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const play = useCallback(async () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/static/sounds/phone-ring.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4;
    }
    try {
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
    } catch (e) {
      console.warn('Ring tone failed:', e);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return { play, stop };
}
