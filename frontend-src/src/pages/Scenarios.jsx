import { useEffect, useMemo, useState } from "react";
import { useColors, Nav } from "../shared";

function getTypeColors(C){ return { "Prospection":{ bg:C.blD,tx:C.bl },
  "Négociation":{ bg:C.acD,tx:C.ac },
  "Réclamation":{ bg:C.wrD,tx:C.wr },
  "Multi-interlocuteurs":{ bg:C.viD,tx:C.vi },
  "Barrage secrétaire":{ bg:C.dnD,tx:C.dn },
  "Closing":{ bg:C.okD,tx:C.ok },
  "Relance":{ bg:"rgba(139,141,149,0.12)",tx:C.mt },
  "Upsell":{ bg:C.acD,tx:C.acL },
  "Fidélisation":{ bg:C.okD,tx:C.ok } }; }

const TYPE_LABELS = {
  prospection_telephonique:"Prospection",
  rdv_one_to_one:"RDV",
  barrage_secretaire:"Barrage secrétaire",
  multi_interlocuteurs:"Multi-interlocuteurs",
  negociation:"Négociation",
  relance_devis:"Relance",
  gestion_reclamation:"Réclamation",
  upsell:"Upsell",
  appel_entrant:"Appel entrant",
  custom:"Sur mesure",
};

function normalizeType(raw){
  return TYPE_LABELS[raw] || raw;
}

/* Legacy hardcoded scenarios — fallback for IDs absent from the API */
const LEGACY_SCENARIOS=[
  { id:"IND-01",title:"Maintenance prédictive IoT",sector:"Industrie",type:"Prospection",prospect:"Olivier Bertrand",role:"DG",company:"MécaPress",employees:85,diff:2,desc:"Vendre une solution IoT de maintenance prédictive à un DG d'usine mécanique qui subit des pannes fréquentes.",gender:"M" },
  { id:"IND-02",title:"Défendre un devis 185K€",sector:"Industrie",type:"Négociation",prospect:"Marc Tessier",role:"DAF",company:"AluPro",employees:120,diff:3,desc:"Le DAF veut 20% de remise sur votre devis d'outillage CNC. Défendez votre prix sans perdre le deal.",gender:"M" },
  { id:"IND-03",title:"Retard livraison 3 semaines",sector:"Industrie",type:"Réclamation",prospect:"Nathalie Roux",role:"Resp. Production",company:"MetalForge",employees:65,diff:2,desc:"Votre livraison a 3 semaines de retard. La responsable production est furieuse. Sauvez la relation.",gender:"F" },
  { id:"IND-04",title:"Passer le barrage usine",sector:"Industrie",type:"Barrage secrétaire",prospect:"Sylvie Martin",role:"Assistante DG",company:"PlastiMould",employees:50,diff:1,desc:"L'assistante filtre tous les appels commerciaux. Obtenez le transfert vers le directeur.",gender:"F" },
  { id:"BTP-01",title:"Location matériel BTP",sector:"BTP",type:"Prospection",prospect:"Philippe Moreau",role:"Dirigeant",company:"Moreau BTP",employees:35,diff:2,desc:"Proposer une offre de location longue durée de mini-pelles et chariots à un artisan BTP en croissance.",gender:"M" },
  { id:"BTP-02",title:"Renégocier contrat annuel",sector:"BTP",type:"Négociation",prospect:"Laurent Blanc",role:"DG",company:"Construc+",employees:90,diff:3,desc:"Le client veut renégocier son contrat annuel de fournitures. Il a reçu une offre concurrente 15% moins chère.",gender:"M" },
  { id:"SAN-01",title:"Logiciel cabinet médical",sector:"Santé",type:"Prospection",prospect:"Dr. Sophie Lambert",role:"Médecin généraliste",company:"Cabinet Santé+",employees:5,diff:2,desc:"Vendre un logiciel de gestion de cabinet à une médecin généraliste qui utilise encore du papier.",gender:"F" },
  { id:"SAN-02",title:"Équipement dentaire",sector:"Santé",type:"Closing",prospect:"Dr. Pierre Faure",role:"Chirurgien-dentiste",company:"Cabinet Faure",employees:8,diff:2,desc:"Le dentiste est intéressé par votre fauteuil dernière génération. Closez le deal aujourd'hui.",gender:"M" },
  { id:"TECH-01",title:"ERP cloud PME industrielle",sector:"Tech / SaaS",type:"Prospection",prospect:"Stéphane Girard",role:"DSI",company:"PrécisInox",employees:150,diff:3,desc:"Convaincre un DSI industriel de migrer son ERP legacy vers votre solution cloud. Il a peur du changement.",gender:"M" },
  { id:"TECH-02",title:"Cybersécurité SOC managé",sector:"Tech / SaaS",type:"Multi-interlocuteurs",prospect:"Claire Dubois + Thomas Petit",role:"DSI + DAF",company:"DataSoft",employees:80,diff:3,desc:"Présentez votre offre SOC au DSI et au DAF en même temps. Le DSI veut, le DAF freine sur le budget.",gender:"F" },
  { id:"TECH-03",title:"Renouvellement licences SaaS",sector:"Tech / SaaS",type:"Fidélisation",prospect:"Julie Mercier",role:"Resp. IT",company:"WebAgency",employees:25,diff:1,desc:"Le contrat arrive à échéance. La responsable IT hésite à renouveler car l'adoption est faible.",gender:"F" },
  { id:"COM-01",title:"Caisse iPad restaurant",sector:"Commerce",type:"Prospection",prospect:"Antoine Legrand",role:"Gérant",company:"Brasserie du Parc",employees:12,diff:1,desc:"Proposer un système de caisse iPad tactile à un restaurateur qui utilise une caisse classique depuis 10 ans.",gender:"M" },
  { id:"COM-02",title:"Réapprovisionnement automatique",sector:"Commerce",type:"Upsell",prospect:"Martine Chevalier",role:"Directrice",company:"SuperMarché Bio",employees:20,diff:2,desc:"La cliente utilise votre logiciel de caisse. Vendez-lui le module de réapprovisionnement automatique.",gender:"F" },
  { id:"IMM-01",title:"CRM immobilier agence",sector:"Immobilier",type:"Prospection",prospect:"François Duval",role:"Directeur d'agence",company:"Duval Immobilier",employees:8,diff:2,desc:"Vendre un CRM spécialisé immobilier à un directeur d'agence qui gère ses mandats sur Excel.",gender:"M" },
  { id:"IMM-02",title:"Visite virtuelle 360°",sector:"Immobilier",type:"Closing",prospect:"Sandra Petit",role:"Gérante",company:"ImmoVista",employees:5,diff:2,desc:"Sandra a vu votre démo de visite virtuelle. Elle hésite entre vous et un concurrent moins cher.",gender:"F" },
  { id:"TRA-01",title:"Logiciel gestion flotte",sector:"Transport",type:"Prospection",prospect:"Didier Rousseau",role:"DG",company:"TransLoire",employees:45,diff:2,desc:"Proposer une solution de gestion de flotte GPS à un transporteur qui perd du temps sur la planification.",gender:"M" },
  { id:"ENR-01",title:"Audit énergétique industriel",sector:"Énergie",type:"Prospection",prospect:"Isabelle Martin",role:"Resp. RSE",company:"TextilNord",employees:200,diff:2,desc:"Vendre un audit énergétique à une responsable RSE d'une usine textile soumise au décret tertiaire.",gender:"F" },
  { id:"FOR-01",title:"Plateforme e-learning entreprise",sector:"Formation",type:"Prospection",prospect:"Caroline Lefevre",role:"DRH",company:"GroupeAlpha",employees:300,diff:2,desc:"Proposer votre LMS à une DRH qui gère 300 collaborateurs et peine à organiser les formations obligatoires.",gender:"F" },
  { id:"JUR-01",title:"Logiciel gestion cabinet avocat",sector:"Juridique",type:"Prospection",prospect:"Maître Delacroix",role:"Associé",company:"Cabinet Delacroix & Fils",employees:12,diff:3,desc:"Vendre un logiciel de gestion de dossiers à un avocat associé très traditionnel, attaché au papier.",gender:"M" },
  { id:"AUTO-01",title:"Logiciel DMS concession",sector:"Automobile",type:"Prospection",prospect:"Patrick Renault",role:"Directeur",company:"Renault Angers",employees:40,diff:2,desc:"Proposer un DMS (Dealer Management System) à un directeur de concession qui utilise un logiciel vieillissant.",gender:"M" },
  { id:"BEA-01",title:"Logiciel salon coiffure",sector:"Beauté",type:"Prospection",prospect:"Emma Roussel",role:"Gérante",company:"Salon Emma",employees:4,diff:1,desc:"Vendre un logiciel de prise de RDV en ligne et caisse à une coiffeuse qui gère tout sur un cahier.",gender:"F" },
  { id:"ASS-01",title:"Assurance flotte auto",sector:"Assurance",type:"Prospection",prospect:"Jean-Marc Fontaine",role:"DG",company:"Express Livraison",employees:60,diff:2,desc:"Proposer une assurance flotte à un dirigeant de société de livraison dont les primes ont augmenté de 30%.",gender:"M" },
  { id:"ASS-02",title:"Client sinistré mécontent",sector:"Assurance",type:"Réclamation",prospect:"Véronique Dumont",role:"Cliente",company:"Boulangerie Dumont",employees:6,diff:2,desc:"La boulangère a subi un dégât des eaux. L'indemnisation traîne depuis 2 mois. Elle menace de résilier.",gender:"F" },
  { id:"ART-01",title:"Comptabilité artisan plombier",sector:"Artisanat",type:"Prospection",prospect:"Bruno Lefèvre",role:"Artisan",company:"Lefèvre Plomberie",employees:3,diff:1,desc:"Proposer un logiciel de devis/facturation à un artisan plombier qui fait ses devis sur Word.",gender:"M" },
  { id:"SEC-01",title:"Vidéosurveillance entrepôt",sector:"Sécurité",type:"Prospection",prospect:"Richard Garnier",role:"Resp. logistique",company:"LogiStock",employees:70,diff:2,desc:"Vendre un système de vidéosurveillance IP à un responsable logistique après un vol dans l'entrepôt.",gender:"M" },
  { id:"EVT-01",title:"Logiciel gestion événements",sector:"Événementiel",type:"Prospection",prospect:"Camille Perrot",role:"Directrice",company:"EventPro",employees:10,diff:2,desc:"Proposer un logiciel de gestion d'événements à une directrice d'agence qui jongle entre 5 outils différents.",gender:"F" },
  { id:"REST-01",title:"Fournisseur produits frais",sector:"Restauration",type:"Prospection",prospect:"Michel Gauthier",role:"Chef propriétaire",company:"Le Petit Bistrot",employees:8,diff:1,desc:"Proposer votre service de livraison de produits frais locaux à un chef qui commande chez 6 fournisseurs différents.",gender:"M" },
  { id:"AGR-01",title:"Logiciel gestion parcellaire",sector:"Agriculture",type:"Prospection",prospect:"Jean-Pierre Morin",role:"Exploitant",company:"EARL Morin",employees:4,diff:1,desc:"Vendre un logiciel de gestion parcellaire à un exploitant céréalier qui gère tout sur des carnets.",gender:"M" },
  { id:"PROP-01",title:"Client mécontent qualité ménage",sector:"Propreté",type:"Réclamation",prospect:"Hélène Vidal",role:"Office Manager",company:"CabinetConseil+",employees:50,diff:2,desc:"L'office manager se plaint de la qualité du ménage dans leurs bureaux depuis 3 semaines. Contrat menacé.",gender:"F" },
  { id:"SRV-01",title:"Externalisation paie",sector:"Services",type:"Prospection",prospect:"Thierry Bonnet",role:"DRH",company:"Bonnet & Associés",employees:100,diff:2,desc:"Proposer l'externalisation de la paie à un DRH de cabinet comptable qui la gère en interne avec des erreurs récurrentes.",gender:"M" },
  { id:"SRV-02",title:"Relance devis signé non démarré",sector:"Services",type:"Relance",prospect:"Aline Marchand",role:"Directrice",company:"CleanPlus",employees:30,diff:1,desc:"Le devis est signé depuis 3 semaines mais le client ne lance pas. Relancez sans mettre la pression.",gender:"F" },
  { id:"MULTI-01",title:"Comité de direction PME industrielle",sector:"Industrie",type:"Multi-interlocuteurs",prospect:"Marc Tessier + Nathalie Roux",role:"DG + Resp. Production",company:"AluPro",employees:120,diff:3,desc:"Présentez votre solution au DG (focalisé coûts) et à la responsable production (focalisée fiabilité). Alignez deux visions opposées.",gender:"M" },
  { id:"MULTI-02",title:"Duo DRH + DAF formation",sector:"Formation",type:"Multi-interlocuteurs",prospect:"Caroline Lefevre + Jean Morel",role:"DRH + DAF",company:"GroupeAlpha",employees:300,diff:3,desc:"La DRH veut votre plateforme e-learning, le DAF veut réduire les budgets formation. Convainquez les deux dans le même appel.",gender:"F" },
  { id:"MULTI-03",title:"Prescription architecte + décideur maître d'ouvrage",sector:"BTP",type:"Multi-interlocuteurs",prospect:"Anne Lefèvre + Pierre Garnier",role:"Architecte + Maître d'ouvrage",company:"Projet Résidence Verte",employees:0,diff:3,desc:"L'architecte prescrit vos menuiseries alu. Le maître d'ouvrage veut du PVC moins cher. Trouvez l'argument qui satisfait les deux.",gender:"F" },
  { id:"MULTI-04",title:"Trinôme DSI + Métier + Achats",sector:"Tech / SaaS",type:"Multi-interlocuteurs",prospect:"S. Girard + L. Blanc + M. Duval",role:"DSI + Dir. Commercial + Achats",company:"MédiaGroup",employees:250,diff:3,desc:"3 décideurs, 3 priorités : le DSI veut la sécurité, le commercial veut la rapidité, les achats veulent le prix. Pilotez le consensus.",gender:"M" },
  { id:"MULTI-05",title:"Couple gérants boutique",sector:"Commerce",type:"Multi-interlocuteurs",prospect:"Antoine + Marie Legrand",role:"Co-gérants",company:"Brasserie du Parc",employees:12,diff:2,desc:"Le mari est enthousiaste pour votre solution, la femme est sceptique et gère les finances. Convainquez le duo.",gender:"M" },
  { id:"BAR-01",title:"Barrage assistante cabinet comptable",sector:"Services",type:"Barrage secrétaire",prospect:"Marie-Claire Dupont",role:"Assistante de direction",company:"Bonnet & Associés",employees:100,diff:1,desc:"L'assistante est rodée : elle filtre 20 appels commerciaux par jour. Trouvez l'angle pour passer.",gender:"F" },
  { id:"BAR-02",title:"Standard clinique vétérinaire",sector:"Santé",type:"Barrage secrétaire",prospect:"Aurélie Petit",role:"Secrétaire médicale",company:"Clinique VétéSoins",employees:15,diff:2,desc:"La secrétaire protège le vétérinaire en consultation. Obtenez un rappel ou un créneau sans être intrusif.",gender:"F" },
  { id:"BAR-03",title:"Accueil siège groupe industriel",sector:"Industrie",type:"Barrage secrétaire",prospect:"Sandrine Moreau",role:"Standardiste",company:"Groupe MécaPro",employees:500,diff:2,desc:"Le standard d'un groupe de 500 personnes. Vous ne connaissez que le nom du directeur technique. Faites-vous transférer.",gender:"F" },
];

function ScenarioBadge({ children,bg,color }){
  const C = useColors(); return <span style={ { display:"inline-flex",padding:"2px 8px",borderRadius:10,fontSize:9,fontWeight:700,letterSpacing:0.3,background:bg||C.acD,color:color||C.ac,textTransform:"uppercase" } }>{ children }</span>; }

function DiffDots({ level }){
  const C = useColors(); const colors=["",C.ok,C.wr,C.dn];
  const labels=["","Débutant","Intermédiaire","Expert"];
  return(
    <div style={ { display:"flex",alignItems:"center",gap:4 } }>
      { [1,2,3].map(d=><div key={ d } style={ { width:6,height:6,borderRadius:"50%",background:d<=level?colors[level]:C.bd } }/>) }
      <span style={ { fontSize:9,color:colors[level],fontWeight:600,marginLeft:2 } }>{ labels[level] }</span>
    </div>
  ); }

function ScenarioCard({ s,onClick }){
  const C = useColors(); const tc=getTypeColors(C)[s.type]||{ bg:C.acD,tx:C.ac };
  return(
    <div onClick={ onClick } style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:14,padding:"18px 16px",cursor:"pointer",transition:"all 0.2s" } }
      onMouseEnter={ e=>{ e.currentTarget.style.borderColor=C.ac+"50";e.currentTarget.style.transform="translateY(-2px)"; } }
      onMouseLeave={ e=>{ e.currentTarget.style.borderColor=C.bd;e.currentTarget.style.transform="translateY(0)"; } }>
      <div style={ { display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 } }>
        <ScenarioBadge bg={ tc.bg } color={ tc.tx }>{ s.type }</ScenarioBadge>
        <span style={ { fontSize:10,color:C.dm,fontFamily:"monospace" } }>{ s.id }</span>
      </div>
      <h3 style={ { fontSize:14,fontWeight:600,margin:"0 0 8px",lineHeight:1.3 } }>{ s.title }</h3>
      <div style={ { display:"flex",alignItems:"center",gap:8,marginBottom:10 } }>
        <div style={ { width:28,height:28,borderRadius:"50%",background:s.gender==="F"?"linear-gradient(135deg,#8B5E83,#6B4E73)":"linear-gradient(135deg,#4A6B8A,#3A5B7A)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff" } }>
          { s.prospect.split(" ").map(n=>n[0]).join("").slice(0,2) }
        </div>
        <div>
          <div style={ { fontSize:12,fontWeight:500 } }>{ s.prospect }</div>
          <div style={ { fontSize:10,color:C.dm } }>{ s.role } · { s.company }</div>
        </div>
      </div>
      <p style={ { fontSize:11,color:C.dm,lineHeight:1.5,margin:"0 0 10px",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" } }>{ s.desc }</p>
      <div style={ { display:"flex",justifyContent:"space-between",alignItems:"center" } }>
        <span style={ { fontSize:10,color:C.dm,background:C.bgE,padding:"2px 8px",borderRadius:6 } }>{ s.sector }</span>
        <DiffDots level={ s.diff }/>
      </div>
    </div>
  ); }

function ScenarioModal({ s,onClose }){
  const C = useColors(); if(!s) return null;
  const tc=getTypeColors(C)[s.type]||{ bg:C.acD,tx:C.ac };
  return(
    <div onClick={ onClose } style={ { position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:24 } }>
      <div onClick={ e=>e.stopPropagation() } style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:20,padding:32,maxWidth:560,width:"100%",maxHeight:"80vh",overflow:"auto",position:"relative" } }>
        <button onClick={ onClose } style={ { position:"absolute",top:16,right:16,background:C.bgE,border:`1px solid ${ C.bd }`,borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:C.mt,cursor:"pointer" } }>×</button>

        <div style={ { display:"flex",gap:8,marginBottom:16 } }>
          <ScenarioBadge bg={ tc.bg } color={ tc.tx }>{ s.type }</ScenarioBadge>
          <span style={ { fontSize:10,color:C.dm,fontFamily:"monospace",padding:"2px 8px",background:C.bgE,borderRadius:6 } }>{ s.id }</span>
        </div>

        <h2 style={ { fontSize:22,fontWeight:600,margin:"0 0 16px" } }>{ s.title }</h2>

        <div style={ { display:"flex",alignItems:"center",gap:12,marginBottom:20,padding:"14px 16px",background:C.bgE,borderRadius:12 } }>
          <div style={ { width:44,height:44,borderRadius:"50%",background:s.gender==="F"?"linear-gradient(135deg,#8B5E83,#6B4E73)":"linear-gradient(135deg,#4A6B8A,#3A5B7A)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:"#fff" } }>
            { s.prospect.split(" ").map(n=>n[0]).join("").slice(0,2) }
          </div>
          <div>
            <div style={ { fontSize:15,fontWeight:600 } }>{ s.prospect }</div>
            <div style={ { fontSize:12,color:C.mt } }>{ s.role } · { s.company }{ s.employees ? ` · ${s.employees} salariés` : "" }</div>
          </div>
        </div>

        <div style={ { marginBottom:20 } }>
          <div style={ { fontSize:10,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:C.mt,marginBottom:8 } }>Contexte</div>
          <p style={ { fontSize:14,color:C.mt,lineHeight:1.7,margin:0 } }>{ s.desc }</p>
        </div>

        { s.tags && s.tags.length > 0 && (
          <div style={ { display:"flex",gap:6,flexWrap:"wrap",marginBottom:20 } }>
            { s.tags.map((t,i) => <span key={i} style={ { fontSize:10,padding:"2px 8px",borderRadius:6,background:C.bgE,color:C.dm } }>{t}</span>) }
          </div>
        ) }

        <div className="vm-grid-3" style={ { display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:24 } }>
          <div style={ { background:C.bgE,borderRadius:10,padding:"10px 12px",textAlign:"center" } }>
            <div style={ { fontSize:10,color:C.dm,marginBottom:4 } }>Secteur</div>
            <div style={ { fontSize:12,fontWeight:600 } }>{ s.sector }</div>
          </div>
          <div style={ { background:C.bgE,borderRadius:10,padding:"10px 12px",textAlign:"center" } }>
            <div style={ { fontSize:10,color:C.dm,marginBottom:4 } }>Type</div>
            <div style={ { fontSize:12,fontWeight:600,color:tc.tx } }>{ s.type }</div>
          </div>
          <div style={ { background:C.bgE,borderRadius:10,padding:"10px 12px",textAlign:"center" } }>
            <div style={ { fontSize:10,color:C.dm,marginBottom:4 } }>Difficulté</div>
            <DiffDots level={ s.diff }/>
          </div>
        </div>

        <a href={`/simulation?scenario=${s.id}`} style={ { display:"block",width:"100%",padding:"14px 24px",background:`linear-gradient(135deg,${ C.ac },${ C.acL })`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",boxShadow:"0 4px 16px rgba(212,133,74,0.25)",textAlign:"center",textDecoration:"none" } }>
          Lancer cette simulation →
        </a>
        <div style={ { textAlign:"center",fontSize:11,color:C.dm,marginTop:8 } }>Durée estimée : 5-8 minutes</div>
      </div>
    </div>
  ); }

/* ======== APP ======== */
export default function Scenarios(){
  const C = useColors();
  const [search,setSearch]=useState("");
  const [sector,setSector]=useState("Tous");
  const [type,setType]=useState("Tous");
  const [diff,setDiff]=useState(0);
  const [selected,setSelected]=useState(null);
  const [loading,setLoading]=useState(true);
  const [scenarios,setScenarios]=useState([]);
  const [apiSectors,setApiSectors]=useState([]);
  const [apiTypes,setApiTypes]=useState([]);

  useEffect(()=>{
    fetch("/api/scenarios")
      .then(r=>r.json())
      .then(data=>{
        const apiMapped = (data.scenarios || []).map(s => ({
          id: s.id,
          title: s.titre || s.id,
          sector: s.secteur || "?",
          type: normalizeType(s.type_simulation || "Prospection"),
          prospect: s.name || "?",
          role: s.poste || "?",
          company: s.entreprise || "?",
          employees: 0,
          diff: s.difficulty || 2,
          desc: s.titre || "",
          gender: "M",
          tags: s.tags || [],
          source: s.source || "database",
        }));
        // Merge: API scenarios first, then legacy fallbacks for missing IDs
        const seenIds = new Set(apiMapped.map(s => s.id));
        const legacyExtra = LEGACY_SCENARIOS.filter(s => !seenIds.has(s.id));
        // For API scenarios that also exist in legacy, enrich with legacy details
        const enriched = apiMapped.map(s => {
          const leg = LEGACY_SCENARIOS.find(l => l.id === s.id);
          if(leg) return { ...s, desc: leg.desc, prospect: leg.prospect, role: leg.role, company: leg.company, employees: leg.employees, gender: leg.gender, title: leg.title, type: leg.type };
          return s;
        });
        const merged = [...enriched, ...legacyExtra];
        setScenarios(merged);
        setApiSectors((data.secteurs || []).sort());
        const displayTypes = [...new Set(merged.map(s => s.type))].sort();
        setApiTypes(displayTypes);
        setLoading(false);
      })
      .catch(()=>{
        // Fallback to legacy data if API fails
        setScenarios(LEGACY_SCENARIOS);
        const displayTypes = [...new Set(LEGACY_SCENARIOS.map(s => s.type))].sort();
        setApiTypes(displayTypes);
        setApiSectors([...new Set(LEGACY_SCENARIOS.map(s => s.sector))].sort());
        setLoading(false);
      });
  },[]);

  const filtered=useMemo(()=>{ return scenarios.filter(s=>{ if(sector!=="Tous"&&s.sector!==sector) return false;
      if(type!=="Tous"&&s.type!==type) return false;
      if(diff>0&&s.diff!==diff) return false;
      if(search){ const q=search.toLowerCase();
        return s.title.toLowerCase().includes(q)||s.sector.toLowerCase().includes(q)||s.type.toLowerCase().includes(q)||s.prospect.toLowerCase().includes(q)||s.company.toLowerCase().includes(q)||s.desc.toLowerCase().includes(q); }
      return true; }); },[search,sector,type,diff,scenarios]);

  const sectorCounts=useMemo(()=>{ const m={ };scenarios.forEach(s=>{ m[s.sector]=(m[s.sector]||0)+1; });return m; },[scenarios]);

  const typeCounts=useMemo(()=>{ const m={ };scenarios.forEach(s=>{ m[s.type]=(m[s.type]||0)+1; });return m; },[scenarios]);

  // Deduplicated sector list from API + data
  const sectors = useMemo(()=>{
    const all = new Set([...apiSectors, ...scenarios.map(s=>s.sector)]);
    return [...all].sort();
  },[apiSectors,scenarios]);

  return(
    <div style={ { minHeight:"100vh",background:C.bg,color:C.tx,fontFamily:"'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif",overflowX:"hidden" } }>
      <Nav active="Scénarios"/>

      { /* Hero */ }
      <div className="vm-hero" style={ { textAlign:"center",padding:"56px 24px 24px" } }>
        <div style={ { display:"inline-flex",padding:"3px 10px",borderRadius:16,fontSize:10,fontWeight:700,letterSpacing:0.3,background:C.acD,color:C.ac,textTransform:"uppercase",marginBottom:16 } }>Catalogue</div>
        <h1 className="vm-h1" style={ { fontSize:36,fontWeight:300,margin:"0 0 12px",letterSpacing:-0.8 } }>
          <span style={ { fontWeight:700,color:C.ac } }>{ scenarios.length }+</span> scénarios de vente réalistes
        </h1>
        <p style={ { fontSize:15,color:C.mt,maxWidth:520,margin:"0 auto",lineHeight:1.6 } }>
          { sectors.length } secteurs PME françaises · { apiTypes.length } types de situations · 3 niveaux de difficulté.
          Chaque scénario est un vrai cas commercial, pas un exercice académique.
        </p>
      </div>

      { /* Stats bar */ }
      <div style={ { maxWidth:1080,margin:"24px auto",padding:"0 24px" } }>
        <div className="vm-btn-row" style={ { display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap" } }>
          { [
            { v:scenarios.length,l:"scénarios affichés",s:`catalogue dynamique` },
            { v:sectors.length,l:"secteurs",s:"PME françaises" },
            { v:apiTypes.length,l:"types de situations",s:"du cold call au closing" },
          ].map((s,i)=>(
            <div key={ i } style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:10,padding:"10px 20px",textAlign:"center" } }>
              <span style={ { fontSize:20,fontWeight:200,color:C.ac } }>{ s.v }</span>
              <span style={ { fontSize:12,fontWeight:600,marginLeft:6 } }>{ s.l }</span>
              <div style={ { fontSize:10,color:C.dm } }>{ s.s }</div>
            </div>
          )) }
        </div>
      </div>

      <div style={ { maxWidth:1080,margin:"0 auto",padding:"24px 24px 80px" } }>
        { /* Filters */ }
        <div style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:16,padding:"18px 20px",marginBottom:24 } }>
          { /* Search */ }
          <div style={ { marginBottom:14 } }>
            <input value={ search } onChange={ e=>setSearch(e.target.value) } placeholder="Rechercher un scénario, secteur, prospect..." style={ { width:"100%",padding:"11px 16px",background:C.bgE,border:`1px solid ${ C.bd }`,borderRadius:10,color:C.tx,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit" } } onFocus={ e=>e.target.style.borderColor=C.ac } onBlur={ e=>e.target.style.borderColor=C.bd }/>
          </div>

          { /* Sector filter */ }
          <div style={ { marginBottom:12 } }>
            <div style={ { fontSize:10,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:C.dm,marginBottom:8 } }>Secteur</div>
            <div style={ { display:"flex",gap:6,flexWrap:"wrap" } }>
              <button onClick={ ()=>setSector("Tous") } style={ { padding:"5px 12px",borderRadius:7,border:`1px solid ${ sector==="Tous"?C.ac+"60":C.bd }`,background:sector==="Tous"?C.acD:"transparent",color:sector==="Tous"?C.ac:C.dm,fontSize:11,fontWeight:sector==="Tous"?600:400,cursor:"pointer" } }>Tous ({ scenarios.length })</button>
              { sectors.map(s=>(
                <button key={ s } onClick={ ()=>setSector(sector===s?"Tous":s) } style={ { padding:"5px 12px",borderRadius:7,border:`1px solid ${ sector===s?C.ac+"60":C.bd }`,background:sector===s?C.acD:"transparent",color:sector===s?C.ac:C.dm,fontSize:11,fontWeight:sector===s?600:400,cursor:"pointer" } }>{ s } ({ sectorCounts[s]||0 })</button>
              )) }
            </div>
          </div>

          { /* Type filter */ }
          <div style={ { marginBottom:12 } }>
            <div style={ { fontSize:10,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:C.dm,marginBottom:8 } }>Type de situation</div>
            <div style={ { display:"flex",gap:6,flexWrap:"wrap" } }>
              <button onClick={ ()=>setType("Tous") } style={ { padding:"5px 12px",borderRadius:7,border:`1px solid ${ type==="Tous"?C.ac+"60":C.bd }`,background:type==="Tous"?C.acD:"transparent",color:type==="Tous"?C.ac:C.dm,fontSize:11,fontWeight:type==="Tous"?600:400,cursor:"pointer" } }>Tous</button>
              { apiTypes.map(t=>{ const tc2=getTypeColors(C)[t]||{ bg:C.acD,tx:C.ac };return(
                <button key={ t } onClick={ ()=>setType(type===t?"Tous":t) } style={ { padding:"5px 12px",borderRadius:7,border:`1px solid ${ type===t?tc2.tx+"60":C.bd }`,background:type===t?tc2.bg:"transparent",color:type===t?tc2.tx:C.dm,fontSize:11,fontWeight:type===t?600:400,cursor:"pointer" } }>{ t } ({ typeCounts[t]||0 })</button>
              ); }) }
            </div>
          </div>

          { /* Difficulty filter */ }
          <div>
            <div style={ { fontSize:10,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:C.dm,marginBottom:8 } }>Difficulté</div>
            <div style={ { display:"flex",gap:6 } }>
              { [{ v:0,l:"Toutes" },{ v:1,l:"🟢 Débutant" },{ v:2,l:"🟠 Intermédiaire" },{ v:3,l:"🔴 Expert" }].map(d2=>(
                <button key={ d2.v } onClick={ ()=>setDiff(diff===d2.v?0:d2.v) } style={ { padding:"5px 12px",borderRadius:7,border:`1px solid ${ diff===d2.v?C.ac+"60":C.bd }`,background:diff===d2.v?C.acD:"transparent",color:diff===d2.v?C.ac:C.dm,fontSize:11,fontWeight:diff===d2.v?600:400,cursor:"pointer" } }>{ d2.l }</button>
              )) }
            </div>
          </div>
        </div>

        { /* Results count */ }
        <div style={ { display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 } }>
          <span style={ { fontSize:13,color:C.mt } }><span style={ { fontWeight:700,color:C.ac } }>{ filtered.length }</span> scénario{ filtered.length>1?"s":"" }{ search||sector!=="Tous"||type!=="Tous"||diff>0?" (filtré"+((filtered.length>1)?"s":"")+")" :"" }</span>
          { (search||sector!=="Tous"||type!=="Tous"||diff>0)&&(
            <button onClick={ ()=>{ setSearch("");setSector("Tous");setType("Tous");setDiff(0); } } style={ { padding:"5px 14px",borderRadius:7,border:`1px solid ${ C.bd }`,background:"transparent",color:C.mt,fontSize:11,cursor:"pointer" } }>Réinitialiser les filtres</button>
          ) }
        </div>

        { /* Grid */ }
        { loading ? (
          <div style={ { textAlign:"center",padding:"64px 24px" } }>
            <div style={ { fontSize:16,fontWeight:600,marginBottom:8,color:C.mt } }>Chargement des scénarios...</div>
          </div>
        ) : filtered.length>0 ? (
          <div style={ { display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14 } }>
            { filtered.map(s=><ScenarioCard key={ s.id } s={ s } onClick={ ()=>setSelected(s) }/>) }
          </div>
        ) : (
          <div className="vm-hero" style={ { textAlign:"center",padding:"64px 24px" } }>
            <div style={ { fontSize:36,marginBottom:16 } }>🔍</div>
            <div style={ { fontSize:16,fontWeight:600,marginBottom:8 } }>Aucun scénario trouvé</div>
            <div style={ { fontSize:13,color:C.dm } }>Essayez de modifier vos filtres ou votre recherche</div>
          </div>
        ) }

        { /* Bottom CTA */ }
        <div style={ { textAlign:"center",marginTop:48,padding:"32px 24px",background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:18 } }>
          <div style={ { fontSize:18,fontWeight:600,marginBottom:6 } }>Vous ne trouvez pas votre secteur ?</div>
          <p style={ { fontSize:14,color:C.mt,maxWidth:440,margin:"0 auto 20px",lineHeight:1.6 } }>
            Décrivez votre situation en quelques phrases. Notre IA crée un scénario sur mesure avec le prospect, les objections et l'évaluation adaptés.
          </p>
          <div className="vm-btn-row" style={ { display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap" } }>
            <button style={ { padding:"12px 28px",background:`linear-gradient(135deg,${ C.ac },${ C.acL })`,border:"none",borderRadius:10,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer" } }>Créer un scénario sur mesure →</button>
            <button style={ { padding:"12px 28px",background:C.bgE,border:`1px solid ${ C.bd }`,borderRadius:10,color:C.tx,fontSize:14,fontWeight:500,cursor:"pointer" } }>Essayer gratuitement</button>
          </div>
        </div>
      </div>

      <ScenarioModal s={ selected } onClose={ ()=>setSelected(null) }/>

      { /* Footer */ }
      <div style={ { borderTop:`1px solid ${ C.bd }`,padding:"24px",maxWidth:1100,margin:"0 auto" } }>
        <div style={ { display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8 } }>
          <span style={ { fontSize:11,color:C.dm } }>© 2026 VendMieux — Un produit Cap Performances</span>
          <span style={ { fontSize:11,color:C.dm } }>Hébergé en France 🇫🇷</span>
        </div>
      </div>
    </div>
  ); }
