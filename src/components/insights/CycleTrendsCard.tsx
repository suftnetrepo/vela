/**
 * CycleTrendsCard
 * 
 * Two stat tiles (avg period length + avg cycle length) with icons,
 * followed by the current cycle section showing the phase pill bar.
 * Matches screenshot 2 exactly.
 */

import React from 'react'
import { Stack, StyledText, StyledPressable } from 'fluent-styles'
import { useColors } from '../../hooks/useColors'
import { VelaIcon } from '../shared/VelaIcon'
import { CyclePhasePillBar } from '../shared/CyclePhasePillBar'
import type { CyclePrediction } from '../../algorithm/prediction'
import type { Cycle } from '../../db/schema'
import { format, parseISO, differenceInDays } from 'date-fns'

interface CycleTrendsCardProps {
  prediction:  CyclePrediction
  activeCycle: Cycle | null
  onPress?:    () => void
}

export function CycleTrendsCard({ prediction, activeCycle, onPress }: CycleTrendsCardProps) {
  const Colors = useColors()

  const currentDay = prediction.currentCycleDay
  const startedText = activeCycle
    ? `Started ${format(parseISO(activeCycle.startDate), 'MMM d')}`
    : null

  return (
    <Stack backgroundColor={Colors.surface} borderRadius={24} overflow="hidden"
      shadowColor="#000" shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.07} shadowRadius={12} elevation={3}>

      {/* Header */}
      <Stack flexDirection="row" alignItems="center" justifyContent="space-between"
        paddingHorizontal={20} paddingTop={20} paddingBottom={16}>
        <Stack gap={2}>
          <StyledText fontSize={18} fontWeight="800" color={Colors.textPrimary}>
            Cycle trends
          </StyledText>
          <StyledText fontSize={13} color={Colors.textSecondary}>
            Average of the last 7 cycles
          </StyledText>
        </Stack>
        {onPress && (
          <StyledPressable onPress={onPress} padding={4}>
            <VelaIcon name="chevron-right" size={20} color={Colors.textTertiary} />
          </StyledPressable>
        )}
      </Stack>

      {/* Two stat tiles */}
      <Stack flexDirection="row" paddingHorizontal={20} gap={12} paddingBottom={20}>

        {/* Period length tile — pink */}
        <Stack flex={1} backgroundColor="#FFF1F2" borderRadius={20} padding={18} gap={10}
          position="relative" overflow="hidden">
          <Stack gap={4}>
            <StyledText fontSize={28} fontWeight="800" color={Colors.textPrimary}>
              {prediction.averagePeriodLength} days
            </StyledText>
            <StyledText fontSize={13} color={Colors.textSecondary}>
              Avg. period length
            </StyledText>
          </Stack>
          {/* Icon top-right */}
          <Stack position="absolute" top={14} right={14}
            width={44} height={44} borderRadius={22}
            backgroundColor={Colors.surface}
            alignItems="center" justifyContent="center"
            shadowColor="#000" shadowOffset={{ width: 0, height: 1 }}
            shadowOpacity={0.08} shadowRadius={4} elevation={2}>
            <VelaIcon name="drop" size={22} color="#F87171" />
          </Stack>
        </Stack>

        {/* Cycle length tile — lavender */}
        <Stack flex={1} backgroundColor="#EEF2FF" borderRadius={20} padding={18} gap={10}
          position="relative" overflow="hidden">
          <Stack gap={4}>
            <StyledText fontSize={28} fontWeight="800" color={Colors.textPrimary}>
              {prediction.averageCycleLength} days
            </StyledText>
            <StyledText fontSize={13} color={Colors.textSecondary}>
              Avg. cycle length
            </StyledText>
          </Stack>
          {/* Icon top-right */}
          <Stack position="absolute" top={14} right={14}
            width={44} height={44} borderRadius={22}
            backgroundColor={Colors.surface}
            alignItems="center" justifyContent="center"
            shadowColor="#000" shadowOffset={{ width: 0, height: 1 }}
            shadowOpacity={0.08} shadowRadius={4} elevation={2}>
            <VelaIcon name="cycle" size={22} color="#818CF8" />
          </Stack>
        </Stack>
      </Stack>

      {/* Divider */}
      <Stack height={1} backgroundColor={Colors.border} marginHorizontal={20} />

      {/* Current cycle section */}
      <Stack padding={20} gap={10}>
        <Stack gap={2}>
          <StyledText fontSize={16} fontWeight="700" color={Colors.textPrimary}>
            Current cycle
          </StyledText>
          <Stack flexDirection="row" alignItems="center" gap={8}>
            <StyledText fontSize={14} color={Colors.textSecondary}>
              {currentDay} days
            </StyledText>
            {startedText && (
              <>
                <Stack width={3} height={3} borderRadius={2}
                  backgroundColor={Colors.textTertiary} />
                <StyledText fontSize={14} color={Colors.textSecondary}>
                  {startedText}
                </StyledText>
              </>
            )}
          </Stack>
        </Stack>

        <CyclePhasePillBar
          prediction={prediction}
          currentDay={currentDay}
        />
      </Stack>
    </Stack>
  )
}
