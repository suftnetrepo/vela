import React from 'react'
import { Stack, StyledText } from 'fluent-styles'
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

  if (lengths.length < 2) return null

  const min   = Math.min(...lengths)
  const max   = Math.max(...lengths)
  const avg   = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length)
  const range = max - min

  const regularity      = range <= 3 ? 'Very regular' : range <= 7 ? 'Mostly regular' : 'Irregular'
  const regularityIcon: VelaIconName = range <= 3 ? 'star-filled' : range <= 7 ? 'check-circle' : 'activity'
  const regularityColor = range <= 3 ? Colors.success : range <= 7 ? Colors.warning : Colors.primary

  return (
    <Stack backgroundColor={Colors.surface} borderRadius={20} padding={20} gap={14}
      shadowColor="#000" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.06}
      shadowRadius={10} elevation={2}>
      <StyledText fontSize={17} fontWeight="700" color={Colors.textPrimary}>
        Pattern Summary
      </StyledText>

      <Stack horizontal gap={8}>
        {([
          { label: 'Shortest', value: `${min}d`, icon: 'chevron-left'  as VelaIconName, color: Colors.success },
          { label: 'Average',  value: `${avg}d`, icon: 'cycle'         as VelaIconName, color: Colors.primary },
          { label: 'Longest',  value: `${max}d`, icon: 'chevron-right' as VelaIconName, color: Colors.warning },
        ] as { label: string; value: string; icon: VelaIconName; color: string }[]).map(item => (
          <Stack key={item.label} flex={1} backgroundColor={Colors.surfaceAlt} borderRadius={14}
            padding={12} alignItems="center" gap={6}>
            <Stack width={32} height={32} borderRadius={16} backgroundColor={Colors.surface}
              alignItems="center" justifyContent="center">
              <VelaIcon name={item.icon} size={16} color={item.color} />
            </Stack>
            <StyledText fontSize={18} fontWeight="800" color={Colors.textPrimary}>{item.value}</StyledText>
            <StyledText fontSize={10} color={Colors.textTertiary} fontWeight="600">
              {item.label.toUpperCase()}
            </StyledText>
          </Stack>
        ))}
      </Stack>

      <Stack horizontal alignItems="center" gap={10} backgroundColor={Colors.primaryFaint}
        borderRadius={12} padding={12}>
        <Stack flex={1} gap={2}>
          <StyledText fontSize={13} fontWeight="600" color={Colors.textPrimary}>Cycle regularity</StyledText>
          <StyledText fontSize={12} color={Colors.textTertiary}>Based on last {lengths.length} cycles</StyledText>
        </Stack>
        <Stack horizontal alignItems="center" gap={6} backgroundColor={Colors.surface}
          borderRadius={10} paddingHorizontal={10} paddingVertical={6}>
          <VelaIcon name={regularityIcon} size={13} color={regularityColor} />
          <StyledText fontSize={12} fontWeight="700" color={regularityColor}>{regularity}</StyledText>
        </Stack>
      </Stack>
    </Stack>
  )
}
