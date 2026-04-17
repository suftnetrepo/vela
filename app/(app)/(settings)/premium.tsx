import React, { useState } from 'react'
import { Stack, StyledText, StyledScrollView, StyledPage, StyledPressable, StyledDivider, theme } from 'fluent-styles'
import { Text } from '@/components/text'
import { router } from 'expo-router'
import { useColors } from '../../../src/hooks/useColors'
import { usePremium } from '../../../src/hooks/usePremium'
import { VelaIcon } from '../../../src/components/shared/VelaIcon'
import type { VelaIconName } from '../../../src/components/shared/VelaIcon'
import { PREMIUM_FEATURES, PREMIUM_PRICING } from '../../../src/constants/premium'

type PlanKey = 'MONTHLY' | 'YEARLY' | 'LIFETIME'

const FEATURE_MAPPING: Record<number, VelaIconName> = {
  0: 'activity',
  1: 'report',
  2: 'pill',
  3: 'baby',
  4: 'palette',
  5: 'gift',
}

export default function PremiumScreen() {
  const Colors = useColors()
  const premium = usePremium()
  const [selected, setSelected] = useState<PlanKey>('YEARLY')

  const handlePurchasePress = async () => {
    let success = false
    if (selected === 'MONTHLY')  success = await premium.buyMonthly()
    if (selected === 'YEARLY')   success = await premium.buyYearly()
    if (selected === 'LIFETIME') success = await premium.buyLifetime()
    if (success) router.back()
  }

  if (premium.isPremium) {
    return (
      <StyledPage flex={1} backgroundColor={Colors.background}>
        <StyledPage.Header
          title="Premium"
          titleAlignment="center"
          marginHorizontal={16}
          shapeProps={{
            size: 48,
            backgroundColor: Colors.primaryFaint,
          }}
          backArrowProps={{
            color: Colors.textPrimary,
          }}
          showBackArrow
          onBackPress={() => router.push('/(app)/settings')}
          backgroundColor={Colors.background}
          titleProps={{ fontWeight: "700", color: Colors.textPrimary }}
        />
        <Stack flex={1} alignItems="center" justifyContent="center" padding={32} gap={20}>
          <Stack width={88} height={88} borderRadius={44} backgroundColor={Colors.primaryFaint}
            alignItems="center" justifyContent="center" borderWidth={2} borderColor={Colors.border}>
            <VelaIcon name="check-circle" size={44} color={Colors.primary} />
          </Stack>
          <Text fontSize={22} fontWeight="800" color={Colors.textPrimary} textAlign="center">
            You're Premium!
          </Text>
          <Text fontSize={15} color={Colors.textSecondary} textAlign="center">
            {premium.plan === 'lifetime'
              ? 'Lifetime access — all features forever.'
              : `Your ${premium.plan} subscription is active.`}
          </Text>
        </Stack>
      </StyledPage>
    )
  }

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      <StyledPage.Header
        title=""
        titleAlignment="center"
        marginHorizontal={16}
        shapeProps={{
          size: 48,
          backgroundColor: Colors.primaryFaint,
        }}
        backArrowProps={{
          color: Colors.textPrimary,
        }}
        showBackArrow
        onBackPress={() => router.push('/(app)/settings')}
        backgroundColor={Colors.background}
        titleProps={{ fontWeight: "700", color: Colors.textPrimary }}
      />
      <StyledScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <Stack alignItems="center" paddingHorizontal={32} paddingTop={8} paddingBottom={32} gap={14}>
          <Stack width={88} height={88} borderRadius={44} backgroundColor={Colors.primaryFaint}
            alignItems="center" justifyContent="center" borderWidth={2} borderColor={Colors.border}>
            <VelaIcon name="crown" size={44} color={Colors.primary} />
          </Stack>
          <Text fontSize={28} fontWeight="800" color={Colors.textPrimary} textAlign="center">
            Vela Premium
          </Text>
          <Text fontSize={15} color={Colors.textSecondary} textAlign="center" lineHeight={22}>
            Unlock advanced insights, exports, themes, and more. Support independent, privacy-first development.
          </Text>
          <Stack backgroundColor={Colors.successLight} borderRadius={20}
            paddingHorizontal={16} paddingVertical={8} horizontal alignItems="center" gap={6}>
            <VelaIcon name="gift" size={14} color={Colors.success} />
            <Text fontSize={13} fontWeight="700" color={Colors.success}>
              7-day free trial
            </Text>
          </Stack>
        </Stack>

        {/* Features */}
        <Stack paddingHorizontal={20} gap={10} marginBottom={28}>
          {PREMIUM_FEATURES.map((f, i) => (
            <Stack key={f.title} horizontal alignItems="flex-start" gap={14}
              backgroundColor={Colors.surface} borderRadius={16} padding={14}
              shadowColor="#000" shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.04} shadowRadius={6} elevation={1}>
              <Stack width={40} height={40} borderRadius={12} backgroundColor={Colors.primaryFaint}
                alignItems="center" justifyContent="center">
                <VelaIcon name={FEATURE_MAPPING[i] || 'gift'} size={20} color={Colors.primary} />
              </Stack>
              <Stack flex={1} gap={2}>
                <Text fontSize={14} fontWeight="700" color={Colors.textPrimary}>{f.title}</Text>
                <Text fontSize={12} color={Colors.textSecondary}>{f.description}</Text>
              </Stack>
            </Stack>
          ))}
        </Stack>

        {/* Plans */}
        <Stack paddingHorizontal={20} gap={10} marginBottom={24}>
          {(['YEARLY', 'LIFETIME', 'MONTHLY'] as PlanKey[]).map(key => {
            const p = PREMIUM_PRICING[key]
            const isSelected = selected === key
            const isBestValue = key === 'LIFETIME'
            return (
              <StyledPressable key={key} onPress={() => setSelected(key)}
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
                  <Stack horizontal alignItems="center" gap={8} flexWrap="wrap">
                    <Text fontSize={16} fontWeight="700" color={Colors.textPrimary}>{p.label}</Text>
                    {'saving' in p && (
                      <Stack backgroundColor={Colors.primary} borderRadius={8}
                        paddingHorizontal={8} paddingVertical={3}>
                        <Text fontSize={10} fontWeight="800" color={Colors.textInverse}>{(p as any).saving}</Text>
                      </Stack>
                    )}
                    {isBestValue && (
                      <Stack backgroundColor="#F59E0B" borderRadius={8}
                        paddingHorizontal={8} paddingVertical={3}>
                        <Text fontSize={10} fontWeight="800" color="#fff">BEST VALUE</Text>
                      </Stack>
                    )}
                  </Stack>
                  {'trial' in p && (
                    <Text fontSize={12} color={Colors.primary} fontWeight="600">
                      {(p as any).trial}
                    </Text>
                  )}
                  {key === 'LIFETIME' && (
                    <Text fontSize={12} color={Colors.textTertiary}>
                      Pay once, use forever
                    </Text>
                  )}
                  {key === 'MONTHLY' && (
                    <Text fontSize={12} color={Colors.textTertiary}>
                      Billed monthly, cancel anytime
                    </Text>
                  )}
                </Stack>
                <Text fontSize={16} fontWeight="800" color={isSelected ? Colors.primaryDark : Colors.textPrimary}>
                  {p.price}
                </Text>
              </StyledPressable>
            )
          })}
        </Stack>

        {/* CTA */}
        <Stack paddingHorizontal={20} gap={12}>
          <StyledPressable backgroundColor={Colors.primary} borderRadius={30}
            paddingVertical={18} alignItems="center" onPress={handlePurchasePress}
            flexDirection="row" justifyContent="center" gap={10}
            shadowColor={Colors.primary} shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.35} shadowRadius={12} elevation={6}>
            <VelaIcon name="crown" size={18} color={Colors.textInverse} />
            <Text fontSize={17} fontWeight="800" color={Colors.textInverse}>
              {selected === 'YEARLY'   ? '🎉 Start Free Trial' :
               selected === 'LIFETIME' ? '⚡ Buy Lifetime'    :
               '🚀 Start Monthly'}
            </Text>
          </StyledPressable>
          <StyledPressable onPress={premium.restore}>
            <Text fontSize={12} color={Colors.primary} textAlign="center">
              Restore purchases
            </Text>
          </StyledPressable>
          <StyledDivider borderBottomColor={Colors.border} />
          <Text fontSize={11} color={Colors.textTertiary} textAlign="center" lineHeight={16}>
            Subscriptions renew automatically. Cancel anytime. Payment charged to your Apple ID at confirmation.
          </Text>
        </Stack>
      </StyledScrollView>
    </StyledPage>
  )
}
