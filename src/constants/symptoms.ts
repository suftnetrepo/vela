export interface SymptomDef {
  key:            string
  label:          string
  emoji:          string
  category:       'pain' | 'physical' | 'digestive' | 'skin' | 'other' | 'cervical'
  color:          string
  defaultVisible: boolean
}

// Full master symptom list — alphabetical by category
// defaultVisible = true  → shown by default in the log screen
// defaultVisible = false → available but hidden until user enables it
export const ALL_SYMPTOMS: SymptomDef[] = [
  // ─── PAIN ─────────────────────────────────────────────────────────────────
  { key: 'abdominal_cramps',    label: 'Abdominal cramps',  emoji: '🤐', category: 'pain', color: '#E85555', defaultVisible: true  },
  { key: 'backache',            label: 'Backache',          emoji: '🦴', category: 'pain', color: '#E8748A', defaultVisible: true  },
  { key: 'breast_pain',         label: 'Breast pain',       emoji: '💗', category: 'pain', color: '#E8748A', defaultVisible: true  },
  { key: 'cramps',              label: 'Cramps',            emoji: '🌀', category: 'pain', color: '#E85555', defaultVisible: true  },
  { key: 'headache',            label: 'Headache',          emoji: '🤕', category: 'pain', color: '#E85555', defaultVisible: true  },
  { key: 'migraine',            label: 'Migraines',         emoji: '🤕', category: 'pain', color: '#C4506A', defaultVisible: false },
  { key: 'neck_ache',           label: 'Neck aches',        emoji: '🧬', category: 'pain', color: '#E8748A', defaultVisible: false },
  { key: 'ovulation_pain',      label: 'Ovulation pain',    emoji: '⭐', category: 'pain', color: '#E85555', defaultVisible: false },
  { key: 'pelvic_pain',         label: 'Pelvic pain',       emoji: '⚡', category: 'pain', color: '#E85555', defaultVisible: true  },
  { key: 'shoulder_ache',       label: 'Shoulder aches',    emoji: '💪', category: 'pain', color: '#E8748A', defaultVisible: false },
  { key: 'tender_breasts',      label: 'Tender breasts',    emoji: '🎯', category: 'pain', color: '#E8748A', defaultVisible: true  },
  { key: 'breast_sensitivity',  label: 'Breast sensitivity',emoji: '🎯', category: 'pain', color: '#E8748A', defaultVisible: false },
  { key: 'body_aches',          label: 'Body aches',        emoji: '😩', category: 'pain', color: '#C084FC', defaultVisible: false },
  { key: 'muscle_pain',         label: 'Muscle pain',       emoji: '🦵', category: 'pain', color: '#E8748A', defaultVisible: false },
  { key: 'low_back_pain',       label: 'Low back pain',     emoji: '🫀', category: 'pain', color: '#E85555', defaultVisible: false },

  // ─── PHYSICAL ─────────────────────────────────────────────────────────────
  { key: 'bloating',            label: 'Bloating',          emoji: '🫧', category: 'physical', color: '#F59E4A', defaultVisible: true  },
  { key: 'chills',              label: 'Chills',            emoji: '🥶', category: 'physical', color: '#6B9FD4', defaultVisible: false },
  { key: 'dizziness',           label: 'Dizziness',         emoji: '💫', category: 'physical', color: '#C084FC', defaultVisible: true  },
  { key: 'fatigue',             label: 'Fatigue',           emoji: '😴', category: 'physical', color: '#9B8EC4', defaultVisible: true  },
  { key: 'hot_flashes',         label: 'Hot flashes',       emoji: '🔥', category: 'physical', color: '#E85555', defaultVisible: false },
  { key: 'insomnia',            label: 'Insomnia',          emoji: '🌙', category: 'physical', color: '#9B8EC4', defaultVisible: true  },
  { key: 'nausea',              label: 'Nausea',            emoji: '🤢', category: 'physical', color: '#7BAF8E', defaultVisible: true  },
  { key: 'spotting',            label: 'Spotting',          emoji: '🩸', category: 'physical', color: '#E85555', defaultVisible: false },
  { key: 'night_sweats',        label: 'Night sweats',      emoji: '💧', category: 'physical', color: '#6B9FD4', defaultVisible: false },
  { key: 'illness',             label: 'Illness',           emoji: '🏥', category: 'physical', color: '#4CAF88', defaultVisible: false },
  { key: 'influenza',           label: 'Influenza',         emoji: '🦠', category: 'physical', color: '#4CAF88', defaultVisible: false },
  { key: 'fever',               label: 'Hectic fever',      emoji: '🌡️', category: 'physical', color: '#E85555', defaultVisible: false },
  { key: 'itchiness',           label: 'Itchiness',         emoji: '🖐️', category: 'physical', color: '#F4A7B5', defaultVisible: false },
  { key: 'rashes',              label: 'Rashes',            emoji: '🌗', category: 'physical', color: '#E85555', defaultVisible: false },
  { key: 'weight_gain',         label: 'Weight gain',       emoji: '⚖️', category: 'physical', color: '#F59E4A', defaultVisible: false },

  // ─── DIGESTIVE ────────────────────────────────────────────────────────────
  { key: 'constipation',        label: 'Constipation',      emoji: '😣', category: 'digestive', color: '#B8899A', defaultVisible: false },
  { key: 'diarrhea',            label: 'Diarrhea',          emoji: '🚻', category: 'digestive', color: '#B8899A', defaultVisible: false },
  { key: 'appetite_up',         label: 'Cravings',          emoji: '🍫', category: 'digestive', color: '#F59E4A', defaultVisible: true  },
  { key: 'appetite_down',       label: 'Low appetite',      emoji: '🥗', category: 'digestive', color: '#7BAF8E', defaultVisible: false },
  { key: 'gas',                 label: 'Gas',               emoji: '💨', category: 'digestive', color: '#7BAF8E', defaultVisible: false },
  { key: 'hunger',              label: 'Hunger',            emoji: '🍗', category: 'digestive', color: '#F59E4A', defaultVisible: false },
  { key: 'dyspepsia',           label: 'Dyspepsia',         emoji: '🤮', category: 'digestive', color: '#B8899A', defaultVisible: false },

  // ─── SKIN ─────────────────────────────────────────────────────────────────
  { key: 'acne',                label: 'Acne',              emoji: '😶', category: 'skin', color: '#E85555', defaultVisible: true  },
  { key: 'oily_skin',           label: 'Oily skin',         emoji: '✨', category: 'skin', color: '#F59E4A', defaultVisible: false },
  { key: 'dry_skin',            label: 'Dry skin',          emoji: '🏜️', category: 'skin', color: '#B8899A', defaultVisible: false },

  // ─── CERVICAL ─────────────────────────────────────────────────────────────
  { key: 'cervical_firmness',   label: 'Cervical firmness', emoji: '⬡', category: 'cervical', color: '#7BAF8E', defaultVisible: false },
  { key: 'cervical_opening',    label: 'Cervical opening',  emoji: '📍', category: 'cervical', color: '#E8748A', defaultVisible: false },
  { key: 'cervical_mucus',      label: 'Cervical mucus',    emoji: '💧', category: 'cervical', color: '#6B9FD4', defaultVisible: true  },
  // Cervical mucus consistency subtypes
  { key: 'cervical_sticky',     label: 'Sticky',            emoji: '🌊', category: 'cervical', color: '#7BAF8E', defaultVisible: false },
  { key: 'cervical_creamy',     label: 'Creamy',            emoji: '💨', category: 'cervical', color: '#F4A7B5', defaultVisible: false },
  { key: 'cervical_watery',     label: 'Watery',            emoji: '🌊', category: 'cervical', color: '#6B9FD4', defaultVisible: false },
  { key: 'cervical_eggwhite',   label: 'Egg-white',         emoji: '🥚', category: 'cervical', color: '#F59E4A', defaultVisible: false },
  { key: 'cervical_cottage',    label: 'Cottage-cheese',    emoji: '🧀', category: 'cervical', color: '#7BAF8E', defaultVisible: false },
  { key: 'cervical_green',      label: 'Green',             emoji: '💚', category: 'cervical', color: '#4CAF88', defaultVisible: false },
  { key: 'cervical_bloodstained',label: 'With blood',       emoji: '🩸', category: 'cervical', color: '#E85555', defaultVisible: false },
  { key: 'cervical_foul',       label: 'Foul-smelling',     emoji: '👃', category: 'cervical', color: '#B8899A', defaultVisible: false },
  { key: 'cervical_irritation', label: 'Irritation',        emoji: '🔨', category: 'cervical', color: '#E85555', defaultVisible: false },
  { key: 'cervical_dryness',    label: 'Dry',               emoji: '🏜️', category: 'cervical', color: '#B8899A', defaultVisible: false },

  // ─── OTHER ────────────────────────────────────────────────────────────────
  { key: 'pms',                 label: 'PMS',               emoji: '📊', category: 'other', color: '#C084FC', defaultVisible: false },
  { key: 'flow',                label: 'Flow',              emoji: '🩸', category: 'other', color: '#E85555', defaultVisible: false },
]

// Settings key prefix for symptom visibility
export const SYMPTOM_SETTING_PREFIX = 'symptom_visible_'

// Default visible symptoms (used as fallback and for display in SymptomGrid)
export const SYMPTOMS = ALL_SYMPTOMS.filter(s => s.defaultVisible)

export const SYMPTOM_MAP = Object.fromEntries(ALL_SYMPTOMS.map(s => [s.key, s]))
