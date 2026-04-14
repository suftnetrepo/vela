import React from 'react'
import { Stack, StyledText, StyledPressable } from 'fluent-styles'
import { useColors } from '../../hooks/useColors'
import type { CyclePrediction } from '../../algorithm/prediction'
import { phaseName, phaseDescription } from '../../algorithm/prediction'
import { daysUntilText } from '../../utils/date'
import { VelaIcon } from '../shared/VelaIcon'
import type { VelaIconName } from '../shared/VelaIcon'

interface TodayCardProps {
  prediction:  CyclePrediction | null
  onLogPress?: () => void
}

const PHASE_ICON: Record<string, VelaIconName> = {
  menstrual:        'phase-menstrual',
  follicular:       'phase-follicular',
  ovulation:        'phase-ovulation',
  fertile:          'phase-fertile',
  luteal:           'phase-luteal',
  predicted_period: 'phase-predicted',
}

const PHASE_COLOR_KEY: Record<string, string> = {
  menstrual:        'dayPeriod',
  follicular:       'success',
  ovulation:        'ovulation',
  fertile:          'fertile',
  luteal:           'primary',
  predicted_period: 'primaryLight',
}

export function TodayCard({ prediction, onLogPress }: TodayCardProps) {
  const Colors = useColors()

  if (!prediction) {
    return (
      <Stack backgroundColor={Colors.surface} borderRadius={24} padding={24} gap={16}
        shadowColor="#000" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.06}
        shadowRadius={12} elevation={3}>
        <Stack horizontal alignItems="center" gap={12}>
          <Stack width={48} height={48} borderRadius={24} backgroundColor={Colors.primaryFaint}
            alignItems="center" justifyContent="center">
            <VelaIcon name="flower" size={26} color={Colors.primary} />
          </Stack>
          <Stack flex={1} gap={2}>
            <StyledText fontSize={18} fontWeight="800" color={Colors.textPrimary}>
              Welcome to Vela
            </StyledText>
            <StyledText fontSize={13} color={Colors.textSecondary}>
              Log your first period to start tracking
            </StyledText>
          </Stack>
        </Stack>
        {onLogPress && (
          <StyledPressable backgroundColor={Colors.primary} borderRadius={20}
            paddingHorizontal={20} paddingVertical={12} alignSelf="flex-start"
            onPress={onLogPress} flexDirection="row" alignItems="center" gap={8}>
            <VelaIcon name="edit" size={15} color={Colors.textInverse} />
            <StyledText fontSize={14} fontWeight="700" color={Colors.textInverse}>
              Log today
            </StyledText>
          </StyledPressable>
        )}
      </Stack>
    )
  }

  const iconName   = PHASE_ICON[prediction.currentPhase] ?? 'flower'
  const phaseColor = (Colors as any)[PHASE_COLOR_KEY[prediction.currentPhase]] ?? Colors.primary

  return (
    <Stack backgroundColor={Colors.primaryFaint} borderRadius={24} padding={20} gap={16}
      borderWidth={1} borderColor={Colors.border}>

      {/* Phase header */}
      <Stack horizontal alignItems="center" justifyContent="space-between">
        <Stack gap={6} flex={1}>
          <StyledText fontSize={12} color={Colors.textTertiary} fontWeight="700" letterSpacing={0.8}>
            CYCLE DAY {prediction.currentCycleDay}
          </StyledText>
          <Stack horizontal alignItems="center" gap={10}>
            <Stack width={40} height={40} borderRadius={20} backgroundColor={Colors.surface}
              alignItems="center" justifyContent="center"
              shadowColor="#000" shadowOffset={{ width: 0, height: 1 }}
              shadowOpacity={0.08} shadowRadius={4} elevation={2}>
              <VelaIcon name={iconName} size={22} color={phaseColor} />
            </Stack>
            <StyledText fontSize={22} fontWeight="800" color={Colors.textPrimary}>
              {phaseName(prediction.currentPhase)}
            </StyledText>
          </Stack>
        </Stack>

        {/* Cycle day ring */}
        <Stack width={64} height={64} borderRadius={32} backgroundColor={Colors.primaryLight}
          alignItems="center" justifyContent="center" borderWidth={3} borderColor={Colors.primary}>
          <StyledText fontSize={20} fontWeight="800" color={Colors.primaryDark}>
            {prediction.currentCycleDay}
          </StyledText>
        </Stack>
      </Stack>

      {/* Description */}
      <StyledText fontSize={14} color={Colors.textSecondary} lineHeight={21}>
        {phaseDescription(prediction.currentPhase)}
      </StyledText>

      {/* Next period row */}
      <Stack backgroundColor={Colors.surface} borderRadius={16} padding={14}
        horizontal alignItems="center" justifyContent="space-between">
        <Stack horizontal alignItems="center" gap={10}>
          <Stack width={34} height={34} borderRadius={17} backgroundColor={Colors.primaryFaint}
            alignItems="center" justifyContent="center">
            <VelaIcon name="phase-predicted" size={18} color={Colors.primary} />
          </Stack>
          <Stack gap={2}>
            <StyledText fontSize={11} color={Colors.textTertiary} fontWeight="700">NEXT PERIOD</StyledText>
            <StyledText fontSize={16} fontWeight="800" color={Colors.textPrimary}>
              {daysUntilText(prediction.daysUntilNextPeriod)}
            </StyledText>
          </Stack>
        </Stack>

        <Stack horizontal alignItems="center" gap={8}>
          {prediction.confidenceDays > 1 && (
            <Stack backgroundColor={Colors.warningLight} borderRadius={10}
              paddingHorizontal={8} paddingVertical={4}>
              <StyledText fontSize={11} color={Colors.warning} fontWeight="600">
                ±{prediction.confidenceDays}d
              </StyledText>
            </Stack>
          )}
          {onLogPress && (
            <StyledPressable backgroundColor={Colors.primary} borderRadius={20}
              paddingHorizontal={14} paddingVertical={8} onPress={onLogPress}
              flexDirection="row" alignItems="center" gap={6}>
              <VelaIcon name="edit" size={13} color={Colors.textInverse} />
              <StyledText fontSize={13} fontWeight="700" color={Colors.textInverse}>Log</StyledText>
            </StyledPressable>
          )}
        </Stack>
      </Stack>
    </Stack>
  )
}
