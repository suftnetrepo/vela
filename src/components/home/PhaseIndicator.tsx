import React from 'react'
import { Stack, StyledText } from 'fluent-styles'
import { Text } from '../text'
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
        <StyledText fontSize={13} fontWeight="600" color={Colors.textSecondary}>
          {phaseName(phase)}
        </StyledText>
        <StyledText fontSize={12} color={Colors.textTertiary}>
          Day {cycleDay} / {cycleLength}
        </StyledText>
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
