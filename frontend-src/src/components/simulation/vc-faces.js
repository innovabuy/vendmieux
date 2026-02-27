/**
 * vc-faces.js — Generative SVG avatar system for Visite Client
 * makeFace(cfg) returns an SVG string for a portrait.
 * FACE_PRESETS maps role keys to color configs.
 */

export function makeFace(cfg) {
  const { skin, hair, suit, tie, size = 110 } = cfg;
  const r = size / 2;
  return `<svg width="${size}" height="${size + 50}" viewBox="0 0 ${size} ${size + 50}" xmlns="http://www.w3.org/2000/svg">
    <!-- Corps/costume -->
    <ellipse cx="${r}" cy="${size + 35}" rx="${r * 0.85}" ry="${r * 0.6}" fill="${suit}" opacity="0.9"/>
    <!-- Col chemise -->
    <polygon points="${r - 8},${size * 0.88} ${r},${size * 0.78} ${r + 8},${size * 0.88} ${r + 4},${size + 10} ${r - 4},${size + 10}" fill="#F0EDE4" opacity="0.7"/>
    <!-- Cravate -->
    <polygon points="${r - 3},${size * 0.82} ${r + 3},${size * 0.82} ${r + 5},${size * 0.98} ${r - 5},${size * 0.98}" fill="${tie}" opacity="0.8"/>
    <!-- Visage -->
    <ellipse cx="${r}" cy="${r * 0.85}" rx="${r * 0.6}" ry="${r * 0.68}" fill="${skin}"/>
    <!-- Cheveux -->
    <ellipse cx="${r}" cy="${r * 0.38}" rx="${r * 0.62}" ry="${r * 0.42}" fill="${hair}"/>
    <!-- Oreilles -->
    <ellipse cx="${r * 0.38}" cy="${r * 0.85}" rx="${r * 0.09}" ry="${r * 0.12}" fill="${skin}"/>
    <ellipse cx="${r * 1.62}" cy="${r * 0.85}" rx="${r * 0.09}" ry="${r * 0.12}" fill="${skin}"/>
    <!-- Yeux -->
    <ellipse cx="${r * 0.72}" cy="${r * 0.82}" rx="${r * 0.1}" ry="${r * 0.07}" fill="#1A1010"/>
    <ellipse cx="${r * 1.28}" cy="${r * 0.82}" rx="${r * 0.1}" ry="${r * 0.07}" fill="#1A1010"/>
    <circle cx="${r * 0.69}" cy="${r * 0.80}" r="${r * 0.03}" fill="#FFF" opacity="0.7"/>
    <circle cx="${r * 1.25}" cy="${r * 0.80}" r="${r * 0.03}" fill="#FFF" opacity="0.7"/>
    <!-- Sourcils -->
    <path d="M${r * 0.62},${r * 0.73} Q${r * 0.72},${r * 0.69} ${r * 0.82},${r * 0.73}" stroke="${hair}" stroke-width="${r * 0.04}" fill="none" opacity="0.8"/>
    <path d="M${r * 1.18},${r * 0.73} Q${r * 1.28},${r * 0.69} ${r * 1.38},${r * 0.73}" stroke="${hair}" stroke-width="${r * 0.04}" fill="none" opacity="0.8"/>
    <!-- Nez -->
    <path d="M${r},${r * 0.88} Q${r * 0.9},${r * 0.98} ${r},${r * 1.0} Q${r * 1.1},${r * 0.98} ${r},${r * 0.88}" stroke="${skin}" stroke-width="${r * 0.04}" fill="none" opacity="0.6"/>
    <!-- Bouche -->
    <path d="M${r * 0.78},${r * 1.06} Q${r},${r * 1.14} ${r * 1.22},${r * 1.06}" stroke="#8A5040" stroke-width="${r * 0.04}" fill="none" opacity="0.7"/>
  </svg>`;
}

export const FACE_PRESETS = {
  exec:       { skin: '#C8A070', hair: '#2A1A10', suit: '#1A1C2A', tie: '#8A3030' },
  commercial: { skin: '#B88060', hair: '#1C1410', suit: '#1C2840', tie: '#2A4A6A' },
  rh:         { skin: '#D4A880', hair: '#8A3020', suit: '#281A30', tie: '#6A2A4A' },
  daf:        { skin: '#A07050', hair: '#1A1818', suit: '#101C10', tie: '#1A3A1A' },
  site:       { skin: '#B87850', hair: '#302010', suit: '#201A10', tie: '#403010' },
};
