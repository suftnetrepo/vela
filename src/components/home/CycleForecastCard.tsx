import React from 'react'
import { ScrollView, View } from 'react-native'
import { Stack, StyledPressable } from 'fluent-styles'
import { addDays, differenceInDays, format } from 'date-fns'
import { Text } from '@/components/text'
import { useColors } from '../../hooks/useColors'
import type { CyclePrediction } from '../../algorithm/prediction'
import type { PredictionConfidence } from '../../algorithm/confidence'
import { VelaIcon } from '../shared/VelaIcon'
import type { VelaIconName } from '../shared/VelaIcon'

interface Props {
  prediction: CyclePrediction | null
  confidence?: PredictionConfidence | null
  onViewTimeline?: () => void
  layout?: 'scroll' | 'grid'
}

function shortRange(start: Date, end: Date) {
  if (format(start, 'MMM') === format(end, 'MMM')) return `${format(start, 'MMM d')}–${format(end, 'd')}`
  return `${format(start, 'MMM d')}–${format(end, 'MMM d')}`
}

export function CycleForecastCard({ prediction, confidence, onViewTimeline, layout = 'scroll' }: Props) {
  const Colors = useColors()
  if (!prediction) return null

  const cycleLength = Math.max(1, prediction.averageCycleLength)
  const periodDays = Math.min(prediction.averagePeriodLength, cycleLength)
  const cycleStart = addDays(prediction.nextPeriodStart, -cycleLength)
  const periodEnd = addDays(cycleStart, periodDays - 1)
  const ovulationOffset = Math.max(0, Math.min(1, differenceInDays(prediction.ovulationDay, prediction.fertileWindowStart) / Math.max(1, differenceInDays(prediction.fertileWindowEnd, prediction.fertileWindowStart))))

  const items: Array<{ label: string; value: string; icon: VelaIconName; color: string; bg: string }> = [
    { label: 'Period', value: shortRange(cycleStart, periodEnd), icon: 'drop', color: Colors.dayPeriod, bg: Colors.primaryFaint },
    { label: 'Fertile Window', value: shortRange(prediction.fertileWindowStart, prediction.fertileWindowEnd), icon: 'flower', color: Colors.fertile, bg: `${Colors.fertile}12` },
    { label: 'Ovulation', value: format(prediction.ovulationDay, 'MMM d'), icon: 'phase-ovulation', color: Colors.ovulation, bg: `${Colors.ovulation}0C` },
    { label: 'Next Period', value: `${format(prediction.nextPeriodStart, 'MMM d')}${confidence ? ` ± ${confidence.rangeDays}d` : ''}`, icon: 'calendar', color: Colors.primary, bg: Colors.primaryFaint },
  ]

  const renderItem = (item: typeof items[number], index: number, grid = false) => (
    <Stack
      key={item.label}
      flex={grid ? 1 : undefined}
      width={grid ? undefined : 168}
      minHeight={grid ? 124 : 132}
      marginRight={grid ? 0 : 12}
      padding={14}
      borderRadius={20}
      backgroundColor={item.bg}
      borderWidth={1}
      borderColor={`${item.color}24`}
      shadowColor={item.color}
      shadowOffset={{ width: 0, height: 3 }}
      shadowOpacity={0.06}
      shadowRadius={8}
      elevation={1}
      overflow="hidden"
    >
      <Stack horizontal alignItems="center" gap={9}>
        <Stack width={34} height={34} borderRadius={11} alignItems="center" justifyContent="center" backgroundColor={`${item.color}18`}>
          <VelaIcon name={item.icon} size={18} color={item.color} />
        </Stack>
        <Text flex={1} fontSize={13} fontWeight="700" color={Colors.textPrimary} lineHeight={17} numberOfLines={2}>
          {item.label}
        </Text>
      </Stack>
      <Text fontSize={grid ? 17 : 15} fontWeight={grid ? '700' : '500'} color={grid ? Colors.textPrimary : Colors.textSecondary} marginTop={13} numberOfLines={1}>
        {item.value}
      </Text>
      <Stack marginTop="auto" height={5} borderRadius={3} backgroundColor={`${item.color}26`} overflow="visible">
        <Stack height={5} width={index === 2 ? '72%' : '100%'} borderRadius={3} backgroundColor={item.color} opacity={0.82} />
        {index === 2 && (
          <Stack position="absolute" left={`${Math.round(ovulationOffset * 68)}%`} top={-4} width={13} height={13} borderRadius={7} backgroundColor={item.color} borderWidth={2} borderColor={Colors.surface} />
        )}
      </Stack>
    </Stack>
  )

  return (
    <Stack
      backgroundColor={Colors.surface}
      borderRadius={24}
      padding={16}
      borderWidth={1}
      borderColor={Colors.border}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 3 }}
      shadowOpacity={0.04}
      shadowRadius={12}
      elevation={2}
      overflow="hidden"
    >
      <Stack horizontal alignItems="center" justifyContent="space-between" marginBottom={14}>
        <Text fontSize={11} fontWeight="700" letterSpacing={1.15} color={Colors.textTertiary}>CYCLE FORECAST</Text>
        {onViewTimeline && (
          <StyledPressable onPress={onViewTimeline} flexDirection="row" alignItems="center" gap={3} paddingVertical={4} paddingLeft={8}>
            <Text fontSize={11} fontWeight="600" color={Colors.textSecondary}>See full timeline</Text>
            <VelaIcon name="chevron-right" size={13} color={Colors.textTertiary} />
          </StyledPressable>
        )}
      </Stack>

      {layout === 'grid' ? (
        // Two explicit rows of two equal-width (flex:1) cards each, rather
        // than a flexWrap grid — flexWrap + percentage widths degenerated
        // into one card per line (each expanding to fill its own line), so
        // this pairs the cards directly: no wrap, no percentage math.
        <Stack gap={10}>
          <Stack flexDirection="row" gap={10}>
            {renderItem(items[0], 0, true)}
            {renderItem(items[1], 1, true)}
          </Stack>
          <Stack flexDirection="row" gap={10}>
            {renderItem(items[2], 2, true)}
            {renderItem(items[3], 3, true)}
          </Stack>
        </Stack>
      ) : (
        <>
          <View style={{ marginHorizontal: -16 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 2 }}
              decelerationRate="fast"
            >
              {items.map((item, index) => renderItem(item, index))}
            </ScrollView>
          </View>
          <Stack horizontal alignItems="center" justifyContent="center" gap={5} marginTop={10}>
            {items.map((item, index) => (
              <Stack key={`${item.label}-dot`} width={index === 0 ? 16 : 5} height={5} borderRadius={3} backgroundColor={index === 0 ? Colors.textTertiary : Colors.border} opacity={index === 0 ? 0.45 : 0.8} />
            ))}
          </Stack>
        </>
      )}
    </Stack>
  )
}
