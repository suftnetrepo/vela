import React from 'react'
import { Stack, StyledText, StyledPressable } from 'fluent-styles'
import { useColors } from '../../hooks/useColors'
import { VelaIcon } from '../shared/VelaIcon'
import type { VelaIconName } from '../shared/VelaIcon'

interface QuickLogRowProps {
  onFlowPress?: () => void
  onMoodPress?: () => void
  onSymptomsPress?: () => void
  onNotesPress?: () => void
}

export function QuickLogRow({
  onFlowPress,
  onMoodPress,
  onSymptomsPress,
  onNotesPress,
}: QuickLogRowProps) {
  const Colors = useColors()

  const items: {
    icon: VelaIconName
    label: string
    onPress?: () => void
  }[] = [
    { icon: 'drop', label: 'Flow', onPress: onFlowPress },
    { icon: 'heart', label: 'Mood', onPress: onMoodPress },
    { icon: 'sparkle', label: 'Sxs', onPress: onSymptomsPress },
    { icon: 'edit', label: 'Notes', onPress: onNotesPress },
  ]

  return (
    <Stack paddingHorizontal={20} paddingBottom={16}>
      <Stack horizontal gap={10}>
        {items.map((item) => (
          <StyledPressable
            key={item.label}
            flex={1}
            backgroundColor={Colors.surface}
            borderRadius={16}
            padding={12}
            alignItems="center"
            gap={8}
            borderWidth={1}
            borderColor={Colors.border}
            onPress={item.onPress}
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 1 }}
            shadowOpacity={0.04}
            shadowRadius={4}
            elevation={1}
          >
            <Stack
              width={32}
              height={32}
              borderRadius={16}
              backgroundColor={Colors.primaryFaint}
              alignItems="center"
              justifyContent="center"
            >
              <VelaIcon name={item.icon} size={16} color={Colors.primary} />
            </Stack>
            <StyledText
              fontSize={12}
              fontWeight="600"
              color={Colors.textSecondary}
              textAlign="center"
            >
              {item.label}
            </StyledText>
          </StyledPressable>
        ))}
      </Stack>
    </Stack>
  )
}
