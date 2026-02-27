/**
 * VCPersonAvatar — Single participant portrait (SVG face + nameplate)
 * @param {string} preset - Key from FACE_PRESETS ('exec' | 'commercial' | 'rh' | 'daf' | 'site')
 * @param {number} size - Portrait diameter in px (default 110)
 * @param {boolean} speaking - Whether this person is currently speaking
 * @param {string} color - Accent color for ring/glow
 * Stub: renders colored circle placeholder. Full implementation in Step 2.
 */
import React from "react";

export default function VCPersonAvatar({ preset, size = 110, speaking = false, color = "#C8973A" }) {
  return (
    <div className="vc-portrait-wrap" style={{ width: size, height: size }}>
      <div
        style={{
          width: size, height: size, borderRadius: "50%",
          background: color + "33", border: `2px solid ${color}44`,
        }}
      />
    </div>
  );
}
