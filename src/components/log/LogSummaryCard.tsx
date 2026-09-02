import React from 'react'
import { Stack, StyledPressable } from 'fluent-styles'
import { Text } from '@/components/text'
import { useColors } from '../../hooks/useColors'
import { VelaIcon } from '../shared/VelaIcon'
import type { FlowData } from './FlowTab'
import type { JournalData } from './JournalTab'

export function LogSummaryCard({ flow, journal, symptomCount, onEdit }: { flow: FlowData; journal: JournalData; symptomCount: number; onEdit?: () => void }) {
  const Colors = useColors()
  const mood = journal.moods[0] ? journal.moods[0].replace(/_/g, ' ') : 'Not logged'
  const flowValue = flow.hasFlow === true ? (flow.level ?? 'Flow') : flow.hasFlow === false ? 'No flow' : 'Not logged'
  const items = [
    { icon: 'drop', value: flowValue, label: 'Flow', color: Colors.primary },
    { icon: 'heart', value: mood, label: 'Mood', color: '#D08A2E' },
    { icon: 'activity', value: `${journal.energyLevel} / 5`, label: 'Energy', color: '#9B51E0' },
    { icon: 'phase-fertile', value: `${symptomCount} symptom${symptomCount === 1 ? '' : 's'}`, label: 'Symptoms', color: '#20BFA9' },
  ]
  return <Stack backgroundColor={Colors.surface} borderRadius={20} padding={16} gap={14} borderWidth={1} borderColor={Colors.border} shadowColor="#000" shadowOffset={{width:0,height:3}} shadowOpacity={0.04} shadowRadius={10}>
    <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
      <Text fontSize={16} fontWeight="800" color={Colors.textPrimary}>Today’s summary</Text>
      {onEdit && <StyledPressable onPress={onEdit} flexDirection="row" gap={6} alignItems="center" accessibilityRole="button" accessibilityLabel="Edit today's log"><VelaIcon name="edit" size={14} color={Colors.primary}/><Text fontSize={13} fontWeight="700" color={Colors.primary}>Edit</Text></StyledPressable>}
    </Stack>
    <Stack flexDirection="row" flexWrap="wrap" gap={10}>
      {items.map((item, i) => <Stack key={item.label} width="48%" minHeight={72} borderRadius={15} padding={12} flexDirection="row" alignItems="center" gap={10} backgroundColor={i === 0 ? Colors.primaryFaint : Colors.inputBackground} borderWidth={1} borderColor={Colors.border} accessible accessibilityLabel={`${item.label}: ${item.value}`}>
        <Stack width={36} height={36} borderRadius={18} alignItems="center" justifyContent="center" backgroundColor={Colors.surface}><VelaIcon name={item.icon as any} size={18} color={item.color}/></Stack>
        <Stack flex={1}><Text numberOfLines={1} textTransform="capitalize" fontSize={14} fontWeight="800" color={item.color}>{item.value}</Text><Text fontSize={11} color={Colors.textTertiary}>{item.label}</Text></Stack>
      </Stack>)}
    </Stack>
  </Stack>
}
