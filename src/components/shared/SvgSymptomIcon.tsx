/**
 * SvgSymptomIcon — Fallback to vector icons from VelaIcon
 * 
 * For now, we use the vector icon system as SVG rendering in Expo
 * requires additional build configuration. This maintains full functionality
 * while we set up SVG asset processing.
 * 
 * The SVG files are available in assets/icons/symptoms/ for future use.
 */

import React from 'react'
import { View } from 'react-native'
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'

// Map SVG icon names to vector icon equivalents
// This provides a bridge between SVG naming and vector icons
const SVG_TO_VECTOR_ICON_MAP: Record<string, { family: string; glyph: string }> = {
  // Pain icons
  pain_cramps: { family: 'mci', glyph: 'lightning-bolt' },
  pain_backache: { family: 'mci', glyph: 'spine' },
  pain_breast_pain: { family: 'mci', glyph: 'breast-feeding' },
  pain_headache: { family: 'mci', glyph: 'head-snowflake' },
  pain_migraines: { family: 'mci', glyph: 'head' },
  pain_neck_aches: { family: 'feather', glyph: 'move-up' },
  pain_ovulation_pain: { family: 'feather', glyph: 'target' },
  pain_pelvic_pain: { family: 'feather', glyph: 'zap' },
  pain_breast_sensitivity: { family: 'feather', glyph: 'alert-circle' },
  pain_body_aches: { family: 'mci', glyph: 'arm-flex' },

  // Cervical icons
  cervical_sticky: { family: 'mci', glyph: 'water-opacity' },
  cervical_creamy: { family: 'feather', glyph: 'cloud' },
  cervical_egg_white: { family: 'mci', glyph: 'egg' },
  cervical_cottage_cheese: { family: 'feather', glyph: 'layers' },
  cervical_foul_smelling: { family: 'feather', glyph: 'alert-octagon' },
  cervical_irritation: { family: 'feather', glyph: 'alert-triangle' },
  cervical_dry: { family: 'feather', glyph: 'slash' },

  // Digestive icons
  digestive_constipation: { family: 'mci', glyph: 'stop-circle' },
  digestive_diarrhea: { family: 'feather', glyph: 'alert-octagon' },
  digestive_cravings: { family: 'feather', glyph: 'heart' },
  digestive_low_appetite: { family: 'mci', glyph: 'fork-knife' },
  digestive_gas: { family: 'mci', glyph: 'wind-power' },
  digestive_hunger: { family: 'mci', glyph: 'silverware-fork-knife' },
  digestive_dyspepsia: { family: 'mci', glyph: 'stomach' },

  // Physical icons
  physical_bloating: { family: 'mci', glyph: 'circle-expand' },
  physical_fatigue: { family: 'mci', glyph: 'sleep' },
  physical_insomnia: { family: 'feather', glyph: 'moon' },
  physical_nausea: { family: 'mci', glyph: 'emoticon-sick-outline' },
  physical_dizziness: { family: 'feather', glyph: 'wind' },
  physical_discharge: { family: 'mci', glyph: 'water-opacity' },

  // Skin icons
  skin_acne: { family: 'mci', glyph: 'face-woman-shimmer-outline' },
  skin_oily_skin: { family: 'mci', glyph: 'water-droplet' },
  skin_dry_skin: { family: 'mci', glyph: 'leaf' },
  skin_rash: { family: 'mci', glyph: 'asterisk-circle-outline' },

  // Mood icons
  mood_anxious: { family: 'feather', glyph: 'alert-circle' },
  mood_calm: { family: 'feather', glyph: 'leaf' },
  mood_confident: { family: 'feather', glyph: 'arrow-up' },
  mood_emotional: { family: 'feather', glyph: 'heart' },
  mood_energetic: { family: 'mci', glyph: 'lightning-bolt' },
  mood_exhausted: { family: 'feather', glyph: 'battery' },
  mood_happy: { family: 'ionicons', glyph: 'happy-outline' },
  mood_in_love: { family: 'ionicons', glyph: 'heart' },
  mood_irritable: { family: 'feather', glyph: 'alert-triangle' },
  mood_relaxed: { family: 'mci', glyph: 'spa' },
  mood_sad: { family: 'ionicons', glyph: 'sad-outline' },
  mood_stressed: { family: 'feather', glyph: 'alert-octagon' },
  mood_tired: { family: 'mci', glyph: 'sleep' },

  // Other icons
  other_fever: { family: 'feather', glyph: 'thermometer' },
  other_medication: { family: 'mci', glyph: 'pill' },
  other_spotting: { family: 'mci', glyph: 'water' },
  other_test: { family: 'feather', glyph: 'check-circle' },
}

interface SvgSymptomIconProps {
  name: string
  size: number
  color?: string
}

/**
 * Renders a symptom/mood icon using vector icons as a bridge
 * 
 * NOTE: This currently uses vector icons instead of SVG files.
 * The SVG files are available in assets/icons/symptoms/ for future optimization.
 * To fully migrate to SVG rendering, Expo's asset transformer would need to be configured
 * to handle SVG files as text data URLs.
 */
export function SvgSymptomIcon({ name, size, color = '#2D1B24' }: SvgSymptomIconProps) {
  const iconDef = SVG_TO_VECTOR_ICON_MAP[name]
  
  if (!iconDef) {
    return <View style={{ width: size, height: size, backgroundColor: 'transparent' }} />
  }

  switch (iconDef.family) {
    case 'feather':
      return <Feather name={iconDef.glyph as any} size={size} color={color} />
    case 'mci':
      return <MaterialCommunityIcons name={iconDef.glyph as any} size={size} color={color} />
    case 'ionicons':
      return <Ionicons name={iconDef.glyph as any} size={size} color={color} />
    default:
      return <View style={{ width: size, height: size, backgroundColor: 'transparent' }} />
  }
}

/**
 * Check if an icon name is a valid SVG/vector icon
 */
export function isSvgSymptomIcon(name: string): boolean {
  return name in SVG_TO_VECTOR_ICON_MAP
}
