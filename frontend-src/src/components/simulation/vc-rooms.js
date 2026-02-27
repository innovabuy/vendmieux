/**
 * vc-rooms.js — SVG room definitions for Visite Client simulation
 * 3 rooms: bureau-pdg, salle-reunion, usine
 * Each room is an SVG fragment (no wrapping <svg>) to be injected into a viewBox="0 0 1440 900" container.
 */

export const ROOMS = {

  'bureau-pdg': `
    <defs>
      <linearGradient id="wallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1A1208"/>
        <stop offset="100%" stop-color="#261A0C"/>
      </linearGradient>
      <linearGradient id="floorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1E1510"/>
        <stop offset="100%" stop-color="#0E0A06"/>
      </linearGradient>
      <linearGradient id="ceilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#100C06"/>
        <stop offset="100%" stop-color="#1A1208"/>
      </linearGradient>
      <linearGradient id="lightBeam" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stop-color="#FFE5A0" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="#C89040" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="winLight" cx="50%" cy="0%" r="80%">
        <stop offset="0%" stop-color="#FFF0C0" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#C89040" stop-opacity="0"/>
      </radialGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <!-- Plafond -->
    <polygon points="0,0 1440,0 1100,200 340,200" fill="url(#ceilGrad)"/>
    <!-- Mur gauche -->
    <polygon points="0,0 340,200 340,700 0,900" fill="#1C1408"/>
    <!-- Mur droit -->
    <polygon points="1440,0 1100,200 1100,700 1440,900" fill="#1A1206"/>
    <!-- Mur du fond -->
    <polygon points="340,200 1100,200 1100,700 340,700" fill="url(#wallGrad)"/>
    <!-- Sol parquet -->
    <polygon points="0,900 1440,900 1100,700 340,700" fill="url(#floorGrad)"/>

    <!-- Lambris fond -->
    <rect x="340" y="580" width="760" height="4" fill="#2A1E10" opacity="0.8"/>
    <rect x="340" y="580" width="760" height="120" fill="#1E1408" opacity="0.5"/>
    <!-- Moulures -->
    <rect x="340" y="200" width="760" height="2" fill="rgba(200,151,58,0.2)"/>
    <rect x="340" y="580" width="760" height="1.5" fill="rgba(200,151,58,0.15)"/>
    <rect x="340" y="698" width="760" height="2" fill="rgba(200,151,58,0.12)"/>
    <!-- Moulures verticales fond -->
    <line x1="520" y1="200" x2="520" y2="700" stroke="rgba(200,151,58,0.1)" stroke-width="1"/>
    <line x1="720" y1="200" x2="720" y2="700" stroke="rgba(200,151,58,0.1)" stroke-width="1"/>
    <line x1="920" y1="200" x2="920" y2="700" stroke="rgba(200,151,58,0.1)" stroke-width="1"/>

    <!-- Fenêtre lumière gauche -->
    <rect x="380" y="220" width="100" height="320" fill="rgba(255,230,150,0.07)" rx="2"/>
    <rect x="380" y="220" width="100" height="320" fill="none" stroke="rgba(200,151,58,0.15)" stroke-width="1" rx="2"/>
    <line x1="430" y1="220" x2="430" y2="540" stroke="rgba(200,151,58,0.1)" stroke-width="0.8"/>
    <line x1="380" y1="380" x2="480" y2="380" stroke="rgba(200,151,58,0.1)" stroke-width="0.8"/>
    <!-- Rayon lumière fenêtre -->
    <polygon points="380,220 480,220 620,700 240,700" fill="url(#lightBeam)"/>

    <!-- Fenêtre lumière droite -->
    <rect x="960" y="220" width="100" height="320" fill="rgba(255,230,150,0.06)" rx="2"/>
    <rect x="960" y="220" width="100" height="320" fill="none" stroke="rgba(200,151,58,0.12)" stroke-width="1" rx="2"/>
    <line x1="1010" y1="220" x2="1010" y2="540" stroke="rgba(200,151,58,0.08)" stroke-width="0.8"/>
    <line x1="960" y1="380" x2="1060" y2="380" stroke="rgba(200,151,58,0.08)" stroke-width="0.8"/>

    <!-- Tableau/cadre fond -->
    <rect x="610" y="250" width="220" height="160" fill="#160E04" stroke="rgba(200,151,58,0.2)" stroke-width="1.5" rx="2"/>
    <rect x="618" y="258" width="204" height="144" fill="#0E0802" opacity="0.7"/>

    <!-- Lignes parquet sol -->
    <line x1="340" y1="700" x2="0" y2="900" stroke="rgba(200,151,58,0.04)" stroke-width="1"/>
    <line x1="500" y1="700" x2="160" y2="900" stroke="rgba(200,151,58,0.04)" stroke-width="1"/>
    <line x1="660" y1="700" x2="320" y2="900" stroke="rgba(200,151,58,0.04)" stroke-width="1"/>
    <line x1="820" y1="700" x2="480" y2="900" stroke="rgba(200,151,58,0.04)" stroke-width="1"/>
    <line x1="980" y1="700" x2="640" y2="900" stroke="rgba(200,151,58,0.03)" stroke-width="1"/>
    <line x1="1100" y1="700" x2="800" y2="900" stroke="rgba(200,151,58,0.03)" stroke-width="1"/>

    <!-- Table bureau -->
    <ellipse cx="720" cy="760" rx="320" ry="35" fill="#1C1408" stroke="rgba(200,151,58,0.18)" stroke-width="1"/>
    <ellipse cx="720" cy="760" rx="320" ry="35" fill="none" stroke="rgba(200,151,58,0.08)" stroke-width="0.5"/>
    <!-- Reflet table -->
    <ellipse cx="720" cy="760" rx="200" ry="12" fill="rgba(200,151,58,0.05)"/>

    <!-- Spots plafond -->
    <circle cx="520" cy="165" r="6" fill="rgba(255,230,160,0.15)" filter="url(#glow)"/>
    <circle cx="720" cy="155" r="7" fill="rgba(255,230,160,0.18)" filter="url(#glow)"/>
    <circle cx="920" cy="165" r="6" fill="rgba(255,230,160,0.15)" filter="url(#glow)"/>
    <!-- Lumière centrale -->
    <ellipse cx="720" cy="155" rx="180" ry="60" fill="rgba(255,230,150,0.06)"/>
  `,

  'salle-reunion': `
    <defs>
      <linearGradient id="wallR" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0E1520"/>
        <stop offset="100%" stop-color="#182030"/>
      </linearGradient>
      <linearGradient id="floorR" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0A0E16"/>
        <stop offset="50%" stop-color="#10162A"/>
        <stop offset="100%" stop-color="#0A0E16"/>
      </linearGradient>
      <linearGradient id="tableR" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1E2840"/>
        <stop offset="100%" stop-color="#0E1428"/>
      </linearGradient>
      <radialGradient id="screenGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#4A7FA0" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#4A7FA0" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <!-- Plafond -->
    <polygon points="0,0 1440,0 1080,190 360,190" fill="#090D14"/>
    <!-- Murs -->
    <polygon points="0,0 360,190 360,690 0,900" fill="#0C1018"/>
    <polygon points="1440,0 1080,190 1080,690 1440,900" fill="#0A0E16"/>
    <polygon points="360,190 1080,190 1080,690 360,690" fill="url(#wallR)"/>
    <!-- Sol -->
    <polygon points="0,900 1440,900 1080,690 360,690" fill="url(#floorR)"/>

    <!-- Ecran de projection fond -->
    <rect x="500" y="215" width="440" height="280" fill="#0A0F1C" rx="4" stroke="rgba(74,127,160,0.25)" stroke-width="1.5"/>
    <rect x="500" y="215" width="440" height="280" fill="url(#screenGlow)" rx="4"/>
    <!-- Contenu écran stylisé -->
    <text x="720" y="305" text-anchor="middle" fill="rgba(74,127,160,0.4)" font-family="serif" font-size="18" font-style="italic">VendMieux</text>
    <line x1="560" y1="330" x2="880" y2="330" stroke="rgba(74,127,160,0.15)" stroke-width="1"/>
    <rect x="560" y="345" width="180" height="4" fill="rgba(74,127,160,0.1)" rx="2"/>
    <rect x="560" y="358" width="240" height="4" fill="rgba(74,127,160,0.07)" rx="2"/>
    <rect x="560" y="371" width="140" height="4" fill="rgba(74,127,160,0.07)" rx="2"/>
    <!-- Reflet écran sur table -->
    <ellipse cx="720" cy="700" rx="160" ry="20" fill="rgba(74,127,160,0.06)"/>

    <!-- Moulures horizontales -->
    <line x1="360" y1="190" x2="1080" y2="190" stroke="rgba(74,127,160,0.12)" stroke-width="1"/>
    <line x1="360" y1="480" x2="1080" y2="480" stroke="rgba(74,127,160,0.07)" stroke-width="0.8"/>
    <line x1="360" y1="688" x2="1080" y2="688" stroke="rgba(74,127,160,0.1)" stroke-width="1"/>

    <!-- Baies vitrées côtés -->
    <rect x="365" y="200" width="90" height="380" fill="rgba(74,127,160,0.04)" rx="2"/>
    <rect x="365" y="200" width="90" height="380" fill="none" stroke="rgba(74,127,160,0.12)" stroke-width="1" rx="2"/>
    <line x1="410" y1="200" x2="410" y2="580" stroke="rgba(74,127,160,0.08)" stroke-width="0.7"/>

    <rect x="985" y="200" width="90" height="380" fill="rgba(74,127,160,0.04)" rx="2"/>
    <rect x="985" y="200" width="90" height="380" fill="none" stroke="rgba(74,127,160,0.12)" stroke-width="1" rx="2"/>
    <line x1="1030" y1="200" x2="1030" y2="580" stroke="rgba(74,127,160,0.08)" stroke-width="0.7"/>

    <!-- Sol dalles -->
    <line x1="360" y1="690" x2="0" y2="900" stroke="rgba(74,127,160,0.04)" stroke-width="1"/>
    <line x1="540" y1="690" x2="200" y2="900" stroke="rgba(74,127,160,0.03)" stroke-width="1"/>
    <line x1="720" y1="690" x2="400" y2="900" stroke="rgba(74,127,160,0.03)" stroke-width="1"/>
    <line x1="900" y1="690" x2="600" y2="900" stroke="rgba(74,127,160,0.03)" stroke-width="1"/>
    <line x1="1080" y1="690" x2="800" y2="900" stroke="rgba(74,127,160,0.04)" stroke-width="1"/>

    <!-- Table de conférence ovale -->
    <ellipse cx="720" cy="755" rx="380" ry="42" fill="#141E30" stroke="rgba(74,127,160,0.2)" stroke-width="1.5"/>
    <ellipse cx="720" cy="755" rx="340" ry="32" fill="none" stroke="rgba(74,127,160,0.08)" stroke-width="0.7"/>
    <!-- Reflet table -->
    <ellipse cx="720" cy="750" rx="220" ry="15" fill="rgba(74,127,160,0.06)"/>
    <!-- Micro table -->
    <ellipse cx="720" cy="750" rx="14" ry="5" fill="rgba(74,127,160,0.15)" stroke="rgba(74,127,160,0.25)" stroke-width="0.8"/>

    <!-- Spots plafond modernistes -->
    <circle cx="480" cy="158" r="4" fill="rgba(200,230,255,0.2)"/>
    <circle cx="720" cy="150" r="5" fill="rgba(200,230,255,0.22)"/>
    <circle cx="960" cy="158" r="4" fill="rgba(200,230,255,0.2)"/>
    <ellipse cx="720" cy="150" rx="200" ry="50" fill="rgba(180,220,255,0.04)"/>
  `,

  'usine': `
    <defs>
      <linearGradient id="wallU" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#141410"/>
        <stop offset="100%" stop-color="#1E1C14"/>
      </linearGradient>
      <linearGradient id="floorU" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#181614"/>
        <stop offset="100%" stop-color="#0C0C0A"/>
      </linearGradient>
      <linearGradient id="industrialLight" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stop-color="#FFD060" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#FF8020" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <!-- Plafond métal -->
    <polygon points="0,0 1440,0 1060,160 380,160" fill="#0E0E0C"/>
    <!-- Structures métalliques plafond -->
    <line x1="380" y1="160" x2="1060" y2="160" stroke="rgba(255,200,80,0.1)" stroke-width="2"/>
    <line x1="420" y1="160" x2="280" y2="0" stroke="rgba(255,200,80,0.06)" stroke-width="1.5"/>
    <line x1="580" y1="160" x2="440" y2="0" stroke="rgba(255,200,80,0.06)" stroke-width="1.5"/>
    <line x1="720" y1="160" x2="720" y2="0" stroke="rgba(255,200,80,0.06)" stroke-width="1.5"/>
    <line x1="860" y1="160" x2="1000" y2="0" stroke="rgba(255,200,80,0.06)" stroke-width="1.5"/>
    <line x1="1000" y1="160" x2="1160" y2="0" stroke="rgba(255,200,80,0.06)" stroke-width="1.5"/>

    <!-- Murs -->
    <polygon points="0,0 380,160 380,680 0,900" fill="#111010"/>
    <polygon points="1440,0 1060,160 1060,680 1440,900" fill="#101010"/>
    <polygon points="380,160 1060,160 1060,680 380,680" fill="url(#wallU)"/>
    <!-- Sol béton -->
    <polygon points="0,900 1440,900 1060,680 380,680" fill="url(#floorU)"/>

    <!-- Grandes fenêtres industrielles fond -->
    <rect x="420" y="175" width="160" height="260" fill="rgba(255,180,60,0.05)" rx="2"/>
    <rect x="420" y="175" width="160" height="260" fill="none" stroke="rgba(255,180,60,0.12)" stroke-width="1.5"/>
    <!-- Croisillons fenêtre -->
    <line x1="500" y1="175" x2="500" y2="435" stroke="rgba(255,180,60,0.08)" stroke-width="1.2"/>
    <line x1="420" y1="260" x2="580" y2="260" stroke="rgba(255,180,60,0.08)" stroke-width="1"/>
    <line x1="420" y1="345" x2="580" y2="345" stroke="rgba(255,180,60,0.08)" stroke-width="1"/>
    <!-- Rayon soleil industriel -->
    <polygon points="420,175 580,175 720,680 280,680" fill="url(#industrialLight)"/>

    <rect x="860" y="175" width="160" height="260" fill="rgba(255,180,60,0.04)" rx="2"/>
    <rect x="860" y="175" width="160" height="260" fill="none" stroke="rgba(255,180,60,0.1)" stroke-width="1.5"/>
    <line x1="940" y1="175" x2="940" y2="435" stroke="rgba(255,180,60,0.07)" stroke-width="1.2"/>
    <line x1="860" y1="260" x2="1020" y2="260" stroke="rgba(255,180,60,0.07)" stroke-width="1"/>

    <!-- Panneaux muraux -->
    <rect x="610" y="230" width="220" height="200" fill="#0E0E0A" stroke="rgba(255,180,60,0.1)" stroke-width="1"/>
    <!-- Tableaux de bord stylisés -->
    <text x="720" y="275" text-anchor="middle" fill="rgba(255,180,60,0.2)" font-family="monospace" font-size="10">PROD LINE A</text>
    <line x1="630" y1="290" x2="810" y2="290" stroke="rgba(255,180,60,0.1)" stroke-width="0.8"/>
    <rect x="635" y="300" width="40" height="6" fill="rgba(74,138,106,0.3)" rx="1"/>
    <rect x="685" y="300" width="55" height="6" fill="rgba(255,180,60,0.25)" rx="1"/>
    <rect x="635" y="316" width="70" height="6" fill="rgba(74,138,106,0.25)" rx="1"/>
    <rect x="635" y="332" width="30" height="6" fill="rgba(160,74,74,0.3)" rx="1"/>

    <!-- Grille sol béton -->
    <line x1="380" y1="680" x2="0" y2="900" stroke="rgba(255,255,255,0.025)" stroke-width="1"/>
    <line x1="560" y1="680" x2="200" y2="900" stroke="rgba(255,255,255,0.02)" stroke-width="1"/>
    <line x1="720" y1="680" x2="380" y2="900" stroke="rgba(255,255,255,0.02)" stroke-width="1"/>
    <line x1="880" y1="680" x2="560" y2="900" stroke="rgba(255,255,255,0.02)" stroke-width="1"/>
    <line x1="1060" y1="680" x2="740" y2="900" stroke="rgba(255,255,255,0.025)" stroke-width="1"/>
    <!-- Joint de dilatation horizontal -->
    <line x1="380" y1="780" x2="1060" y2="780" stroke="rgba(255,255,255,0.02)" stroke-width="1"/>

    <!-- Table de réunion terrain -->
    <ellipse cx="720" cy="750" rx="280" ry="32" fill="#181612" stroke="rgba(255,180,60,0.15)" stroke-width="1.5"/>
    <ellipse cx="720" cy="750" rx="240" ry="22" fill="none" stroke="rgba(255,180,60,0.06)" stroke-width="0.7"/>

    <!-- Suspensions industrielles -->
    <circle cx="480" cy="130" r="8" fill="#1A1810" stroke="rgba(255,180,60,0.15)" stroke-width="1.5"/>
    <circle cx="720" cy="120" r="10" fill="#1A1810" stroke="rgba(255,180,60,0.18)" stroke-width="1.5"/>
    <circle cx="960" cy="130" r="8" fill="#1A1810" stroke="rgba(255,180,60,0.15)" stroke-width="1.5"/>
    <ellipse cx="480" cy="130" rx="40" ry="20" fill="rgba(255,200,80,0.08)"/>
    <ellipse cx="720" cy="120" rx="55" ry="28" fill="rgba(255,200,80,0.1)"/>
    <ellipse cx="960" cy="130" rx="40" ry="20" fill="rgba(255,200,80,0.08)"/>
  `
};
