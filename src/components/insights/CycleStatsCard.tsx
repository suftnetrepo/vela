import React from 'react'
import { Stack, StyledText } from 'fluent-styles'
import { Text } from '@/components/text'
import { useColors } from '../../hooks/useColors'
import { VelaIcon } from '../shared/VelaIcon'
import type { VelaIconName } from '../shared/VelaIcon'
import type { CyclePrediction } from '../../algorithm/prediction'
import type { Cycle } from '../../db/schema'
import { formatShortDate, parseISO } from '../../utils/date'

interface CycleStatsCardProps {
  prediction: CyclePrediction | null
  cycles:     Cycle[]
}

export function CycleStatsCard({ prediction, cycles }: CycleStatsCardProps) {
  const Colors = useColors()

  const lastCycle   = cycles.length > 0 ? cycles[cycles.length - 1] : null
  const totalCycles = cycles.length

  const stats: { label: string; value: string; icon: VelaIconName; color: string }[] = [
    { label: 'Avg cycle',       value: prediction ? `${prediction.averageCycleLength} days` : '—', icon: 'cycle',           color: Colors.primary },
    { label: 'Avg period',      value: prediction ? `${prediction.averagePeriodLength} days` : '—', icon: 'phase-menstrual', color: Colors.dayPeriod },
    { label: 'Last period',     value: lastCycle ? formatShortDate(parseISO(lastCycle.startDate)) : '—', icon: 'calendar',  color: Colors.textSecondary },
    { label: 'Cycles tracked',  value: totalCycles > 0 ? `${totalCycles}` : '—',                    icon: 'activity',       color: Colors.success },
    { label: 'Next period',     value: prediction ? formatShortDate(prediction.nextPeriodStart) : '—', icon: 'phase-predicted', color: Colors.primary },
    { label: 'Ovulation',       value: prediction ? formatShortDate(prediction.ovulationDay) : '—',  icon: 'phase-ovulation', color: Colors.ovulation },
  ]

  return (
    <Stack backgroundColor={Colors.surface} borderRadius={20} padding={20}
      shadowColor="#000" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.06}
      shadowRadius={10} elevation={2}>
      <Text fontSize={17} fontWeight="700" color={Colors.textPrimary} marginBottom={16}>
        Cycle Stats
      </Text>
      <Stack horizontal flexWrap="wrap" gap={0}>
        {stats.map((stat, i) => (
          <Stack key={stat.label} width="50%" paddingBottom={12}
            paddingRight={i % 2 === 0 ? 6 : 0} paddingLeft={i % 2 === 1 ? 6 : 0}>
            <Stack backgroundColor={Colors.surfaceAlt} borderRadius={14} padding={14} gap={8}>
              <Stack horizontal alignItems="center" gap={8}>
                <Stack width={28} height={28} borderRadius={8} backgroundColor={Colors.surface}
                  alignItems="center" justifyContent="center">
                  <VelaIcon name={stat.icon} size={15} color={stat.color} />
                </Stack>
                <Text fontSize={10} color={Colors.textTertiary} fontWeight="700" letterSpacing={0.3}>
                  {stat.label.toUpperCase()}
                </Text>
              </Stack>
              <Text fontSize={18} fontWeight="800" color={Colors.textPrimary}>
                {stat.value}
              </Text>
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}
