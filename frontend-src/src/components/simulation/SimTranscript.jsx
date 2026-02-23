import React, { useEffect, useRef } from 'react';
import { useColors } from '../../shared';

export default function SimTranscript({ entries, pending }) {
  const c = useColors();
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [entries, pending]);

  const allEmpty = entries.length === 0 && Object.keys(pending).length === 0;
  if (allEmpty) return null;

  return (
    <div ref={ref} style={{
      background: c.bgC, border: `1px solid ${c.bd}`, borderRadius: 14,
      padding: 16, marginTop: 24, maxHeight: 180, overflowY: 'auto',
    }}>
      {entries.map((e, i) => (
        <div key={i} style={{ padding: '5px 0', fontSize: 12.5, lineHeight: 1.5, borderBottom: i < entries.length - 1 ? `1px solid ${c.bd}33` : 'none' }}>
          <span style={{ fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginRight: 6, color: e.who === 'user' ? c.bl : c.ac }}>{e.who === 'user' ? 'Vous' : 'Prospect'}</span>
          {e.text}
        </div>
      ))}
      {Object.entries(pending).map(([sid, seg]) => (
        <div key={sid} style={{ padding: '5px 0', fontSize: 12.5, lineHeight: 1.5, fontStyle: 'italic', opacity: 0.6 }}>
          <span style={{ fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginRight: 6, color: seg.who === 'user' ? c.bl : c.ac }}>{seg.who === 'user' ? 'Vous' : 'Prospect'}</span>
          {seg.text}
        </div>
      ))}
    </div>
  );
}
