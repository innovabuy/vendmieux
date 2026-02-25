import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useColors, Nav, Footer } from "../shared";

function Ck(){
  const C = useColors();
  return <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:20,height:20,borderRadius:6,background:C.okD,color:C.ok,fontSize:12,fontWeight:700}}>✓</span>;
}

const FEATURES = [
  "Tous les scénarios sectoriels (12 disponibles)",
  "3 niveaux de difficulté",
  "Évaluation FORCE 3D après chaque séance",
  "Dashboard de progression individuel",
  "Dashboard manager (suivi équipe)",
  "Scénarios personnalisés à votre métier",
  "Voix française HD ultra-réaliste",
  "Accès navigateur (rien à installer)",
];

const FAQS = [
  { q:"C'est quoi une séance d'entraînement ?", a:"Un appel simulé de 5-10 minutes face à un prospect IA, suivi d'un débriefing complet avec vos scores sur 6 compétences." },
  { q:"Et si j'ai besoin de plus de 20 séances ?", a:"Chaque séance supplémentaire coûte 3€ HT. En pratique, 20 séances/mois = 1 par jour ouvré, largement suffisant pour progresser." },
  { q:"Y a-t-il un engagement ?", a:"Non. L'offre mensuelle est sans engagement. L'offre annuelle bénéficie de -20% (39€/mois au lieu de 49€)." },
  { q:"Combien ça coûte pour mon équipe ?", a:"Multipliez le nombre de commerciaux par le prix unitaire. Exemple : 8 commerciaux × 49€ = 392€/mois." },
  { q:"C'est quoi la méthode FORCE 3D ?", a:"Une méthodologie française d'évaluation commerciale sur 6 compétences : Accroche, Découverte, Création d'enjeu, Argumentation, Objections, Engagement." },
  { q:"Puis-je créer des scénarios sur mesure ?", a:"Oui, décrivez votre cible, votre offre et vos problématiques en langage naturel. L'IA génère un scénario complet en quelques secondes." },
];

export default function Tarifs(){
  const C = useColors();
  const [ann,setAnn]=useState(false);
  const [fO,setFO]=useState(null);
  const [simCount,setSimCount]=useState(1247);
  useEffect(()=>{ const iv=setInterval(()=>setSimCount(c=>c+Math.floor(Math.random()*3)+1),5000);return()=>clearInterval(iv); },[]);
  const price = ann ? "39€" : "49€";
  const priceSub = ann ? "engagement 12 mois" : "sans engagement";

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.tx,fontFamily:"'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif",overflowX:"hidden"}}>

      <Nav active="Tarifs"/>

      {/* HEADER */}
      <div style={{textAlign:"center",padding:"56px 20px 12px"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 16px",borderRadius:20,background:C.okD,color:C.ok,fontSize:12,fontWeight:600,marginBottom:20}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:C.ok}}/>Sans engagement · Annulable à tout moment
        </div>
        <h1 className="vm-h1" style={{fontSize:36,fontWeight:300,margin:"0 0 12px",letterSpacing:-0.8,lineHeight:1.2}}>
          Une offre <span style={{fontWeight:700,color:C.ac}}>simple</span>. Un prix transparent.
        </h1>
        <p style={{fontSize:15,color:C.mt,maxWidth:500,margin:"0 auto",lineHeight:1.6}}>
          Moins cher qu'une demi-journée de formation présentielle. Plus efficace que 6 mois de coaching terrain.
        </p>
      </div>

      {/* TOGGLE */}
      <div style={{display:"flex",justifyContent:"center",padding:"24px 0 44px"}}>
        <div style={{display:"inline-flex",background:C.bgC,borderRadius:10,padding:4,border:`1px solid ${C.bd}`}}>
          <button onClick={()=>setAnn(false)} style={{padding:"8px 20px",borderRadius:8,border:"none",background:!ann?C.bgE:"transparent",color:!ann?C.tx:C.mt,fontSize:13,fontWeight:500,cursor:"pointer"}}>Mensuel</button>
          <button onClick={()=>setAnn(true)} style={{padding:"8px 20px",borderRadius:8,border:"none",background:ann?C.bgE:"transparent",color:ann?C.tx:C.mt,fontSize:13,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
            Annuel<span style={{background:C.okD,color:C.ok,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10}}>-20%</span>
          </button>
        </div>
      </div>

      {/* PRICING CARD */}
      <div style={{display:"flex",justifyContent:"center",padding:"0 20px",maxWidth:520,margin:"0 auto"}}>
        <div style={{width:"100%",background:`linear-gradient(180deg,${C.acD} 0%,${C.bgC} 40%)`,border:"1px solid rgba(212,133,74,0.35)",borderRadius:18,position:"relative",overflow:"hidden",animation:"glowPulse 3s ease-in-out infinite"}}>
          <div style={{position:"absolute",top:16,right:16,background:`linear-gradient(135deg,${C.ac},${C.acL})`,color:"#fff",fontSize:10,fontWeight:700,padding:"4px 12px",borderRadius:20,letterSpacing:0.8,textTransform:"uppercase"}}>VendMieux Pro</div>
          <div style={{padding:"40px 28px 24px",textAlign:"center"}}>
            <div style={{display:"flex",alignItems:"baseline",justifyContent:"center",gap:4,marginBottom:4}}>
              <span style={{fontSize:56,fontWeight:200,color:C.tx,lineHeight:1}}>{price}</span>
              <span style={{fontSize:14,color:C.dm}}> HT /commercial/mois</span>
            </div>
            <p style={{fontSize:13,color:C.mt,margin:"8px 0 4px"}}>{priceSub}</p>
            <p style={{fontSize:14,color:C.ac,fontWeight:600,margin:"12px 0 4px"}}>20 séances d'entraînement incluses</p>
            <p style={{fontSize:11,color:C.dm,margin:"0 0 28px",fontVariantNumeric:"tabular-nums",transition:"all 0.5s"}}>🔥 {simCount.toLocaleString()} simulations réalisées ce mois</p>
            <Link to="/contact" style={{display:"block",width:"100%",padding:"14px 20px",background:`linear-gradient(135deg,${C.ac},${C.acL})`,border:"none",borderRadius:10,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",boxShadow:"0 4px 16px rgba(212,133,74,0.25)",textDecoration:"none",textAlign:"center"}}>Démarrer l'essai gratuit</Link>
            <p style={{fontSize:12,color:C.mt,marginTop:12}}>1 simulation gratuite · Sans carte bancaire</p>
          </div>
          <div style={{borderTop:`1px solid ${C.bd}`,padding:"24px 28px 28px"}}>
            {FEATURES.map((f,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:i<FEATURES.length-1?12:0}}>
                <Ck/><span style={{fontSize:13,color:C.tx}}>{f}</span>
              </div>
            ))}
            <div style={{display:"flex",alignItems:"center",gap:10,marginTop:16,padding:"10px 14px",background:"rgba(212,133,74,0.06)",borderRadius:8,border:"1px solid rgba(212,133,74,0.12)"}}>
              <span style={{fontSize:13,color:C.mt}}>Séance supplémentaire : <span style={{color:C.ac,fontWeight:600}}>3€ HT</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* ROI */}
      <div style={{maxWidth:680,margin:"56px auto 0",padding:"0 20px"}}>
        <h2 style={{fontSize:22,fontWeight:300,marginBottom:20,textAlign:"center"}}>
          Le calcul est <span style={{fontWeight:600,color:C.ac}}>simple</span>
        </h2>
        <div style={{background:`linear-gradient(135deg,${C.acD},rgba(212,133,74,0.05))`,border:"1px solid rgba(212,133,74,0.2)",borderRadius:16,padding:"28px 24px"}}>
          <div className="vm-grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
            <div>
              <div style={{fontSize:12,color:C.mt,marginBottom:6}}>Formation classique</div>
              <div style={{fontSize:26,fontWeight:200,animation:"float 4s ease-in-out infinite"}}>2 500€<span style={{fontSize:12,color:C.dm}}>/personne</span></div>
              <div style={{fontSize:11,color:C.dm,marginTop:4}}>2 jours · 0 mesure · oublié en 2 semaines</div>
            </div>
            <div>
              <div style={{fontSize:12,color:C.ac,marginBottom:6,fontWeight:600}}>VendMieux Pro</div>
              <div style={{fontSize:26,fontWeight:200,animation:"float 4s ease-in-out infinite 1s"}}>49€<span style={{fontSize:12,color:C.dm}}>/mois</span></div>
              <div style={{fontSize:11,color:C.ok,marginTop:4,fontWeight:500}}>10 min/jour · Progression mesurable · 24/7</div>
            </div>
          </div>
          <div style={{marginTop:16,padding:"10px 14px",background:"rgba(61,176,107,0.08)",borderRadius:8,border:"1px solid rgba(61,176,107,0.15)"}}>
            <span style={{fontSize:13,color:C.ok,fontWeight:600}}>→ 1 commercial qui signe 1 contrat de plus = ROI en 1 semaine</span>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{maxWidth:640,margin:"56px auto 0",padding:"0 20px"}}>
        <h2 style={{fontSize:22,fontWeight:300,marginBottom:20,textAlign:"center"}}>
          Questions <span style={{fontWeight:600,color:C.ac}}>fréquentes</span>
        </h2>
        {FAQS.map((f,i)=>(
          <div key={i} onClick={()=>setFO(fO===i?null:i)} style={{background:C.bgC,border:`1px solid ${fO===i?C.ac+"30":C.bd}`,borderRadius:10,cursor:"pointer",overflow:"hidden",marginBottom:6}}>
            <div style={{padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:14,fontWeight:500,lineHeight:1.4,paddingRight:12}}>{f.q}</span>
              <span style={{color:C.dm,fontSize:16,flexShrink:0,transform:fO===i?"rotate(180deg)":"none",transition:"transform 0.2s"}}>⌄</span>
            </div>
            {fO===i&&<div style={{padding:"0 18px 14px",fontSize:13,color:C.mt,lineHeight:1.7}}>{f.a}</div>}
          </div>
        ))}
      </div>

      {/* ÉCOLE CALLOUT */}
      <div style={{maxWidth:560,margin:"48px auto 0",padding:"0 20px"}}>
        <div style={{background:C.bgC,border:`1px solid ${C.bd}`,borderRadius:14,padding:"22px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
          <div>
            <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>École ou organisme de formation ?</div>
            <div style={{fontSize:12,color:C.mt}}>Tarifs adaptés à vos volumes et contraintes pédagogiques.</div>
          </div>
          <Link to="/ecoles-tarifs" style={{padding:"10px 22px",borderRadius:8,background:C.bgE,border:`1px solid ${C.bd}`,color:C.tx,fontSize:13,fontWeight:600,textDecoration:"none",whiteSpace:"nowrap"}}>Voir les tarifs écoles →</Link>
        </div>
      </div>

      {/* CTA FINAL */}
      <div style={{textAlign:"center",padding:"56px 20px 72px"}}>
        <h2 style={{fontSize:26,fontWeight:300,marginBottom:10}}>
          Prêt à former vos commerciaux <span style={{color:C.ac,fontWeight:600}}>autrement</span> ?
        </h2>
        <p style={{fontSize:14,color:C.mt,marginBottom:24}}>1 simulation gratuite. Pas de carte bancaire.</p>
        <Link to="/contact" style={{display:"inline-block",padding:"14px 36px",background:`linear-gradient(135deg,${C.ac},${C.acL})`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",boxShadow:"0 4px 24px rgba(212,133,74,0.3)",textDecoration:"none"}}>
          Réserver une démo →
        </Link>
      </div>

      <Footer/>
      <style>{`
        @keyframes glowPulse{ 0%,100%{ border-color:rgba(212,133,74,0.35);box-shadow:0 0 0 rgba(212,133,74,0) }50%{ border-color:rgba(212,133,74,0.6);box-shadow:0 0 20px rgba(212,133,74,0.15) } }
        @keyframes float{ 0%,100%{ transform:translateY(0) }50%{ transform:translateY(-6px) } }
      `}</style>
    </div>
  );
}
