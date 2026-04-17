import React from 'react'
import { Stack, StyledText } from 'fluent-styles'
import { Text } from '../text'
import { useColors } from '../../hooks/useColors'
import { VelaIcon } from '../shared/VelaIcon'
import type { VelaIconName } from '../shared/VelaIcon'
import type { Cycle } from '../../db/schema'

interface PatternSummaryProps {
  cycles: Cycle[]
}

export function PatternSummary({ cycles }: PatternSummaryProps) {
  const Colors = useColors()

  if (cycles.length < 3) return null

  const lengths = cycles
    .filter(c => c.cycleLength != null)
    .map(c => c.cycleLength!)

  const periods = cycles
    .filter(c => c.periodLength != null)
    .map(c => c.periodLength!)

  if (lengths.length < 2) return null

  const min   = Math.min(...lengths)
  const max   = Math.max(...lengths)
  const avg   = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length)
  const range = max - min
  const avgPeriod = periods.length > 0 ? Math.round(periods.reduce((a, b) => a + b, 0) / periods.length) : null

  const regularity      = range <= 3 ? 'Very regular' : range <= 7 ? 'Mostly regular' : 'Irregular'
  const regularityIcon: VelaIconName = range <= 3 ? 'check-circle' : range <= 7 ? 'check-circle' : 'activity'
  const regularityColor = range <= 3 ? Colors.success : range <= 7 ? Colors.warning : Colors.primary

  // Generate plain-language insights
  const insights: string[] = []
  if (range <= 3) {
    insights.push(`Your cycles are very consistent, ranging between ${min} and ${max} days.`)
  } else if (range <= 7) {
    insights.push(`Your cycles are mostly regular, typically between ${min} and ${max} days.`)
  } else {
    insights.push(`Your cycle length varies between ${min} and ${max} days. This is normal.`)
  }
  
  if (avgPeriod) {
    insights.push(`Your period usually lasts about ${avgPeriod} day${avgPeriod !== 1 ? 's' : ''}.`)
  }

  return (
    <Stack backgroundColor={Colors.surface} borderRadius={20} padding={20} gap={14}
      shadowColor="#000" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.06}
      shadowRadius={10} elevation={2}>
      <StyledText fontSize={17} fontWeight="700" color={Colors.textPrimary}>
        Cycle patterns
      </StyledText>

      <Stack horizontal gap={8}>
        {([
          { label: 'Shortest', value: `${min}d` },
          { label: 'Average',  value: `${avg}d` },
          { label: 'Longest',  value: `${max}d` },
        ] as { label: string; value: string }[]).map((item, idx) => (
          <Stack key={item.label} flex={1} backgroundColor={Colors.surfaceAlt} borderRadius={14}
            padding={idx === 1 ? 14 : 12} alignItems="center" gap={4}>
            <StyledText fontSize={idx === 1 ? 18 : 16} fontWeight="800" color={Colors.textPrimary}>{item.value}</StyledText>
            <StyledText fontSize={10} color={Colors.textTertiary} fontWeight={idx === 1 ? "600" : "500"}>
              {item.label}
            </StyledText>
          </Stack>
        ))}
      </Stack>

      <Stack gap={8}>
        {insights.map((insight, idx) => (
          <StyledText key={idx} fontSize={13} color={Colors.textSecondary} lineHeight={19}>
            {insight}
          </StyledText>
        ))}
      </Stack>

      <Stack horizontal alignItems="center" gap={8} backgroundColor={Colors.primaryFaint}
        borderRadius={12} paddingHorizontal={12} paddingVertical={8}>
        <Stack flex={1} gap={0.5}>
          <StyledText fontSize={12} fontWeight="600" color={Colors.textPrimary}>{regularity}</StyledText>
          <StyledText fontSize={11} color={Colors.textTertiary}>Based on {lengths.length} cycles</StyledText>
        </Stack>
        <VelaIcon name={regularityIcon} size={16} color={regularityColor} />
      </Stack>
    </Stack>
  )
}
