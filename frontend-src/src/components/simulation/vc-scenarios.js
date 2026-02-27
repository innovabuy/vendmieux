/**
 * vc-scenarios.js — Scenario definitions for Visite Client simulation
 * 3 scenarios: pdg-solo, comite-4, nego-site
 */

export const SCENARIOS = [
  {
    id: 'pdg-solo', mode: 'solo',
    label: 'Bureau PDG \u00b7 Industrie \u00b7 Solo',
    title: 'Entretien Directeur',
    sub: 'Prospection \u00b7 PME Industrielle \u00b7 D\u00e9cision d\'achat directe',
    room: 'bureau-pdg',
    roomLabel: 'Bureau PDG',
    phases: ['Accueil', 'D\u00e9couverte', 'Argumentation', 'Objections', 'Closing'],
    tension: 30,
    participants: [
      {
        id: 'ph', preset: 'exec',
        name: 'Philippe Desrochers', role: 'Directeur G\u00e9n\u00e9ral',
        disc: 'D', power: 'D\u00e9cideur', color: '#C8973A',
        present: true, arrivalDelay: null,
        dialogs: [
          "Asseyez-vous. Vous avez 20 minutes. Qu'est-ce que vous m'apportez concr\u00e8tement ?",
          "On a d\u00e9j\u00e0 test\u00e9 des solutions de formation. \u00c7a n'a jamais tenu dans la dur\u00e9e.",
          "Le ROI vous me le prouvez comment ? Des chiffres pr\u00e9cis.",
          "Vos commerciaux, en combien de temps sont-ils op\u00e9rationnels sur votre outil ?",
          "Je veux voir une d\u00e9mo sur un vrai cas de mon secteur. Vous pouvez faire \u00e7a ?",
          "Si \u00e7a marche comme vous dites, on peut parler d'un pilote sur mon \u00e9quipe terrain.",
        ],
        crossTalks: []
      }
    ],
    coaching: [
      { type: 'tip', label: 'Conseil', msg: 'DISC-D : donnez le ROI en premier. Pas de contexte superflu.' },
      { type: 'warn', label: 'Attention', msg: 'Il a eu de mauvaises exp\u00e9riences. Diff\u00e9renciez-vous imm\u00e9diatement avec du concret.' },
      { type: 'good', label: 'Point fort', msg: 'Bonne posture \u2014 laissez-le poser ses questions, \u00e7a r\u00e9v\u00e8le ses vrais enjeux.' },
      { type: 'tip', label: 'Conseil', msg: 'Utilisez le silence. Apr\u00e8s une objection, comptez 3 secondes avant de r\u00e9pondre.' },
      { type: 'warn', label: 'Attention', msg: 'Il parle de pilote \u2014 ancrez une date maintenant, sinon \u00e7a restera vague.' },
    ]
  },
  {
    id: 'comite-4', mode: 'multi',
    label: 'Comit\u00e9 de Direction \u00b7 4 personnes \u00b7 Arriv\u00e9e en cours',
    title: 'Comit\u00e9 de Direction',
    sub: 'Pr\u00e9sentation offre \u00b7 D\u00e9cision collective \u00b7 DAF arrive en cours',
    room: 'salle-reunion',
    roomLabel: 'Salle de R\u00e9union',
    phases: ['Pr\u00e9sentations', 'Contexte', 'Argumentation', 'Objections', 'D\u00e9lib\u00e9ration'],
    tension: 40,
    participants: [
      {
        id: 'pd', preset: 'exec',
        name: 'Philippe Desrochers', role: 'Dir. G\u00e9n\u00e9ral',
        disc: 'D', power: 'D\u00e9cideur', color: '#C8973A',
        present: true, arrivalDelay: null,
        dialogs: [
          "Bonjour. On vous \u00e9coute, vous avez 40 minutes.",
          "Sophie, vous en pensez quoi de leur approche ?",
          "Le ROI en 3 mois c'est r\u00e9aliste selon vous ?",
          "Marc, c'est dans votre p\u00e9rim\u00e8tre, non ?",
        ],
        crossTalks: [
          { target: 'sb', text: "Sophie, vous avez regard\u00e9 les alternatives ?" },
          { target: 'ml', text: "Marc, votre \u00e9quipe a le temps pour \u00e7a ?" },
        ]
      },
      {
        id: 'ml', preset: 'commercial',
        name: 'Marc Lef\u00e8vre', role: 'Dir. Commercial',
        disc: 'I', power: 'Utilisateur cl\u00e9', color: '#4A7FA0',
        present: true, arrivalDelay: null,
        dialogs: [
          "C'est exactement le probl\u00e8me qu'on a avec les nouveaux.",
          "Si on r\u00e9duit le time-to-performance de moiti\u00e9 c'est game changer.",
          "J'ai une \u00e9quipe de 12. Vous avez des retours terrain comparables ?",
          "Moi je suis pour. La question c'est le d\u00e9ploiement concret.",
        ],
        crossTalks: [
          { target: 'pd', text: "Philippe, on devrait tester \u00e7a sur la nouvelle promo." },
          { target: 'fb', text: "Fabien, c'est sur quel budget selon toi ?" },
        ]
      },
      {
        id: 'sb', preset: 'rh',
        name: 'Sophie Blanc', role: 'DRH',
        disc: 'C', power: 'Influenceur', color: '#7FC99A',
        present: true, arrivalDelay: null,
        dialogs: [
          "Comment vous vous int\u00e9grez avec notre LMS existant ?",
          "La RGPD \u2014 comment vous g\u00e9rez les donn\u00e9es collaborateurs ?",
          "On a eu de mauvaises exp\u00e9riences avec des outils qui promettent beaucoup.",
          "Un pilote 5 personnes avant tout engagement \u2014 c'est notre process.",
        ],
        crossTalks: [
          { target: 'ml', text: "Marc, votre \u00e9quipe a vraiment le bandwidth pour \u00e7a ?" },
          { target: 'pd', text: "Philippe, il faudra valider avec le DAF avant de s'engager." },
        ]
      },
      {
        id: 'fb', preset: 'daf',
        name: 'Fabien Breton', role: 'DAF',
        disc: 'C', power: 'Bloqueur budget', color: '#D47070',
        present: false, arrivalDelay: 80,
        dialogs: [
          "Excusez mon retard. O\u00f9 en sommes-nous ?",
          "Le budget formation est ferm\u00e9 pour ce trimestre.",
          "J'ai besoin d'un business case chiffr\u00e9. Pas de pitch, des faits.",
          "Quelle est votre politique si les r\u00e9sultats ne sont pas au rendez-vous ?",
        ],
        crossTalks: [
          { target: 'pd', text: "Philippe, c'est sur quel budget qu'on impute \u00e7a ?" },
        ]
      }
    ],
    coaching: [
      { type: 'tip', label: 'Conseil', msg: 'DISC-D en t\u00eate : chiffre ROI d\u00e8s les 2 premi\u00e8res minutes.' },
      { type: 'good', label: 'Alli\u00e9', msg: 'Marc valide l\'usage terrain. Appuyez-vous sur lui explicitement.' },
      { type: 'warn', label: 'Attention', msg: 'Sophie est analytique et prudente. Ne la brusquez pas.' },
      { type: 'alert', label: 'Alerte', msg: 'Le DAF arrive. Pr\u00e9parez un argument budget synth\u00e9tique.' },
      { type: 'tip', label: 'Dynamique', msg: 'Quand ils se parlent entre eux \u2014 silence. Laissez l\'alliance se construire.' },
    ]
  },
  {
    id: 'nego-site', mode: 'multi',
    label: 'N\u00e9gociation Site Industriel \u00b7 3 personnes',
    title: 'R\u00e9union Site Industriel',
    sub: 'N\u00e9gociation contrat \u00b7 Dir. Site + Resp. Achat + Tech',
    room: 'usine',
    roomLabel: 'Site Industriel',
    phases: ['Contexte', 'Diagnostic', 'Proposition', 'N\u00e9gociation', 'Accord'],
    tension: 65,
    participants: [
      {
        id: 'tc', preset: 'site',
        name: 'Thomas Collet', role: 'Dir. de Site',
        disc: 'D', power: 'D\u00e9cideur terrain', color: '#E8A04A',
        present: true, arrivalDelay: null,
        dialogs: [
          "On n'a pas de temps. Je reviens de production. Soyez direct.",
          "Vos concurrents m'ont fait la m\u00eame pr\u00e9sentation la semaine derni\u00e8re.",
          "Ici on ne fait pas confiance aux promesses. Des preuves.",
          "Sur le prix, vous avez une marge de man\u0153uvre oui ou non ?",
        ],
        crossTalks: [
          { target: 'jd', text: "Julie, vous avez compar\u00e9 les offres ?" },
          { target: 'ar', text: "Antoine, c\u00f4t\u00e9 int\u00e9gration c'est faisable ?" },
        ]
      },
      {
        id: 'jd', preset: 'rh',
        name: 'Julie Dumas', role: 'Resp. Achats',
        disc: 'C', power: 'N\u00e9gociateur prix', color: '#C8973A',
        present: true, arrivalDelay: null,
        dialogs: [
          "Vos tarifs sont 18% au-dessus de la moyenne march\u00e9.",
          "Je vais \u00eatre directe : on a une contrainte budg\u00e9taire ferme.",
          "Qu'est-ce que vous m'offrez de plus pour justifier cet \u00e9cart ?",
          "On peut se revoir la semaine prochaine si vous avez une nouvelle proposition.",
        ],
        crossTalks: [
          { target: 'tc', text: "Thomas, on a besoin d'un interlocuteur d\u00e9di\u00e9, pas un call center." },
        ]
      },
      {
        id: 'ar', preset: 'commercial',
        name: 'Antoine Renard', role: 'Resp. Technique',
        disc: 'S', power: 'Utilisateur final', color: '#7FC99A',
        present: false, arrivalDelay: 65,
        dialogs: [
          "Pardon du retard \u2014 incident ligne B. Vous parliez de quoi ?",
          "Techniquement, on a des contraintes proxy assez sp\u00e9cifiques chez nous.",
          "Les \u00e9quipes terrain sont sur Android uniquement. C'est compatible ?",
          "Si l'int\u00e9gration est propre, de mon c\u00f4t\u00e9 c'est OK.",
        ],
        crossTalks: [
          { target: 'tc', text: "Thomas, si \u00e7a s'int\u00e8gre bien \u00e7a nous ferait gagner du temps." },
        ]
      }
    ],
    coaching: [
      { type: 'warn', label: 'Terrain dur', msg: 'Ne promettez rien que vous ne pouvez pas tenir. Ce profil v\u00e9rifie tout.' },
      { type: 'tip', label: 'Langage', msg: 'Parlez productivit\u00e9, fiabilit\u00e9, co\u00fbts \u00e9vit\u00e9s \u2014 pas fonctionnalit\u00e9s.' },
      { type: 'alert', label: 'Prix', msg: 'Sur le prix : proposez de la valeur ajout\u00e9e avant de toucher aux tarifs.' },
      { type: 'good', label: 'Alli\u00e9 potentiel', msg: 'Antoine (tech) arrive \u2014 s\'il valide l\'int\u00e9gration, Julie suivra.' },
    ]
  }
];
