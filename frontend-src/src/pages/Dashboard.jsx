import { useEffect, useState } from "react";
import { useColors, Badge, Avatar, Nav, Footer, MiniSparkline } from "../shared";


const team = [
  { name:"Sarah Morel", role:"SDR", sessions:24, avg:15.8, trend:+1.2, best:"Découverte", weak:"Accroche", lastActive:"Aujourd'hui", scores:[11,13,14,14.5,15,15.8], streak:5, gender:"F" },
  { name:"Lucas Martin", role:"AE", sessions:18, avg:14.2, trend:+0.8, best:"Engagement", weak:"Objections", lastActive:"Aujourd'hui", scores:[12,12.5,13,13.8,14,14.2], streak:3, gender:"M" },
  { name:"Amira Khelifi", role:"SDR", sessions:31, avg:16.4, trend:+2.1, best:"Création d'enjeu", weak:"Accroche", lastActive:"Hier", scores:[12,13.5,14.5,15,16,16.4], streak:8, gender:"F" },
  { name:"Thomas Blanc", role:"AE", sessions:9, avg:11.5, trend:-0.3, best:"Argumentation", weak:"Découverte", lastActive:"Il y a 3 jours", scores:[12,12,11.5,11.8,11.2,11.5], streak:0, gender:"M" },
  { name:"Julie Perrin", role:"SDR", sessions:15, avg:13.6, trend:+0.5, best:"Objections", weak:"Engagement", lastActive:"Aujourd'hui", scores:[11,12,12.5,13,13.2,13.6], streak:2, gender:"F" },
];

const recentSims = [
  { user:"Sarah Morel", scenario:"Maintenance prédictive IoT", type:"Prospection", score:16.2, result:"RDV obtenu", time:"09:42" },
  { user:"Amira Khelifi", scenario:"Défendre un devis 185K€", type:"Négociation", score:17.1, result:"Deal signé", time:"09:15" },
  { user:"Lucas Martin", scenario:"Caisse iPad restaurant", type:"Prospection", score:14.8, result:"RDV obtenu", time:"08:58" },
  { user:"Julie Perrin", scenario:"Client mécontent ménage", type:"Réclamation", score:12.9, result:"Client sauvé", time:"Hier 17:30" },
  { user:"Thomas Blanc", scenario:"Solution RH / Paie", type:"Prospection", score:10.4, result:"Refus", time:"Hier 16:12" },
  { user:"Sarah Morel", scenario:"Logiciel DMS concession", type:"Prospection", score:15.6, result:"RDV obtenu", time:"Hier 14:20" },
];

const teamForce3D = { accroche: 12.4, decouverte: 14.8, creation_enjeu: 15.6,
  argumentation: 14.1, objections: 13.2, engagement: 15.1 };

function RadarTeam(){

  const C = useColors(); const comps=Object.entries(teamForce3D);
  const labels={ "accroche":"Accroche","decouverte":"Découverte","creation_enjeu":"Enjeu","argumentation":"Argument.","objections":"Objections","engagement":"Engagement" };
  const cx=120,cy=120,r=90;
  const step=(Math.PI*2)/comps.length;
  const pt=(i,v)=>{ const a=step*i-Math.PI/2;const d=(v/20)*r;return{ x:cx+Math.cos(a)*d,y:cy+Math.sin(a)*d }; };
  const grid=[5,10,15,20];
  const dp=comps.map(([_,v],i)=>pt(i,v));
  const path=dp.map((p,i)=>`${ i===0?"M":"L" } ${ p.x } ${ p.y }`).join(" ")+" Z";

  return(
    <svg viewBox="0 0 240 240" style={ { width:"100%",maxWidth:220 } }>
      { grid.map(l=>{ const ps=comps.map((_,i)=>pt(i,l));const d=ps.map((p,i)=>`${ i===0?"M":"L" } ${ p.x } ${ p.y }`).join(" ")+" Z";return <path key={ l } d={ d } fill="none" stroke={ C.bd } strokeWidth={ 0.5 } opacity={ 0.5 }/>; }) }
      { comps.map((_,i)=>{ const p=pt(i,20);return <line key={ i } x1={ cx } y1={ cy } x2={ p.x } y2={ p.y } stroke={ C.bd } strokeWidth={ 0.5 } opacity={ 0.3 }/>; }) }
      <path d={ path } fill={ `${ C.ac }18` } stroke={ C.ac } strokeWidth={ 2 }/>
      { dp.map((p,i)=><circle key={ i } cx={ p.x } cy={ p.y } r={ 3.5 } fill={ comps[i][1]>=14?C.ok:comps[i][1]>=10?C.wr:C.dn } stroke={ C.bg } strokeWidth={ 2 }/>) }
      { comps.map(([k],i)=>{ const p=pt(i,24);return <text key={ k } x={ p.x } y={ p.y } textAnchor="middle" dominantBaseline="middle" fill={ C.mt } fontSize={ 8 } fontWeight={ 600 }>{ labels[k] }</text>; }) }
    </svg>
  ); }

function StatCard({ label,value,sub,icon,trend }){

  const C = useColors(); return(
    <div style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:14,padding:"20px 18px",flex:1,minWidth:160 } }>
      <div style={ { display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 } }>
        <div style={ { fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:C.mt } }>{ label }</div>
        <span style={ { fontSize:18 } }>{ icon }</span>
      </div>
      <div style={ { fontSize:28,fontWeight:200,color:C.tx,lineHeight:1,marginBottom:4 } }>{ value }</div>
      <div style={ { display:"flex",alignItems:"center",gap:6 } }>
        { trend!==undefined&&<span style={ { fontSize:11,fontWeight:600,color:trend>=0?C.ok:C.dn } }>{ trend>=0?`↑ +${ trend }`:`↓ ${ trend }` }</span> }
        <span style={ { fontSize:11,color:C.dm } }>{ sub }</span>
      </div>
    </div>
  ); }

function TeamTable({ onSelect }){

  const C = useColors(); const [sort,setSort]=useState("avg");
  const sorted=[...team].sort((a,b)=>sort==="avg"?b.avg-a.avg:sort==="sessions"?b.sessions-a.sessions:b.trend-a.trend);

  return(
    <div style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:16,overflow:"hidden" } }>
      <div style={ { padding:"18px 20px",borderBottom:`1px solid ${ C.bd }`,display:"flex",justifyContent:"space-between",alignItems:"center" } }>
        <div style={ { fontSize:14,fontWeight:600 } }>Équipe commerciale</div>
        <div style={ { display:"flex",gap:6 } }>
          { [{ k:"avg",l:"Score" },{ k:"sessions",l:"Activité" },{ k:"trend",l:"Progression" }].map(s=>(
            <button key={ s.k } onClick={ ()=>setSort(s.k) } style={ { padding:"4px 12px",borderRadius:6,border:"none",background:sort===s.k?C.acD:"transparent",color:sort===s.k?C.ac:C.dm,fontSize:11,fontWeight:600,cursor:"pointer" } }>{ s.l }</button>
          )) }
        </div>
      </div>
      { sorted.map((m,i)=>(
        <div key={ i } onClick={ ()=>onSelect?.(m) } style={ { padding:"14px 20px",borderBottom:i<sorted.length-1?`1px solid ${ C.bd }10`:"none",display:"flex",alignItems:"center",gap:14,cursor:"pointer",transition:"background 0.15s" } }
          onMouseEnter={ e=>e.currentTarget.style.background=C.bgE }
          onMouseLeave={ e=>e.currentTarget.style.background="transparent" }>
          <div style={ { fontSize:12,fontWeight:700,color:C.dm,width:20,textAlign:"center" } }>{ i+1 }</div>
          <Avatar name={ m.name } gender={ m.gender } size={ 36 }/>
          <div style={ { flex:1,minWidth:0 } }>
            <div style={ { display:"flex",alignItems:"center",gap:8 } }>
              <span style={ { fontSize:14,fontWeight:600 } }>{ m.name }</span>
              <Badge color="muted">{ m.role }</Badge>
              { m.streak>=5&&<Badge color="ok">🔥 { m.streak }j</Badge> }
            </div>
            <div style={ { display:"flex",alignItems:"center",gap:12,marginTop:4 } }>
              <span style={ { fontSize:11,color:C.dm } }>Force : <span style={ { color:C.ok,fontWeight:600 } }>{ m.best }</span></span>
              <span style={ { fontSize:11,color:C.dm } }>Axe : <span style={ { color:C.wr,fontWeight:600 } }>{ m.weak }</span></span>
            </div>
          </div>
          <MiniSparkline data={ m.scores } color={ m.trend>=0?C.ok:C.dn }/>
          <div style={ { textAlign:"right",minWidth:60 } }>
            <div style={ { fontSize:20,fontWeight:300,color:C.tx } }>{ m.avg }</div>
            <div style={ { fontSize:11,fontWeight:600,color:m.trend>=0?C.ok:C.dn } }>{ m.trend>=0?"+":"" }{ m.trend }</div>
          </div>
          <div style={ { textAlign:"right",minWidth:50 } }>
            <div style={ { fontSize:14,fontWeight:600,color:C.tx } }>{ m.sessions }</div>
            <div style={ { fontSize:10,color:C.dm } }>sessions</div>
          </div>
        </div>
      )) }
    </div>
  ); }

function RecentActivity(){

  const C = useColors(); return(
    <div style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:16,overflow:"hidden" } }>
      <div style={ { padding:"18px 20px",borderBottom:`1px solid ${ C.bd }` } }>
        <div style={ { fontSize:14,fontWeight:600 } }>Activité récente</div>
      </div>
      { recentSims.map((s,i)=>(
        <div key={ i } style={ { padding:"12px 20px",borderBottom:i<recentSims.length-1?`1px solid ${ C.bd }10`:"none",display:"flex",alignItems:"center",gap:12 } }>
          <div style={ { width:36,height:36,borderRadius:10,background:s.score>=15?C.okD:s.score>=12?C.wrD:C.dnD,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:s.score>=15?C.ok:s.score>=12?C.wr:C.dn } }>{ s.score.toFixed(1) }</div>
          <div style={ { flex:1,minWidth:0 } }>
            <div style={ { fontSize:13,fontWeight:500 } }><span style={ { fontWeight:600 } }>{ s.user }</span> <span style={ { color:C.dm } }>·</span> <span style={ { color:C.mt } }>{ s.scenario }</span></div>
            <div style={ { display:"flex",gap:6,marginTop:4 } }>
              <Badge color={ s.type==="Prospection"?"blue":s.type==="Négociation"?"accent":"warn" }>{ s.type }</Badge>
              <Badge color={ s.result.includes("obtenu")||s.result.includes("signé")||s.result.includes("sauvé")?"ok":"danger" }>{ s.result }</Badge>
            </div>
          </div>
          <span style={ { fontSize:11,color:C.dm,flexShrink:0 } }>{ s.time }</span>
        </div>
      )) }
    </div>
  ); }

function CompetenceAlerts(){

  const C = useColors(); const alerts=[
    { type:"danger",icon:"⚠️",msg:"Thomas Blanc n'a pas fait de simulation depuis 3 jours",action:"Envoyer un rappel" },
    { type:"warn",icon:"📊",msg:"L'accroche est la compétence la plus faible de l'équipe (12.4/20)",action:"Assigner un exercice" },
    { type:"ok",icon:"🏆",msg:"Amira Khelifi a une série de 8 jours consécutifs",action:"Féliciter" },
  ];
  return(
    <div style={ { display:"flex",flexDirection:"column",gap:8 } }>
      { alerts.map((a,i)=>{ const colors={ danger:{ bg:C.dnD,border:"rgba(212,90,90,0.2)",text:C.dn },warn:{ bg:C.wrD,border:"rgba(212,168,74,0.2)",text:C.wr },ok:{ bg:C.okD,border:"rgba(61,176,107,0.2)",text:C.ok } };
        const c=colors[a.type];
        return(
          <div key={ i } style={ { background:c.bg,border:`1px solid ${ c.border }`,borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:12 } }>
            <span style={ { fontSize:16 } }>{ a.icon }</span>
            <div style={ { flex:1 } }>
              <div style={ { fontSize:13,color:C.tx,lineHeight:1.4 } }>{ a.msg }</div>
            </div>
            <button style={ { padding:"6px 14px",borderRadius:8,border:`1px solid ${ c.border }`,background:"transparent",color:c.text,fontSize:11,fontWeight:600,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap" } }>{ a.action }</button>
          </div>
        ); }) }
    </div>
  ); }

export default function Dashboard(){
  const C = useColors(); const [period,setPeriod]=useState("30j");

  return(
    <div style={ { minHeight:"100vh",background:C.bg,color:C.tx,fontFamily:"'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif",overflowX:"hidden" } }>

      { /* NAV */ }
      <div style={ { display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",borderBottom:`1px solid ${ C.bd }`,background:`${ C.bg }E0`,backdropFilter:"blur(12px)",position:"sticky",top:0,zIndex:100 } }>
        <div style={ { display:"flex",alignItems:"center",gap:10 } }>
          <div style={ { width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${ C.ac },${ C.acL })`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#fff" } }>V</div>
          <span style={ { fontSize:16,fontWeight:600,letterSpacing:-0.3 } }>Vend<span style={ { color:C.ac } }>Mieux</span></span>
          <Badge color="muted">Manager</Badge>
        </div>
        <div style={ { display:"flex",alignItems:"center",gap:16 } }>
          <span style={ { fontSize:12,color:C.mt } }>Jean-François P.</span>
          <Avatar name="Jean-François Perrin" gender="M" size={ 30 }/>
        </div>
      </div>

      <div style={ { maxWidth:1080,margin:"0 auto",padding:"28px 20px" } }>
        { /* Header */ }
        <div style={ { display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:28,flexWrap:"wrap",gap:16 } }>
          <div>
            <h1 style={ { fontSize:26,fontWeight:300,margin:"0 0 4px",letterSpacing:-0.5 } }>
              Tableau de bord <span style={ { fontWeight:700,color:C.ac } }>manager</span>
            </h1>
            <p style={ { fontSize:13,color:C.dm,margin:0 } }>Équipe commerciale · 5 membres · Dernière activité il y a 23 min</p>
          </div>
          <div style={ { display:"inline-flex",background:C.bgC,borderRadius:8,padding:3,border:`1px solid ${ C.bd }` } }>
            { ["7j","30j","90j"].map(p=>(
              <button key={ p } onClick={ ()=>setPeriod(p) } style={ { padding:"6px 16px",borderRadius:6,border:"none",background:period===p?C.bgE:"transparent",color:period===p?C.tx:C.dm,fontSize:12,fontWeight:500,cursor:"pointer" } }>{ p }</button>
            )) }
          </div>
        </div>

        { /* Stat cards */ }
        <div style={ { display:"flex",gap:12,marginBottom:20,flexWrap:"wrap" } }>
          <StatCard label="Score moyen" value="14.3" sub="vs 13.1 mois dernier" icon="📊" trend={ 1.2 }/>
          <StatCard label="Sessions ce mois" value="97" sub="objectif : 100" icon="🎯" trend={ 12 }/>
          <StatCard label="Taux de RDV simulé" value="68%" sub="vs 54% mois dernier" icon="📈" trend={ 14 }/>
          <StatCard label="Série max" value="8j" sub="Amira Khelifi" icon="🔥"/>
        </div>

        { /* Alerts */ }
        <div style={ { marginBottom:20 } }>
          <CompetenceAlerts/>
        </div>

        { /* Main grid */ }
        <div className="vm-grid-sidebar" style={ { display:"grid",gridTemplateColumns:"1fr 340px",gap:16,marginBottom:20 } }>
          { /* Team table */ }
          <TeamTable/>

          { /* Right column */ }
          <div style={ { display:"flex",flexDirection:"column",gap:16 } }>
            { /* Radar */ }
            <div style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:16,padding:20 } }>
              <div style={ { fontSize:12,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:C.mt,marginBottom:16 } }>FORCE 3D — Moyenne équipe</div>
              <div style={ { display:"flex",justifyContent:"center" } }>
                <RadarTeam/>
              </div>
              <div style={ { marginTop:12,padding:"10px 12px",background:C.acD,borderRadius:8 } }>
                <div style={ { fontSize:11,color:C.ac,fontWeight:600 } }>💡 Priorité coaching</div>
                <div style={ { fontSize:12,color:C.tx,marginTop:2 } }>L'accroche est le maillon faible. Assignez le module "Accroche en 10 secondes".</div>
              </div>
            </div>

            { /* Weekly goal */ }
            <div style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:16,padding:20 } }>
              <div style={ { fontSize:12,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:C.mt,marginBottom:14 } }>Objectif hebdo</div>
              <div style={ { display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 } }>
                <span style={ { fontSize:13 } }>3 simulations / personne</span>
                <span style={ { fontSize:13,fontWeight:600,color:C.ac } }>78%</span>
              </div>
              <div style={ { height:6,background:C.bd,borderRadius:3,overflow:"hidden",marginBottom:14 } }>
                <div style={ { width:"78%",height:"100%",background:`linear-gradient(90deg,${ C.ac },${ C.acL })`,borderRadius:3 } }/>
              </div>
              <div style={ { display:"flex",flexDirection:"column",gap:6 } }>
                { team.map((m,i)=>{ const pct=Math.min(100,Math.round((m.sessions/12)*100));
                  return(
                    <div key={ i } style={ { display:"flex",alignItems:"center",gap:8 } }>
                      <span style={ { fontSize:11,color:C.mt,width:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" } }>{ m.name.split(" ")[0] }</span>
                      <div style={ { flex:1,height:3,background:C.bd,borderRadius:2,overflow:"hidden" } }>
                        <div style={ { width:`${ pct }%`,height:"100%",background:pct>=100?C.ok:pct>=60?C.ac:C.dn,borderRadius:2 } }/>
                      </div>
                      <span style={ { fontSize:10,color:pct>=100?C.ok:C.dm,fontWeight:600,width:28,textAlign:"right" } }>{ pct }%</span>
                    </div>
                  ); }) }
              </div>
            </div>
          </div>
        </div>

        { /* Recent activity */ }
        <RecentActivity/>
      </div>
    </div>
  ); }
