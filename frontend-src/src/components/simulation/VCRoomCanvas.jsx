/**
 * VCRoomCanvas — Renders SVG room background for Visite Client
 * @param {string} roomId - Key from ROOMS ('bureau-pdg' | 'salle-reunion' | 'usine')
 * Stub: renders empty canvas. Full implementation in Step 2.
 */
import React from "react";

export default function VCRoomCanvas({ roomId }) {
  return (
    <div className="vc-canvas">
      <svg viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
        {/* Room SVG will be injected here in Step 2 */}
      </svg>
      <div className="vc-vignette" />
      <div className="vc-depth-top" />
    </div>
  );
}
