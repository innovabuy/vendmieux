/**
 * VendMieux — Per-route SEO data for client-side navigation.
 * Server injects metas on first load; this updates <title> + <meta description>
 * when navigating between SPA pages.
 * NOTE: Keep in sync with _SEO_DATA in api.py
 */

const SEO = {
  "/": {
    title: "VendMieux — Simulateur vocal IA de formation commerciale",
    description: "Entraînez vos commerciaux avec des prospects IA réalistes. 240+ scénarios, méthode FORCE 3D, évaluation instantanée. Conçu pour les PME françaises.",
  },
  "/produit": {
    title: "Comment ça marche — VendMieux | Briefing, Simulation vocale, Débriefing FORCE 3D",
    description: "Découvrez le fonctionnement de VendMieux : briefing commercial, simulation vocale avec un prospect IA, débriefing FORCE 3D avec analyse DISC et posture.",
  },
  "/tarifs": {
    title: "Tarifs VendMieux — 49€/mois par commercial | Formation commerciale IA",
    description: "49€ HT/mois par commercial, 20 sessions incluses. Sans engagement. 240+ scénarios sectoriels + création illimitée sur mesure. Dashboard de progression.",
  },
  "/scenarios": {
    title: "Scénarios de simulation — VendMieux | 240+ situations commerciales réalistes",
    description: "240+ scénarios de vente couvrant 20 secteurs, 6 types d'appel, 2 niveaux. Prospection, négociation, réclamation, upsell, multi-interlocuteurs.",
  },
  "/ecoles": {
    title: "VendMieux pour les Écoles de Commerce et BTS | Simulateur de vente IA",
    description: "Remplacez les jeux de rôle entre étudiants par des simulations IA. Évaluation FORCE 3D standardisée, multi-langue, dashboard professeur.",
  },
  "/ecoles-tarifs": {
    title: "Tarifs Écoles — VendMieux | Simulateur IA pour enseignement commercial",
    description: "Tarifs sur devis pour écoles de commerce, BTS, universités. Scénarios personnalisés illimités, multi-langue, dashboard professeur.",
  },
  "/contact": {
    title: "Contact VendMieux — Réservez une démo ou demandez un devis",
    description: "Contactez l'équipe VendMieux pour une démo gratuite, un devis école, ou toute question. Réponse sous 24h.",
  },
  "/mentions-legales": {
    title: "Mentions légales — VendMieux | SASU INNOVABUY",
    description: "Mentions légales du site vendmieux.fr édité par SASU INNOVABUY.",
  },
  "/confidentialite": {
    title: "Politique de confidentialité — VendMieux | RGPD",
    description: "Politique de confidentialité et protection des données personnelles de VendMieux. Conforme RGPD.",
  },
};

export default SEO;
