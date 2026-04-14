import React, { useState, useMemo } from 'react'
import { Stack, StyledText, StyledPressable, StyledTextInput } from 'fluent-styles'
import { router } from 'expo-router'
import { useColors } from '../../hooks/useColors'
import { useMoods } from '../../hooks/useMoods'
import { VelaIcon } from '../shared/VelaIcon'
import type { VelaIconName } from '../shared/VelaIcon'

// ─── Symptom catalogue ────────────────────────────────────────────────────────
interface SymptomItem {
  key:      string
  label:    string
  icon:     VelaIconName
  category: string
}

const SYMPTOMS: SymptomItem[] = [
  // Pain
  { key: 'cramps',        label: 'Cramps',      icon: 'cramps',       category: 'Pain'       },
  { key: 'migraine',      label: 'Migraine',    icon: 'headache',     category: 'Pain'       },
  { key: 'leg_pain',      label: 'Leg',         icon: 'activity',     category: 'Pain'       },
  { key: 'backache',      label: 'Lower back',  icon: 'activity',     category: 'Pain'       },
  { key: 'joint_pain',    label: 'Joint',       icon: 'activity',     category: 'Pain'       },
  { key: 'headache',      label: 'Headache',    icon: 'headache',     category: 'Pain'       },
  // Body
  { key: 'bloating',      label: 'Bloating',    icon: 'bloating',     category: 'Body'       },
  { key: 'fatigue',       label: 'Fatigue',     icon: 'fatigue',      category: 'Body'       },
  { key: 'nausea',        label: 'Nausea',      icon: 'nausea',       category: 'Body'       },
  { key: 'breast_pain',   label: 'Breast pain', icon: 'heart',        category: 'Body'       },
  { key: 'hot_flashes',   label: 'Hot flashes', icon: 'zap',          category: 'Body'       },
  { key: 'insomnia',      label: 'Insomnia',    icon: 'moon',         category: 'Body'       },
  { key: 'dizziness',     label: 'Dizziness',   icon: 'activity',     category: 'Body'       },
  // Skin & Hair
  { key: 'acne',          label: 'Acne',        icon: 'acne',         category: 'Skin & Hair'},
  { key: 'oily_skin',     label: 'Oily skin',   icon: 'sun',          category: 'Skin & Hair'},
  { key: 'dry_skin',      label: 'Dry skin',    icon: 'sun',          category: 'Skin & Hair'},
  { key: 'oily_hair',     label: 'Oily hair',   icon: 'sun',          category: 'Skin & Hair'},
  { key: 'dry_hair',      label: 'Dry hair',    icon: 'sun',          category: 'Skin & Hair'},
  { key: 'hair_loss',     label: 'Hair loss',   icon: 'sun',          category: 'Skin & Hair'},
  // Digestion
  { key: 'bloated_tummy', label: 'Bloated',     icon: 'bloating',     category: 'Digestion'  },
  { key: 'constipation',  label: 'Constipation',icon: 'activity',     category: 'Digestion'  },
  { key: 'diarrhea',      label: 'Diarrhoea',   icon: 'activity',     category: 'Digestion'  },
  { key: 'cravings',      label: 'Cravings',    icon: 'heart',        category: 'Digestion'  },
]

// Mood keys are stored with this prefix in the symptoms array
export const MOOD_KEY_PREFIX = 'mood_'

const SYMPTOM_CATEGORIES = [...new Set(SYMPTOMS.map(s => s.category))]

interface SymptomsTabProps {
  selected: string[]
  onChange: (keys: string[]) => void
}

// ─── Symptom icon tile ────────────────────────────────────────────────────────
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
        <VelaIcon name={symptom.icon} size={26}
          color={selected ? Colors.primary : Colors.textSecondary} />
      </Stack>
      <StyledText fontSize={11} fontWeight={selected ? '700' : '400'}
        color={selected ? Colors.primaryDark : Colors.textSecondary}
        textAlign="center" numberOfLines={2}>
        {symptom.label}
      </StyledText>
    </StyledPressable>
  )
}

// ─── Mood emoji chip ──────────────────────────────────────────────────────────
function MoodChip({
  emoji, label, moodKey, selected, onPress,
}: {
  emoji:   string
  label:   string
  moodKey: string
  selected:boolean
  onPress: () => void
}) {
  const Colors = useColors()
  return (
    <StyledPressable
      onPress={onPress}
      backgroundColor={selected ? Colors.primaryFaint : Colors.surfaceAlt}
      borderRadius={20}
      paddingHorizontal={12}
      paddingVertical={9}
      borderWidth={selected ? 2 : 1.5}
      borderColor={selected ? Colors.primary : Colors.border}
      flexDirection="row"
      alignItems="center"
      gap={6}
    >
      <StyledText fontSize={18}>{emoji}</StyledText>
      <StyledText fontSize={13} fontWeight={selected ? '700' : '400'}
        color={selected ? Colors.primaryDark : Colors.textSecondary}>
        {label}
      </StyledText>
    </StyledPressable>
  )
}

// ─── Section card wrapper ─────────────────────────────────────────────────────
function SectionCard({ children }: { children: React.ReactNode }) {
  const Colors = useColors()
  return (
    <Stack
      backgroundColor={Colors.surface} borderRadius={20} overflow="hidden"
      shadowColor="#000" shadowOffset={{ width: 0, height: 1 }}
      shadowOpacity={0.05} shadowRadius={8} elevation={1}
    >
      {children}
    </Stack>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function SymptomsTab({ selected, onChange }: SymptomsTabProps) {
  const Colors                    = useColors()
  const { visibleMoods, loading } = useMoods()
  const [search,    setSearch]    = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  // Split selected into mood keys and symptom keys
  const selectedMoods    = selected.filter(k => k.startsWith(MOOD_KEY_PREFIX))
  const selectedSymptoms = selected.filter(k => !k.startsWith(MOOD_KEY_PREFIX))

  const toggleMood = (moodKey: string) => {
    const prefixed = `${MOOD_KEY_PREFIX}${moodKey}`
    onChange(
      selected.includes(prefixed)
        ? selected.filter(k => k !== prefixed)
        : [...selected, prefixed]
    )
  }

  const toggleSymptom = (key: string) => {
    onChange(
      selected.includes(key)
        ? selected.filter(k => k !== key)
        : [...selected, key]
    )
  }

  const toggleCategory = (cat: string) =>
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }))

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
    : SYMPTOM_CATEGORIES.filter(c => groupedFiltered[c]?.length)

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

      {/* ── Mood section — only shown when not searching ─────────────────── */}
      {!search.trim() && (
        <SectionCard>
          {/* Header */}
          <StyledPressable
            onPress={() => toggleCategory('__mood')}
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            paddingHorizontal={18}
            paddingVertical={14}
          >
            <Stack flexDirection="row" alignItems="center" gap={8}>
              <StyledText fontSize={15} fontWeight="700" color={Colors.textPrimary}>
                Mood
              </StyledText>
              {selectedMoods.length > 0 && (
                <Stack
                  width={8} height={8} borderRadius={4}
                  backgroundColor={Colors.primary}
                />
              )}
            </Stack>
            <Stack flexDirection="row" alignItems="center" gap={10}>
              {/* Manage link */}
              <StyledPressable
                onPress={() => router.push('/(app)/(settings)/moods')}
                paddingHorizontal={8}
                paddingVertical={4}
                borderRadius={10}
                backgroundColor={Colors.primaryFaint}
                borderWidth={1}
                borderColor={Colors.border}
              >
                <StyledText fontSize={11} fontWeight="600" color={Colors.primaryDark}>
                  Manage
                </StyledText>
              </StyledPressable>
              <VelaIcon
                name={collapsed['__mood'] ? 'chevron-right' : 'chevron-left'}
                size={16}
                color={Colors.textTertiary}
                style={{ transform: [{ rotate: collapsed['__mood'] ? '-90deg' : '90deg' }] }}
              />
            </Stack>
          </StyledPressable>

          {/* Mood chips */}
          {!collapsed['__mood'] && (
            <Stack
              paddingHorizontal={14}
              paddingBottom={16}
              flexDirection="row"
              flexWrap="wrap"
              gap={8}
            >
              {loading ? (
                [1, 2, 3, 4].map(i => (
                  <Stack key={i} width={90} height={38} borderRadius={20}
                    backgroundColor={Colors.border} opacity={0.35} />
                ))
              ) : visibleMoods.length === 0 ? (
                <StyledPressable
                  onPress={() => router.push('/(app)/(settings)/moods')}
                  flexDirection="row"
                  alignItems="center"
                  gap={6}
                  paddingVertical={8}
                >
                  <VelaIcon name="edit" size={14} color={Colors.primary} />
                  <StyledText fontSize={13} color={Colors.primary} fontWeight="600">
                    Add moods in settings
                  </StyledText>
                </StyledPressable>
              ) : (
                visibleMoods.map(m => (
                  <MoodChip
                    key={m.key}
                    emoji={m.emoji}
                    label={m.label}
                    moodKey={m.key}
                    selected={selected.includes(`${MOOD_KEY_PREFIX}${m.key}`)}
                    onPress={() => toggleMood(m.key)}
                  />
                ))
              )}
            </Stack>
          )}
        </SectionCard>
      )}

      {/* ── Symptom categories ────────────────────────────────────────────── */}
      {categoriesToShow.map(cat => {
        const items       = groupedFiltered[cat] ?? []
        const isOpen      = !collapsed[cat]
        const hasSelected = items.some(s => selectedSymptoms.includes(s.key))

        return (
          <SectionCard key={cat}>
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
                  <Stack width={8} height={8} borderRadius={4}
                    backgroundColor={Colors.primary} />
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
                flexDirection="row" flexWrap="wrap"
                paddingHorizontal={14} paddingBottom={16} gap={10}
              >
                {items.map(symptom => (
                  <SymptomChip
                    key={symptom.key}
                    symptom={symptom}
                    selected={selectedSymptoms.includes(symptom.key)}
                    onPress={() => toggleSymptom(symptom.key)}
                  />
                ))}
              </Stack>
            )}
          </SectionCard>
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

