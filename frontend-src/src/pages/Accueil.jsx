import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useColors, Badge, Avatar, WaveformAnim, CountUp, MiniSparkline, Nav, Footer } from "../shared";

/* ======== HERO ======== */
function Hero(){
  const C = useColors(); const navigate = useNavigate(); return(
    <div style={ { position:"relative",overflow:"hidden",padding:"80px 24px 72px",textAlign:"center" } }>
      <div style={ { position:"absolute",top:"-20%",left:"50%",transform:"translateX(-50%)",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(212,133,74,0.06) 0%,transparent 70%)",pointerEvents:"none" } }/>
      <div style={ { position:"relative",maxWidth:720,margin:"0 auto" } }>
        <div style={ { display:"inline-flex",alignItems:"center",gap:8,padding:"6px 16px",borderRadius:20,background:C.acD,color:C.ac,fontSize:12,fontWeight:600,marginBottom:28,border:"1px solid rgba(212,133,74,0.2)" } }>
          <span style={ { width:6,height:6,borderRadius:"50%",background:C.ac,animation:"pulse 2s infinite" } }/>
          Simulateur vocal IA · Méthode française FORCE 3D
        </div>
        <h1 style={ { fontSize:46,fontWeight:300,margin:"0 0 20px",letterSpacing:-1,lineHeight:1.15 } }>
          Vos commerciaux s'entraînent<br/>sur <span style={ { fontWeight:700,color:C.ac } }>de vrais prospects IA</span>
        </h1>
        <p style={ { fontSize:17,color:C.mt,maxWidth:540,margin:"0 auto 36px",lineHeight:1.65 } }>
          Simulation vocale réaliste. Débriefing instantané. Progression mesurable. 12 scénarios conçus pour les PME françaises.
        </p>
        <div className="vm-btn-row" style={ { display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginBottom:48 } }>
          <button onClick={ ()=>navigate("/simulation") } style={ { padding:"15px 32px",background:`linear-gradient(135deg,${ C.ac },${ C.acL })`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",boxShadow:"0 4px 24px rgba(212,133,74,0.3)" } }>
            Essayez gratuitement →
          </button>
          <button onClick={ ()=>navigate("/produit") } style={ { padding:"15px 32px",background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:12,color:C.tx,fontSize:15,fontWeight:500,cursor:"pointer" } }>
            Voir comment ça marche
          </button>
        </div>
        <div style={ { fontSize:12,color:C.dm,marginBottom:40 } }>Sans carte bancaire · 1 simulation gratuite · Résultat immédiat</div>

        { /* Mini call preview */ }
        <div style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:20,padding:"32px 28px",maxWidth:480,margin:"0 auto" } }>
          <div style={ { display:"flex",alignItems:"center",gap:12,marginBottom:20 } }>
            <div style={ { display:"inline-flex",alignItems:"center",gap:6,padding:"4px 12px",borderRadius:16,background:C.acD } }>
              <div style={ { width:6,height:6,borderRadius:"50%",background:C.ac,animation:"pulse 1.5s infinite" } }/>
              <span style={ { fontSize:11,fontWeight:600,color:C.ac } }>Simulation en cours</span>
            </div>
            <span style={ { fontSize:12,color:C.dm,marginLeft:"auto",fontVariantNumeric:"tabular-nums" } }>2:47</span>
          </div>
          <div style={ { display:"flex",alignItems:"center",gap:16,marginBottom:20 } }>
            <Avatar name="Olivier Bertrand" gender="M" size={ 52 }/>
            <div>
              <div style={ { fontSize:16,fontWeight:600 } }>Olivier Bertrand</div>
              <div style={ { fontSize:12,color:C.mt } }>DG · MécaPress · Mécanique de précision</div>
            </div>
          </div>
          <WaveformAnim/>
          <div style={ { marginTop:20,padding:"12px 16px",background:"rgba(212,133,74,0.06)",borderRadius:10,border:"1px solid rgba(212,133,74,0.12)" } }>
            <div style={ { fontSize:11,color:C.ac,fontWeight:600,marginBottom:4 } }>💡 Le prospect vient de mentionner</div>
            <div style={ { fontSize:13,color:C.tx,lineHeight:1.5 } }>"On a eu 3 arrêts machines non planifiés le mois dernier..."</div>
          </div>
        </div>
      </div>
      <style>{ `@keyframes pulse{ 0%,100%{ opacity:1 }50%{ opacity:0.4 } }` }</style>
    </div>
  ); }

/* ======== PROBLEM ======== */
function Problem(){
  const C = useColors(); const problems=[
    { icon:"🎯",title:"Vos commerciaux apprennent sur vos vrais prospects",desc:"Chaque appel raté coûte un deal. Chaque deal perdu coûte de la croissance. Pas de bouton 'recommencer'." },
    { icon:"🎭",title:"Les jeux de rôle entre collègues ne marchent pas",desc:"Trop gentils, pas réalistes, pas mesurables. Le collègue décroche au bout de 2 minutes." },
    { icon:"📉",title:"La formation présentielle s'oublie en 2 semaines",desc:"2 000€ la journée. Un formateur brillant. 15 jours plus tard, tout est oublié." },
  ];
  return(
    <div style={ { padding:"72px 24px",maxWidth:960,margin:"0 auto" } }>
      <div style={ { textAlign:"center",marginBottom:48 } }>
        <div style={ { fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.mt,marginBottom:12 } }>Le problème</div>
        <h2 className="vm-h2" style={ { fontSize:30,fontWeight:300,margin:0 } }>Former des commerciaux, c'est <span style={ { fontWeight:700,color:C.ac } }>un casse-tête</span></h2>
      </div>
      <div style={ { display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16 } }>
        { problems.map((p,i)=>(
          <div key={ i } style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:16,padding:"28px 24px" } }>
            <div style={ { fontSize:28,marginBottom:16 } }>{ p.icon }</div>
            <h3 style={ { fontSize:16,fontWeight:600,margin:"0 0 10px",lineHeight:1.3 } }>{ p.title }</h3>
            <p style={ { fontSize:13,color:C.mt,lineHeight:1.6,margin:0 } }>{ p.desc }</p>
          </div>
        )) }
      </div>
    </div>
  ); }

/* ======== HOW IT WORKS ======== */
function HowItWorks(){
  const C = useColors(); const [active,setActive]=useState(0);
  const steps=[
    { num:"01",title:"Briefing",subtitle:"Préparez votre appel",desc:"Contexte complet : qui vous êtes, ce que vous vendez, qui vous appelez, ce que vous savez. Comme un vrai brief commercial.",color:C.bl,
      preview:(
        <div style={ { display:"flex",flexDirection:"column",gap:10 } }>
          <div style={ { background:C.blD,borderRadius:10,padding:"12px 16px" } }>
            <div style={ { fontSize:10,fontWeight:700,letterSpacing:1,color:C.bl,marginBottom:6 } }>🎯 OBJECTIF</div>
            <div style={ { fontSize:14,fontWeight:600 } }>Décrocher un RDV de 30 min sur site</div>
          </div>
          <div className="vm-grid-2" style={ { display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 } }>
            <div style={ { background:"rgba(74,127,212,0.06)",borderRadius:8,padding:"10px 12px" } }>
              <div style={ { fontSize:10,color:C.bl,fontWeight:600,marginBottom:4 } }>VOUS ÊTES</div>
              <div style={ { fontSize:12 } }>Commercial TechMaint Solutions</div>
            </div>
            <div style={ { background:"rgba(74,127,212,0.06)",borderRadius:8,padding:"10px 12px" } }>
              <div style={ { fontSize:10,color:C.bl,fontWeight:600,marginBottom:4 } }>VOUS APPELEZ</div>
              <div style={ { fontSize:12 } }>Olivier Bertrand, DG</div>
            </div>
          </div>
        </div>
      ) },
    { num:"02",title:"Simulation",subtitle:"Parlez à un vrai prospect IA",desc:"Conversation vocale temps réel. Le prospect IA a ses objections, son emploi du temps chargé, sa méfiance. Il peut être convaincu — si vous êtes bon.",color:C.ac,
      preview:(
        <div style={ { display:"flex",flexDirection:"column",alignItems:"center",gap:16 } }>
          <div style={ { display:"flex",alignItems:"center",gap:8 } }>
            <div style={ { width:8,height:8,borderRadius:"50%",background:C.ac,animation:"pulse 1.5s infinite" } }/>
            <span style={ { fontSize:12,fontWeight:600,color:C.ac } }>Appel en cours — 2:47</span>
          </div>
          <Avatar name="Olivier Bertrand" gender="M" size={ 48 }/>
          <WaveformAnim/>
        </div>
      ) },
    { num:"03",title:"Débriefing",subtitle:"Évaluation FORCE 3D instantanée",desc:"Score sur 20, radar de compétences, points forts, axes de progression, conseil prioritaire. En 30 secondes, vous savez quoi travailler.",color:C.ok,
      preview:(
        <div style={ { display:"flex",flexDirection:"column",gap:10 } }>
          <div style={ { display:"flex",alignItems:"center",justifyContent:"center",gap:12 } }>
            <span style={ { fontSize:36,fontWeight:200 } }>14.2</span>
            <span style={ { fontSize:14,color:C.dm } }>/20</span>
            <Badge color="accent" size="sm">Note B</Badge>
          </div>
          <div style={ { display:"flex",flexDirection:"column",gap:6 } }>
            { [{ l:"Création d'enjeu",s:17,c:C.ok },{ l:"Engagement",s:17,c:C.ok },{ l:"Découverte",s:16,c:C.ok },{ l:"Argumentation",s:14,c:C.ac },{ l:"Accroche",s:11,c:C.wr }].map((x,i)=>(
              <div key={ i } style={ { display:"flex",alignItems:"center",gap:10 } }>
                <span style={ { fontSize:11,color:C.mt,width:100,textAlign:"right" } }>{ x.l }</span>
                <div style={ { flex:1,height:4,background:C.bd,borderRadius:2,overflow:"hidden" } }>
                  <div style={ { width:`${ (x.s/20)*100 }%`,height:"100%",background:x.c,borderRadius:2 } }/>
                </div>
                <span style={ { fontSize:12,fontWeight:600,color:x.c,width:24 } }>{ x.s }</span>
              </div>
            )) }
          </div>
        </div>
      ) },
  ];
  return(
    <div style={ { padding:"72px 24px",maxWidth:960,margin:"0 auto" } }>
      <div style={ { textAlign:"center",marginBottom:48 } }>
        <div style={ { fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.mt,marginBottom:12 } }>Comment ça marche</div>
        <h2 className="vm-h2" style={ { fontSize:30,fontWeight:300,margin:0 } }><span style={ { fontWeight:700,color:C.ac } }>3 étapes</span>, 10 minutes, progression immédiate</h2>
      </div>
      <div style={ { display:"flex",gap:8,marginBottom:32,justifyContent:"center",flexWrap:"wrap" } }>
        { steps.map((s,i)=>(
          <button key={ i } onClick={ ()=>setActive(i) } style={ { padding:"10px 20px",borderRadius:10,border:`1px solid ${ active===i?s.color+"50":C.bd }`,background:active===i?s.color+"12":"transparent",color:active===i?s.color:C.mt,fontSize:13,fontWeight:active===i?600:400,cursor:"pointer",transition:"all 0.2s",display:"flex",alignItems:"center",gap:8 } }>
            <span style={ { fontSize:11,fontWeight:700,opacity:0.6 } }>{ s.num }</span>{ s.title }
          </button>
        )) }
      </div>
      <div className="vm-grid-2" style={ { display:"grid",gridTemplateColumns:"1fr 1fr",gap:32,alignItems:"center" } }>
        <div>
          <h3 style={ { fontSize:22,fontWeight:600,margin:"0 0 6px",color:steps[active].color } }>{ steps[active].title }</h3>
          <div style={ { fontSize:14,color:C.mt,fontWeight:500,marginBottom:16 } }>{ steps[active].subtitle }</div>
          <p style={ { fontSize:14,color:C.mt,lineHeight:1.7,margin:0 } }>{ steps[active].desc }</p>
        </div>
        <div style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:16,padding:24,minHeight:200 } }>
          { steps[active].preview }
        </div>
      </div>
    </div>
  ); }

/* ======== NUMBERS ======== */
function Numbers(){
  const C = useColors(); const stats=[
    { value:12,suffix:"",label:"Scénarios réels",sub:"12 secteurs PME françaises" },
    { value:5,suffix:"",label:"Types de situations",sub:"Prospection, négociation, réclamation..." },
    { value:6,suffix:"",label:"Compétences évaluées",sub:"Méthode FORCE 3D exclusive" },
    { value:49,suffix:"€",label:"Par commercial / mois",sub:"100x moins cher qu'un formateur" },
  ];
  return(
    <div style={ { padding:"72px 24px" } }>
      <div style={ { maxWidth:960,margin:"0 auto",background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:20,padding:"40px 32px" } }>
        <div style={ { display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:32 } }>
          { stats.map((s,i)=>(
            <div key={ i } style={ { textAlign:"center" } }>
              <div style={ { fontSize:42,fontWeight:200,color:C.ac,lineHeight:1,marginBottom:8 } }><CountUp target={ s.value } suffix={ s.suffix }/></div>
              <div style={ { fontSize:14,fontWeight:600,marginBottom:4 } }>{ s.label }</div>
              <div style={ { fontSize:12,color:C.dm } }>{ s.sub }</div>
            </div>
          )) }
        </div>
      </div>
    </div>
  ); }

/* ======== DASHBOARD PREVIEW (SUPER ANIMATED) ======== */
function DashboardPreview(){
  const C = useColors(); const actPool=[
    { user:"Sarah Morel",sc:"Maintenance prédictive IoT",type:"Prospection",score:16.2,result:"RDV obtenu" },
    { user:"Amira Khelifi",sc:"Défendre un devis 185K€",type:"Négociation",score:17.1,result:"Deal signé" },
    { user:"Lucas Martin",sc:"Caisse iPad restaurant",type:"Prospection",score:14.8,result:"RDV obtenu" },
    { user:"Julie Perrin",sc:"Client mécontent ménage",type:"Réclamation",score:12.9,result:"Client sauvé" },
    { user:"Thomas Blanc",sc:"Solution RH / Paie",type:"Prospection",score:10.4,result:"Refus" },
    { user:"Sarah Morel",sc:"Logiciel vétérinaire",type:"Prospection",score:15.6,result:"RDV obtenu" },
    { user:"Amira Khelifi",sc:"Location matériel BTP",type:"Prospection",score:16.8,result:"RDV obtenu" },
    { user:"Lucas Martin",sc:"Cybersécurité SOC managé",type:"Multi-interlo.",score:13.5,result:"Rappel planifié" },
    { user:"Julie Perrin",sc:"Assurance flotte auto",type:"Prospection",score:14.1,result:"RDV obtenu" },
    { user:"Amira Khelifi",sc:"ERP cloud industriel",type:"Prospection",score:18.2,result:"Deal signé" },
    { user:"Sarah Morel",sc:"Photocopieurs connectés",type:"Prospection",score:15.1,result:"RDV obtenu" },
    { user:"Thomas Blanc",sc:"Nettoyage industriel",type:"Prospection",score:11.8,result:"Rappel planifié" },
  ];
  const toasts=[
    { icon:"🏆",text:"Amira Khelifi vient de battre son record : 18.2/20 !",c:C.ok },
    { icon:"🔥",text:"Sarah Morel : 6ème jour consécutif",c:C.ac },
    { icon:"📈",text:"Score moyen en hausse de +1.2 ce mois",c:C.ok },
    { icon:"⚠️",text:"Thomas Blanc inactif depuis 3 jours",c:C.dn },
    { icon:"🎯",text:"Objectif hebdo : plus que 2 sessions !",c:C.ac },
    { icon:"💡",text:"Assignez le module Accroche à l'équipe",c:C.bl },
    { icon:"🏆",text:"Lucas Martin +2.1 pts ce mois",c:C.ok },
    { icon:"📊",text:"Rapport mensuel disponible",c:C.bl },
  ];
  const simNames=["Sarah Morel","Lucas Martin","Amira Khelifi","Julie Perrin"];
  const simScens=["Prospection IoT","Négociation prix","Réclamation client","Closing RDV"];

  const [tk,setTk]=useState(0);
  const [sess,setSess]=useState(97);
  const [avg,setAvg]=useState(14.3);
  const [rdv,setRdv]=useState(68);
  const [fi,setFi]=useState(2);
  const [feed,setFeed]=useState(actPool.slice(0,5));
  const [fl,setFl]=useState(-1);
  const [rP,setRP]=useState(false);
  const [wk,setWk]=useState(72);
  const [toast,setToast]=useState(null);
  const [ti,setTi]=useState(0);
  const [sim,setSim]=useState({ name:simNames[0],sc:simScens[0] });
  const [sT,setST]=useState(0);
  const [pop,setPop]=useState(null);

  useEffect(()=>{ const iv=setInterval(()=>setTk(t=>t+1),2500);return()=>clearInterval(iv); },[]);

  // Feed every 3s
  useEffect(()=>{ const iv=setInterval(()=>{ setFi(p=>{ const n=(p+1)%actPool.length;const it=actPool[n];
      setFeed(o=>[it,...o].slice(0,5));setFl(0);setTimeout(()=>setFl(-1),1500);
      setPop({ s:it.score,x:30+Math.random()*40,y:20+Math.random()*20 });
      setTimeout(()=>setPop(null),2000);
      return n; });
    setSess(s=>s+1);
    setAvg(s=>Math.round((s+(Math.random()-0.3)*0.3)*10)/10);
    setRdv(r=>Math.min(99,r+(Math.random()>0.5?1:0)));
    setWk(w=>Math.min(100,w+Math.floor(Math.random()*4)));
    setRP(true);setTimeout(()=>setRP(false),1000); },3000);return()=>clearInterval(iv); },[]);

  // Toast every 5s
  useEffect(()=>{ const iv=setInterval(()=>{ setTi(p=>{ const n=(p+1)%toasts.length;setToast(toasts[n]);setTimeout(()=>setToast(null),3500);return n; }); },5000);
    const f=setTimeout(()=>{ setToast(toasts[0]);setTimeout(()=>setToast(null),3500); },1500);
    return()=>{ clearInterval(iv);clearTimeout(f); }; },[]);

  // Sim in progress
  useEffect(()=>{ let i=0;const iv=setInterval(()=>{ i++;setSim({ name:simNames[i%4],sc:simScens[i%4] });setST(0); },8000);return()=>clearInterval(iv); },[]);
  useEffect(()=>{ const iv=setInterval(()=>setST(t=>t+1),1000);return()=>clearInterval(iv); },[]);

  const tf={ accroche:12.4,decouverte:14.8,enjeu:15.6,argumentation:14.1,objections:13.2,engagement:15.1 };
  const af=Object.fromEntries(Object.entries(tf).map(([k,v])=>[k,v+Math.sin(tk*0.6+k.length)*0.4]));
  const cs=Object.entries(af);
  const lb={ accroche:"Accroche",decouverte:"Découverte",enjeu:"Enjeu",argumentation:"Argument.",objections:"Objections",engagement:"Engagement" };
  const cx2=100,cy2=100,rr=75,sp=(Math.PI*2)/cs.length;
  const pt2=(i,v)=>{ const a=sp*i-Math.PI/2;const d=(v/20)*rr;return{ x:cx2+Math.cos(a)*d,y:cy2+Math.sin(a)*d }; };
  const dp2=cs.map(([_,v],i)=>pt2(i,v));
  const rp=dp2.map((p,i)=>`${ i===0?"M":"L" } ${ p.x } ${ p.y }`).join(" ")+" Z";

  const mbs=[
    { name:"Sarah Morel",role:"SDR",avg:15.8+Math.sin(tk*0.7)*0.2,trend:+1.2,scores:[11,13,14,14.5,15,15.8],streak:5+Math.floor(tk/10),gender:"F",best:"Découverte",weak:"Accroche",sess:24+Math.floor(tk/2) },
    { name:"Amira Khelifi",role:"SDR",avg:16.4+Math.sin(tk*0.5)*0.15,trend:+2.1,scores:[12,13.5,14.5,15,16,16.4],streak:8,gender:"F",best:"Enjeu",weak:"Accroche",sess:31+Math.floor(tk/2) },
    { name:"Lucas Martin",role:"AE",avg:14.2+Math.sin(tk*0.8)*0.2,trend:+0.8,scores:[12,12.5,13,13.8,14,14.2],streak:3,gender:"M",best:"Engagement",weak:"Objections",sess:18+Math.floor(tk/3) },
    { name:"Thomas Blanc",role:"AE",avg:11.5+Math.sin(tk*0.4)*0.1,trend:-0.3,scores:[12,12,11.5,11.8,11.2,11.5],streak:0,gender:"M",best:"Argument.",weak:"Découverte",sess:9+Math.floor(tk/5) },
  ];

  const fmt=s=>`${ Math.floor(s/60) }:${ (s%60).toString().padStart(2,"0") }`;
  const ok=s=>s.includes("obtenu")||s.includes("signé")||s.includes("sauvé");

  return(
    <div style={ { padding:"72px 24px",maxWidth:960,margin:"0 auto" } }>
      <div style={ { textAlign:"center",marginBottom:48 } }>
        <div style={ { fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.mt,marginBottom:12 } }>Pour les managers</div>
        <h2 className="vm-h2" style={ { fontSize:30,fontWeight:300,margin:"0 0 12px" } }>Pilotez la progression de votre équipe <span style={ { fontWeight:700,color:C.ac } }>en temps réel</span></h2>
        <p style={ { fontSize:15,color:C.mt,maxWidth:500,margin:"0 auto",lineHeight:1.6 } }>Qui s'entraîne, qui progresse, où concentrer le coaching. Plus besoin de deviner.</p>
      </div>

      <div style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:20,padding:24,position:"relative",overflow:"hidden",minHeight:500 } }>
        { /* Toast */ }
        { toast&&<div style={ { position:"absolute",top:14,left:"50%",transform:"translateX(-50%)",zIndex:20,background:C.bgE,border:`1px solid ${ toast.c }40`,borderRadius:12,padding:"10px 18px",display:"flex",alignItems:"center",gap:10,boxShadow:`0 8px 32px rgba(0,0,0,0.4),0 0 20px ${ toast.c }15`,animation:"toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",maxWidth:400 } }>
          <span style={ { fontSize:18 } }>{ toast.icon }</span>
          <span style={ { fontSize:12,fontWeight:500,lineHeight:1.3 } }>{ toast.text }</span>
        </div> }

        { /* Score pop */ }
        { pop&&<div style={ { position:"absolute",top:`${ pop.y }%`,left:`${ pop.x }%`,zIndex:15,fontSize:28,fontWeight:700,color:pop.s>=15?C.ok:pop.s>=12?C.wr:C.dn,animation:"scorePop 1.8s ease-out forwards",pointerEvents:"none",textShadow:`0 0 24px ${ pop.s>=15?C.ok:C.wr }50` } }>{ pop.s.toFixed(1) }</div> }

        { /* Header bar */ }
        <div style={ { display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8 } }>
          <div style={ { display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" } }>
            <div style={ { display:"flex",alignItems:"center",gap:5,padding:"4px 12px",borderRadius:12,background:"rgba(61,176,107,0.12)",border:"1px solid rgba(61,176,107,0.25)" } }>
              <div style={ { width:7,height:7,borderRadius:"50%",background:C.ok,animation:"pulse 1.2s infinite" } }/>
              <span style={ { fontSize:10,fontWeight:700,color:C.ok,letterSpacing:0.5 } }>LIVE</span>
            </div>
            <div style={ { display:"flex",alignItems:"center",gap:6,padding:"4px 12px",borderRadius:12,background:C.acD,border:"1px solid rgba(212,133,74,0.2)",animation:"fadeIn 0.5s" } }>
              <div style={ { width:5,height:5,borderRadius:"50%",background:C.ac,animation:"pulse 1s infinite" } }/>
              <span style={ { fontSize:10,color:C.ac,fontWeight:600 } }>{ sim.name }</span>
              <span style={ { fontSize:9,color:C.dm } }>en simulation</span>
              <span style={ { fontSize:10,color:C.ac,fontWeight:700,fontVariantNumeric:"tabular-nums" } }>{ fmt(sT) }</span>
            </div>
          </div>
          <Badge color="muted">Dashboard manager</Badge>
        </div>

        { /* KPIs */ }
        <div className="vm-grid-4" style={ { display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20 } }>
          { [{ l:"Score moyen",v:avg.toFixed(1),t:"+1.2",i:"📊",c:C.ok },{ l:"Sessions",v:sess,t:`+${ sess-85 }`,i:"🎯",c:C.ok },{ l:"Taux de RDV",v:rdv+"%",t:`+${ rdv-54 }%`,i:"📈",c:C.ok },{ l:"Série max",v:"8j",t:"Amira K.",i:"🔥",c:C.ac }].map((k,i)=>(
            <div key={ i } style={ { background:C.bgE,borderRadius:12,padding:14,position:"relative",overflow:"hidden" } }>
              <div style={ { position:"absolute",top:0,left:0,right:0,bottom:0,background:`linear-gradient(90deg,transparent,${ k.c }06,transparent)`,animation:"shimmer 3s infinite",pointerEvents:"none" } }/>
              <div style={ { display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 } }>
                <span style={ { fontSize:9,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:C.dm } }>{ k.l }</span>
                <span style={ { fontSize:14 } }>{ k.i }</span>
              </div>
              <div style={ { fontSize:22,fontWeight:200,lineHeight:1,transition:"all 0.6s cubic-bezier(0.4,0,0.2,1)" } }>{ k.v }</div>
              <div style={ { fontSize:10,color:k.c,fontWeight:600,marginTop:4 } }>{ k.t }</div>
            </div>
          )) }
        </div>

        <div className="vm-grid-sidebar" style={ { display:"grid",gridTemplateColumns:"1fr 240px",gap:16 } }>
          { /* Left */ }
          <div style={ { display:"flex",flexDirection:"column",gap:12 } }>
            { /* Team */ }
            <div style={ { background:C.bg,borderRadius:14,overflow:"hidden",border:`1px solid ${ C.bd }` } }>
              <div style={ { padding:"12px 16px",borderBottom:`1px solid ${ C.bd }`,fontSize:12,fontWeight:600,display:"flex",justifyContent:"space-between" } }>
                <span>Classement équipe</span>
                <span style={ { fontSize:10,color:C.dm,transition:"all 0.5s" } }>{ mbs.reduce((a,m)=>a+m.sess,0) } sessions</span>
              </div>
              { mbs.map((m,i)=>(
                <div key={ i } style={ { padding:"10px 16px",borderBottom:i<mbs.length-1?`1px solid ${ C.bd }10`:"none",display:"flex",alignItems:"center",gap:10 } }>
                  <span style={ { fontSize:11,fontWeight:700,color:i===0?C.ac:C.dm,width:16 } }>{ i+1 }</span>
                  <Avatar name={ m.name } gender={ m.gender } size={ 30 }/>
                  <div style={ { flex:1,minWidth:0 } }>
                    <div style={ { display:"flex",alignItems:"center",gap:6 } }>
                      <span style={ { fontSize:12,fontWeight:600 } }>{ m.name }</span>
                      <span style={ { fontSize:9,color:C.dm,background:"rgba(139,141,149,0.1)",padding:"1px 6px",borderRadius:4 } }>{ m.role }</span>
                      { m.streak>=5&&<span style={ { fontSize:9,color:C.ok,background:C.okD,padding:"1px 6px",borderRadius:4,fontWeight:700,animation:"badgeBounce 2s infinite" } }>🔥 { m.streak }j</span> }
                    </div>
                    <div style={ { fontSize:10,color:C.dm,marginTop:2 } }><span style={ { color:C.ok } }>{ m.best }</span> · <span style={ { color:C.wr } }>{ m.weak }</span></div>
                  </div>
                  <MiniSparkline data={ m.scores } color={ m.trend>=0?C.ok:C.dn }/>
                  <div style={ { textAlign:"right" } }>
                    <div style={ { fontSize:16,fontWeight:300,transition:"all 0.6s" } }>{ m.avg.toFixed(1) }</div>
                    <div style={ { fontSize:10,fontWeight:600,color:m.trend>=0?C.ok:C.dn } }>{ m.trend>=0?"+":"" }{ m.trend }</div>
                  </div>
                  <div style={ { textAlign:"right",minWidth:28 } }>
                    <div style={ { fontSize:12,fontWeight:600,transition:"all 0.5s" } }>{ m.sess }</div>
                    <div style={ { fontSize:8,color:C.dm } }>sim.</div>
                  </div>
                </div>
              )) }
            </div>
            { /* Feed */ }
            <div style={ { background:C.bg,borderRadius:14,overflow:"hidden",border:`1px solid ${ C.bd }` } }>
              <div style={ { padding:"10px 16px",borderBottom:`1px solid ${ C.bd }`,fontSize:11,fontWeight:600,display:"flex",alignItems:"center",gap:6 } }>
                <div style={ { width:5,height:5,borderRadius:"50%",background:C.ok,animation:"pulse 1.2s infinite" } }/>Activité en direct
              </div>
              { feed.map((s,i)=>(
                <div key={ `${ s.user }-${ s.sc }-${ i }` } style={ { padding:"8px 16px",borderBottom:i<feed.length-1?`1px solid ${ C.bd }10`:"none",display:"flex",alignItems:"center",gap:10,background:i===fl?"rgba(212,133,74,0.08)":"transparent",transition:"background 1s",animation:i===fl?"slideIn 0.4s cubic-bezier(0.34,1.56,0.64,1)":"none" } }>
                  <div style={ { width:30,height:30,borderRadius:8,background:s.score>=15?C.okD:s.score>=12?C.wrD:C.dnD,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:s.score>=15?C.ok:s.score>=12?C.wr:C.dn } }>{ s.score }</div>
                  <div style={ { flex:1,minWidth:0 } }>
                    <div style={ { fontSize:11 } }><span style={ { fontWeight:600 } }>{ s.user }</span> <span style={ { color:C.dm } }>·</span> <span style={ { color:C.mt,fontSize:10 } }>{ s.sc }</span></div>
                    <div style={ { display:"flex",gap:4,marginTop:3 } }>
                      <span style={ { fontSize:8,padding:"1px 6px",borderRadius:4,background:C.blD,color:C.bl,fontWeight:700 } }>{ s.type }</span>
                      <span style={ { fontSize:8,padding:"1px 6px",borderRadius:4,background:ok(s.result)?C.okD:C.dnD,color:ok(s.result)?C.ok:C.dn,fontWeight:700 } }>{ s.result }</span>
                    </div>
                  </div>
                  { i===0&&fl===0&&<span style={ { fontSize:9,color:C.ac,fontWeight:700,padding:"2px 8px",background:C.acD,borderRadius:8,animation:"fadeIn 0.3s" } }>now</span> }
                </div>
              )) }
            </div>
          </div>
          { /* Right */ }
          <div style={ { display:"flex",flexDirection:"column",gap:12 } }>
            <div style={ { background:C.bg,borderRadius:14,padding:16,border:`1px solid ${ rP?C.ac+"30":C.bd }`,flex:1,transition:"border-color 0.8s" } }>
              <div style={ { fontSize:10,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:C.dm,marginBottom:12 } }>FORCE 3D — Équipe</div>
              <div style={ { display:"flex",justifyContent:"center" } }>
                <svg viewBox="0 0 200 200" style={ { width:"100%",maxWidth:180 } }>
                  { [5,10,15,20].map(l=>{ const ps=cs.map((_,i)=>pt2(i,l));const d=ps.map((p,i)=>`${ i===0?"M":"L" } ${ p.x } ${ p.y }`).join(" ")+" Z";return <path key={ l } d={ d } fill="none" stroke={ C.bd } strokeWidth={ 0.5 } opacity={ 0.4 }/>; }) }
                  { cs.map((_,i)=>{ const p=pt2(i,20);return <line key={ i } x1={ cx2 } y1={ cy2 } x2={ p.x } y2={ p.y } stroke={ C.bd } strokeWidth={ 0.5 } opacity={ 0.2 }/>; }) }
                  <path d={ rp } fill={ `${ C.ac }${ rP?"30":"15" }` } stroke={ C.ac } strokeWidth={ rP?2.5:1.5 } style={ { transition:"all 1s cubic-bezier(0.4,0,0.2,1)",filter:rP?"drop-shadow(0 0 8px rgba(212,133,74,0.35))":"none" } }/>
                  { dp2.map((p,i)=><circle key={ i } cx={ p.x } cy={ p.y } r={ rP?5:3 } fill={ cs[i][1]>=14?C.ok:C.wr } stroke={ C.bg } strokeWidth={ 2 } style={ { transition:"all 0.8s cubic-bezier(0.34,1.56,0.64,1)" } }/>) }
                  { cs.map(([k],i)=>{ const p=pt2(i,24);return <text key={ k } x={ p.x } y={ p.y } textAnchor="middle" dominantBaseline="middle" fill={ C.dm } fontSize={ 7 } fontWeight={ 600 }>{ lb[k] }</text>; }) }
                </svg>
              </div>
              <div style={ { display:"flex",flexWrap:"wrap",gap:4,marginTop:8,justifyContent:"center" } }>
                { cs.map(([k,v])=><span key={ k } style={ { fontSize:9,padding:"2px 8px",borderRadius:6,background:v>=14?C.okD:C.wrD,color:v>=14?C.ok:C.wr,fontWeight:600,transition:"all 0.8s" } }>{ lb[k] } { v.toFixed(1) }</span>) }
              </div>
            </div>
            <div style={ { background:C.dnD,borderRadius:10,padding:"10px 12px",border:"1px solid rgba(212,90,90,0.2)",animation:"alertPulse 3s infinite" } }>
              <div style={ { fontSize:10,fontWeight:600,color:C.dn,marginBottom:4 } }>⚠️ Alerte</div>
              <div style={ { fontSize:11,lineHeight:1.4 } }>Thomas Blanc inactif depuis 3 jours</div>
            </div>
            <div style={ { background:C.acD,borderRadius:10,padding:"10px 12px",border:"1px solid rgba(212,133,74,0.2)" } }>
              <div style={ { fontSize:10,fontWeight:600,color:C.ac,marginBottom:4 } }>💡 Coaching</div>
              <div style={ { fontSize:11,lineHeight:1.4 } }>Accroche = maillon faible. Module dédié recommandé.</div>
            </div>
            <div style={ { background:C.bg,borderRadius:10,padding:"12px 14px",border:`1px solid ${ wk>=100?C.ok+"40":C.bd }`,transition:"border-color 0.5s" } }>
              <div style={ { display:"flex",justifyContent:"space-between",marginBottom:8 } }>
                <span style={ { fontSize:10,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:C.dm } }>Objectif hebdo</span>
                <span style={ { fontSize:11,fontWeight:600,color:wk>=100?C.ok:C.ac,transition:"color 0.5s" } }>{ wk>=100?"✓ Atteint !":wk+"%" }</span>
              </div>
              <div style={ { height:6,background:C.bd,borderRadius:3,overflow:"hidden" } }>
                <div style={ { width:`${ wk }%`,height:"100%",background:wk>=100?C.ok:`linear-gradient(90deg,${ C.ac },${ C.acL })`,borderRadius:3,transition:"width 1.2s cubic-bezier(0.4,0,0.2,1)",boxShadow:wk>=100?`0 0 12px ${ C.ok }40`:"none" } }/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={ { textAlign:"center",marginTop:28 } }>
        <Link to="/dashboard" style={ { padding:"13px 28px",background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:10,color:C.tx,fontSize:14,fontWeight:500,cursor:"pointer",textDecoration:"none" } }>Découvrir le dashboard manager →</Link>
      </div>
      <style>{ `
        @keyframes toastIn{ from{ opacity:0;transform:translateX(-50%) translateY(-20px) scale(0.9) }to{ opacity:1;transform:translateX(-50%) translateY(0) scale(1) } }
        @keyframes scorePop{ 0%{ opacity:1;transform:scale(0.5) translateY(0) }30%{ opacity:1;transform:scale(1.4) translateY(-15px) }100%{ opacity:0;transform:scale(1) translateY(-70px) } }
        @keyframes slideIn{ from{ opacity:0;transform:translateX(-20px) }to{ opacity:1;transform:translateX(0) } }
        @keyframes fadeIn{ from{ opacity:0 }to{ opacity:1 } }
        @keyframes shimmer{ 0%{ transform:translateX(-100%) }50%{ transform:translateX(100%) }100%{ transform:translateX(100%) } }
        @keyframes badgeBounce{ 0%,100%{ transform:scale(1) }50%{ transform:scale(1.08) } }
        @keyframes alertPulse{ 0%,100%{ opacity:1 }50%{ opacity:0.8 } }
      ` }</style>
    </div>
  ); }

/* ======== WHY VENDMIEUX ======== */
function WhyVendMieux(){
  const C = useColors(); const diffs=[
    { icon:"🇫🇷",title:"Méthode française, pas un framework US",desc:"FORCE 3D : 30 ans de direction commerciale en PME industrielle. Pas du BANT, pas du MEDDIC." },
    { icon:"🗣️",title:"De la voix, pas du chatbot",desc:"Vos commerciaux vendent en parlant. VendMieux est un simulateur vocal, pas un chatbot texte." },
    { icon:"🏭",title:"Conçu pour les PME, pas les licornes",desc:"12 scénarios dans 12 secteurs PME : industrie, BTP, santé, commerce, immobilier... et création sur mesure de vos propres scénarios." },
    { icon:"💰",title:"49€/mois, pas 'contactez-nous'",desc:"Prix transparent. Pas de devis opaque. Vous testez, vous décidez." },
  ];
  return(
    <div style={ { padding:"72px 24px",maxWidth:960,margin:"0 auto" } }>
      <div style={ { textAlign:"center",marginBottom:48 } }>
        <div style={ { fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.mt,marginBottom:12 } }>Pourquoi VendMieux</div>
        <h2 className="vm-h2" style={ { fontSize:30,fontWeight:300,margin:0 } }>Pas un outil américain <span style={ { fontWeight:700,color:C.ac } }>traduit en français</span></h2>
      </div>
      <div style={ { display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14 } }>
        { diffs.map((d,i)=>(
          <div key={ i } style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:14,padding:"24px 22px",transition:"border-color 0.3s" } }
            onMouseEnter={ e=>e.currentTarget.style.borderColor=C.ac+"50" }
            onMouseLeave={ e=>e.currentTarget.style.borderColor=C.bd }>
            <div style={ { fontSize:24,marginBottom:14 } }>{ d.icon }</div>
            <h3 style={ { fontSize:15,fontWeight:600,margin:"0 0 8px",lineHeight:1.3 } }>{ d.title }</h3>
            <p style={ { fontSize:13,color:C.mt,lineHeight:1.6,margin:0 } }>{ d.desc }</p>
          </div>
        )) }
      </div>
    </div>
  ); }

/* ======== SECTORS ======== */
function Sectors(){
  const C = useColors(); const s=["Industrie","BTP","Santé","Tech / SaaS","Commerce","Immobilier","Transport","Énergie","Formation","Juridique","Automobile","Services"];
  return(
    <div style={ { padding:"48px 24px 72px",maxWidth:960,margin:"0 auto",textAlign:"center" } }>
      <div style={ { fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.mt,marginBottom:16 } }>12 secteurs couverts</div>
      <div style={ { display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center" } }>
        { s.map(x=><span key={ x } style={ { padding:"6px 14px",borderRadius:8,background:C.bgC,border:`1px solid ${ C.bd }`,fontSize:12,color:C.mt,fontWeight:500 } }>{ x }</span>) }
      </div>
    </div>
  ); }

/* ======== FINAL CTA ======== */
function FinalCTA(){
  const C = useColors(); const navigate = useNavigate(); return(
    <div style={ { padding:"72px 24px 88px",textAlign:"center",position:"relative",overflow:"hidden" } }>
      <div style={ { position:"absolute",bottom:"-30%",left:"50%",transform:"translateX(-50%)",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(212,133,74,0.05) 0%,transparent 70%)",pointerEvents:"none" } }/>
      <div style={ { position:"relative" } }>
        <h2 style={ { fontSize:32,fontWeight:300,margin:"0 0 12px" } }>Testez avec un <span style={ { fontWeight:700,color:C.ac } }>vrai prospect IA</span>. Maintenant.</h2>
        <p style={ { fontSize:15,color:C.mt,maxWidth:460,margin:"0 auto 32px" } }>Pas de démo commerciale. Pas de formulaire. Vous parlez à un prospect IA et recevez votre évaluation en 5 minutes.</p>
        <button onClick={ ()=>navigate("/simulation") } style={ { padding:"16px 40px",background:`linear-gradient(135deg,${ C.ac },${ C.acL })`,border:"none",borderRadius:14,color:"#fff",fontSize:16,fontWeight:600,cursor:"pointer",boxShadow:"0 6px 32px rgba(212,133,74,0.3)" } }>
          Lancer ma première simulation →
        </button>
        <div style={ { fontSize:12,color:C.dm,marginTop:14 } }>Gratuit · Sans inscription · 5 minutes</div>
      </div>
    </div>
  ); }

/* ======== APP ======== */
export default function Accueil(){
  const C = useColors(); return(
    <div style={ { minHeight:"100vh",background:C.bg,color:C.tx,fontFamily:"'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif",overflowX:"hidden" } }>
      <Nav active="Accueil"/>
      <Hero/>
      <Problem/>
      <HowItWorks/>
      <Numbers/>
      <DashboardPreview/>
      <WhyVendMieux/>
      <Sectors/>
      <FinalCTA/>
      <Footer/>
      <style>{ `@keyframes pulse{ 0%,100%{ opacity:1 }50%{ opacity:0.4 } }` }</style>
    </div>
  ); }
