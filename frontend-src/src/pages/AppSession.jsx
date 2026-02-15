import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth, authFetch } from "../auth";
import { useColors, Badge } from "../shared";
import { ThemeToggle } from "../theme";

const COMP_LABELS = {
  accroche: "Accroche",
  decouverte: "Découverte",
  creation_enjeu: "Création d'enjeu",
  argumentation: "Argumentation",
  traitement_objections: "Objections",
  engagement: "Engagement",
};
const COMP_KEYS = Object.keys(COMP_LABELS);

function noteLetter(score) {
  if (score >= 16) return "A";
  if (score >= 13) return "B";
  if (score >= 10) return "C";
  if (score >= 7) return "D";
  return "E";
}

function noteColor(letter, c) {
  return { A: c.ok, B: c.bl, C: c.wr, D: c.ac, E: c.dn }[letter] || c.mt;
}

function MiniRadar({ competences, size = 180, c }) {
  const cx = size / 2, cy = size / 2, maxR = size / 2 - 24;
  const n = COMP_KEYS.length;
  const angleStep = (2 * Math.PI) / n;

  const point = (i, val) => {
    const a = -Math.PI / 2 + i * angleStep;
    const r = (val / 20) * maxR;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  const pts = COMP_KEYS.map((k, i) => point(i, competences[k]?.score || 0).join(",")).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.5, 1].map(pct => (
        <polygon key={pct} points={COMP_KEYS.map((_, i) => {
          const a = -Math.PI / 2 + i * angleStep;
          const r = pct * maxR;
          return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
        }).join(" ")} fill="none" stroke={c.bd} strokeWidth={0.5} />
      ))}
      <polygon points={pts} fill={`${c.ac}22`} stroke={c.ac} strokeWidth={2} />
      {COMP_KEYS.map((k, i) => {
        const [x, y] = point(i, competences[k]?.score || 0);
        return <circle key={k} cx={x} cy={y} r={3} fill={c.ac} />;
      })}
      {COMP_KEYS.map((k, i) => {
        const a = -Math.PI / 2 + i * angleStep;
        const lR = maxR + 16;
        const x = cx + lR * Math.cos(a);
        const y = cy + lR * Math.sin(a);
        return <text key={k} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill={c.mt} fontSize={8}>{COMP_LABELS[k]}</text>;
      })}
    </svg>
  );
}

export default function AppSession() {
  const c = useColors();
  const { user } = useAuth();
  const { id } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { nav("/app/login"); return; }
    authFetch(`/api/dashboard/session/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => nav("/app/dashboard"))
      .finally(() => setLoading(false));
  }, [id, user]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: c.mt }}>Chargement...</span>
    </div>
  );

  if (!data) return null;

  const ev = data.evaluation || {};
  const comps = ev.competences || {};
  const score = data.score_global || 0;
  const letter = noteLetter(score);
  const color = noteColor(letter, c);

  const cardStyle = { background: c.bgC, border: `1px solid ${c.bd}`, borderRadius: 14, padding: 20, marginBottom: 16 };

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.tx }}>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: `1px solid ${c.bd}`, background: `${c.bg}E0`, backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <Link to="/app/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: c.mt, fontSize: 13 }}>
          &larr; Dashboard
        </Link>
        <ThemeToggle />
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 24, fontWeight: 800, color }}>{letter}</span>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Session #{data.id}</h1>
            <div style={{ fontSize: 13, color: c.mt, marginTop: 2 }}>
              {data.scenario_id === "__default__" ? "Olivier Bertrand — Industrie" : data.scenario_id}
              {" · "}Difficulté {"*".repeat(data.difficulty || 2)}
              {data.created_at && (" · " + new Date(data.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }))}
            </div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color }}>{score}/20</div>
            <div style={{ fontSize: 11, color: c.mt }}>{ev.resultat_appel || ""}</div>
          </div>
        </div>

        {/* Synthese */}
        {ev.synthese && (
          <div style={{ ...cardStyle, borderLeftWidth: 3, borderLeftColor: c.ac }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: c.mt, textTransform: "uppercase", marginBottom: 8 }}>Synthèse</div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{ev.synthese}</p>
            {ev.conseil_prioritaire && (
              <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: c.acD, fontSize: 13 }}>
                <strong>Conseil prioritaire :</strong> {ev.conseil_prioritaire}
              </div>
            )}
          </div>
        )}

        {/* Radar + Score */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
          <div style={{ ...cardStyle, flex: "1 1 200px", display: "flex", justifyContent: "center", marginBottom: 0 }}>
            <MiniRadar competences={comps} c={c} />
          </div>
        </div>

        {/* 6 competences blocks */}
        {COMP_KEYS.map(k => {
          const comp = comps[k];
          if (!comp) return null;
          const sc = comp.score || 0;
          const l = noteLetter(sc);
          const col = noteColor(l, c);
          return (
            <div key={k} style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{COMP_LABELS[k]}</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: col }}>{sc}/20 <span style={{ fontSize: 12, fontWeight: 600 }}>{l}</span></span>
              </div>
              {comp.points_forts?.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: c.ok, marginBottom: 4 }}>Points forts</div>
                  {comp.points_forts.map((p, i) => (
                    <div key={i} style={{ fontSize: 13, color: c.tx, lineHeight: 1.5, marginBottom: 2, paddingLeft: 12, position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, color: c.ok }}>+</span>{p}
                    </div>
                  ))}
                </div>
              )}
              {comp.points_progres?.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: c.dn, marginBottom: 4 }}>Axes de progrès</div>
                  {comp.points_progres.map((p, i) => (
                    <div key={i} style={{ fontSize: 13, color: c.tx, lineHeight: 1.5, marginBottom: 2, paddingLeft: 12, position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, color: c.dn }}>-</span>{p}
                    </div>
                  ))}
                </div>
              )}
              {comp.conseil && (
                <div style={{ padding: "8px 12px", borderRadius: 8, background: c.bgE, fontSize: 12, color: c.mt, lineHeight: 1.5 }}>
                  {comp.conseil}
                </div>
              )}
            </div>
          );
        })}

        {/* Transcript */}
        {data.transcript?.length > 0 && (
          <div style={cardStyle}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: c.mt, textTransform: "uppercase", marginBottom: 12 }}>Transcript intégral</div>
            {data.transcript.map((t, i) => {
              const isVendeur = t.role === "vendeur";
              return (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 60, flexShrink: 0, textAlign: "right" }}>
                    <Badge color={isVendeur ? "blue" : "accent"}>{isVendeur ? "Vendeur" : "Prospect"}</Badge>
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, flex: 1 }}>{t.text}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Brief */}
        {data.brief && (
          <div style={cardStyle}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: c.mt, textTransform: "uppercase", marginBottom: 12 }}>Brief commercial</div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: c.mt }}>
              <p><strong>Titre :</strong> {data.brief.titre}</p>
              <p><strong>Vous êtes :</strong> {data.brief.vous_etes}</p>
              <p><strong>Vous vendez :</strong> {data.brief.vous_vendez}</p>
              <p><strong>Vous appelez :</strong> {data.brief.vous_appelez}</p>
              <p><strong>Objectif :</strong> {data.brief.votre_objectif}</p>
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link to="/app/dashboard" style={{ fontSize: 13, color: c.ac, textDecoration: "none" }}>&larr; Retour au dashboard</Link>
        </div>
      </div>
    </div>
  );
}
