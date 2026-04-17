import React, { useMemo } from 'react'
import { ActivityIndicator } from 'react-native'
import { Stack, StyledText, StyledPressable } from 'fluent-styles'
import { Text } from '@/components/text'
import { router } from 'expo-router'
import { useColors } from '../../hooks/useColors'
import { useSymptoms } from '../../hooks/useSymptoms'
import { VelaIcon } from '../shared/VelaIcon'
import { getSymptomIcon } from '../../constants/symptomIconMap'

interface SymptomGridProps {
  selected: string[]
  onChange: (keys: string[]) => void
}

const CATEGORIES = ['pain', 'physical', 'digestive', 'skin', 'cervical', 'other'] as const

export function SymptomGrid({ selected, onChange }: SymptomGridProps) {
  const Colors = useColors()
  const { visibleSymptoms, loading } = useSymptoms()

  const toggle = (key: string) => {
    onChange(
      selected.includes(key)
        ? selected.filter(k => k !== key)
        : [...selected, key]
    )
  }

  const groupedSymptoms = useMemo(() => {
    const grouped: Record<string, typeof visibleSymptoms> = {}
    CATEGORIES.forEach(cat => {
      grouped[cat] = visibleSymptoms.filter(s => s.category === cat)
    })
    return grouped
  }, [visibleSymptoms])

  if (loading) {
    return (
      <Stack gap={16} alignItems="center" justifyContent="center" paddingVertical={24}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text fontSize={13} color={Colors.textSecondary}>Loading symptoms…</Text>
      </Stack>
    )
  }

  const hasAnySymptoms = visibleSymptoms.length > 0

  return (
    <Stack gap={16}>
      <Stack horizontal alignItems="center" justifyContent="space-between" gap={8}>
        <Stack horizontal alignItems="center" gap={8} flex={1}>
          <VelaIcon name="activity" size={17} color={Colors.primary} />
          <Text fontSize={15} fontWeight="700" color={Colors.textPrimary}>Symptoms</Text>
        </Stack>
        <StyledPressable
          onPress={() => router.push('/(app)/(settings)/symptoms')}
          paddingHorizontal={12}
          paddingVertical={6}
          borderRadius={8}
          backgroundColor={Colors.primaryFaint}
        >
          <Text fontSize={12} fontWeight="600" color={Colors.primary}>Manage</Text>
        </StyledPressable>
      </Stack>

      {!hasAnySymptoms ? (
        <Stack gap={12} alignItems="center" paddingVertical={20} paddingHorizontal={16}
          backgroundColor={Colors.surfaceAlt} borderRadius={12}>
          <VelaIcon name="activity" size={24} color={Colors.textTertiary} />
          <Text fontSize={13} fontWeight="600" color={Colors.textSecondary} textAlign="center">
            No symptoms enabled
          </Text>
          <Text fontSize={12} color={Colors.textTertiary} textAlign="center">
            Tap "Manage" to add symptoms to your tracker.
          </Text>
        </Stack>
      ) : (
        CATEGORIES.map(cat => {
          const items = groupedSymptoms[cat]
          if (items.length === 0) return null
          return (
            <Stack key={cat} gap={8}>
              <Text fontSize={12} fontWeight="600" color={Colors.textPrimary} letterSpacing={0.5}>
                {cat.toUpperCase()}
              </Text>
              <Stack horizontal gap={8} flexWrap="wrap">
                {items.map(s => {
                  const isActive = selected.includes(s.key)
                  const iconName = getSymptomIcon(s.key)
                  return (
                    <StyledPressable
                      key={s.key}
                      onPress={() => toggle(s.key)}
                      backgroundColor={isActive ? s.color : Colors.surfaceAlt}
                      borderRadius={20}
                      paddingHorizontal={12}
                      paddingVertical={8}
                      borderWidth={isActive ? 0 : 1}
                      borderColor={isActive ? s.color : Colors.border}
                      flexDirection="row"
                      alignItems="center"
                      gap={5}
                      marginBottom={4}
                    >
                      <VelaIcon name={iconName} size={14} color={isActive ? '#fff' : Colors.textSecondary} />
                      <Text
                        fontSize={13}
                        fontWeight={isActive ? '700' : '400'}
                        color={isActive ? '#fff' : Colors.textSecondary}
                      >
                        {s.label}
                      </Text>
                    </StyledPressable>
                  )
                })}
              </Stack>
            </Stack>
          )
        })
      )}
    </Stack>
  )
}
