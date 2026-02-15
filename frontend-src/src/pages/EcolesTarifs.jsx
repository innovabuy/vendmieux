import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useColors, Nav, Footer } from "../shared";

function Ck(){
  const C=useColors();
  return <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:18,height:18,borderRadius:5,background:C.okD,color:C.ok,fontSize:10,fontWeight:700}}>✓</span>;
}
function Dash(){
  const C=useColors();
  return <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:18,height:18,borderRadius:5,background:"rgba(92,94,102,0.1)",color:C.dm,fontSize:12,fontWeight:700}}>—</span>;
}

/* ======== SECTION 1 — HERO ======== */
function Hero({onCTA}){
  const C=useColors();
  return(
    <div style={{textAlign:"center",padding:"64px 24px 48px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"-20%",left:"50%",transform:"translateX(-50%)",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(139,94,207,0.04) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"relative"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 16px",borderRadius:20,background:"rgba(139,94,207,0.08)",color:"#8B5ECF",fontSize:12,fontWeight:600,marginBottom:24,border:"1px solid rgba(139,94,207,0.2)"}}>
          Écoles & Organismes de Formation
        </div>
        <h1 className="vm-h1" style={{fontSize:38,fontWeight:300,margin:"0 0 16px",letterSpacing:-0.8,lineHeight:1.15}}>
          Tarifs Écoles & Organismes de <span style={{fontWeight:700,color:C.ac}}>Formation</span>
        </h1>
        <p style={{fontSize:16,color:C.mt,maxWidth:560,margin:"0 auto 32px",lineHeight:1.65}}>
          Des conditions adaptées à vos volumes, votre pédagogie et vos contraintes budgétaires.
        </p>
        <button onClick={onCTA} style={{padding:"15px 32px",background:`linear-gradient(135deg,${C.ac},${C.acL})`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",boxShadow:"0 4px 24px rgba(212,133,74,0.3)"}}>
          Demander un devis personnalisé →
        </button>
      </div>
    </div>
  );
}

/* ======== SECTION 2 — CE QUI EST INCLUS ======== */
function Inclus(){
  const C=useColors();
  const cards=[
    { icon:"🗣️",title:"Accès Simulateur",color:C.ac,items:[
      "Séances d'entraînement vocal face à un prospect IA",
      "200 scénarios sectoriels disponibles",
      "3 niveaux de difficulté (débutant, intermédiaire, expert)",
      "Évaluation FORCE 3D après chaque séance",
      "Voix française HD ultra-réaliste",
    ]},
    { icon:"📊",title:"Outils Pédagogiques",color:C.ok,items:[
      "Dashboard formateur : suivi de progression de chaque apprenant",
      "Classement et comparaison des scores",
      "Export des résultats (PDF, CSV)",
      "Scénarios sur mesure adaptés à vos cours",
      "Lien d'accès sans inscription pour les étudiants",
    ]},
    { icon:"🤝",title:"Accompagnement",color:C.bl,items:[
      "Onboarding dédié avec votre équipe pédagogique",
      "Création de scénarios personnalisés à vos cas pédagogiques",
      "Support prioritaire",
      "Webinaire de prise en main pour les formateurs",
    ]},
  ];
  return(
    <div style={{padding:"48px 24px",maxWidth:960,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.mt,marginBottom:10}}>Ce qui est inclus</div>
        <h2 className="vm-h2" style={{fontSize:28,fontWeight:300,margin:0}}>Tout ce dont vos formateurs ont <span style={{fontWeight:700,color:C.ac}}>besoin</span></h2>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14}}>
        {cards.map((card,i)=>(
          <div key={i} style={{background:C.bgC,border:`1px solid ${C.bd}`,borderRadius:16,padding:"24px 22px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <span style={{fontSize:24}}>{card.icon}</span>
              <h3 style={{fontSize:16,fontWeight:600,margin:0,color:card.color}}>{card.title}</h3>
            </div>
            {card.items.map((item,j)=>(
              <div key={j} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:10}}>
                <Ck/>
                <span style={{fontSize:13,color:C.mt,lineHeight:1.5}}>{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ======== SECTION 3 — FORMULES TABLEAU ======== */
function Formules(){
  const C=useColors();
  const rows=[
    { label:"Durée",          v:["1 mois","5 mois","12 mois"] },
    { label:"Nombre d'apprenants", v:["Jusqu'à 30","Jusqu'à 100","Illimité"] },
    { label:"Séances / apprenant / mois", v:["10","20","30"] },
    { label:"Scénarios sur mesure", v:["2 offerts","5 offerts","Illimité"] },
    { label:"Dashboard formateur", v:["check","check","check"] },
    { label:"Onboarding dédié",    v:["dash","check","check"] },
    { label:"Support prioritaire", v:["dash","dash","check"] },
  ];
  const plans=["Découverte","Semestre","Année"];
  return(
    <div style={{padding:"48px 24px",maxWidth:800,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.mt,marginBottom:10}}>Formules</div>
        <h2 className="vm-h2" style={{fontSize:28,fontWeight:300,margin:0}}>Trois formules, un seul <span style={{fontWeight:700,color:C.ac}}>objectif</span></h2>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"separate",borderSpacing:0,fontSize:13,minWidth:560}}>
          <thead><tr>
            <th style={{textAlign:"left",padding:"12px 16px",borderBottom:`1px solid ${C.bd}`,color:C.mt,fontWeight:600,fontSize:10,letterSpacing:0.8,textTransform:"uppercase"}}/>
            {plans.map((p,i)=>(
              <th key={p} style={{textAlign:"center",padding:"12px 16px",borderBottom:`1px solid ${C.bd}`,color:i===2?C.ac:C.mt,fontWeight:700,fontSize:10,letterSpacing:0.8,textTransform:"uppercase",background:i===2?C.acD:"transparent"}}>{p}</th>
            ))}
          </tr></thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i}>
                <td style={{padding:"10px 16px",borderBottom:`1px solid rgba(42,46,58,0.3)`,fontWeight:500}}>{r.label}</td>
                {r.v.map((v,j)=>(
                  <td key={j} style={{textAlign:"center",padding:"10px 16px",borderBottom:`1px solid rgba(42,46,58,0.3)`,background:j===2?"rgba(212,133,74,0.04)":"transparent",color:C.tx,fontWeight:400}}>
                    {v==="check"?<Ck/>:v==="dash"?<Dash/>:v}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td style={{padding:"14px 16px",fontWeight:700,fontSize:14}}>Prix</td>
              {plans.map((p,j)=>(
                <td key={j} style={{textAlign:"center",padding:"14px 16px",fontWeight:700,fontSize:14,color:C.ac,background:j===2?"rgba(212,133,74,0.04)":"transparent"}}>Sur devis</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p style={{fontSize:12,color:C.dm,textAlign:"center",marginTop:16,lineHeight:1.6}}>
        Tarifs dégressifs selon le nombre d'apprenants. Paiement par bon de commande accepté.
      </p>
    </div>
  );
}

/* ======== SECTION 4 — POURQUOI NOUS ======== */
function WhyUs(){
  const C=useColors();
  const args=[
    { icon:"⚡",title:"Zéro friction",desc:"Un lien, un clic, l'étudiant s'entraîne. Pas d'inscription, pas de téléchargement, pas de configuration IT." },
    { icon:"📐",title:"Évaluation objective",desc:"Fini le \"je trouve que c'était bien\". 6 compétences mesurées, scores comparables, progression traçable." },
    { icon:"🇫🇷",title:"Méthodologie française",desc:"FORCE 3D est une méthode commerciale conçue pour le marché français. Pas un copier-coller de frameworks américains." },
    { icon:"🎯",title:"Réalisme qui engage",desc:"Les étudiants prennent l'exercice au sérieux parce que le prospect IA réagit comme un vrai dirigeant. Pas un chatbot qui récite." },
  ];
  return(
    <div style={{padding:"48px 24px",maxWidth:960,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <h2 className="vm-h2" style={{fontSize:28,fontWeight:300,margin:0}}>Pourquoi les écoles nous <span style={{fontWeight:700,color:C.ac}}>choisissent</span></h2>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14}}>
        {args.map((a,i)=>(
          <div key={i} style={{background:C.bgC,border:`1px solid ${C.bd}`,borderRadius:16,padding:"24px 22px"}}>
            <div style={{fontSize:28,marginBottom:12}}>{a.icon}</div>
            <h3 style={{fontSize:15,fontWeight:600,margin:"0 0 8px"}}>{a.title}</h3>
            <p style={{fontSize:13,color:C.mt,lineHeight:1.6,margin:0}}>{a.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ======== SECTION 5 — TÉMOIGNAGE ======== */
function Temoignage(){
  const C=useColors();
  return(
    <div style={{padding:"48px 24px",maxWidth:640,margin:"0 auto"}}>
      <div style={{background:C.bgC,border:`1px solid ${C.bd}`,borderRadius:16,padding:"28px 24px",position:"relative"}}>
        <div style={{position:"absolute",top:16,right:20,fontSize:36,color:C.bd,fontWeight:800,lineHeight:1}}>"</div>
        <p style={{fontSize:15,color:C.mt,lineHeight:1.7,margin:"0 0 16px",fontStyle:"italic"}}>
          [Espace réservé — Témoignage d'un responsable pédagogique à ajouter après les premières démos]
        </p>
        <div style={{fontSize:13,fontWeight:600}}>— Responsable pédagogique, École de Commerce</div>
        <div style={{fontSize:11,color:C.dm,marginTop:4}}>Témoignage à confirmer</div>
      </div>
    </div>
  );
}

/* ======== SECTION 6 — FORMULAIRE ======== */
function DevisForm(){
  const C=useColors();
  const formRef=useRef(null);
  const [form,setForm]=useState({nom:"",prenom:"",email:"",telephone:"",etablissement:"",type:"",nb_apprenants:"",message:""});
  const [sent,setSent]=useState(false);

  const inputStyle={width:"100%",padding:"12px 14px",borderRadius:8,border:`1px solid #353A48`,background:"#1A1E28",color:C.tx,fontSize:13,fontFamily:"inherit",outline:"none"};
  const labelStyle={fontSize:12,fontWeight:600,color:C.mt,marginBottom:6,display:"block"};

  const handleSubmit=(e)=>{
    e.preventDefault();
    const subject=encodeURIComponent(`Demande de devis école — ${form.etablissement}`);
    const body=encodeURIComponent(
      `Nom : ${form.nom}\nPrénom : ${form.prenom}\nEmail : ${form.email}\nTéléphone : ${form.telephone}\nÉtablissement : ${form.etablissement}\nType : ${form.type}\nNombre d'apprenants : ${form.nb_apprenants}\n\nMessage :\n${form.message}`
    );
    window.location.href=`mailto:jeff@cap-performances.fr?subject=${subject}&body=${body}`;
    setSent(true);
  };

  const update=(k,v)=>setForm(f=>({...f,[k]:v}));

  return(
    <div ref={formRef} id="devis-form" style={{padding:"48px 24px",maxWidth:560,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.mt,marginBottom:10}}>Demande de devis</div>
        <h2 className="vm-h2" style={{fontSize:28,fontWeight:300,margin:0}}>Recevez votre devis <span style={{fontWeight:700,color:C.ac}}>sous 24h</span></h2>
      </div>
      {sent?(
        <div style={{background:C.bgC,border:`1px solid ${C.bd}`,borderRadius:16,padding:"32px 24px",textAlign:"center"}}>
          <div style={{fontSize:36,marginBottom:12}}>✉️</div>
          <h3 style={{fontSize:18,fontWeight:600,marginBottom:8}}>Votre client email va s'ouvrir</h3>
          <p style={{fontSize:13,color:C.mt,lineHeight:1.6}}>Envoyez le mail pré-rempli à jeff@cap-performances.fr.<br/>Réponse garantie sous 24h ouvrées.</p>
        </div>
      ):(
        <form onSubmit={handleSubmit} style={{background:C.bgC,border:`1px solid ${C.bd}`,borderRadius:16,padding:"28px 24px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div>
              <label style={labelStyle}>Nom *</label>
              <input required value={form.nom} onChange={e=>update("nom",e.target.value)} style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Prénom *</label>
              <input required value={form.prenom} onChange={e=>update("prenom",e.target.value)} style={inputStyle}/>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div>
              <label style={labelStyle}>Email professionnel *</label>
              <input required type="email" value={form.email} onChange={e=>update("email",e.target.value)} style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Téléphone</label>
              <input value={form.telephone} onChange={e=>update("telephone",e.target.value)} style={inputStyle}/>
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <label style={labelStyle}>Établissement *</label>
            <input required value={form.etablissement} onChange={e=>update("etablissement",e.target.value)} placeholder="Nom de l'école ou organisme" style={inputStyle}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div>
              <label style={labelStyle}>Type *</label>
              <select required value={form.type} onChange={e=>update("type",e.target.value)} style={{...inputStyle,cursor:"pointer"}}>
                <option value="">Sélectionner...</option>
                <option>École de commerce</option>
                <option>BTS Commerce-Vente</option>
                <option>Organisme de formation</option>
                <option>Université</option>
                <option>Autre</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Nombre d'apprenants estimé *</label>
              <select required value={form.nb_apprenants} onChange={e=>update("nb_apprenants",e.target.value)} style={{...inputStyle,cursor:"pointer"}}>
                <option value="">Sélectionner...</option>
                <option>Moins de 30</option>
                <option>30-100</option>
                <option>100-300</option>
                <option>Plus de 300</option>
              </select>
            </div>
          </div>
          <div style={{marginBottom:20}}>
            <label style={labelStyle}>Message</label>
            <textarea value={form.message} onChange={e=>update("message",e.target.value)} placeholder="Décrivez vos besoins ou posez vos questions" rows={3} style={{...inputStyle,resize:"vertical"}}/>
          </div>
          <button type="submit" style={{width:"100%",padding:"14px 20px",background:`linear-gradient(135deg,${C.ac},${C.acL})`,border:"none",borderRadius:10,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",boxShadow:"0 4px 16px rgba(212,133,74,0.25)"}}>
            Recevoir mon devis sous 24h
          </button>
          <p style={{fontSize:12,color:C.dm,textAlign:"center",marginTop:12,lineHeight:1.5}}>
            Réponse garantie sous 24h ouvrées. Devis personnalisé. Sans engagement.
          </p>
        </form>
      )}
    </div>
  );
}

/* ======== SECTION 7 — FAQ ======== */
function FAQ(){
  const C=useColors();
  const [open,setOpen]=useState(null);
  const faqs=[
    { q:"Faut-il installer quelque chose ?", a:"Non. VendMieux fonctionne dans le navigateur. Un simple lien suffit pour que vos étudiants accèdent au simulateur." },
    { q:"Comment je suis la progression de mes étudiants ?", a:"Le dashboard formateur affiche les scores de chaque étudiant sur les 6 compétences FORCE 3D, l'historique des séances, et la courbe de progression." },
    { q:"Peut-on créer des scénarios liés à nos cours ?", a:"Oui. Décrivez la situation commerciale que vous voulez simuler et l'IA génère un scénario complet (persona, objections, brief) en quelques secondes." },
    { q:"Quel est le délai de mise en place ?", a:"48h maximum. On crée vos accès, on personnalise vos scénarios, et vos étudiants peuvent s'entraîner." },
    { q:"Acceptez-vous les bons de commande ?", a:"Oui. Paiement par bon de commande, virement, ou carte bancaire. Facturation SASU INNOVABUY, SIRET 931 378 368 00019." },
    { q:"Est-ce compatible avec notre LMS (Moodle, etc.) ?", a:"Pas d'intégration LMS native pour l'instant, mais le lien d'accès direct fonctionne dans n'importe quel environnement. Intégration LTI prévue courant 2026." },
  ];
  return(
    <div style={{padding:"48px 24px",maxWidth:640,margin:"0 auto"}}>
      <h2 style={{fontSize:22,fontWeight:300,marginBottom:20,textAlign:"center"}}>
        Questions <span style={{fontWeight:600,color:C.ac}}>fréquentes</span>
      </h2>
      {faqs.map((f,i)=>(
        <div key={i} onClick={()=>setOpen(open===i?null:i)} style={{background:C.bgC,border:`1px solid ${open===i?C.ac+"30":C.bd}`,borderRadius:10,cursor:"pointer",overflow:"hidden",marginBottom:6}}>
          <div style={{padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:14,fontWeight:500,lineHeight:1.4,paddingRight:12}}>{f.q}</span>
            <span style={{color:C.dm,fontSize:16,flexShrink:0,transform:open===i?"rotate(180deg)":"none",transition:"transform 0.2s"}}>⌄</span>
          </div>
          {open===i&&<div style={{padding:"0 18px 14px",fontSize:13,color:C.mt,lineHeight:1.7}}>{f.a}</div>}
        </div>
      ))}
    </div>
  );
}

/* ======== CTA FINAL ======== */
function FinalCTA({onCTA}){
  const C=useColors();
  return(
    <div style={{textAlign:"center",padding:"48px 24px 72px"}}>
      <h2 style={{fontSize:26,fontWeight:300,marginBottom:10}}>
        Prêt à moderniser votre formation <span style={{color:C.ac,fontWeight:600}}>commerciale</span> ?
      </h2>
      <p style={{fontSize:14,color:C.mt,marginBottom:24}}>Démo gratuite. Devis personnalisé. Sans engagement.</p>
      <div className="vm-btn-row" style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
        <button onClick={onCTA} style={{padding:"14px 36px",background:`linear-gradient(135deg,${C.ac},${C.acL})`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",boxShadow:"0 4px 24px rgba(212,133,74,0.3)"}}>
          Demander un devis →
        </button>
        <a href="https://cal.com" target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",padding:"14px 32px",background:C.bgC,border:`1px solid ${C.bd}`,borderRadius:12,color:C.tx,fontSize:15,fontWeight:500,textDecoration:"none",cursor:"pointer"}}>
          Réserver une démo de 15 min
        </a>
      </div>
    </div>
  );
}

/* ======== PAGE ======== */
export default function EcolesTarifs(){
  const C=useColors();
  const scrollToForm=()=>{
    const el=document.getElementById("devis-form");
    if(el) el.scrollIntoView({behavior:"smooth"});
  };
  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.tx,fontFamily:"'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif",overflowX:"hidden"}}>
      <Nav active="Écoles"/>
      <Hero onCTA={scrollToForm}/>
      <Inclus/>
      <Formules/>
      <WhyUs/>
      <Temoignage/>
      <DevisForm/>
      <FAQ/>
      <FinalCTA onCTA={scrollToForm}/>
      <Footer/>
    </div>
  );
}
