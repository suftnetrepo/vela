import React, { useState } from 'react'
import { Dimensions } from 'react-native'
import { Stack, StyledText, StyledPressable, StyledPage } from 'fluent-styles'
import { router } from 'expo-router'
import { useColors } from '../../src/hooks/useColors'
import { PrivacyBadge } from '../../src/components/shared/PrivacyBadge'
import { VelaIcon } from '../../src/components/shared/VelaIcon'
import type { VelaIconName } from '../../src/components/shared/VelaIcon'

const { width: W } = Dimensions.get('window')

interface PageDef {
  icon:     VelaIconName
  headline: string        // large coloured word
  title:    string        // supporting title line
  subtitle: string
}

const PAGES: PageDef[] = [
  {
    icon:     'flower',
    headline: 'Vela',
    title:    'Your cycle, privately.',
    subtitle: 'A fully offline period tracker. No accounts, no cloud, no data sharing — ever.',
  },
  {
    icon:     'phase-predicted',
    headline: 'Predict',
    title:    'Know your cycle.',
    subtitle: 'Vela learns your unique pattern and predicts your next period, fertile window, and ovulation day.',
  },
  {
    icon:     'shield-check',
    headline: 'Private',
    title:    'Your data stays here.',
    subtitle: 'Everything you log lives only on your phone. Zero network requests. Zero tracking. Forever.',
  },
]

export default function WelcomeScreen() {
  const Colors  = useColors()
  const [page, setPage] = useState(0)

  const isLast = page === PAGES.length - 1
  const p      = PAGES[page]

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      <Stack flex={1} justifyContent="center" paddingHorizontal={32} gap={0}>

        {/* Icon */}
        <Stack alignItems="center" marginBottom={36}>
          <Stack
            width={130}
            height={130}
            borderRadius={65}
            backgroundColor={Colors.primaryFaint}
            alignItems="center"
            justifyContent="center"
            borderWidth={2.5}
            borderColor={Colors.border}
          >
            <VelaIcon name={p.icon} size={60} color={Colors.primary} />
          </Stack>
        </Stack>

        {/* Big coloured headline word */}
        <Stack alignItems="center" marginBottom={8}>
          <StyledText
            fontSize={56}
            fontWeight="800"
            color={Colors.primary}
            textAlign="center"
            letterSpacing={-1}
          >
            {p.headline}
          </StyledText>
        </Stack>

        {/* Supporting title */}
        <Stack alignItems="center" marginBottom={14}>
          <StyledText
            fontSize={22}
            fontWeight="700"
            color={Colors.textPrimary}
            textAlign="center"
          >
            {p.title}
          </StyledText>
        </Stack>

        {/* Subtitle */}
        <Stack alignItems="center" marginBottom={40}>
          <StyledText
            fontSize={16}
            color={Colors.textSecondary}
            textAlign="center"
            lineHeight={25}
          >
            {p.subtitle}
          </StyledText>
        </Stack>

        {/* Privacy badge on last page */}
        {isLast && (
          <Stack marginBottom={32}>
            <PrivacyBadge />
          </Stack>
        )}

        {/* Page dots */}
        <Stack flexDirection="row" gap={8} alignItems="center" justifyContent="center">
          {PAGES.map((_, i) => (
            <Stack
              key={i}
              width={i === page ? 24 : 8}
              height={8}
              borderRadius={4}
              backgroundColor={i === page ? Colors.primary : Colors.border}
            />
          ))}
        </Stack>
      </Stack>

      {/* Actions */}
      <Stack paddingHorizontal={32} paddingBottom={52} gap={12}>
        <StyledPressable
          backgroundColor={Colors.primary}
          borderRadius={30}
          paddingVertical={18}
          alignItems="center"
          onPress={isLast
            ? () => router.replace('/(auth)/onboarding')
            : () => setPage(p => p + 1)
          }
          shadowColor={Colors.primary}
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.32}
          shadowRadius={14}
          elevation={6}
        >
          <StyledText fontSize={17} fontWeight="800" color={Colors.textInverse}>
            {isLast ? 'Get started' : 'Next'}
          </StyledText>
        </StyledPressable>

        {!isLast && (
          <StyledPressable
            alignItems="center"
            paddingVertical={12}
            onPress={() => router.replace('/(auth)/onboarding')}
          >
            <StyledText fontSize={14} color={Colors.textTertiary}>
              Skip
            </StyledText>
          </StyledPressable>
        )}
      </Stack>
    </StyledPage>
  )
}
