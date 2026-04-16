/**
 * SvgSymptomIcon — Renderer for SVG-based symptom and mood icons
 * 
 * References SVG files from assets/icons/symptoms/ directory.
 * Works with Expo by requiring SVG files directly.
 * 
 * Usage:
 *   <SvgSymptomIcon name="pain_cramps" size={24} color="#7A5667" />
 *   <SvgSymptomIcon name="cervical_sticky" size={20} color={Colors.primary} />
 */

import React from 'react'
import { Image, StyleSheet, View } from 'react-native'

// SVG files are stored in assets/icons/symptoms/
// Map names to their asset sources
const SVG_ICON_MAP: Record<string, any> = {
  // Pain
  pain_cramps: require('../../../assets/icons/symptoms/pain_cramps.svg'),
  pain_backache: require('../../../assets/icons/symptoms/pain_backache.svg'),
  pain_breast_pain: require('../../../assets/icons/symptoms/pain_breast_pain.svg'),
  pain_headache: require('../../../assets/icons/symptoms/pain_headache.svg'),
  pain_migraines: require('../../../assets/icons/symptoms/pain_migraines.svg'),
  pain_neck_aches: require('../../../assets/icons/symptoms/pain_neck_aches.svg'),
  pain_ovulation_pain: require('../../../assets/icons/symptoms/pain_ovulation_pain.svg'),
  pain_pelvic_pain: require('../../../assets/icons/symptoms/pain_pelvic_pain.svg'),
  pain_breast_sensitivity: require('../../../assets/icons/symptoms/pain_breast_sensitivity.svg'),
  pain_body_aches: require('../../../assets/icons/symptoms/pain_body_aches.svg'),

  // Cervical
  cervical_sticky: require('../../../assets/icons/symptoms/cervical_sticky.svg'),
  cervical_creamy: require('../../../assets/icons/symptoms/cervical_creamy.svg'),
  cervical_egg_white: require('../../../assets/icons/symptoms/cervical_egg_white.svg'),
  cervical_cottage_cheese: require('../../../assets/icons/symptoms/cervical_cottage_cheese.svg'),
  cervical_foul_smelling: require('../../../assets/icons/symptoms/cervical_foul_smelling.svg'),
  cervical_irritation: require('../../../assets/icons/symptoms/cervical_irritation.svg'),
  cervical_dry: require('../../../assets/icons/symptoms/cervical_dry.svg'),

  // Digestive
  digestive_constipation: require('../../../assets/icons/symptoms/digestive_constipation.svg'),
  digestive_diarrhea: require('../../../assets/icons/symptoms/digestive_diarrhea.svg'),
  digestive_cravings: require('../../../assets/icons/symptoms/digestive_cravings.svg'),
  digestive_low_appetite: require('../../../assets/icons/symptoms/digestive_low_appetite.svg'),
  digestive_gas: require('../../../assets/icons/symptoms/digestive_gas.svg'),
  digestive_hunger: require('../../../assets/icons/symptoms/digestive_hunger.svg'),
  digestive_dyspepsia: require('../../../assets/icons/symptoms/digestive_dyspepsia.svg'),

  // Physical
  physical_bloating: require('../../../assets/icons/symptoms/physical_bloating.svg'),
  physical_fatigue: require('../../../assets/icons/symptoms/physical_fatigue.svg'),
  physical_insomnia: require('../../../assets/icons/symptoms/physical_insomnia.svg'),
  physical_nausea: require('../../../assets/icons/symptoms/physical_nausea.svg'),
  physical_dizziness: require('../../../assets/icons/symptoms/physical_dizziness.svg'),
  physical_discharge: require('../../../assets/icons/symptoms/physical_discharge.svg'),

  // Skin
  skin_acne: require('../../../assets/icons/symptoms/skin_acne.svg'),
  skin_oily_skin: require('../../../assets/icons/symptoms/skin_oily_skin.svg'),
  skin_dry_skin: require('../../../assets/icons/symptoms/skin_dry_skin.svg'),
  skin_rash: require('../../../assets/icons/symptoms/skin_rash.svg'),

  // Mood
  mood_anxious: require('../../../assets/icons/symptoms/mood_anxious.svg'),
  mood_calm: require('../../../assets/icons/symptoms/mood_calm.svg'),
  mood_confident: require('../../../assets/icons/symptoms/mood_confident.svg'),
  mood_emotional: require('../../../assets/icons/symptoms/mood_emotional.svg'),
  mood_energetic: require('../../../assets/icons/symptoms/mood_energetic.svg'),
  mood_exhausted: require('../../../assets/icons/symptoms/mood_exhausted.svg'),
  mood_happy: require('../../../assets/icons/symptoms/mood_happy.svg'),
  mood_in_love: require('../../../assets/icons/symptoms/mood_in_love.svg'),
  mood_irritable: require('../../../assets/icons/symptoms/mood_irritable.svg'),
  mood_relaxed: require('../../../assets/icons/symptoms/mood_relaxed.svg'),
  mood_sad: require('../../../assets/icons/symptoms/mood_sad.svg'),
  mood_stressed: require('../../../assets/icons/symptoms/mood_stressed.svg'),
  mood_tired: require('../../../assets/icons/symptoms/mood_tired.svg'),

  // Other
  other_fever: require('../../../assets/icons/symptoms/other_fever.svg'),
  other_medication: require('../../../assets/icons/symptoms/other_medication.svg'),
  other_spotting: require('../../../assets/icons/symptoms/other_spotting.svg'),
  other_test: require('../../../assets/icons/symptoms/other_test.svg'),
}

interface SvgSymptomIconProps {
  name: string
  size: number
  color?: string
}

/**
 * Renders an SVG symptom/mood icon
 * Note: Color customization is limited with SVG/Image approach in React Native.
 * For color override, use VelaIcon with vector-icon fallback instead.
 */
export function SvgSymptomIcon({ name, size, color }: SvgSymptomIconProps) {
  const source = SVG_ICON_MAP[name]
  
  if (!source) {
    return <View style={{ width: size, height: size, backgroundColor: 'transparent' }} />
  }

  return (
    <Image
      source={source}
      style={[styles.icon, { width: size, height: size }]}
      resizeMode="contain"
    />
  )
}

/**
 * Check if an icon name is a valid SVG symptom icon
 */
export function isSvgSymptomIcon(name: string): boolean {
  return name in SVG_ICON_MAP
}

const styles = StyleSheet.create({
  icon: {
    resizeMode: 'contain',
  },
})
