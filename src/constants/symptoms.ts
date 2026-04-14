export interface SymptomDef {
  key:      string
  label:    string
  emoji:    string
  category: 'pain' | 'mood' | 'physical' | 'digestive' | 'skin' | 'other'
}

export const SYMPTOMS: SymptomDef[] = [
  // Pain
  { key: 'cramps',          label: 'Cramps',         emoji: '🌀', category: 'pain' },
  { key: 'headache',        label: 'Headache',       emoji: '🤕', category: 'pain' },
  { key: 'backache',        label: 'Backache',       emoji: '🦴', category: 'pain' },
  { key: 'breast_pain',     label: 'Breast pain',    emoji: '💗', category: 'pain' },
  { key: 'pelvic_pain',     label: 'Pelvic pain',    emoji: '⚡', category: 'pain' },
  // Physical
  { key: 'bloating',        label: 'Bloating',       emoji: '🫧', category: 'physical' },
  { key: 'fatigue',         label: 'Fatigue',        emoji: '😴', category: 'physical' },
  { key: 'nausea',          label: 'Nausea',         emoji: '🤢', category: 'physical' },
  { key: 'dizziness',       label: 'Dizziness',      emoji: '💫', category: 'physical' },
  { key: 'insomnia',        label: 'Insomnia',       emoji: '🌙', category: 'physical' },
  { key: 'hot_flashes',     label: 'Hot flashes',    emoji: '🔥', category: 'physical' },
  { key: 'chills',          label: 'Chills',         emoji: '🥶', category: 'physical' },
  { key: 'spotting',        label: 'Spotting',       emoji: '🩸', category: 'physical' },
  // Digestive
  { key: 'constipation',    label: 'Constipation',   emoji: '😣', category: 'digestive' },
  { key: 'diarrhea',        label: 'Diarrhoea',      emoji: '🚻', category: 'digestive' },
  { key: 'appetite_up',     label: 'Cravings',       emoji: '🍫', category: 'digestive' },
  { key: 'appetite_down',   label: 'Low appetite',   emoji: '🥗', category: 'digestive' },
  // Skin
  { key: 'acne',            label: 'Acne',           emoji: '😶', category: 'skin' },
  { key: 'oily_skin',       label: 'Oily skin',      emoji: '✨', category: 'skin' },
  { key: 'dry_skin',        label: 'Dry skin',       emoji: '🏜️', category: 'skin' },
  // Mood (some overlap with mood selector)
  { key: 'anxiety',         label: 'Anxiety',        emoji: '😰', category: 'mood' },
  { key: 'irritability',    label: 'Irritability',   emoji: '😤', category: 'mood' },
  { key: 'mood_swings',     label: 'Mood swings',    emoji: '🎢', category: 'mood' },
  { key: 'brain_fog',       label: 'Brain fog',      emoji: '🌫️', category: 'mood' },
  { key: 'low_libido',      label: 'Low libido',     emoji: '❄️', category: 'mood' },
  { key: 'high_libido',     label: 'High libido',    emoji: '🌸', category: 'mood' },
]

export const SYMPTOM_MAP = Object.fromEntries(SYMPTOMS.map(s => [s.key, s]))
