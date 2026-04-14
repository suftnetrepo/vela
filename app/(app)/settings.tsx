import React from 'react'
import {
  Stack, StyledText, StyledScrollView, StyledPage,
  StyledHeader, StyledPressable, StyledDivider,
} from 'fluent-styles'
import { router } from 'expo-router'
import { useColors } from '../../src/hooks/useColors'
import { useSettings } from '../../src/hooks/useSettings'
import { VelaIcon } from '../../src/components/shared/VelaIcon'
import { PrivacyBadge } from '../../src/components/shared/PrivacyBadge'
import type { VelaIconName } from '../../src/components/shared/VelaIcon'

function MenuRow({
  icon, label, subtitle, onPress, badge, iconBg, destructive,
}: {
  icon: VelaIconName; label: string; subtitle?: string; onPress?: () => void
  badge?: string; iconBg?: string; destructive?: boolean
}) {
  const Colors = useColors()
  return (
    <StyledPressable onPress={onPress} flexDirection="row" alignItems="center"
      paddingVertical={14} paddingHorizontal={16} gap={14} backgroundColor="transparent">
      <Stack width={38} height={38} borderRadius={11}
        backgroundColor={iconBg ?? Colors.primaryFaint} alignItems="center" justifyContent="center">
        <VelaIcon name={icon} size={19} color={destructive ? Colors.error : Colors.primary} />
      </Stack>
      <Stack flex={1} gap={2}>
        <StyledText fontSize={15} fontWeight="600"
          color={destructive ? Colors.error : Colors.textPrimary}>{label}</StyledText>
        {subtitle && <StyledText fontSize={12} color={Colors.textTertiary}>{subtitle}</StyledText>}
      </Stack>
      {badge && (
        <Stack backgroundColor={Colors.primary} borderRadius={10}
          paddingHorizontal={8} paddingVertical={3} marginRight={6}>
          <StyledText fontSize={10} fontWeight="700" color={Colors.textInverse}>{badge}</StyledText>
        </Stack>
      )}
      {onPress && <VelaIcon name="chevron-right" size={16} color={Colors.textTertiary} />}
    </StyledPressable>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const Colors = useColors()
  return (
    <Stack gap={8}>
      <StyledText fontSize={12} fontWeight="700" color={Colors.textTertiary}
        letterSpacing={0.6} paddingHorizontal={4}>{title}</StyledText>
      <Stack backgroundColor={Colors.surface} borderRadius={20} overflow="hidden"
        shadowColor="#000" shadowOffset={{ width: 0, height: 1 }}
        shadowOpacity={0.05} shadowRadius={8} elevation={1}>
        {children}
      </Stack>
    </Stack>
  )
}

export default function SettingsScreen() {
  const Colors   = useColors()
  const settings = useSettings()

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      <StyledHeader title="Settings" titleAlignment="left" showStatusBar
        backgroundColor={Colors.background}
        titleProps={{ fontSize: 22, fontWeight: '800', color: Colors.textPrimary }} />
      <StyledScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48, gap: 20 }}
        showsVerticalScrollIndicator={false}>

        {/* Profile card */}
        <StyledPressable onPress={() => router.push('/(app)/(settings)/profile')}
          backgroundColor={Colors.surface} borderRadius={24} padding={20}
          shadowColor="#000" shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.07} shadowRadius={12} elevation={3}
          flexDirection="row" alignItems="center" gap={16}>
          <Stack width={60} height={60} borderRadius={30} backgroundColor={Colors.primaryFaint}
            alignItems="center" justifyContent="center" borderWidth={3} borderColor={Colors.border}>
            <VelaIcon name="flower" size={28} color={Colors.primary} />
          </Stack>
          <Stack flex={1} gap={4}>
            <StyledText fontSize={17} fontWeight="800" color={Colors.textPrimary}>My Account</StyledText>
            <StyledText fontSize={13} color={Colors.textSecondary}>Preferences · Units · Privacy</StyledText>
            {settings.isPremium ? (
              <Stack horizontal alignItems="center" gap={5} backgroundColor={Colors.primaryFaint}
                borderRadius={8} paddingHorizontal={8} paddingVertical={3} alignSelf="flex-start">
                <VelaIcon name="crown" size={11} color={Colors.primary} />
                <StyledText fontSize={11} fontWeight="700" color={Colors.primaryDark}>Premium</StyledText>
              </Stack>
            ) : (
              <StyledText fontSize={12} color={Colors.textTertiary}>Free plan</StyledText>
            )}
          </Stack>
          <VelaIcon name="chevron-right" size={18} color={Colors.textTertiary} />
        </StyledPressable>

        {/* Premium banner */}
        {!settings.isPremium && (
          <StyledPressable onPress={() => router.push('/(app)/(settings)/premium')}
            backgroundColor={Colors.primary} borderRadius={20} padding={18}
            shadowColor={Colors.primary} shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.3} shadowRadius={12} elevation={6}
            flexDirection="row" alignItems="center" gap={14}>
            <Stack width={46} height={46} borderRadius={23}
              backgroundColor="rgba(255,255,255,0.22)" alignItems="center" justifyContent="center">
              <VelaIcon name="crown" size={24} color={Colors.textInverse} />
            </Stack>
            <Stack flex={1} gap={3}>
              <StyledText fontSize={16} fontWeight="800" color={Colors.textInverse}>Unlock Premium</StyledText>
              <StyledText fontSize={12} color="rgba(255,255,255,0.8)">Partner sharing · Reports · All themes</StyledText>
            </Stack>
            <Stack backgroundColor="rgba(255,255,255,0.22)" borderRadius={12}
              paddingHorizontal={12} paddingVertical={6}>
              <StyledText fontSize={11} fontWeight="700" color={Colors.textInverse}>Free trial</StyledText>
            </Stack>
          </StyledPressable>
        )}

        <Section title="CYCLE">
          <MenuRow icon="cycle" label="Cycle Settings" subtitle={`${settings.avgCycleLength}-day average`}
            onPress={() => router.push('/(app)/(settings)/cycle-settings')} />
          <StyledDivider borderBottomColor={Colors.border} marginHorizontal={16} />
          <MenuRow icon="bell" label="Notifications" subtitle="Period, ovulation & fertile reminders"
            onPress={() => router.push('/(app)/(settings)/notifications')} />
        </Section>

        <Section title="APPEARANCE">
          <MenuRow icon="palette" label="Theme"
            subtitle={settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)}
            onPress={() => router.push('/(app)/(settings)/theme')} />
        </Section>

        <Section title="SECURITY">
          <MenuRow icon="lock" label="PIN & Biometrics" subtitle="App lock & biometric unlock"
            onPress={() => router.push('/(app)/(settings)/security')} />
        </Section>

        <Section title="LEARN">
          <MenuRow icon="phase-fertile" label="Articles" subtitle="Cycle, fertility & wellness guides"
            onPress={() => router.push('/(app)/(settings)/articles')} badge="NEW" />
          <StyledDivider borderBottomColor={Colors.border} marginHorizontal={16} />
          <MenuRow icon="help" label="FAQ" subtitle="Common questions answered"
            onPress={() => router.push('/(app)/(settings)/faq')} />
        </Section>

        <Section title="ABOUT">
          <MenuRow icon="shield-check" label="Privacy Policy"
            onPress={() => router.push('/(app)/(settings)/privacy')} />
          <StyledDivider borderBottomColor={Colors.border} marginHorizontal={16} />
          <MenuRow icon="info" label="About Vela" subtitle="Version 1.0.0" />
        </Section>

        <PrivacyBadge />
        <Stack alignItems="center" paddingTop={4} gap={3}>
          <StyledText fontSize={11} color={Colors.textTertiary}>Vela v1.0.0 · No internet · No analytics</StyledText>
        </Stack>
      </StyledScrollView>
    </StyledPage>
  )
}
