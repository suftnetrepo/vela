import React from 'react'
import { Stack, StyledText, StyledPressable } from 'fluent-styles'
import { Text } from '@/components/text'
import { router } from 'expo-router'
import { useColors } from '../../hooks/useColors'
import { useMoods } from '../../hooks/useMoods'
import { VelaIcon } from '../shared/VelaIcon'

interface MoodSelectorProps {
  value?:   string
  onChange: (key: string) => void
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  const Colors                    = useColors()
  const { visibleMoods, loading } = useMoods()

  return (
    <Stack gap={12}>
      {/* Header row */}
      <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
        <Stack flexDirection="row" alignItems="center" gap={8}>
          <VelaIcon name="heart" size={17} color={Colors.primary} />
          <Text fontSize={15} fontWeight="700" color={Colors.textPrimary}>Mood</Text>
        </Stack>
        <StyledPressable
          onPress={() => router.push('/(app)/(settings)/moods')}
          flexDirection="row"
          alignItems="center"
          gap={4}
          paddingHorizontal={10}
          paddingVertical={5}
          borderRadius={12}
          backgroundColor={Colors.primaryFaint}
          borderWidth={1}
          borderColor={Colors.border}
        >
          <VelaIcon name="edit" size={12} color={Colors.primary} />
          <Text fontSize={11} fontWeight="600" color={Colors.primaryDark}>Manage</Text>
        </StyledPressable>
      </Stack>

      {/* Mood chips */}
      {loading ? (
        <Stack flexDirection="row" gap={8} flexWrap="wrap">
          {[1, 2, 3, 4].map(i => (
            <Stack key={i} width={80} height={36} borderRadius={20}
              backgroundColor={Colors.border} opacity={0.5} />
          ))}
        </Stack>
      ) : visibleMoods.length === 0 ? (
        <StyledPressable
          onPress={() => router.push('/(app)/(settings)/moods')}
          backgroundColor={Colors.surfaceAlt}
          borderRadius={16}
          padding={16}
          alignItems="center"
          gap={6}
          borderWidth={1}
          borderColor={Colors.border}
        >
          <Text fontSize={20}>💭</Text>
          <Text fontSize={13} color={Colors.textSecondary} textAlign="center">
            No moods selected.{'\n'}Tap to manage your mood list.
          </Text>
        </StyledPressable>
      ) : (
        <Stack flexDirection="row" gap={8} flexWrap="wrap">
          {visibleMoods.map(m => {
            const isActive = value === m.key
            return (
              <StyledPressable
                key={m.key}
                onPress={() => onChange(m.key)}
                backgroundColor={isActive ? Colors.primaryFaint : Colors.surfaceAlt}
                borderRadius={20}
                paddingHorizontal={14}
                paddingVertical={9}
                borderWidth={isActive ? 2 : 1}
                borderColor={isActive ? Colors.primary : Colors.border}
                flexDirection="row"
                alignItems="center"
                gap={6}
              >
                <Text fontSize={16}>{m.emoji}</Text>
                <Text
                  fontSize={13}
                  fontWeight={isActive ? '700' : '500'}
                  color={isActive ? Colors.primaryDark : Colors.textSecondary}
                >
                  {m.label}
                </Text>
              </StyledPressable>
            )
          })}
        </Stack>
      )}
    </Stack>
  )
}
