import { useState } from "react";
import { useColors, Badge, Avatar, WaveformAnim, CountUp, MiniSparkline, Nav, Footer } from "../shared";

function Ck({ on=true }){
  const C = useColors();
  return <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:20,height:20,borderRadius:6,background:on?C.okD:"rgba(92,94,102,0.1)",color:on?C.ok:C.dm,fontSize:12,fontWeight:700}}>{on?"✓":"—"}</span>;
}

const faqs=[
  { q:"Combien coûte une session ?",a:"~0.20€ d'infra. Avec Pro à 49€/mois, 20 sessions = 2.45€/session. 100x moins cher qu'1h de formation présentielle." },
  { q:"Puis-je tester sans payer ?",a:"Oui. Découverte = gratuit, sans carte bancaire. 3 scénarios, 3 simulations/mois, débriefing FORCE 3D complet." },
  { q:"Engagement de durée ?",a:"Non. Mensuel, sans engagement. Annulable à tout moment." },
  { q:"Pour une école de commerce ?",a:"Tarif dégressif : à partir de 15€/étudiant/mois pour 100+ utilisateurs. Scénarios personnalisés à votre programme." },
  { q:"Finançable OPCO ?",a:"Certification Qualiopi en cours. En attendant, intégrable dans votre budget formation interne." },
  { q:"Données sécurisées ?",a:"Enregistrements vocaux non stockés. Transcripts sur serveurs français. RGPD." },
];

const feats=[
  { l:"Scénarios catalogue",f:"3",p:"200+",s:"200+" },
  { l:"Scénarios sur mesure",f:false,p:true,s:true },
  { l:"Simulations / mois",f:"3",p:"Illimité",s:"Illimité" },
  { l:"Débriefing FORCE 3D",f:true,p:true,s:true },
  { l:"Niveaux de difficulté",f:false,p:true,s:true },
  { l:"Suivi progression",f:false,p:true,s:true },
  { l:"Dashboard manager",f:false,p:true,s:true },
  { l:"Évaluation par promotion",f:false,p:false,s:true },
  { l:"Export des notes",f:false,p:false,s:true },
  { l:"Support",f:"Email",p:"Prioritaire",s:"Dédié" },
];

function Card({ tier,price,period,sub,cta,primary,hi,badge,items }){

  const C = useColors(); const [hov,setHov]=useState(false);
  return(
    <div onMouseEnter={ ()=>setHov(true) } onMouseLeave={ ()=>setHov(false) } style={ { background:hi?`linear-gradient(180deg,${ C.acD } 0%,${ C.bgC } 40%)`:C.bgC,border:`1px solid ${ hi?"rgba(212,133,74,0.35)":hov?C.ac+"60":C.bd }`,borderRadius:18,position:"relative",overflow:"hidden",flex:1,minWidth:240,maxWidth:360,transition:"border-color 0.3s" } }>
      { badge&&<div style={ { position:"absolute",top:16,right:16,background:`linear-gradient(135deg,${ C.ac },${ C.acL })`,color:"#fff",fontSize:10,fontWeight:700,padding:"4px 12px",borderRadius:20,letterSpacing:0.8,textTransform:"uppercase" } }>{ badge }</div> }
      <div style={ { padding:"32px 24px 24px" } }>
        <div style={ { fontSize:11,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",color:C.mt,marginBottom:8 } }>{ tier }</div>
        <div style={ { display:"flex",alignItems:"baseline",gap:4,marginBottom:4 } }>
          <span style={ { fontSize:price==="Sur devis"?26:48,fontWeight:200,color:C.tx,lineHeight:1 } }>{ price }</span>
          { period&&<span style={ { fontSize:14,color:C.dm } }>{ period }</span> }
        </div>
        <p style={ { fontSize:13,color:C.mt,lineHeight:1.5,margin:"8px 0 24px",minHeight:36 } }>{ sub }</p>
        <button style={ { width:"100%",padding:"13px 20px",background:primary?`linear-gradient(135deg,${ C.ac },${ C.acL })`:C.bgE,border:primary?"none":`1px solid ${ C.bd }`,borderRadius:10,color:primary?"#fff":C.tx,fontSize:14,fontWeight:600,cursor:"pointer",boxShadow:primary?"0 4px 16px rgba(212,133,74,0.25)":"none" } }>{ cta }</button>
      </div>
      <div style={ { borderTop:`1px solid ${ C.bd }`,padding:"20px 24px 28px" } }>
        { items.map((f,i)=><div key={ i } style={ { display:"flex",alignItems:"center",gap:10,marginBottom:i<items.length-1?12:0 } }>
          <Ck on={ f.on }/><span style={ { fontSize:13,color:f.on?C.tx:C.dm } }>{ f.t }{ f.d&&<span style={ { color:C.ac,fontWeight:600,marginLeft:4 } }>{ f.d }</span> }</span>
        </div>) }
      </div>
    </div>
  ); }

export default function Tarifs(){
  const C = useColors(); const [ann,setAnn]=useState(false);
  const [fO,setFO]=useState(null);
  const pp=ann?"39€":"49€";

  return(
    <div style={ { minHeight:"100vh",background:C.bg,color:C.tx,fontFamily:"'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif",overflowX:"hidden" } }>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet"/>

      { /* NAV */ }
      <div style={ { display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",borderBottom:`1px solid ${ C.bd }`,background:`${ C.bg }E0`,backdropFilter:"blur(12px)",position:"sticky",top:0,zIndex:100 } }>
        <div style={ { display:"flex",alignItems:"center",gap:10 } }>
          <div style={ { width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${ C.ac },${ C.acL })`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#fff" } }>V</div>
          <span style={ { fontSize:16,fontWeight:600,letterSpacing:-0.3 } }>Vend<span style={ { color:C.ac } }>Mieux</span></span>
        </div>
        <button style={ { padding:"8px 18px",borderRadius:8,border:"none",background:`linear-gradient(135deg,${ C.ac },${ C.acL })`,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer" } }>Essai gratuit</button>
      </div>

      { /* HEADER */ }
      <div style={ { textAlign:"center",padding:"56px 20px 12px" } }>
        <div style={ { display:"inline-flex",alignItems:"center",gap:8,padding:"6px 16px",borderRadius:20,background:C.okD,color:C.ok,fontSize:12,fontWeight:600,marginBottom:20 } }>
          <span style={ { width:6,height:6,borderRadius:"50%",background:C.ok } }/>Sans engagement · Annulable à tout moment
        </div>
        <h1 className="vm-h1" style={ { fontSize:36,fontWeight:300,margin:"0 0 12px",letterSpacing:-0.8,lineHeight:1.2 } }>
          Un prix <span style={ { fontWeight:700,color:C.ac } }>simple</span>, pas un devis opaque
        </h1>
        <p style={ { fontSize:15,color:C.mt,maxWidth:500,margin:"0 auto",lineHeight:1.6 } }>
          Moins cher qu'une demi-journée de formation présentielle. Plus efficace que 6 mois de coaching terrain.
        </p>
      </div>

      { /* TOGGLE */ }
      <div style={ { display:"flex",justifyContent:"center",padding:"24px 0 44px" } }>
        <div style={ { display:"inline-flex",background:C.bgC,borderRadius:10,padding:4,border:`1px solid ${ C.bd }` } }>
          <button onClick={ ()=>setAnn(false) } style={ { padding:"8px 20px",borderRadius:8,border:"none",background:!ann?C.bgE:"transparent",color:!ann?C.tx:C.mt,fontSize:13,fontWeight:500,cursor:"pointer" } }>Mensuel</button>
          <button onClick={ ()=>setAnn(true) } style={ { padding:"8px 20px",borderRadius:8,border:"none",background:ann?C.bgE:"transparent",color:ann?C.tx:C.mt,fontSize:13,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:6 } }>
            Annuel<span style={ { background:C.okD,color:C.ok,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10 } }>-20%</span>
          </button>
        </div>
      </div>

      { /* CARDS */ }
      <div style={ { display:"flex",gap:14,justifyContent:"center",padding:"0 20px",flexWrap:"wrap",maxWidth:1100,margin:"0 auto" } }>
        <Card tier="Découverte" price="0€" sub="Testez sans carte bancaire. Voyez par vous-même." cta="Commencer gratuitement" items={ [
          { on:true,t:"3 scénarios catalogue" },{ on:true,t:"3 simulations / mois" },{ on:true,t:"Débriefing FORCE 3D" },
          { on:false,t:"Scénarios sur mesure" },{ on:false,t:"Suivi de progression" },{ on:false,t:"Dashboard manager" },
        ] }/>
        <Card tier="Pro" price={ pp } period="/user/mois" sub="200+ scénarios, simulations illimitées, vos propres prospects IA." cta="Démarrer l'essai gratuit" primary hi badge="Populaire" items={ [
          { on:true,t:"200+ scénarios",d:"20 secteurs" },{ on:true,t:"Simulations illimitées" },{ on:true,t:"Débriefing FORCE 3D" },
          { on:true,t:"Scénarios sur mesure",d:"vos prospects" },{ on:true,t:"Suivi de progression" },{ on:true,t:"Dashboard manager" },
        ] }/>
        <Card tier="École" price="Sur devis" sub="Scénarios pédagogiques personnalisés. Évaluation par promotion." cta="Demander un devis" items={ [
          { on:true,t:"Scénarios illimités",d:"+ sur mesure" },{ on:true,t:"Simulations illimitées" },{ on:true,t:"Débriefing FORCE 3D" },
          { on:true,t:"Évaluation par promotion" },{ on:true,t:"Export des notes" },{ on:true,t:"Support dédié" },
        ] }/>
      </div>

      { /* ROI */ }
      <div style={ { maxWidth:680,margin:"56px auto 0",padding:"0 20px" } }>
        <div style={ { background:`linear-gradient(135deg,${ C.acD },rgba(212,133,74,0.05))`,border:"1px solid rgba(212,133,74,0.2)",borderRadius:16,padding:"28px 24px" } }>
          <div style={ { fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",color:C.ac,marginBottom:16 } }>💰 Le calcul est vite fait</div>
          <div className="vm-grid-2" style={ { display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 } }>
            <div>
              <div style={ { fontSize:12,color:C.mt,marginBottom:6 } }>Formation présentielle</div>
              <div style={ { fontSize:26,fontWeight:200 } }>2 000€<span style={ { fontSize:12,color:C.dm } }>/jour</span></div>
              <div style={ { fontSize:11,color:C.dm,marginTop:4 } }>1 formateur · 1 journée · oublié en 2 semaines</div>
            </div>
            <div>
              <div style={ { fontSize:12,color:C.ac,marginBottom:6,fontWeight:600 } }>VendMieux Pro — 10 commerciaux</div>
              <div style={ { fontSize:26,fontWeight:200 } }>490€<span style={ { fontSize:12,color:C.dm } }>/mois</span></div>
              <div style={ { fontSize:11,color:C.ok,marginTop:4,fontWeight:500 } }>Illimité · Mesurable · 24/7</div>
            </div>
          </div>
          <div style={ { marginTop:16,padding:"10px 14px",background:"rgba(61,176,107,0.08)",borderRadius:8,border:"1px solid rgba(61,176,107,0.15)" } }>
            <span style={ { fontSize:13,color:C.ok,fontWeight:600 } }>→ 4x moins cher, impact continu et mesurable.</span>
          </div>
        </div>
      </div>

      { /* TABLE */ }
      <div style={ { maxWidth:760,margin:"48px auto 0",padding:"0 20px",overflowX:"auto" } }>
        <table style={ { width:"100%",borderCollapse:"separate",borderSpacing:0,fontSize:13 } }>
          <thead><tr>
            <th style={ { textAlign:"left",padding:"12px 14px",color:C.mt,fontWeight:600,fontSize:10,letterSpacing:0.8,textTransform:"uppercase",borderBottom:`1px solid ${ C.bd }` } }>Fonctionnalité</th>
            { ["Découverte","Pro","École"].map((t,i)=><th key={ t } style={ { textAlign:"center",padding:"12px 14px",color:i===1?C.ac:C.mt,fontWeight:600,fontSize:10,letterSpacing:0.8,textTransform:"uppercase",borderBottom:`1px solid ${ C.bd }`,background:i===1?C.acD:"transparent" } }>{ t }</th>) }
          </tr></thead>
          <tbody>{ feats.map((f,i)=><tr key={ i }>
            <td style={ { padding:"10px 14px",color:C.tx,borderBottom:`1px solid rgba(42,46,58,0.3)` } }>{ f.l }</td>
            { [f.f,f.p,f.s].map((v,j)=><td key={ j } style={ { textAlign:"center",padding:"10px 14px",borderBottom:`1px solid rgba(42,46,58,0.3)`,background:j===1?"rgba(212,133,74,0.04)":"transparent",color:v===true?C.ok:v===false?C.dm:C.tx,fontWeight:typeof v==="string"?500:400 } }>
              { v===true?<Ck on/>:v===false?<Ck on={ false }/>:v }
            </td>) }
          </tr>) }</tbody>
        </table>
      </div>

      { /* FAQ */ }
      <div style={ { maxWidth:640,margin:"56px auto 0",padding:"0 20px" } }>
        <h2 style={ { fontSize:22,fontWeight:300,marginBottom:20,textAlign:"center" } }>
          Questions <span style={ { fontWeight:600,color:C.ac } }>fréquentes</span>
        </h2>
        { faqs.map((f,i)=><div key={ i } onClick={ ()=>setFO(fO===i?null:i) } style={ { background:C.bgC,border:`1px solid ${ fO===i?C.ac+"30":C.bd }`,borderRadius:10,cursor:"pointer",overflow:"hidden",marginBottom:6 } }>
          <div style={ { padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center" } }>
            <span style={ { fontSize:14,fontWeight:500,lineHeight:1.4,paddingRight:12 } }>{ f.q }</span>
            <span style={ { color:C.dm,fontSize:16,flexShrink:0,transform:fO===i?"rotate(180deg)":"none",transition:"transform 0.2s" } }>⌄</span>
          </div>
          { fO===i&&<div style={ { padding:"0 18px 14px",fontSize:13,color:C.mt,lineHeight:1.7 } }>{ f.a }</div> }
        </div>) }
      </div>

      { /* CTA */ }
      <div style={ { textAlign:"center",padding:"56px 20px 72px" } }>
        <h2 style={ { fontSize:26,fontWeight:300,marginBottom:10 } }>
          Prêt à former vos commerciaux <span style={ { color:C.ac,fontWeight:600 } }>autrement</span> ?
        </h2>
        <p style={ { fontSize:14,color:C.mt,marginBottom:24 } }>3 simulations gratuites. Pas de carte bancaire.</p>
        <button style={ { padding:"14px 36px",background:`linear-gradient(135deg,${ C.ac },${ C.acL })`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",boxShadow:"0 4px 24px rgba(212,133,74,0.3)" } }>
          Essayez gratuitement →
        </button>
      </div>

      { /* FOOTER */ }
      <div style={ { borderTop:`1px solid ${ C.bd }`,padding:"24px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",maxWidth:1100,margin:"0 auto",flexWrap:"wrap",gap:12 } }>
        <span style={ { fontSize:12,color:C.dm } }>© 2026 VendMieux · Formation commerciale par simulation IA</span>
        <div style={ { display:"flex",gap:16 } }>
          { ["Mentions légales","Confidentialité","Contact"].map(l=><a key={ l } href="#" style={ { fontSize:11,color:C.dm,textDecoration:"none" } }>{ l }</a>) }
        </div>
      </div>
    </div>
  ); }
