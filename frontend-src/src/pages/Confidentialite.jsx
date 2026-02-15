import { useColors, Nav, Footer } from "../shared";

export default function Confidentialite(){
  const C = useColors(); const s={ h2:{ fontSize:20,fontWeight:600,margin:"36px 0 14px",color:C.ac },h3:{ fontSize:16,fontWeight:600,margin:"24px 0 10px" },p:{ fontSize:14,color:C.mt,lineHeight:1.7,margin:"0 0 12px" } };
  const li={ fontSize:14,color:C.mt,lineHeight:1.7,marginBottom:6,paddingLeft:16 };

  return(
    <div style={ { minHeight:"100vh",background:C.bg,color:C.tx,fontFamily:"'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif" } }>
      <Nav active=""/>
      <div style={ { maxWidth:720,margin:"0 auto",padding:"48px 24px 80px" } }>
        <h1 style={ { fontSize:32,fontWeight:300,margin:"0 0 8px" } }>Politique de <span style={ { fontWeight:700,color:C.ac } }>confidentialité</span></h1>
        <p style={ { fontSize:13,color:C.dm } }>Dernière mise à jour : février 2026</p>

        <h2 style={ s.h2 }>1. Responsable du traitement</h2>
        <p style={ s.p }>Le responsable du traitement des données personnelles est la <strong>SASU INNOVABUY</strong>, 6 Square Jean-Baptiste Riobé, 49480 Saint-Sylvain-d'Anjou, France. Email : <a href="mailto:jfperrin@cap-performances.fr" style={ { color:C.ac } }>jfperrin@cap-performances.fr</a>. Représentée par Jean-François PERRIN, Président.</p>

        <h2 style={ s.h2 }>2. Données collectées</h2>
        <h3 style={ s.h3 }>2.1 Données d'identification</h3>
        <p style={ s.p }>Nom, prénom, email professionnel, téléphone, entreprise, fonction — collectées via formulaire de contact et création de compte.</p>
        <h3 style={ s.h3 }>2.2 Données d'utilisation du simulateur</h3>
        <p style={ s.p }>Transcriptions des simulations vocales, scores FORCE 3D, statistiques de progression, durée des sessions. Nécessaires au fonctionnement du service.</p>
        <h3 style={ s.h3 }>2.3 Données techniques</h3>
        <p style={ s.p }>Adresse IP, navigateur, pages consultées, durée de visite — collectées automatiquement pour l'amélioration du service.</p>

        <h2 style={ s.h2 }>3. Finalités du traitement</h2>
        <p style={ s.p }>Fourniture et amélioration du service de simulation vocale ; évaluation des compétences commerciales (FORCE 3D) ; suivi de progression ; communication relative au service ; réponse aux demandes de contact et devis ; statistiques anonymisées.</p>

        <h2 style={ s.h2 }>4. Base légale</h2>
        <p style={ s.p }><strong>Exécution du contrat</strong> pour la fourniture du service. <strong>Consentement</strong> pour les communications commerciales. <strong>Intérêt légitime</strong> pour l'amélioration du service et la sécurité.</p>

        <h2 style={ s.h2 }>5. Durée de conservation</h2>
        <p style={ s.p }>Données d'identification : durée de la relation contractuelle + 3 ans. Données de simulation : durée de l'abonnement + 30 jours après résiliation. Données techniques : 13 mois maximum. Données de contact (prospects) : 3 ans après le dernier contact.</p>

        <h2 style={ s.h2 }>6. Destinataires des données</h2>
        <p style={ s.p }>Vos données sont traitées par la SASU INNOVABUY et ses sous-traitants techniques strictement nécessaires au fonctionnement du service :</p>
        <p style={ s.p }>• <strong>Anthropic</strong> (Claude) — Traitement IA des conversations (serveurs US, clauses contractuelles types)<br/>• <strong>Google Cloud</strong> — Synthèse vocale (serveurs UE)<br/>• <strong>Hostinger</strong> — Hébergement du site (serveurs UE)<br/>• <strong>Cal.com</strong> — Prise de rendez-vous en ligne</p>
        <p style={ s.p }>Aucune donnée n'est vendue, cédée ou transmise à des tiers à des fins commerciales.</p>

        <h2 style={ s.h2 }>7. Transferts hors UE</h2>
        <p style={ s.p }>Certaines données peuvent être transférées vers les États-Unis (Anthropic) dans le cadre du traitement IA. Ces transferts sont encadrés par des clauses contractuelles types conformes au RGPD (article 46.2.c).</p>

        <h2 style={ s.h2 }>8. Vos droits</h2>
        <p style={ s.p }>Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants : droit d'accès, de rectification, d'effacement, de limitation du traitement, de portabilité, d'opposition, et de retrait du consentement.</p>
        <p style={ s.p }>Pour exercer ces droits, contactez-nous à <a href="mailto:jfperrin@cap-performances.fr" style={ { color:C.ac } }>jfperrin@cap-performances.fr</a>. Réponse sous 30 jours. Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).</p>

        <h2 style={ s.h2 }>9. Cookies</h2>
        <p style={ s.p }>Le site vendmieux.fr utilise des cookies strictement nécessaires au fonctionnement du service (authentification, préférences d'affichage). Aucun cookie publicitaire ou de tracking tiers n'est utilisé. Votre préférence de thème (clair/sombre) est stockée localement dans votre navigateur.</p>

        <h2 style={ s.h2 }>10. Sécurité</h2>
        <p style={ s.p }>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement HTTPS, accès restreints, sauvegardes régulières, serveurs hébergés en France/UE.</p>

        <h2 style={ s.h2 }>11. Modification de la politique</h2>
        <p style={ s.p }>Cette politique peut être mise à jour. La date de dernière modification est indiquée en haut de page. En cas de modification substantielle, les utilisateurs inscrits seront informés par email.</p>
      </div>
      <Footer/>
    </div>
  ); }
