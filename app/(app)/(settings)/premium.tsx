import React, { useState } from 'react'
import { Stack, StyledText, StyledScrollView, StyledPage, StyledHeader, StyledPressable, StyledDivider } from 'fluent-styles'
import { router } from 'expo-router'
import { useColors } from '../../../src/hooks/useColors'
import { useSettingsStore } from '../../../src/stores/settings.store'
import { settingsService } from '../../../src/services/settings.service'
import { SETTINGS_KEYS, APP_CONFIG } from '../../../src/constants/config'
import { VelaIcon } from '../../../src/components/shared/VelaIcon'
import type { VelaIconName } from '../../../src/components/shared/VelaIcon'
import { loaderService, toastService } from 'fluent-styles'

interface FeatureDef { icon: VelaIconName; title: string; desc: string }

const FEATURES: FeatureDef[] = [
  { icon: 'partner',  title: 'Partner sharing',   desc: 'Share your cycle with a partner via invite code' },
  { icon: 'pill',     title: 'Pill reminders',     desc: 'Daily contraception reminders with custom times' },
  { icon: 'baby',     title: 'Pregnancy mode',     desc: 'Track your pregnancy week by week' },
  { icon: 'report',   title: 'Detailed reports',   desc: 'Export your cycle data as PDF or CSV' },
  { icon: 'activity', title: 'Advanced insights',  desc: 'PMS patterns, mood correlations, and more' },
  { icon: 'palette',  title: 'All themes',         desc: 'Lavender, Sage, and Midnight colour themes' },
]

const PLANS = [
  { id: 'monthly',  label: 'Monthly',  price: `£${APP_CONFIG.premium.monthly}/mo`,  sublabel: 'Billed monthly',        badge: null },
  { id: 'yearly',   label: 'Yearly',   price: `£${APP_CONFIG.premium.yearly}/yr`,   sublabel: 'Just £1.25/month',      badge: 'BEST VALUE' },
  { id: 'lifetime', label: 'Lifetime', price: `£${APP_CONFIG.premium.lifetime}`,    sublabel: 'One-time payment',      badge: 'MOST POPULAR' },
]

export default function PremiumScreen() {
  const Colors    = useColors()
  const isPremium = useSettingsStore(s => s.isPremium)
  const setIsPremium = useSettingsStore(s => s.setIsPremium)
  const [selected, setSelected] = useState('yearly')

  const handleSubscribe = async () => {
    const id = loaderService.show({ label: 'Processing…', variant: 'dots' })
    // Simulate payment (RevenueCat integration point)
    await new Promise(r => setTimeout(r, 1500))
    loaderService.hide(id)
    // Mock success
    await settingsService.set(SETTINGS_KEYS.IS_PREMIUM, true)
    setIsPremium(true)
    toastService.success('Welcome to Premium! ✨', 'All features unlocked.')
    router.push('/(app)/settings')
  }

  if (isPremium) {
    return (
      <StyledPage flex={1} backgroundColor={Colors.background}>
        <StyledHeader title="Premium" titleAlignment="center" showBackArrow
          onBackPress={() => router.push('/(app)/settings')} showStatusBar backgroundColor={Colors.background}
          titleProps={{ fontWeight: '700', color: Colors.textPrimary }} />
        <Stack flex={1} alignItems="center" justifyContent="center" padding={32} gap={20}>
          <Stack width={88} height={88} borderRadius={44} backgroundColor={Colors.primaryFaint}
            alignItems="center" justifyContent="center" borderWidth={2} borderColor={Colors.border}>
            <VelaIcon name="check-circle" size={44} color={Colors.primary} />
          </Stack>
          <StyledText fontSize={22} fontWeight="800" color={Colors.textPrimary} textAlign="center">
            You're on Premium!
          </StyledText>
          <StyledText fontSize={15} color={Colors.textSecondary} textAlign="center">
            All features are unlocked. Thank you for supporting Vela.
          </StyledText>
        </Stack>
      </StyledPage>
    )
  }

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      <StyledHeader title="" titleAlignment="center" showBackArrow
        onBackPress={() => router.push('/(app)/settings')} showStatusBar backgroundColor={Colors.background} />

      <StyledScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <Stack alignItems="center" paddingHorizontal={32} paddingTop={8} paddingBottom={32} gap={14}>
          <Stack width={88} height={88} borderRadius={44} backgroundColor={Colors.primaryFaint}
            alignItems="center" justifyContent="center" borderWidth={2} borderColor={Colors.border}>
            <VelaIcon name="crown" size={44} color={Colors.primary} />
          </Stack>
          <StyledText fontSize={28} fontWeight="800" color={Colors.textPrimary} textAlign="center">
            Vela Premium
          </StyledText>
          <StyledText fontSize={15} color={Colors.textSecondary} textAlign="center" lineHeight={22}>
            Unlock all features and support independent, privacy-first development.
          </StyledText>
          <Stack backgroundColor={Colors.successLight} borderRadius={20}
            paddingHorizontal={16} paddingVertical={8} horizontal alignItems="center" gap={6}>
            <VelaIcon name="gift" size={14} color={Colors.success} />
            <StyledText fontSize={13} fontWeight="700" color={Colors.success}>
              7-day free trial included
            </StyledText>
          </Stack>
        </Stack>

        {/* Features */}
        <Stack paddingHorizontal={20} gap={10} marginBottom={28}>
          {FEATURES.map(f => (
            <Stack key={f.title} horizontal alignItems="flex-start" gap={14}
              backgroundColor={Colors.surface} borderRadius={16} padding={14}
              shadowColor="#000" shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.04} shadowRadius={6} elevation={1}>
              <Stack width={40} height={40} borderRadius={12} backgroundColor={Colors.primaryFaint}
                alignItems="center" justifyContent="center">
                <VelaIcon name={f.icon} size={20} color={Colors.primary} />
              </Stack>
              <Stack flex={1} gap={2}>
                <StyledText fontSize={14} fontWeight="700" color={Colors.textPrimary}>{f.title}</StyledText>
                <StyledText fontSize={12} color={Colors.textSecondary}>{f.desc}</StyledText>
              </Stack>
            </Stack>
          ))}
        </Stack>

        {/* Plans */}
        <Stack paddingHorizontal={20} gap={10} marginBottom={24}>
          {PLANS.map(plan => {
            const isSelected = selected === plan.id
            return (
              <StyledPressable key={plan.id} onPress={() => setSelected(plan.id)}
                backgroundColor={isSelected ? Colors.primaryFaint : Colors.surface}
                borderRadius={18} padding={18} borderWidth={isSelected ? 2 : 1}
                borderColor={isSelected ? Colors.primary : Colors.border}
                flexDirection="row" alignItems="center" gap={14}>
                <Stack width={24} height={24} borderRadius={12}
                  backgroundColor={isSelected ? Colors.primary : 'transparent'}
                  borderWidth={isSelected ? 0 : 2} borderColor={Colors.border}
                  alignItems="center" justifyContent="center">
                  {isSelected && <VelaIcon name="check" size={13} color={Colors.textInverse} />}
                </Stack>
                <Stack flex={1} gap={2}>
                  <Stack horizontal alignItems="center" gap={8}>
                    <StyledText fontSize={16} fontWeight="700" color={Colors.textPrimary}>{plan.label}</StyledText>
                    {plan.badge && (
                      <Stack backgroundColor={Colors.primary} borderRadius={8}
                        paddingHorizontal={8} paddingVertical={3}>
                        <StyledText fontSize={10} fontWeight="800" color={Colors.textInverse}>{plan.badge}</StyledText>
                      </Stack>
                    )}
                  </Stack>
                  <StyledText fontSize={12} color={Colors.textTertiary}>{plan.sublabel}</StyledText>
                </Stack>
                <StyledText fontSize={16} fontWeight="800" color={isSelected ? Colors.primaryDark : Colors.textPrimary}>
                  {plan.price}
                </StyledText>
              </StyledPressable>
            )
          })}
        </Stack>

        {/* CTA */}
        <Stack paddingHorizontal={20} gap={12}>
          <StyledPressable backgroundColor={Colors.primary} borderRadius={30}
            paddingVertical={18} alignItems="center" onPress={handleSubscribe}
            flexDirection="row" justifyContent="center" gap={10}
            shadowColor={Colors.primary} shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.35} shadowRadius={12} elevation={6}>
            <VelaIcon name="premium" size={18} color={Colors.textInverse} />
            <StyledText fontSize={17} fontWeight="800" color={Colors.textInverse}>
              Start free trial
            </StyledText>
          </StyledPressable>
          <StyledText fontSize={12} color={Colors.textTertiary} textAlign="center">
            Cancel anytime. No charge during trial.
          </StyledText>
          <StyledDivider borderBottomColor={Colors.border} />
          <StyledText fontSize={11} color={Colors.textTertiary} textAlign="center" lineHeight={16}>
            Payment processed by RevenueCat. Subscription renews automatically unless cancelled 24 hours before renewal date. Prices in GBP.
          </StyledText>
        </Stack>
      </StyledScrollView>
    </StyledPage>
  )
}
