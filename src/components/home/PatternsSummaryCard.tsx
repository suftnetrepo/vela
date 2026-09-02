import React from 'react'
import { View } from 'react-native'
import { Stack, StyledPressable } from 'fluent-styles'
import { Text } from '@/components/text'
import Svg, { Polyline, Circle, Path } from 'react-native-svg'
import { useColors } from '../../hooks/useColors'
import { VelaIcon } from '../shared/VelaIcon'
import type { DetectedPattern } from '../../algorithm/patterns'

const SPARK_W = 44
const SPARK_H = 20

// Small decorative accent for the empty state only — a faint trend line
// connecting a few dots, echoing "a pattern waiting to be found" without
// borrowing VelaInsightCard's flower-petal artwork or gradients.
function PatternsArtwork({ color }: { color: string }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 160 90">
      <Path
        d="M6 66 Q46 30 82 46 T154 18"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1 9"
        opacity={0.5}
      />
      <Circle cx="6" cy="66" r="4" fill={color} opacity={0.55} />
      <Circle cx="82" cy="46" r="3.5" fill={color} opacity={0.42} />
      <Circle cx="154" cy="18" r="5" fill={color} opacity={0.6} />
    </Svg>
  )
}

// Small inline trend sparkline built from each pattern's real per-cycle
// occurrence data (never synthetic) — no charting library needed.
function Sparkline({ trend, color }: { trend: number[]; color: string }) {
  if (trend.length < 2) return null

  const points = trend.map((v, i) => {
    const x = (i / (trend.length - 1)) * (SPARK_W - 4) + 2
    const y = v ? 4 : SPARK_H - 4
    return { x, y }
  })

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ')
  const last = points[points.length - 1]

  return (
    <Svg width={SPARK_W} height={SPARK_H}>
      <Polyline
        points={polylinePoints}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.6}
      />
      <Circle cx={last.x} cy={last.y} r={2.5} fill={color} />
    </Svg>
  )
}

interface PatternsSummaryCardProps {
  patterns:      DetectedPattern[]
  hasHistory:    boolean
  onSeeAll:      () => void
}

export function PatternsSummaryCard({ patterns, hasHistory, onSeeAll }: PatternsSummaryCardProps) {
  const Colors = useColors()

  return (
    <Stack
      backgroundColor={Colors.surface}
      borderRadius={20}
      padding={16}
      gap={14}
      borderWidth={1}
      borderColor={Colors.border}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 1 }}
      shadowOpacity={0.05}
      shadowRadius={8}
      elevation={1}
      overflow="hidden"
    >
      <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
        <Stack flexDirection="row" alignItems="center" gap={10}>
          <Stack width={32} height={32} borderRadius={10} alignItems="center" justifyContent="center" backgroundColor={Colors.primary}>
            <VelaIcon name="activity" size={16} color={Colors.textInverse} />
          </Stack>
          <Text variant="title" color={Colors.textPrimary}>
            Your patterns
          </Text>
        </Stack>
        {patterns.length > 0 && (
          <StyledPressable
            onPress={onSeeAll}
            flexDirection="row"
            alignItems="center"
            gap={2}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="See all patterns"
          >
            <Text variant="subLabel" fontWeight="600" color={Colors.primary}>
              See all
            </Text>
            <VelaIcon name="chevron-right" size={14} color={Colors.primary} />
          </StyledPressable>
        )}
      </Stack>

      {patterns.length === 0 ? (
        <Stack paddingVertical={2}>
          <View
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{ position: 'absolute', right: -8, bottom: -10, width: 168, height: 94, opacity: 0.7 }}
          >
            <PatternsArtwork color={Colors.primary} />
          </View>
          <Stack gap={4} zIndex={2} maxWidth="82%">
            <Text variant="label" color={Colors.textPrimary}>
              {hasHistory ? 'Your patterns are forming' : 'Discover your patterns'}
            </Text>
            <Text variant="subLabel" color={Colors.textSecondary} lineHeight={18}>
              {hasHistory
                ? "Keep logging symptoms and energy — Vela will surface your first pattern once there's enough signal."
                : 'Log a few cycles of symptoms and energy and Vela will start surfacing what repeats.'}
            </Text>
          </Stack>
        </Stack>
      ) : (
        <Stack gap={0}>
          {patterns.map((pattern, idx) => (
            <Stack key={pattern.key}>
              <Stack
                flexDirection="row"
                alignItems="center"
                gap={12}
                paddingVertical={10}
                accessible
                accessibilityLabel={`${pattern.title}. ${pattern.description} Seen in ${pattern.confidencePct}% of recent cycles.`}
              >
                <Stack
                  width={36}
                  height={36}
                  borderRadius={18}
                  backgroundColor={Colors.primaryFaint}
                  alignItems="center"
                  justifyContent="center"
                >
                  <VelaIcon name={pattern.icon} size={18} color={Colors.primary} />
                </Stack>

                <Stack flex={1} gap={2}>
                  <Text variant="label" color={Colors.textPrimary}>
                    {pattern.title}
                  </Text>
                  <Text variant="subLabel" color={Colors.textSecondary} numberOfLines={2}>
                    {pattern.description}
                  </Text>
                </Stack>

                <Stack alignItems="flex-end" gap={2}>
                  <Text variant="label" color={Colors.primary}>
                    {pattern.confidencePct}%
                  </Text>
                  <Text variant="caption" color={Colors.textTertiary}>
                    of cycles
                  </Text>
                  <Sparkline trend={pattern.trend} color={Colors.primary} />
                </Stack>
              </Stack>
              {idx < patterns.length - 1 && (
                <Stack height={1} backgroundColor={Colors.border} />
              )}
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
