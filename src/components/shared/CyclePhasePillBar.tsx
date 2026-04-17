/**
 * CyclePhasePillBar
 * 
 * Renders a horizontal row of rounded pill-shaped segments, one per cycle day.
 * Each pill is coloured by its phase — exactly matching the screenshot.
 * 
 * Phase colours:
 *   menstrual  → primary (rose/pink)
 *   follicular → warm yellow
 *   fertile    → teal/cyan
 *   ovulation  → teal (same as fertile but slightly brighter)
 *   luteal     → soft sage/green
 *   remaining  → light grey (future days not yet reached)
 */

import React from 'react'
import { Dimensions } from 'react-native'
import { Stack, StyledText } from 'fluent-styles'
import { Text } from '@/components/text'
import { useColors } from '../../hooks/useColors'
import type { CyclePrediction } from '../../algorithm/prediction'

interface CyclePhasePillBarProps {
  prediction:      CyclePrediction
  currentDay:      number   // 1-based day of current cycle
  totalDays?:      number   // override cycle length
  showLabel?:      boolean
  compact?:        boolean  // smaller pills for home screen
}

// Phase colour map — independent of theme so the visualisation
// always looks like the reference screenshot
const PHASE_COLORS = {
  menstrual:  '#F87171',  // coral/rose
  follicular: '#FCD34D',  // warm yellow
  fertile:    '#5EEAD4',  // teal
  ovulation:  '#2DD4BF',  // brighter teal for the peak day
  luteal:     '#86EFAC',  // soft green
  remaining:  '#E5E7EB',  // light grey — not yet reached
}

function getPhaseForDay(
  day: number,
  avgPeriod: number,
  avgCycle:  number,
  ovulationDay: number, // cycle day of ovulation
  fertileStart: number, // cycle day fertile window opens
  fertileEnd:   number, // cycle day fertile window closes
): keyof typeof PHASE_COLORS {
  if (day > avgCycle) return 'remaining'
  if (day <= avgPeriod) return 'menstrual'
  if (day === ovulationDay) return 'ovulation'
  if (day >= fertileStart && day <= fertileEnd) return 'fertile'
  if (day < fertileStart) return 'follicular'
  return 'luteal'
}

export function CyclePhasePillBar({
  prediction,
  currentDay,
  totalDays,
  showLabel = false,
  compact   = false,
}: CyclePhasePillBarProps) {
  const Colors  = useColors()
  const W       = Dimensions.get('window').width
  const cycle   = totalDays ?? prediction.averageCycleLength

  // Calculate ovulation + fertile window as cycle-day numbers
  const ovulDay    = cycle - 14                              // luteal is always 14
  const fertStart  = ovulDay - 5
  const fertEnd    = ovulDay + 1

  const pillH      = compact ? 28 : 36
  const gap        = compact ? 2  : 3
  const radius     = compact ? 6  : 8
  const pillW      = Math.max(
    compact ? 6 : 8,
    Math.floor((W - 80 - gap * (cycle - 1)) / cycle),
  )

  const pills = Array.from({ length: cycle }, (_, i) => {
    const day        = i + 1
    const phase      = getPhaseForDay(day, prediction.averagePeriodLength, cycle, ovulDay, fertStart, fertEnd)
    const isPast     = day <= currentDay
    const isCurrent  = day === currentDay
    const color      = isPast || phase === 'remaining'
      ? PHASE_COLORS[phase]
      : PHASE_COLORS[phase] + '55'  // future days are translucent

    return { day, phase, color, isCurrent }
  })

  return (
    <Stack gap={6}>
      {showLabel && (
        <Stack flexDirection="row" justifyContent="space-between">
          <Text fontSize={11} color={Colors.textTertiary} fontWeight="600">
            Day 1
          </Text>
          <Text fontSize={11} color={Colors.primary} fontWeight="700">
            Day {currentDay}
          </Text>
          <Text fontSize={11} color={Colors.textTertiary} fontWeight="600">
            Day {cycle}
          </Text>
        </Stack>
      )}
      <Stack flexDirection="row" gap={gap} alignItems="center">
        {pills.map(({ day, color, isCurrent }) => (
          <Stack
            key={day}
            width={pillW}
            height={pillH}
            borderRadius={radius}
            backgroundColor={color}
            // Current day gets a white inner ring
            borderWidth={isCurrent ? 2 : 0}
            borderColor={Colors.surface}
            style={isCurrent ? {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.15,
              shadowRadius: 3,
              elevation: 2,
            } : undefined}
          />
        ))}
      </Stack>
    </Stack>
  )
}
