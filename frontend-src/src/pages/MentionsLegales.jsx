import { useColors, Nav, Footer } from "../shared";

export default function MentionsLegales(){
  const C = useColors(); const s={ h2:{ fontSize:20,fontWeight:600,margin:"36px 0 14px",color:C.ac },h3:{ fontSize:16,fontWeight:600,margin:"24px 0 10px" },p:{ fontSize:14,color:C.mt,lineHeight:1.7,margin:"0 0 12px" } };

  return(
    <div style={ { minHeight:"100vh",background:C.bg,color:C.tx,fontFamily:"'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif" } }>
      <Nav active=""/>
      <div style={ { maxWidth:720,margin:"0 auto",padding:"48px 24px 80px" } }>
        <h1 style={ { fontSize:32,fontWeight:300,margin:"0 0 8px" } }>Mentions <span style={ { fontWeight:700,color:C.ac } }>légales</span></h1>
        <p style={ { fontSize:13,color:C.dm } }>Dernière mise à jour : février 2026</p>

        <h2 style={ s.h2 }>1. Éditeur du site</h2>
        <p style={ s.p }>
          Le site <strong>vendmieux.fr</strong> est édité par :<br/>
          <strong>SASU INNOVABUY</strong><br/>
          SIRET : 931 378 368 00019<br/>
          Forme juridique : Société par Actions Simplifiée Unipersonnelle (SASU)<br/>
          Siège social : 6 Square Jean-Baptiste Riobé, 49480 Saint-Sylvain-d'Anjou, France<br/>
          Téléphone : 07 60 40 39 66<br/>
          Email : <a href="mailto:jfperrin@cap-performances.fr" style={ { color:C.ac } }>jfperrin@cap-performances.fr</a>
        </p>
        <p style={ s.p }>
          VendMieux est une marque commerciale de la SASU INNOVABUY, au même titre que Cap-Performances et Cap-Numerik.
        </p>

        <h2 style={ s.h2 }>2. Directeur de la publication</h2>
        <p style={ s.p }>
          Jean-François PERRIN, Président de la SASU INNOVABUY.
        </p>

        <h2 style={ s.h2 }>3. Hébergement</h2>
        <p style={ s.p }>
          Le site est hébergé par :<br/>
          <strong>Hostinger International Ltd.</strong><br/>
          61 Lordou Vironos Street, 6023 Larnaca, Chypre<br/>
          Site web : <a href="https://www.hostinger.fr" style={ { color:C.ac } } target="_blank" rel="noopener">www.hostinger.fr</a>
        </p>

        <h2 style={ s.h2 }>4. Propriété intellectuelle</h2>
        <p style={ s.p }>
          L'ensemble des contenus présents sur le site vendmieux.fr (textes, images, graphismes, logo, icônes, logiciels, base de données) est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.
        </p>
        <p style={ s.p }>
          Toute reproduction, représentation, modification, publication, distribution, ou exploitation totale ou partielle de ces contenus, sans autorisation écrite préalable de la SASU INNOVABUY, est strictement interdite et constituerait une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la Propriété Intellectuelle.
        </p>
        <p style={ s.p }>
          La méthode FORCE 3D est une méthodologie propriétaire de la SASU INNOVABUY. Toute reproduction ou utilisation commerciale est soumise à autorisation préalable.
        </p>

        <h2 style={ s.h2 }>5. Liens hypertextes</h2>
        <p style={ s.p }>
          Le site vendmieux.fr peut contenir des liens hypertextes vers d'autres sites internet. La SASU INNOVABUY n'exerce aucun contrôle sur le contenu de ces sites tiers et décline toute responsabilité quant à leur contenu.
        </p>

        <h2 style={ s.h2 }>6. Limitation de responsabilité</h2>
        <p style={ s.p }>
          La SASU INNOVABUY s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, elle ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition.
        </p>
        <p style={ s.p }>
          La SASU INNOVABUY décline toute responsabilité pour tout dommage résultant d'une intrusion frauduleuse d'un tiers ayant entraîné une modification des informations mises à disposition sur le site, ou pour toute interruption ou indisponibilité du site.
        </p>

        <h2 style={ s.h2 }>7. Droit applicable</h2>
        <p style={ s.p }>
          Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.
        </p>
      </div>
      <Footer/>
    </div>
  ); }
