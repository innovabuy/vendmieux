import { useEffect, useState } from "react";
import { useColors, Badge, Avatar, WaveformAnim, CountUp, MiniSparkline, Nav, Footer } from "../shared";

/* ======== HERO PRODUIT ======== */
function ProductHero(){
  const C = useColors(); return(
    <div className="vm-hero" style={ { textAlign:"center",padding:"64px 24px 48px",position:"relative",overflow:"hidden" } }>
      <div style={ { position:"absolute",top:"-20%",left:"50%",transform:"translateX(-50%)",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(74,127,212,0.04) 0%,transparent 70%)",pointerEvents:"none" } }/>
      <div style={ { position:"relative" } }>
        <Badge color="blue">Comment ça marche</Badge>
        <h1 style={ { fontSize:40,fontWeight:300,margin:"16px 0 16px",letterSpacing:-0.8,lineHeight:1.2 } }>
          Un entraînement commercial<br/><span style={ { fontWeight:700,color:C.ac } }>en 3 étapes, 10 minutes</span>
        </h1>
        <p style={ { fontSize:16,color:C.mt,maxWidth:560,margin:"0 auto",lineHeight:1.65 } }>
          Brief personnalisé. Simulation vocale avec un prospect IA réaliste. Débriefing FORCE 3D instantané. 
          Vos commerciaux progressent à chaque session.
        </p>
      </div>
    </div>
  ); }

/* ======== 3 ÉTAPES DÉTAILLÉES ======== */
function StepDetail({ num,color,colorD,title,subtitle,desc,features,visual,reverse }){
  const C = useColors(); return(
    <div style={ { padding:"64px 24px",maxWidth:960,margin:"0 auto" } }>
      <div className="vm-grid-2" style={ { display:"grid",gridTemplateColumns:"1fr 1fr",gap:40,alignItems:"center",direction:reverse?"rtl":"ltr" } }>
        <div style={ { direction:"ltr" } }>
          <div style={ { display:"flex",alignItems:"center",gap:12,marginBottom:16 } }>
            <div style={ { width:40,height:40,borderRadius:12,background:colorD,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color } }>
              { num }
            </div>
            <div>
              <h2 style={ { fontSize:24,fontWeight:600,margin:0,color } }>{ title }</h2>
              <div style={ { fontSize:13,color:C.mt,fontWeight:500 } }>{ subtitle }</div>
            </div>
          </div>
          <p style={ { fontSize:14,color:C.mt,lineHeight:1.7,margin:"0 0 24px" } }>{ desc }</p>
          <div style={ { display:"flex",flexDirection:"column",gap:10 } }>
            { features.map((f,i)=>(
              <div key={ i } style={ { display:"flex",gap:10,alignItems:"flex-start" } }>
                <div style={ { width:20,height:20,borderRadius:6,background:colorD,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color,fontWeight:700,flexShrink:0,marginTop:2 } }>✓</div>
                <div>
                  <div style={ { fontSize:13,fontWeight:600,marginBottom:2 } }>{ f.title }</div>
                  <div style={ { fontSize:12,color:C.dm,lineHeight:1.5 } }>{ f.desc }</div>
                </div>
              </div>
            )) }
          </div>
        </div>
        <div style={ { direction:"ltr" } }>
          { visual }
        </div>
      </div>
    </div>
  ); }

function Step1Visual(){

  const C = useColors(); return(
    <div style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:18,padding:24,position:"relative" } }>
      <div style={ { position:"absolute",top:12,right:12 } }><Badge color="blue">Brief</Badge></div>
      <div style={ { background:C.blD,borderRadius:12,padding:"16px 18px",marginBottom:14 } }>
        <div style={ { fontSize:10,fontWeight:700,letterSpacing:1,color:C.bl,marginBottom:8 } }>🎯 VOTRE OBJECTIF</div>
        <div style={ { fontSize:15,fontWeight:600 } }>Décrocher un RDV de 30 min sur site pour une démo live</div>
      </div>
      <div className="vm-grid-2" style={ { display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14 } }>
        <div style={ { background:C.bgE,borderRadius:10,padding:"12px 14px" } }>
          <div style={ { fontSize:9,fontWeight:700,letterSpacing:0.8,color:C.bl,marginBottom:6 } }>VOUS ÊTES</div>
          <div style={ { fontSize:13,fontWeight:600 } }>Commercial TechMaint</div>
          <div style={ { fontSize:11,color:C.dm,marginTop:2 } }>Solutions IoT industrielles</div>
        </div>
        <div style={ { background:C.bgE,borderRadius:10,padding:"12px 14px" } }>
          <div style={ { fontSize:9,fontWeight:700,letterSpacing:0.8,color:C.bl,marginBottom:6 } }>VOUS APPELEZ</div>
          <div style={ { display:"flex",alignItems:"center",gap:8 } }>
            <Avatar name="Olivier Bertrand" gender="M" size={ 28 }/>
            <div>
              <div style={ { fontSize:13,fontWeight:600 } }>Olivier Bertrand</div>
              <div style={ { fontSize:11,color:C.dm } }>DG · MécaPress</div>
            </div>
          </div>
        </div>
      </div>
      <div style={ { background:C.bgE,borderRadius:10,padding:"12px 14px",marginBottom:14 } }>
        <div style={ { fontSize:9,fontWeight:700,letterSpacing:0.8,color:C.mt,marginBottom:8 } }>CE QUE VOUS SAVEZ</div>
        { ["PME industrielle en croissance, 85 salariés","Secteur mécanique — pannes machines fréquentes","Premier contact, trouvé via annuaire industriel"].map((t,i)=>(
          <div key={ i } style={ { display:"flex",gap:6,alignItems:"center",marginBottom:4 } }>
            <span style={ { color:C.bl,fontSize:7 } }>●</span>
            <span style={ { fontSize:12,color:C.mt } }>{ t }</span>
          </div>
        )) }
      </div>
      <div style={ { background:C.bgE,borderRadius:10,padding:"12px 14px" } }>
        <div style={ { fontSize:9,fontWeight:700,letterSpacing:0.8,color:C.ok,marginBottom:8 } }>💎 VOS ATOUTS</div>
        { ["Référence : Fonderies du Rhône, 3 pannes évitées","ROI moyen : 4-6 mois","Installation 1 journée, sans arrêt production"].map((t,i)=>(
          <div key={ i } style={ { display:"flex",gap:6,alignItems:"center",marginBottom:4 } }>
            <span style={ { color:C.ok,fontSize:7 } }>●</span>
            <span style={ { fontSize:12,color:C.mt } }>{ t }</span>
          </div>
        )) }
      </div>
    </div>
  ); }

function Step2Visual(){

  const C = useColors(); return(
    <div style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:18,padding:24,textAlign:"center" } }>
      <div style={ { display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:24 } }>
        <div style={ { width:8,height:8,borderRadius:"50%",background:C.ac,animation:"pulse 1.5s infinite" } }/>
        <span style={ { fontSize:12,fontWeight:600,color:C.ac } }>Simulation en cours</span>
        <span style={ { fontSize:12,color:C.dm,fontVariantNumeric:"tabular-nums",marginLeft:8 } }>3:12</span>
      </div>
      <Avatar name="Olivier Bertrand" gender="M" size={ 72 }/>
      <div style={ { fontSize:18,fontWeight:600,marginTop:12 } }>Olivier Bertrand</div>
      <div style={ { fontSize:12,color:C.mt,marginBottom:20 } }>DG · MécaPress · Mécanique de précision</div>
      <WaveformAnim/>
      <div className="vm-grid-2" style={ { display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:20 } }>
        <div style={ { background:C.bgE,borderRadius:10,padding:"10px 12px",textAlign:"left" } }>
          <div style={ { fontSize:9,fontWeight:700,color:C.ac,marginBottom:4 } }>LE PROSPECT DIT</div>
          <div style={ { fontSize:12,color:C.tx,lineHeight:1.4,fontStyle:"italic" } }>"On a déjà un prestataire pour la maintenance..."</div>
        </div>
        <div style={ { background:C.bgE,borderRadius:10,padding:"10px 12px",textAlign:"left" } }>
          <div style={ { fontSize:9,fontWeight:700,color:C.bl,marginBottom:4 } }>CONSEIL TEMPS RÉEL</div>
          <div style={ { fontSize:12,color:C.tx,lineHeight:1.4 } }>Ne justifiez pas. Demandez ce qui le satisfait chez son prestataire actuel.</div>
        </div>
      </div>
      <style>{ `@keyframes pulse{ 0%,100%{ opacity:1 }50%{ opacity:0.4 } }` }</style>
    </div>
  ); }

function Step3Visual(){

  const C = useColors(); const comps=[{ l:"Création d'enjeu",s:17 },{ l:"Engagement",s:17 },{ l:"Découverte",s:16 },{ l:"Argumentation",s:14 },{ l:"Objections",s:13 },{ l:"Accroche",s:11 }];
  const sc=s=>s>=15?C.ok:s>=12?C.wr:C.dn;
  return(
    <div style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:18,padding:24 } }>
      <div style={ { display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 } }>
        <Badge color="ok">Évaluation terminée</Badge>
        <span style={ { fontSize:12,color:C.dm } }>Durée : 4:37</span>
      </div>
      <div style={ { textAlign:"center",marginBottom:20 } }>
        <div style={ { display:"inline-flex",alignItems:"baseline",gap:6 } }>
          <span style={ { fontSize:52,fontWeight:200 } }>14.2</span>
          <span style={ { fontSize:18,color:C.dm } }>/20</span>
        </div>
        <div style={ { display:"flex",justifyContent:"center",gap:8,marginTop:8 } }>
          <Badge color="accent">Note B</Badge>
          <Badge color="ok">RDV obtenu</Badge>
        </div>
      </div>
      <div style={ { display:"flex",flexDirection:"column",gap:8,marginBottom:20 } }>
        { comps.map((c,i)=>(
          <div key={ i } style={ { display:"flex",alignItems:"center",gap:10 } }>
            <span style={ { fontSize:11,color:C.mt,width:110,textAlign:"right" } }>{ c.l }</span>
            <div style={ { flex:1,height:5,background:C.bd,borderRadius:3,overflow:"hidden" } }>
              <div style={ { width:`${ (c.s/20)*100 }%`,height:"100%",background:sc(c.s),borderRadius:3,transition:"width 1s" } }/>
            </div>
            <span style={ { fontSize:13,fontWeight:700,color:sc(c.s),width:24 } }>{ c.s }</span>
          </div>
        )) }
      </div>
      <div style={ { background:C.acD,borderRadius:10,padding:"12px 14px",border:"1px solid rgba(212,133,74,0.2)" } }>
        <div style={ { fontSize:10,fontWeight:700,color:C.ac,marginBottom:4 } }>⚡ CONSEIL PRIORITAIRE</div>
        <div style={ { fontSize:13,color:C.tx,lineHeight:1.5 } }>Travaillez votre accroche : vous avez 10 secondes, pas 30. Un enjeu chiffré dès la première phrase.</div>
      </div>
    </div>
  ); }

/* ======== DIVIDER ======== */
function Divider(){
  const C = useColors(); return <div style={ { maxWidth:960,margin:"0 auto",padding:"0 24px" } }><div style={ { height:1,background:`linear-gradient(90deg,transparent,${ C.bd },transparent)` } }/></div>; }

/* ======== MODES DE SIMULATION ======== */
function SimModes(){
  const C = useColors(); const [active,setActive]=useState(0);
  const modes=[
    { icon:"📞",title:"Prospection téléphonique",desc:"Appel à froid classique. Passez le barrage, captez l'attention en 10 secondes, décrochez le RDV. Le cœur de métier du commercial B2B.",examples:"Cold call, découverte, prise de RDV",color:C.bl },
    { icon:"🤝",title:"Négociation commerciale",desc:"Le prospect est intéressé mais négocie dur. Défendez votre prix, trouvez des contreparties, closez le deal sans brader votre marge.",examples:"Défense de prix, closing, compromis",color:C.ac },
    { icon:"😠",title:"Réclamation client",desc:"Client mécontent qui menace de partir. Écoutez, désamorcez, transformez le problème en opportunité de fidélisation.",examples:"Gestion de crise, rétention, upsell",color:C.dn },
    { icon:"👥",title:"Multi-interlocuteurs",desc:"DSI + DAF dans la même pièce. Adaptez votre discours à chaque profil, gérez les dynamiques de groupe, alignez les décideurs.",examples:"Comité, double décideur, consensus",color:C.vi },
    { icon:"🚪",title:"Barrage secrétaire",desc:"La secrétaire filtre les appels. Soyez persuasif sans être agressif, obtenez le transfert vers le décideur.",examples:"Filtrage, contournement, accroche",color:C.wr },
    { icon:"📋",title:"Préparation RDV réel",desc:"Créez un prospect IA calqué sur votre vrai client. Entraînez-vous avant le vrai RDV avec ses vrais enjeux et ses vraies objections.",examples:"Sur mesure, prospect réel, briefing custom",color:C.ok },
  ];
  return(
    <div style={ { padding:"72px 24px",maxWidth:960,margin:"0 auto" } }>
      <div style={ { textAlign:"center",marginBottom:48 } }>
        <div style={ { fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.mt,marginBottom:12 } }>9 types de situations</div>
        <h2 className="vm-h2" style={ { fontSize:30,fontWeight:300,margin:0 } }>Chaque appel est <span style={ { fontWeight:700,color:C.ac } }>un terrain différent</span></h2>
      </div>
      <div style={ { display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12 } }>
        { modes.map((m,i)=>(
          <div key={ i } onClick={ ()=>setActive(i) } style={ { background:active===i?m.color+"10":C.bgC,
            border:`1px solid ${ active===i?m.color+"40":C.bd }`,
            borderRadius:14,padding:"20px 18px",cursor:"pointer",transition:"all 0.25s" } }>
            <div style={ { display:"flex",alignItems:"center",gap:10,marginBottom:10 } }>
              <span style={ { fontSize:22 } }>{ m.icon }</span>
              <h3 style={ { fontSize:14,fontWeight:600,margin:0,color:active===i?m.color:C.tx } }>{ m.title }</h3>
            </div>
            <p style={ { fontSize:12,color:C.mt,lineHeight:1.6,margin:"0 0 10px" } }>{ m.desc }</p>
            <div style={ { display:"flex",gap:4,flexWrap:"wrap" } }>
              { m.examples.split(", ").map((e,j)=>(
                <span key={ j } style={ { fontSize:9,padding:"2px 8px",borderRadius:6,background:active===i?m.color+"15":"rgba(139,141,149,0.08)",color:active===i?m.color:C.dm,fontWeight:600 } }>{ e }</span>
              )) }
            </div>
          </div>
        )) }
      </div>
    </div>
  ); }

/* ======== MULTI-INTERLOCUTEURS DEEP DIVE ======== */
function MultiSection(){
  const C = useColors(); return(
    <div style={ { padding:"72px 24px",maxWidth:960,margin:"0 auto" } }>
      <div style={ { textAlign:"center",marginBottom:48 } }>
        <Badge color="violet" size="sm">Fonctionnalité avancée</Badge>
        <h2 className="vm-h2" style={ { fontSize:30,fontWeight:300,margin:"12px 0 12px" } }>Simulations <span style={ { fontWeight:700,color:C.vi } }>multi-interlocuteurs</span></h2>
        <p style={ { fontSize:15,color:C.mt,maxWidth:520,margin:"0 auto",lineHeight:1.6 } }>
          En vente B2B, vous faites rarement face à un seul décideur. VendMieux simule des réunions avec 2 ou 3 interlocuteurs qui ont chacun leurs priorités.
        </p>
      </div>

      <div className="vm-grid-2" style={ { display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginBottom:32 } }>
        { /* Visual: the meeting */ }
        <div style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:18,padding:24 } }>
          <div style={ { fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:C.dm,marginBottom:16 } }>Exemple : Comité de direction</div>
          
          <div style={ { display:"flex",flexDirection:"column",gap:14 } }>
            { [
              { name:"Marc Tessier",role:"DG",focus:"ROI et coûts",mood:"Sceptique sur le budget",color:C.bl,gender:"M",quote:"Quel est le ROI concret sur 12 mois ?" },
              { name:"Nathalie Roux",role:"Resp. Production",focus:"Fiabilité technique",mood:"Intéressée mais prudente",color:C.ok,gender:"F",quote:"Comment ça s'intègre avec notre GMAO actuelle ?" },
              { name:"Vous",role:"Commercial",focus:"Piloter le consensus",mood:"",color:C.ac,gender:"M",quote:"" },
            ].map((p,i)=>(
              <div key={ i } style={ { display:"flex",gap:12,alignItems:"flex-start",padding:"12px 14px",background:i===2?C.acD+"50":C.bgE,borderRadius:12,border:i===2?`1px solid ${ C.ac }30`:`1px solid transparent` } }>
                <Avatar name={ p.name } gender={ p.gender } size={ 36 }/>
                <div style={ { flex:1 } }>
                  <div style={ { display:"flex",alignItems:"center",gap:8,marginBottom:4 } }>
                    <span style={ { fontSize:13,fontWeight:600 } }>{ p.name }</span>
                    <span style={ { fontSize:9,padding:"1px 6px",borderRadius:4,background:p.color+"18",color:p.color,fontWeight:700 } }>{ p.role }</span>
                  </div>
                  { i<2&&<div style={ { fontSize:11,color:C.mt,marginBottom:4 } }>Focus : { p.focus } · { p.mood }</div> }
                  { p.quote&&<div style={ { fontSize:12,color:C.tx,fontStyle:"italic",background:C.bgC,borderRadius:8,padding:"6px 10px",marginTop:4 } }>"{ p.quote }"</div> }
                  { i===2&&<div style={ { fontSize:11,color:C.ac,fontWeight:500 } }>Adaptez votre discours à chaque interlocuteur en temps réel</div> }
                </div>
              </div>
            )) }
          </div>
        </div>

        { /* How it works */ }
        <div style={ { display:"flex",flexDirection:"column",gap:14 } }>
          <h3 style={ { fontSize:18,fontWeight:600,margin:0,color:C.vi } }>Comment ça fonctionne</h3>
          
          { [
            { title:"Chaque interlocuteur a sa personnalité",desc:"Le DG pense budget, le technique pense fiabilité, les achats pensent prix. L'IA maintient chaque persona de façon cohérente tout au long de l'appel.",icon:"🧠" },
            { title:"Ils interagissent entre eux",desc:"Le DAF peut contredire le DSI. Le technique peut appuyer votre argument. Les dynamiques de groupe sont simulées.",icon:"💬" },
            { title:"Vous devez piloter le consensus",desc:"Impossible de satisfaire tout le monde avec le même argument. Vous devez adapter votre discours en temps réel selon qui parle.",icon:"🎯" },
            { title:"L'évaluation est enrichie",desc:"En plus des 6 compétences FORCE 3D, le débriefing évalue votre gestion des dynamiques de groupe et votre capacité d'adaptation.",icon:"📊" },
          ].map((f,i)=>(
            <div key={ i } style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:12,padding:"14px 16px",display:"flex",gap:12,alignItems:"flex-start" } }>
              <span style={ { fontSize:18,flexShrink:0 } }>{ f.icon }</span>
              <div>
                <div style={ { fontSize:13,fontWeight:600,marginBottom:3 } }>{ f.title }</div>
                <div style={ { fontSize:12,color:C.dm,lineHeight:1.5 } }>{ f.desc }</div>
              </div>
            </div>
          )) }

          <div style={ { background:C.viD,border:"1px solid rgba(139,94,207,0.2)",borderRadius:12,padding:"14px 16px" } }>
            <div style={ { fontSize:11,fontWeight:700,color:C.vi,marginBottom:4 } }>📈 Compétence rare et décisive</div>
            <div style={ { fontSize:12,color:C.tx,lineHeight:1.5 } }>80% des ventes B2B complexes impliquent 2+ décideurs. Savoir gérer un comité, c'est ce qui sépare un bon commercial d'un excellent commercial.</div>
          </div>
        </div>
      </div>

      <div style={ { textAlign:"center" } }>
        <div style={ { display:"inline-flex",gap:8,flexWrap:"wrap",justifyContent:"center" } }>
          { ["DG + DAF","DSI + Métier","Architecte + Maître d'ouvrage","DRH + DAF","Co-gérants","DSI + Commercial + Achats"].map((c,i)=>(
            <span key={ i } style={ { padding:"6px 14px",borderRadius:8,background:C.bgC,border:`1px solid ${ C.bd }`,fontSize:12,color:C.mt } }>{ c }</span>
          )) }
        </div>
        <div style={ { fontSize:12,color:C.dm,marginTop:10 } }>6 configurations multi-interlocuteurs disponibles · Extensible sur demande</div>
      </div>
    </div>
  ); }

/* ======== MÉTHODE FORCE 3D ======== */
function Force3DSection(){
  const C = useColors(); const comps=[
    { letter:"F",name:"Finalité",desc:"Comprendre l'objectif profond du prospect. Pas ce qu'il veut acheter, mais pourquoi.",color:C.bl },
    { letter:"O",name:"Objections",desc:"Anticiper et traiter les freins avec méthode. Questionner avant de répondre.",color:C.ac },
    { letter:"R",name:"Reformulation",desc:"Valider la compréhension mutuelle. Le prospect doit se sentir compris.",color:C.ok },
    { letter:"C",name:"Construction",desc:"Co-construire la solution. Pas vendre, mais résoudre ensemble.",color:C.vi },
    { letter:"E",name:"Engagement",desc:"Obtenir l'action suivante. Toujours repartir avec un prochain pas concret.",color:C.wr },
  ];
  return(
    <div style={ { padding:"72px 24px",maxWidth:960,margin:"0 auto" } }>
      <div style={ { textAlign:"center",marginBottom:48 } }>
        <div style={ { fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.mt,marginBottom:12 } }>Méthode exclusive</div>
        <h2 className="vm-h2" style={ { fontSize:30,fontWeight:300,margin:"0 0 12px" } }>Évalué sur la méthode <span style={ { fontWeight:700,color:C.ac } }>FORCE 3D</span></h2>
        <p style={ { fontSize:15,color:C.mt,maxWidth:480,margin:"0 auto",lineHeight:1.6 } }>
          Pas du BANT américain. Une méthode née de 30 ans de direction commerciale en PME industrielle française.
        </p>
      </div>
      <div className="vm-btn-row" style={ { display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap" } }>
        { comps.map((c,i)=>(
          <div key={ i } style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:14,padding:"20px 18px",width:170,textAlign:"center",transition:"border-color 0.3s" } }
            onMouseEnter={ e=>e.currentTarget.style.borderColor=c.color+"50" }
            onMouseLeave={ e=>e.currentTarget.style.borderColor=C.bd }>
            <div style={ { width:44,height:44,borderRadius:12,background:c.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:c.color,margin:"0 auto 12px" } }>{ c.letter }</div>
            <div style={ { fontSize:14,fontWeight:600,marginBottom:6 } }>{ c.name }</div>
            <div style={ { fontSize:11,color:C.dm,lineHeight:1.5 } }>{ c.desc }</div>
          </div>
        )) }
      </div>
      <div style={ { textAlign:"center",marginTop:28 } }>
        <div style={ { display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:C.mt } }>
          <span style={ { color:C.ac } }>3D</span> = 3 dimensions d'évaluation : <span style={ { fontWeight:600 } }>Technique</span> · <span style={ { fontWeight:600 } }>Relationnel</span> · <span style={ { fontWeight:600 } }>Stratégique</span>
        </div>
      </div>
    </div>
  ); }

/* ======== POUR QUI ======== */
function ForWho(){
  const C = useColors(); const profiles=[
    { icon:"👔",title:"Dirigeant de PME",need:"Vos commerciaux montent en compétence sans mobiliser un formateur. Vous mesurez le ROI.",highlight:"Dashboard manager + suivi progression" },
    { icon:"📊",title:"Directeur commercial",need:"Identifiez les faiblesses de chaque vendeur. Assignez des exercices ciblés. Comparez les performances.",highlight:"Classement équipe + radar FORCE 3D" },
    { icon:"🎯",title:"Commercial terrain",need:"Entraînez-vous avant chaque vrai RDV. Progressez sur vos points faibles. Gagnez en confiance.",highlight:"Mode préparation RDV réel" },
    { icon:"🎓",title:"École de commerce",need:"200+ scénarios réalistes pour vos étudiants. Évaluation automatique. Export des notes par promotion.",highlight:"Scénarios pédagogiques personnalisés" },
  ];
  return(
    <div style={ { padding:"72px 24px",maxWidth:960,margin:"0 auto" } }>
      <div style={ { textAlign:"center",marginBottom:48 } }>
        <div style={ { fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.mt,marginBottom:12 } }>Pour qui</div>
        <h2 className="vm-h2" style={ { fontSize:30,fontWeight:300,margin:0 } }>Conçu pour ceux qui <span style={ { fontWeight:700,color:C.ac } }>vendent vraiment</span></h2>
      </div>
      <div style={ { display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14 } }>
        { profiles.map((p,i)=>(
          <div key={ i } style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:16,padding:"24px 20px",transition:"border-color 0.3s" } }
            onMouseEnter={ e=>e.currentTarget.style.borderColor=C.ac+"40" }
            onMouseLeave={ e=>e.currentTarget.style.borderColor=C.bd }>
            <div style={ { fontSize:28,marginBottom:14 } }>{ p.icon }</div>
            <h3 style={ { fontSize:15,fontWeight:600,margin:"0 0 8px" } }>{ p.title }</h3>
            <p style={ { fontSize:12,color:C.mt,lineHeight:1.6,margin:"0 0 12px" } }>{ p.need }</p>
            <div style={ { fontSize:11,color:C.ac,fontWeight:600,padding:"6px 10px",background:C.acD,borderRadius:8,display:"inline-block" } }>{ p.highlight }</div>
          </div>
        )) }
      </div>
    </div>
  ); }

/* ======== TECH SPECS ======== */
function TechSpecs(){
  const C = useColors(); const specs=[
    { icon:"🗣️",label:"Voix",value:"Google Cloud TTS",detail:"Voix françaises ultra-réalistes, 8 voix différentes" },
    { icon:"🧠",label:"Intelligence",value:"Claude (Anthropic)",detail:"Compréhension contextuelle, mémoire conversationnelle" },
    { icon:"⚡",label:"Latence",value:"< 800ms",detail:"Réponse quasi-instantanée, conversation fluide" },
    { icon:"🔒",label:"Données",value:"Serveurs France",detail:"RGPD, pas de stockage audio, transcripts chiffrés" },
    { icon:"📱",label:"Accès",value:"Navigateur web",detail:"Aucune installation, fonctionne sur mobile et desktop" },
    { icon:"💰",label:"Coût/session",value:"~0.20€",detail:"IA + voix + évaluation inclus" },
  ];
  return(
    <div style={ { padding:"72px 24px",maxWidth:960,margin:"0 auto" } }>
      <div style={ { textAlign:"center",marginBottom:36 } }>
        <div style={ { fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.mt,marginBottom:12 } }>Sous le capot</div>
        <h2 style={ { fontSize:26,fontWeight:300,margin:0 } }>Technologie de <span style={ { fontWeight:700,color:C.ac } }>pointe</span>, expérience <span style={ { fontWeight:700,color:C.ac } }>simple</span></h2>
      </div>
      <div style={ { display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:10 } }>
        { specs.map((s,i)=>(
          <div key={ i } style={ { display:"flex",gap:14,alignItems:"flex-start",background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:12,padding:"16px 18px" } }>
            <span style={ { fontSize:20 } }>{ s.icon }</span>
            <div>
              <div style={ { display:"flex",alignItems:"center",gap:8 } }>
                <span style={ { fontSize:12,color:C.dm } }>{ s.label }</span>
                <span style={ { fontSize:13,fontWeight:600 } }>{ s.value }</span>
              </div>
              <div style={ { fontSize:11,color:C.dm,marginTop:3 } }>{ s.detail }</div>
            </div>
          </div>
        )) }
      </div>
    </div>
  ); }

/* ======== CTA ======== */
function FinalCTA(){
  const C = useColors(); return(
    <div style={ { padding:"72px 24px 88px",textAlign:"center",position:"relative",overflow:"hidden" } }>
      <div style={ { position:"absolute",bottom:"-30%",left:"50%",transform:"translateX(-50%)",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(212,133,74,0.05) 0%,transparent 70%)",pointerEvents:"none" } }/>
      <div style={ { position:"relative" } }>
        <h2 style={ { fontSize:32,fontWeight:300,margin:"0 0 12px" } }>Testez <span style={ { fontWeight:700,color:C.ac } }>maintenant</span>. Jugez par vous-même.</h2>
        <p style={ { fontSize:15,color:C.mt,maxWidth:460,margin:"0 auto 32px" } }>3 simulations gratuites. Pas de carte bancaire. Débriefing FORCE 3D complet dès le premier appel.</p>
        <div className="vm-btn-row" style={ { display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap" } }>
          <button style={ { padding:"16px 40px",background:`linear-gradient(135deg,${ C.ac },${ C.acL })`,border:"none",borderRadius:14,color:"#fff",fontSize:16,fontWeight:600,cursor:"pointer",boxShadow:"0 6px 32px rgba(212,133,74,0.3)" } }>Lancer ma première simulation →</button>
          <button style={ { padding:"16px 32px",background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:14,color:C.tx,fontSize:15,fontWeight:500,cursor:"pointer" } }>Voir les tarifs</button>
        </div>
        <div style={ { fontSize:12,color:C.dm,marginTop:14 } }>Gratuit · Sans inscription · 5 minutes</div>
      </div>
    </div>
  ); }

/* ======== APP ======== */
export default function Produit(){
  const C = useColors(); return(
    <div style={ { minHeight:"100vh",background:C.bg,color:C.tx,fontFamily:"'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif",overflowX:"hidden" } }>
      <Nav active="Produit"/>
      <ProductHero/>
      <StepDetail num="01" color={ C.bl } colorD={ C.blD } title="Briefing" subtitle="Préparez votre appel en 30 secondes" 
        desc="Avant chaque simulation, vous recevez un brief complet : votre rôle, votre offre, le profil du prospect, ce que vous savez sur lui, et votre objectif. Exactement comme un vrai brief de prospection."
        features={ [
          { title:"Contexte réaliste",desc:"Entreprise, secteur, taille, enjeux réels du prospect" },
          { title:"Objectif clair",desc:"RDV, closing, rétention... vous savez quoi viser" },
          { title:"Arguments préparés",desc:"Références clients, ROI, différenciateurs à utiliser" },
          { title:"Niveau de difficulté",desc:"3 niveaux : débutant, intermédiaire, expert" },
        ] }
        visual={ <Step1Visual/> }
      />
      <Divider/>
      <StepDetail num="02" color={ C.ac } colorD={ C.acD } title="Simulation" subtitle="Parlez à un vrai prospect IA" reverse
        desc="Conversation vocale en temps réel. Le prospect IA réagit comme un vrai décideur : il a ses priorités, ses objections, son emploi du temps chargé. Il peut être convaincu — si vous êtes bon."
        features={ [
          { title:"Voix française réaliste",desc:"8 voix différentes, intonations naturelles, pas de robot" },
          { title:"Intelligence situationnelle",desc:"Le prospect adapte ses réponses à ce que vous dites réellement" },
          { title:"Objections réalistes",desc:"'On a déjà un prestataire', 'Envoyez-moi un mail', 'C'est trop cher'..." },
          { title:"Peut être convaincu",desc:"Pas un mur de refus. Un vrai dialogue où la compétence fait la différence" },
        ] }
        visual={ <Step2Visual/> }
      />
      <Divider/>
      <StepDetail num="03" color={ C.ok } colorD={ C.okD } title="Débriefing" subtitle="Évaluation FORCE 3D instantanée"
        desc="30 secondes après l'appel, vous recevez une évaluation complète : score global, radar de compétences, points forts, axes de progression, et un conseil prioritaire actionnable."
        features={ [
          { title:"Score sur 20",desc:"Note globale + note par compétence FORCE 3D" },
          { title:"Radar visuel",desc:"Vos forces et faiblesses en un coup d'œil" },
          { title:"Verbatims précis",desc:"Ce que vous avez bien dit, ce que vous auriez dû dire" },
          { title:"Conseil prioritaire",desc:"L'action #1 pour progresser dès la prochaine session" },
        ] }
        visual={ <Step3Visual/> }
      />
      <Divider/>
      <SimModes/>
      <Divider/>
      <MultiSection/>
      <Divider/>
      <Force3DSection/>
      <Divider/>
      <ForWho/>
      <Divider/>
      <TechSpecs/>
      <FinalCTA/>
      <Footer/>
    </div>
  ); }
