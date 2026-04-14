import React from 'react'
import { Stack, StyledText, StyledPressable } from 'fluent-styles'
import { useColors } from '../../hooks/useColors'
import { MOODS } from '../../constants/moods'
import { VelaIcon } from '../shared/VelaIcon'

interface MoodSelectorProps {
  value?:   string
  onChange: (key: string) => void
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  const Colors = useColors()

  return (
    <Stack gap={12}>
      <Stack horizontal alignItems="center" gap={8}>
        <VelaIcon name="heart" size={17} color={Colors.primary} />
        <StyledText fontSize={15} fontWeight="700" color={Colors.textPrimary}>Mood</StyledText>
      </Stack>
      <Stack horizontal gap={8} flexWrap="wrap">
        {MOODS.map(m => {
          const isActive = value === m.key
          return (
            <StyledPressable
              key={m.key}
              onPress={() => onChange(m.key)}
              backgroundColor={isActive ? Colors.primaryFaint : Colors.surfaceAlt}
              borderRadius={20}
              paddingHorizontal={14}
              paddingVertical={9}
              borderWidth={isActive ? 2 : 1}
              borderColor={isActive ? Colors.primary : Colors.border}
              flexDirection="row"
              alignItems="center"
              gap={6}
            >
              <StyledText fontSize={16}>{m.emoji}</StyledText>
              <StyledText fontSize={13} fontWeight={isActive ? '700' : '500'}
                color={isActive ? Colors.primaryDark : Colors.textSecondary}>
                {m.label}
              </StyledText>
            </StyledPressable>
          )
        })}
      </Stack>
    </Stack>
  )
}
