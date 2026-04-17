/**
 * CycleRhythmChart
 * 
 * Dual line chart showing cycle length AND period length across the last 7 cycles.
 * Matches the screenshot: two separate shaded line graphs on the same SVG canvas.
 * 
 * Purple line + purple tint = cycle days
 * Pink line + pink tint    = period days
 * Hollow circle data points, month labels on X axis, day numbers on Y axis.
 */

import React from 'react'
import { Dimensions } from 'react-native'
import { Stack, StyledText } from 'fluent-styles'
import { Text } from '@/components/text'
import Svg, {
  Path, Circle, Line, Text as SvgText,
  Defs, LinearGradient, Stop,
} from 'react-native-svg'
import { useColors } from '../../hooks/useColors'
import type { Cycle } from '../../db/schema'
import { format, parseISO } from 'date-fns'

const W          = Dimensions.get('window').width
const CHART_W    = W - 48
const CHART_H    = 200
const PAD_LEFT   = 32
const PAD_RIGHT  = 12
const PAD_TOP    = 16
const PAD_BOTTOM = 36
const PLOT_W     = CHART_W - PAD_LEFT - PAD_RIGHT
const PLOT_H     = CHART_H - PAD_TOP - PAD_BOTTOM

const CYCLE_COLOR  = '#818CF8'   // indigo/purple — matches screenshot
const PERIOD_COLOR = '#FB7185'   // rose/pink — matches screenshot
const CYCLE_FILL   = '#818CF820'
const PERIOD_FILL  = '#FB718520'

interface Props {
  cycles: Cycle[]
}

function buildPath(
  points: { x: number; y: number }[],
): string {
  if (points.length < 2) return ''
  return points.reduce((acc, p, i) =>
    i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '')
}

function buildFill(
  points: { x: number; y: number }[],
  baseline: number,
): string {
  if (points.length < 2) return ''
  const line = buildPath(points)
  return `${line} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`
}

export function CycleRhythmChart({ cycles }: Props) {
  const Colors = useColors()

  // Need at least 2 completed cycles with lengths
  const completed = cycles
    .filter(c => c.cycleLength != null && c.periodLength != null)
    .slice(-7)

  if (completed.length < 2) {
    return (
      <Stack backgroundColor={Colors.surface} borderRadius={20} padding={20}
        alignItems="center" gap={10}
        shadowColor="#000" shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.06} shadowRadius={10} elevation={2}>
        <Text fontSize={14} color={Colors.textSecondary} textAlign="center">
          Log at least 2 complete cycles to see your rhythm chart.
        </Text>
      </Stack>
    )
  }

  const cycleLengths  = completed.map(c => c.cycleLength!)
  const periodLengths = completed.map(c => c.periodLength!)

  const allValues = [...cycleLengths, ...periodLengths]
  const yMin      = Math.max(0, Math.floor(Math.min(...allValues) / 5) * 5 - 5)
  const yMax      = Math.ceil(Math.max(...allValues) / 5) * 5 + 5
  const yRange    = yMax - yMin

  const avgCycle  = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
  const avgPeriod = Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)

  const toX = (i: number) =>
    PAD_LEFT + (i / (completed.length - 1)) * PLOT_W

  const toY = (val: number) =>
    PAD_TOP + PLOT_H - ((val - yMin) / yRange) * PLOT_H

  const cyclePoints  = completed.map((_, i) => ({ x: toX(i), y: toY(cycleLengths[i])  }))
  const periodPoints = completed.map((_, i) => ({ x: toX(i), y: toY(periodLengths[i]) }))

  const baseline = PAD_TOP + PLOT_H

  // Y-axis grid lines at every 10 days
  const gridValues: number[] = []
  for (let v = Math.ceil(yMin / 10) * 10; v <= yMax; v += 10) {
    gridValues.push(v)
  }

  return (
    <Stack backgroundColor={Colors.surface} borderRadius={20} overflow="hidden"
      shadowColor="#000" shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.06} shadowRadius={10} elevation={2}>

      {/* Header */}
      <Stack padding={20} paddingBottom={4} gap={2}>
        <Text fontSize={17} fontWeight="700" color={Colors.textPrimary}>
          Cycle rhythm
        </Text>
        <Text fontSize={13} color={Colors.textSecondary}>
          Average of the last {completed.length} cycles
        </Text>
      </Stack>

      {/* Chart */}
      <Stack paddingHorizontal={4}>
        <Svg width={CHART_W} height={CHART_H}>
          <Defs>
            <LinearGradient id="cycleFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={CYCLE_COLOR} stopOpacity="0.15" />
              <Stop offset="100%" stopColor={CYCLE_COLOR} stopOpacity="0.02" />
            </LinearGradient>
            <LinearGradient id="periodFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={PERIOD_COLOR} stopOpacity="0.15" />
              <Stop offset="100%" stopColor={PERIOD_COLOR} stopOpacity="0.02" />
            </LinearGradient>
          </Defs>

          {/* Grid lines + Y labels */}
          {gridValues.map(v => {
            const y = toY(v)
            return (
              <React.Fragment key={v}>
                <Line
                  x1={PAD_LEFT} y1={y}
                  x2={CHART_W - PAD_RIGHT} y2={y}
                  stroke={Colors.border}
                  strokeWidth={0.5}
                  strokeDasharray="3 3"
                  opacity={0.5}
                />
                <SvgText
                  x={PAD_LEFT - 6} y={y + 4}
                  fontSize={10} fill={Colors.textTertiary}
                  textAnchor="end">
                  {v}
                </SvgText>
              </React.Fragment>
            )
          })}

          {/* Cycle fill + line */}
          <Path d={buildFill(cyclePoints, baseline)} fill="url(#cycleFill)" />
          <Path d={buildPath(cyclePoints)}
            stroke={CYCLE_COLOR} strokeWidth={2} fill="none"
            strokeLinecap="round" strokeLinejoin="round" />

          {/* Period fill + line */}
          <Path d={buildFill(periodPoints, baseline)} fill="url(#periodFill)" />
          <Path d={buildPath(periodPoints)}
            stroke={PERIOD_COLOR} strokeWidth={2} fill="none"
            strokeLinecap="round" strokeLinejoin="round" />

          {/* Avg cycle label */}
          <SvgText
            x={CHART_W - PAD_RIGHT - 8}
            y={toY(avgCycle) - 8}
            fontSize={9} fontWeight="600"
            fill={CYCLE_COLOR} textAnchor="end">
            {avgCycle}d
          </SvgText>

          {/* Avg period label */}
          <SvgText
            x={CHART_W - PAD_RIGHT - 8}
            y={toY(avgPeriod) - 8}
            fontSize={9} fontWeight="600"
            fill={PERIOD_COLOR} textAnchor="end">
            {avgPeriod}d
          </SvgText>

          {/* Cycle dots — hollow circles */}
          {cyclePoints.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y}
              r={4} fill={Colors.surface}
              stroke={CYCLE_COLOR} strokeWidth={2} />
          ))}

          {/* Period dots — hollow circles */}
          {periodPoints.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y}
              r={4} fill={Colors.surface}
              stroke={PERIOD_COLOR} strokeWidth={2} />
          ))}

          {/* X-axis month labels — every other label to reduce density */}
          {completed.map((c, i) => {
            const showLabel = completed.length <= 3 || i % 2 === 0 || i === completed.length - 1
            return showLabel ? (
              <SvgText key={i}
                x={toX(i)} y={CHART_H - 4}
                fontSize={9} fill={Colors.textTertiary}
                textAnchor="middle">
                {format(parseISO(c.startDate), 'MMM')}
                {' '}
                {format(parseISO(c.startDate), 'd')}
              </SvgText>
            ) : null
          })}
        </Svg>
      </Stack>

      {/* Legend */}
      <Stack flexDirection="row" gap={20} paddingHorizontal={20} paddingBottom={16} paddingTop={4}>
        {[
          { color: PERIOD_COLOR, label: 'Period days' },
          { color: CYCLE_COLOR,  label: 'Cycle days'  },
        ].map(({ color, label }) => (
          <Stack key={label} flexDirection="row" alignItems="center" gap={6}>
            <Stack width={10} height={10} borderRadius={5}
              backgroundColor="transparent"
              borderWidth={2} borderColor={color} />
            <Text fontSize={12} color={Colors.textSecondary}>{label}</Text>
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}
