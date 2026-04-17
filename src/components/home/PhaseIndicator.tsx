import React from 'react'
import { Stack, StyledText } from 'fluent-styles'
import { Text } from '@/components/text'
import { useColors } from '../../hooks/useColors'
import type { CyclePhase } from '../../algorithm/prediction'
import { phaseName } from '../../algorithm/prediction'

interface PhaseIndicatorProps {
  phase:       CyclePhase
  cycleDay:    number
  cycleLength: number
}

const PHASE_ORDER: CyclePhase[] = ['menstrual', 'follicular', 'fertile', 'ovulation', 'luteal']

export function PhaseIndicator({ phase, cycleDay, cycleLength }: PhaseIndicatorProps) {
  const Colors   = useColors()
  const progress = Math.min(cycleDay / cycleLength, 1)

  return (
    <Stack gap={8}>
      <Stack horizontal alignItems="center" justifyContent="space-between">
        <Text fontSize={13} fontWeight="600" color={Colors.textSecondary}>
          {phaseName(phase)}
        </Text>
        <Text fontSize={12} color={Colors.textTertiary}>
          Day {cycleDay} / {cycleLength}
        </Text>
      </Stack>
      <Stack height={6} backgroundColor={Colors.border} borderRadius={3} overflow="hidden">
        <Stack
          height={6}
          borderRadius={3}
          backgroundColor={Colors.primary}
          width={`${progress * 100}%` as any}
        />
      </Stack>
    </Stack>
  )
}
