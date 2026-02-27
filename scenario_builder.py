"""
VendMieux — ScenarioBuilder
Point d'entrée unique pour normaliser tout scénario.
Garantit cohérence genre/voix/type/difficulté
que ce soit DB, fichier JSON, ou création IA.
"""


# --- Instructions de difficulté (comportement du prospect) ---
DIFFICULTY_INSTRUCTIONS = {
    1: """NIVEAU DÉBUTANT — Prospect accessible :
- Tu es de bonne humeur, disponible, poli
- Tu laisses le commercial finir ses phrases
- Tes objections sont simples et classiques : prix, délai, besoin de réfléchir
- Tu acceptes un RDV après 2-3 échanges convaincants
- Tu ne coupes pas la parole
- Tu donnes des indices clairs sur ta douleur
- Si le commercial fait une bonne accroche, tu deviens rapidement réceptif
- Tu peux être convaincu en 3-4 minutes""",
    2: """NIVEAU INTERMÉDIAIRE — Prospect neutre :
- Tu es occupé mais pas hostile
- Tu laisses le commercial parler mais tu poses des questions précises
- 2-3 objections réelles que tu maintiens jusqu'à preuve convaincante
- Tu demandes des références ou des chiffres avant de t'engager
- Tu peux raccrocher si l'accroche est nulle
- Ta douleur cachée n'émerge qu'après au moins 3 bonnes questions de découverte
- Tu peux être convaincu en 6-8 minutes avec les bons arguments""",
    3: """NIVEAU AVANCÉ — Prospect difficile :
- Tu es méfiant, pressé, sceptique
- Tu coupes la parole si c'est trop long
- Tes objections sont dures et enchaînées : tu ne lâches pas facilement
- Tu demandes des cas chiffrés PRÉCIS dans TON secteur — tu refuses le générique
- Tu peux raccrocher sans prévenir après 2 minutes si pas d'accroche
- Ta douleur cachée est profondément enfouie, elle n'émerge QUE si le commercial creuse avec au moins 4-5 bonnes questions
- Tu as un préjugé négatif sur les commerciaux ('encore un qui veut me vendre quelque chose')
- Tipping point difficile : nécessite une preuve concrète + un engagement de résultat
- Tu peux être convaincu mais ça prend 10-15 minutes de travail sérieux""",
}

# --- Voix TTS par genre (Google Cloud TTS — Chirp3-HD) ---
VOIX_FEMININES = [
    'fr-FR-Chirp3-HD-Kore',
    'fr-FR-Chirp3-HD-Aoede',
    'fr-FR-Chirp3-HD-Leda',
]
VOIX_MASCULINES = [
    'fr-FR-Chirp3-HD-Charon',
    'fr-FR-Chirp3-HD-Orus',
    'fr-FR-Chirp3-HD-Puck',
]

# --- Prénoms français avec genre connu ---
_PRENOMS_F = {
    'sophie', 'marie', 'nathalie', 'claire', 'isabelle', 'amandine', 'julie',
    'anne', 'céline', 'celine', 'valérie', 'valerie', 'sylvie', 'florence',
    'sarah', 'camille', 'charlotte', 'emma', 'lucie', 'manon', 'chloé', 'chloe',
    'léa', 'pauline', 'virginie', 'audrey', 'cécile', 'cecile', 'inès',
    'stéphanie', 'stephanie', 'véronique', 'veronique', 'sandrine', 'brigitte',
    'nadine', 'laurence', 'émilie', 'emilie', 'delphine', 'carole', 'patricia',
    'christine', 'dominique', 'michèle', 'françoise', 'francoise', 'agnès',
    'martine', 'sylviane', 'corinne', 'béatrice', 'beatrice', 'geneviève',
    'monique', 'josiane', 'catherine', 'caroline', 'aurélie', 'aurelie',
    'laura', 'marine', 'élodie', 'elodie', 'nicole', 'agathe', 'jade',
    'alice', 'lina', 'fatima', 'aïcha', 'aicha', 'mélanie', 'melanie',
    'mathilde',
}

_PRENOMS_M = {
    'laurent', 'marc', 'jean', 'pierre', 'thomas', 'michel', 'philippe',
    'stéphane', 'stephane', 'frédéric', 'frederic', 'olivier', 'nicolas',
    'christophe', 'david', 'patrick', 'alain', 'éric', 'eric', 'thierry',
    'bernard', 'françois', 'francois', 'yves', 'jacques', 'gilles', 'rémi',
    'remi', 'mathieu', 'julien', 'antoine', 'bruno', 'vincent', 'sébastien',
    'sebastien', 'mehdi', 'karim', 'yannick', 'guillaume', 'fabrice', 'jérôme',
    'jerome', 'pascal', 'hervé', 'herve', 'arnaud', 'didier', 'serge', 'denis',
    'emmanuel', 'raphaël', 'raphael', 'maxime', 'benjamin', 'alexandre', 'paul',
    'louis', 'hugo', 'lucas', 'léo', 'arthur', 'adam', 'gabriel', 'nathan',
    'théo', 'ethan', 'noah', 'franck', 'matthieu', 'bertrand', 'sylvain',
    'étienne', 'rachid', 'gérard', 'gerard', 'jean-marc', 'jean-pierre',
    'jean-luc', 'jean-paul', 'jean-françois',
}

# --- Féminisation des postes ---
# Ordre : du plus spécifique au plus général.
# Chaque règle est appliquée indépendamment (pas de break).
_FEMINISATION = [
    ('Directeur général', 'Directrice générale'),
    ('Directeur Général', 'Directrice Générale'),
    ('Directeur commercial', 'Directrice commerciale'),
    ('Directeur Commercial', 'Directrice Commerciale'),
    ('Directeur technique', 'Directrice technique'),
    ('Directeur Technique', 'Directrice Technique'),
    ('Directeur financier', 'Directrice financière'),
    ('Directeur Financier', 'Directrice Financière'),
    ('Directeur', 'Directrice'),
    ('Gérant', 'Gérante'),
    ('Président', 'Présidente'),
    ('Chef', 'Cheffe'),
    ('Associé', 'Associée'),
    ('Expert-comptable', 'Experte-comptable'),
    ('Expert-Comptable', 'Experte-Comptable'),
    ('Responsable commercial', 'Responsable commerciale'),
    ('Responsable Commercial', 'Responsable Commerciale'),
    ('Commercial', 'Commerciale'),
]

# Types de simulation téléphoniques
_PHONE_TYPES = {
    'prospection_telephonique',
    'barrage_secretaire',
    'relance_devis',
    'appel_froid',
    'relance',
    'appel_entrant',
    'upsell',
    'gestion_reclamation',
}

# Types de simulation physiques / présentiel
_PHYSICAL_TYPES = {
    'rdv_physique',
    'rdv_one_to_one',
    'multi_interlocuteurs',
    'negociation',
    'decouverte',
}


class ScenarioBuilder:
    """Point d'entrée unique pour tout scénario.
    Garantit cohérence genre/voix/type/difficulté
    que ce soit DB, fichier JSON, ou création IA."""

    def build(self, scenario_raw: dict) -> dict:
        """
        Input : données brutes depuis n'importe quelle source
                (fichier JSON, SQLite, génération IA)
        Output : scénario normalisé avec genre, voix, type, difficulté

        NOTE : Seuls les champs dérivés sont ajoutés/normalisés.
        Le scénario brut est conservé intact pour les consumers
        existants (build_system_prompt, etc.)
        """
        scenario = dict(scenario_raw)

        # 1. PERSONAS — normaliser le genre
        persona = scenario.get('persona', {})
        scenario['persona'] = self._normalize_persona(persona)

        persona_2 = scenario.get('persona_2')
        if persona_2:
            scenario['persona_2'] = self._normalize_persona(persona_2)

        # 2. TYPE CONTACT — dérivé du type_simulation
        type_sim = (
            scenario.get('simulation', {}).get('type')
            or scenario_raw.get('type_simulation', '')
            or scenario_raw.get('metadata', {}).get('type_simulation', '')
        )
        scenario['_is_phone'] = type_sim in _PHONE_TYPES
        scenario['_is_physical'] = type_sim in _PHYSICAL_TYPES
        scenario['_is_multi'] = (
            persona_2 is not None
            and 'persona_2' in scenario
        )

        # 3. VOIX TTS — calculées ici, UNE SEULE FOIS
        genre_1 = self._get_persona_genre(scenario['persona'])
        scenario['_tts_voice_1'] = self._get_voice(genre_1)

        if scenario['_is_multi']:
            genre_2 = self._get_persona_genre(scenario['persona_2'])
            scenario['_tts_voice_2'] = self._get_voice(
                genre_2, exclude=scenario['_tts_voice_1']
            )

        # 4. DIFFICULTÉ
        diff = (
            scenario.get('simulation', {}).get('difficulte')
            or scenario_raw.get('difficulty_default')
            or scenario_raw.get('metadata', {}).get('difficulte_defaut')
            or 2
        )
        scenario['_difficulty'] = max(1, min(3, int(diff)))
        scenario['_difficulty_instructions'] = (
            DIFFICULTY_INSTRUCTIONS[scenario['_difficulty']]
        )

        # 5. TYPE SIMULATION (normaliser)
        scenario['_type_simulation'] = type_sim
        scenario['_secteur'] = self._get_secteur(scenario)

        # 6. AUDIO DÉMARRAGE
        if scenario['_is_phone']:
            scenario['_start_sound'] = 'phone-ring.mp3'
        elif scenario['_is_physical']:
            scenario['_start_sound'] = 'office-ambiance.mp3'
        else:
            scenario['_start_sound'] = None

        return scenario

    def _normalize_persona(self, persona: dict) -> dict:
        """Normalise le genre dans un persona et féminise le poste si nécessaire."""
        identite = persona.get('identite', {})
        prenom = identite.get('prenom', '')

        # Déterminer le genre
        genre_existant = identite.get('genre')
        if genre_existant:
            genre = genre_existant
        else:
            genre = self._detect_genre(prenom)
            identite['genre'] = genre

        # Féminiser le poste si nécessaire
        if genre == 'F':
            poste = identite.get('poste', '')
            identite['poste'] = self._feminiser_poste(poste)

        persona['identite'] = identite
        return persona

    def _get_persona_genre(self, persona: dict) -> str:
        """Récupère le genre d'un persona déjà normalisé."""
        return persona.get('identite', {}).get('genre', 'M')

    def _get_secteur(self, scenario: dict) -> str:
        """Extrait le secteur depuis n'importe quelle structure."""
        # Niveau racine (scénarios DB enrichis)
        s = scenario.get('secteur')
        if s:
            return s
        # Depuis persona.identite.entreprise
        ent = scenario.get('persona', {}).get('identite', {}).get('entreprise', {})
        if isinstance(ent, dict):
            return ent.get('secteur', '')
        return ''

    def _detect_genre(self, prenom: str) -> str:
        """Détecte le genre par lookup prénom. Fallback M."""
        p = prenom.strip().lower()
        if p in _PRENOMS_F:
            return 'F'
        if p in _PRENOMS_M:
            return 'M'
        # Prénom inconnu → fallback M (pas d'appel LLM ici)
        return 'M'

    def _feminiser_poste(self, poste: str) -> str:
        """Féminise un intitulé de poste."""
        for masc, fem in _FEMINISATION:
            if masc in poste:
                poste = poste.replace(masc, fem)
                return poste  # Règles ordonnées du plus spécifique au plus général
        return poste

    def _get_voice(self, genre: str, exclude: str = None) -> str:
        """Sélectionne une voix TTS selon le genre, en excluant optionnellement une voix."""
        voix_list = VOIX_FEMININES if genre == 'F' else VOIX_MASCULINES
        for voix in voix_list:
            if voix != exclude:
                return voix
        return voix_list[0]


# Instance globale utilisée partout
scenario_builder = ScenarioBuilder()
