import React from 'react'
import { Alert } from 'react-native'
import {
  Stack, StyledScrollView, StyledPage,
  StyledPressable, StyledDivider, actionSheetService,
} from 'fluent-styles'
import { router } from 'expo-router'
import Constants from 'expo-constants'
import { Text } from '@/components/text'
import { useColors } from '../../src/hooks/useColors'
import { useSettings } from '../../src/hooks/useSettings'
import { VelaIcon } from '../../src/components/shared/VelaIcon'
import { PrivacyBadge } from '../../src/components/shared/PrivacyBadge'
import { ExportDataContent } from '../../src/components/shared/ExportDataContent'
import { ImportDataContent } from '../../src/components/shared/ImportDataContent'
import { devResetService } from '../../src/services/dev-reset.service'
import type { VelaIconName } from '../../src/components/shared/VelaIcon'

function MenuRow({
  icon, label, subtitle, onPress, badge, iconBg, destructive,
}: {
  icon: VelaIconName; label: string; subtitle?: string; onPress?: () => void
  badge?: string; iconBg?: string; destructive?: boolean
}) {
  const Colors = useColors()
  return (
    <StyledPressable onPress={onPress} disabled={!onPress} flexDirection="row" alignItems="center"
      paddingVertical={14} paddingHorizontal={16} gap={14} backgroundColor="transparent"
      accessibilityRole="button"
      accessibilityLabel={[label, subtitle, badge].filter(Boolean).join(', ')}
      accessibilityHint={destructive ? 'This action cannot be undone' : undefined}
      accessibilityState={{ disabled: !onPress }}>
      <Stack width={38} height={38} borderRadius={12}
        backgroundColor={iconBg ?? Colors.primaryFaint} borderWidth={1} borderColor={Colors.border}
        alignItems="center" justifyContent="center">
        <VelaIcon name={icon} size={19} color={destructive ? Colors.error : Colors.primary} />
      </Stack>
      <Stack flex={1} gap={2}>
        <Text fontSize={15} fontWeight="600"
          color={destructive ? Colors.error : Colors.textPrimary}>{label}</Text>
        {subtitle && <Text fontSize={12} color={Colors.textSecondary} opacity={0.8}>{subtitle}</Text>}
      </Stack>
      {badge && (
        <Stack backgroundColor={Colors.primary} borderRadius={8}
          paddingHorizontal={8} paddingVertical={4} marginRight={6}>
          <Text fontSize={10} fontWeight="700" color={Colors.textInverse}>{badge}</Text>
        </Stack>
      )}
      {onPress && <Stack opacity={0.6}><VelaIcon name="chevron-right" size={16} color={Colors.textTertiary} /></Stack>}
    </StyledPressable>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const Colors = useColors()
  return (
    <Stack gap={10}>
      <Text fontSize={11} fontWeight="700" color={Colors.textTertiary}
        letterSpacing={0.8} paddingHorizontal={4} opacity={0.7}>{title}</Text>
      <Stack backgroundColor={Colors.surface} borderRadius={18} overflow="hidden"
        borderWidth={1} borderColor={Colors.border}
        shadowColor="#000" shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.06} shadowRadius={10} elevation={2}>
        {children}
      </Stack>
    </Stack>
  )
}

export default function SettingsScreen() {
  const Colors   = useColors()
  const settings = useSettings()

  const handleDevReset = async () => {
    Alert.alert(
      'Reset local app data?',
      'This will erase all locally stored development data and restart the app.',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            try {
              await devResetService.resetAllData()
              // Delay slightly to ensure state updates are processed
              setTimeout(() => {
                Alert.alert('Success', 'App data has been reset. Please restart the app.', [
                  { text: 'OK', onPress: () => router.navigate('/(auth)/welcome') }
                ])
              }, 500)
            } catch {
              Alert.alert('Error', 'Failed to reset app data. Please try again.')
            }
          },
          style: 'destructive',
        },
      ]
    )
  }

  return (
    <StyledPage showStatusBar backgroundColor={Colors.background}>
      <StyledPage.Header 
        marginHorizontal={32}
        title="Settings" titleAlignment="left"
        backgroundColor={Colors.background}
        titleProps={{ fontSize: 22, fontWeight: '800', fontFamily:'PlusJakartaSans_700Bold',  color: Colors.textPrimary }} />
      
      <StyledScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 20 }}
        showsVerticalScrollIndicator={false}>

        {/* Profile card */}
        <StyledPressable onPress={() => router.push('/(app)/(settings)/profile')}
          backgroundColor={Colors.surface} borderRadius={20} padding={20}
          borderWidth={1} borderColor={Colors.border}
          shadowColor="#000" shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.08} shadowRadius={12} elevation={3}
          flexDirection="row" alignItems="center" gap={16}
          accessibilityRole="button"
          accessibilityLabel={`My Account, ${settings.isPremium ? 'Premium' : 'Free plan'}`}>
          <Stack width={60} height={60} borderRadius={30} backgroundColor={Colors.primaryFaint}
            alignItems="center" justifyContent="center" borderWidth={1.5} borderColor={Colors.border}>
            <VelaIcon name="vela" size={28} color={Colors.primary} />
          </Stack>
          <Stack flex={1} gap={4}>
            <Text fontSize={17} fontWeight="800" color={Colors.textPrimary}>My Account</Text>
            <Text fontSize={13} color={Colors.textSecondary} opacity={0.8}>Preferences · Units · Privacy</Text>
            {settings.isPremium ? (
              <Stack horizontal alignItems="center" gap={5} backgroundColor={Colors.primaryFaint}
                borderRadius={8} paddingHorizontal={10} paddingVertical={4} alignSelf="flex-start" borderWidth={1} borderColor={Colors.primary}>
                <VelaIcon name="crown" size={11} color={Colors.primary} />
                <Text fontSize={11} fontWeight="700" color={Colors.primary}>Premium</Text>
              </Stack>
            ) : (
              <Text fontSize={12} color={Colors.textSecondary} opacity={0.7}>Free plan</Text>
            )}
          </Stack>
          <Stack opacity={0.6}><VelaIcon name="chevron-right" size={18} color={Colors.textTertiary} /></Stack>
        </StyledPressable>

        {/* Premium banner */}
        {!settings.isPremium && (
          <StyledPressable onPress={() => router.push('/(app)/(settings)/premium')}
            backgroundColor="#A960DA" borderRadius={18} padding={18}
            borderWidth={1} borderColor="rgba(255,255,255,0.12)"
            shadowColor="#A960DA" shadowOffset={{ width: 0, height: 3 }}
            shadowOpacity={0.18} shadowRadius={12} elevation={4}
            flexDirection="row" alignItems="center" gap={14}
            accessibilityRole="button"
            accessibilityLabel="Unlock Premium: Partner sharing, Reports, All themes">
            {/* <Stack width={46} height={46} borderRadius={23}
              backgroundColor="rgba(255,255,255,0.2)" borderWidth={1} borderColor="rgba(255,255,255,0.25)"
              alignItems="center" justifyContent="center">
              <VelaIcon name="vela" size={24} color={Colors.textInverse} />
            </Stack> */}
            <Stack flex={1} gap={3}>
              <Text fontSize={16} fontWeight="800" color={Colors.textInverse}>Unlock Premium</Text>
              <Text fontSize={12} color="rgba(255,255,255,0.7)">Partner sharing · Reports · All themes</Text>
            </Stack>
            <Stack backgroundColor="rgba(255,255,255,0.2)" borderWidth={1} borderColor="rgba(255,255,255,0.25)" borderRadius={10}
              paddingHorizontal={12} paddingVertical={6}>
              <Text fontSize={11} fontWeight="700" color={Colors.textInverse}>Save 45%</Text>
            </Stack>
          </StyledPressable>
        )}

        <Section title="CYCLE">
          <MenuRow icon="cycle" label="Cycle Settings" subtitle={`${settings.avgCycleLength}-day average`}
            onPress={() => router.push('/(app)/(settings)/cycle-settings')} />
          <StyledDivider borderBottomColor={Colors.border} opacity={0.25} marginHorizontal={16} />
          <MenuRow icon="bell" label="Notifications" subtitle="Period, ovulation & fertile reminders"
            onPress={() => router.push('/(app)/(settings)/notifications')} />
          </Section>

        <Section title="LOGGING">
          <MenuRow icon="heart" label="Manage Moods" subtitle="Choose which moods appear when logging"
            onPress={() => router.push('/(app)/(settings)/moods')} />
          <StyledDivider borderBottomColor={Colors.border} opacity={0.25} marginHorizontal={16} />
          <MenuRow icon="activity" label="Manage Symptoms" subtitle="Choose which symptoms appear when logging"
            onPress={() => router.push('/(app)/(settings)/symptoms')} />
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

        <Section title="DATA">
          <MenuRow icon="download" label="Export Data" subtitle="Backup or share your cycle data"
            onPress={() => actionSheetService.present(<ExportDataContent />, { theme : 'light' })} />
          <StyledDivider borderBottomColor={Colors.border} opacity={0.25} marginHorizontal={16} />
          <MenuRow icon="upload" label="Import Data" subtitle="Restore from backup code or file"
            onPress={() => actionSheetService.present(<ImportDataContent onDone={() => {}} />, { theme : 'light' })} />
        </Section>

        <Section title="LEARN">
          <MenuRow icon="phase-fertile" label="Articles" subtitle="Cycle, fertility & wellness guides"
            onPress={() => router.push('/(app)/(settings)/articles')} badge="NEW" />
          <StyledDivider borderBottomColor={Colors.border} opacity={0.25} marginHorizontal={16} />
          <MenuRow icon="help" label="FAQ" subtitle="Common questions answered"
            onPress={() => router.push('/(app)/(settings)/faq')} />
        </Section>

        <Section title="ABOUT">
          <MenuRow icon="shield-check" label="Privacy Policy"
            onPress={() => router.push('/(app)/(settings)/privacy')} />
          <StyledDivider borderBottomColor={Colors.border} opacity={0.25} marginHorizontal={16} />
          <MenuRow icon="info" label="About Vela" subtitle="Version 1.0.0" />
        </Section>

        {/* Development only: Reset button */}
        {__DEV__ && (
          <Section title="DEVELOPMENT">
            <MenuRow 
              icon="refresh-cw" 
              label="Reset Local Data" 
              subtitle="Clear all data and restart"
              destructive
              onPress={handleDevReset}
              iconBg={Colors.surface}
            />
          </Section>
        )}

        <PrivacyBadge />
        <Stack alignItems="center" paddingTop={4} gap={3}>
          <Text fontSize={11} color={Colors.textTertiary}>
            Vela v{Constants.expoConfig?.version ?? '1.0.0'} · Your cycle data stays on this device
          </Text>
        </Stack>
      </StyledScrollView>
    </StyledPage>
  )
}
