import React from 'react'
import { Stack, StyledText, StyledPressable } from 'fluent-styles'
import { useColors } from '../../hooks/useColors'
import { SYMPTOMS } from '../../constants/symptoms'
import { VelaIcon } from '../shared/VelaIcon'

interface SymptomGridProps {
  selected: string[]
  onChange: (keys: string[]) => void
}

const CATEGORIES = ['pain', 'physical', 'digestive', 'skin', 'mood'] as const

export function SymptomGrid({ selected, onChange }: SymptomGridProps) {
  const Colors = useColors()

  const toggle = (key: string) => {
    onChange(
      selected.includes(key)
        ? selected.filter(k => k !== key)
        : [...selected, key]
    )
  }

  return (
    <Stack gap={16}>
      <Stack horizontal alignItems="center" gap={8}>
        <VelaIcon name="activity" size={17} color={Colors.primary} />
        <StyledText fontSize={15} fontWeight="700" color={Colors.textPrimary}>Symptoms</StyledText>
      </Stack>
      {CATEGORIES.map(cat => {
        const items = SYMPTOMS.filter(s => s.category === cat)
        return (
          <Stack key={cat} gap={8}>
            <StyledText fontSize={12} fontWeight="600" color={Colors.textTertiary} letterSpacing={0.5}>
              {cat.toUpperCase()}
            </StyledText>
            <Stack horizontal gap={8} flexWrap="wrap">
              {items.map(s => {
                const isActive = selected.includes(s.key)
                return (
                  <StyledPressable
                    key={s.key}
                    onPress={() => toggle(s.key)}
                    backgroundColor={isActive ? Colors.primaryFaint : Colors.surfaceAlt}
                    borderRadius={20}
                    paddingHorizontal={12}
                    paddingVertical={8}
                    borderWidth={isActive ? 2 : 1}
                    borderColor={isActive ? Colors.primary : Colors.border}
                    flexDirection="row"
                    alignItems="center"
                    gap={5}
                    marginBottom={4}
                  >
                    <StyledText fontSize={14}>{s.emoji}</StyledText>
                    <StyledText
                      fontSize={13}
                      fontWeight={isActive ? '700' : '400'}
                      color={isActive ? Colors.primaryDark : Colors.textSecondary}
                    >
                      {s.label}
                    </StyledText>
                  </StyledPressable>
                )
              })}
            </Stack>
          </Stack>
        )
      })}
    </Stack>
  )
}
