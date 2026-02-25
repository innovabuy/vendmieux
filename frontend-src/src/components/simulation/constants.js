export const COMP_KEYS = ['accroche', 'decouverte', 'creation_enjeu', 'argumentation', 'traitement_objections', 'engagement'];

export const COMP_LABELS = {
  accroche: 'Accroche',
  decouverte: 'Découverte',
  creation_enjeu: "Création d'enjeu",
  argumentation: 'Argumentation',
  traitement_objections: 'Objections',
  engagement: 'Engagement',
};

export const RESULT_LABELS = {
  rdv_obtenu: 'RDV obtenu',
  mail_envoi: 'Mail à envoyer',
  rappel_prevu: 'Rappel prévu',
  echec_poli: 'Échec poli',
  echec_dur: 'Échec',
};

export const RESULT_COLORS_MAP = {
  rdv_obtenu: 'var(--sim-success)',
  mail_envoi: 'var(--sim-blue)',
  rappel_prevu: 'var(--sim-warning)',
  echec_poli: 'var(--sim-warning)',
  echec_dur: 'var(--sim-danger)',
};

export const LANGUAGES = [
  { code: 'fr', flag: '\u{1F1EB}\u{1F1F7}', label: 'Français' },
  { code: 'en', flag: '\u{1F1EC}\u{1F1E7}', label: 'English' },
  { code: 'es', flag: '\u{1F1EA}\u{1F1F8}', label: 'Español' },
  { code: 'de', flag: '\u{1F1E9}\u{1F1EA}', label: 'Deutsch' },
  { code: 'it', flag: '\u{1F1EE}\u{1F1F9}', label: 'Italiano' },
];

export const DIFFICULTIES = [
  { value: 1, emoji: '\u{1F7E2}', label: 'Facile', desc: "Prospect ouvert, peu d'objections" },
  { value: 2, emoji: '\u{1F7E1}', label: 'Intermédiaire', desc: 'Prospect méfiant, objections classiques' },
  { value: 3, emoji: '\u{1F534}', label: 'Difficile', desc: 'Prospect hostile, objections dures, temps limité' },
];

export const DISC_LABELS = { D: 'Dominance', I: 'Influence', S: 'Stabilité', C: 'Conformité' };
