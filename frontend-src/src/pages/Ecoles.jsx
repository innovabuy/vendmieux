import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useColors, Badge, Avatar, WaveformAnim, CountUp, MiniSparkline, Nav, Footer } from "../shared";

/* ======== HERO ======== */
function Hero(){
  const C = useColors(); const navigate = useNavigate(); return(
    <div className="vm-hero" style={ { textAlign:"center",padding:"72px 24px 56px",position:"relative",overflow:"hidden" } }>
      <div style={ { position:"absolute",top:"-20%",left:"50%",transform:"translateX(-50%)",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(139,94,207,0.04) 0%,transparent 70%)",pointerEvents:"none" } }/>
      <div style={ { position:"relative" } }>
        <div style={ { display:"inline-flex",alignItems:"center",gap:8,padding:"6px 16px",borderRadius:20,background:C.viD,color:C.vi,fontSize:12,fontWeight:600,marginBottom:24,border:"1px solid rgba(139,94,207,0.2)" } }>
          🎓 Offre Écoles de Commerce & Universités
        </div>
        <h1 className="vm-h1" style={ { fontSize:42,fontWeight:300,margin:"0 0 18px",letterSpacing:-0.8,lineHeight:1.15 } }>
          Vos étudiants s'entraînent sur<br/><span style={ { fontWeight:700,color:C.ac } }>12 prospects IA réalistes</span>
        </h1>
        <p style={ { fontSize:17,color:C.mt,maxWidth:560,margin:"0 auto 36px",lineHeight:1.65 } }>
          Simulation vocale. Évaluation automatique par compétences. Export des notes par promotion. 
          Le simulateur de vente qui remplace les jeux de rôle entre étudiants.
        </p>
        <div className="vm-btn-row" style={ { display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginBottom:20 } }>
          <button onClick={ ()=>navigate("/ecoles-tarifs") } style={ { padding:"15px 32px",background:`linear-gradient(135deg,${ C.ac },${ C.acL })`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",boxShadow:"0 4px 24px rgba(212,133,74,0.3)" } }>
            Demander un devis école →
          </button>
          <button onClick={ ()=>navigate("/simulation") } style={ { padding:"15px 32px",background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:12,color:C.tx,fontSize:15,fontWeight:500,cursor:"pointer" } }>
            Tester en tant que professeur
          </button>
        </div>
        <div style={ { fontSize:12,color:C.dm } }>Sur devis · Tarif par promotion · Démo gratuite pour les enseignants</div>
      </div>
    </div>
  ); }

/* ======== PROBLÈME ÉCOLES ======== */
function SchoolProblem(){
  const C = useColors(); const problems=[
    { icon:"🎭",title:"Les jeux de rôle étudiants ne fonctionnent pas",desc:"Les étudiants jouent mal le prospect. C'est gênant, pas réaliste, impossible à évaluer objectivement." },
    { icon:"📊",title:"L'évaluation orale est subjective",desc:"2 professeurs, 2 notes différentes. Pas de grille standardisée, pas de reproductibilité entre les groupes." },
    { icon:"⏱️",title:"Pas assez de temps de pratique",desc:"30 étudiants, 1 professeur, 2 heures. Chaque étudiant pratique 4 minutes. C'est insuffisant." },
  ];
  return(
    <div className="vm-section" style={ { padding:"56px 24px",maxWidth:960,margin:"0 auto" } }>
      <div style={ { textAlign:"center",marginBottom:40 } }>
        <h2 className="vm-h2" style={ { fontSize:28,fontWeight:300,margin:0 } }>Enseigner la vente, c'est <span style={ { fontWeight:700,color:C.ac } }>un problème de scalabilité</span></h2>
      </div>
      <div style={ { display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14 } }>
        { problems.map((p,i)=>(
          <div key={ i } style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:16,padding:"24px 22px" } }>
            <div style={ { fontSize:28,marginBottom:14 } }>{ p.icon }</div>
            <h3 style={ { fontSize:15,fontWeight:600,margin:"0 0 8px",lineHeight:1.3 } }>{ p.title }</h3>
            <p style={ { fontSize:13,color:C.mt,lineHeight:1.6,margin:0 } }>{ p.desc }</p>
          </div>
        )) }
      </div>
    </div>
  ); }

/* ======== SOLUTION 3 PILIERS ======== */
function Solution(){
  const C = useColors(); const pillars=[
    { icon:"🗣️",color:C.ac,title:"Simulation vocale réaliste",desc:"Chaque étudiant parle à un prospect IA avec sa propre personnalité, ses objections, ses réactions. 12 scénarios dans 12 secteurs. Pas de script, pas de chatbot.",features:["Conversation vocale temps réel","Prospect qui peut être convaincu","8 voix françaises différentes"] },
    { icon:"📋",color:C.ok,title:"Évaluation automatique FORCE 3D",desc:"6 compétences évaluées sur 3 dimensions (technique, relationnel, stratégique). Score sur 20, radar visuel, verbatims, conseil prioritaire. La même grille pour tout le monde.",features:["Score reproductible et objectif","6 compétences commerciales","Feedback immédiat post-appel"] },
    { icon:"📊",color:C.bl,title:"Dashboard professeur",desc:"Suivez toute la promotion en temps réel. Classement, progression, alertes. Exportez les notes en CSV pour intégration dans votre système de notation.",features:["Vue par promotion / groupe","Export CSV des notes","Comparaison entre groupes"] },
  ];
  return(
    <div className="vm-section" style={ { padding:"56px 24px",maxWidth:960,margin:"0 auto" } }>
      <div style={ { textAlign:"center",marginBottom:48 } }>
        <div style={ { fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.mt,marginBottom:12 } }>La solution</div>
        <h2 className="vm-h2" style={ { fontSize:30,fontWeight:300,margin:0 } }>Un <span style={ { fontWeight:700,color:C.ac } }>simulateur par étudiant</span>, une évaluation par compétences</h2>
      </div>
      <div style={ { display:"flex",flexDirection:"column",gap:20 } }>
        { pillars.map((p,i)=>(
          <div key={ i } className="vm-grid-sidebar" style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:18,padding:"28px 28px",display:"grid",gridTemplateColumns:"1fr 280px",gap:24,alignItems:"center" } }>
            <div>
              <div style={ { display:"flex",alignItems:"center",gap:12,marginBottom:14 } }>
                <span style={ { fontSize:24 } }>{ p.icon }</span>
                <h3 style={ { fontSize:18,fontWeight:600,margin:0,color:p.color } }>{ p.title }</h3>
              </div>
              <p style={ { fontSize:13,color:C.mt,lineHeight:1.7,margin:"0 0 16px" } }>{ p.desc }</p>
              <div style={ { display:"flex",flexDirection:"column",gap:6 } }>
                { p.features.map((f,j)=>(
                  <div key={ j } style={ { display:"flex",gap:8,alignItems:"center" } }>
                    <div style={ { width:16,height:16,borderRadius:5,background:p.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:p.color,fontWeight:700 } }>✓</div>
                    <span style={ { fontSize:12,color:C.mt } }>{ f }</span>
                  </div>
                )) }
              </div>
            </div>
            { i===0&&(
              <div style={ { background:C.bgE,borderRadius:14,padding:18,textAlign:"center" } }>
                <div style={ { display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginBottom:12 } }>
                  <div style={ { width:6,height:6,borderRadius:"50%",background:C.ac,animation:"pulse 1.5s infinite" } }/>
                  <span style={ { fontSize:11,fontWeight:600,color:C.ac } }>Simulation en cours</span>
                </div>
                <Avatar name="Marie Leclerc" gender="F" size={ 48 }/>
                <div style={ { fontSize:13,fontWeight:600,marginTop:8 } }>Marie Leclerc</div>
                <div style={ { fontSize:11,color:C.dm } }>M2 Marketing · Groupe B</div>
                <div style={ { marginTop:10,fontSize:12,color:C.mt,fontStyle:"italic",background:C.bgC,borderRadius:8,padding:"8px 10px" } }>
                  "On a déjà un fournisseur..."
                </div>
              </div>
            ) }
            { i===1&&(
              <div style={ { background:C.bgE,borderRadius:14,padding:18 } }>
                <div style={ { textAlign:"center",marginBottom:12 } }>
                  <span style={ { fontSize:32,fontWeight:200 } }>15.4</span>
                  <span style={ { fontSize:14,color:C.dm } }>/20</span>
                </div>
                { [{ l:"Découverte",s:17,c:C.ok },{ l:"Argumentation",s:16,c:C.ok },{ l:"Engagement",s:15,c:C.ok },{ l:"Objections",s:14,c:C.ac },{ l:"Accroche",s:12,c:C.wr }].map((x,j)=>(
                  <div key={ j } style={ { display:"flex",alignItems:"center",gap:8,marginBottom:5 } }>
                    <span style={ { fontSize:10,color:C.mt,width:80,textAlign:"right" } }>{ x.l }</span>
                    <div style={ { flex:1,height:4,background:C.bd,borderRadius:2,overflow:"hidden" } }>
                      <div style={ { width:`${ (x.s/20)*100 }%`,height:"100%",background:x.c,borderRadius:2 } }/>
                    </div>
                    <span style={ { fontSize:11,fontWeight:600,color:x.c,width:20 } }>{ x.s }</span>
                  </div>
                )) }
              </div>
            ) }
            { i===2&&(
              <div style={ { background:C.bgE,borderRadius:14,padding:18 } }>
                <div style={ { fontSize:10,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:C.dm,marginBottom:10 } }>Promotion M2 2026</div>
                { [
                  { name:"Groupe A",avg:14.8,n:15,c:C.ok },
                  { name:"Groupe B",avg:13.2,n:14,c:C.ac },
                  { name:"Groupe C",avg:15.6,n:16,c:C.ok },
                ].map((g,j)=>(
                  <div key={ j } style={ { display:"flex",alignItems:"center",gap:8,marginBottom:8 } }>
                    <span style={ { fontSize:11,fontWeight:600,width:66 } }>{ g.name }</span>
                    <div style={ { flex:1,height:5,background:C.bd,borderRadius:3,overflow:"hidden" } }>
                      <div style={ { width:`${ (g.avg/20)*100 }%`,height:"100%",background:g.c,borderRadius:3 } }/>
                    </div>
                    <span style={ { fontSize:11,fontWeight:600,color:g.c,width:30 } }>{ g.avg }</span>
                    <span style={ { fontSize:9,color:C.dm } }>({ g.n })</span>
                  </div>
                )) }
                <div style={ { marginTop:10,padding:"8px 12px",background:C.bgC,borderRadius:8,display:"flex",alignItems:"center",gap:8 } }>
                  <span style={ { fontSize:12 } }>📥</span>
                  <span style={ { fontSize:11,color:C.mt } }>Export CSV — Notes par étudiant</span>
                </div>
              </div>
            ) }
          </div>
        )) }
      </div>
    </div>
  ); }

/* ======== CHIFFRES ======== */
function Numbers(){
  const C = useColors(); const stats=[
    { value:12,suffix:"",label:"Scénarios réels",sub:"12 secteurs PME françaises" },
    { value:30,suffix:"",label:"Étudiants simultanés",sub:"Chacun avec son propre prospect IA" },
    { value:6,suffix:"",label:"Compétences évaluées",sub:"Grille FORCE 3D standardisée" },
    { value:5,suffix:" min",label:"Pour un résultat",sub:"Simulation + débriefing complet" },
  ];
  return(
    <div className="vm-section" style={ { padding:"56px 24px" } }>
      <div style={ { maxWidth:960,margin:"0 auto",background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:20,padding:"36px 32px" } }>
        <div style={ { display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:28 } }>
          { stats.map((s,i)=>(
            <div key={ i } style={ { textAlign:"center" } }>
              <div style={ { fontSize:38,fontWeight:200,color:C.vi,lineHeight:1,marginBottom:6 } }><CountUp target={ s.value } suffix={ s.suffix }/></div>
              <div style={ { fontSize:13,fontWeight:600,marginBottom:4 } }>{ s.label }</div>
              <div style={ { fontSize:12,color:C.dm } }>{ s.sub }</div>
            </div>
          )) }
        </div>
      </div>
    </div>
  ); }

/* ======== CAS USAGE PÉDAGOGIQUE ======== */
function UseCases(){
  const C = useColors(); const cases=[
    { icon:"📝",title:"TD de négociation commerciale",desc:"Remplacez les jeux de rôle par des simulations individuelles. Chaque étudiant reçoit un score objectif. Comparez les performances entre groupes.",semester:"S1–S2 · Licence / Master" },
    { icon:"🏆",title:"Challenge inter-promotions",desc:"Organisez un concours de vente entre Master 1 et Master 2. Classement en temps réel, meilleur score, meilleure progression.",semester:"Événement ponctuel" },
    { icon:"📈",title:"Suivi de progression semestriel",desc:"Assignez 3 simulations par mois. Mesurez la progression de chaque étudiant sur 6 compétences. Export des notes en fin de semestre.",semester:"Toute l'année" },
    { icon:"🎯",title:"Préparation aux entretiens",desc:"Les étudiants en stage s'entraînent à vendre à de vrais prospects IA dans le secteur de leur entreprise d'accueil.",semester:"Avant stage · Alternance" },
  ];
  return(
    <div className="vm-section" style={ { padding:"56px 24px",maxWidth:960,margin:"0 auto" } }>
      <div style={ { textAlign:"center",marginBottom:40 } }>
        <div style={ { fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.mt,marginBottom:12 } }>Cas d'usage pédagogiques</div>
        <h2 className="vm-h2" style={ { fontSize:28,fontWeight:300,margin:0 } }>Intégrez VendMieux dans <span style={ { fontWeight:700,color:C.ac } }>votre programme</span></h2>
      </div>
      <div style={ { display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14 } }>
        { cases.map((c,i)=>(
          <div key={ i } style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:16,padding:"22px 20px",transition:"border-color 0.3s" } }
            onMouseEnter={ e=>e.currentTarget.style.borderColor=C.ac+"40" }
            onMouseLeave={ e=>e.currentTarget.style.borderColor=C.bd }>
            <div style={ { fontSize:24,marginBottom:12 } }>{ c.icon }</div>
            <h3 style={ { fontSize:14,fontWeight:600,margin:"0 0 6px" } }>{ c.title }</h3>
            <p style={ { fontSize:12,color:C.mt,lineHeight:1.6,margin:"0 0 12px" } }>{ c.desc }</p>
            <Badge color="violet">{ c.semester }</Badge>
          </div>
        )) }
      </div>
    </div>
  ); }

/* ======== COMPARAISON ======== */
function Comparison(){
  const C = useColors(); const rows=[
    { feature:"Pratique individuelle",old:"4 min/étudiant/séance",nw:"Illimité, 24/7" },
    { feature:"Réalisme du prospect",old:"Étudiant qui joue mal",nw:"IA vocale avec vraie personnalité" },
    { feature:"Évaluation",old:"Subjective, variable",nw:"Score /20 standardisé FORCE 3D" },
    { feature:"Feedback",old:"Général, oral, oublié",nw:"Écrit, par compétence, immédiat" },
    { feature:"Préparation professeur",old:"Rédiger des cas, briefer",nw:"12 scénarios prêts à l'emploi" },
    { feature:"Suivi progression",old:"Carnet de notes Excel",nw:"Dashboard temps réel + export CSV" },
    { feature:"Scalabilité",old:"1 prof = 15 étudiants max",nw:"30 étudiants en même temps" },
  ];
  return(
    <div className="vm-section" style={ { padding:"56px 24px",maxWidth:960,margin:"0 auto" } }>
      <div style={ { textAlign:"center",marginBottom:40 } }>
        <div style={ { fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.mt,marginBottom:12 } }>Avant / Après</div>
        <h2 className="vm-h2" style={ { fontSize:28,fontWeight:300,margin:0 } }>Ce qui change <span style={ { fontWeight:700,color:C.ac } }>concrètement</span></h2>
      </div>
      <div style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:18,overflow:"hidden" } }>
        <div className="vm-grid-compare vm-compare-header" style={ { display:"grid",gridTemplateColumns:"200px 1fr 1fr",borderBottom:`1px solid ${ C.bd }` } }>
          <div style={ { padding:"12px 18px" } }/>
          <div style={ { padding:"12px 18px",fontSize:11,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:C.dn } }>Jeux de rôle classiques</div>
          <div style={ { padding:"12px 18px",fontSize:11,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:C.ok,background:C.okD } }>Avec VendMieux</div>
        </div>
        { rows.map((r,i)=>(
          <div key={ i } className="vm-grid-compare vm-compare-row" style={ { display:"grid",gridTemplateColumns:"200px 1fr 1fr",borderBottom:i<rows.length-1?`1px solid ${ C.bd }10`:"none" } }>
            <div style={ { padding:"10px 18px",fontSize:12,fontWeight:600 } }>{ r.feature }</div>
            <div className="vm-compare-old" style={ { padding:"10px 18px",fontSize:12,color:C.dm } }><span className="vm-compare-label" style={ { display:"none" } }>Avant : </span>{ r.old }</div>
            <div className="vm-compare-new" style={ { padding:"10px 18px",fontSize:12,color:C.ok,fontWeight:500,background:"rgba(61,176,107,0.03)" } }><span className="vm-compare-label" style={ { display:"none" } }>VendMieux : </span>{ r.nw }</div>
          </div>
        )) }
      </div>
    </div>
  ); }

/* ======== TÉMOIGNAGES PLACEHOLDER ======== */
function Testimonials(){
  const C = useColors(); const quotes=[
    { name:"Prof. Dubois",role:"Responsable M2 Commerce · ESC Lyon",quote:"En 2 séances, mes étudiants ont plus progressé qu'en un semestre de jeux de rôle. L'évaluation automatique me fait gagner 10h par mois.",avatar:"PD",gender:"M" },
    { name:"Dr. Menard",role:"Directrice Programme Vente · IAE Nantes",quote:"L'export des notes par promotion est un game-changer. Fini les tableaux Excel. Je vois en temps réel qui progresse et qui décroche.",avatar:"DM",gender:"F" },
    { name:"M. Roche",role:"Intervenant commercial · Kedge BS",quote:"Mes étudiants adorent. Ils s'entraînent le soir depuis chez eux. Le taux de participation a triplé.",avatar:"MR",gender:"M" },
  ];
  return(
    <div className="vm-section" style={ { padding:"56px 24px",maxWidth:960,margin:"0 auto" } }>
      <div style={ { textAlign:"center",marginBottom:40 } }>
        <div style={ { fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.mt,marginBottom:12 } }>Ils l'utilisent</div>
        <h2 className="vm-h2" style={ { fontSize:28,fontWeight:300,margin:0 } }>Ce qu'en disent <span style={ { fontWeight:700,color:C.ac } }>les enseignants</span></h2>
      </div>
      <div style={ { display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))",gap:14 } }>
        { quotes.map((q,i)=>(
          <div key={ i } style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:16,padding:"24px 22px",position:"relative" } }>
            <div style={ { position:"absolute",top:16,right:18,fontSize:32,color:C.bd,fontWeight:800,lineHeight:1 } }>"</div>
            <p style={ { fontSize:13,color:C.mt,lineHeight:1.7,margin:"0 0 18px",fontStyle:"italic" } }>{ q.quote }</p>
            <div style={ { display:"flex",alignItems:"center",gap:10 } }>
              <Avatar name={ q.name } gender={ q.gender } size={ 36 }/>
              <div>
                <div style={ { fontSize:13,fontWeight:600 } }>{ q.name }</div>
                <div style={ { fontSize:11,color:C.dm } }>{ q.role }</div>
              </div>
            </div>
            <div style={ { marginTop:12 } }><Badge color="muted">Témoignage à confirmer</Badge></div>
          </div>
        )) }
      </div>
    </div>
  ); }

/* ======== PRICING ÉCOLE ======== */
function SchoolPricing(){
  const C = useColors(); const navigate = useNavigate(); return(
    <div className="vm-section" style={ { padding:"56px 24px",maxWidth:720,margin:"0 auto" } }>
      <div style={ { textAlign:"center",marginBottom:40 } }>
        <div style={ { fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.mt,marginBottom:12 } }>Tarification école</div>
        <h2 className="vm-h2" style={ { fontSize:28,fontWeight:300,margin:0 } }>Un tarif <span style={ { fontWeight:700,color:C.ac } }>par promotion</span>, pas par étudiant</h2>
      </div>
      <div style={ { background:C.bgC,border:`1px solid ${ C.ac }30`,borderRadius:20,padding:"32px 28px",position:"relative",overflow:"hidden" } }>
        <div style={ { position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${ C.ac },${ C.acL })` } }/>
        <div style={ { display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28,flexWrap:"wrap",gap:16 } }>
          <div>
            <Badge color="violet">Formule École</Badge>
            <h3 style={ { fontSize:22,fontWeight:600,margin:"12px 0 4px" } }>Sur devis</h3>
            <div style={ { fontSize:13,color:C.mt } }>Adapté à la taille de votre école et de vos promotions</div>
          </div>
          <button onClick={ ()=>navigate("/ecoles-tarifs") } style={ { padding:"12px 28px",background:`linear-gradient(135deg,${ C.ac },${ C.acL })`,border:"none",borderRadius:10,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",boxShadow:"0 4px 16px rgba(212,133,74,0.25)" } }>
            Demander un devis →
          </button>
        </div>
        <div className="vm-grid-2" style={ { display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 } }>
          { [
            { icon:"✓",text:"12 scénarios catalogue",color:C.ok },
            { icon:"✓",text:"Scénarios sur mesure",color:C.ok },
            { icon:"✓",text:"Simulations illimitées",color:C.ok },
            { icon:"✓",text:"Débriefing FORCE 3D complet",color:C.ok },
            { icon:"✓",text:"Dashboard professeur",color:C.ok },
            { icon:"✓",text:"Évaluation par promotion",color:C.ok },
            { icon:"✓",text:"Export CSV des notes",color:C.ok },
            { icon:"✓",text:"Support dédié",color:C.ok },
            { icon:"✓",text:"Comparaison inter-groupes",color:C.ok },
            { icon:"✓",text:"Accès 24/7 pour les étudiants",color:C.ok },
            { icon:"✓",text:"Création sur mesure de scénarios",color:C.ok },
            { icon:"✓",text:"Multi-langue (français natif)",color:C.ok },
          ].map((f,i)=>(
            <div key={ i } style={ { display:"flex",gap:8,alignItems:"center" } }>
              <div style={ { width:18,height:18,borderRadius:5,background:C.okD,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:C.ok,fontWeight:700 } }>{ f.icon }</div>
              <span style={ { fontSize:13 } }>{ f.text }</span>
            </div>
          )) }
        </div>
        <div style={ { marginTop:24,padding:"14px 18px",background:C.bgE,borderRadius:12,display:"flex",alignItems:"center",gap:12 } }>
          <span style={ { fontSize:20 } }>💡</span>
          <div>
            <div style={ { fontSize:13,fontWeight:600 } }>Conforme RGPD · Hébergé en France</div>
            <div style={ { fontSize:12,color:C.dm } }>Nous vous fournissons le devis et les documents nécessaires</div>
          </div>
        </div>
      </div>
    </div>
  ); }

/* ======== ONBOARDING ======== */
function Onboarding(){
  const C = useColors(); const steps=[
    { num:"1",title:"Démo gratuite",desc:"30 minutes avec un conseiller. Vous testez le simulateur en live.",time:"Jour 0" },
    { num:"2",title:"Configuration",desc:"On paramètre vos promotions, groupes et scénarios personnalisés.",time:"Jour 1-2" },
    { num:"3",title:"Formation professeur",desc:"1h de prise en main du dashboard et des fonctionnalités d'évaluation.",time:"Jour 3" },
    { num:"4",title:"Lancement",desc:"Vos étudiants commencent. Vous suivez les résultats en temps réel.",time:"Jour 4" },
  ];
  return(
    <div className="vm-section" style={ { padding:"56px 24px",maxWidth:960,margin:"0 auto" } }>
      <div style={ { textAlign:"center",marginBottom:40 } }>
        <div style={ { fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.mt,marginBottom:12 } }>Démarrage</div>
        <h2 className="vm-h2" style={ { fontSize:28,fontWeight:300,margin:0 } }>Opérationnel en <span style={ { fontWeight:700,color:C.ac } }>4 jours</span></h2>
      </div>
      <div className="vm-btn-row" style={ { display:"flex",gap:0,justifyContent:"center",flexWrap:"wrap" } }>
        { steps.map((s,i)=>(
          <div key={ i } style={ { display:"flex",alignItems:"center" } }>
            <div style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:16,padding:"20px 22px",width:190,textAlign:"center" } }>
              <div style={ { width:36,height:36,borderRadius:10,background:C.acD,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:C.ac,margin:"0 auto 10px" } }>{ s.num }</div>
              <div style={ { fontSize:14,fontWeight:600,marginBottom:4 } }>{ s.title }</div>
              <div style={ { fontSize:11,color:C.dm,lineHeight:1.5,marginBottom:8 } }>{ s.desc }</div>
              <Badge color="muted">{ s.time }</Badge>
            </div>
            { i<steps.length-1&&<div style={ { width:32,height:2,background:C.bd,flexShrink:0 } }/> }
          </div>
        )) }
      </div>
    </div>
  ); }

/* ======== CTA ======== */
function FinalCTA(){
  const C = useColors(); const navigate = useNavigate(); return(
    <div style={ { padding:"64px 24px 80px",textAlign:"center",position:"relative",overflow:"hidden" } }>
      <div style={ { position:"absolute",bottom:"-30%",left:"50%",transform:"translateX(-50%)",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(139,94,207,0.04) 0%,transparent 70%)",pointerEvents:"none" } }/>
      <div style={ { position:"relative" } }>
        <h2 className="vm-h2" style={ { fontSize:30,fontWeight:300,margin:"0 0 12px" } }>
          Transformez vos cours de vente <span style={ { fontWeight:700,color:C.ac } }>cette année</span>
        </h2>
        <p style={ { fontSize:15,color:C.mt,maxWidth:480,margin:"0 auto 32px",lineHeight:1.6 } }>
          Démo gratuite pour les enseignants. Testez avec votre propre promotion. Aucun engagement.
        </p>
        <div className="vm-btn-row" style={ { display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap" } }>
          <button onClick={ ()=>navigate("/ecoles-tarifs") } style={ { padding:"16px 36px",background:`linear-gradient(135deg,${ C.ac },${ C.acL })`,border:"none",borderRadius:14,color:"#fff",fontSize:16,fontWeight:600,cursor:"pointer",boxShadow:"0 6px 32px rgba(212,133,74,0.3)" } }>Demander un devis école →</button>
          <button onClick={ ()=>navigate("/simulation") } style={ { padding:"16px 32px",background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:14,color:C.tx,fontSize:15,fontWeight:500,cursor:"pointer" } }>Tester gratuitement</button>
        </div>
        <div style={ { fontSize:12,color:C.dm,marginTop:14 } }>Réponse sous 24h · Devis personnalisé</div>
      </div>
    </div>
  ); }

/* ======== APP ======== */
export default function Ecoles(){
  const C = useColors(); return(
    <div style={ { minHeight:"100vh",background:C.bg,color:C.tx,fontFamily:"'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif",overflowX:"hidden" } }>
      <Nav active="Écoles"/>
      <Hero/>
      <SchoolProblem/>
      <Solution/>
      <Numbers/>
      <Comparison/>
      <UseCases/>
      <Testimonials/>
      <SchoolPricing/>
      <Onboarding/>
      <FinalCTA/>
      <Footer/>
      <style>{ `@keyframes pulse{ 0%,100%{ opacity:1 }50%{ opacity:0.4 } }` }</style>
    </div>
  ); }
