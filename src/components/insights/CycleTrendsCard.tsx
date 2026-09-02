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
  cyclesUsed?: number
  onPress?:    () => void
  // Home-only additions — all default to the existing Insights-screen
  // appearance when omitted, so this component stays pixel-identical there.
  showProgressLegend?: boolean
  onEditCycleLength?:  () => void
  // Home's "Current cycle progress" mock is a compact bar, not the full
  // Cycle Trends card — compact drops the "Cycle trends" header and the two
  // avg-length stat tiles, showing just the progress section.
  compact?: boolean
}

export function CycleTrendsCard({
  prediction, activeCycle, cyclesUsed, onPress,
  showProgressLegend = false, onEditCycleLength, compact = false,
}: CycleTrendsCardProps) {
  const Colors = useColors()

  const currentDay = prediction.currentCycleDay
  const startedText = activeCycle
    ? `Started ${format(parseISO(activeCycle.startDate), 'MMM d')}`
    : null

  return (
    <StyledCard backgroundColor={Colors.surface} borderRadius={24}  shadow='light' >

      {/* Header — hidden in compact mode (Home shows its own section title) */}
      {!compact && (
        <Stack flexDirection="row" alignItems="center" justifyContent="space-between"
          paddingHorizontal={20} paddingTop={20} paddingBottom={16}>
          <Stack gap={2}>
            <Text variant="title" color={Colors.textPrimary}>
              Cycle trends
            </Text>
            <Text variant="body" color={Colors.textSecondary}>
              {cyclesUsed
                ? `Average of the last ${cyclesUsed} cycle${cyclesUsed === 1 ? '' : 's'}`
                : 'Average of your recent cycles'}
            </Text>
          </Stack>
          {onPress && (
            <StyledPressable
              onPress={onPress}
              padding={4}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="View cycle trends details"
            >
              <VelaIcon name="chevron-right" size={20} color={Colors.textTertiary} />
            </StyledPressable>
          )}
        </Stack>
      )}

      {/* Two stat tiles — Insights screen only; Home's compact progress card omits these */}
      {!compact && (
        <Stack flexDirection="row" paddingHorizontal={20} gap={12} paddingBottom={20}>

          {/* Period length tile — pink */}
          <Stack flex={1} backgroundColor={Colors.surfaceAlt} borderRadius={20} padding={18} gap={10}
            position="relative" overflow="hidden">
            <Stack gap={4}>
              {/* Prominent stat numbers: 28/800 is intentionally between metric (18/800) and display (32/800) */}
              <Text fontSize={28} fontWeight="800" color={Colors.textPrimary}>
                {prediction.averagePeriodLength} days
              </Text>
              <Text variant="body" color={Colors.textPrimary}>
                Avg. period
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
              {/* Prominent stat numbers: 28/800 is intentionally between metric (18/800) and display (32/800) */}
              <Text fontSize={28} fontWeight="800" color={Colors.textPrimary}>
                {prediction.averageCycleLength} days
              </Text>
              <Text variant="body" color={Colors.textPrimary}>
                Avg. cycle
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
      )}

      {/* Divider */}
      {!compact && <Stack height={1} backgroundColor={Colors.border} marginHorizontal={20} />}

      {/* Current cycle section */}
      <Stack padding={20} gap={10}>
        <Stack flexDirection="row" alignItems="flex-start" justifyContent="space-between" gap={8}>
          <Stack gap={2} flex={1}>
            <Text variant="subtitle" color={Colors.textPrimary}>
              {compact ? 'Current cycle progress' : 'Current cycle'}
            </Text>
            <Stack flexDirection="row" alignItems="center" gap={8}>
              <Text variant="body" color={Colors.textSecondary}>
                {currentDay} days
              </Text>
              {startedText && (
                <>
                  <Stack width={3} height={3} borderRadius={2}
                    backgroundColor={Colors.textTertiary} />
                  <Text variant="body" color={Colors.textSecondary}>
                    {startedText}
                  </Text>
                </>
              )}
            </Stack>
          </Stack>

          {onEditCycleLength && (
            <StyledPressable
              onPress={onEditCycleLength}
              flexDirection="row"
              alignItems="center"
              gap={4}
              paddingHorizontal={10}
              paddingVertical={6}
              borderRadius={12}
              backgroundColor={Colors.surfaceAlt}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`${prediction.averageCycleLength}-day cycle`}
              accessibilityHint="Edit your average cycle length"
            >
              <Text variant="caption" fontWeight="600" color={Colors.textSecondary}>
                {prediction.averageCycleLength}-day cycle
              </Text>
              <VelaIcon name="edit" size={11} color={Colors.textSecondary} />
            </StyledPressable>
          )}
        </Stack>

        <CyclePhasePillBar
          prediction={prediction}
          currentDay={currentDay}
          showLegend={showProgressLegend}
        />
      </Stack>
    </StyledCard>
  )
}