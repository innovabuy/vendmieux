import { useState, useEffect, useRef, useCallback } from "react";
import { useColors, Badge, Avatar, MiniSparkline } from "../shared";

/* ══════════════════════════════════════════════════════════════
   BASE DATA
   ══════════════════════════════════════════════════════════════ */
const TEAM_BASE = [
  { name:"Sarah Morel", role:"SDR", sessions:24, avg:15.8, trend:+1.2, best:"Découverte", weak:"Accroche", lastActive:"Aujourd'hui", scores:[11,13,14,14.5,15,15.8], streak:5, gender:"F" },
  { name:"Lucas Martin", role:"AE", sessions:18, avg:14.2, trend:+0.8, best:"Engagement", weak:"Objections", lastActive:"Aujourd'hui", scores:[12,12.5,13,13.8,14,14.2], streak:3, gender:"M" },
  { name:"Amira Khelifi", role:"SDR", sessions:31, avg:16.4, trend:+2.1, best:"Création d'enjeu", weak:"Accroche", lastActive:"Hier", scores:[12,13.5,14.5,15,16,16.4], streak:8, gender:"F" },
  { name:"Thomas Blanc", role:"AE", sessions:9, avg:11.5, trend:-0.3, best:"Argumentation", weak:"Découverte", lastActive:"Il y a 3 jours", scores:[12,12,11.5,11.8,11.2,11.5], streak:0, gender:"M" },
  { name:"Julie Perrin", role:"SDR", sessions:15, avg:13.6, trend:+0.5, best:"Objections", weak:"Engagement", lastActive:"Aujourd'hui", scores:[11,12,12.5,13,13.2,13.6], streak:2, gender:"F" },
];

const SIMS_POOL = [
  { user:"Sarah Morel", scenario:"Maintenance prédictive IoT", type:"Prospection", score:16.2, result:"RDV obtenu" },
  { user:"Amira Khelifi", scenario:"Défendre un devis 185K€", type:"Négociation", score:17.1, result:"Deal signé" },
  { user:"Lucas Martin", scenario:"Caisse iPad restaurant", type:"Prospection", score:14.8, result:"RDV obtenu" },
  { user:"Julie Perrin", scenario:"Client mécontent ménage", type:"Réclamation", score:12.9, result:"Client sauvé" },
  { user:"Thomas Blanc", scenario:"Solution RH / Paie", type:"Prospection", score:10.4, result:"Refus" },
  { user:"Sarah Morel", scenario:"Logiciel DMS concession", type:"Prospection", score:15.6, result:"RDV obtenu" },
  { user:"Amira Khelifi", scenario:"Prospection SaaS B2B", type:"Prospection", score:16.8, result:"RDV obtenu" },
  { user:"Lucas Martin", scenario:"Négociation contrat annuel", type:"Négociation", score:13.5, result:"Rappel prévu" },
];

const RADAR_BASE = { accroche:12.4, decouverte:14.8, creation_enjeu:15.6, argumentation:14.1, objections:13.2, engagement:15.1 };
const RADAR_LABELS = { accroche:"Accroche", decouverte:"Découverte", creation_enjeu:"Enjeu", argumentation:"Argument.", objections:"Objections", engagement:"Engagement" };

/* ══════════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════════ */
const jitter = (base, range) => +(base + (Math.random() - 0.5) * range).toFixed(1);
const jitterInt = (base, range) => Math.round(base + (Math.random() - 0.5) * range);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const fmtTimer = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

/* ══════════════════════════════════════════════════════════════
   CSS KEYFRAMES — injected once
   ══════════════════════════════════════════════════════════════ */
const STYLE_ID = "dp-anims-v2";
function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes dpPulse{0%,100%{opacity:1}50%{opacity:.3}}
    @keyframes dpFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    @keyframes dpScorePop{0%{transform:scale(0.5);opacity:0}50%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
    @keyframes dpSlideIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
    @keyframes dpStreakGlow{0%,100%{box-shadow:0 0 0 rgba(245,166,35,0)}50%{box-shadow:0 0 12px rgba(245,166,35,0.4)}}
    @keyframes dpNowPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(1.05)}}
    .dp-live-dot{width:6px;height:6px;border-radius:50%;background:#3db06b;animation:dpPulse 1.2s infinite}
    .dp-sim-dot{width:7px;height:7px;border-radius:50%;background:#3db06b;animation:dpPulse 0.8s infinite}
    .dp-fade{animation:dpFadeIn .4s ease both}
    .dp-slide{animation:dpSlideIn .4s ease both}
    .dp-val{transition:all .6s cubic-bezier(.4,0,.2,1)}
    .dp-score-pop{animation:dpScorePop .6s cubic-bezier(.34,1.56,.64,1) both}
    .dp-streak-glow{animation:dpStreakGlow 2s ease infinite}
    .dp-now{animation:dpNowPulse 2s ease infinite}
  `;
  document.head.appendChild(s);
}

/* ══════════════════════════════════════════════════════════════
   RADAR (animated axes via CSS transitions)
   ══════════════════════════════════════════════════════════════ */
function RadarTeam({ data }) {
  const C = useColors();
  const comps = Object.entries(data);
  const cx=120, cy=120, r=90;
  const step = (Math.PI*2) / comps.length;
  const pt = (i,v) => { const a=step*i-Math.PI/2; const d=(v/20)*r; return { x:cx+Math.cos(a)*d, y:cy+Math.sin(a)*d }; };
  const grid = [5,10,15,20];
  const dp = comps.map(([_,v],i) => pt(i,v));
  const path = dp.map((p,i) => `${i===0?"M":"L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg viewBox="0 0 240 240" style={{ width:"100%", maxWidth:200 }}>
      {grid.map(l => { const ps=comps.map((_,i)=>pt(i,l)); const d=ps.map((p,i)=>`${i===0?"M":"L"} ${p.x} ${p.y}`).join(" ")+" Z"; return <path key={l} d={d} fill="none" stroke={C.bd} strokeWidth={0.5} opacity={0.5}/>; })}
      {comps.map((_,i) => { const p=pt(i,20); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={C.bd} strokeWidth={0.5} opacity={0.3}/>; })}
      <path d={path} fill={`${C.ac}18`} stroke={C.ac} strokeWidth={2} style={{ transition:"d .8s cubic-bezier(.4,0,.2,1)" }}/>
      {dp.map((p,i) => <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={comps[i][1]>=14?C.ok:comps[i][1]>=10?C.wr:C.dn} stroke={C.bg} strokeWidth={2} style={{ transition:"cx .8s,cy .8s" }}/>)}
      {comps.map(([k],i) => { const p=pt(i,24); return <text key={k} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fill={C.mt} fontSize={8} fontWeight={600}>{RADAR_LABELS[k]}</text>; })}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   STAT CARD
   ══════════════════════════════════════════════════════════════ */
function StatCard({ label, value, sub, icon, trend }) {
  const C = useColors();
  return (
    <div style={{ background:C.bgC, border:`1px solid ${C.bd}`, borderRadius:14, padding:"16px 14px", flex:1, minWidth:140 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:C.mt }}>{label}</div>
        <span style={{ fontSize:16 }}>{icon}</span>
      </div>
      <div className="dp-val" style={{ fontSize:24, fontWeight:200, color:C.tx, lineHeight:1, marginBottom:4 }}>{value}</div>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        {trend !== undefined && <span style={{ fontSize:10, fontWeight:600, color:trend>=0?C.ok:C.dn }}>{trend>=0?`↑ +${trend}`:`↓ ${trend}`}</span>}
        <span style={{ fontSize:10, color:C.dm }}>{sub}</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEAM TABLE (live scores, sparklines, sim-en-cours badge)
   ══════════════════════════════════════════════════════════════ */
function TeamTable({ teamData, simInProgress }) {
  const C = useColors();
  const [sort, setSort] = useState("avg");
  const sorted = [...teamData].sort((a,b) => sort==="avg" ? b.avg-a.avg : sort==="sessions" ? b.sessions-a.sessions : b.trend-a.trend);

  return (
    <div style={{ background:C.bgC, border:`1px solid ${C.bd}`, borderRadius:14, overflow:"hidden" }}>
      <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.bd}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:13, fontWeight:600 }}>Équipe commerciale</span>
          <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:"rgba(61,176,107,0.12)", padding:"2px 8px", borderRadius:10, fontSize:10, fontWeight:600, color:"#3db06b" }}>
            <span className="dp-live-dot"/> LIVE
          </span>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {[{k:"avg",l:"Score"},{k:"sessions",l:"Activité"},{k:"trend",l:"Progression"}].map(s => (
            <button key={s.k} onClick={() => setSort(s.k)} style={{ padding:"3px 10px", borderRadius:6, border:"none", background:sort===s.k?C.acD:"transparent", color:sort===s.k?C.ac:C.dm, fontSize:10, fontWeight:600, cursor:"pointer" }}>{s.l}</button>
          ))}
        </div>
      </div>
      {sorted.map((m,i) => {
        const isInSim = simInProgress && simInProgress.name === m.name;
        return (
          <div key={m.name} className="dp-fade" style={{ padding:"10px 16px", borderBottom:i<sorted.length-1?`1px solid ${C.bd}10`:"none", display:"flex", alignItems:"center", gap:10, animationDelay:`${i*0.06}s`, background:isInSim?`${C.ok}08`:"transparent" }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.dm, width:18, textAlign:"center" }}>{i+1}</div>
            <Avatar name={m.name} gender={m.gender} size={32}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                <span style={{ fontSize:13, fontWeight:600 }}>{m.name}</span>
                <Badge color="muted">{m.role}</Badge>
                {m.streak >= 5 && <Badge color="ok">🔥 {m.streak}j</Badge>}
                {isInSim && (
                  <span className="dp-slide" style={{ display:"inline-flex", alignItems:"center", gap:4, background:"rgba(61,176,107,0.15)", padding:"2px 8px", borderRadius:8, fontSize:10, fontWeight:600, color:"#3db06b" }}>
                    <span className="dp-sim-dot"/> En simulation {fmtTimer(simInProgress.timer)}
                  </span>
                )}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:2 }}>
                <span style={{ fontSize:10, color:C.dm }}>Force : <span style={{ color:C.ok, fontWeight:600 }}>{m.best}</span></span>
                <span style={{ fontSize:10, color:C.dm }}>Axe : <span style={{ color:C.wr, fontWeight:600 }}>{m.weak}</span></span>
              </div>
            </div>
            <MiniSparkline data={m.scores} color={m.trend>=0?C.ok:C.dn}/>
            <div style={{ textAlign:"right", minWidth:50 }}>
              <div className="dp-val" style={{ fontSize:18, fontWeight:300, color:C.tx }}>{m.avg}</div>
              <div style={{ fontSize:10, fontWeight:600, color:m.trend>=0?C.ok:C.dn }}>{m.trend>=0?"+":""}{m.trend}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   RECENT ACTIVITY (with "now" badge on newest)
   ══════════════════════════════════════════════════════════════ */
function RecentActivity({ sims }) {
  const C = useColors();
  return (
    <div style={{ background:C.bgC, border:`1px solid ${C.bd}`, borderRadius:14, overflow:"hidden" }}>
      <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.bd}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontSize:13, fontWeight:600 }}>Activité récente</div>
      </div>
      {sims.map((s,i) => (
        <div key={s._key || i} className={i === 0 ? "dp-slide" : "dp-fade"} style={{ padding:"10px 16px", borderBottom:i<sims.length-1?`1px solid ${C.bd}10`:"none", display:"flex", alignItems:"center", gap:10, animationDelay:i===0?"0s":`${0.4+i*0.08}s`, background:i===0?`${C.ac}06`:"transparent" }}>
          <div className={i === 0 ? "dp-score-pop" : "dp-val"} style={{ width:32, height:32, borderRadius:8, background:s.score>=15?C.okD:s.score>=12?C.wrD:C.dnD, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:s.score>=15?C.ok:s.score>=12?C.wr:C.dn }}>{s.score.toFixed(1)}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:500 }}>
              <span style={{ fontWeight:600 }}>{s.user}</span>
              <span style={{ color:C.dm }}> · </span>
              <span style={{ color:C.mt }}>{s.scenario}</span>
            </div>
            <div style={{ display:"flex", gap:4, marginTop:3 }}>
              <Badge color={s.type==="Prospection"?"blue":s.type==="Négociation"?"accent":"warn"}>{s.type}</Badge>
              <Badge color={s.result.includes("obtenu")||s.result.includes("signé")||s.result.includes("sauvé")?"ok":"danger"}>{s.result}</Badge>
              {i === 0 && (
                <span className="dp-now" style={{ display:"inline-flex", alignItems:"center", gap:3, background:"rgba(61,176,107,0.15)", padding:"1px 7px", borderRadius:6, fontSize:9, fontWeight:700, color:"#3db06b", letterSpacing:0.5 }}>
                  <span className="dp-live-dot" style={{ width:5, height:5 }}/> now
                </span>
              )}
            </div>
          </div>
          <span style={{ fontSize:10, color:C.dm, flexShrink:0 }}>{s.time}</span>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ALERTS
   ══════════════════════════════════════════════════════════════ */
function CompetenceAlerts({ streakNotif }) {
  const C = useColors();
  const alerts = [
    { type:"danger", icon:"⚠️", msg:"Thomas Blanc — aucune simulation depuis 3 jours", action:"Rappel" },
    { type:"warn", icon:"📊", msg:"Accroche : compétence la plus faible (12.4/20)", action:"Exercice" },
    { type:"ok", icon:"🏆", msg:"Amira Khelifi — série de 8 jours consécutifs", action:"Féliciter" },
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      {/* Streak notification — animated */}
      {streakNotif && (
        <div className="dp-slide dp-streak-glow" style={{ background:"rgba(245,166,35,0.08)", border:"1px solid rgba(245,166,35,0.25)", borderRadius:8, padding:"8px 12px", display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:14 }}>🔥</span>
          <div style={{ flex:1, fontSize:12, color:C.tx, fontWeight:600, lineHeight:1.3 }}>{streakNotif}</div>
          <span style={{ fontSize:10, color:"rgba(245,166,35,0.8)", fontWeight:700 }}>STREAK</span>
        </div>
      )}
      {alerts.map((a,i) => {
        const colors = { danger:{bg:C.dnD,border:"rgba(212,90,90,0.2)",text:C.dn}, warn:{bg:C.wrD,border:"rgba(212,168,74,0.2)",text:C.wr}, ok:{bg:C.okD,border:"rgba(61,176,107,0.2)",text:C.ok} };
        const c = colors[a.type];
        return (
          <div key={i} className="dp-fade" style={{ background:c.bg, border:`1px solid ${c.border}`, borderRadius:8, padding:"8px 12px", display:"flex", alignItems:"center", gap:10, animationDelay:`${0.2+i*0.08}s` }}>
            <span style={{ fontSize:14 }}>{a.icon}</span>
            <div style={{ flex:1, fontSize:12, color:C.tx, lineHeight:1.3 }}>{a.msg}</div>
            <button style={{ padding:"4px 10px", borderRadius:6, border:`1px solid ${c.border}`, background:"transparent", color:c.text, fontSize:10, fontWeight:600, cursor:"pointer", flexShrink:0, whiteSpace:"nowrap" }}>{a.action}</button>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SCORE POP OVERLAY — big animated score when sim finishes
   ══════════════════════════════════════════════════════════════ */
function ScorePopOverlay({ score, name, onDone }) {
  const C = useColors();
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  const color = score >= 15 ? C.ok : score >= 12 ? C.wr : C.dn;
  return (
    <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"rgba(12,14,19,0.7)", backdropFilter:"blur(4px)", zIndex:200, borderRadius:16 }}>
      <div className="dp-score-pop" style={{ fontSize:64, fontWeight:200, color, lineHeight:1 }}>{score.toFixed(1)}</div>
      <div className="dp-fade" style={{ fontSize:14, color:C.tx, marginTop:8, fontWeight:600, animationDelay:"0.3s" }}>{name}</div>
      <div className="dp-fade" style={{ fontSize:11, color:C.dm, marginTop:4, animationDelay:"0.5s" }}>Simulation terminée</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function DashboardPreview() {
  const C = useColors();

  const [stats, setStats] = useState({ score:"14.3", sessions:"97", taux:"68%", serie:"8j" });
  const [teamData, setTeamData] = useState(() => TEAM_BASE.map(m => ({ ...m, scores:[...m.scores] })));
  const [radar, setRadar] = useState(RADAR_BASE);
  const [sims, setSims] = useState(() => SIMS_POOL.slice(0, 4).map((s,i) => ({ ...s, time: ["09:42","09:15","08:58","Hier 17:30"][i], _key: `init-${i}` })));
  const [goalPct, setGoalPct] = useState(78);

  // Simulation en cours
  const [simInProgress, setSimInProgress] = useState(null);
  const simTimerRef = useRef(null);

  // Score pop overlay
  const [scorePop, setScorePop] = useState(null);

  // Streak notification
  const [streakNotif, setStreakNotif] = useState(null);

  // Counter for unique keys
  const keyRef = useRef(0);

  useEffect(() => { injectStyles(); }, []);

  // ── Simulation lifecycle ────────────────────────────────
  // Every ~12s: start a sim on a random member, run for ~8s, then finish with score pop
  useEffect(() => {
    let mounted = true;

    const cycle = () => {
      if (!mounted) return;

      // Pick random team member
      const member = pick(TEAM_BASE);

      // Start sim
      setSimInProgress({ name: member.name, timer: 0 });

      // Timer ticks every second
      let t = 0;
      simTimerRef.current = setInterval(() => {
        t++;
        setSimInProgress(prev => prev ? { ...prev, timer: t } : null);
      }, 1000);

      // End sim after 6-10s
      const duration = 6000 + Math.random() * 4000;
      setTimeout(() => {
        if (!mounted) return;
        clearInterval(simTimerRef.current);
        setSimInProgress(null);

        // Generate score
        const score = jitter(member.avg, 2);
        const clampedScore = Math.max(5, Math.min(19.5, score));

        // Show score pop
        setScorePop({ score: clampedScore, name: member.name });

        // Add to recent activity
        const sim = pick(SIMS_POOL.filter(s => s.user === member.name)) || pick(SIMS_POOL);
        keyRef.current++;
        setSims(prev => [
          { ...sim, score: clampedScore, time: "À l'instant", _key: `sim-${keyRef.current}` },
          ...prev.slice(0, 3),
        ]);

        // Update team sparkline
        setTeamData(prev => prev.map(m =>
          m.name === member.name
            ? { ...m, avg: +clampedScore.toFixed(1), scores: [...m.scores.slice(-5), clampedScore] }
            : m
        ));

        // Maybe show streak notification
        if (member.streak >= 3) {
          setStreakNotif(`${member.name.split(" ")[0]} : ${member.streak + 1}ème jour consécutif 🔥`);
          setTimeout(() => { if (mounted) setStreakNotif(null); }, 5000);
        }
      }, duration);
    };

    // First cycle after 3s
    const first = setTimeout(cycle, 3000);
    // Then every 14s
    const interval = setInterval(cycle, 14000);

    return () => { mounted = false; clearTimeout(first); clearInterval(interval); clearInterval(simTimerRef.current); };
  }, []);

  // ── Continuous jitter (stats, radar, goal) ───────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        score: jitter(14.3, 0.4).toString(),
        sessions: jitterInt(97, 4).toString(),
        taux: jitterInt(68, 3) + "%",
        serie: "8j",
      });
      setRadar(() => {
        const r = {};
        for (const [k,v] of Object.entries(RADAR_BASE)) r[k] = jitter(v, 0.6);
        return r;
      });
      setGoalPct(jitterInt(78, 3));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const dismissScorePop = useCallback(() => setScorePop(null), []);

  return (
    <div style={{
      background: "transparent",
      color: C.tx,
      fontFamily: "'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif",
      padding: "0 8px",
      overflowX: "hidden",
      overflowY: "hidden",
      position: "relative",
    }}>
      {/* Score pop overlay */}
      {scorePop && <ScorePopOverlay score={scorePop.score} name={scorePop.name} onDone={dismissScorePop}/>}

      {/* Mini nav bar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px", borderBottom:`1px solid ${C.bd}`, marginBottom:16, borderRadius:"12px 12px 0 0", background:C.bgC }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:26, height:26, borderRadius:6, background:`linear-gradient(135deg,${C.ac},${C.acL})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#fff" }}>V</div>
          <span style={{ fontSize:14, fontWeight:600, letterSpacing:-0.3 }}>Vend<span style={{ color:C.ac }}>Mieux</span></span>
          <Badge color="muted">Manager</Badge>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:"rgba(61,176,107,0.12)", padding:"2px 8px", borderRadius:10, fontSize:10, fontWeight:600, color:"#3db06b" }}>
            <span className="dp-live-dot"/> LIVE
          </span>
          <span style={{ fontSize:11, color:C.mt }}>Jean-François P.</span>
          <Avatar name="Jean-François Perrin" gender="M" size={26}/>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
        <StatCard label="Score moyen" value={stats.score} sub="vs 13.1 mois dernier" icon="📊" trend={1.2}/>
        <StatCard label="Sessions ce mois" value={stats.sessions} sub="objectif : 100" icon="🎯" trend={12}/>
        <StatCard label="Taux de RDV simulé" value={stats.taux} sub="vs 54% mois dernier" icon="📈" trend={14}/>
        <StatCard label="Série max" value={stats.serie} sub="Amira Khelifi" icon="🔥"/>
      </div>

      {/* Alerts + streak notification */}
      <div style={{ marginBottom:12 }}>
        <CompetenceAlerts streakNotif={streakNotif}/>
      </div>

      {/* Main grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:12, marginBottom:12 }}>
        <TeamTable teamData={teamData} simInProgress={simInProgress}/>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Radar */}
          <div style={{ background:C.bgC, border:`1px solid ${C.bd}`, borderRadius:14, padding:14 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:C.mt, marginBottom:10 }}>FORCE 3D — Équipe</div>
            <div style={{ display:"flex", justifyContent:"center" }}>
              <RadarTeam data={radar}/>
            </div>
            <div style={{ marginTop:8, padding:"8px 10px", background:C.acD, borderRadius:6 }}>
              <div style={{ fontSize:10, color:C.ac, fontWeight:600 }}>💡 Priorité coaching</div>
              <div style={{ fontSize:11, color:C.tx, marginTop:2 }}>L'accroche est le maillon faible. Assignez le module "Accroche en 10s".</div>
            </div>
          </div>

          {/* Weekly goal */}
          <div style={{ background:C.bgC, border:`1px solid ${C.bd}`, borderRadius:14, padding:14 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ fontSize:10, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:C.mt }}>Objectif hebdo</span>
              <span className="dp-val" style={{ fontSize:12, fontWeight:600, color:C.ac }}>{goalPct}%</span>
            </div>
            <div style={{ height:5, background:C.bd, borderRadius:3, overflow:"hidden", marginBottom:10 }}>
              <div className="dp-val" style={{ width:`${goalPct}%`, height:"100%", background:`linear-gradient(90deg,${C.ac},${C.acL})`, borderRadius:3 }}/>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              {teamData.map((m,i) => {
                const pct = Math.min(100, Math.round((m.sessions/12)*100));
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:10, color:C.mt, width:60, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.name.split(" ")[0]}</span>
                    <div style={{ flex:1, height:3, background:C.bd, borderRadius:2, overflow:"hidden" }}>
                      <div className="dp-val" style={{ width:`${pct}%`, height:"100%", background:pct>=100?C.ok:pct>=60?C.ac:C.dn, borderRadius:2 }}/>
                    </div>
                    <span style={{ fontSize:9, color:pct>=100?C.ok:C.dm, fontWeight:600, width:24, textAlign:"right" }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity with "now" badge */}
      <RecentActivity sims={sims}/>
    </div>
  );
}
