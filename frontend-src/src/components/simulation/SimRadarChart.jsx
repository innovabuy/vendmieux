import React, { useRef, useEffect } from 'react';
import { useTheme } from '../../theme';
import { COMP_KEYS, COMP_LABELS } from './constants';

const RADAR_LABELS = ['Accroche', 'Découverte', "Création\nd'enjeu", 'Argumentation', 'Objections', 'Engagement'];

export default function SimRadarChart({ competences, width = 340, height = 340 }) {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    const cx = width / 2, cy = height / 2, maxR = Math.min(width, height) / 2 - 40;
    const n = 6;
    const scores = COMP_KEYS.map(k => (competences[k] || {}).score || 0);

    const gridColor = isDark ? 'rgba(35,35,54,0.6)' : 'rgba(0,0,0,0.1)';
    const lineColor = isDark ? 'rgba(35,35,54,0.4)' : 'rgba(0,0,0,0.06)';
    const labelColor = isDark ? '#7c7c9a' : '#5c5c5c';
    const bgDot = isDark ? '#08080d' : '#F5F3EF';
    const fillColor = isDark ? 'rgba(212,133,74,0.15)' : 'rgba(196,117,57,0.15)';
    const strokeColor = isDark ? '#D4854A' : '#C47539';

    // Grid rings
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let ring = 1; ring <= 4; ring++) {
      const r = (ring / 4) * maxR;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Spoke lines
    ctx.strokeStyle = lineColor;
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + maxR * Math.cos(angle), cy + maxR * Math.sin(angle));
      ctx.stroke();
    }

    // Data polygon
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const idx = i % n;
      const angle = (Math.PI * 2 * idx / n) - Math.PI / 2;
      const r = (scores[idx] / 20) * maxR;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Dots
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
      const r = (scores[i] / 20) * maxR;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = scores[i] >= 14 ? '#22c55e' : scores[i] >= 8 ? '#f59e0b' : '#ef4444';
      ctx.fill();
      ctx.strokeStyle = bgDot;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = labelColor;
    ctx.font = "11px 'DM Sans', sans-serif";
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
      const lr = maxR + 22;
      const x = cx + lr * Math.cos(angle);
      const y = cy + lr * Math.sin(angle);
      const lines = RADAR_LABELS[i].split('\n');
      lines.forEach((line, li) => {
        ctx.fillText(line, x, y + (li - (lines.length - 1) / 2) * 13);
      });
      ctx.fillStyle = scores[i] >= 14 ? '#22c55e' : scores[i] >= 8 ? '#f59e0b' : '#ef4444';
      ctx.font = "bold 11px 'JetBrains Mono', monospace";
      ctx.fillText(scores[i] + '/20', x, y + lines.length * 13);
      ctx.fillStyle = labelColor;
      ctx.font = "11px 'DM Sans', sans-serif";
    }
  }, [competences, isDark, width, height]);

  return <canvas ref={canvasRef} style={{ display: 'block', margin: '0 auto' }} />;
}
