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
  pain_backache: { family: 'feather', glyph: 'activity' },
  pain_breast_pain: { family: 'feather', glyph: 'heart' },
  pain_tender_breasts: { family: 'mci', glyph: 'heart-multiple' },
  pain_headache: { family: 'feather', glyph: 'square' },
  pain_migraines: { family: 'feather', glyph: 'alert-octagon' },
  pain_neck_aches: { family: 'feather', glyph: 'move-up' },
  pain_ovulation_pain: { family: 'feather', glyph: 'target' },
  pain_pelvic_pain: { family: 'feather', glyph: 'alert-circle' },
  pain_breast_sensitivity: { family: 'feather', glyph: 'plus' },
  pain_body_aches: { family: 'mci', glyph: 'arm-flex' },
  pain_muscle_pain: { family: 'feather', glyph: 'user' },
  pain_shoulder_ache: { family: 'feather', glyph: 'triangle' },
  pain_low_back_pain: { family: 'mci', glyph: 'spine' },

  // Cervical icons
  cervical_sticky: { family: 'mci', glyph: 'water-opacity' },
  cervical_creamy: { family: 'feather', glyph: 'cloud' },
  cervical_egg_white: { family: 'feather', glyph: 'droplet' },
  cervical_cottage_cheese: { family: 'feather', glyph: 'package' },
  cervical_foul_smelling: { family: 'feather', glyph: 'alert-triangle' },
  cervical_irritation: { family: 'feather', glyph: 'alert-octagon' },
  cervical_dry: { family: 'feather', glyph: 'minus' },
  cervical_watery: { family: 'feather', glyph: 'droplets' },
  cervical_green: { family: 'mci', glyph: 'alert-circle' },
  cervical_bloodstained: { family: 'mci', glyph: 'water' },

  // Digestive icons
  digestive_constipation: { family: 'feather', glyph: 'pause-circle' },
  digestive_diarrhea: { family: 'feather', glyph: 'alert-octagon' },
  digestive_cravings: { family: 'feather', glyph: 'heart' },
  digestive_low_appetite: { family: 'feather', glyph: 'minus' },
  digestive_gas: { family: 'mci', glyph: 'wind-power' },
  digestive_hunger: { family: 'feather', glyph: 'star' },
  digestive_dyspepsia: { family: 'feather', glyph: 'square' },

  // Physical icons
  physical_bloating: { family: 'feather', glyph: 'circle' },
  physical_fatigue: { family: 'mci', glyph: 'sleep' },
  physical_insomnia: { family: 'feather', glyph: 'moon' },
  physical_nausea: { family: 'mci', glyph: 'emoticon-sick-outline' },
  physical_dizziness: { family: 'feather', glyph: 'wind' },
  physical_discharge: { family: 'mci', glyph: 'water-droplet' },
  physical_chills: { family: 'feather', glyph: 'thermometer' },
  physical_hot_flashes: { family: 'mci', glyph: 'fire' },
  physical_night_sweats: { family: 'feather', glyph: 'droplet' },
  physical_illness: { family: 'mci', glyph: 'hospital-box' },
  physical_influenza: { family: 'feather', glyph: 'alert-octagon' },
  physical_itchiness: { family: 'feather', glyph: 'hand' },
  physical_rashes: { family: 'mci', glyph: 'alert-rhombus-outline' },
  physical_weight_gain: { family: 'feather', glyph: 'trending-up' },

  // Skin icons
  skin_acne: { family: 'feather', glyph: 'edit-2' },
  skin_oily_skin: { family: 'mci', glyph: 'water-droplet' },
  skin_dry_skin: { family: 'feather', glyph: 'sun' },
  skin_rash: { family: 'feather', glyph: 'alert' },

  // Other icons
  other_fever: { family: 'feather', glyph: 'thermometer' },
  other_medication: { family: 'mci', glyph: 'pill' },
  other_spotting: { family: 'feather', glyph: 'flag' },
  other_test: { family: 'feather', glyph: 'check-circle' },
  other_pms: { family: 'feather', glyph: 'calendar' },
  other_flow: { family: 'mci', glyph: 'water' },
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
