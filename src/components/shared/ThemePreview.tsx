import React from 'react'
import { Stack, StyledText, StyledPressable } from 'fluent-styles'
import { Text } from '../text'
import { THEMES, type ThemeName } from '../../constants/themes'
import { useColors } from '../../hooks/useColors'
import { useSettingsStore } from '../../stores/settings.store'
import { VelaIcon } from './VelaIcon'

const THEME_LABELS: Record<ThemeName, string> = {
  rose:     'Rose',
  lavender: 'Lavender',
  sage:     'Sage',
  midnight: 'Midnight',
}

const THEME_DESCRIPTIONS: Record<ThemeName, string> = {
  rose:     'Warm pinks & mauves — the classic',
  lavender: 'Soft purples & lilac',
  sage:     'Calming greens & botanicals',
  midnight: 'Dark mode with violet accents',
}

interface ThemePreviewProps {
  onSelect: (name: ThemeName) => void
}

export function ThemePreview({ onSelect }: ThemePreviewProps) {
  const Colors      = useColors()
  const activeTheme = useSettingsStore(s => s.theme)
  const isPremium   = useSettingsStore(s => s.isPremium)

  return (
    <Stack gap={12}>
      {(Object.keys(THEMES) as ThemeName[]).map(name => {
        const t        = THEMES[name]
        const isActive = name === activeTheme
        const locked   = name !== 'rose' && !isPremium

        return (
          <StyledPressable key={name} onPress={() => !locked && onSelect(name)}
            backgroundColor={isActive ? Colors.primaryFaint : Colors.surface}
            borderRadius={20} padding={16} borderWidth={isActive ? 2 : 1}
            borderColor={isActive ? Colors.primary : Colors.border}
            flexDirection="row" alignItems="center" gap={14}>

            {/* Colour swatches */}
            <Stack horizontal gap={4} alignItems="center">
              {[t.primary, t.fertile, t.ovulation, t.surfaceAlt].map((c, i) => (
                <Stack key={i} width={20} height={20} borderRadius={10} backgroundColor={c}
                  borderWidth={1} borderColor="rgba(0,0,0,0.06)" />
              ))}
            </Stack>

            {/* Label + description */}
            <Stack flex={1} gap={3}>
              <Stack horizontal alignItems="center" gap={6}>
                <StyledText fontSize={15} fontWeight="700" color={Colors.textPrimary}>
                  {THEME_LABELS[name]}
                </StyledText>
                {locked && (
                  <Stack backgroundColor={Colors.primaryFaint} borderRadius={8}
                    paddingHorizontal={7} paddingVertical={3} horizontal alignItems="center" gap={3}>
                    <VelaIcon name="crown" size={10} color={Colors.primary} />
                    <StyledText fontSize={10} fontWeight="700" color={Colors.primaryDark}>PRO</StyledText>
                  </Stack>
                )}
              </Stack>
              <StyledText fontSize={12} color={Colors.textTertiary}>
                {THEME_DESCRIPTIONS[name]}
              </StyledText>
            </Stack>

            {/* Active check */}
            {isActive && (
              <Stack width={26} height={26} borderRadius={13} backgroundColor={Colors.primary}
                alignItems="center" justifyContent="center">
                <VelaIcon name="check" size={14} color={Colors.textInverse} />
              </Stack>
            )}
          </StyledPressable>
        )
      })}
    </Stack>
  )
}
