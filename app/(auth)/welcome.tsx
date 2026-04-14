import React, { useState } from 'react'
import { Dimensions } from 'react-native'
import { Stack, StyledText, StyledPressable, StyledPage } from 'fluent-styles'
import { router } from 'expo-router'
import { useColors } from '../../src/hooks/useColors'
import { PrivacyBadge } from '../../src/components/shared/PrivacyBadge'
import { VelaIcon } from '../../src/components/shared/VelaIcon'
import type { VelaIconName } from '../../src/components/shared/VelaIcon'

const { width: W } = Dimensions.get('window')

interface PageDef { icon: VelaIconName; title: string; subtitle: string }

const PAGES: PageDef[] = [
  {
    icon:     'flower',
    title:    'Your cycle.\nYour data.\nYour phone.',
    subtitle: 'Vela is a private, offline period tracker. No accounts, no cloud, no data sharing.',
  },
  {
    icon:     'phase-predicted',
    title:    'Predict your cycle',
    subtitle: 'Vela learns your unique pattern and predicts your next period, fertile window, and ovulation day.',
  },
  {
    icon:     'shield-check',
    title:    'Total privacy',
    subtitle: 'Every detail you log stays on your device. Vela has zero network access — not even analytics.',
  },
]

export default function WelcomeScreen() {
  const Colors  = useColors()
  const [page, setPage] = useState(0)

  const isLast = page === PAGES.length - 1
  const p      = PAGES[page]

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      <Stack flex={1} alignItems="center" justifyContent="center" paddingHorizontal={32} gap={32}>

        {/* Icon hero */}
        <Stack width={120} height={120} borderRadius={60} backgroundColor={Colors.primaryFaint}
          alignItems="center" justifyContent="center" borderWidth={3} borderColor={Colors.border}>
          <VelaIcon name={p.icon} size={54} color={Colors.primary} />
        </Stack>

        {/* Text */}
        <Stack gap={12} alignItems="center">
          <StyledText
            fontSize={30}
            fontWeight="800"
            color={Colors.textPrimary}
            textAlign="center"
            lineHeight={38}
          >
            {p.title}
          </StyledText>
          <StyledText
            fontSize={16}
            color={Colors.textSecondary}
            textAlign="center"
            lineHeight={24}
          >
            {p.subtitle}
          </StyledText>
        </Stack>

        {/* Privacy badge on last page */}
        {isLast && <PrivacyBadge />}

        {/* Dots */}
        <Stack horizontal gap={8} alignItems="center">
          {PAGES.map((_, i) => (
            <Stack
              key={i}
              width={i === page ? 20 : 8}
              height={8}
              borderRadius={4}
              backgroundColor={i === page ? Colors.primary : Colors.border}
            />
          ))}
        </Stack>
      </Stack>

      {/* Bottom actions */}
      <Stack paddingHorizontal={32} paddingBottom={48} gap={12}>
        {isLast ? (
          <StyledPressable
            backgroundColor={Colors.primary}
            borderRadius={30}
            paddingVertical={18}
            alignItems="center"
            onPress={() => router.replace('/(auth)/onboarding')}
            shadowColor={Colors.primary}
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.35}
            shadowRadius={12}
            elevation={6}
          >
            <StyledText fontSize={17} fontWeight="800" color={Colors.textInverse}>
              Get started
            </StyledText>
          </StyledPressable>
        ) : (
          <StyledPressable
            backgroundColor={Colors.primary}
            borderRadius={30}
            paddingVertical={18}
            alignItems="center"
            onPress={() => setPage(p => p + 1)}
          >
            <StyledText fontSize={17} fontWeight="800" color={Colors.textInverse}>
              Next
            </StyledText>
          </StyledPressable>
        )}

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
