/**
 * CycleTrendsCard
 * 
 * Two stat tiles (avg period length + avg cycle length) with icons,
 * followed by the current cycle section showing the phase pill bar.
 * Matches screenshot 2 exactly.
 */

import React from 'react'
import { Stack, StyledText, StyledPressable, StyledCard, theme } from 'fluent-styles'
import { Text } from '@/components/text'
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
    <StyledCard backgroundColor={Colors.surface} borderRadius={24}  shadow='light' >

      {/* Header */}
      <Stack flexDirection="row" alignItems="center" justifyContent="space-between"
        paddingHorizontal={20} paddingTop={20} paddingBottom={16}>
        <Stack gap={2}>
          <Text fontSize={18} fontWeight="800" color={Colors.textPrimary}>
            Cycle trends
          </Text>
          <Text fontSize={13} color={Colors.textSecondary}>
            Average of the last 7 cycles
          </Text>
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
        <Stack flex={1} backgroundColor={Colors.surfaceAlt} borderRadius={20} padding={18} gap={10}
          position="relative" overflow="hidden">
          <Stack gap={4}>
            <Text fontSize={28} fontWeight="800" color={Colors.textPrimary}>
              {prediction.averagePeriodLength} days
            </Text>
            <Text fontSize={13} color={Colors.textPrimary}>
              Avg. period length
            </Text>
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
        <Stack flex={1} backgroundColor={Colors.surfaceAlt} borderRadius={20} padding={18} gap={10}
          position="relative" overflow="hidden">
          <Stack gap={4}>
            <Text fontSize={28} fontWeight="800" color={Colors.textPrimary}>
              {prediction.averageCycleLength} days
            </Text>
            <Text fontSize={13} color={Colors.textPrimary}>
              Avg. cycle length
            </Text>
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
          <Text fontSize={16} fontWeight="700" color={Colors.textPrimary}>
            Current cycle
          </Text>
          <Stack flexDirection="row" alignItems="center" gap={8}>
            <Text fontSize={14} color={Colors.textSecondary}>
              {currentDay} days
            </Text>
            {startedText && (
              <>
                <Stack width={3} height={3} borderRadius={2}
                  backgroundColor={Colors.textTertiary} />
                <Text fontSize={14} color={Colors.textSecondary}>
                  {startedText}
                </Text>
              </>
            )}
          </Stack>
        </Stack>

        <CyclePhasePillBar
          prediction={prediction}
          currentDay={currentDay}
        />
      </Stack>
    </StyledCard>
  )
}
