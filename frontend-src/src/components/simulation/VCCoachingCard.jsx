/**
 * VCCoachingCard — Coaching tip card (bottom-right HUD)
 * @param {string} type - 'tip' | 'good' | 'warn' | 'alert'
 * @param {string} label - Short label
 * @param {string} msg - Coaching message text
 * @param {boolean} visible - Whether card is shown
 * Stub: renders nothing. Full implementation in Step 3.
 */
import React from "react";

export default function VCCoachingCard({ type, label, msg, visible = false }) {
  if (!visible) return null;
  return null;
}
