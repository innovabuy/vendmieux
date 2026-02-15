import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, authFetch } from "../auth";
import { useColors, Badge } from "../shared";
import { useTheme, ThemeToggle } from "../theme";

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

function ScoreGauge({ score, size = 120, c }) {
  const letter = noteLetter(score);
  const color = noteColor(letter, c);
  const pct = Math.min(score / 20, 1);
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c.bd} strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.28, fontWeight: 800, color }}>{score.toFixed(1)}</span>
        <span style={{ fontSize: size * 0.12, color: c.mt }}>/20</span>
        <span style={{ fontSize: size * 0.18, fontWeight: 700, color, marginTop: 2 }}>{letter}</span>
      </div>
    </div>
  );
}

function RadarChart({ current, previous, size = 240, c }) {
  const cx = size / 2, cy = size / 2, maxR = size / 2 - 30;
  const n = COMP_KEYS.length;
  const angleStep = (2 * Math.PI) / n;

  const point = (i, val) => {
    const a = -Math.PI / 2 + i * angleStep;
    const r = (val / 20) * maxR;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  const polygon = (values, fill, stroke, dash) => {
    const pts = COMP_KEYS.map((k, i) => point(i, values[k] || 0).join(",")).join(" ");
    return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={2} strokeDasharray={dash || "none"} />;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid */}
      {[0.25, 0.5, 0.75, 1].map(pct => (
        <polygon key={pct} points={COMP_KEYS.map((_, i) => {
          const a = -Math.PI / 2 + i * angleStep;
          const r = pct * maxR;
          return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
        }).join(" ")} fill="none" stroke={c.bd} strokeWidth={0.5} />
      ))}
      {/* Axes */}
      {COMP_KEYS.map((_, i) => {
        const [x, y] = point(i, 20);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={c.bd} strokeWidth={0.5} />;
      })}
      {/* Previous (dashed) */}
      {previous && polygon(previous, "transparent", c.dm, "4,4")}
      {/* Current */}
      {polygon(current, `${c.ac}22`, c.ac)}
      {/* Dots */}
      {COMP_KEYS.map((k, i) => {
        const [x, y] = point(i, current[k] || 0);
        return <circle key={k} cx={x} cy={y} r={4} fill={c.ac} />;
      })}
      {/* Labels */}
      {COMP_KEYS.map((k, i) => {
        const a = -Math.PI / 2 + i * angleStep;
        const lR = maxR + 20;
        const x = cx + lR * Math.cos(a);
        const y = cy + lR * Math.sin(a);
        return (
          <text key={k} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fill={c.mt} fontSize={10} fontWeight={500}>
            {COMP_LABELS[k]}
          </text>
        );
      })}
    </svg>
  );
}

function CompBar({ label, score, evolution, c }) {
  const pct = Math.min((score / 20) * 100, 100);
  const color = score >= 14 ? c.ok : score >= 10 ? c.wr : c.dn;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 500 }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{score}/20</span>
          {evolution !== 0 && (
            <span style={{ fontSize: 11, color: evolution > 0 ? c.ok : c.dn, fontWeight: 600 }}>
              {evolution > 0 ? "+" : ""}{evolution}
            </span>
          )}
        </div>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: c.bgE }}>
        <div style={{ height: 6, borderRadius: 3, background: color, width: `${pct}%`, transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}

export default function AppDashboard() {
  const c = useColors();
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [stats, setStats] = useState(null);
  const [radar, setRadar] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { nav("/app/login"); return; }
    Promise.all([
      authFetch("/api/dashboard/stats").then(r => r.json()),
      authFetch("/api/dashboard/radar").then(r => r.json()),
      authFetch("/api/dashboard/historique?limit=10").then(r => r.json()),
    ]).then(([s, r, h]) => {
      setStats(s);
      setRadar(r);
      setHistorique(h);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: c.mt }}>Chargement...</span>
    </div>
  );

  if (!stats) return null;

  const prioritaire = stats.competence_prioritaire;
  const prioLabel = COMP_LABELS[prioritaire] || "";
  const prioScore = stats.competences[prioritaire]?.moyenne || 0;

  const cardStyle = {
    background: c.bgC, border: `1px solid ${c.bd}`, borderRadius: 14, padding: 20,
  };

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.tx }}>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: `1px solid ${c.bd}`, background: `${c.bg}E0`, backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: c.tx }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${c.ac},${c.acL})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>V</div>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Vend<span style={{ color: c.ac }}>Mieux</span></span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ThemeToggle />
          <span style={{ fontSize: 13, color: c.mt }}>{user?.prenom} {user?.nom}</span>
          <button onClick={() => { logout(); nav("/app/login"); }} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${c.bd}`, background: c.bgE, color: c.tx, fontSize: 12, cursor: "pointer" }}>Déconnexion</button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 20px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: c.mt, margin: "0 0 28px" }}>Bonjour {user?.prenom}, voici vos performances</p>

        {stats.sessions_total === 0 ? (
          <div style={{ ...cardStyle, textAlign: "center", padding: 48 }}>
            <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 8px" }}>Aucune session pour l'instant</p>
            <p style={{ fontSize: 13, color: c.mt, margin: "0 0 20px" }}>Lancez votre premier appel pour voir vos statistiques ici.</p>
            <Link to="/" style={{ padding: "10px 24px", borderRadius: 10, background: `linear-gradient(135deg,${c.ac},${c.acL})`, color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Commencer un appel</Link>
          </div>
        ) : (
          <>
            {/* Top row: Score + Radar */}
            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, marginBottom: 16 }}>
              {/* Score card */}
              <div style={{ ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: c.mt, textTransform: "uppercase" }}>Score moyen</span>
                <ScoreGauge score={stats.score_moyen} c={c} />
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: c.mt }}>
                  <span>{stats.sessions_total} session{stats.sessions_total > 1 ? "s" : ""}</span>
                  <span>Meilleur : {stats.meilleur_score}/20</span>
                </div>
                {stats.progression_30j !== 0 && (
                  <Badge color={stats.progression_30j > 0 ? "ok" : "danger"}>
                    {stats.progression_30j > 0 ? "+" : ""}{stats.progression_30j} / 30j
                  </Badge>
                )}
              </div>

              {/* Radar card */}
              <div style={cardStyle}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: c.mt, textTransform: "uppercase", marginBottom: 8, display: "block" }}>Compétences FORCE 3D</span>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <RadarChart current={radar?.current || {}} previous={radar?.previous || {}} c={c} />
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 4, fontSize: 11, color: c.mt }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 12, height: 2, background: c.ac, display: "inline-block" }} /> Actuel</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 12, height: 2, background: c.dm, display: "inline-block", borderTop: "1px dashed" }} /> Il y a 30j</span>
                </div>
              </div>
            </div>

            {/* Competences bars */}
            <div style={{ ...cardStyle, marginBottom: 16 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: c.mt, textTransform: "uppercase", marginBottom: 12, display: "block" }}>Détail compétences</span>
              {COMP_KEYS.map(k => (
                <CompBar key={k} label={COMP_LABELS[k]} score={stats.competences[k]?.moyenne || 0} evolution={stats.competences[k]?.evolution || 0} c={c} />
              ))}
            </div>

            {/* Priority banner */}
            {prioritaire && (
              <div style={{ ...cardStyle, marginBottom: 16, background: c.acD, borderColor: c.ac }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c.ac}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                    {prioScore < 8 ? "!" : prioScore < 12 ? "~" : "+"}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Priorité : {prioLabel}</div>
                    <div style={{ fontSize: 12, color: c.mt }}>
                      Score moyen : {prioScore}/20 — Travaillez cette compétence en priorité.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Historique */}
            <div style={cardStyle}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: c.mt, textTransform: "uppercase", marginBottom: 12, display: "block" }}>Dernières sessions</span>
              {historique.length === 0 ? (
                <p style={{ fontSize: 13, color: c.mt }}>Aucune session enregistrée</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${c.bd}` }}>
                        <th style={{ textAlign: "left", padding: "8px 10px", color: c.mt, fontWeight: 600, fontSize: 11 }}>Date</th>
                        <th style={{ textAlign: "left", padding: "8px 10px", color: c.mt, fontWeight: 600, fontSize: 11 }}>Scénario</th>
                        <th style={{ textAlign: "center", padding: "8px 10px", color: c.mt, fontWeight: 600, fontSize: 11 }}>Difficulté</th>
                        <th style={{ textAlign: "center", padding: "8px 10px", color: c.mt, fontWeight: 600, fontSize: 11 }}>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historique.map(h => {
                        const d = h.created_at ? new Date(h.created_at) : null;
                        const dateStr = d ? d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
                        const sc = h.score_global || 0;
                        const letter = noteLetter(sc);
                        return (
                          <tr key={h.id}
                            onClick={() => nav(`/app/session/${h.id}`)}
                            style={{ borderBottom: `1px solid ${c.bd}`, cursor: "pointer" }}
                            onMouseEnter={e => e.currentTarget.style.background = c.bgE}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <td style={{ padding: "10px" }}>{dateStr}</td>
                            <td style={{ padding: "10px" }}>{h.scenario_id === "__default__" ? "Olivier Bertrand" : h.scenario_id}</td>
                            <td style={{ padding: "10px", textAlign: "center" }}>
                              {"*".repeat(h.difficulty || 2)}
                            </td>
                            <td style={{ padding: "10px", textAlign: "center" }}>
                              <span style={{ fontWeight: 700, color: noteColor(letter, c) }}>{sc}/20</span>
                              <span style={{ marginLeft: 6, fontSize: 11, color: c.mt }}>{letter}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
