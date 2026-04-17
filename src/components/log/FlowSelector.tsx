import React from 'react'
import { Stack, StyledText, StyledPressable } from 'fluent-styles'
import { Text } from '../text'
import { useColors } from '../../hooks/useColors'
import { FLOW_LEVELS } from '../../constants/moods'
import { VelaIcon } from '../shared/VelaIcon'

interface FlowSelectorProps {
  value?:    string
  onChange:  (key: string) => void
}

export function FlowSelector({ value, onChange }: FlowSelectorProps) {
  const Colors = useColors()

  return (
    <Stack gap={12}>
      <Stack horizontal alignItems="center" gap={8}>
        <VelaIcon name="drop" size={17} color={Colors.primary} />
        <StyledText fontSize={15} fontWeight="700" color={Colors.textPrimary}>Flow</StyledText>
      </Stack>
      <Stack horizontal gap={8} flexWrap="wrap">
        {FLOW_LEVELS.map(f => {
          const isActive = value === f.key
          return (
            <StyledPressable
              key={f.key}
              onPress={() => onChange(f.key)}
              backgroundColor={isActive ? Colors.primary : Colors.surfaceAlt}
              borderRadius={20}
              paddingHorizontal={16}
              paddingVertical={10}
              borderWidth={isActive ? 0 : 1}
              borderColor={Colors.border}
              alignItems="center"
              gap={4}
            >
              <StyledText fontSize={13} fontWeight="600" color={isActive ? Colors.textInverse : Colors.textSecondary}>
                {f.label}
              </StyledText>
              {f.drops > 0 && (
                <Stack horizontal gap={2}>
                  {Array.from({ length: f.drops }).map((_, i) => (
                    <Stack
                      key={i}
                      width={5}
                      height={5}
                      borderRadius={3}
                      backgroundColor={isActive ? 'rgba(255,255,255,0.7)' : Colors.primaryLight}
                    />
                  ))}
                </Stack>
              )}
            </StyledPressable>
          )
        })}
      </Stack>
    </Stack>
  )
}
