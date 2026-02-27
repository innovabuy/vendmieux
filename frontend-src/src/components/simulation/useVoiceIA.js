/**
 * useVoiceIA — Voice connection hook for Visite Client (LiveKit / STT / TTS)
 * Returns: { status, connect, disconnect }
 * Stub: returns idle state. Full implementation in Step 3.
 */
import { useState, useCallback } from "react";

export default function useVoiceIA() {
  const [status, setStatus] = useState("idle"); // idle | connecting | connected | error

  const connect = useCallback(() => {
    setStatus("connecting");
    // Full LiveKit integration in Step 3
  }, []);

  const disconnect = useCallback(() => {
    setStatus("idle");
  }, []);

  return { status, connect, disconnect };
}
