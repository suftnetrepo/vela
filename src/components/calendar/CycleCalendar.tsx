import React, { useState, useMemo } from 'react'
import { Dimensions } from 'react-native'
import { Stack, StyledText, StyledPressable } from 'fluent-styles'
import { Text } from '@/components/text'
import { useColors } from '../../hooks/useColors'
import { buildCalendarMap } from '../../algorithm/prediction'
import type { CyclePrediction, DayMeta } from '../../algorithm/prediction'
import type { Cycle } from '../../db/schema'
import {
  startOfMonth, endOfMonth, addDays, format,
  isSameMonth, parseISO,
} from '../../utils/date'
import { buildMonthGrid, formatMonthYear } from '../../utils/date'

const SCREEN_W   = Dimensions.get('window').width
const CELL_SIZE  = Math.floor((SCREEN_W - 48) / 7)

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface CycleCalendarProps {
  prediction:   CyclePrediction | null
  cycles:       Cycle[]
  onDayPress?:  (date: string) => void
  loggedDates?: Set<string>
}

export function CycleCalendar({ prediction, cycles, onDayPress, loggedDates }: CycleCalendarProps) {
  const Colors = useColors()
  const today  = new Date()
  const [monthDate, setMonthDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const grid = useMemo(() => buildMonthGrid(monthDate, 1), [monthDate])

  const dayMap = useMemo(() => {
    if (!prediction) return new Map<string, DayMeta>()
    return buildCalendarMap(
      prediction,
      cycles,
      today,
      startOfMonth(monthDate),
      endOfMonth(monthDate),
    )
  }, [prediction, cycles, monthDate])

  const goBack    = () => setMonthDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const goForward = () => setMonthDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  const getDayStyle = (meta: DayMeta | undefined, date: Date) => {
    if (!meta) return { bg: 'transparent', textColor: Colors.textTertiary, ring: false }

    if (meta.isPeriod)     return { bg: Colors.dayPeriod,    textColor: Colors.dayPeriodText,    ring: false }
    if (meta.isOvulation)  return { bg: Colors.dayOvulation, textColor: Colors.dayOvulationText, ring: false }
    if (meta.isFertile)    return { bg: Colors.dayFertile,   textColor: Colors.dayFertileText,   ring: false }
    if (meta.isPredicted)  return { bg: Colors.dayPredicted, textColor: Colors.dayPredictedText, ring: false }
    if (meta.isToday)      return { bg: 'transparent',       textColor: Colors.textPrimary,      ring: true  }

    return {
      bg:        isSameMonth(date, monthDate) ? Colors.dayDefault : 'transparent',
      textColor: isSameMonth(date, monthDate) ? Colors.dayDefaultText : Colors.textTertiary,
      ring:      false,
    }
  }

  return (
    <Stack gap={0}>
      {/* Header */}
      <Stack horizontal alignItems="center" justifyContent="space-between" paddingHorizontal={4} paddingBottom={16}>
        <StyledPressable onPress={goBack} padding={8} borderRadius={20}>
          <Text fontSize={18} color={Colors.textSecondary}>‹</Text>
        </StyledPressable>
        <Text fontSize={17} fontWeight="700" color={Colors.textPrimary}>
          {formatMonthYear(monthDate)}
        </Text>
        <StyledPressable onPress={goForward} padding={8} borderRadius={20}>
          <Text fontSize={18} color={Colors.textSecondary}>›</Text>
        </StyledPressable>
      </Stack>

      {/* Day labels */}
      <Stack horizontal paddingBottom={8}>
        {DAY_LABELS.map(d => (
          <Stack key={d} flex={1} alignItems="center">
            <Text fontSize={11} color={Colors.textTertiary} fontWeight="600">
              {d}
            </Text>
          </Stack>
        ))}
      </Stack>

      {/* Grid */}
      {grid.map((week, wi) => (
        <Stack key={wi} horizontal marginBottom={4}>
          {week.map((date, di) => {
            if (!date) {
              return <Stack key={di} flex={1} height={CELL_SIZE} />
            }

            const dateStr = format(date, 'yyyy-MM-dd')
            const meta    = dayMap.get(dateStr)
            const style   = getDayStyle(meta, date)
            const hasLog  = loggedDates?.has(dateStr)

            return (
              <StyledPressable
                key={di}
                flex={1}
                height={CELL_SIZE}
                alignItems="center"
                justifyContent="center"
                onPress={() => onDayPress?.(dateStr)}
              >
                <Stack
                  width={CELL_SIZE - 6}
                  height={CELL_SIZE - 6}
                  borderRadius={(CELL_SIZE - 6) / 2}
                  backgroundColor={style.bg}
                  alignItems="center"
                  justifyContent="center"
                  borderWidth={style.ring ? 2 : 0}
                  borderColor={style.ring ? Colors.dayToday : 'transparent'}
                >
                  <Text
                    fontSize={13}
                    fontWeight={meta?.isToday ? '800' : '500'}
                    color={style.textColor}
                  >
                    {format(date, 'd')}
                  </Text>
                  {/* Log dot */}
                  {hasLog && !meta?.isPeriod && (
                    <Stack
                      position="absolute"
                      bottom={2}
                      width={4}
                      height={4}
                      borderRadius={2}
                      backgroundColor={Colors.primary}
                    />
                  )}
                </Stack>
              </StyledPressable>
            )
          })}
        </Stack>
      ))}

      {/* Legend */}
      <Stack horizontal gap={8} flexWrap="wrap"  paddingHorizontal={4}>
        {[
          { color: Colors.dayPeriod,    label: 'Period' },
          { color: Colors.dayFertile,   label: 'Fertile' },
          { color: Colors.dayOvulation, label: 'Ovulation' },
          { color: Colors.dayPredicted, label: 'Predicted' },
        ].map(({ color, label }) => (
          <Stack key={label} horizontal alignItems="center" gap={4}>
            <Stack width={10} height={10} borderRadius={5} backgroundColor={color} />
            <Text fontSize={11} color={Colors.textTertiary}>{label}</Text>
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}
