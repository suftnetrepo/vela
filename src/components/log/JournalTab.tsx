import React from 'react'
import { Stack, StyledText, StyledPressable, StyledTextInput } from 'fluent-styles'
import { useColors } from '../../hooks/useColors'

export interface JournalData {
  mood:        string   // kept for DB compat — no longer used in UI
  energyLevel: number
  notes:       string
}

interface JournalTabProps {
  data:     JournalData
  onChange: (data: JournalData) => void
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

export function JournalTab({ data, onChange }: JournalTabProps) {
  const Colors = useColors()
  const set = (patch: Partial<JournalData>) => onChange({ ...data, ...patch })

  return (
    <Stack gap={14}>

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
