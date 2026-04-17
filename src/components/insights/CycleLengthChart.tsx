import React from 'react'
import { Dimensions } from 'react-native'
import { Stack, StyledText } from 'fluent-styles'
import { Text } from '@/components/text'
import { useColors } from '../../hooks/useColors'
import { VelaIcon } from '../shared/VelaIcon'
import type { Cycle } from '../../db/schema'
import { format, parseISO } from '../../utils/date'

const SCREEN_W   = Dimensions.get('window').width
const CHART_H    = 140
const BAR_RADIUS = 8

interface CycleLengthChartProps {
  cycles: Cycle[]
}

export function CycleLengthChart({ cycles }: CycleLengthChartProps) {
  const Colors = useColors()

  const completed = (cycles ?? [])
    .filter(c => c.cycleLength != null && c.cycleLength > 0)
    .slice(-8)

  if (completed.length < 2) {
    return (
      <Stack backgroundColor={Colors.surface} borderRadius={20} padding={28}
        alignItems="center" gap={12}
        shadowColor="#000" shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.06} shadowRadius={10} elevation={2}>
        <Stack width={52} height={52} borderRadius={26} backgroundColor={Colors.primaryFaint}
          alignItems="center" justifyContent="center">
          <VelaIcon name="tab-insights" size={26} color={Colors.primary} />
        </Stack>
        <Text fontSize={14} color={Colors.textSecondary} textAlign="center">
          Track at least 2 cycles to see your length chart.
        </Text>
      </Stack>
    )
  }

  const lengths  = completed.map(c => c.cycleLength!)
  const avg      = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length)
  const maxVal   = Math.max(...lengths)
  const minVal   = Math.min(...lengths)
  const range    = Math.max(maxVal - minVal + 6, 10)
  const lastIdx  = completed.length - 1
  const chartW   = SCREEN_W - 88

  const slotW = chartW / completed.length
  const barW  = Math.floor(slotW * 0.55)

  return (
    <Stack backgroundColor={Colors.surface} borderRadius={20} padding={20} gap={14}
      shadowColor="#000" shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.06} shadowRadius={10} elevation={2}>

      <Stack horizontal alignItems="center" justifyContent="space-between">
        <Text fontSize={17} fontWeight="700" color={Colors.textPrimary}>
          Cycle Length
        </Text>
        <Stack backgroundColor={Colors.primaryFaint} borderRadius={10}
          paddingHorizontal={10} paddingVertical={4}>
          <Text fontSize={12} color={Colors.primaryDark} fontWeight="600">
            avg {avg} days
          </Text>
        </Stack>
      </Stack>

      <Stack height={CHART_H + 22}>
        <Stack height={CHART_H} horizontal alignItems="flex-end">
          {completed.map((c, i) => {
            const len   = c.cycleLength!
            const isLast = i === lastIdx
            const barH  = Math.max(((len - minVal + 3) / range) * (CHART_H - 24), 12)

            return (
              <Stack key={c.id ?? i} width={slotW} alignItems="center"
                justifyContent="flex-end" height={CHART_H}>
                {isLast && (
                  <Text fontSize={11} fontWeight="700"
                    color={Colors.primary} marginBottom={3}>
                    {len}d
                  </Text>
                )}
                <Stack width={barW} height={barH} borderRadius={BAR_RADIUS}
                  backgroundColor={isLast ? Colors.primary : Colors.border} />
              </Stack>
            )
          })}
        </Stack>

        <Stack horizontal marginTop={4}>
          {completed.map((c, i) => (
            <Stack key={i} width={slotW} alignItems="center">
              <Text
                fontSize={9}
                color={i === lastIdx ? Colors.primaryDark : Colors.textTertiary}
                fontWeight={i === lastIdx ? '700' : '400'}>
                {format(parseISO(c.startDate), 'MMM')}
              </Text>
            </Stack>
          ))}
        </Stack>
      </Stack>

      <Stack horizontal gap={8}>
        {[
          { label: 'Shortest', value: `${Math.min(...lengths)}d`, color: Colors.success },
          { label: 'Average',  value: `${avg}d`,                  color: Colors.primary },
          { label: 'Longest',  value: `${Math.max(...lengths)}d`, color: Colors.warning },
        ].map(s => (
          <Stack key={s.label} flex={1} backgroundColor={Colors.surfaceAlt}
            borderRadius={12} padding={10} alignItems="center" gap={3}>
            <Text fontSize={15} fontWeight="800" color={s.color}>{s.value}</Text>
            <Text fontSize={10} color={Colors.textTertiary} fontWeight="600">
              {s.label.toUpperCase()}
            </Text>
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}
