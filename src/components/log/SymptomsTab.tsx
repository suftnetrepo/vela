import React, { useState, useMemo } from 'react'
import { ActivityIndicator } from 'react-native'
import { Stack, StyledText, StyledPressable, StyledTextInput, Collapse } from 'fluent-styles'
import { router } from 'expo-router'
import { useColors } from '../../hooks/useColors'
import { useSymptoms } from '../../hooks/useSymptoms'
import { VelaIcon } from '../shared/VelaIcon'
import type { VelaIconName } from '../shared/VelaIcon'

// Mapping of symptom keys to icon names - used for display
const SYMPTOM_ICON_MAP: Record<string, VelaIconName> = {
  cramps: 'cramps',
  abdominal_cramps: 'cramps',
  headache: 'headache',
  migraine: 'headache',
  backache: 'activity',
  low_back_pain: 'activity',
  breast_pain: 'heart',
  tender_breasts: 'heart',
  breast_sensitivity: 'heart',
  pelvic_pain: 'activity',
  bloating: 'bloating',
  fatigue: 'fatigue',
  nausea: 'nausea',
  dizziness: 'activity',
  acne: 'acne',
  oily_skin: 'sun',
  dry_skin: 'sun',
  constipation: 'activity',
  diarrhea: 'activity',
  appetite_up: 'heart',
  appetite_down: 'sun',
  insomnia: 'moon',
  hot_flashes: 'zap',
  cervical_mucus: 'activity',
}

// Category display labels with proper casing
const CATEGORY_LABELS: Record<string, string> = {
  pain: 'Pain',
  physical: 'Physical',
  digestive: 'Digestive',
  skin: 'Skin',
  cervical: 'Cervical',
  other: 'Other',
}

interface SymptomsTabProps {
  selected: string[]
  onChange: (keys: string[]) => void
}

// ─── Symptom emoji chip ──────────────────────────────────────────────────────
function SymptomChip({
  symptomKey, emoji, label, selected, onPress,
}: {
  symptomKey: string
  emoji: string
  label: string
  selected: boolean
  onPress: () => void
}) {
  const Colors = useColors()
  const icon = SYMPTOM_ICON_MAP[symptomKey] || 'activity'
  
  return (
    <StyledPressable onPress={onPress} alignItems="center" gap={6} width={72}>
      <Stack
        width={60} height={60} borderRadius={16}
        backgroundColor={selected ? Colors.primaryFaint : Colors.surfaceAlt}
        borderWidth={selected ? 2 : 1.5}
        borderColor={selected ? Colors.primary : Colors.border}
        alignItems="center" justifyContent="center"
        shadowColor={selected ? Colors.primary : '#000'}
        shadowOffset={{ width: 0, height: selected ? 2 : 1 }}
        shadowOpacity={selected ? 0.12 : 0.04}
        shadowRadius={selected ? 6 : 3}
        elevation={selected ? 2 : 1}
      >
        <VelaIcon name={icon} size={26}
          color={selected ? Colors.primary : Colors.textSecondary} />
      </Stack>
      <StyledText fontSize={11} fontWeight={selected ? '700' : '400'}
        color={selected ? Colors.primaryDark : Colors.textSecondary}
        textAlign="center" numberOfLines={2}>
        {label}
      </StyledText>
    </StyledPressable>
  )
}



// ─── Main component ───────────────────────────────────────────────────────────
export function SymptomsTab({ selected, onChange }: SymptomsTabProps) {
  const Colors                      = useColors()
  const { visibleSymptoms, loading } = useSymptoms()
  const [search,    setSearch]      = useState('')

  const toggleSymptom = (key: string) => {
    onChange(
      selected.includes(key)
        ? selected.filter(k => k !== key)
        : [...selected, key]
    )
  }

  // Filter symptoms by search
  const filtered = useMemo(() => {
    if (!search.trim()) return visibleSymptoms
    const q = search.toLowerCase()
    return visibleSymptoms.filter(s =>
      s.label.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    )
  }, [search, visibleSymptoms])

  // Group filtered symptoms by category
  const groupedFiltered = useMemo(() => {
    const groups: Record<string, typeof filtered> = {}
    for (const s of filtered) {
      if (!groups[s.category]) groups[s.category] = []
      groups[s.category].push(s)
    }
    return groups
  }, [filtered])

  const categoriesToShow = Object.keys(groupedFiltered)
    .sort((a, b) => a.localeCompare(b))

  const totalSelected = selected.length

  return (
    <Stack gap={12}>

      {/* ── Search ───────────────────────────────────────────────────────── */}
      <StyledTextInput
        variant="filled"
        placeholder="Search symptoms…"
        value={search}
        onChangeText={setSearch}
        leftIcon={<VelaIcon name="search" size={16} color={Colors.textTertiary} />}
        clearable
        focusColor={Colors.primary}
      />

      {/* ── Selected count pill ───────────────────────────────────────────── */}
      {totalSelected > 0 && (
        <Stack
          backgroundColor={Colors.primaryFaint}
          borderRadius={12}
          paddingHorizontal={14}
          paddingVertical={8}
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          borderWidth={1}
          borderColor={Colors.border}
        >
          <StyledText fontSize={13} fontWeight="600" color={Colors.primaryDark}>
            {totalSelected} item{totalSelected > 1 ? 's' : ''} selected
          </StyledText>
          <StyledPressable onPress={() => onChange([])}>
            <StyledText fontSize={12} color={Colors.primary} fontWeight="600">
              Clear all
            </StyledText>
          </StyledPressable>
        </Stack>
      )}

      {/* ── Symptom categories ────────────────────────────────────────────── */}
      {categoriesToShow.length === 0 && loading ? (
        <Stack alignItems="center" paddingVertical={32} gap={12}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <StyledText fontSize={13} color={Colors.textSecondary}>
            Loading symptoms…
          </StyledText>
        </Stack>
      ) : categoriesToShow.length === 0 && search.trim() ? (
        <Stack alignItems="center" paddingVertical={32} gap={10}>
          <VelaIcon name="search" size={28} color={Colors.textTertiary} />
          <StyledText fontSize={14} color={Colors.textSecondary}>
            No symptoms match "{search}"
          </StyledText>
        </Stack>
      ) : categoriesToShow.length === 0 ? (
        <Stack alignItems="center" paddingVertical={32} gap={10}>
          <VelaIcon name="activity" size={28} color={Colors.textTertiary} />
          <StyledText fontSize={14} color={Colors.textSecondary}>
            No symptoms enabled
          </StyledText>
          <StyledPressable
            onPress={() => router.push('/(app)/(settings)/symptoms')}
            paddingHorizontal={12}
            paddingVertical={6}
            borderRadius={8}
            backgroundColor={Colors.primaryFaint}
          >
            <StyledText fontSize={12} fontWeight="600" color={Colors.primary}>
              Manage symptoms
            </StyledText>
          </StyledPressable>
        </Stack>
      ) : (
        categoriesToShow.map(cat => {
          const items       = groupedFiltered[cat] ?? []
          const hasSelected = items.some(s => selected.includes(s.key))
          const categoryLabel = CATEGORY_LABELS[cat] || cat

          return (
            <Collapse
              key={cat}
              variant="card"
              title={categoryLabel}
              subtitle={hasSelected ? `${items.filter(s => selected.includes(s.key)).length} selected` : undefined}
            >
              <Stack
                flexDirection="row" flexWrap="wrap"
               paddingBottom={16} gap={10}
              >
                {items.map(symptom => (
                  <SymptomChip
                    key={symptom.key}
                    symptomKey={symptom.key}
                    emoji={symptom.emoji}
                    label={symptom.label}
                    selected={selected.includes(symptom.key)}
                    onPress={() => toggleSymptom(symptom.key)}
                  />
                ))}
              </Stack>
            </Collapse>
          )
        })
      )}
    </Stack>
  )
}

