import React from 'react'
import { ActivityIndicator } from 'react-native'
import { Stack, StyledText, StyledPressable, StyledTextInput, Collapse } from 'fluent-styles'
import { router } from 'expo-router'
import { useColors } from '../../hooks/useColors'
import { useMoods } from '../../hooks/useMoods'
import { VelaIcon } from '../shared/VelaIcon'
import { getMoodIcon } from '../../constants/symptomIconMap'

export interface JournalData {
  moods:       string[]  // Mood keys selected in this log entry
  energyLevel: number
  notes:       string
}

interface JournalTabProps {
  data:     JournalData
  onChange: (data: JournalData) => void
}

// ─── Mood chip with SVG icon ──────────────────────────────────────────────────
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
  const iconName = getMoodIcon(moodKey)
  
  return (
    <StyledPressable
      onPress={onPress}
      backgroundColor={selected ? Colors.primaryFaint : Colors.surfaceAlt}
      borderRadius={20}
      paddingHorizontal={8}
      paddingVertical={4}
      borderWidth={selected ? 2 : 1.5}
      borderColor={selected ? Colors.primary : Colors.border}
      flexDirection="row"
      alignItems="center"
      gap={6}
    >
      <VelaIcon name={iconName} size={16} color={selected ? Colors.primary : Colors.textSecondary} />
      <StyledText fontSize={13} fontWeight={selected ? '700' : '400'}
        color={selected ? Colors.primaryDark : Colors.textSecondary}>
        {label}
      </StyledText>
    </StyledPressable>
  )
}

function LogSection({ title, children }: { title: string; children: React.ReactNode }) {
  const Colors = useColors()
  return (
    <Stack
      backgroundColor={Colors.surface}
      borderRadius={20}
      padding={20}
      gap={14}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 1 }}
      shadowOpacity={0.05}
      shadowRadius={8}
      elevation={1}
    >
      <StyledText fontSize={15} fontWeight="700" color={Colors.textPrimary}>
        {title}
      </StyledText>
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
    <Stack gap={14}>

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
              <StyledText fontSize={13} color={Colors.primary} fontWeight="600">
                Add moods in settings
              </StyledText>
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
                <StyledText fontSize={12} color={Colors.textTertiary} fontStyle="italic">
                  Max {MAX_MOODS} moods selected
                </StyledText>
              )}
            </>
          )}
        </Stack>
      </LogSection>

      {/* ── Energy level ─────────────────────────────────────────────────── */}
      <LogSection title="Energy level">
        <Stack gap={10}>
          <Stack flexDirection="row" gap={8}>
            {[1, 2, 3, 4, 5].map(n => (
              <StyledPressable
                key={n}
                flex={1}
                height={52}
                borderRadius={14}
                backgroundColor={n <= data.energyLevel ? Colors.primary : Colors.surfaceAlt}
                borderWidth={n <= data.energyLevel ? 0 : 1.5}
                borderColor={Colors.border}
                alignItems="center"
                justifyContent="center"
                onPress={() => set({ energyLevel: n })}
              >
                <StyledText
                  fontSize={16}
                  fontWeight="700"
                  color={n <= data.energyLevel ? Colors.textInverse : Colors.textTertiary}
                >
                  {n}
                </StyledText>
              </StyledPressable>
            ))}
          </Stack>
          <Stack flexDirection="row" justifyContent="space-between">
            <StyledText fontSize={11} color={Colors.textTertiary}>😴 Low energy</StyledText>
            <StyledText fontSize={11} color={Colors.textTertiary}>⚡ High energy</StyledText>
          </Stack>
        </Stack>
      </LogSection>

      {/* ── Notes ────────────────────────────────────────────────────────── */}
      <LogSection title="Notes">
        <StyledTextInput
          variant="outline"
          placeholder="How are you feeling today? Any observations…"
          multiline
          numberOfLines={6}
          value={data.notes}
          onChangeText={v => set({ notes: v })}
          focusColor={Colors.primary}
          borderColor={Colors.border}
        />
      </LogSection>

    </Stack>
  )
}
