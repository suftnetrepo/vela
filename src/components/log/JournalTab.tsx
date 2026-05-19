import React from 'react'
import { ActivityIndicator } from 'react-native'
import { Stack, StyledText, StyledPressable, StyledTextInput, Collapse } from 'fluent-styles'
import { Text } from '@/components/text'
import { router } from 'expo-router'
import { useColors } from '../../hooks/useColors'
import { useMoods } from '../../hooks/useMoods'
import { VelaIcon } from '../shared/VelaIcon'

export interface JournalData {
  moods:       string[]  // Mood keys selected in this log entry
  energyLevel: number
  notes:       string
}

interface JournalTabProps {
  data:     JournalData
  onChange: (data: JournalData) => void
}

// ─── Mood chip with emoji ──────────────────────────────────────────────────
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
      backgroundColor={selected ? Colors.primaryFaint : Colors.surface}
      borderRadius={14}
      paddingHorizontal={12}
      paddingVertical={8}
      borderWidth={1.2}
      borderColor={selected ? Colors.primary : Colors.border}
      flexDirection="row"
      alignItems="center"
      gap={8}
    >
      <Text fontSize={18}>{emoji}</Text>
      <Text fontSize={13} fontWeight={selected ? '700' : '500'}
        color={selected ? Colors.primary : Colors.textSecondary}>
        {label}
      </Text>
    </StyledPressable>
  )
}

function LogSection({ title, children }: { title: string; children: React.ReactNode }) {
  const Colors = useColors()
  return (
    <Stack
      backgroundColor={Colors.surface}
      borderRadius={16}
      paddingHorizontal={16}
      paddingVertical={16}
      gap={16}
      borderWidth={1}
      borderColor={Colors.border}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 1 }}
      shadowOpacity={0.03}
      shadowRadius={4}
      elevation={0}
    >
      <Text fontSize={14} fontWeight="700" color={Colors.textPrimary}>
        {title}
      </Text>
      {children}
    </Stack>
  )
}

const MAX_MOODS = 3

export function JournalTab({ data, onChange }: JournalTabProps) {
  const Colors = useColors()
  const { visibleMoods, loading: moodsLoading } = useMoods()
  const set = (patch: Partial<JournalData>) => onChange({ ...data, ...patch })

  const toggleMood = (moodKey: string) => {
    const isSelected = data.moods.includes(moodKey)
    // Allow deselection always, but only allow selection if under max
    if (isSelected) {
      set({
        moods: data.moods.filter(k => k !== moodKey)
      })
    } else if (data.moods.length < MAX_MOODS) {
      set({
        moods: [...data.moods, moodKey]
      })
    }
  }

  return (
    <Stack gap={16}>

      {/* ── How am I feeling? (Moods) ────────────────────────────────────── */}
      <LogSection title="How am I feeling?">
        <Stack gap={12}>
          {moodsLoading ? (
            <Stack flexDirection="row" flexWrap="wrap" gap={12}>
              {[1, 2, 3, 4].map(i => (
                <Stack key={i} width={90} height={38} borderRadius={20}
                  backgroundColor={Colors.border} opacity={0.35} />
              ))}
            </Stack>
          ) : visibleMoods.length === 0 ? (
            <StyledPressable
              onPress={() => router.push('/(app)/(settings)/moods')}
              flexDirection="row"
              alignItems="center"
              gap={6}
              paddingVertical={8}
            >
              <VelaIcon name="edit" size={14} color={Colors.primary} />
              <Text fontSize={13} color={Colors.primary} fontWeight="600">
                Add moods in settings
              </Text>
            </StyledPressable>
          ) : (
            <>
              <Stack alignItems='flex-start' justifyContent='flex-start' flexDirection="row" flexWrap="wrap" gap={6}>
                {visibleMoods.map(m => (
                  <MoodChip
                    key={m.key}
                    emoji={m.emoji}
                    label={m.label}
                    moodKey={m.key}
                    selected={data.moods.includes(m.key)}
                    onPress={() => toggleMood(m.key)}
                  />
                ))}
              </Stack>
              {data.moods.length === MAX_MOODS && (
                <Text fontSize={12} color={Colors.textTertiary} fontStyle="italic">
                  Max {MAX_MOODS} moods selected
                </Text>
              )}
            </>
          )}
        </Stack>
      </LogSection>

      {/* ── Energy level ─────────────────────────────────────────────────── */}
      <LogSection title="Energy level">
        <Stack gap={12}>
          <Stack flexDirection="row" gap={8} justifyContent="space-between">
            {[1, 2, 3, 4, 5].map(n => (
              <StyledPressable
                key={n}
                flex={1}
                height={48}
                borderRadius={12}
                backgroundColor={n <= data.energyLevel ? Colors.primary : Colors.inputBackground}
                borderWidth={1}
                borderColor={n <= data.energyLevel ? Colors.primary : Colors.border}
                alignItems="center"
                justifyContent="center"
                onPress={() => set({ energyLevel: n })}
              >
                <Text
                  fontSize={15}
                  fontWeight="700"
                  color={n <= data.energyLevel ? Colors.textInverse : Colors.textTertiary}
                >
                  {n}
                </Text>
              </StyledPressable>
            ))}
          </Stack>
          <Stack flexDirection="row" justifyContent="space-between" paddingHorizontal={4}>
            <Text fontSize={11} color={Colors.textTertiary} fontWeight="500">Low</Text>
            <Text fontSize={11} color={Colors.textTertiary} fontWeight="500">High</Text>
          </Stack>
        </Stack>
      </LogSection>

      {/* ── Notes ────────────────────────────────────────────────────────── */}
      <LogSection title="Notes">
        <StyledTextInput
          variant="filled"
          placeholder="How are you feeling today? Any observations…"
          placeholderTextColor={Colors.textTertiary}
          multiline
          numberOfLines={6}
          value={data.notes}
          onChangeText={v => set({ notes: v })}
          focusColor={Colors.primary}
          style={{
            borderColor: Colors.border,
            borderWidth: 1,
            borderRadius: 12,
            backgroundColor: Colors.inputBackground,
            color: Colors.textPrimary,
            padding: 12,
            textAlignVertical: 'top',
          }}
        />
      </LogSection>

    </Stack>
  )
}
