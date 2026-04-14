import React, { useState, useMemo } from 'react'
import { Stack, StyledText, StyledPressable, StyledTextInput } from 'fluent-styles'
import { useColors } from '../../hooks/useColors'
import { VelaIcon } from '../shared/VelaIcon'
import type { VelaIconName } from '../shared/VelaIcon'

// ─── Symptom catalogue with categories ───────────────────────────────────────
interface SymptomItem {
  key:      string
  label:    string
  icon:     VelaIconName
  category: string
}

const SYMPTOMS: SymptomItem[] = [
  // Pain
  { key: 'cramps',       label: 'Cramps',       icon: 'cramps',      category: 'Pain' },
  { key: 'migraine',     label: 'Migraine',      icon: 'headache',    category: 'Pain' },
  { key: 'leg_pain',     label: 'Leg',           icon: 'activity',    category: 'Pain' },
  { key: 'backache',     label: 'Lower back',    icon: 'activity',    category: 'Pain' },
  { key: 'joint_pain',   label: 'Joint',         icon: 'activity',    category: 'Pain' },
  { key: 'headache',     label: 'Headache',      icon: 'headache',    category: 'Pain' },
  // Mood
  { key: 'anxious',      label: 'Anxiety',       icon: 'mood-anxious',category: 'Mood' },
  { key: 'irritable',    label: 'Irritable',     icon: 'mood-sad',    category: 'Mood' },
  { key: 'mood_swings',  label: 'Mood swings',   icon: 'activity',    category: 'Mood' },
  { key: 'sad',          label: 'Low mood',      icon: 'mood-sad',    category: 'Mood' },
  { key: 'brain_fog',    label: 'Brain fog',     icon: 'moon',        category: 'Mood' },
  // Body
  { key: 'bloating',     label: 'Bloating',      icon: 'bloating',    category: 'Body' },
  { key: 'fatigue',      label: 'Fatigue',       icon: 'fatigue',     category: 'Body' },
  { key: 'nausea',       label: 'Nausea',        icon: 'nausea',      category: 'Body' },
  { key: 'breast_pain',  label: 'Breast pain',   icon: 'heart',       category: 'Body' },
  { key: 'hot_flashes',  label: 'Hot flashes',   icon: 'zap',         category: 'Body' },
  { key: 'insomnia',     label: 'Insomnia',      icon: 'moon',        category: 'Body' },
  { key: 'dizziness',    label: 'Dizziness',     icon: 'activity',    category: 'Body' },
  // Skin & Hair
  { key: 'acne',         label: 'Acne',          icon: 'acne',        category: 'Skin & Hair' },
  { key: 'oily_skin',    label: 'Oily skin',     icon: 'sun',         category: 'Skin & Hair' },
  { key: 'dry_skin',     label: 'Dry skin',      icon: 'sun',         category: 'Skin & Hair' },
  { key: 'oily_hair',    label: 'Oily hair',     icon: 'sun',         category: 'Skin & Hair' },
  { key: 'dry_hair',     label: 'Dry hair',      icon: 'sun',         category: 'Skin & Hair' },
  { key: 'hair_loss',    label: 'Hair loss',     icon: 'sun',         category: 'Skin & Hair' },
  // Digestion
  { key: 'bloated_tummy',label: 'Bloated',       icon: 'bloating',    category: 'Digestion' },
  { key: 'constipation', label: 'Constipation',  icon: 'activity',    category: 'Digestion' },
  { key: 'diarrhea',     label: 'Diarrhoea',     icon: 'activity',    category: 'Digestion' },
  { key: 'cravings',     label: 'Cravings',      icon: 'heart',       category: 'Digestion' },
]

const CATEGORIES = [...new Set(SYMPTOMS.map(s => s.category))]

interface SymptomsTabProps {
  selected: string[]
  onChange: (keys: string[]) => void
}

// ─── Single symptom chip ──────────────────────────────────────────────────────
function SymptomChip({
  symptom, selected, onPress,
}: {
  symptom:  SymptomItem
  selected: boolean
  onPress:  () => void
}) {
  const Colors = useColors()
  return (
    <StyledPressable onPress={onPress} alignItems="center" gap={6} width={72}>
      <Stack
        width={60}
        height={60}
        borderRadius={16}
        backgroundColor={selected ? Colors.primaryFaint : Colors.surfaceAlt}
        borderWidth={selected ? 2 : 1.5}
        borderColor={selected ? Colors.primary : Colors.border}
        alignItems="center"
        justifyContent="center"
        shadowColor={selected ? Colors.primary : '#000'}
        shadowOffset={{ width: 0, height: selected ? 2 : 1 }}
        shadowOpacity={selected ? 0.12 : 0.04}
        shadowRadius={selected ? 6 : 3}
        elevation={selected ? 2 : 1}
      >
        <VelaIcon
          name={symptom.icon}
          size={26}
          color={selected ? Colors.primary : Colors.textSecondary}
        />
      </Stack>
      <StyledText
        fontSize={11}
        fontWeight={selected ? '700' : '400'}
        color={selected ? Colors.primaryDark : Colors.textSecondary}
        textAlign="center"
        numberOfLines={2}
      >
        {symptom.label}
      </StyledText>
    </StyledPressable>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function SymptomsTab({ selected, onChange }: SymptomsTabProps) {
  const Colors            = useColors()
  const [search, setSearch]         = useState('')
  const [collapsed, setCollapsed]   = useState<Record<string, boolean>>({})

  const toggle = (key: string) => {
    onChange(
      selected.includes(key)
        ? selected.filter(k => k !== key)
        : [...selected, key]
    )
  }

  const toggleCategory = (cat: string) => {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }))
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return SYMPTOMS
    const q = search.toLowerCase()
    return SYMPTOMS.filter(s =>
      s.label.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    )
  }, [search])

  const groupedFiltered = useMemo(() => {
    const groups: Record<string, SymptomItem[]> = {}
    for (const s of filtered) {
      if (!groups[s.category]) groups[s.category] = []
      groups[s.category].push(s)
    }
    return groups
  }, [filtered])

  const categoriesToShow = search.trim()
    ? Object.keys(groupedFiltered)
    : CATEGORIES.filter(c => groupedFiltered[c]?.length)

  return (
    <Stack gap={12}>
      {/* Search */}
      <StyledTextInput
        variant="filled"
        placeholder="Search symptoms…"
        value={search}
        onChangeText={setSearch}
        leftIcon={<VelaIcon name="search" size={16} color={Colors.textTertiary} />}
        clearable
        focusColor={Colors.primary}
      />

      {/* Selected count */}
      {selected.length > 0 && (
        <Stack
          backgroundColor={Colors.primaryFaint}
          borderRadius={12}
          paddingHorizontal={14}
          paddingVertical={8}
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <StyledText fontSize={13} fontWeight="600" color={Colors.primaryDark}>
            {selected.length} symptom{selected.length > 1 ? 's' : ''} selected
          </StyledText>
          <StyledPressable onPress={() => onChange([])}>
            <StyledText fontSize={12} color={Colors.primary} fontWeight="600">
              Clear all
            </StyledText>
          </StyledPressable>
        </Stack>
      )}

      {/* Categories */}
      {categoriesToShow.map(cat => {
        const items    = groupedFiltered[cat] ?? []
        const isOpen   = !collapsed[cat]
        const hasSelected = items.some(s => selected.includes(s.key))

        return (
          <Stack
            key={cat}
            backgroundColor={Colors.surface}
            borderRadius={20}
            overflow="hidden"
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 1 }}
            shadowOpacity={0.05}
            shadowRadius={8}
            elevation={1}
          >
            {/* Category header */}
            <StyledPressable
              onPress={() => toggleCategory(cat)}
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              paddingHorizontal={18}
              paddingVertical={14}
            >
              <Stack flexDirection="row" alignItems="center" gap={8}>
                <StyledText fontSize={15} fontWeight="700" color={Colors.textPrimary}>
                  {cat}
                </StyledText>
                {hasSelected && (
                  <Stack
                    width={8} height={8} borderRadius={4}
                    backgroundColor={Colors.primary}
                  />
                )}
              </Stack>
              <VelaIcon
                name={isOpen ? 'chevron-left' : 'chevron-right'}
                size={16}
                color={Colors.textTertiary}
                style={{ transform: [{ rotate: isOpen ? '90deg' : '-90deg' }] }}
              />
            </StyledPressable>

            {/* Symptom grid */}
            {isOpen && (
              <Stack
                flexDirection="row"
                flexWrap="wrap"
                paddingHorizontal={14}
                paddingBottom={16}
                gap={10}
              >
                {items.map(symptom => (
                  <SymptomChip
                    key={symptom.key}
                    symptom={symptom}
                    selected={selected.includes(symptom.key)}
                    onPress={() => toggle(symptom.key)}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        )
      })}

      {categoriesToShow.length === 0 && (
        <Stack alignItems="center" paddingVertical={32} gap={10}>
          <VelaIcon name="search" size={28} color={Colors.textTertiary} />
          <StyledText fontSize={14} color={Colors.textSecondary}>
            No symptoms match "{search}"
          </StyledText>
        </Stack>
      )}
    </Stack>
  )
}
