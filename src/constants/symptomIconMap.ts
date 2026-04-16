/**
 * SYMPTOM_ICON_MAP — Unified source of truth for symptom & mood SVG icons
 *
 * Maps all symptom and mood keys to their corresponding SVG icon names.
 * Icons are stored in assets/icons/symptoms/ and loaded by SvgSymptomIcon component.
 *
 * This system:
 * - Replaces generic fallback icons (!, ?, -) with meaningful SVG illustrations
 * - Provides category-level fallback icons if a specific icon is missing
 * - Supports common aliases for symptom names
 * - Maintains consistent styling across all symptom/mood UI
 *
 * Icon categories:
 * - Pain:       10+ pain-related symptoms (cramps, headache, backache, etc.)
 * - Cervical:   7 cervical mucus variations (sticky, creamy, egg-white, etc.)
 * - Digestive:  7 digestive symptoms (gas, constipation, hunger, etc.)
 * - Physical:   6 physical symptoms (bloating, fatigue, nausea, etc.)
 * - Skin:       4 skin symptoms (acne, oily, dry, rash)
 * - Mood:       13+ mood states (happy, sad, anxious, etc.)
 * - Other:      4 misc symptoms (fever, medication, spotting, etc.)
 *
 * Generated from: icon pack/vela_symptom_icon_pack/symptom-icon-map.ts
 * Last updated: 2026-04-16 (SVG icon pack integration)
 */

// ─── SYMPTOM ICON MAP ───────────────────────────────────────────────────────
/**
 * Primary symptom key → SVG icon name mapping
 * Each symptom maps to a specific SVG file in assets/icons/symptoms/
 * 
 * Format: symptom_key: 'category_symptom_name'
 * Example: cramps: 'pain_cramps' → loads assets/icons/symptoms/pain_cramps.svg
 */
export const SYMPTOM_ICON_MAP: Record<string, string> = {
  // ┌─ CERVICAL CATEGORY ────────────────────────────────────────────────────┐
  // Cervical mucus variations with semantic icons
  cervical_firmness:     'pain_ovulation_pain',  // Firmness → ovulation pain icon
  cervical_opening:      'pain_pelvic_pain',     // Opening → pelvic pain icon
  cervical_mucus:        'cervical_sticky',      // Default cervical
  cervical_sticky:       'cervical_sticky',      // Sticky mucus
  cervical_creamy:       'cervical_creamy',      // Creamy mucus
  cervical_eggwhite:     'cervical_egg_white',   // Egg-white mucus
  cervical_watery:       'physical_discharge',   // Watery mucus
  cervical_cottage:      'cervical_cottage_cheese', // Cottage cheese (yeast)
  cervical_green:        'other_medication',     // Green mucus (infection)
  cervical_bloodstained: 'other_spotting',       // Blood-stained mucus
  cervical_foul:         'cervical_foul_smelling',  // Foul odor (infection)
  cervical_irritation:   'cervical_irritation',  // Cervical irritation
  cervical_dryness:      'cervical_dry',         // Cervical dryness
  
  // Aliases for cervical mucus
  sticky:                'cervical_sticky',      // Sticky mucus
  creamy:                'cervical_creamy',      // Creamy mucus
  egg_white:             'cervical_egg_white',   // Egg-white mucus
  cottage_cheese:        'cervical_cottage_cheese', // Cottage cheese (yeast)
  foul_smelling:         'cervical_foul_smelling',  // Foul odor (infection)
  irritation:            'cervical_irritation',  // Cervical irritation
  dry:                   'cervical_dry',         // Cervical dryness

  // ┌─ DIGESTIVE CATEGORY ───────────────────────────────────────────────────┐
  // GI tract and appetite symptoms
  constipation:          'digestive_constipation',
  diarrhea:              'digestive_diarrhea',
  appetite_up:           'digestive_cravings',   // Cravings (appetite increase)
  appetite_down:         'digestive_low_appetite', // Low appetite
  cravings:              'digestive_cravings',   // Alias
  low_appetite:          'digestive_low_appetite', // Alias
  gas:                   'digestive_gas',
  hunger:                'digestive_hunger',
  dyspepsia:             'digestive_dyspepsia',

  // ┌─ PAIN CATEGORY ────────────────────────────────────────────────────────┐
  // Various pain symptoms with distinct icons
  abdominal_cramps:      'pain_cramps',          // Abdominal cramps → same as regular cramps
  backache:              'pain_backache',
  breast_pain:           'pain_breast_pain',
  cramps:                'pain_cramps',
  headache:              'pain_headache',
  migraine:              'pain_migraines',
  migraines:             'pain_migraines',       // Alias for migraines
  neck_ache:             'pain_neck_aches',      // Neck ache
  neck_aches:            'pain_neck_aches',      // Alias for neck_aches
  ovulation_pain:        'pain_ovulation_pain',
  pelvic_pain:           'pain_pelvic_pain',
  shoulder_ache:         'pain_shoulder_ache',   // New: shoulder pain
  tender_breasts:        'pain_breast_pain',     // Tender breasts → same as breast pain
  breast_sensitivity:    'pain_breast_sensitivity',
  body_aches:            'pain_body_aches',
  muscle_pain:           'pain_body_aches',      // Muscle pain → similar to body aches
  low_back_pain:         'pain_backache',        // Alias for backache

  // ┌─ PHYSICAL CATEGORY ────────────────────────────────────────────────────┐
  // Body state symptoms
  bloating:              'physical_bloating',
  chills:                'physical_chills',      // New: chills
  dizziness:             'physical_dizziness',
  fatigue:               'physical_fatigue',
  hot_flashes:           'physical_hot_flashes', // New: hot flashes
  insomnia:              'physical_insomnia',
  nausea:                'physical_nausea',
  spotting:              'other_spotting',       // Spotting (light bleeding)
  night_sweats:          'physical_night_sweats', // New: night sweats
  illness:               'physical_illness',     // New: illness
  influenza:             'physical_influenza',   // New: influenza/flu
  fever:                 'other_fever',          // Fever (can be symptom or other)
  itchiness:             'physical_itchiness',   // New: itchiness
  rashes:                'physical_rashes',      // New: rashes (physical not skin)
  weight_gain:           'physical_weight_gain', // New: weight gain
  vaginal_discharge:     'physical_discharge',
  discharge:             'physical_discharge',   // Alias

  // ┌─ SKIN CATEGORY ────────────────────────────────────────────────────────┐
  // Dermatological symptoms
  acne:                  'skin_acne',
  oily_skin:             'skin_oily_skin',
  dry_skin:              'skin_dry_skin',
  rash:                  'skin_rash',

  // ┌─ MOOD CATEGORY ────────────────────────────────────────────────────────┐
  // Emotional states
  anxious:               'mood_anxious',
  calm:                  'mood_calm',
  confident:             'mood_confident',
  emotional:             'mood_emotional',
  energetic:             'mood_energetic',
  exhausted:             'mood_exhausted',
  happy:                 'mood_happy',
  in_love:               'mood_in_love',
  irritable:             'mood_irritable',
  relaxed:               'mood_relaxed',
  sad:                   'mood_sad',
  stressed:              'mood_stressed',
  tired:                 'mood_tired',

  // ┌─ OTHER CATEGORY ───────────────────────────────────────────────────────┐
  // Miscellaneous symptoms
  pms:                   'other_pms',            // New: PMS
  flow:                  'other_flow',           // New: Flow/bleeding
  medication:            'other_medication',
  pregnancy_test:        'other_test',
}

// ─── SYMPTOM ALIASES ────────────────────────────────────────────────────────
/**
 * Common alternate spellings and formats that resolve to canonical keys
 * This allows symptom keys to be normalized before icon lookup
 * 
 * Example: 'egg white' → 'egg_white' → 'cervical_egg_white' icon
 */
export const SYMPTOM_ICON_ALIASES: Record<string, string> = {
  'egg-white':           'egg_white',
  'egg white':           'egg_white',
  'cottage-cheese':      'cottage_cheese',
  'cottage cheese':      'cottage_cheese',
  'foul-smelling':       'foul_smelling',
  'foul smelling':       'foul_smelling',
  'low appetite':        'low_appetite',
  'breast pain':         'breast_pain',
  'neck aches':          'neck_aches',
  'ovulation pain':      'ovulation_pain',
  'pelvic pain':         'pelvic_pain',
  'body aches':          'body_aches',
  'breast sensitivity':  'breast_sensitivity',
  'cervical firmness':   'cervical_firmness',
  'cervical opening':    'cervical_opening',
  'cervical mucus':      'cervical_mucus',
  'in love':             'in_love',
  'dry skin':            'dry_skin',
  'oily skin':           'oily_skin',
  'vaginal discharge':   'vaginal_discharge',
  'pregnancy test':      'pregnancy_test',
}

// ─── CATEGORY FALLBACK ICONS ────────────────────────────────────────────────
/**
 * Default icons used when a symptom doesn't have a specific mapping
 * Each category gets its own representative fallback icon
 * 
 * Priority:
 * 1. Specific symptom icon (if exists)
 * 2. Category fallback icon (if category provided)
 * 3. Ultimate fallback: 'other_medication'
 */
export const CATEGORY_FALLBACK_ICON_MAP: Record<string, string> = {
  cervical:    'cervical_sticky',      // Sticky mucus as default cervical icon
  digestive:   'digestive_hunger',     // Hunger as default digestive icon
  pain:        'pain_cramps',          // Cramps as default pain icon
  physical:    'physical_bloating',    // Bloating as default physical icon
  skin:        'skin_acne',            // Acne as default skin icon
  mood:        'mood_happy',           // Happy as default mood icon
  other:       'other_medication',     // Medication as fallback
}

// ─── HELPER FUNCTIONS ───────────────────────────────────────────────────────

/**
 * Normalize a symptom key by resolving aliases and formatting
 * 
 * Examples:
 *   'Egg-White' → 'egg_white'
 *   'low appetite' → 'low_appetite'
 *   'cramps' → 'cramps'
 */
export function normalizeSymptomKey(input: string): string {
  const trimmed = input.trim().toLowerCase()
  
  // Check aliases first (they take precedence)
  if (SYMPTOM_ICON_ALIASES[trimmed]) {
    return SYMPTOM_ICON_ALIASES[trimmed]
  }
  
  // Convert spaces and dashes to underscores
  return trimmed.replace(/[\s-]+/g, '_')
}

/**
 * Resolve the SVG icon name for a given symptom key
 * 
 * Priority:
 * 1. Direct mapping in SYMPTOM_ICON_MAP
 * 2. Category fallback (if category provided)
 * 3. Ultimate fallback: 'other_medication'
 * 
 * @param symptomKey - The symptom key (e.g., 'cramps', 'egg white')
 * @param category - Optional category (pain, cervical, digestive, etc.)
 * @returns The SVG icon name (e.g., 'pain_cramps')
 */
export function resolveSymptomIcon(symptomKey: string, category?: string): string {
  const normalized = normalizeSymptomKey(symptomKey)
  
  // Try direct mapping first
  if (SYMPTOM_ICON_MAP[normalized]) {
    return SYMPTOM_ICON_MAP[normalized]
  }
  
  // Try category fallback
  if (category && CATEGORY_FALLBACK_ICON_MAP[category.toLowerCase()]) {
    return CATEGORY_FALLBACK_ICON_MAP[category.toLowerCase()]
  }
  
  // Ultimate fallback
  return 'other_medication'
}

/**
 * Get the icon name for a symptom (alias for resolveSymptomIcon)
 * @deprecated Use resolveSymptomIcon instead
 */
export function getSymptomIcon(symptomKey: string, category?: string): string {
  return resolveSymptomIcon(symptomKey, category)
}

/**
 * Get the icon name for a mood
 * Falls back to 'mood_happy' if not found
 */
export function getMoodIcon(moodKey: string): string {
  const normalized = normalizeSymptomKey(moodKey)
  
  // Check if it's in the symptom map (moods are included there)
  if (SYMPTOM_ICON_MAP[normalized]) {
    return SYMPTOM_ICON_MAP[normalized]
  }
  
  // Ultimate mood fallback
  return 'mood_happy'
}

/**
 * Check if a given icon name exists in the SVG icon pack
 */
export function isSvgSymptomIcon(iconName: string): boolean {
  return Object.values(SYMPTOM_ICON_MAP).includes(iconName) ||
         Object.values(CATEGORY_FALLBACK_ICON_MAP).includes(iconName)
}
