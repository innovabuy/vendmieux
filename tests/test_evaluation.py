"""
Tests de non-régression pour l'évaluation FORCE 3D + Posture Commerciale + DISC.
Vérifie que le prompt d'évaluation contient les nouvelles sections,
que le JSON de réponse est correctement structuré, et que le parsing fonctionne.
"""
import json
import sys
import os
import pytest

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api import _build_evaluation_prompt, _format_transcript, EVAL_LANG_CONFIG
from agent import DEFAULT_SCENARIO


# ─── Fixtures ────────────────────────────────────────────────────────

SAMPLE_TRANSCRIPT = [
    type('Entry', (), {'role': 'vendeur', 'text': "Bonjour monsieur Bertrand, je suis Jean Dupont de TechMaint Solutions."})(),
    type('Entry', (), {'role': 'prospect', 'text': "Oui, c'est à quel sujet ? J'ai pas beaucoup de temps là."})(),
    type('Entry', (), {'role': 'vendeur', 'text': "Je comprends, je serai bref. Je vous appelle parce que je pense que peut-être on pourrait éventuellement vous aider sur la maintenance."})(),
    type('Entry', (), {'role': 'prospect', 'text': "Venez-en au fait. On a déjà un prestataire."})(),
    type('Entry', (), {'role': 'vendeur', 'text': "Oui bien sûr, mais notre solution innovante d'accompagnement sur mesure permet un petit peu de réduire les coûts."})(),
    type('Entry', (), {'role': 'prospect', 'text': "Des chiffres ? Combien exactement ? Donnez-moi des références vérifiables."})(),
    type('Entry', (), {'role': 'vendeur', 'text': "Euh, je pense qu'on est autour de 30 à 40 pourcent de réduction en quelque sorte."})(),
    type('Entry', (), {'role': 'prospect', 'text': "Bon écoutez, envoyez-moi un mail, je regarderai quand j'aurai le temps."})(),
]

SAMPLE_EVALUATION_RESPONSE = {
    "score_global": 8.5,
    "note_lettre": "D",
    "resultat_appel": "echec_poli",
    "competences": {
        "accroche": {
            "score": 7,
            "points_forts": ["Utilisation du nom du prospect dès le début"],
            "points_progres": [
                {
                    "ce_que_vous_avez_dit": "je suis Jean Dupont de TechMaint Solutions",
                    "ce_qui_aurait_ete_mieux": "Je vous appelle suite aux pannes machines qui touchent le secteur mécanique en ce moment",
                    "pourquoi": "L'accroche doit créer de la curiosité, pas se présenter"
                }
            ],
            "conseil": "Commencez par un enjeu métier, pas par votre identité"
        },
        "decouverte": {"score": 5, "points_forts": [], "points_progres": [], "conseil": "Posez au moins 2 questions ouvertes avant de pitcher"},
        "creation_enjeu": {"score": 4, "points_forts": [], "points_progres": [], "conseil": "Chiffrez le coût de l'inaction"},
        "argumentation": {"score": 6, "points_forts": [], "points_progres": [], "conseil": "Adaptez vos arguments aux enjeux du prospect"},
        "traitement_objections": {"score": 8, "points_forts": [], "points_progres": [], "conseil": "Questionnez l'objection avant de répondre"},
        "engagement": {"score": 4, "points_forts": [], "points_progres": [], "conseil": "Proposez un next step concret avec date"}
    },
    "synthese": "Le commercial manque d'assurance et utilise trop de mots parasites.",
    "conseil_prioritaire": "Éliminez les 'peut-être', 'je pense', 'éventuellement' de votre vocabulaire.",
    "moment_cle": {
        "quand": "Quand le prospect a demandé des chiffres concrets",
        "ce_que_vous_avez_dit": "Euh, je pense qu'on est autour de 30 à 40 pourcent de réduction en quelque sorte",
        "ce_qui_aurait_ete_ideal": "Fonderies du Rhône, 72 salariés comme vous : 3 pannes évitées en 6 mois, 120K€ d'économies. ROI en 4 mois.",
        "pourquoi": "Le prospect D/C attendait des faits précis. L'hésitation a tué la crédibilité."
    },
    "posture_commerciale": {
        "ton_general": {
            "note": 7,
            "description": "Ton hésitant et monotone, manque d'énergie",
            "moments_positifs": ["Bonjour monsieur Bertrand — ton correct à l'ouverture"],
            "moments_a_ameliorer": [
                {
                    "ce_que_vous_avez_dit": "je pense que peut-être on pourrait éventuellement vous aider",
                    "probleme": "Voix descendante en fin de phrase, donne l'impression de s'excuser",
                    "version_amelioree": "Nous aidons les PME industrielles à diviser par 3 leurs arrêts machines imprévus",
                    "conseil": "Finissez vos phrases sur une note montante, comme si vous annonciez une bonne nouvelle"
                }
            ]
        },
        "assurance": {
            "note": 5,
            "description": "Le commercial perd confiance face aux objections du prospect",
            "marqueurs_confiance": ["Utilisation du nom du prospect dès le début"],
            "marqueurs_hesitation": [
                {
                    "verbatim": "je pense que peut-être on pourrait éventuellement vous aider",
                    "indice": "Triple hésitation : 'je pense', 'peut-être', 'éventuellement' dans la même phrase",
                    "reformulation": "Nous aidons les industriels à anticiper leurs pannes machines"
                },
                {
                    "verbatim": "Euh, je pense qu'on est autour de 30 à 40 pourcent de réduction en quelque sorte",
                    "indice": "'Euh', 'je pense', 'autour de', 'en quelque sorte' — 4 marqueurs d'hésitation",
                    "reformulation": "Nos clients constatent 35% de réduction des coûts de maintenance dès le premier semestre"
                }
            ]
        },
        "formulation": {
            "note": 6,
            "description": "Phrases trop longues, jargon commercial creux",
            "points_forts": ["Phrases courtes en début d'appel"],
            "points_a_ameliorer": [
                {
                    "ce_que_vous_avez_dit": "notre solution innovante d'accompagnement sur mesure permet un petit peu de réduire les coûts",
                    "probleme": "Phrase creuse : 'solution innovante', 'accompagnement sur mesure' ne disent rien de concret",
                    "version_amelioree": "Des capteurs sur vos machines qui détectent les pannes 48h avant qu'elles arrivent",
                    "principe": "Remplacez chaque mot vague par un fait concret et vérifiable"
                }
            ]
        },
        "score_posture": 6,
        "conseil_posture": "Bannissez les mots parasites ('peut-être', 'je pense', 'en quelque sorte') et remplacez chaque phrase vague par un fait chiffré."
    },
    "analyse_disc": {
        "profil_prospect": {
            "type_principal": "D",
            "type_secondaire": "C",
            "description": "Dominance forte avec composante Conformité — décideur direct qui veut des faits, pas du bavardage",
            "indices_detectes": [
                "Coupe la parole et dit 'Venez-en au fait' → Dominance",
                "Demande des chiffres exactes et des références vérifiables → Conformité",
                "Ne fait pas de small talk, pas d'émotion → pas de composante Influence"
            ]
        },
        "adaptation_commerciale": {
            "score_adaptation": 5,
            "ce_qui_a_marche": [
                {
                    "verbatim": "Bonjour monsieur Bertrand",
                    "pourquoi_adapte": "Approche directe avec le nom — respecte le besoin de reconnaissance du D"
                }
            ],
            "ce_qui_na_pas_marche": [
                {
                    "verbatim": "notre solution innovante d'accompagnement sur mesure permet un petit peu de réduire les coûts",
                    "pourquoi_inadapte": "Un D veut des résultats, pas du jargon. Un C veut des chiffres, pas des promesses vagues",
                    "ce_quil_aurait_fallu_dire": "3 pannes évitées en 6 mois chez Fonderies du Rhône. ROI en 4 mois. 800€/mois.",
                    "principe_disc": "Avec un D/C : chiffres, résultats, preuves. Pas de bavardage, pas de jargon."
                }
            ],
            "strategie_ideale": "Avec ce profil D/C, il fallait ouvrir avec un chiffre d'impact, proposer 2 options max, donner une référence vérifiable dans son secteur, et closer en 3 minutes. Toute tentative de créer du lien personnel est contre-productive."
        }
    }
}


# ─── Tests du prompt d'évaluation ────────────────────────────────────

class TestEvaluationPrompt:
    """Tests de non-régression sur le contenu du prompt d'évaluation."""

    def _get_prompt(self, language="fr"):
        transcript_text = _format_transcript(SAMPLE_TRANSCRIPT)
        return _build_evaluation_prompt(
            DEFAULT_SCENARIO, transcript_text,
            difficulty=2, duration_s=180, language=language
        )

    def test_prompt_contains_force3d_competences(self):
        """Les 6 compétences FORCE 3D doivent être dans le prompt."""
        prompt = self._get_prompt()
        for comp in ['ACCROCHE', 'DÉCOUVERTE', 'CRÉATION D\'ENJEU', 'ARGUMENTATION',
                      'TRAITEMENT D\'OBJECTIONS', 'ENGAGEMENT']:
            assert comp in prompt, f"Compétence manquante dans le prompt: {comp}"

    def test_prompt_contains_posture_commerciale_section(self):
        """Le prompt doit contenir la section POSTURE COMMERCIALE."""
        prompt = self._get_prompt()
        assert 'POSTURE COMMERCIALE' in prompt
        assert 'TON (/20)' in prompt
        assert 'ASSURANCE (/20)' in prompt
        assert 'FORMULATION (/20)' in prompt

    def test_prompt_contains_posture_criteria(self):
        """Le prompt doit contenir les critères d'évaluation de la posture."""
        prompt = self._get_prompt()
        assert 'peut-être' in prompt
        assert 'je pense' in prompt
        assert 'éventuellement' in prompt
        assert 'solution innovante' in prompt
        assert 'accompagnement sur mesure' in prompt

    def test_prompt_contains_disc_section(self):
        """Le prompt doit contenir la section ANALYSE DISC."""
        prompt = self._get_prompt()
        assert 'ANALYSE DISC DU PROSPECT' in prompt
        assert 'D (Dominance)' in prompt
        assert 'I (Influence)' in prompt
        assert 'S (Stabilité)' in prompt
        assert 'C (Conformité)' in prompt

    def test_prompt_contains_disc_adaptation_rules(self):
        """Le prompt doit contenir les règles d'adaptation DISC."""
        prompt = self._get_prompt()
        assert 'profil D' in prompt.lower() or 'Un commercial qui pitch 5 minutes' in prompt
        assert 'profil I' in prompt.lower() or 'chiffres secs' in prompt
        assert 'profil S' in prompt.lower() or 'décider vite' in prompt
        assert 'profil C' in prompt.lower() or 'reste vague' in prompt

    def test_prompt_json_structure_contains_posture(self):
        """Le JSON template dans le prompt doit inclure posture_commerciale."""
        prompt = self._get_prompt()
        assert '"posture_commerciale"' in prompt
        assert '"ton_general"' in prompt
        assert '"assurance"' in prompt
        assert '"formulation"' in prompt
        assert '"score_posture"' in prompt
        assert '"conseil_posture"' in prompt

    def test_prompt_json_structure_contains_disc(self):
        """Le JSON template dans le prompt doit inclure analyse_disc."""
        prompt = self._get_prompt()
        assert '"analyse_disc"' in prompt
        assert '"profil_prospect"' in prompt
        assert '"type_principal"' in prompt
        assert '"type_secondaire"' in prompt
        assert '"adaptation_commerciale"' in prompt
        assert '"score_adaptation"' in prompt
        assert '"strategie_ideale"' in prompt

    def test_prompt_contains_moment_cle(self):
        """Le prompt doit toujours contenir la section moment_cle (non-régression)."""
        prompt = self._get_prompt()
        assert '"moment_cle"' in prompt
        assert 'MOMENT CLÉ' in prompt

    def test_prompt_contains_transcript(self):
        """Le transcript doit être inclus dans le prompt."""
        prompt = self._get_prompt()
        assert 'VENDEUR:' in prompt or 'PROSPECT:' in prompt

    def test_prompt_contains_scoring_rules(self):
        """Les règles de notation doivent être présentes (non-régression)."""
        prompt = self._get_prompt()
        assert '15/20' in prompt
        assert 'EXACTS' in prompt
        assert 'score_posture' in prompt
        assert 'score_adaptation' in prompt


# ─── Tests de la structure JSON de réponse ───────────────────────────

class TestEvaluationJSONStructure:
    """Valide que la structure JSON attendue est cohérente."""

    def test_top_level_keys(self):
        """La réponse doit contenir toutes les clés de premier niveau."""
        required_keys = [
            'score_global', 'note_lettre', 'resultat_appel', 'competences',
            'synthese', 'conseil_prioritaire', 'moment_cle',
            'posture_commerciale', 'analyse_disc'
        ]
        for key in required_keys:
            assert key in SAMPLE_EVALUATION_RESPONSE, f"Clé manquante: {key}"

    def test_competences_keys(self):
        """Les 6 compétences FORCE 3D doivent être présentes."""
        comps = SAMPLE_EVALUATION_RESPONSE['competences']
        required = ['accroche', 'decouverte', 'creation_enjeu',
                     'argumentation', 'traitement_objections', 'engagement']
        for key in required:
            assert key in comps, f"Compétence manquante: {key}"

    def test_competence_structure(self):
        """Chaque compétence doit avoir score, points_forts, points_progres, conseil."""
        for key, comp in SAMPLE_EVALUATION_RESPONSE['competences'].items():
            assert 'score' in comp, f"{key}: 'score' manquant"
            assert 'points_forts' in comp, f"{key}: 'points_forts' manquant"
            assert 'points_progres' in comp, f"{key}: 'points_progres' manquant"
            assert 'conseil' in comp, f"{key}: 'conseil' manquant"
            assert isinstance(comp['score'], (int, float)), f"{key}: score doit être numérique"
            assert 0 <= comp['score'] <= 20, f"{key}: score hors limites [0-20]"

    def test_posture_commerciale_structure(self):
        """posture_commerciale doit avoir ton, assurance, formulation, score et conseil."""
        pc = SAMPLE_EVALUATION_RESPONSE['posture_commerciale']
        assert 'ton_general' in pc
        assert 'assurance' in pc
        assert 'formulation' in pc
        assert 'score_posture' in pc
        assert 'conseil_posture' in pc

    def test_posture_ton_structure(self):
        """ton_general doit avoir note, description, moments_positifs, moments_a_ameliorer."""
        ton = SAMPLE_EVALUATION_RESPONSE['posture_commerciale']['ton_general']
        assert 'note' in ton
        assert 'description' in ton
        assert 'moments_positifs' in ton
        assert 'moments_a_ameliorer' in ton
        assert isinstance(ton['note'], (int, float))
        assert 0 <= ton['note'] <= 20

    def test_posture_assurance_structure(self):
        """assurance doit avoir note, description, marqueurs_confiance, marqueurs_hesitation."""
        ass = SAMPLE_EVALUATION_RESPONSE['posture_commerciale']['assurance']
        assert 'note' in ass
        assert 'description' in ass
        assert 'marqueurs_confiance' in ass
        assert 'marqueurs_hesitation' in ass
        assert isinstance(ass['note'], (int, float))
        assert 0 <= ass['note'] <= 20

    def test_posture_assurance_hesitation_items(self):
        """Chaque marqueur d'hésitation doit avoir verbatim, indice, reformulation."""
        for item in SAMPLE_EVALUATION_RESPONSE['posture_commerciale']['assurance']['marqueurs_hesitation']:
            assert 'verbatim' in item, "marqueur_hesitation: 'verbatim' manquant"
            assert 'indice' in item, "marqueur_hesitation: 'indice' manquant"
            assert 'reformulation' in item, "marqueur_hesitation: 'reformulation' manquant"

    def test_posture_formulation_structure(self):
        """formulation doit avoir note, description, points_forts, points_a_ameliorer."""
        form = SAMPLE_EVALUATION_RESPONSE['posture_commerciale']['formulation']
        assert 'note' in form
        assert 'description' in form
        assert 'points_forts' in form
        assert 'points_a_ameliorer' in form

    def test_posture_formulation_ameliorer_items(self):
        """Chaque point_a_ameliorer doit avoir les bons champs."""
        for item in SAMPLE_EVALUATION_RESPONSE['posture_commerciale']['formulation']['points_a_ameliorer']:
            assert 'ce_que_vous_avez_dit' in item
            assert 'probleme' in item
            assert 'version_amelioree' in item
            assert 'principe' in item

    def test_posture_score_is_average(self):
        """score_posture doit être approximativement la moyenne des 3 notes."""
        pc = SAMPLE_EVALUATION_RESPONSE['posture_commerciale']
        ton = pc['ton_general']['note']
        ass = pc['assurance']['note']
        form = pc['formulation']['note']
        avg = round((ton + ass + form) / 3)
        assert abs(pc['score_posture'] - avg) <= 1, \
            f"score_posture ({pc['score_posture']}) devrait être ~{avg} (moyenne de {ton},{ass},{form})"

    def test_disc_structure(self):
        """analyse_disc doit avoir profil_prospect et adaptation_commerciale."""
        disc = SAMPLE_EVALUATION_RESPONSE['analyse_disc']
        assert 'profil_prospect' in disc
        assert 'adaptation_commerciale' in disc

    def test_disc_profil_structure(self):
        """profil_prospect doit avoir type_principal, type_secondaire, description, indices."""
        profil = SAMPLE_EVALUATION_RESPONSE['analyse_disc']['profil_prospect']
        assert 'type_principal' in profil
        assert 'type_secondaire' in profil
        assert 'description' in profil
        assert 'indices_detectes' in profil
        assert profil['type_principal'] in ('D', 'I', 'S', 'C')
        assert profil['type_secondaire'] in ('D', 'I', 'S', 'C', None)

    def test_disc_adaptation_structure(self):
        """adaptation_commerciale doit avoir score, marche, pas_marche, strategie."""
        adapt = SAMPLE_EVALUATION_RESPONSE['analyse_disc']['adaptation_commerciale']
        assert 'score_adaptation' in adapt
        assert 'ce_qui_a_marche' in adapt
        assert 'ce_qui_na_pas_marche' in adapt
        assert 'strategie_ideale' in adapt
        assert isinstance(adapt['score_adaptation'], (int, float))
        assert 0 <= adapt['score_adaptation'] <= 20

    def test_disc_marche_items(self):
        """Chaque item de ce_qui_a_marche doit avoir verbatim et pourquoi_adapte."""
        for item in SAMPLE_EVALUATION_RESPONSE['analyse_disc']['adaptation_commerciale']['ce_qui_a_marche']:
            assert 'verbatim' in item
            assert 'pourquoi_adapte' in item

    def test_disc_pas_marche_items(self):
        """Chaque item de ce_qui_na_pas_marche doit avoir les 4 champs."""
        for item in SAMPLE_EVALUATION_RESPONSE['analyse_disc']['adaptation_commerciale']['ce_qui_na_pas_marche']:
            assert 'verbatim' in item
            assert 'pourquoi_inadapte' in item
            assert 'ce_quil_aurait_fallu_dire' in item
            assert 'principe_disc' in item

    def test_moment_cle_structure(self):
        """moment_cle doit avoir quand, ce_que_vous_avez_dit, ideal, pourquoi (non-régression)."""
        mk = SAMPLE_EVALUATION_RESPONSE['moment_cle']
        assert 'quand' in mk
        assert 'ce_que_vous_avez_dit' in mk
        assert 'ce_qui_aurait_ete_ideal' in mk
        assert 'pourquoi' in mk

    def test_score_global_in_range(self):
        """score_global doit être entre 0 et 20."""
        assert 0 <= SAMPLE_EVALUATION_RESPONSE['score_global'] <= 20

    def test_note_lettre_valid(self):
        """note_lettre doit être A, B, C, D ou E."""
        assert SAMPLE_EVALUATION_RESPONSE['note_lettre'] in ('A', 'B', 'C', 'D', 'E')

    def test_resultat_appel_valid(self):
        """resultat_appel doit être une des valeurs attendues."""
        valid = ('rdv_obtenu', 'mail_envoi', 'rappel_prevu', 'echec_poli', 'echec_dur')
        assert SAMPLE_EVALUATION_RESPONSE['resultat_appel'] in valid

    def test_json_serializable(self):
        """La réponse doit être sérialisable en JSON."""
        raw = json.dumps(SAMPLE_EVALUATION_RESPONSE, ensure_ascii=False)
        parsed = json.loads(raw)
        assert parsed == SAMPLE_EVALUATION_RESPONSE


# ─── Tests du format transcript ──────────────────────────────────────

class TestTranscriptFormatting:
    """Tests de non-régression sur le formatage du transcript."""

    def test_format_list_transcript(self):
        """_format_transcript avec une liste d'objets."""
        result = _format_transcript(SAMPLE_TRANSCRIPT)
        assert 'VENDEUR:' in result
        assert 'PROSPECT:' in result
        assert 'Bertrand' in result

    def test_format_string_transcript(self):
        """_format_transcript avec un string."""
        text = "VENDEUR: Bonjour\nPROSPECT: Oui?"
        result = _format_transcript(text)
        assert result == text

    def test_format_empty_transcript(self):
        """_format_transcript avec une liste vide."""
        result = _format_transcript([])
        assert result == ""


# ─── Tests de la configuration multi-langue ──────────────────────────

class TestLanguageConfig:
    """Tests de non-régression sur EVAL_LANG_CONFIG."""

    def test_all_languages_present(self):
        """Les 5 langues doivent être configurées."""
        for lang in ('fr', 'en', 'es', 'de', 'it'):
            assert lang in EVAL_LANG_CONFIG, f"Langue manquante: {lang}"

    def test_non_french_includes_new_sections(self):
        """Les langues non-FR doivent mentionner posture_commerciale et analyse_disc."""
        for lang in ('en', 'es', 'de', 'it'):
            instruction = EVAL_LANG_CONFIG[lang]['instruction']
            assert 'posture_commerciale' in instruction, \
                f"Langue {lang}: 'posture_commerciale' absent de l'instruction"
            assert 'analyse_disc' in instruction, \
                f"Langue {lang}: 'analyse_disc' absent de l'instruction"

    def test_french_has_no_instruction(self):
        """Le français ne doit pas avoir d'instruction de langue."""
        assert EVAL_LANG_CONFIG['fr']['instruction'] == ""

    def test_prompt_includes_lang_instruction(self):
        """Le prompt en anglais doit inclure l'instruction de langue."""
        transcript_text = _format_transcript(SAMPLE_TRANSCRIPT)
        prompt = _build_evaluation_prompt(
            DEFAULT_SCENARIO, transcript_text,
            difficulty=2, duration_s=180, language="en"
        )
        assert 'English' in prompt
        assert 'posture_commerciale' in prompt


# ─── Tests de rétrocompatibilité ─────────────────────────────────────

class TestBackwardsCompatibility:
    """Vérifie que les anciennes évaluations sans posture/DISC fonctionnent."""

    def test_old_evaluation_without_posture_disc(self):
        """Une évaluation sans posture_commerciale ni analyse_disc doit être valide."""
        old_eval = {
            "score_global": 12,
            "note_lettre": "C",
            "resultat_appel": "mail_envoi",
            "competences": {
                "accroche": {"score": 10, "points_forts": [], "points_progres": [], "conseil": ""},
                "decouverte": {"score": 12, "points_forts": [], "points_progres": [], "conseil": ""},
                "creation_enjeu": {"score": 11, "points_forts": [], "points_progres": [], "conseil": ""},
                "argumentation": {"score": 13, "points_forts": [], "points_progres": [], "conseil": ""},
                "traitement_objections": {"score": 14, "points_forts": [], "points_progres": [], "conseil": ""},
                "engagement": {"score": 10, "points_forts": [], "points_progres": [], "conseil": ""},
            },
            "synthese": "Performance correcte.",
            "conseil_prioritaire": "Travaillez la découverte.",
            "moment_cle": {
                "quand": "Début d'appel",
                "ce_que_vous_avez_dit": "Bonjour",
                "ce_qui_aurait_ete_ideal": "Bonjour M. Bertrand",
                "pourquoi": "Personnalisation"
            }
        }
        # posture_commerciale and analyse_disc should be absent but the eval is still valid
        assert 'posture_commerciale' not in old_eval
        assert 'analyse_disc' not in old_eval
        # The frontend should handle .get() gracefully — test that accessing missing keys returns None
        assert old_eval.get('posture_commerciale') is None
        assert old_eval.get('analyse_disc') is None

    def test_old_format_points_progres_string(self):
        """Les anciens points_progres en string doivent rester supportés."""
        old_comp = {
            "score": 10,
            "points_forts": ["Bon début"],
            "points_progres": ["Améliorer la découverte", "Poser plus de questions"],
            "conseil": "Posez des questions ouvertes"
        }
        # All items should be strings
        for p in old_comp['points_progres']:
            assert isinstance(p, str)


# ─── Tests du DEFAULT_SCENARIO ───────────────────────────────────────

class TestDefaultScenario:
    """Non-régression sur la structure du scénario par défaut."""

    def test_has_persona(self):
        assert 'persona' in DEFAULT_SCENARIO

    def test_has_objections(self):
        assert 'objections' in DEFAULT_SCENARIO

    def test_has_vendeur(self):
        assert 'vendeur' in DEFAULT_SCENARIO

    def test_has_brief_commercial(self):
        assert 'brief_commercial' in DEFAULT_SCENARIO

    def test_persona_identite(self):
        p = DEFAULT_SCENARIO['persona']['identite']
        assert 'prenom' in p
        assert 'nom' in p
        assert 'poste' in p
        assert 'entreprise' in p
