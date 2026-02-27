/**
 * VCEndScreen — End-of-session results overlay with FORCE 3D scores
 * @param {boolean} visible - Whether overlay is shown
 * @param {string} title - Result headline
 * @param {string} subtitle - Duration/scenario summary
 * @param {Array} scores - Array of { label, value, level } for FORCE grid
 * @param {function} onReplay - Callback for replay button
 * @param {function} onNewScenario - Callback for new scenario button
 * Stub: renders nothing. Full implementation in Step 4.
 */
import React from "react";

export default function VCEndScreen({ visible = false, title, subtitle, scores, onReplay, onNewScenario }) {
  if (!visible) return null;
  return null;
}
