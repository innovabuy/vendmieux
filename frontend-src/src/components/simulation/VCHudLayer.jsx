/**
 * VCHudLayer — HUD overlay (timer, phase, metrics, coaching, focus, consensus, tension)
 * @param {number} timer - Elapsed seconds
 * @param {string} phase - Current phase label
 * @param {{ interest: number, trust: number, resistance: number }} metrics
 * @param {{ type: string, label: string, msg: string }|null} coaching - Active coaching card
 * @param {{ name: string, color: string }|null} focus - Currently speaking person
 * @param {Array} consensus - Array of { id, status } for consensus dots
 * @param {number} tension - 0-100 tension value
 * Stub: renders nothing. Full implementation in Step 3.
 */
import React from "react";

export default function VCHudLayer({ timer, phase, metrics, coaching, focus, consensus, tension }) {
  return null;
}
