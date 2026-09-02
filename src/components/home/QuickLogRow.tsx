import React from 'react'
import { Stack, StyledPressable } from 'fluent-styles'
import { Text } from '@/components/text'
import { useColors } from '../../hooks/useColors'
import { VelaIcon } from '../shared/VelaIcon'
import type { VelaIconName } from '../shared/VelaIcon'

interface QuickLogRowProps {
  onFlowPress?:   () => void
  onMoodPress?:   () => void
  onPainPress?:   () => void
  onEnergyPress?: () => void
  onMorePress?:   () => void
  onEditPress?:   () => void
}

export function QuickLogRow({
  onFlowPress,
  onMoodPress,
  onPainPress,
  onEnergyPress,
  onMorePress,
  onEditPress,
}: QuickLogRowProps) {
  const Colors = useColors()

  // Each quick-log item gets its own existing Vela feedback/brand color
  // (no new hex values) so the row reads at a glance the way the mock does,
  // instead of every icon sharing one tint.
  const items: {
    icon: VelaIconName
    label: string
    hint:  string
    color: string
    onPress?: () => void
  }[] = [
    { icon: 'drop',        label: 'Flow',   hint: 'Log today’s flow',    color: Colors.error,   onPress: onFlowPress },
    { icon: 'heart',       label: 'Mood',   hint: 'Log today’s mood',    color: Colors.fertile, onPress: onMoodPress },
    { icon: 'activity',    label: 'Pain',   hint: 'Log today’s symptoms', color: Colors.warning, onPress: onPainPress },
    { icon: 'zap',         label: 'Energy', hint: 'Log today’s energy',  color: Colors.primary, onPress: onEnergyPress },
    { icon: 'plus-circle', label: 'More',   hint: 'Open the full log screen', color: Colors.ovulation, onPress: onMorePress },
  ]

  return (
    <Stack paddingHorizontal={20} paddingBottom={16} gap={10}>
      <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
        <Text variant="subtitle" color={Colors.textPrimary}>
          Quick log
        </Text>
        {onEditPress && (
          <StyledPressable
            onPress={onEditPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Edit quick log"
          >
            <Text variant="subLabel" fontWeight="600" color={Colors.textTertiary}>
              Edit
            </Text>
          </StyledPressable>
        )}
      </Stack>

      <Stack horizontal gap={8}>
        {items.map((item) => (
          <StyledPressable
            key={item.label}
            flex={1}
            backgroundColor={Colors.surface}
            borderRadius={16}
            paddingVertical={14}
            paddingHorizontal={4}
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
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityHint={item.hint}
          >
            <VelaIcon name={item.icon} size={20} color={item.color} />
            <Text
              fontSize={11}
              fontWeight="600"
              color={Colors.textSecondary}
              textAlign="center"
            >
              {item.label}
            </Text>
          </StyledPressable>
        ))}
      </Stack>
    </Stack>
  )
}
