/**
 * VCSpeechBubble — Speech bubble for a participant
 * @param {string} personId - Participant id
 * @param {string} text - Dialogue text
 * @param {string} speaker - Speaker display name
 * @param {string} color - Accent color
 * @param {string} position - 'top' | 'left' | 'right'
 * @param {boolean} visible - Whether bubble is shown
 * Stub: renders nothing. Full implementation in Step 3.
 */
import React from "react";

export default function VCSpeechBubble({ personId, text, speaker, color, position = "top", visible = false }) {
  if (!visible) return null;
  return <div className={`vc-bubble pos-${position}`}>{/* Bubble content in Step 3 */}</div>;
}
