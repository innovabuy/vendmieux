"""
Normalisation du texte pour Google Cloud TTS.

Transforme les abréviations, montants, pourcentages et sigles
en texte prononçable naturellement en français.
"""

import re
from collections.abc import AsyncIterable, AsyncGenerator


def _apply_tts_rules(text: str) -> str:
    """Applique les règles de normalisation TTS (sans toucher aux espaces)."""

    # Montants avec k (kilo euros)
    text = re.sub(r'(\d+)\s*[kK]\s*€', r'\1 mille euros', text)
    text = re.sub(r'(\d+)\s*[kK]\b', r'\1 mille', text)

    # Montants avec M (millions)
    text = re.sub(r'(\d+)\s*M\s*€', r"\1 millions d'euros", text)
    text = re.sub(r'(\d+)\s*M€', r"\1 millions d'euros", text)

    # Symbole euro seul
    text = re.sub(r'(\d+)\s*€', r'\1 euros', text)

    # Pourcentages
    text = re.sub(r'(\d+)\s*%', r'\1 pour cent', text)

    # Heures
    text = re.sub(r'(\d{1,2})\s*h\s*(\d{2})', r'\1 heures \2', text)
    text = re.sub(r'(\d{1,2})\s*h\b', r'\1 heures', text)

    # Abréviations courantes françaises business
    # Chaque tuple: (pattern, replacement, flags)
    abbreviations = [
        # Termes business développés
        (r'\brdv\b', 'rendez-vous', re.IGNORECASE),
        (r'\bRDV\b', 'rendez-vous', 0),
        (r'\bCA\b', "chiffre d'affaires", 0),
        (r'\bROI\b', 'retour sur investissement', 0),
        (r'\bTPE\b', 'très petite entreprise', 0),
        (r'\bDG\b', 'directeur général', 0),
        (r'\bDSI\b', 'directeur des systèmes d\'information', 0),
        (r'\bDRH\b', 'directeur des ressources humaines', 0),
        (r'\bDAF\b', 'directeur administratif et financier', 0),
        (r'\bHT\b', 'hors taxes', 0),
        (r'\bASAP\b', 'dès que possible', 0),
        (r'\bSaaS\b', 'sasse', 0),
        (r'\bB2B\b', 'B to B', 0),
        (r'\bB2C\b', 'B to C', 0),
        # Sigles épelés
        (r'\bPME\b', 'P M E', 0),
        (r'\bETI\b', 'E T I', 0),
        (r'\bCRM\b', 'C R M', 0),
        (r'\bERP\b', 'E R P', 0),
        (r'\bKPI\b', 'K P I', 0),
        (r'\bNDA\b', 'N D A', 0),
        (r'\bTTC\b', 'T T C', 0),
        (r'\bTVA\b', 'T V A', 0),
        # Abréviations courantes
        (r'\betc\.?(?!\w)', 'et cetera', re.IGNORECASE),
        (r'\bvs\b', 'versus', re.IGNORECASE),
        (r'\bex\.(?!\w)', 'exemple', re.IGNORECASE),
        (r'\binfo\b', 'information', re.IGNORECASE),
        (r'\binfos\b', 'informations', re.IGNORECASE),
        (r'\bsvp\b', "s'il vous plaît", re.IGNORECASE),
    ]

    for pattern, replacement, flags in abbreviations:
        text = re.sub(pattern, replacement, text, flags=flags)

    # Nettoyer les interjections mal prononcées
    text = re.sub(r'\bhmm+\b', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\bmm+h\b', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\bhm\b', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\beuh+\b', 'eu', text, flags=re.IGNORECASE)

    return text


def normalize_for_tts(text: str) -> str:
    """Normalise le texte pour une prononciation naturelle par Google TTS."""
    text = _apply_tts_rules(text)
    # Nettoyer doubles espaces et strip
    text = re.sub(r'\s+', ' ', text).strip()
    return text


async def normalize_tts_stream(
    text: AsyncIterable[str],
) -> AsyncGenerator[str, None]:
    """Async generator qui normalise le texte pour TTS à la volée.

    Bufferise les tokens LLM jusqu'aux limites de mots (espaces)
    pour garantir que les patterns multi-tokens comme "10k€" sont
    correctement capturés avant normalisation.
    """
    buffer = ""

    async for chunk in text:
        buffer += chunk

        # Chercher la dernière limite de mot (espace ou newline)
        last_boundary = -1
        for i in range(len(buffer) - 1, -1, -1):
            if buffer[i] in " \n\t":
                last_boundary = i
                break

        if last_boundary >= 0:
            # Normaliser tout jusqu'à la limite de mot (incluse)
            to_process = buffer[: last_boundary + 1]
            buffer = buffer[last_boundary + 1 :]
            # Appliquer les règles sans strip pour préserver les espaces du flux
            normalized = _apply_tts_rules(to_process)
            if normalized:
                yield normalized

    # Flush le buffer restant
    if buffer:
        normalized = _apply_tts_rules(buffer)
        if normalized:
            yield normalized
