import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import {
  Stack,
  StyledText,
  StyledPressable,
  StyledPage,
  theme
} from 'fluent-styles'
import { router } from 'expo-router'
import { Text } from '@/components/text'
import { useColors } from '../../../src/hooks/useColors'
import { useRecordsStore } from '../../../src/stores/records.store'
import { setSymptomVisible, resetSymptomsToDefault } from '../../../src/hooks/useSymptoms'
import { settingsService } from '../../../src/services/settings.service'
import { ALL_SYMPTOMS, SYMPTOM_SETTING_PREFIX } from '../../../src/constants/symptoms'
import { VelaIcon } from '../../../src/components/shared/VelaIcon'
import { dialogueService, toastService } from 'fluent-styles'
import type { SymptomDef } from '../../../src/constants/symptoms'

// ─── Load visibility from DB — uses same 1/0 logic as useSymptoms ─────────────
async function loadVisibility(): Promise<Record<string, boolean>> {
  const all = await settingsService.getAll()
  const result: Record<string, boolean> = {}
  for (const symptom of ALL_SYMPTOMS) {
    const key = `${SYMPTOM_SETTING_PREFIX}${symptom.key}`
    if (key in all) {
      result[symptom.key] = all[key] === 1 || all[key] === true
    } else {
      result[symptom.key] = symptom.defaultVisible
    }
  }
  return result
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ label, count }: { label: string; count: number }) {
  const Colors = useColors()
  return (
    <Stack
      flexDirection="row"
      alignItems="center"
      gap={6}
      paddingHorizontal={20}
      paddingTop={20}
      paddingBottom={12}
    >
      <Text fontSize={11} fontWeight="700" color={Colors.textTertiary} letterSpacing={0.6}>
        {label}
      </Text>
      <Stack
        backgroundColor={Colors.primaryFaint}
        borderRadius={8}
        paddingHorizontal={6}
        paddingVertical={2}
      >
        <Text fontSize={9} fontWeight="700" color={Colors.primary}>{count}</Text>
      </Stack>
    </Stack>
  )
}

// ─── Custom tick indicator — elegantly minimal checked vs unchecked ────────
function TickBox({ checked, color }: { checked: boolean; color: string }) {
  if (checked) {
    return (
      <Stack
        width={24}
        height={24}
        borderRadius={12}
        backgroundColor={color}
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize={12} color="#fff">✓</Text>
      </Stack>
    )
  }
  return (
    <Stack
      width={24}
      height={24}
      borderRadius={12}
      borderWidth={1.5}
      borderColor="#E5E7EB"
      backgroundColor="transparent"
    />
  )
}

// ─── Single symptom row ───────────────────────────────────────────────────────
function SymptomRow({
  symptom,
  checked,
  onToggle,
}: {
  symptom:  SymptomDef
  checked:  boolean
  onToggle: (key: string, val: boolean) => void
}) {
  const Colors = useColors()
  return (
    <StyledPressable
      onPress={() => onToggle(symptom.key, !checked)}
      flexDirection="row"
      alignItems="center"
      paddingHorizontal={20}
      paddingVertical={11}
      backgroundColor={Colors.surface}
      gap={12}
    >
      {/* Emoji circle */}
      <Stack
        width={36}
        height={36}
        borderRadius={18}
        backgroundColor={Colors.surfaceAlt}
        alignItems="center"
        justifyContent="center"
        borderWidth={1}
        borderColor={Colors.border}
      >
        <Text fontSize={20}>{symptom.emoji}</Text>
      </Stack>

      {/* Label + default indicator */}
      <Stack flex={1} gap={2}>
        <Text
          fontSize={14}
          fontWeight={checked ? '700' : '500'}
          color={Colors.textPrimary}
        >
          {symptom.label}
        </Text>
        {symptom.defaultVisible && (
          <Text fontSize={10} color={Colors.textTertiary} fontWeight="500">
            Recommended
          </Text>
        )}
      </Stack>

      {/* Tick */}
      <TickBox checked={checked} color={symptom.color} />
    </StyledPressable>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function RowDivider() {
  const Colors = useColors()
  return <Stack height={0.8} backgroundColor={Colors.border} marginLeft={68} />
}

// ─── Category label helper ────────────────────────────────────────────────────
function getCategoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    pain: '💔 Pain & Discomfort',
    physical: '⚕️ Physical',
    digestive: '🍽️ Digestive',
    skin: '✨ Skin',
    cervical: '🔬 Cervical Signs',
    other: '📊 Other',
  }
  return labels[cat] || cat.toUpperCase()
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function SymptomsSettingsScreen() {
  const Colors         = useColors()
  const invalidateData = useRecordsStore(s => s.invalidateData)

  const [visibility, setVisibility] = useState<Record<string, boolean>>({})
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const vis = await loadVisibility()
      setVisibility(vis)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const checkedCount = Object.values(visibility).filter(Boolean).length

  // Toggle a single symptom — optimistic UI update then persist
  const handleToggle = useCallback(async (key: string, val: boolean) => {
    setVisibility(prev => ({ ...prev, [key]: val }))
    setSaving(true)
    try {
      await setSymptomVisible(key, val)
      // Small delay to ensure DB write is complete before invalidating
      await new Promise(resolve => setTimeout(resolve, 50))
      invalidateData()
    } finally {
      setSaving(false)
    }
  }, [invalidateData])

  // Reset to defaults
  const handleReset = useCallback(async () => {
    const ok = await dialogueService.confirm({
      title:        'Reset to defaults?',
      message:      'This will restore the recommended symptom selection.',
      icon:         '🔄',
      confirmLabel: 'Reset',
      cancelLabel:  'Cancel',
      theme:        'light',
    })
    if (!ok) return
    setSaving(true)
    try {
      await resetSymptomsToDefault()
      await load()
      invalidateData()
      toastService.success('Symptoms reset', 'Recommended selection restored.')
    } finally {
      setSaving(false)
    }
  }, [load, invalidateData])

  // Group symptoms by category, separating default from hidden
  const grouped = useMemo(() => {
    const cats: Record<string, { default: SymptomDef[]; hidden: SymptomDef[] }> = {}
    const categories = ['pain', 'physical', 'digestive', 'skin', 'cervical', 'other']
    
    categories.forEach(cat => {
      const syms = ALL_SYMPTOMS.filter(s => s.category === cat)
      cats[cat] = {
        default: syms.filter(s => s.defaultVisible),
        hidden:  syms.filter(s => !s.defaultVisible),
      }
    })
    return cats
  }, [])

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
          <StyledPage.Header
        title="Symptoms"
        titleAlignment="left"
        marginHorizontal={16}
        shapeProps={{
          size: 48,
          backgroundColor: Colors.primaryFaint,
        }}
        backArrowProps={{
          color: Colors.textPrimary,
        }}
        showBackArrow
        onBackPress={() => router.push("/(app)/settings")}
        backgroundColor={Colors.background}
        titleProps={{ fontWeight: "700", color: Colors.textPrimary, fontFamily: "PlusJakartaSans_700Bold" }}
      />
  
      <Stack
        backgroundColor={Colors.surface}
        marginTop={16}
        paddingBottom={12}
        paddingHorizontal={20}
        borderBottomWidth={1}
        borderBottomColor={Colors.border}
      >
        {/* Stats bar */}
        <Stack
          flexDirection="row"
          backgroundColor={Colors.primaryFaint}
          borderRadius={14}
          padding={12}
          borderWidth={1}
          borderColor={Colors.border}
        >
          <Stack flex={1} alignItems="center" gap={1}>
            <Text fontSize={20} fontWeight="800" color={Colors.primary}>
              {checkedCount}
            </Text>
            <Text fontSize={10} fontWeight="600" color={Colors.textTertiary}>Selected</Text>
          </Stack>
          <Stack width={1} backgroundColor={Colors.border} marginVertical={3} />
          <Stack flex={1} alignItems="center" gap={1}>
            <Text fontSize={20} fontWeight="800" color={Colors.textSecondary}>
              {ALL_SYMPTOMS.length - checkedCount}
            </Text>
            <Text fontSize={10} fontWeight="600" color={Colors.textTertiary}>Hidden</Text>
          </Stack>
          <Stack width={1} backgroundColor={Colors.border} marginVertical={3} />
          <Stack flex={1} alignItems="center" gap={1}>
            <Text fontSize={20} fontWeight="800" color={Colors.textTertiary}>
              {ALL_SYMPTOMS.length}
            </Text>
            <Text fontSize={10} fontWeight="600" color={Colors.textTertiary}>Total</Text>
          </Stack>
        </Stack>
      </Stack>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <Stack flex={1} alignItems="center" justifyContent="center" gap={12}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text fontSize={14} color={Colors.textSecondary}>Loading symptoms…</Text>
        </Stack>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Render each category */}
          {(Object.keys(grouped) as Array<keyof typeof grouped>).map(cat => {
            const { default: defaultSyms, hidden: hiddenSyms } = grouped[cat]
            const allInCat = [...defaultSyms, ...hiddenSyms]
            if (allInCat.length === 0) return null

            return (
              <Stack key={cat}>
                {/* Default symptoms in this category */}
                {defaultSyms.length > 0 && (
                  <>
                    <SectionHeader label={getCategoryLabel(cat)} count={defaultSyms.length} />
                    <Stack
                      backgroundColor={Colors.surface}
                      marginHorizontal={16}
                      borderRadius={20}
                      overflow="hidden"
                      borderWidth={1}
                      borderColor={Colors.border}
                      shadowColor="#000"
                      shadowOffset={{ width: 0, height: 2 }}
                      shadowOpacity={0.06}
                      shadowRadius={10}
                      elevation={2}
                    >
                      {defaultSyms.map((sym, i) => (
                        <Stack key={sym.key}>
                          <SymptomRow
                            symptom={sym}
                            checked={visibility[sym.key] ?? sym.defaultVisible}
                            onToggle={handleToggle}
                          />
                          {i < defaultSyms.length - 1 && <RowDivider />}
                        </Stack>
                      ))}
                    </Stack>
                  </>
                )}

                {/* Hidden symptoms in this category */}
                {hiddenSyms.length > 0 && (
                  <>
                    <SectionHeader label={`${getCategoryLabel(cat)} — More`} count={hiddenSyms.length} />
                    <Stack
                      backgroundColor={Colors.surface}
                      marginHorizontal={16}
                      borderRadius={20}
                      overflow="hidden"
                      borderWidth={1}
                      borderColor={Colors.border}
                      shadowColor="#000"
                      shadowOffset={{ width: 0, height: 2 }}
                      shadowOpacity={0.06}
                      shadowRadius={10}
                      elevation={2}
                    >
                      {hiddenSyms.map((sym, i) => (
                        <Stack key={sym.key}>
                          <SymptomRow
                            symptom={sym}
                            checked={visibility[sym.key] ?? false}
                            onToggle={handleToggle}
                          />
                          {i < hiddenSyms.length - 1 && <RowDivider />}
                        </Stack>
                      ))}
                    </Stack>
                  </>
                )}
              </Stack>
            )
          })}

          {/* Reset button */}
          <Stack marginHorizontal={16} marginTop={28}>
            <StyledPressable
              onPress={handleReset}
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              gap={8}
              paddingVertical={16}
              borderRadius={16}
              backgroundColor={Colors.surfaceAlt}
              borderWidth={1}
              borderColor={Colors.border}
            >
              <VelaIcon name="cycle" size={16} color={Colors.textSecondary} />
              <Text fontSize={14} fontWeight="600" color={Colors.textSecondary}>
                Reset to recommended
              </Text>
            </StyledPressable>
          </Stack>

          {/* Tip */}
          <Stack
            marginHorizontal={16}
            marginTop={16}
            flexDirection="row"
            alignItems="flex-start"
            gap={8}
            backgroundColor={Colors.primaryFaint}
            borderRadius={14}
            padding={14}
            borderWidth={1}
            borderColor={Colors.border}
            marginBottom={12}
          >
            <Text fontSize={16}>💡</Text>
            <Text fontSize={12} color={Colors.textSecondary} flex={1} lineHeight={18}>
              Changes apply immediately. Symptoms marked{' '}
              <Text fontSize={12} fontWeight="700" color={Colors.primary}>Recommended</Text>
              {' '}are pre-selected by Vela as the most useful for cycle tracking.
            </Text>
          </Stack>
        </ScrollView>
      )}
    </StyledPage>
  )
}
