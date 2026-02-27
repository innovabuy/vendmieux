/**
 * useSpeaker — Speaker management hook for dialogue and cross-talk
 * Returns: { currentSpeaker, say, crossTalk }
 * Stub: returns null speaker. Full implementation in Step 3.
 */
import { useState, useCallback } from "react";

export default function useSpeaker() {
  const [currentSpeaker, setCurrentSpeaker] = useState(null);

  const say = useCallback((personId) => {
    // Trigger dialogue for person — Step 3
    setCurrentSpeaker(personId);
  }, []);

  const crossTalk = useCallback((fromId, toId) => {
    // Trigger cross-talk line + bubble — Step 3
    setCurrentSpeaker(fromId);
  }, []);

  return { currentSpeaker, say, crossTalk };
}
