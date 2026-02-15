
SCENARIOS_DATABASE = [

    # ══════════════════════════════════════════════════════════════
    # SECTEUR 1 — INDUSTRIE / MANUFACTURING
    # ══════════════════════════════════════════════════════════════

    {
        "id": "IND-01",
        "secteur": "Industrie",
        "type_simulation": "prospection_telephonique",
        "titre": "Maintenance prédictive — DG PME industrielle",
        "vendeur": {
            "entreprise": {"nom": "TechMaint Solutions", "secteur": "Maintenance prédictive industrielle", "description": "Éditeur de solutions IoT de surveillance machines en temps réel"},
            "offre": {"nom": "PredictLine", "description": "Capteurs IoT + IA qui détecte les pannes 48h avant", "proposition_valeur": "Réduction de 70% des arrêts non planifiés, ROI en 6 mois", "prix": "À partir de 800€/mois pour 10 machines", "references": ["Fonderies du Rhône (72 sal.) — 3 pannes évitées en 6 mois", "Précis'Usinage Lyon — ROI en 4 mois"], "avantages_vs_concurrence": "Seule solution IA certifiée usinage CN, installation en 1 jour sans arrêt"},
            "objectif_appel": {"type": "rdv_physique", "description": "Décrocher un RDV de 30 min sur site pour démo live", "criteres_succes": ["Obtenir date + créneau", "Identifier le décideur", "Comprendre le parc machines"]},
            "contexte_appel": {"type": "appel_froid", "historique": "Premier contact", "infos_connues": "PME Rhône-Alpes, 85 sal., mécanique de précision"}
        },
        "prospect": {
            "prenom": "Olivier", "nom": "Bertrand", "genre": "M", "age": 52,
            "poste": "Directeur Général",
            "entreprise": {"nom": "MécaPress Rhône-Alpes", "secteur": "Mécanique de précision", "taille": "85 salariés", "ca": "12M€"},
            "traits": ["pragmatique", "direct", "méfiant envers les commerciaux", "fidèle à ses prestataires"],
            "style_communication": "Direct et factuel, pas de small talk",
            "motivations": ["réduire les coûts d'arrêt", "moderniser sans risque"],
            "peurs": ["investir dans une techno gadget", "dépendance à un fournisseur"],
            "situation": "2 pannes majeures le mois dernier (coût 45K€). Prestataire maintenance actuel depuis 15 ans. Un commercial IoT passé il y a 6 mois sans convaincre.",
            "priorites": ["fiabilité production", "livrer les commandes en retard"],
            "tics_langage": ["Bon...", "Concrètement ?", "Venez-en au fait"],
            "objections": [
                {"verbatim": "On a déjà un prestataire maintenance, ça fait 15 ans qu'on bosse ensemble", "type": "sincere"},
                {"verbatim": "L'IoT c'est bien joli mais on est une PME, pas Airbus", "type": "reflexe"},
                {"verbatim": "Envoyez-moi une doc par mail, je regarderai", "type": "tactique"},
                {"verbatim": "C'est pas le moment, on est débordés de commandes", "type": "sincere"},
                {"verbatim": "800€ par mois ? Pour des capteurs ? On va pas rajouter un abonnement", "type": "sincere"}
            ]
        }
    },

    {
        "id": "IND-02",
        "secteur": "Industrie",
        "type_simulation": "rdv_one_to_one",
        "titre": "Logiciel GPAO — Directrice de production",
        "vendeur": {
            "entreprise": {"nom": "InduSoft", "secteur": "Éditeur logiciel industriel", "description": "Solutions GPAO/MES pour PME industrielles"},
            "offre": {"nom": "InduPlan Pro", "description": "GPAO cloud avec planification intelligente et suivi temps réel des OF", "proposition_valeur": "Gain de 25% sur les délais de livraison, visibilité totale sur l'atelier", "prix": "1 200€/mois, déploiement en 6 semaines", "references": ["Plastiform (60 sal.) — délais réduits de 30%", "MétalTech Normandie — ROI en 5 mois"], "avantages_vs_concurrence": "Seul GPAO cloud avec appli mobile atelier, formation incluse"},
            "objectif_appel": {"type": "vente_directe", "description": "Closer un pilote de 3 mois sur une ligne de production", "criteres_succes": ["Valider le budget", "Accord sur un pilote", "Planning de déploiement"]},
            "contexte_appel": {"type": "suite_salon", "historique": "Rencontrée au salon Industrie Lyon il y a 2 semaines. Elle a pris une plaquette et laissé sa carte.", "infos_connues": "Intéressée par la planification atelier, galère avec Excel"}
        },
        "prospect": {
            "prenom": "Nathalie", "nom": "Dumont", "genre": "F", "age": 45,
            "poste": "Directrice de Production",
            "entreprise": {"nom": "PlastiRhône", "secteur": "Plasturgie", "taille": "120 salariés", "ca": "18M€"},
            "traits": ["rigoureuse", "opérationnelle", "sceptique sur les promesses éditeurs", "surmenée"],
            "style_communication": "Structurée, veut du concret et des preuves terrain",
            "motivations": ["en finir avec les plannings Excel", "avoir de la visibilité sur les retards"],
            "peurs": ["projet qui s'éternise", "outil trop complexe pour les opérateurs", "résistance au changement de l'équipe"],
            "situation": "Planification sur Excel, 3 chefs d'atelier qui ne parlent pas le même langage. Taux de service client tombé à 82%. Le DG met la pression.",
            "priorites": ["remonter le taux de service", "réduire les urgences quotidiennes"],
            "tics_langage": ["Sur le terrain c'est pas pareil", "Mes gars ne sont pas des informaticiens", "On a déjà essayé"],
            "objections": [
                {"verbatim": "On a testé un ERP il y a 3 ans, c'était un désastre. Plus jamais.", "type": "sincere"},
                {"verbatim": "6 semaines de déploiement c'est optimiste, vous connaissez pas notre réalité", "type": "sincere"},
                {"verbatim": "Mes opérateurs ont 55 ans de moyenne, ils ne toucheront pas une tablette", "type": "sincere"},
                {"verbatim": "Le DG ne validera jamais 1200€/mois en plus des investissements machines", "type": "tactique"},
                {"verbatim": "Montrez-moi un client dans la plasturgie, pas dans la mécanique", "type": "test"}
            ]
        }
    },

    {
        "id": "IND-03",
        "secteur": "Industrie",
        "type_simulation": "barrage_secretaire",
        "titre": "Sécurité machines — Barrage assistante + DG",
        "vendeur": {
            "entreprise": {"nom": "SecurIndus", "secteur": "Sécurité industrielle", "description": "Audit et mise en conformité sécurité machines"},
            "offre": {"nom": "Audit Conformité CE", "description": "Audit complet du parc machines + plan de mise en conformité + accompagnement", "proposition_valeur": "Éviter les sanctions DREAL et les accidents. Mise en conformité en 3 mois.", "prix": "À partir de 5 000€ pour un audit complet", "references": ["Groupe Mécalliance — 45 machines mises en conformité", "Fonderie Vaucluse — 0 accident depuis l'audit"], "avantages_vs_concurrence": "Seul cabinet certifié AFNOR sur la zone, accompagnement jusqu'à la conformité"},
            "objectif_appel": {"type": "rdv_physique", "description": "Décrocher un RDV avec le DG pour présenter l'audit", "criteres_succes": ["Passer la secrétaire", "Obtenir 15 min avec le DG", "Identifier l'urgence conformité"]},
            "contexte_appel": {"type": "appel_froid", "historique": "Aucun contact préalable", "infos_connues": "PME industrielle, 60 sal., pas d'audit récent selon la base DREAL"}
        },
        "prospect_barrage": {
            "prenom": "Christine", "nom": "Morel", "genre": "F", "age": 47,
            "poste": "Assistante de direction",
            "traits": ["protectrice", "filtre efficace", "polie mais ferme"],
            "objections_barrage": [
                {"verbatim": "M. Garnier est en réunion, rappelez en fin de semaine", "type": "reflexe"},
                {"verbatim": "C'est à quel sujet exactement ?", "type": "filtre"},
                {"verbatim": "Envoyez un mail à contact@, je lui transmettrai", "type": "tactique"},
                {"verbatim": "Il ne prend pas les appels des commerciaux", "type": "ferme"}
            ]
        },
        "prospect": {
            "prenom": "Jean-Marc", "nom": "Garnier", "genre": "M", "age": 58,
            "poste": "Directeur Général",
            "entreprise": {"nom": "Atelier Garnier & Fils", "secteur": "Chaudronnerie industrielle", "taille": "60 salariés", "ca": "8M€"},
            "traits": ["ancien ouvrier devenu patron", "méfiant", "sensible à la sécurité de ses équipes", "économe"],
            "style_communication": "Franc, direct, parle comme à l'atelier",
            "motivations": ["protéger ses gars", "éviter les emmerdes avec l'inspection"],
            "peurs": ["se faire arnaquer par un consultant", "arrêter la production pour un audit"],
            "situation": "Dernière inspection DREAL il y a 2 ans, quelques remarques non traitées. Un accident de presse l'année dernière (sans gravité). Pas de responsable sécurité dédié.",
            "priorites": ["carnet de commandes plein", "recrutement difficile"],
            "tics_langage": ["Dites-moi combien ça coûte, on verra après", "Moi je suis un homme de terrain", "Les consultants qui connaissent pas l'atelier..."],
            "objections": [
                {"verbatim": "La DREAL est passée il y a 2 ans, on était dans les clous", "type": "sincere"},
                {"verbatim": "5000€ pour un audit ? Je fais venir mon assureur et c'est gratuit", "type": "reflexe"},
                {"verbatim": "J'ai pas le temps d'arrêter des machines pour un audit", "type": "sincere"},
                {"verbatim": "Mon contremaître gère la sécurité, ça suffit bien", "type": "sincere"}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════
    # SECTEUR 2 — SERVICES / CONSEIL
    # ══════════════════════════════════════════════════════════════

    {
        "id": "SRV-01",
        "secteur": "Services",
        "type_simulation": "prospection_telephonique",
        "titre": "Solution RH / Paie — DRH PME de services",
        "vendeur": {
            "entreprise": {"nom": "PayFit", "secteur": "Éditeur SaaS RH", "description": "Solution de paie et gestion RH automatisée pour PME"},
            "offre": {"nom": "PayFit PME", "description": "Paie automatisée + portail salarié + gestion congés/absences", "proposition_valeur": "Division par 3 du temps de traitement paie, 0 erreur DSN, autonomie RH", "prix": "À partir de 29€/salarié/mois", "references": ["Cabinet Nexia (40 sal.) — paie internalisée en 2 semaines", "Agence Digitale Nantes (25 sal.) — 0 erreur DSN depuis 1 an"], "avantages_vs_concurrence": "Seule solution qui fait la paie + admin RH + portail salarié dans un seul outil"},
            "objectif_appel": {"type": "rdv_visio", "description": "Décrocher une démo visio de 30 min", "criteres_succes": ["Comprendre le volume de paie actuel", "Identifier les douleurs (erreurs, temps passé)", "Fixer une date de démo"]},
            "contexte_appel": {"type": "appel_froid", "historique": "Aucun contact", "infos_connues": "Cabinet de conseil en management, 55 salariés, croissance rapide"}
        },
        "prospect": {
            "prenom": "Sophie", "nom": "Laurent", "genre": "F", "age": 38,
            "poste": "Directrice des Ressources Humaines",
            "entreprise": {"nom": "Altéa Consulting", "secteur": "Conseil en management", "taille": "55 salariés", "ca": "6M€"},
            "traits": ["organisée", "surmenée", "ouverte aux outils digitaux", "exigeante sur la fiabilité"],
            "style_communication": "Professionnelle, rapide, veut aller à l'essentiel",
            "motivations": ["arrêter de passer 3 jours sur la paie", "automatiser les tâches admin"],
            "peurs": ["migration ratée", "perte de données", "outil qui ne gère pas les spécificités (RTT, primes)"],
            "situation": "Paie externalisée chez un expert-comptable qui fait des erreurs. 3 DSN rectificatives en 6 mois. Croissance de 10 sal./an, l'EC ne suit plus.",
            "priorites": ["fiabiliser la paie", "onboarding des nouveaux plus fluide"],
            "tics_langage": ["Je n'ai pas beaucoup de temps", "Ça marche pour les conventions collectives Syntec ?", "Notre EC fait ça très bien... enfin normalement"],
            "objections": [
                {"verbatim": "Notre expert-comptable fait la paie, ça fait 10 ans", "type": "reflexe"},
                {"verbatim": "29€ par salarié ? Donc 1600€/mois ? L'EC nous coûte 800€", "type": "sincere"},
                {"verbatim": "La migration de la paie c'est trop risqué, on est en plein recrutement", "type": "sincere"},
                {"verbatim": "Je dois en parler au DG, ce n'est pas moi qui décide du budget", "type": "sincere"},
                {"verbatim": "Envoyez-moi un comparatif par mail, je regarderai", "type": "tactique"}
            ]
        }
    },

    {
        "id": "SRV-02",
        "secteur": "Services",
        "type_simulation": "rdv_one_to_one",
        "titre": "Assurance cyber — DG cabinet d'expertise comptable",
        "vendeur": {
            "entreprise": {"nom": "CyberAssur", "secteur": "Courtage en assurance cyber", "description": "Courtier spécialisé dans l'assurance cyber pour les professions réglementées"},
            "offre": {"nom": "CyberProtect Pro", "description": "Assurance cyber complète : couverture pertes d'exploitation, frais de notification RGPD, responsabilité civile données", "proposition_valeur": "Protection complète à partir de 150€/mois. Couverture jusqu'à 500K€.", "prix": "150 à 400€/mois selon le CA et le volume de données", "references": ["Cabinet Durand & Associés — couvert après une attaque ransomware", "Cabinet Leblanc — indemnisé 120K€ après fuite de données"], "avantages_vs_concurrence": "Spécialiste professions du chiffre, audit inclus, 72h pour indemnisation"},
            "objectif_appel": {"type": "vente_directe", "description": "Signer un contrat ou obtenir un accord de principe avec date de signature", "criteres_succes": ["Faire prendre conscience du risque", "Présenter l'offre", "Obtenir un accord ou une date de signature"]},
            "contexte_appel": {"type": "suite_recommandation", "historique": "Recommandé par le président de l'ordre régional des EC", "infos_connues": "Cabinet de 30 personnes, pas d'assurance cyber, gère des données sensibles clients"}
        },
        "prospect": {
            "prenom": "Marc", "nom": "Delaporte", "genre": "M", "age": 55,
            "poste": "Expert-comptable associé, Gérant",
            "entreprise": {"nom": "Cabinet Delaporte & Fils", "secteur": "Expertise comptable", "taille": "30 salariés", "ca": "3.5M€"},
            "traits": ["prudent", "analytique", "sensible aux chiffres", "conservateur", "respecte les recommandations de l'Ordre"],
            "style_communication": "Posé, méthodique, veut comprendre avant de décider",
            "motivations": ["protéger le cabinet et sa réputation", "être en conformité"],
            "peurs": ["payer pour un risque qui n'arrivera pas", "complexité contractuelle"],
            "situation": "Cabinet en transition digitale. Données clients sur un serveur local + cloud partiel. Pas de PRA. Un confrère piraté le mois dernier (entendu à une réunion de l'Ordre).",
            "priorites": ["passage full cloud", "recrutement de 2 collaborateurs"],
            "tics_langage": ["Montrez-moi les chiffres", "C'est déductible ?", "Qu'est-ce que dit l'Ordre là-dessus ?"],
            "objections": [
                {"verbatim": "On n'a jamais eu de problème informatique en 20 ans", "type": "sincere"},
                {"verbatim": "Notre prestataire informatique nous dit qu'on est bien protégés", "type": "reflexe"},
                {"verbatim": "150€/mois ça fait 1800€/an, c'est cher pour un risque hypothétique", "type": "sincere"},
                {"verbatim": "Je dois en parler à mon associé", "type": "sincere"},
                {"verbatim": "On verra ça après notre migration cloud, pas maintenant", "type": "tactique"}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════
    # SECTEUR 3 — TECH / SaaS / DIGITAL
    # ══════════════════════════════════════════════════════════════

    {
        "id": "TECH-01",
        "secteur": "Tech / SaaS",
        "type_simulation": "prospection_telephonique",
        "titre": "Solution e-commerce — Directrice marketing agence",
        "vendeur": {
            "entreprise": {"nom": "ShopForce", "secteur": "Plateforme e-commerce B2B", "description": "Plateforme SaaS de création de boutiques e-commerce B2B intégrée aux ERP"},
            "offre": {"nom": "ShopForce B2B", "description": "Boutique en ligne B2B avec catalogue, tarifs par client, commandes automatisées vers l'ERP", "proposition_valeur": "Vos clients commandent en ligne 24/7, intégration ERP automatique, panier moyen +35%", "prix": "À partir de 490€/mois", "references": ["Distrib'Pro — 40% des commandes passées en ligne en 3 mois", "FourniTech — panier moyen +42%"], "avantages_vs_concurrence": "Seule plateforme B2B qui s'intègre nativement avec Sage et EBP"},
            "objectif_appel": {"type": "rdv_visio", "description": "Décrocher une démo visio de 45 min", "criteres_succes": ["Comprendre le process de commande actuel", "Identifier le volume de commandes B2B", "Fixer une date de démo"]},
            "contexte_appel": {"type": "appel_froid", "historique": "Aucun contact", "infos_connues": "Distributeur de fournitures industrielles, pas de e-commerce, commandes par fax/téléphone"}
        },
        "prospect": {
            "prenom": "Émilie", "nom": "Vidal", "genre": "F", "age": 34,
            "poste": "Directrice Commerciale",
            "entreprise": {"nom": "FourniPro Distribution", "secteur": "Distribution fournitures industrielles", "taille": "45 salariés", "ca": "9M€"},
            "traits": ["dynamique", "ambitieuse", "frustrée par le manque de digitalisation", "résultats-orientée"],
            "style_communication": "Rapide, enthousiaste quand ça l'intéresse, impatiente quand ça traîne",
            "motivations": ["digitaliser les commandes", "libérer les commerciaux du traitement de commandes"],
            "peurs": ["clients pas prêts au digital", "intégration technique ratée avec Sage"],
            "situation": "80% des commandes par téléphone/fax. 2 assistantes commerciales passent 70% de leur temps à saisir des commandes. Les commerciaux terrain ne prospectent plus, ils gèrent l'admin.",
            "priorites": ["augmenter le CA par commercial", "réduire les erreurs de commande"],
            "tics_langage": ["On perd un temps fou", "Nos clients sont vieux jeu", "Nos commerciaux sont des preneurs de commandes"],
            "objections": [
                {"verbatim": "Nos clients ne commanderont jamais en ligne, ils appellent depuis 20 ans", "type": "sincere"},
                {"verbatim": "490€/mois ? On a déjà un site vitrine qui nous coûte assez cher", "type": "reflexe"},
                {"verbatim": "L'intégration avec Sage ça va être un cauchemar, je connais", "type": "sincere"},
                {"verbatim": "On a un projet CRM en cours, je ne veux pas tout lancer en même temps", "type": "sincere"},
                {"verbatim": "Mon DG ne croit pas au e-commerce B2B", "type": "sincere"}
            ]
        }
    },

    {
        "id": "TECH-02",
        "secteur": "Tech / SaaS",
        "type_simulation": "multi_interlocuteurs",
        "titre": "Cybersécurité — DSI + DAF ETI",
        "vendeur": {
            "entreprise": {"nom": "CyberShield", "secteur": "Cybersécurité", "description": "SOC managé et protection endpoint pour ETI"},
            "offre": {"nom": "CyberShield 360", "description": "SOC 24/7 + EDR + formation employés + assurance cyber incluse", "proposition_valeur": "Protection complète, détection en <15 min, coût 5x inférieur à un SOC interne", "prix": "À partir de 3 500€/mois pour 200 postes", "references": ["Groupe Tessier — attaque stoppée en 8 min", "LogisTrans — certification ISO 27001 obtenue"], "avantages_vs_concurrence": "Seul SOC français avec assurance cyber intégrée et SLA <15 min"},
            "objectif_appel": {"type": "rdv_physique", "description": "Obtenir un accord de principe pour un audit de sécurité gratuit", "criteres_succes": ["Convaincre le DSI sur la technique", "Convaincre le DAF sur le budget", "Date d'audit planifiée"]},
            "contexte_appel": {"type": "suite_salon", "historique": "Le DSI est venu sur le stand au FIC. Le DAF ne connaît pas CyberShield.", "infos_connues": "ETI industrielle, 200 postes, pas de SOC, antivirus basique"}
        },
        "prospect_1": {
            "prenom": "Thomas", "nom": "Renault", "genre": "M", "age": 42,
            "poste": "Directeur des Systèmes d'Information",
            "traits": ["technique", "conscient des risques", "frustré du manque de budget", "allié potentiel"],
            "style_communication": "Technique, précis, veut des détails d'implémentation",
            "objections": [
                {"verbatim": "On a déjà un antivirus et un firewall, c'est pas suffisant ?", "type": "test"},
                {"verbatim": "Comment vous gérez la souveraineté des données ? Tout reste en France ?", "type": "sincere"},
                {"verbatim": "Je veux voir votre SOC, pas juste une plaquette", "type": "sincere"}
            ]
        },
        "prospect_2": {
            "prenom": "Isabelle", "nom": "Mercier", "genre": "F", "age": 50,
            "poste": "Directrice Administrative et Financière",
            "traits": ["budget-orientée", "sceptique sur l'IT", "demande du ROI", "influence le DG"],
            "style_communication": "Directe, veut des chiffres, pas de jargon technique",
            "objections": [
                {"verbatim": "3500€ par mois ? C'est 42 000€ par an. Justifiez-moi ce budget.", "type": "sincere"},
                {"verbatim": "On n'a jamais été attaqués. Pourquoi payer maintenant ?", "type": "sincere"},
                {"verbatim": "On peut pas commencer par un truc moins cher et voir ?", "type": "tactique"}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════
    # SECTEUR 4 — BTP / CONSTRUCTION
    # ══════════════════════════════════════════════════════════════

    {
        "id": "BTP-01",
        "secteur": "BTP",
        "type_simulation": "prospection_telephonique",
        "titre": "Location matériel avec télématique — Conductrice de travaux",
        "vendeur": {
            "entreprise": {"nom": "LocaPro", "secteur": "Location de matériel BTP", "description": "Location longue durée de matériel BTP avec suivi télématique intégré"},
            "offre": {"nom": "LocaPro Connecté", "description": "Location matériel + capteurs GPS/conso + appli de suivi de parc en temps réel", "proposition_valeur": "Fin des vols et de la sous-utilisation. Visibilité totale sur le parc, économie de 20% sur les coûts matériel.", "prix": "Surcout de 8% sur la location standard", "references": ["Eiffage TP Normandie — vol de matériel réduit à 0", "Bouygues régional — utilisation parc optimisée de 25%"], "avantages_vs_concurrence": "Seul loueur avec télématique intégrée et pas en option payante"},
            "objectif_appel": {"type": "rdv_physique", "description": "RDV sur chantier pour démo de l'appli de suivi", "criteres_succes": ["Comprendre le parc actuel", "Identifier les problèmes (vols, sous-utilisation)", "Date de visite chantier"]},
            "contexte_appel": {"type": "appel_froid", "historique": "Aucun contact", "infos_connues": "PME BTP, 35 sal., marchés publics locaux"}
        },
        "prospect": {
            "prenom": "Sandrine", "nom": "Lefèvre", "genre": "F", "age": 41,
            "poste": "Gérante / Conductrice de travaux principale",
            "entreprise": {"nom": "Lefèvre TP", "secteur": "Travaux publics", "taille": "35 salariés", "ca": "5M€"},
            "traits": ["terrain", "multitâche", "méfiante envers les gadgets", "sensible au pragmatisme"],
            "style_communication": "Franche, pas de chichis, veut du concret immédiat",
            "motivations": ["arrêter de chercher le matériel sur les chantiers", "réduire les vols"],
            "peurs": ["un truc compliqué à gérer en plus", "surcoût non rentabilisé"],
            "situation": "3 chantiers en simultané, matériel dispersé, 2 vols de matériel cette année (15K€ de pertes). Pas de suivi du parc à part un tableur que personne ne remplit.",
            "priorites": ["finir le chantier de la mairie dans les délais", "recruter un chef de chantier"],
            "tics_langage": ["J'ai pas le temps là", "On est sur le terrain nous", "Ça marche sur le papier mais en vrai ?"],
            "objections": [
                {"verbatim": "8% en plus ? La location c'est déjà un poste énorme", "type": "sincere"},
                {"verbatim": "Les GPS sur les engins mes gars vont pas aimer, ils vont croire que je les surveille", "type": "sincere"},
                {"verbatim": "On a toujours loué chez Loxam, pourquoi changer ?", "type": "reflexe"},
                {"verbatim": "J'ai pas le temps de gérer une appli en plus", "type": "sincere"}
            ]
        }
    },

    {
        "id": "BTP-02",
        "secteur": "BTP",
        "type_simulation": "rdv_one_to_one",
        "titre": "Logiciel devis/facturation BTP — DG entreprise générale",
        "vendeur": {
            "entreprise": {"nom": "BatiChiffrage", "secteur": "Éditeur logiciel BTP", "description": "Solution de chiffrage et suivi de chantier pour entreprises générales du bâtiment"},
            "offre": {"nom": "BatiChiffrage Pro", "description": "Logiciel de devis avec bibliothèque de prix intégrée + suivi de chantier + facturation de situation", "proposition_valeur": "Devis en 2h au lieu de 2 jours. Marge réelle connue en temps réel.", "prix": "790€/mois pour 5 utilisateurs", "references": ["Constructions Martin (80 sal.) — temps de chiffrage divisé par 4", "Bâtir Plus — marges réelles +3 points vs estimé"], "avantages_vs_concurrence": "Seul logiciel avec bibliothèque de prix BTP mise à jour mensuellement et suivi marge temps réel"},
            "objectif_appel": {"type": "vente_directe", "description": "Signer un abonnement ou un essai de 30 jours", "criteres_succes": ["Démontrer le gain de temps chiffrage", "Valider la compatibilité avec leur process", "Obtenir un engagement"]},
            "contexte_appel": {"type": "suite_mail", "historique": "Il a téléchargé un guide gratuit 'Optimiser ses marges BTP' sur le site il y a 10 jours", "infos_connues": "Entreprise générale TCE, 50 sal., fait du neuf et de la réno"}
        },
        "prospect": {
            "prenom": "Franck", "nom": "Dubois", "genre": "M", "age": 48,
            "poste": "Directeur Général",
            "entreprise": {"nom": "Dubois Construction", "secteur": "Entreprise générale bâtiment TCE", "taille": "50 salariés", "ca": "7M€"},
            "traits": ["pragmatique", "bon vivant", "gère à l'instinct", "réfractaire à l'informatique"],
            "style_communication": "Chaleureux mais vite distrait, aime les anecdotes terrain",
            "motivations": ["savoir enfin si ses chantiers sont rentables", "répondre à plus d'appels d'offre"],
            "peurs": ["perdre son système Excel qui marche (à peu près)", "former ses métreurs qui ont 25 ans de boîte"],
            "situation": "Chiffre ses devis sur Excel avec des formules maison. Ne connaît sa marge réelle qu'en fin d'année. A perdu 2 appels d'offre le mois dernier par manque de réactivité.",
            "priorites": ["répondre plus vite aux appels d'offre", "arrêter les mauvaises surprises en fin de chantier"],
            "tics_langage": ["Dans le bâtiment c'est pas comme dans un bureau", "Mon père faisait comme ça", "Montrez-moi sur un vrai devis"],
            "objections": [
                {"verbatim": "Excel ça marche depuis 20 ans, pourquoi changer ?", "type": "sincere"},
                {"verbatim": "790€ par mois ça fait 10 000 par an, c'est un métreur à mi-temps", "type": "sincere"},
                {"verbatim": "Mes gars ne sont pas des informaticiens, ils vont jamais l'utiliser", "type": "sincere"},
                {"verbatim": "Vous connaissez le bâtiment ? Parce que les éditeurs qui débarquent du tertiaire...", "type": "test"},
                {"verbatim": "On verra en septembre, là c'est le rush des chantiers d'été", "type": "tactique"}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════
    # SECTEUR 5 — SANTÉ / MÉDICO-SOCIAL
    # ══════════════════════════════════════════════════════════════

    {
        "id": "SANTE-01",
        "secteur": "Santé",
        "type_simulation": "prospection_telephonique",
        "titre": "Logiciel gestion cabinet — Directrice de clinique vétérinaire",
        "vendeur": {
            "entreprise": {"nom": "VetoSoft", "secteur": "Éditeur logiciel vétérinaire", "description": "Solution tout-en-un de gestion de cabinet vétérinaire"},
            "offre": {"nom": "VetoSoft Cloud", "description": "Dossier patient, agenda, facturation, stock, rappels vaccins automatiques, téléconseil", "proposition_valeur": "Gain de 45 min/jour par véto. Rappels vaccins = +15% de CA récurrent.", "prix": "À partir de 189€/mois pour 3 vétos", "references": ["Clinique des 4 Pattes Bordeaux — +18% de CA en 1 an", "Cabinet VetNord — stock optimisé, péremption réduite de 80%"], "avantages_vs_concurrence": "Seul logiciel véto avec module téléconseil intégré et rappels automatiques multicanal"},
            "objectif_appel": {"type": "rdv_visio", "description": "Décrocher une démo visio de 30 min", "criteres_succes": ["Comprendre le logiciel actuel", "Identifier les irritants", "Fixer une date de démo"]},
            "contexte_appel": {"type": "appel_froid", "historique": "Aucun contact", "infos_connues": "Clinique vétérinaire, 4 vétos, 2 ASV, ville moyenne"}
        },
        "prospect": {
            "prenom": "Claire", "nom": "Fournier", "genre": "F", "age": 39,
            "poste": "Directrice / Vétérinaire associée",
            "entreprise": {"nom": "Clinique Vétérinaire du Parc", "secteur": "Vétérinaire", "taille": "8 salariés", "ca": "900K€"},
  ions de soins pour établissements de santé"},
            "offre": {"nom": "SmartCare Chambre", "description": "Système de monitoring patient en chambre : capteurs de chute, appel infirmier intelligent, suivi constantes", "proposition_valeur": "Réduction de 60% des chutes non détectées. Allègement de la charge soignante nocturne.", "prix": "250€/chambre/mois en location, installation comprise", "references": ["EHPAD Les Tilleuls — 0 chute non détectée en 8 mois", "Résidence Bel Air — charge soignante nuit réduite de 30%"], "avantages_vs_concurrence": "Seul système certifié HAS avec IA prédictive de risque de chute"},
            "objectif_appel": {"type": "rdv_physique", "description": "Obtenir un RDV sur site pour évaluation des besoins et démo en chambre", "criteres_succes": ["Comprendre le taux de chutes actuel", "Identifier le décideur (directeur ou groupe)", "Planifier une visite"]},
            "contexte_appel": {"type": "suite_salon", "historique": "Croisé au salon des Directeurs d'EHPAD. Il a montré de l'intérêt mais pas laissé ses coordonnées.", "infos_connues": "EHPAD indépendant, 80 lits, zone rurale"}
        },
        "prospect": {
            "prenom": "Philippe", "nom": "Rousseau", "genre": "M", "age": 56,
            "poste": "Directeur d'établissement",
            "entreprise": {"nom": "EHPAD Résidence des Chênes", "secteur": "Médico-social", "taille": "45 salariés", "ca": "3.2M€"},
            "traits": ["humain", "soucieux de ses résidents", "contraint budgétairement", "méfiant envers la tech invasive"],
            "style_communication": "Empathique, parle des résidents comme d'une famille, sensible aux histoires",
            "motivations": ["protéger ses résidents", "soulager ses aides-soignantes épuisées"],
            "peurs": ["déshumanisation des soins", "budget ARS insuffisant", "résistance des familles"],
            "situation": "3 chutes graves en 6 mois dont 1 fracture du col du fémur. Équipe de nuit en sous-effectif (2 AS pour 80 résidents). Turn-over soignant de 40%. ARS qui met la pression sur les indicateurs qualité.",
            "priorites": ["recrutement soignant", "évaluation HAS dans 6 mois"],
            "tics_langage": ["Nos résidents ne sont pas des numéros", "Avec quel budget ?", "L'ARS ne nous donne pas les moyens"],
            "objections": [
                {"verbatim": "250€ par chambre par mois ? Pour 80 chambres c'est 20 000€. Impensable.", "type": "sincere"},
                {"verbatim": "Mes aides-soignantes n'ont pas besoin de capteurs pour savoir quand un résident va mal", "type": "sincere"},
                {"verbatim": "Les familles vont penser qu'on surveille leurs parents comme des prisonniers", "type": "sincere"},
                {"verbatim": "L'évaluation HAS c'est dans 6 mois, on ne change rien avant", "type": "tactique"},
                {"verbatim": "Montrez-moi un EHPAD indépendant qui a les moyens, pas un groupe", "type": "test"}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════
    # SECTEUR 6 — COMMERCE / RETAIL / RESTAURATION
    # ══════════════════════════════════════════════════════════════

    {
        "id": "COM-01",
        "secteur": "Commerce / Restauration",
        "type_simulation": "prospection_telephonique",
        "titre": "Caisse enregistreuse connectée — Gérante de restaurant",
        "vendeur": {
            "entreprise": {"nom": "CashPad", "secteur": "Solutions d'encaissement", "description": "Caisse enregistreuse sur iPad avec gestion commandes, stocks, et fidélité"},
            "offre": {"nom": "CashPad Resto", "description": "Caisse iPad + prise de commande en salle sur tablette + cuisine connectée + gestion stocks temps réel", "proposition_valeur": "Ticket moyen +12%, temps de service -20%, stock optimisé", "prix": "À partir de 79€/mois, matériel inclus", "references": ["Bistrot du Marché Lyon — ticket moyen +15%", "Pizza Roma (3 adresses) — stocks optimisés, gaspillage -40%"], "avantages_vs_concurrence": "Seule caisse avec prise de commande tablette + gestion stock + fidélité intégrée"},
            "objectif_appel": {"type": "rdv_physique", "description": "RDV au restaurant pour démo sur place", "criteres_succes": ["Comprendre la caisse actuelle", "Identifier les irritants service", "Fixer un créneau hors service"]},
            "contexte_appel": {"type": "appel_froid", "historique": "Aucun contact", "infos_connues": "Restaurant traditionnel, centre-ville, bonne réputation Google (4.3), 40 couverts"}
        },
        "prospect": {
            "prenom": "Fatima", "nom": "Benali", "genre": "F", "age": 43,
            "poste": "Gérante",
            "entreprise": {"nom": "Le Jardin de Fatima", "secteur": "Restauration traditionnelle", "taille": "8 salariés", "ca": "450K€"},
            "traits": ["passionnée cuisine", "méfiante envers la tech", "économe", "forte personnalité"],
            "style_communication": "Directe, chaleureuse, parle avec les mains, peu de patience pour le jargon",
            "motivations": ["servir plus vite en coup de feu", "arrêter de compter les stocks à la main"],
            "peurs": ["que ça plante en plein service", "coût caché", "dépendance à la technologie"],
            "situation": "Caisse classique avec tickets. Commandes prises au carnet. Stocks comptés le dimanche. Erreurs de commande fréquentes en coup de feu. Bon CA mais marges en baisse (coûts matières premières).",
            "priorites": ["maintenir la qualité", "ouvrir le midi en semaine"],
            "tics_langage": ["Moi je fais de la cuisine pas de l'informatique", "Mon mari gère la caisse", "Ça marche depuis 10 ans pourquoi changer"],
            "objections": [
                {"verbatim": "79€ par mois ? Ma caisse je l'ai payée une fois et c'est fini", "type": "sincere"},
                {"verbatim": "Si ça plante en plein service du samedi soir, vous faites quoi ?", "type": "sincere"},
                {"verbatim": "Mes serveurs ont déjà du mal avec la caisse actuelle", "type": "sincere"},
                {"verbatim": "Mon comptable gère tout ça, appelez-le", "type": "tactique"},
                {"verbatim": "J'ai un cousin qui est dans l'informatique, je lui demanderai", "type": "tactique"}
            ]
        }
    },

    {
        "id": "COM-02",
        "secteur": "Commerce / Restauration",
        "type_simulation": "rdv_one_to_one",
        "titre": "Solution click & collect — Directeur de réseau boulangeries",
        "vendeur": {
            "entreprise": {"nom": "DigitBoutic", "secteur": "Solutions digitales commerce de proximité", "description": "Plateforme de commande en ligne et click & collect pour commerces alimentaires"},
            "offre": {"nom": "DigitBoutic Pro", "description": "Site de commande en ligne + appli fidélité + click & collect + livraison locale", "proposition_valeur": "CA additionnel de 15-20% via la commande en ligne, fidélisation client x3", "prix": "349€/mois par point de vente + 2% commission commandes", "references": ["Boulangerie Maison Dupain (4 boutiques) — 22% CA en ligne", "Les Douceurs d'Antan — file d'attente divisée par 2"], "avantages_vs_concurrence": "Seule solution pensée pour l'alimentaire avec gestion des créneaux de retrait et de la production"},
            "objectif_appel": {"type": "vente_directe", "description": "Signer un pilote sur 2 boutiques pendant 3 mois", "criteres_succes": ["Valider l'intérêt pour 2 boutiques test", "Accord sur le principe", "Date de lancement"]},
            "contexte_appel": {"type": "suite_salon", "historique": "Rencontré au salon de la boulangerie-pâtisserie il y a 3 semaines", "infos_connues": "Réseau de 6 boulangeries, en croissance, très actif sur Instagram"}
        },
        "prospect": {
            "prenom": "Alexandre", "nom": "Petit", "genre": "M", "age": 36,
            "poste": "Directeur Général / Fondateur",
            "entreprise": {"nom": "Maison Petit — Artisan Boulanger", "secteur": "Boulangerie artisanale", "taille": "42 salariés (6 boutiques)", "ca": "3.8M€"},
            "traits": ["entrepreneur ambitieux", "digital-friendly", "obsédé par l'expérience client", "sensible à l'image de marque"],
            "style_communication": "Enthousiaste, visionnaire, mais veut du ROI rapide",
            "motivations": ["être le boulanger le plus innovant de la ville", "réduire les pertes en fin de journée"],
            "peurs": ["déshumaniser le rapport client", "complexité opérationnelle pour les vendeuses", "cannibaliser les ventes en boutique"],
            "situation": "6 boutiques dont 2 avec file d'attente énorme le week-end (perte de clients). Jette 5-8% de production le soir. Très présent sur Instagram (12K followers) mais pas de vente en ligne. Un concurrent local vient de lancer le click & collect.",
            "priorites": ["ouvrir une 7e boutique", "lancer un corner en gare"],
            "tics_langage": ["L'expérience client c'est sacré", "On est des artisans, pas une chaîne", "Mon concurrent fait déjà ça"],
            "objections": [
                {"verbatim": "349€ par boutique plus 2% de commission ? Ça monte vite sur 6 boutiques", "type": "sincere"},
                {"verbatim": "Si le client commande en ligne il ne vient plus flâner en boutique", "type": "sincere"},
                {"verbatim": "Mes vendeuses ont 50 ans, elles ne vont pas gérer un écran en plus", "type": "sincere"},
                {"verbatim": "Je veux garder mon identité artisanale, pas ressembler à une app de fast-food", "type": "sincere"},
                {"verbatim": "On teste sur une boutique d'abord, pas deux", "type": "tactique"}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════
    # SECTEUR 7 — IMMOBILIER / GESTION DE PATRIMOINE
    # ══════════════════════════════════════════════════════════════

    {
        "id": "IMMO-01",
        "secteur": "Immobilier",
        "type_simulation": "prospection_telephonique",
        "titre": "Logiciel gestion locative — Directrice agence immobilière",
        "vendeur": {
            "entreprise": {"nom": "ImmoPilot", "secteur": "Proptech / Logiciel immobilier", "description": "Solution SaaS de gestion locative automatisée pour agences et administrateurs de biens"},
            "offre": {"nom": "ImmoPilot Gestion", "description": "Gestion locative automatisée : quittances, relances impayés, régularisation charges, espace propriétaire/locataire", "proposition_valeur": "Automatise 80% des tâches de gestion. Relance impayés automatique = taux de recouvrement +25%.", "prix": "À partir de 4€/lot/mois", "references": ["Agence Duval Immobilier (350 lots) — 1 gestionnaire en moins", "Cabinet Leroy Patrimoine — impayés réduits de 35%"], "avantages_vs_concurrence": "Seul logiciel avec relance impayés automatique par SMS + email + courrier recommandé électronique"},
            "objectif_appel": {"type": "rdv_visio", "description": "Décrocher une démo visio de 30 min", "criteres_succes": ["Comprendre le nombre de lots gérés", "Identifier les irritants (impayés, relances, charges)", "Fixer une date de démo"]},
            "contexte_appel": {"type": "appel_froid", "historique": "Aucun contact", "infos_connues": "Agence immobilière centre-ville, gestion + transaction, ~200 lots gérés estimés"}
        },
        "prospect": {
            "prenom": "Valérie", "nom": "Moreau", "genre": "F", "age": 47,
            "poste": "Directrice d'agence",
            "entreprise": {"nom": "Moreau Immobilier", "secteur": "Agence immobilière gestion + transaction", "taille": "12 salariés", "ca": "1.2M€"},
            "traits": ["multitâche", "exigeante", "attachée à ses process", "relationnelle avec propriétaires"],
            "style_communication": "Professionnelle, parle vite, interrompt si pas intéressée",
            "motivations": ["automatiser les relances impayés", "dégager du temps pour la transaction (plus rentable)"],
            "peurs": ["migration des données depuis l'ancien logiciel", "propriétaires déstabilisés par un changement", "bugs comptables"],
            "situation": "Logiciel de gestion vieillissant (installé en 2012). 2 gestionnaires passent 60% de leur temps sur les relances impayés et les régularisations de charges. 8% d'impayés. Les propriétaires appellent sans cesse pour avoir leurs relevés.",
            "priorites": ["réduire les impayés", "développer l'activité transaction"],
            "tics_langage": ["Les propriétaires sont très exigeants", "Notre logiciel est vieux mais on le connaît", "La gestion c'est pas rentable mais ça fidélise"],
            "objections": [
                {"verbatim": "4€ par lot ça fait 800€/mois, plus cher que notre logiciel actuel", "type": "sincere"},
                {"verbatim": "Migrer 200 lots avec tout l'historique ? Ça va prendre des mois", "type": "sincere"},
                {"verbatim": "Mes gestionnaires connaissent le logiciel actuel par cœur", "type": "reflexe"},
                {"verbatim": "Les relances automatiques ça fait impersonnel, nos propriétaires n'aimeront pas", "type": "sincere"},
                {"verbatim": "On regarde ça en fin d'année avec le bilan", "type": "tactique"}
            ]
        }
    },

    {
        "id": "IMMO-02",
        "secteur": "Immobilier",
        "type_simulation": "barrage_secretaire",
        "titre": "Défiscalisation — Barrage assistante + DG promoteur",
        "vendeur": {
            "entreprise": {"nom": "PatriConseil", "secteur": "Conseil en gestion de patrimoine", "description": "Cabinet de conseil en investissement immobilier et optimisation fiscale pour chefs d'entreprise"},
            "offre": {"nom": "Audit Patrimonial Chef d'Entreprise", "description": "Audit complet : optimisation rémunération, investissement immobilier, préparation transmission", "proposition_valeur": "En moyenne 15K€/an d'économie fiscale pour les dirigeants de PME", "prix": "Audit offert, honoraires sur économie réalisée (success fee)", "references": ["DG de Maison Petit (boulangeries) — 22K€/an économisés", "Gérante de Lefèvre TP — transmission préparée en 18 mois"], "avantages_vs_concurrence": "Spécialiste dirigeants de PME, pas de produit maison, conseil indépendant"},
            "objectif_appel": {"type": "rdv_physique", "description": "Décrocher un déjeuner ou un RDV de 45 min", "criteres_succes": ["Passer la secrétaire", "Identifier la situation fiscale du dirigeant", "Fixer un RDV informel"]},
            "contexte_appel": {"type": "suite_recommandation", "historique": "Recommandé par l'expert-comptable du prospect", "infos_connues": "Promoteur immobilier local, DG fondateur, CA 15M€, probablement sur-imposé"}
        },
        "prospect_barrage": {
            "prenom": "Nadia", "nom": "Khelifi", "genre": "F", "age": 35,
            "poste": "Assistante de direction",
            "traits": ["efficace", "loyale", "filtre strict", "mais sensible à la recommandation de l'EC"],
            "objections_barrage": [
                {"verbatim": "M. Arnaud est très occupé, il ne prend pas de rendez-vous comme ça", "type": "reflexe"},
                {"verbatim": "Vous êtes conseiller en patrimoine ? Il en a déjà un.", "type": "filtre"},
                {"verbatim": "Envoyez un mail, je lui transmettrai", "type": "tactique"},
                {"verbatim": "Qui vous a donné ce numéro ?", "type": "filtre"}
            ]
        },
        "prospect": {
            "prenom": "Laurent", "nom": "Arnaud", "genre": "M", "age": 54,
            "poste": "Président-Directeur Général",
            "entreprise": {"nom": "Arnaud Promotion", "secteur": "Promotion immobilière", "taille": "25 salariés", "ca": "15M€"},
            "traits": ["entrepreneur pur", "travailleur acharné", "peu de temps pour le perso", "confiance dans son EC"],
            "style_communication": "Direct, pressé, teste les gens vite",
            "motivations": ["payer moins d'impôts", "préparer la transmission à ses enfants"],
            "peurs": ["se faire vendre un produit fiscal foireux", "prendre des risques sur son patrimoine"],
            "situation": "Rémunération 100% salaire (200K€/an), IR très lourd. Pas de holding. Patrimoine immobilier en nom propre. Pas de pacte Dutreil. 2 enfants qui ne reprendront probablement pas l'entreprise.",
            "priorites": ["livrer 2 programmes en cours", "trouver du foncier"],
            "tics_langage": ["Allez droit au but", "Combien ça me fait économiser concrètement ?", "Mon comptable m'a jamais parlé de ça"],
            "objections": [
                {"verbatim": "J'ai déjà un conseiller en patrimoine, merci", "type": "reflexe"},
                {"verbatim": "Les montages fiscaux ça finit toujours par un redressement", "type": "sincere"},
                {"verbatim": "Je n'ai pas le temps de m'occuper de ça en ce moment", "type": "sincere"},
                {"verbatim": "Success fee ? Donc vous prenez combien sur mes économies ?", "type": "sincere"}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════
    # SECTEUR 8 — TRANSPORT / LOGISTIQUE
    # ══════════════════════════════════════════════════════════════

    {
        "id": "LOG-01",
        "secteur": "Transport / Logistique",
        "type_simulation": "prospection_telephonique",
        "titre": "TMS / Gestion de flotte — Directeur d'exploitation transport",
        "vendeur": {
            "entreprise": {"nom": "FleetOptim", "secteur": "Éditeur TMS", "description": "Solution de gestion de flotte et optimisation de tournées pour transporteurs"},
            "offre": {"nom": "FleetOptim Route", "description": "TMS cloud + optimisation tournées IA + suivi temps réel + preuve de livraison digitale", "proposition_valeur": "Réduction de 15% du kilométrage à vide, gain de 2h/jour par chauffeur", "prix": "À partir de 35€/véhicule/mois", "references": ["Transports Maréchal (50 camions) — 18% de km en moins", "Express Loire — 2 tournées de plus par jour par chauffeur"], "avantages_vs_concurrence": "Seul TMS avec optimisation IA temps réel qui recalcule en cas d'imprévu"},
            "objectif_appel": {"type": "rdv_visio", "description": "Décrocher une démo visio avec l'exploitant", "criteres_succes": ["Comprendre la taille de la flotte", "Identifier les problèmes d'optimisation", "Fixer une date de démo"]},
            "contexte_appel": {"type": "appel_froid", "historique": "Aucun contact", "infos_connues": "Transporteur régional, 30 véhicules, messagerie et lots"}
        },
        "prospect": {
            "prenom": "Bruno", "nom": "Martinez", "genre": "M", "age": 49,
            "poste": "Directeur d'exploitation",
            "entreprise": {"nom": "Transports Martinez", "secteur": "Transport routier de marchandises", "taille": "55 salariés", "ca": "6M€"},
            "traits": ["terrain", "stressé", "pragmatique", "fidèle à ses outils"],
            "style_communication": "Direct, parle fort, pas de temps à perdre",
            "motivations": ["optimiser les tournées", "réduire le gazole"],
            "peurs": ["chauffeurs qui refusent le GPS", "panne du système en pleine tournée"],
            "situation": "Tournées planifiées sur un tableau blanc + Excel. 20% de km à vide. Gazole = 35% des charges. 3 chauffeurs partis cette année (conditions de travail). Pas de preuve de livraison autre que le bon papier.",
            "priorites": ["réduire la facture gazole", "fidéliser les chauffeurs"],
            "tics_langage": ["Sur la route c'est pas pareil qu'au bureau", "Mes chauffeurs sont pas des geeks", "Le gazole me tue"],
            "objections": [
                {"verbatim": "35€ par camion par mois ? Ça fait 1000€/mois, c'est un plein de gazole", "type": "sincere"},
                {"verbatim": "Mes chauffeurs ne veulent pas être fliqués par GPS", "type": "sincere"},
                {"verbatim": "On a un TMS, enfin... Excel quoi. Ça marche.", "type": "reflexe"},
                {"verbatim": "Votre IA elle connaît les routes de campagne et les restrictions poids lourds ?", "type": "test"},
                {"verbatim": "On change de logiciel de compta en ce moment, un truc à la fois", "type": "tactique"}
            ]
        }
    },

    {
        "id": "LOG-02",
        "secteur": "Transport / Logistique",
        "type_simulation": "rdv_one_to_one",
        "titre": "Solution WMS entrepôt — Responsable logistique e-commerce",
        "vendeur": {
            "entreprise": {"nom": "StockFlow", "secteur": "Éditeur WMS", "description": "Solution de gestion d'entrepôt pour PME e-commerce et distribution"},
            "offre": {"nom": "StockFlow Express", "description": "WMS cloud + picking optimisé + gestion multi-transporteurs + tableau de bord temps réel", "proposition_valeur": "Erreurs de préparation divisées par 10, capacité de traitement +40%", "prix": "À partir de 590€/mois", "references": ["BeautéBio.fr — erreurs passées de 5% à 0.3%", "SportDirect — Black Friday géré sans intérimaire en plus"], "avantages_vs_concurrence": "Seul WMS PME avec gestion multi-transporteurs intégrée et déploiement en 2 semaines"},
            "objectif_appel": {"type": "vente_directe", "description": "Signer un pilote de 3 mois", "criteres_succes": ["Démontrer le ROI sur les erreurs", "Valider la compatibilité CMS", "Obtenir un accord de principe"]},
            "contexte_appel": {"type": "suite_mail", "historique": "A téléchargé le livre blanc 'Préparer le Black Friday' il y a 2 semaines", "infos_connues": "E-commerce mode femme, 200 commandes/jour, entrepôt de 1500m²"}
        },
        "prospect": {
            "prenom": "Amandine", "nom": "Roux", "genre": "F", "age": 32,
            "poste": "Responsable Logistique",
            "entreprise": {"nom": "ModaChic.fr", "secteur": "E-commerce mode femme", "taille": "18 salariés", "ca": "4.5M€"},
            "traits": ["data-driven", "sous pression", "jeune manager", "ouverte à l'innovation mais veut des preuves"],
            "style_communication": "Structurée, aime les chiffres, pose beaucoup de questions",
            "motivations": ["réduire les retours clients (erreurs de préparation)", "gérer le pic de Noël sans craquer"],
            "peurs": ["que le WMS soit plus complexe que le problème", "intégration Shopify qui plante", "résistance des préparateurs"],
            "situation": "Préparation au papier (bon de commande imprimé). 4% d'erreurs de picking. 12% de retours dont la moitié liés à des erreurs. Black Friday = cauchemar logistique. Entrepôt désorganisé, pas d'adressage.",
            "priorites": ["être prête pour Noël", "réduire les retours"],
            "tics_langage": ["Montrez-moi les metrics", "Ça s'intègre avec Shopify ?", "Le Black Friday c'est dans 4 mois"],
            "objections": [
                {"verbatim": "590€/mois c'est plus que mon budget outil annuel", "type": "sincere"},
                {"verbatim": "2 semaines de déploiement en pleine saison c'est impossible", "type": "sincere"},
                {"verbatim": "Nos préparateurs n'ont jamais utilisé de PDA, c'est le carnet", "type": "sincere"},
                {"verbatim": "Ça marche avec Shopify et Colissimo ? Parce que notre dernière intégration...", "type": "test"},
                {"verbatim": "La DG veut qu'on investisse dans le marketing, pas dans la logistique", "type": "sincere"}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════
    # SECTEUR 9 — ÉNERGIE / ENVIRONNEMENT
    # ══════════════════════════════════════════════════════════════

    {
        "id": "ENR-01",
        "secteur": "Énergie / Environnement",
        "type_simulation": "prospection_telephonique",
        "titre": "Panneaux solaires industriels — Directeur de site agroalimentaire",
        "vendeur": {
            "entreprise": {"nom": "SolairePro", "secteur": "Énergie solaire B2B", "description": "Installation de centrales photovoltaïques sur toitures industrielles et commerciales"},
            "offre": {"nom": "SolairePro Industrie", "description": "Installation panneaux solaires sur toiture + autoconsommation + revente surplus + monitoring", "proposition_valeur": "Réduction de 30-40% de la facture électrique. Amortissement en 5-7 ans. Durée de vie 25 ans.", "prix": "Investissement 80-150K€ selon surface, ou location de toiture (0€ d'investissement)", "references": ["Fromagerie du Jura — facture EDF réduite de 35%", "Coopérative Fruits de Provence — autonomie à 60%"], "avantages_vs_concurrence": "Offre location de toiture : 0€ d'investissement, économies dès le 1er mois"},
            "objectif_appel": {"type": "rdv_physique", "description": "RDV sur site pour étude de faisabilité (gratuite)", "criteres_succes": ["Qualifier la surface de toiture", "Connaître la facture EDF annuelle", "Planifier une visite technique"]},
            "contexte_appel": {"type": "appel_froid", "historique": "Aucun contact", "infos_connues": "Site agroalimentaire avec grande toiture, zone industrielle, facture énergie probablement élevée (chambres froides)"}
        },
        "prospect": {
            "prenom": "Catherine", "nom": "Blanc", "genre": "F", "age": 51,
            "poste": "Directrice de site",
            "entreprise": {"nom": "Fromagerie Vallée Verte", "secteur": "Agroalimentaire / Fromage", "taille": "65 salariés", "ca": "11M€"},
            "traits": ["ingénieure de formation", "sensible à l'écologie", "contrainte par le groupe", "rigoureuse"],
            "style_communication": "Technique, structurée, veut des données vérifiables",
            "motivations": ["réduire l'empreinte carbone (objectif groupe)", "baisser la facture énergie (chambres froides = gouffre)"],
            "peurs": ["risque de fuite toiture après installation", "impact sur l'activité pendant les travaux", "engagement long terme"],
            "situation": "Facture EDF de 180K€/an dont 60% chambres froides. Objectif groupe : -30% carbone d'ici 2028. Toiture de 3000m² en bon état. Aucune installation solaire. Le directeur du groupe a mentionné le sujet en comité.",
            "priorites": ["audit énergétique demandé par le groupe", "modernisation chaîne de production"],
            "tics_langage": ["Envoyez-moi l'étude technique", "C'est quoi le LCOE ?", "Le groupe doit valider tout investissement > 50K€"],
            "objections": [
                {"verbatim": "Le groupe doit valider, ce n'est pas ma décision seule", "type": "sincere"},
                {"verbatim": "Si vous percez ma toiture et que j'ai une fuite dans la fromagerie...", "type": "sincere"},
                {"verbatim": "On peut pas arrêter la production pour des travaux", "type": "sincere"},
                {"verbatim": "Les panneaux c'est fabriqué en Chine, c'est pas très cohérent avec notre image bio", "type": "test"},
                {"verbatim": "On a déjà eu un démarcheur solaire, c'était du vent", "type": "reflexe"}
            ]
        }
    },

    {
        "id": "ENR-02",
        "secteur": "Énergie / Environnement",
        "type_simulation": "rdv_one_to_one",
        "titre": "Audit décret tertiaire — DG groupe hôtelier",
        "vendeur": {
            "entreprise": {"nom": "GreenTertiaire", "secteur": "Bureau d'études énergétique", "description": "Accompagnement conformité décret tertiaire et optimisation énergétique des bâtiments"},
            "offre": {"nom": "Pack Décret Tertiaire", "description": "Audit énergétique + plan d'actions + suivi OPERAT + accompagnement sur 3 ans", "proposition_valeur": "Conformité assurée (éviter l'amende de 7 500€/bâtiment). Économie moyenne de 25% sur les charges énergétiques.", "prix": "À partir de 8 000€ par bâtiment (audit + plan) + 200€/mois suivi", "references": ["Hôtel & Spa Belleville — conformité + 22% économies énergie", "Groupe Résid'Inn — 12 établissements accompagnés"], "avantages_vs_concurrence": "Spécialiste hôtellerie, connaissance fine des usages (CVC, piscines, cuisines)"},
            "objectif_appel": {"type": "vente_directe", "description": "Signer un contrat d'accompagnement pour 3 hôtels", "criteres_succes": ["Valider l'urgence réglementaire", "Chiffrer les économies potentielles", "Obtenir un bon de commande"]},
            "contexte_appel": {"type": "suite_mail", "historique": "Il a assisté à un webinaire 'Décret tertiaire et hôtellerie' il y a 1 mois", "infos_connues": "5 hôtels 3 étoiles en Auvergne-Rhône-Alpes, pas encore déclaré sur OPERAT"}
        },
        "prospect": {
            "prenom": "Éric", "nom": "Chambon", "genre": "M", "age": 58,
            "poste": "Directeur Général",
            "entreprise": {"nom": "Groupe Chambon Hôtels", "secteur": "Hôtellerie 3 étoiles", "taille": "85 salariés", "ca": "8M€"},
            "traits": ["patron à l'ancienne", "concentré sur le remplissage", "la réglementation l'agace", "sensible aux économies"],
            "style_communication": "Chaleureux mais impatient, aime les discussions concrètes",
            "motivations": ["éviter les amendes", "réduire les charges (énergie = 2e poste après le personnel)"],
            "peurs": ["travaux lourds pendant la saison", "coût disproportionné", "encore une réglementation inapplicable"],
            "situation": "5 hôtels, aucun déclaré sur OPERAT. Facture énergie totale : 320K€/an. Bâtiments des années 80-90, mal isolés. Chauffage fioul sur 2 hôtels. L'échéance 2030 du décret tertiaire (-40% conso) semble inatteignable.",
            "priorites": ["saison été à remplir", "rénovation de l'hôtel de Vichy"],
            "tics_langage": ["Encore une usine à gaz réglementaire", "Combien ça coûte et combien ça rapporte", "Mes hôtels ont 40 ans, on va pas tout refaire"],
            "objections": [
                {"verbatim": "8000€ par hôtel ? Pour 5 hôtels ça fait 40 000€ juste pour l'audit", "type": "sincere"},
                {"verbatim": "Le décret tertiaire personne le contrôle, c'est comme le DPE", "type": "sincere"},
                {"verbatim": "-40% de conso ? Avec des bâtiments des années 80 c'est impossible", "type": "sincere"},
                {"verbatim": "On verra après la saison, là je remplis mes hôtels", "type": "tactique"},
                {"verbatim": "Mon comptable m'a dit qu'on avait encore le temps", "type": "reflexe"}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════
    # SECTEUR 10 — FORMATION / ÉDUCATION / RH
    # ══════════════════════════════════════════════════════════════

    {
        "id": "FORM-01",
        "secteur": "Formation / RH",
        "type_simulation": "prospection_telephonique",
        "titre": "Formation commerciale (meta !) — DRH PME tech",
        "vendeur": {
            "entreprise": {"nom": "VendMieux", "secteur": "Formation commerciale IA", "descriannée. Taux de closing en baisse (18% → 12%). Dernière formation présentielle il y a 1 an (8K€, 2 jours, aucun suivi). Le VP Sales se plaint du niveau.",
            "priorites": ["onboarding des nouveaux SDR", "préparer le plan de formation 2027"],
            "tics_langage": ["C'est quoi le ROI ?", "Les commerciaux vont-ils vraiment l'utiliser ?", "On a un budget OPCO à utiliser"],
            "objections": [
                {"verbatim": "49€ par commercial c'est 600€/mois. Le VP Sales préfère un formateur terrain.", "type": "sincere"},
                {"verbatim": "Mes commerciaux vont trouver ça gadget, ils veulent du terrain pas un robot", "type": "sincere"},
                {"verbatim": "On a déjà Gong pour analyser les appels, c'est pas la même chose ?", "type": "test"},
                {"verbatim": "Les données de performance sont sensibles, c'est hébergé où ?", "type": "sincere"},
                {"verbatim": "Je dois en parler au VP Sales, ce n'est pas ma décision seule", "type": "sincere"}
            ]
        }
    },

    {
        "id": "FORM-02",
        "secteur": "Formation / RH",
        "type_simulation": "rdv_one_to_one",
        "titre": "Solution de recrutement IA — DG cabinet de recrutement",
        "vendeur": {
            "entreprise": {"nom": "RecrутIA", "secteur": "HR Tech", "description": "Plateforme de pré-qualification de candidats par IA conversationnelle"},
            "offre": {"nom": "RecrutIA Screen", "description": "IA vocale qui pré-qualifie les candidats 24/7 : entretien structuré, scoring, synthèse pour le recruteur", "proposition_valeur": "Tri de 80% des candidatures en automatique. Gain de 3h/recruteur/jour.", "prix": "590€/mois pour 3 recruteurs + 2€/entretien IA", "references": ["Cabinet Talent First — 250 entretiens IA/mois, 3 recruteurs libérés", "Adecco régional — time-to-hire réduit de 40%"], "avantages_vs_concurrence": "Seule IA de pré-qualification vocale (pas chatbot), personnalisable par poste"},
            "objectif_appel": {"type": "vente_directe", "description": "Signer un pilote de 2 mois sur un type de poste", "criteres_succes": ["Valider le volume de recrutement", "Identifier un poste type pour le pilote", "Obtenir un accord et une date"]},
            "contexte_appel": {"type": "suite_salon", "historique": "Croisé au salon RH Solutions il y a 3 semaines. Intéressé mais sceptique.", "infos_connues": "Cabinet de recrutement spécialisé IT, 15 consultants, 200 missions/an"}
        },
        "prospect": {
            "prenom": "Stéphane", "nom": "Girard", "genre": "M", "age": 44,
            "poste": "Directeur Général / Fondateur",
            "entreprise": {"nom": "IT Talents", "secteur": "Cabinet de recrutement IT", "taille": "20 salariés", "ca": "3M€"},
            "traits": ["entrepreneur", "technophile mais méfiant de l'IA qui remplace l'humain", "compétitif", "orienté qualité"],
            "style_communication": "Vif, challenge tout, aime débattre, respecte ceux qui tiennent tête",
            "motivations": ["traiter plus de missions sans recruter", "se différencier des concurrents"],
            "peurs": ["que l'IA fasse fuir les bons candidats", "perdre le contact humain qui fait sa réputation", "dépendance technologique"],
            "situation": "200 missions/an mais en refuse 50 par manque de bande passante. Chaque consultant passe 40% de son temps en pré-qualification téléphonique. Les candidats IT sont sollicités de partout, le temps de réponse est critique.",
            "priorites": ["augmenter le volume sans recruter", "réduire le time-to-hire"],
            "tics_langage": ["Le recrutement c'est de l'humain, pas de l'algorithme", "Mes clients paient pour MON expertise", "Si l'IA se trompe, c'est ma réputation"],
            "objections": [
                {"verbatim": "Un dev senior qui se fait interviewer par un robot, il raccroche et va chez mon concurrent", "type": "sincere"},
                {"verbatim": "590€ plus 2€ par entretien, à 200 missions ça chiffre vite", "type": "sincere"},
                {"verbatim": "Comment votre IA évalue le fit culturel ? Le feeling ?", "type": "test"},
                {"verbatim": "Mes clients paient pour du conseil humain, pas pour de l'automatisation", "type": "sincere"},
                {"verbatim": "Montrez-moi un cabinet de recrutement IT qui l'utilise, pas une agence d'intérim", "type": "test"}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════
    # SECTEUR 11 — JURIDIQUE / PROFESSIONS LIBÉRALES
    # ══════════════════════════════════════════════════════════════

    {
        "id": "JURI-01",
        "secteur": "Juridique",
        "type_simulation": "prospection_telephonique",
        "titre": "Legal tech / Gestion cabinet — Avocate associée",
        "vendeur": {
            "entreprise": {"nom": "LexiPilot", "secteur": "Legal tech", "description": "Solution de gestion de cabinet d'avocats : dossiers, temps passé, facturation, relation client"},
            "offre": {"nom": "LexiPilot Avocats", "description": "Gestion dossiers + time tracking automatique + facturation + CRM client + portail client sécurisé", "proposition_valeur": "Récupération de 30% du temps non facturé. Facturation en 1 clic.", "prix": "À partir de 89€/avocat/mois", "references": ["Cabinet Martin & Associés (8 avocats) — temps facturé +25%", "Maître Leroy — facturation automatisée, encours réduit de 40%"], "avantages_vs_concurrence": "Seul logiciel avec time tracking automatique basé sur l'activité (mails, docs, appels)"},
            "objectif_appel": {"type": "rdv_visio", "description": "Décrocher une démo visio de 30 min", "criteres_succes": ["Comprendre l'outil actuel", "Identifier les irritants (temps non facturé, facturation)", "Fixer une date de démo"]},
            "contexte_appel": {"type": "appel_froid", "historique": "Aucun contact", "infos_connues": "Cabinet d'avocats droit des affaires, 5 associés, centre-ville"}
        },
        "prospect": {
            "prenom": "Hélène", "nom": "Rivière", "genre": "F", "age": 46,
            "poste": "Avocate associée / Managing partner",
            "entreprise": {"nom": "Cabinet Rivière & Partners", "secteur": "Droit des affaires / M&A", "taille": "15 personnes (5 associés, 5 collaborateurs, 5 assistants)", "ca": "2.5M€"},
            "traits": ["brillante", "exigeante", "time is money", "confidentialité obsessionnelle"],
            "style_communication": "Précise, rapide, ne supporte pas l'approximation",
            "motivations": ["facturer plus de temps réellement travaillé", "avoir une vision claire de la rentabilité par dossier"],
            "peurs": ["faille de sécurité sur les données clients", "rigidité de l'outil vs process du cabinet", "temps de migration"],
            "situation": "Gestion sur un vieux logiciel + Excel. Estime perdre 20-30% du temps facturable. Facturation en retard chronique. Les associés ne remplissent pas leurs time sheets. Un collaborateur est parti chez un concurrent qui avait de meilleurs outils.",
            "priorites": ["recruter 2 collaborateurs", "rentrer un gros client corporate"],
            "tics_langage": ["C'est hébergé où ? En France ?", "La confidentialité c'est non négociable", "Je facture 300€/h, chaque minute compte"],
            "objections": [
                {"verbatim": "89€ par avocat pour 10 avocats ça fait 900€/mois. Justifiez.", "type": "sincere"},
                {"verbatim": "Où sont hébergées les données ? On a des dossiers sensibles, M&A, contentieux", "type": "sincere"},
                {"verbatim": "Notre logiciel actuel est vieux mais on le connaît par cœur", "type": "reflexe"},
                {"verbatim": "Les avocats ne sont pas des commerciaux, on ne va pas tracker notre temps comme des consultants", "type": "sincere"},
                {"verbatim": "Envoyez-moi une documentation complète, je lirai quand j'aurai le temps", "type": "tactique"}
            ]
        }
    },

    # ══════════════════════════════════════════════════════════════
    # SECTEUR 12 — AGRICULTURE / VITICULTURE
    # ══════════════════════════════════════════════════════════════

    {
        "id": "AGRI-01",
        "secteur": "Agriculture / Viticulture",
        "type_simulation": "prospection_telephonique",
        "titre": "Solution de traçabilité viticole — Directeur de domaine viticole",
        "vendeur": {
            "entreprise": {"nom": "VitiTrack", "secteur": "AgriTech / Viticulture", "description": "Solution digitale de traçabilité parcellaire et gestion viticole"},
            "offre": {"nom": "VitiTrack Pro", "description": "Appli mobile de suivi parcellaire + traçabilité vendange + cahier de cave digital + export douanes automatique", "proposition_valeur": "Conformité réglementaire en 1 clic, traçabilité parcelle-to-bouteille, gain de 2h/jour en saison", "prix": "À partir de 149€/mois", "references": ["Domaine de la Roche (35 ha) — contrôle douanes passé sans stress", "Château Bellevue — vendanges tracées au GPS, zéro erreur assemblage"], "avantages_vs_concurrence": "Seule appli viticole avec export DRM automatique et suivi GPS des vendanges"},
            "objectif_appel": {"type": "rdv_physique", "description": "RDV au domaine pour démo pendant les travaux de cave", "criteres_succes": ["Comprendre la taille du domaine", "Identifier les galères réglementaires", "Fixer une date de visite"]},
            "contexte_appel": {"type": "appel_froid", "historique": "Aucun contact", "infos_connues": "Domaine viticole AOC, 25 hectares, vente directe + négoce"}
        },
        "prospect": {
            "prenom": "Jean-Pierre", "nom": "Fabre", "genre": "M", "age": 61,
            "poste": "Propriétaire / Directeur du domaine",
            "entreprise": {"nom": "Domaine Fabre", "secteur": "Viticulture AOC", "taille": "8 salariés permanents + saisonniers", "ca": "800K€"},
            "traits": ["ancré dans la tradition", "méfiant envers le digital", "fier de son terroir", "sensible à la transmission"],
            "style_communication": "Lent, réfléchi, aime raconter l'histoire de son domaine",
            "motivations": ["simplifier la paperasse douanes/DRM", "préparer la reprise par sa fille"],
            "peurs": ["que la technologie dénature le métier", "coût vs bénéfice pour un petit domaine"],
            "situation": "Cahier de cave papier. DRM remplies à la main (3h/mois). Dernier contrôle douanes stressant (manquait une fiche parcellaire). Sa fille (30 ans, école de commerce) veut moderniser. Lui résiste mais sait que c'est nécessaire.",
            "priorites": ["vendanges dans 2 mois", "préparer la transmission"],
            "tics_langage": ["On fait du vin, pas de l'informatique", "Mon père faisait comme ça", "Ma fille me dit la même chose que vous"],
            "objections": [
                {"verbatim": "149€/mois ? Pour un domaine de 25 hectares c'est beaucoup", "type": "sincere"},
                {"verbatim": "Je n'ai pas de réseau au milieu des vignes", "type": "sincere"},
                {"verbatim": "Mon cahier de cave papier c'est 40 ans d'histoire", "type": "sincere"},
                {"verbatim": "Les douanes ne m'ont jamais sanctionné", "type": "reflexe"},
                {"verbatim": "Rappelez après les vendanges, là c'est pas le moment", "type": "tactique"}
            ]
        }
    },
]


# ══════════════════════════════════════════════════════════════
# STATISTIQUES DE LA BASE
# ══════════════════════════════════════════════════════════════

"""
TOTAL : 20 scénarios

RÉPARTITION PAR TYPE :
- Prospection téléphonique : 10
- RDV one-to-one : 7
- Barrage secrétaire : 2
- Multi-interlocuteurs : 1

RÉPARTITION PAR GENRE (prospect principal) :
- Hommes : 10 (Olivier, Marc, Jean-Marc, Philippe, Franck, Bruno, Éric, Laurent, Stéphane, Jean-Pierre)
- Femmes : 10 (Nathalie, Sophie, Émilie, Sandrine, Claire, Fatima, Valérie, Catherine, Amandine, Marine, Hélène)

RÉPARTITION PAR SECTEUR :
- Industrie : 3 (IND-01, IND-02, IND-03)
- Services / Conseil : 2 (SRV-01, SRV-02)
- Tech / SaaS : 2 (TECH-01, TECH-02)
- BTP / Construction : 2 (BTP-01, BTP-02)
- Santé / Médico-social : 2 (SANTE-01, SANTE-02)
- Commerce / Restauration : 2 (COM-01, COM-02)
- Immobilier : 2 (IMMO-01, IMMO-02)
- Transport / Logistique : 2 (LOG-01, LOG-02)
- Énergie / Environnement : 2 (ENR-01, ENR-02)
- Formation / RH : 2 (FORM-01, FORM-02)
- Juridique : 1 (JURI-01)
- Agriculture / Viticulture : 1 (AGRI-01)

RÉPARTITION PAR ÂGE :
- 30-39 ans : 5 (Émilie 34, Marine 35, Nadia 35, Amandine 32, Alexandre 36)
- 40-49 ans : 8 (Nathalie 45, Sophie 38, Sandrine 41, Fatima 43, Claire 39, Valérie 47, Christine 47, Stéphane 44, Hélène 46)
- 50-59 ans : 6 (Olivier 52, Marc 55, Philippe 56, Jean-Marc 58, Éric 58, Catherine 51, Laurent 54, Bruno 49)
- 60+ : 1 (Jean-Pierre 61)

DIVERSITÉ DES NOMS :
- Origine française classique + diversité (Fatima Benali, Nadia Khelifi, Bruno Martinez)

SCÉNARIO META :
- FORM-01 = vendre VendMieux lui-même ! Le commercial s'entraîne à vendre le produit qu'il utilise.

PROCHAINES EXTENSIONS POSSIBLES :
- Scénarios multi-interlocuteurs supplémentaires (comité d'achat, soutenance, duo DG+DAF)
- Négociation pure (le prospect veut acheter mais négocie le prix)
- Relance de devis (le prospect a reçu un devis il y a 3 semaines et ne rappelle pas)
- Gestion de réclamation (le client est mécontent, il faut sauver le contrat)
- Vente additionnelle / upsell (client existant, proposer un upgrade)
"""