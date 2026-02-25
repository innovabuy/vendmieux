import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useColors, Nav, Footer } from "../shared";

/* ═══════════════════ CONSTANTS ═══════════════════ */

const PER_PAGE = 12;

function getTypeColors(C){ return {
  "Prospection":{ bg:C.blD,tx:C.bl },
  "Barrage secrétaire":{ bg:C.dnD,tx:C.dn },
  "Découverte":{ bg:C.viD,tx:C.vi },
  "Négociation":{ bg:C.acD,tx:C.ac },
  "Réclamation":{ bg:"rgba(139,141,149,0.12)",tx:C.mt },
  "Relance":{ bg:"rgba(139,141,149,0.12)",tx:C.mt },
  "Upsell":{ bg:C.acD,tx:C.acL },
  "Closing":{ bg:C.okD,tx:C.ok },
  "Multi-interlocuteurs":{ bg:C.viD,tx:C.vi },
  "Fidélisation":{ bg:C.okD,tx:C.ok },
  "RDV":{ bg:C.blD,tx:C.bl },
  "Appel entrant":{ bg:C.okD,tx:C.ok },
}; }

const TYPE_LABELS = {
  prospection_telephonique:"Prospection",
  rdv_one_to_one:"RDV",
  rdv_physique:"RDV",
  barrage_secretaire:"Barrage secrétaire",
  multi_interlocuteurs:"Multi-interlocuteurs",
  negociation:"Négociation",
  relance_devis:"Relance",
  gestion_reclamation:"Réclamation",
  upsell:"Upsell",
  appel_entrant:"Appel entrant",
  custom:"Sur mesure",
  decouverte:"Découverte",
};

const SITUATION_TYPES = [
  "Prospection","Barrage secrétaire","Découverte",
  "Négociation","Réclamation","Relance","Upsell","Closing"
];

function normalizeType(raw){ return TYPE_LABELS[raw] || raw; }

/* Difficulty config */
const DIFF_CONFIG = {
  1: { label:"Débutant", stars:"\u2B50", color:"#22C55E" },
  2: { label:"Intermédiaire", stars:"\u2B50\u2B50", color:"#D4854A" },
  3: { label:"Avancé", stars:"\u2B50\u2B50\u2B50", color:"#EF4444" },
};

/* DISC labels */
const DISC_LABELS = { D:"Dominant", I:"Influent", S:"Stable", C:"Consciencieux" };

/* ═══════════════ LEGACY FALLBACK ═══════════════ */

const LEGACY_SCENARIOS=[
  { id:"IND-01",title:"Maintenance prédictive IoT",sector:"Industrie",type:"Prospection",prospect:"Olivier Bertrand",role:"DG",company:"MécaPress",employees:85,diff:2,desc:"Vendre une solution IoT de maintenance prédictive à un DG d'usine mécanique qui subit des pannes fréquentes.",gender:"M",nb_inter:"mono",disc:{D:80,I:30,S:20,C:40},objections_preview:["On a déjà un prestataire","Envoyez-moi un mail","C'est trop cher"],douleur:"2 pannes majeures le mois dernier (coût 45K€)",objectif:"Décrocher un RDV de 30 min sur site",duree:"5-8 minutes" },
  { id:"IND-02",title:"Défendre un devis 185K€",sector:"Industrie",type:"Négociation",prospect:"Marc Tessier",role:"DAF",company:"AluPro",employees:120,diff:3,desc:"Le DAF veut 20% de remise sur votre devis d'outillage CNC.",gender:"M",nb_inter:"mono",disc:{D:60,I:20,S:30,C:80},objections_preview:["20% de remise ou rien","J'ai une offre concurrente"],douleur:"Budget serré, pression DG",objectif:"Défendre le prix sans perdre le deal",duree:"8-12 minutes" },
  { id:"IND-03",title:"Retard livraison 3 semaines",sector:"Industrie",type:"Réclamation",prospect:"Nathalie Roux",role:"Resp. Production",company:"MetalForge",employees:65,diff:2,desc:"Votre livraison a 3 semaines de retard. La responsable production est furieuse.",gender:"F",nb_inter:"mono",disc:{D:70,I:40,S:30,C:50},objections_preview:["3 semaines de retard c'est inacceptable"],douleur:"Production bloquée depuis 3 semaines",objectif:"Sauver la relation client",duree:"5-8 minutes" },
  { id:"IND-04",title:"Passer le barrage usine",sector:"Industrie",type:"Barrage secrétaire",prospect:"Sylvie Martin",role:"Assistante DG",company:"PlastiMould",employees:50,diff:1,desc:"L'assistante filtre tous les appels commerciaux.",gender:"F",nb_inter:"mono",disc:{D:30,I:40,S:60,C:50},objections_preview:["Il est en réunion","Envoyez un mail"],douleur:"",objectif:"Obtenir le transfert vers le directeur",duree:"3-5 minutes" },
  { id:"BTP-01",title:"Location matériel BTP",sector:"BTP",type:"Prospection",prospect:"Philippe Moreau",role:"Dirigeant",company:"Moreau BTP",employees:35,diff:2,desc:"Proposer une offre de location longue durée de mini-pelles et chariots.",gender:"M",nb_inter:"mono",disc:{D:70,I:40,S:30,C:40},objections_preview:["On achète, on loue pas"],douleur:"Croissance rapide, besoin matériel",objectif:"Décrocher un RDV",duree:"5-8 minutes" },
  { id:"BTP-02",title:"Renégocier contrat annuel",sector:"BTP",type:"Négociation",prospect:"Laurent Blanc",role:"DG",company:"Construc+",employees:90,diff:3,desc:"Le client veut renégocier son contrat annuel. Offre concurrente 15% moins chère.",gender:"M",nb_inter:"mono",disc:{D:80,I:30,S:20,C:50},objections_preview:["15% moins cher chez le concurrent"],douleur:"Pression sur les marges",objectif:"Conserver le contrat",duree:"8-12 minutes" },
  { id:"SAN-01",title:"Logiciel cabinet médical",sector:"Santé",type:"Prospection",prospect:"Dr. Sophie Lambert",role:"Médecin généraliste",company:"Cabinet Santé+",employees:5,diff:2,desc:"Vendre un logiciel de gestion de cabinet à une médecin qui utilise encore du papier.",gender:"F",nb_inter:"mono",disc:{D:40,I:60,S:50,C:70},objections_preview:["Je n'ai pas le temps","C'est compliqué l'informatique"],douleur:"Perte de temps administrative",objectif:"Décrocher une démo",duree:"5-8 minutes" },
  { id:"SAN-02",title:"Équipement dentaire",sector:"Santé",type:"Closing",prospect:"Dr. Pierre Faure",role:"Chirurgien-dentiste",company:"Cabinet Faure",employees:8,diff:2,desc:"Le dentiste est intéressé par votre fauteuil. Closez le deal aujourd'hui.",gender:"M",nb_inter:"mono",disc:{D:50,I:30,S:40,C:80},objections_preview:["Le concurrent est moins cher","Je veux réfléchir"],douleur:"Fauteuil actuel en fin de vie",objectif:"Closer la vente",duree:"5-8 minutes" },
  { id:"TECH-01",title:"ERP cloud PME industrielle",sector:"Tech / SaaS",type:"Prospection",prospect:"Stéphane Girard",role:"DSI",company:"PrécisInox",employees:150,diff:3,desc:"Convaincre un DSI de migrer son ERP legacy vers votre solution cloud.",gender:"M",nb_inter:"mono",disc:{D:40,I:20,S:30,C:90},objections_preview:["On a déjà un ERP","Migration trop risquée"],douleur:"ERP legacy en fin de vie",objectif:"Décrocher un audit",duree:"8-12 minutes" },
  { id:"TECH-02",title:"Cybersécurité SOC managé",sector:"Tech / SaaS",type:"Multi-interlocuteurs",prospect:"Claire Dubois + Thomas Petit",role:"DSI + DAF",company:"DataSoft",employees:80,diff:3,desc:"Présentez votre offre SOC au DSI et au DAF en même temps.",gender:"F",nb_inter:"multi",disc:{D:60,I:40,S:30,C:70},objections_preview:["Budget trop élevé","On n'a jamais eu de problème"],douleur:"Vulnérabilité cyber non adressée",objectif:"Closer un pilote 3 mois",duree:"10-15 minutes" },
  { id:"TECH-03",title:"Renouvellement licences SaaS",sector:"Tech / SaaS",type:"Fidélisation",prospect:"Julie Mercier",role:"Resp. IT",company:"WebAgency",employees:25,diff:1,desc:"Le contrat arrive à échéance. L'adoption est faible.",gender:"F",nb_inter:"mono",disc:{D:30,I:50,S:60,C:50},objections_preview:["L'adoption est faible","Trop cher pour ce qu'on utilise"],douleur:"Adoption faible dans l'équipe",objectif:"Renouveler le contrat",duree:"5-8 minutes" },
  { id:"COM-01",title:"Caisse iPad restaurant",sector:"Commerce",type:"Prospection",prospect:"Antoine Legrand",role:"Gérant",company:"Brasserie du Parc",employees:12,diff:1,desc:"Proposer un système de caisse iPad à un restaurateur.",gender:"M",nb_inter:"mono",disc:{D:50,I:70,S:40,C:20},objections_preview:["Ma caisse marche très bien"],douleur:"Caisse classique depuis 10 ans",objectif:"Décrocher une démo sur place",duree:"5-8 minutes" },
  { id:"COM-02",title:"Réapprovisionnement automatique",sector:"Commerce",type:"Upsell",prospect:"Martine Chevalier",role:"Directrice",company:"SuperMarché Bio",employees:20,diff:2,desc:"Vendez le module de réapprovisionnement automatique.",gender:"F",nb_inter:"mono",disc:{D:40,I:50,S:50,C:60},objections_preview:["Je gère déjà bien mes stocks"],douleur:"Ruptures fréquentes",objectif:"Vendre le module complémentaire",duree:"5-8 minutes" },
  { id:"IMM-01",title:"CRM immobilier agence",sector:"Immobilier",type:"Prospection",prospect:"François Duval",role:"Directeur d'agence",company:"Duval Immobilier",employees:8,diff:2,desc:"Vendre un CRM spécialisé immobilier.",gender:"M",nb_inter:"mono",disc:{D:60,I:50,S:30,C:40},objections_preview:["Excel me suffit"],douleur:"Mandats gérés sur Excel",objectif:"Décrocher une démo",duree:"5-8 minutes" },
  { id:"IMM-02",title:"Visite virtuelle 360°",sector:"Immobilier",type:"Closing",prospect:"Sandra Petit",role:"Gérante",company:"ImmoVista",employees:5,diff:2,desc:"Sandra hésite entre vous et un concurrent moins cher.",gender:"F",nb_inter:"mono",disc:{D:40,I:60,S:50,C:40},objections_preview:["Le concurrent est moins cher"],douleur:"Visites chronophages",objectif:"Closer la vente",duree:"5-8 minutes" },
  { id:"TRA-01",title:"Logiciel gestion flotte",sector:"Transport",type:"Prospection",prospect:"Didier Rousseau",role:"DG",company:"TransLoire",employees:45,diff:2,desc:"Proposer une solution de gestion de flotte GPS.",gender:"M",nb_inter:"mono",disc:{D:70,I:30,S:30,C:50},objections_preview:["Mes chauffeurs savent ce qu'ils font"],douleur:"Planification manuelle",objectif:"Décrocher un RDV",duree:"5-8 minutes" },
  { id:"ENR-01",title:"Audit énergétique industriel",sector:"Énergie",type:"Prospection",prospect:"Isabelle Martin",role:"Resp. RSE",company:"TextilNord",employees:200,diff:2,desc:"Vendre un audit énergétique à une responsable RSE.",gender:"F",nb_inter:"mono",disc:{D:30,I:40,S:50,C:70},objections_preview:["On a déjà fait un audit"],douleur:"Décret tertiaire à respecter",objectif:"Décrocher un audit",duree:"5-8 minutes" },
  { id:"FOR-01",title:"Plateforme e-learning entreprise",sector:"Formation",type:"Prospection",prospect:"Caroline Lefevre",role:"DRH",company:"GroupeAlpha",employees:300,diff:2,desc:"Proposer votre LMS à une DRH.",gender:"F",nb_inter:"mono",disc:{D:40,I:60,S:50,C:40},objections_preview:["On fait déjà du présentiel"],douleur:"Formations obligatoires mal gérées",objectif:"Décrocher un pilote",duree:"5-8 minutes" },
  { id:"JUR-01",title:"Logiciel gestion cabinet avocat",sector:"Juridique",type:"Prospection",prospect:"Maître Delacroix",role:"Associé",company:"Cabinet Delacroix & Fils",employees:12,diff:3,desc:"Vendre un logiciel de gestion de dossiers à un avocat traditionnel.",gender:"M",nb_inter:"mono",disc:{D:60,I:20,S:20,C:90},objections_preview:["Le papier fonctionne très bien"],douleur:"Gestion papier chronophage",objectif:"Décrocher une démo",duree:"5-8 minutes" },
  { id:"AUTO-01",title:"Logiciel DMS concession",sector:"Automobile",type:"Prospection",prospect:"Patrick Renault",role:"Directeur",company:"Renault Angers",employees:40,diff:2,desc:"Proposer un DMS à un directeur de concession.",gender:"M",nb_inter:"mono",disc:{D:70,I:40,S:30,C:40},objections_preview:["Notre logiciel actuel fait le job"],douleur:"Logiciel vieillissant",objectif:"Décrocher un RDV",duree:"5-8 minutes" },
  { id:"BEA-01",title:"Logiciel salon coiffure",sector:"Beauté",type:"Prospection",prospect:"Emma Roussel",role:"Gérante",company:"Salon Emma",employees:4,diff:1,desc:"Vendre un logiciel de prise de RDV en ligne.",gender:"F",nb_inter:"mono",disc:{D:30,I:70,S:50,C:30},objections_preview:["Mon cahier me suffit"],douleur:"Gestion papier, RDV manqués",objectif:"Décrocher un essai gratuit",duree:"3-5 minutes" },
  { id:"ASS-01",title:"Assurance flotte auto",sector:"Assurance",type:"Prospection",prospect:"Jean-Marc Fontaine",role:"DG",company:"Express Livraison",employees:60,diff:2,desc:"Proposer une assurance flotte à un dirigeant de livraison.",gender:"M",nb_inter:"mono",disc:{D:70,I:30,S:30,C:50},objections_preview:["On est déjà assuré"],douleur:"Primes augmentées de 30%",objectif:"Décrocher un audit",duree:"5-8 minutes" },
  { id:"ASS-02",title:"Client sinistré mécontent",sector:"Assurance",type:"Réclamation",prospect:"Véronique Dumont",role:"Cliente",company:"Boulangerie Dumont",employees:6,diff:2,desc:"Indemnisation qui traîne depuis 2 mois.",gender:"F",nb_inter:"mono",disc:{D:60,I:50,S:30,C:40},objections_preview:["Ça fait 2 mois que j'attends !"],douleur:"Dégât des eaux non indemnisé",objectif:"Sauver la relation",duree:"5-8 minutes" },
  { id:"ART-01",title:"Comptabilité artisan plombier",sector:"Artisanat",type:"Prospection",prospect:"Bruno Lefèvre",role:"Artisan",company:"Lefèvre Plomberie",employees:3,diff:1,desc:"Proposer un logiciel de devis/facturation.",gender:"M",nb_inter:"mono",disc:{D:50,I:50,S:50,C:30},objections_preview:["Word me suffit pour les devis"],douleur:"Devis faits sur Word",objectif:"Décrocher un essai",duree:"3-5 minutes" },
  { id:"SEC-01",title:"Vidéosurveillance entrepôt",sector:"Sécurité",type:"Prospection",prospect:"Richard Garnier",role:"Resp. logistique",company:"LogiStock",employees:70,diff:2,desc:"Vendre un système de vidéosurveillance après un vol.",gender:"M",nb_inter:"mono",disc:{D:60,I:30,S:40,C:50},objections_preview:["On a déjà des caméras"],douleur:"Vol récent dans l'entrepôt",objectif:"Décrocher un audit sécurité",duree:"5-8 minutes" },
  { id:"EVT-01",title:"Logiciel gestion événements",sector:"Événementiel",type:"Prospection",prospect:"Camille Perrot",role:"Directrice",company:"EventPro",employees:10,diff:2,desc:"Proposer un logiciel de gestion d'événements.",gender:"F",nb_inter:"mono",disc:{D:40,I:70,S:40,C:30},objections_preview:["On jongle déjà avec 5 outils"],douleur:"5 outils différents non intégrés",objectif:"Décrocher une démo",duree:"5-8 minutes" },
  { id:"REST-01",title:"Fournisseur produits frais",sector:"Restauration",type:"Prospection",prospect:"Michel Gauthier",role:"Chef propriétaire",company:"Le Petit Bistrot",employees:8,diff:1,desc:"Proposer votre service de livraison de produits frais.",gender:"M",nb_inter:"mono",disc:{D:40,I:60,S:50,C:30},objections_preview:["J'ai déjà mes fournisseurs"],douleur:"6 fournisseurs différents",objectif:"Décrocher un essai",duree:"3-5 minutes" },
  { id:"AGR-01",title:"Logiciel gestion parcellaire",sector:"Agriculture",type:"Prospection",prospect:"Jean-Pierre Morin",role:"Exploitant",company:"EARL Morin",employees:4,diff:1,desc:"Vendre un logiciel de gestion parcellaire.",gender:"M",nb_inter:"mono",disc:{D:40,I:30,S:60,C:50},objections_preview:["Mes carnets me suffisent"],douleur:"Gestion sur carnets",objectif:"Décrocher un essai",duree:"3-5 minutes" },
  { id:"PROP-01",title:"Client mécontent qualité ménage",sector:"Propreté",type:"Réclamation",prospect:"Hélène Vidal",role:"Office Manager",company:"CabinetConseil+",employees:50,diff:2,desc:"Qualité du ménage en baisse depuis 3 semaines.",gender:"F",nb_inter:"mono",disc:{D:50,I:40,S:40,C:60},objections_preview:["3 semaines que c'est sale !"],douleur:"Qualité ménage dégradée",objectif:"Sauver le contrat",duree:"5-8 minutes" },
  { id:"SRV-01",title:"Externalisation paie",sector:"Services",type:"Prospection",prospect:"Thierry Bonnet",role:"DRH",company:"Bonnet & Associés",employees:100,diff:2,desc:"Proposer l'externalisation de la paie.",gender:"M",nb_inter:"mono",disc:{D:50,I:30,S:40,C:70},objections_preview:["On gère en interne"],douleur:"Erreurs récurrentes en paie",objectif:"Décrocher un audit paie",duree:"5-8 minutes" },
  { id:"SRV-02",title:"Relance devis signé non démarré",sector:"Services",type:"Relance",prospect:"Aline Marchand",role:"Directrice",company:"CleanPlus",employees:30,diff:1,desc:"Devis signé depuis 3 semaines mais pas de lancement.",gender:"F",nb_inter:"mono",disc:{D:30,I:50,S:60,C:40},objections_preview:["On n'a pas eu le temps"],douleur:"",objectif:"Lancer le projet",duree:"3-5 minutes" },
  { id:"MULTI-01",title:"Comité de direction PME industrielle",sector:"Industrie",type:"Multi-interlocuteurs",prospect:"Marc Tessier + Nathalie Roux",role:"DG + Resp. Production",company:"AluPro",employees:120,diff:3,desc:"Présentez votre solution au DG et à la responsable production.",gender:"M",nb_inter:"multi",disc:{D:70,I:30,S:30,C:50},objections_preview:["Le budget est serré","On a déjà essayé"],douleur:"Visions opposées DG/production",objectif:"Aligner les deux décideurs",duree:"10-15 minutes" },
  { id:"MULTI-02",title:"Duo DRH + DAF formation",sector:"Formation",type:"Multi-interlocuteurs",prospect:"Caroline Lefevre + Jean Morel",role:"DRH + DAF",company:"GroupeAlpha",employees:300,diff:3,desc:"La DRH veut, le DAF freine sur le budget.",gender:"F",nb_inter:"multi",disc:{D:50,I:50,S:40,C:50},objections_preview:["Budget formation réduit","ROI pas prouvé"],douleur:"Budget formation en baisse",objectif:"Convaincre les deux",duree:"10-15 minutes" },
  { id:"MULTI-03",title:"Prescription architecte + maître d'ouvrage",sector:"BTP",type:"Multi-interlocuteurs",prospect:"Anne Lefèvre + Pierre Garnier",role:"Architecte + Maître d'ouvrage",company:"Projet Résidence Verte",employees:0,diff:3,desc:"L'architecte prescrit vos menuiseries alu. Le maître d'ouvrage veut du PVC.",gender:"F",nb_inter:"multi",disc:{D:50,I:40,S:30,C:60},objections_preview:["Le PVC est moins cher","On dépasse le budget"],douleur:"Conflit alu vs PVC",objectif:"Satisfaire les deux parties",duree:"10-15 minutes" },
  { id:"MULTI-04",title:"Trinôme DSI + Métier + Achats",sector:"Tech / SaaS",type:"Multi-interlocuteurs",prospect:"S. Girard + L. Blanc + M. Duval",role:"DSI + Dir. Commercial + Achats",company:"MédiaGroup",employees:250,diff:3,desc:"3 décideurs, 3 priorités.",gender:"M",nb_inter:"multi",disc:{D:60,I:30,S:20,C:70},objections_preview:["Trop cher","Pas assez sécurisé","Trop lent"],douleur:"3 priorités contradictoires",objectif:"Pilotez le consensus",duree:"12-18 minutes" },
  { id:"MULTI-05",title:"Couple gérants boutique",sector:"Commerce",type:"Multi-interlocuteurs",prospect:"Antoine + Marie Legrand",role:"Co-gérants",company:"Brasserie du Parc",employees:12,diff:2,desc:"Le mari est enthousiaste, la femme est sceptique.",gender:"M",nb_inter:"multi",disc:{D:40,I:60,S:50,C:30},objections_preview:["C'est trop cher","On fonctionne bien comme ça"],douleur:"Désaccord dans le couple",objectif:"Convaincre le duo",duree:"8-12 minutes" },
  { id:"BAR-01",title:"Barrage assistante cabinet comptable",sector:"Services",type:"Barrage secrétaire",prospect:"Marie-Claire Dupont",role:"Assistante de direction",company:"Bonnet & Associés",employees:100,diff:1,desc:"L'assistante filtre 20 appels/jour.",gender:"F",nb_inter:"mono",disc:{D:30,I:40,S:60,C:50},objections_preview:["Il n'est pas disponible","Envoyez un email"],douleur:"",objectif:"Obtenir un transfert",duree:"3-5 minutes" },
  { id:"BAR-02",title:"Standard clinique vétérinaire",sector:"Santé",type:"Barrage secrétaire",prospect:"Aurélie Petit",role:"Secrétaire médicale",company:"Clinique VétéSoins",employees:15,diff:2,desc:"La secrétaire protège le vétérinaire en consultation.",gender:"F",nb_inter:"mono",disc:{D:20,I:50,S:70,C:40},objections_preview:["Il est en consultation","Rappelez demain"],douleur:"",objectif:"Obtenir un rappel",duree:"3-5 minutes" },
  { id:"BAR-03",title:"Accueil siège groupe industriel",sector:"Industrie",type:"Barrage secrétaire",prospect:"Sandrine Moreau",role:"Standardiste",company:"Groupe MécaPro",employees:500,diff:2,desc:"Standard d'un groupe de 500 personnes.",gender:"F",nb_inter:"mono",disc:{D:30,I:40,S:60,C:40},objections_preview:["Il ne prend pas les appels commerciaux"],douleur:"",objectif:"Se faire transférer",duree:"3-5 minutes" },
];

/* ═══════════════ HELPER COMPONENTS ═══════════════ */

function DiffBadge({ level }){
  const d = DIFF_CONFIG[level] || DIFF_CONFIG[2];
  return(
    <span style={{ fontSize:11, fontWeight:600, color:d.color, display:"inline-flex", alignItems:"center", gap:3 }}>
      {d.stars}
    </span>
  );
}

function TagButton({ active, label, onClick, activeColor }){
  const C = useColors();
  const bg = active ? (activeColor || C.ac) : "transparent";
  const border = active ? (activeColor || C.ac) : "#2A2F3E";
  const color = active ? "#fff" : "#6B7280";
  return(
    <button onClick={onClick} style={{
      padding:"6px 14px", borderRadius:20, border:`1px solid ${border}`,
      background:bg, color, fontSize:12, fontWeight:active?600:400,
      cursor:"pointer", transition:"all 0.2s", whiteSpace:"nowrap",
    }}
    onMouseEnter={e=>{ if(!active) e.currentTarget.style.background="rgba(212,133,74,0.15)"; }}
    onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}
    >{label}</button>
  );
}

function DiscBar({ letter, value, max=100 }){
  const C = useColors();
  const pct = Math.round((value/max)*100);
  const barColors = { D:"#EF4444", I:"#F59E0B", S:"#22C55E", C:"#3B82F6" };
  return(
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
      <span style={{ fontSize:12, fontWeight:700, color:barColors[letter], width:14, textAlign:"center" }}>{letter}</span>
      <div style={{ flex:1, height:8, background:C.bgE, borderRadius:4, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:barColors[letter], borderRadius:4, transition:"width 0.5s ease" }}/>
      </div>
      <span style={{ fontSize:10, color:C.dm, width:60 }}>{DISC_LABELS[letter]}</span>
    </div>
  );
}

/* ═══════════════ SCENARIO CARD ═══════════════ */

function ScenarioCard({ s, onLaunch, onPreview }){
  const C = useColors();
  const tc = getTypeColors(C)[s.type] || { bg:C.acD, tx:C.ac };
  const d = DIFF_CONFIG[s.diff] || DIFF_CONFIG[2];
  const discLetter = s.disc ? Object.entries(s.disc).sort((a,b)=>b[1]-a[1])[0][0] : "D";
  const objType = s.objection_type || "";

  return(
    <div style={{
      background:C.bgC, border:`1px solid ${C.bd}`, borderRadius:16,
      padding:"20px 18px", cursor:"default", transition:"all 0.3s ease",
      display:"flex", flexDirection:"column", gap:10,
    }}
    onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.ac+"60"; e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=`0 8px 24px rgba(0,0,0,0.15)`; }}
    onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.bd; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}
    >
      {/* Top row: sector + difficulty */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:10, padding:"3px 8px", borderRadius:6, background:C.bgE, color:C.dm, fontWeight:500 }}>{s.sector}</span>
        <DiffBadge level={s.diff}/>
      </div>

      {/* Title */}
      <h3 style={{ fontSize:14, fontWeight:600, margin:0, lineHeight:1.4, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{s.title}</h3>

      {/* Mini persona preview */}
      <div style={{ background:C.bgE, borderRadius:10, padding:"10px 12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
          <div style={{
            width:30, height:30, borderRadius:"50%", flexShrink:0,
            background:s.gender==="F"?"linear-gradient(135deg,#8B5E83,#6B4E73)":"linear-gradient(135deg,#4A6B8A,#3A5B7A)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:10, fontWeight:700, color:"#fff"
          }}>
            {s.prospect.split(" ").map(n=>n[0]).join("").slice(0,2)}
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.prospect}</div>
            <div style={{ fontSize:10, color:C.dm, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.role} · {s.company}</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:10, color:C.dm }}>
          <span style={{ fontWeight:700, color:{ D:"#EF4444",I:"#F59E0B",S:"#22C55E",C:"#3B82F6" }[discLetter] }}>DISC: {discLetter}</span>
          {objType && <><span style={{ color:C.bd }}>|</span><span>{objType}</span></>}
        </div>
      </div>

      {/* Tags row */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        <span style={{ fontSize:9, padding:"2px 7px", borderRadius:5, background:tc.bg, color:tc.tx, fontWeight:600, textTransform:"uppercase" }}>{s.type}</span>
        <span style={{ fontSize:9, padding:"2px 7px", borderRadius:5, background:C.bgE, color:C.dm }}>
          {s.duree || "5-8 min"}
        </span>
        <span style={{ fontSize:9, padding:"2px 7px", borderRadius:5, background:C.bgE, color:s.nb_inter==="multi"?C.vi:C.dm, fontWeight:s.nb_inter==="multi"?600:400 }}>
          {s.nb_inter==="multi"?"Multi":"Mono"}
        </span>
      </div>

      {/* Action buttons */}
      <div style={{ display:"flex", gap:8, marginTop:"auto" }}>
        <a href={`/simulation?scenario=${s.id}`} onClick={e=>{ e.stopPropagation(); }}
          style={{
            flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:4,
            padding:"9px 0", borderRadius:8, fontSize:12, fontWeight:600,
            background:`linear-gradient(135deg,${C.ac},${C.acL})`, color:"#fff",
            textDecoration:"none", border:"none", cursor:"pointer",
          }}>
          &#9654; Lancer
        </a>
        <button onClick={e=>{ e.stopPropagation(); onPreview(s); }}
          style={{
            flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:4,
            padding:"9px 0", borderRadius:8, fontSize:12, fontWeight:500,
            background:C.bgE, color:C.tx, border:`1px solid ${C.bd}`, cursor:"pointer",
          }}>
          &#128065; Aperçu
        </button>
      </div>
    </div>
  );
}

/* ═══════════════ PREVIEW MODAL (slide from right) ═══════════════ */

function PreviewModal({ s, onClose }){
  const C = useColors();
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(()=>{
    if(s) requestAnimationFrame(()=>setVisible(true));
    else setVisible(false);
  },[s]);

  const handleClose = useCallback(()=>{
    setVisible(false);
    setTimeout(onClose, 300);
  },[onClose]);

  if(!s) return null;

  const d = DIFF_CONFIG[s.diff] || DIFF_CONFIG[2];
  const disc = s.disc || { D:50, I:50, S:50, C:50 };

  return(
    <div onClick={handleClose} style={{
      position:"fixed", top:0, left:0, right:0, bottom:0,
      background:visible?"rgba(0,0,0,0.6)":"rgba(0,0,0,0)",
      zIndex:200, display:"flex", justifyContent:"flex-end",
      transition:"background 0.3s ease",
    }}>
      <div ref={ref} onClick={e=>e.stopPropagation()} style={{
        width:"100%", maxWidth:460, height:"100%",
        background:C.bgC, borderLeft:`1px solid ${C.bd}`,
        overflowY:"auto", padding:"28px 24px",
        transform:visible?"translateX(0)":"translateX(100%)",
        transition:"transform 0.3s ease",
      }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <span style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:C.dm }}>Aperçu du scénario</span>
          <button onClick={handleClose} style={{
            width:32, height:32, borderRadius:8, background:C.bgE,
            border:`1px solid ${C.bd}`, display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:18, color:C.mt, cursor:"pointer",
          }}>&times;</button>
        </div>

        {/* Persona header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, paddingBottom:20, borderBottom:`1px solid ${C.bd}` }}>
          <div style={{
            width:48, height:48, borderRadius:"50%", flexShrink:0,
            background:s.gender==="F"?"linear-gradient(135deg,#8B5E83,#6B4E73)":"linear-gradient(135deg,#4A6B8A,#3A5B7A)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:16, fontWeight:700, color:"#fff"
          }}>
            {s.prospect.split(" ").map(n=>n[0]).join("").slice(0,2)}
          </div>
          <div>
            <div style={{ fontSize:17, fontWeight:600 }}>{s.prospect}</div>
            <div style={{ fontSize:13, color:C.dm }}>{s.role} · {s.company}</div>
            {s.taille && <div style={{ fontSize:11, color:C.mt }}>{s.sector}, {s.taille}</div>}
          </div>
        </div>

        {/* DISC Profile */}
        <div style={{ marginBottom:20, paddingBottom:20, borderBottom:`1px solid ${C.bd}` }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:0.8, textTransform:"uppercase", color:C.dm, marginBottom:12 }}>Profil DISC</div>
          {["D","I","S","C"].map(l=><DiscBar key={l} letter={l} value={disc[l]||0}/>)}
        </div>

        {/* Objections typiques */}
        {s.objections_preview && s.objections_preview.length > 0 && (
          <div style={{ marginBottom:20, paddingBottom:20, borderBottom:`1px solid ${C.bd}` }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:0.8, textTransform:"uppercase", color:C.dm, marginBottom:10 }}>Objections typiques</div>
            {s.objections_preview.map((o,i)=>(
              <div key={i} style={{ fontSize:13, color:C.mt, lineHeight:1.6, marginBottom:4, paddingLeft:12, borderLeft:`2px solid ${C.bd}` }}>
                &laquo; {o} &raquo;
              </div>
            ))}
          </div>
        )}

        {/* Douleur cachée */}
        {s.douleur && (
          <div style={{ marginBottom:20, paddingBottom:20, borderBottom:`1px solid ${C.bd}` }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:0.8, textTransform:"uppercase", color:C.dm, marginBottom:8 }}>Douleur cachée</div>
            <p style={{ fontSize:13, color:C.mt, lineHeight:1.6, margin:0 }}>{s.douleur}</p>
          </div>
        )}

        {/* Objectif commercial */}
        {s.objectif && (
          <div style={{ marginBottom:20, paddingBottom:20, borderBottom:`1px solid ${C.bd}` }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:0.8, textTransform:"uppercase", color:C.dm, marginBottom:8 }}>Objectif commercial</div>
            <p style={{ fontSize:13, color:C.mt, lineHeight:1.6, margin:0 }}>{s.objectif}</p>
          </div>
        )}

        {/* Meta infos */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:24 }}>
          <div style={{ background:C.bgE, borderRadius:10, padding:"10px 12px" }}>
            <div style={{ fontSize:10, color:C.dm, marginBottom:2 }}>Niveau</div>
            <div style={{ fontSize:13, fontWeight:600, color:d.color }}>{d.stars} {d.label}</div>
          </div>
          <div style={{ background:C.bgE, borderRadius:10, padding:"10px 12px" }}>
            <div style={{ fontSize:10, color:C.dm, marginBottom:2 }}>Durée estimée</div>
            <div style={{ fontSize:13, fontWeight:600 }}>{s.duree || "5-8 minutes"}</div>
          </div>
          <div style={{ background:C.bgE, borderRadius:10, padding:"10px 12px", gridColumn:"1 / -1" }}>
            <div style={{ fontSize:10, color:C.dm, marginBottom:2 }}>Type</div>
            <div style={{ fontSize:13, fontWeight:600 }}>{s.nb_inter==="multi"?"Multi-interlocuteurs":"Mono-interlocuteur"} · {s.type}</div>
          </div>
        </div>

        {/* CTA */}
        <a href={`/simulation?scenario=${s.id}`} style={{
          display:"block", width:"100%", padding:"14px 24px",
          background:`linear-gradient(135deg,${C.ac},${C.acL})`,
          border:"none", borderRadius:12, color:"#fff", fontSize:15,
          fontWeight:600, cursor:"pointer", textAlign:"center", textDecoration:"none",
          boxShadow:"0 4px 16px rgba(212,133,74,0.25)",
          boxSizing:"border-box",
        }}>
          &#9654; Lancer ce scénario &rarr;
        </a>
      </div>
    </div>
  );
}

/* ═══════════════ PAGINATION ═══════════════ */

function Pagination({ page, totalPages, total, filtered, onPage }){
  const C = useColors();
  if(totalPages <= 1) return null;

  // Show max 7 page buttons
  const pages = [];
  const start = Math.max(1, page - 3);
  const end = Math.min(totalPages, start + 6);
  for(let i=start; i<=end; i++) pages.push(i);

  return(
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:32, flexWrap:"wrap" }}>
      <button onClick={()=>onPage(page-1)} disabled={page===1}
        style={{ padding:"8px 14px", borderRadius:8, border:`1px solid ${C.bd}`, background:page===1?"transparent":C.bgE, color:page===1?C.bd:C.tx, fontSize:12, fontWeight:500, cursor:page===1?"default":"pointer" }}>
        &larr; Précédent
      </button>
      {start > 1 && <><button onClick={()=>onPage(1)} style={{ padding:"8px 12px", borderRadius:8, border:`1px solid ${C.bd}`, background:C.bgE, color:C.tx, fontSize:12, cursor:"pointer" }}>1</button><span style={{ color:C.dm }}>...</span></>}
      {pages.map(p=>(
        <button key={p} onClick={()=>onPage(p)}
          style={{ padding:"8px 12px", borderRadius:8, border:`1px solid ${p===page?C.ac:C.bd}`, background:p===page?C.ac:"transparent", color:p===page?"#fff":C.dm, fontSize:12, fontWeight:p===page?700:400, cursor:"pointer", minWidth:36 }}>
          {p}
        </button>
      ))}
      {end < totalPages && <><span style={{ color:C.dm }}>...</span><button onClick={()=>onPage(totalPages)} style={{ padding:"8px 12px", borderRadius:8, border:`1px solid ${C.bd}`, background:C.bgE, color:C.tx, fontSize:12, cursor:"pointer" }}>{totalPages}</button></>}
      <button onClick={()=>onPage(page+1)} disabled={page===totalPages}
        style={{ padding:"8px 14px", borderRadius:8, border:`1px solid ${C.bd}`, background:page===totalPages?"transparent":C.bgE, color:page===totalPages?C.bd:C.tx, fontSize:12, fontWeight:500, cursor:page===totalPages?"default":"pointer" }}>
        Suivant &rarr;
      </button>
    </div>
  );
}

/* ═══════════════ MAIN PAGE ═══════════════ */

export default function Scenarios(){
  const C = useColors();
  const [search,setSearch] = useState("");
  const [interFilter,setInterFilter] = useState("Tous"); // Tous|Mono|Multi
  const [typeFilter,setTypeFilter] = useState("Tous");
  const [diffFilter,setDiffFilter] = useState(0); // 0=all, 1,2,3
  const [preview,setPreview] = useState(null);
  const [loading,setLoading] = useState(true);
  const [scenarios,setScenarios] = useState([]);
  const [page,setPage] = useState(1);
  const listRef = useRef(null);

  /* Fetch */
  useEffect(()=>{
    fetch("/api/scenarios")
      .then(r=>r.json())
      .then(data=>{
        const apiMapped = (data.scenarios || []).map(s=>{
          const leg = LEGACY_SCENARIOS.find(l=>l.id===s.id);
          return {
            id: s.id,
            title: (leg && leg.title) || s.titre || s.id,
            sector: s.secteur || "?",
            type: normalizeType(s.type_simulation || "Prospection"),
            prospect: (leg && leg.prospect) || s.name || "?",
            role: (leg && leg.role) || s.poste || "?",
            company: (leg && leg.company) || s.entreprise || "?",
            taille: s.taille || (leg && leg.employees ? `${leg.employees} salariés` : ""),
            diff: s.difficulty || 2,
            desc: (leg && leg.desc) || s.titre || "",
            gender: s.gender || (leg && leg.gender) || "M",
            tags: s.tags || [],
            source: s.source || "database",
            nb_inter: s.nb_interlocuteurs || (leg && leg.nb_inter) || "mono",
            disc: s.disc || (leg && leg.disc) || { D:50, I:50, S:50, C:50 },
            objections_preview: s.objections_preview || (leg && leg.objections_preview) || [],
            objection_type: s.objection_type_principal || "",
            douleur: s.douleur_cachee || (leg && leg.douleur) || "",
            objectif: s.objectif_commercial || (leg && leg.objectif) || "",
            duree: s.duree_estimee || (leg && leg.duree) || "5-8 minutes",
          };
        });
        // Add legacy scenarios not in API
        const seenIds = new Set(apiMapped.map(s=>s.id));
        const extras = LEGACY_SCENARIOS.filter(s=>!seenIds.has(s.id)).map(s=>({
          ...s, nb_inter:s.nb_inter||"mono", disc:s.disc||{D:50,I:50,S:50,C:50},
          objections_preview:s.objections_preview||[], objection_type:"",
          douleur:s.douleur||"", objectif:s.objectif||"", duree:s.duree||"5-8 minutes",
          taille:s.employees?`${s.employees} salariés`:"",
        }));
        setScenarios([...apiMapped, ...extras]);
        setLoading(false);
      })
      .catch(()=>{
        setScenarios(LEGACY_SCENARIOS.map(s=>({
          ...s, nb_inter:s.nb_inter||"mono", disc:s.disc||{D:50,I:50,S:50,C:50},
          objections_preview:s.objections_preview||[], objection_type:"",
          douleur:s.douleur||"", objectif:s.objectif||"", duree:s.duree||"5-8 minutes",
          taille:s.employees?`${s.employees} salariés`:"",
        })));
        setLoading(false);
      });
  },[]);

  /* Filter logic */
  const hasFilters = search || interFilter!=="Tous" || typeFilter!=="Tous" || diffFilter>0;

  const filtered = useMemo(()=>{
    return scenarios.filter(s=>{
      if(interFilter==="Mono" && s.nb_inter!=="mono") return false;
      if(interFilter==="Multi" && s.nb_inter!=="multi") return false;
      if(typeFilter!=="Tous" && s.type!==typeFilter) return false;
      if(diffFilter>0 && s.diff!==diffFilter) return false;
      if(search){
        const q=search.toLowerCase();
        return s.title.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q) ||
               s.type.toLowerCase().includes(q) || s.prospect.toLowerCase().includes(q) ||
               s.company.toLowerCase().includes(q) || (s.desc||"").toLowerCase().includes(q);
      }
      return true;
    });
  },[search,interFilter,typeFilter,diffFilter,scenarios]);

  /* Reset page when filters change */
  useEffect(()=>{ setPage(1); },[search,interFilter,typeFilter,diffFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const handlePageChange = useCallback((p)=>{
    setPage(p);
    if(listRef.current) listRef.current.scrollIntoView({ behavior:"smooth", block:"start" });
  },[]);

  const resetFilters = ()=>{ setSearch(""); setInterFilter("Tous"); setTypeFilter("Tous"); setDiffFilter(0); };

  /* Counts for report */
  const countsByDiff = useMemo(()=>{
    const m={1:0,2:0,3:0};
    scenarios.forEach(s=>{ m[s.diff]=(m[s.diff]||0)+1; });
    return m;
  },[scenarios]);

  const countsByInter = useMemo(()=>{
    const m={mono:0,multi:0};
    scenarios.forEach(s=>{ m[s.nb_inter]=(m[s.nb_inter]||0)+1; });
    return m;
  },[scenarios]);

  /* Available types from data */
  const availableTypes = useMemo(()=>{
    const set = new Set(scenarios.map(s=>s.type));
    return SITUATION_TYPES.filter(t=>set.has(t));
  },[scenarios]);

  return(
    <div style={{ minHeight:"100vh", background:C.bg, color:C.tx, fontFamily:"'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif", overflowX:"hidden" }}>
      <Nav active="Scénarios"/>

      {/* Hero */}
      <div style={{ textAlign:"center", padding:"56px 24px 24px" }}>
        <div style={{ display:"inline-flex", padding:"3px 10px", borderRadius:16, fontSize:10, fontWeight:700, letterSpacing:0.3, background:C.acD, color:C.ac, textTransform:"uppercase", marginBottom:16 }}>Catalogue</div>
        <h1 style={{ fontSize:36, fontWeight:300, margin:"0 0 12px", letterSpacing:-0.8 }}>
          <span style={{ fontWeight:700, color:C.ac }}>{scenarios.length}+</span> scénarios de vente réalistes
        </h1>
        <p style={{ fontSize:15, color:C.mt, maxWidth:560, margin:"0 auto", lineHeight:1.6 }}>
          20 secteurs PME françaises · 9 types de situations · 3 niveaux de difficulté.
          Chaque scénario est un vrai cas commercial avec persona, objections et brief.
        </p>
      </div>

      {/* Stats */}
      <div style={{ maxWidth:1080, margin:"16px auto", padding:"0 24px" }}>
        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
          {[
            { v:countsByDiff[1], l:"Débutant", c:"#22C55E" },
            { v:countsByDiff[2], l:"Intermédiaire", c:"#D4854A" },
            { v:countsByDiff[3], l:"Avancé", c:"#EF4444" },
            { v:countsByInter.mono, l:"Mono", c:C.bl },
            { v:countsByInter.multi, l:"Multi", c:C.vi },
          ].map((s,i)=>(
            <div key={i} style={{ background:C.bgC, border:`1px solid ${C.bd}`, borderRadius:10, padding:"8px 18px", textAlign:"center" }}>
              <span style={{ fontSize:20, fontWeight:200, color:s.c }}>{s.v}</span>
              <span style={{ fontSize:11, fontWeight:600, marginLeft:6, color:s.c }}>{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      <div ref={listRef} style={{ maxWidth:1080, margin:"0 auto", padding:"24px 24px 80px" }}>

        {/* Filters block */}
        <div style={{ background:C.bgC, border:`1px solid ${C.bd}`, borderRadius:16, padding:"18px 20px", marginBottom:24 }}>

          {/* Search bar */}
          <div style={{ marginBottom:16 }}>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Rechercher un scénario, secteur, persona..."
              style={{ width:"100%", padding:"11px 16px", background:C.bgE, border:`1px solid ${C.bd}`, borderRadius:10, color:C.tx, fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
              onFocus={e=>e.target.style.borderColor=C.ac}
              onBlur={e=>e.target.style.borderColor=C.bd}
            />
          </div>

          {/* LIGNE 1 — Type d'interlocuteur */}
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:0.8, textTransform:"uppercase", color:C.dm, marginBottom:8 }}>Type d'interlocuteur</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {["Tous","Mono-interlocuteur","Multi-interlocuteurs"].map(label=>{
                const val = label==="Mono-interlocuteur"?"Mono":label==="Multi-interlocuteurs"?"Multi":"Tous";
                return <TagButton key={label} label={label} active={interFilter===val} onClick={()=>setInterFilter(interFilter===val?"Tous":val)} activeColor={C.ac}/>;
              })}
            </div>
          </div>

          {/* LIGNE 2 — Type de situation */}
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:0.8, textTransform:"uppercase", color:C.dm, marginBottom:8 }}>Type de situation</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <TagButton label="Tous" active={typeFilter==="Tous"} onClick={()=>setTypeFilter("Tous")} activeColor={C.ac}/>
              {availableTypes.map(t=>(
                <TagButton key={t} label={t} active={typeFilter===t} onClick={()=>setTypeFilter(typeFilter===t?"Tous":t)} activeColor={C.ac}/>
              ))}
            </div>
          </div>

          {/* LIGNE 3 — Niveau de difficulté */}
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:0.8, textTransform:"uppercase", color:C.dm, marginBottom:8 }}>Niveau de difficulté</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <TagButton label="Tous" active={diffFilter===0} onClick={()=>setDiffFilter(0)} activeColor={C.ac}/>
              {[1,2,3].map(v=>{
                const d=DIFF_CONFIG[v];
                return <TagButton key={v} label={`${d.stars} ${d.label}`} active={diffFilter===v} onClick={()=>setDiffFilter(diffFilter===v?0:v)} activeColor={d.color}/>;
              })}
            </div>
          </div>
        </div>

        {/* Results count */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:8 }}>
          <span style={{ fontSize:13, color:C.mt }}>
            {hasFilters
              ? <><span style={{ fontWeight:700, color:C.ac }}>{filtered.length}</span> scénario{filtered.length>1?"s":""} correspond{filtered.length>1?"ent":""} à vos filtres</>
              : <>Scénarios <span style={{ fontWeight:700, color:C.ac }}>{(page-1)*PER_PAGE+1}-{Math.min(page*PER_PAGE,filtered.length)}</span> sur <span style={{ fontWeight:700, color:C.ac }}>{filtered.length}</span></>
            }
          </span>
          {hasFilters && (
            <button onClick={resetFilters} style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${C.bd}`, background:"transparent", color:C.mt, fontSize:11, cursor:"pointer" }}>
              Réinitialiser les filtres
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign:"center", padding:"64px 24px" }}>
            <div style={{ fontSize:16, fontWeight:600, marginBottom:8, color:C.mt }}>Chargement des scénarios...</div>
          </div>
        ) : paged.length > 0 ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
            {paged.map(s=><ScenarioCard key={s.id} s={s} onPreview={setPreview}/>)}
          </div>
        ) : (
          <div style={{ textAlign:"center", padding:"64px 24px" }}>
            <div style={{ fontSize:36, marginBottom:16 }}>&#128269;</div>
            <div style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>Aucun scénario trouvé</div>
            <div style={{ fontSize:13, color:C.dm, marginBottom:16 }}>Essayez de modifier vos filtres ou votre recherche</div>
            <button onClick={resetFilters} style={{ padding:"10px 20px", borderRadius:8, border:`1px solid ${C.bd}`, background:C.bgE, color:C.tx, fontSize:13, cursor:"pointer" }}>
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} total={scenarios.length} filtered={filtered.length} onPage={handlePageChange}/>

        {/* Bottom CTA */}
        <div style={{ textAlign:"center", marginTop:48, padding:"32px 24px", background:C.bgC, border:`1px solid ${C.bd}`, borderRadius:18 }}>
          <div style={{ fontSize:18, fontWeight:600, marginBottom:6 }}>Vous ne trouvez pas votre secteur ?</div>
          <p style={{ fontSize:14, color:C.mt, maxWidth:440, margin:"0 auto 20px", lineHeight:1.6 }}>
            Décrivez votre situation en quelques phrases. Notre IA crée un scénario sur mesure avec le prospect, les objections et l'évaluation adaptés.
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <a href="/simulation" style={{ padding:"12px 28px", background:`linear-gradient(135deg,${C.ac},${C.acL})`, border:"none", borderRadius:10, color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer", textDecoration:"none" }}>Créer un scénario sur mesure &rarr;</a>
          </div>
        </div>
      </div>

      <PreviewModal s={preview} onClose={()=>setPreview(null)}/>

      <Footer/>
    </div>
  );
}
