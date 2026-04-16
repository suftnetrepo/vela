export const SYMPTOM_ICON_MAP: Record<string, string> = {
  // Cervical
  cervical_firmness: 'pain_ovulation_pain',
  cervical_opening: 'pain_pelvic_pain',
  cervical_mucus: 'cervical_sticky',
  sticky: 'cervical_sticky',
  creamy: 'cervical_creamy',
  egg_white: 'cervical_egg_white',
  cottage_cheese: 'cervical_cottage_cheese',
  foul_smelling: 'cervical_foul_smelling',
  irritation: 'cervical_irritation',
  dry: 'cervical_dry',

  // Digestive
  constipation: 'digestive_constipation',
  diarrhea: 'digestive_diarrhea',
  cravings: 'digestive_cravings',
  low_appetite: 'digestive_low_appetite',
  gas: 'digestive_gas',
  hunger: 'digestive_hunger',
  dyspepsia: 'digestive_dyspepsia',

  // Pain
  backache: 'pain_backache',
  breast_pain: 'pain_breast_pain',
  cramps: 'pain_cramps',
  headache: 'pain_headache',
  migraines: 'pain_migraines',
  neck_aches: 'pain_neck_aches',
  ovulation_pain: 'pain_ovulation_pain',
  pelvic_pain: 'pain_pelvic_pain',
  breast_sensitivity: 'pain_breast_sensitivity',
  body_aches: 'pain_body_aches',

  // Physical
  bloating: 'physical_bloating',
  fatigue: 'physical_fatigue',
  insomnia: 'physical_insomnia',
  nausea: 'physical_nausea',
  dizziness: 'physical_dizziness',
  vaginal_discharge: 'physical_discharge',
  discharge: 'physical_discharge',

  // Skin
  acne: 'skin_acne',
  oily_skin: 'skin_oily_skin',
  dry_skin: 'skin_dry_skin',
  rash: 'skin_rash',

  // Mood
  anxious: 'mood_anxious',
  calm: 'mood_calm',
  confident: 'mood_confident',
  emotional: 'mood_emotional',
  energetic: 'mood_energetic',
  exhausted: 'mood_exhausted',
  happy: 'mood_happy',
  in_love: 'mood_in_love',
  irritable: 'mood_irritable',
  relaxed: 'mood_relaxed',
  sad: 'mood_sad',
  stressed: 'mood_stressed',
  tired: 'mood_tired',

  // Other
  fever: 'other_fever',
  medication: 'other_medication',
  spotting: 'other_spotting',
  pregnancy_test: 'other_test',
};

export const SYMPTOM_ICON_ALIASES: Record<string, string> = {
  'egg-white': 'egg_white',
  'egg white': 'egg_white',
  'cottage-cheese': 'cottage_cheese',
  'cottage cheese': 'cottage_cheese',
  'foul-smelling': 'foul_smelling',
  'foul smelling': 'foul_smelling',
  'low appetite': 'low_appetite',
  'breast pain': 'breast_pain',
  'neck aches': 'neck_aches',
  'ovulation pain': 'ovulation_pain',
  'pelvic pain': 'pelvic_pain',
  'body aches': 'body_aches',
  'breast sensitivity': 'breast_sensitivity',
  'cervical firmness': 'cervical_firmness',
  'cervical opening': 'cervical_opening',
  'cervical mucus': 'cervical_mucus',
  'in love': 'in_love',
  'dry skin': 'dry_skin',
  'oily skin': 'oily_skin',
  'vaginal discharge': 'vaginal_discharge',
  'pregnancy test': 'pregnancy_test',
};

export const CATEGORY_FALLBACK_ICON_MAP: Record<string, string> = {
  cervical: 'cervical_sticky',
  digestive: 'digestive_hunger',
  pain: 'pain_cramps',
  physical: 'physical_bloating',
  skin: 'skin_acne',
  mood: 'mood_happy',
  other: 'other_medication',
};

export function normalizeSymptomKey(input: string): string {
  const k = input.trim().toLowerCase().replace(/[\s-]+/g, '_');
  return SYMPTOM_ICON_ALIASES[input.trim().toLowerCase()] ?? k;
}

export function resolveSymptomIcon(symptomKey: string, category?: string): string {
  const key = normalizeSymptomKey(symptomKey);
  if (SYMPTOM_ICON_MAP[key]) return SYMPTOM_ICON_MAP[key];
  if (category && CATEGORY_FALLBACK_ICON_MAP[category]) return CATEGORY_FALLBACK_ICON_MAP[category];
  return 'other_medication';
}
