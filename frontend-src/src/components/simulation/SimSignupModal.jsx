import React from 'react';
import { useColors } from '../../shared';

export default function SimSignupModal({ open, onClose, onLogin }) {
  const c = useColors();
  if (!open) return null;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{
        background: c.bgC, border: `1px solid ${c.bd}`,
        borderRadius: 18, padding: '36px 32px', maxWidth: 440, width: '90%',
        textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16, background: 'none', border: 'none',
          color: c.dm, fontSize: 20, cursor: 'pointer',
        }}>&times;</button>
        <div style={{ fontSize: 44, marginBottom: 16 }}>🚀</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Impressionné par votre simulation ?</div>
        <div style={{ fontSize: 14, color: c.mt, lineHeight: 1.6, marginBottom: 24 }}>
          Vous avez utilisé votre simulation gratuite.<br />
          Créez un compte pour accéder à <strong style={{ color: c.tx }}>12 scénarios</strong>, tous les niveaux de difficulté, et suivre votre progression.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <a href="/contact" style={{
            display: 'block', padding: '14px 20px', borderRadius: 6,
            background: `linear-gradient(135deg, ${c.ac}, ${c.acL})`, color: '#fff',
            fontSize: 14, fontWeight: 600, textDecoration: 'none', textAlign: 'center',
            boxShadow: `0 4px 16px ${c.acD}`,
          }}>Créer mon compte gratuitement</a>
          <button onClick={onLogin} style={{
            padding: '12px 20px', borderRadius: 6,
            background: c.bgE, border: `1px solid ${c.bd}`, color: c.tx,
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>J'ai déjà un compte — Se connecter</button>
        </div>
      </div>
    </div>
  );
}
