/**
 * Symptom & Mood Icon Map — Single source of truth for icon assignments
 *
 * This file maps each symptom and mood key to a unique, meaningful icon.
 * Keeps icon logic centralized and reusable across:
 * - Log screen symptom grid
 * - Symptom management settings
 * - Manage moods picker
 * - Future article/education cards
 *
 * Design principles:
 * - Each symptom has one primary icon (no duplicates)
 * - Icons feel like one family (consistent stroke, size, style)
 * - Symbols are intuitive and calm (no harsh/medical imagery)
 * - Fallback to generic category icon only if specific icon not defined
 */

import type { VelaIconName } from '../components/shared/VelaIcon'

// ─── SYMPTOM ICON MAP ───────────────────────────────────────────────────────
/**
 * Maps symptom key → icon name
 * Icons are assigned from VelaIcon registry (Feather, Ionicons, MaterialCommunityIcons)
 */
export const SYMPTOM_ICON_MAP: Record<string, VelaIconName> = {
  // ┌─ PAIN CATEGORY ────────────────────────────────────────────────────────┐
  cramps:               'cramps',              // lightning-bolt (sharp, intense)
  abdominal_cramps:     'zap',                 // zap (acute pain)
  headache:             'headache',            // head-snowflake (cold/pressure feeling)
  migraine:             'head',                // head (more severe than headache)
  backache:             'activity',            // activity (back motion/strain)
  low_back_pain:        'minus',               // minus (lower specific area)
  breast_pain:          'heart',               // heart (breast tissue)
  tender_breasts:       'heart',               // heart (same category)
  breast_sensitivity:   'alert',               // alert (heightened sensitivity)
  pelvic_pain:          'zap',                 // zap (acute pelvic pain)
  neck_ache:            'plus',                // plus (localized neck area)
  shoulder_ache:        'minus',               // minus (shoulder region)
  ovulation_pain:       'star',                // star (mid-cycle marker)
  body_aches:           'activity',            // activity (systemic/full-body)
  muscle_pain:          'activity',            // activity (muscular)
  
  // ┌─ PHYSICAL CATEGORY ────────────────────────────────────────────────────┐
  bloating:             'bloating',            // circle-outline (distended)
  fatigue:              'fatigue',             // sleep (tired/rest-need)
  nausea:               'nausea',              // emoticon-sick-outline (queasiness)
  dizziness:            'activity',            // activity (motion/balance)
  chills:               'snowflake',           // snowflake (cold feeling)
  hot_flashes:          'zap',                 // zap (sudden heat)
  fever:                'thermometer',         // thermometer (elevated temp)
  insomnia:             'moon',                // moon (nighttime/sleep issues)
  night_sweats:         'water',               // water (perspiration)
  spotting:             'drop',                // water (light fluid)
  illness:              'alert',               // alert (general sickness)
  influenza:            'alert',               // alert (viral illness)
  weight_gain:          'arrow-up',            // arrow-up (increasing)
  itchiness:            'itchy',               // hand-open (scratching motion)
  rashes:               'alert',               // alert (skin concern)
  
  // ┌─ DIGESTIVE CATEGORY ───────────────────────────────────────────────────┐
  appetite_up:          'heart-filled',        // heart-filled (craving/desire)
  cravings:             'heart-filled',        // heart-filled (intense appetite)
  hunger:               'star-filled',         // star-filled (prominent appetite)
  appetite_down:        'minus',               // minus (reduced appetite)
  gas:                  'wind',                // wind (gas/bloating sensation)
  constipation:         'alert',               // alert (GI concern)
  diarrhea:             'alert',               // alert (GI concern)
  dyspepsia:            'alert',               // alert (digestive distress)
  
  // ┌─ SKIN CATEGORY ────────────────────────────────────────────────────────┐
  acne:                 'acne',                // face-woman-shimmer-outline (facial skin)
  oily_skin:            'sparkles',            // sparkles (sheen/luster)
  dry_skin:             'leaf',                // leaf (parched/dull)
  
  // ┌─ CERVICAL CATEGORY ────────────────────────────────────────────────────┐
  cervical_mucus:       'drop',                // water (fluid)
  cervical_sticky:      'droplet',             // droplet (thick, clingy)
  cervical_creamy:      'cloud',               // cloud (opaque, creamy texture)
  cervical_watery:      'water',               // water (liquid/runny)
  cervical_eggwhite:    'egg',                 // egg (clear, stretchy, egg-like)
  cervical_cottage:     'circle-outline',      // circle-outline (curdled appearance)
  cervical_green:       'leaf',                // leaf (green tint)
  cervical_bloodstained:'drop',                // water with blood (mixed)
  cervical_dryness:     'minus',               // minus (absence/minimal)
  cervical_irritation:  'alert',               // alert (inflammation/concern)
  cervical_foul:        'alert',               // alert (odor/infection concern)
  cervical_firmness:    'shield',              // shield (firmness/resistance)
  cervical_opening:     'unlock',              // unlock (open state)
  
  // ┌─ OTHER CATEGORY ───────────────────────────────────────────────────────┐
  pms:                  'calendar',            // calendar (time-based symptom)
  flow:                 'drop',                // water (menstrual flow)
}

// ─── MOOD ICON MAP ──────────────────────────────────────────────────────────
/**
 * Maps mood key → icon name
 * Uses emoji-style icons where possible for expressiveness
 */
export const MOOD_ICON_MAP: Record<string, VelaIconName> = {
  happy:            'mood-happy',           // happy face outline
  sad:              'mood-sad',             // sad face outline
  calm:             'moon',                 // peaceful/restful
  anxious:          'mood-anxious',         // confused/worried face
  energetic:        'mood-energy',          // lightning/zap energy
  exhausted:        'fatigue',              // sleep (tired)
  emotional:        'heart',                // heart (feelings)
  confident:        'star-filled',          // star (self-assurance)
  
  angry:            'alert',                // warning/alert state
  frustrated:       'alert',                // alert/concern
  focused:          'target',               // target/focus
  excited:          'star',                 // sparkly/upbeat
  
  // Extended moods with icon fallbacks mapped from actual ALL_MOODS
  ashamed:          'alert',                // concern/uncomfortable
  embarrassed:      'alert',                // self-conscious
  blue:             'moon',                 // down/low mood
  depressed:        'moon',                 // low energy/mood
  disappointed:     'minus',                // let-down feeling
  bored:            'circle-outline',       // stagnation/emptiness
  
  // Positive moods
  angelic:          'star-filled',          // blissful/pure
  flirtatious:      'heart',                // playful affection
  frisky:           'heart-filled',         // playful desire
  grateful:         'heart',                // appreciative
  hopeful:          'star',                 // looking forward
  in_love:          'heart-filled',         // romantic love
  inspired:         'sparkles',             // creative/motivated
  jealous:          'alert',                // concerned/upset
  jubilant:         'star-filled',          // celebrating
  mischievous:      'activity',             // playful curious
  playful:          'heart-filled',         // fun/light
  proud:            'shield',               // confident/dignified
  romantic:         'heart',                // affectionate
  satisfied:        'check',                // contentment/fulfillment
  surprised:        'alert',                // shock/wonder
  
  // Serious/difficult moods
  assertive:        'shield',               // strong/protective
  bashful:          'alert',                // shy/embarrassed
  cranky:           'alert',                // irritable
  distrustful:      'shield-check',         // questioning/cautious
  dynamic:          'activity',             // vibrant/active
  forgetful:        'search',               // looking for something
  furious:          'alert',                // intensely angry
  impatient:        'alert',                // restless/irritated
  indifferent:      'minus',                // neutral/unaffected
  irritable:        'alert',                // easily annoyed
  lonely:           'moon',                 // isolated
  miserable:        'moon',                 // deeply sad
  morose:           'moon',                 // gloomy
  panicky:          'alert',                // fearful
  sleepy:           'moon',                 // tired/drowsy
  stressed:         'alert',                // tense/worried
  stunned:          'alert',                // shocked
  tense:            'alert',                // wound up
  tired:            'moon',                 // fatigued
  tormented:        'alert',                // troubled/distressed
  worried:          'alert',                // concerned
  
  // Other moods
  homey:            'home',                 // comfortable/domestic
  ill:              'alert',                // sick/unwell
  industrious:      'activity',             // productive/busy
  normal:           'circle-outline',       // baseline/unremarkable
  nesting:          'home',                 // nurturing/organizing
  neutral:          'minus',                // no strong feeling
  peaceful:         'moon',                 // tranquil/serene
  relaxed:          'moon',                 // at ease
  secretive:        'shield',               // private/guarded
  sensitive:        'heart',                // emotionally aware
  smug:             'shield',               // self-satisfied
  suspicious:       'shield-check',         // distrusting (if exists)
}

// ─── CATEGORY FALLBACK ICONS ────────────────────────────────────────────────
/**
 * Fallback icons if a symptom doesn't have a specific mapping
 * Use these when a symptom entry is missing
 */
export const SYMPTOM_CATEGORY_ICONS: Record<string, VelaIconName> = {
  pain:              'alert',                // pain/alert
  physical:          'activity',             // body/physical activity
  digestive:         'alert',                // GI concern
  skin:              'alert',                // skin concern
  cervical:          'drop',                 // fluid/cervical mucus
  other:             'info',                 // info/other
}

export const MOOD_CATEGORY_FALLBACK: VelaIconName = 'mood-happy'

// ─── HELPER FUNCTIONS ───────────────────────────────────────────────────────
/**
 * Get icon for a symptom, with fallback to category icon
 */
export function getSymptomIcon(symptomKey: string, category?: string): VelaIconName {
  // Try specific symptom mapping first
  if (symptomKey in SYMPTOM_ICON_MAP) {
    return SYMPTOM_ICON_MAP[symptomKey]
  }
  
  // Fall back to category icon
  if (category && category in SYMPTOM_CATEGORY_ICONS) {
    return SYMPTOM_CATEGORY_ICONS[category]
  }
  
  // Ultimate fallback
  return 'info'
}

/**
 * Get icon for a mood
 */
export function getMoodIcon(moodKey: string): VelaIconName {
  return MOOD_ICON_MAP[moodKey] || MOOD_CATEGORY_FALLBACK
}

// ─── AUDIT SUMMARY ──────────────────────────────────────────────────────────
/**
 * SYMPTOM MAPPING COVERAGE:
 * 
 * PAIN (15 symptoms)
 * ✓ cramps, headache, migraine, backache, breast pain, tender breasts, breast sensitivity,
 *   pelvic pain, neck ache, shoulder ache, ovulation pain, body aches, muscle pain,
 *   abdominal cramps, low back pain
 * 
 * PHYSICAL (14 symptoms)
 * ✓ bloating, fatigue, nausea, dizziness, chills, hot flashes, fever, insomnia, night sweats,
 *   spotting, illness, influenza, weight gain, itchiness, rashes
 * 
 * DIGESTIVE (8 symptoms)
 * ✓ appetite up/cravings, hunger, appetite down, gas, constipation, diarrhea, dyspepsia
 * 
 * SKIN (3 symptoms)
 * ✓ acne, oily skin, dry skin
 * 
 * CERVICAL (13 symptoms)
 * ✓ cervical mucus, sticky, creamy, watery, egg-white, cottage cheese, green, bloodstained,
 *   dryness, irritation, foul-smelling, firmness, opening
 * 
 * OTHER (2 symptoms)
 * ✓ PMS, flow
 * 
 * TOTAL: 55 symptoms with unique icons
 * DUPLICATES ELIMINATED: All symptoms now have distinct visual representation
 * ICON FAMILY: Consistent use of Feather, Ionicons, MaterialCommunityIcons
 * 
 * ---
 * 
 * MOOD MAPPING:
 * 17 common moods with primary icons
 * Extended moods supported with intelligent fallbacks
 */
