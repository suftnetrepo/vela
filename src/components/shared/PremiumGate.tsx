import React from 'react'
import { Stack, StyledText, StyledPressable } from 'fluent-styles'
import { useColors } from '../../hooks/useColors'
import { usePremium } from '../../hooks/usePremium'
import { router } from 'expo-router'
import { VelaIcon } from './VelaIcon'

interface PremiumGateProps {
  children:     React.ReactNode
  feature:      string
  description?: string
  compact?:     boolean
}

export function PremiumGate({ children, feature, description, compact = false }: PremiumGateProps) {
  const Colors = useColors()
  const { isPremium } = usePremium()

  if (isPremium) return <>{children}</>

  if (compact) {
    return (
      <Stack
        horizontal alignItems="center" gap={12}
        paddingVertical={12} paddingHorizontal={16}
        borderRadius={14}
        backgroundColor={Colors.surface}
        borderWidth={1} borderColor={Colors.border}
      >
        <StyledText fontSize={18}>✨</StyledText>
        <Stack flex={1} gap={2}>
          <StyledText fontSize={13} fontWeight="700" color={Colors.textPrimary}>
            {feature}
          </StyledText>
          {description && (
            <StyledText fontSize={12} color={Colors.textSecondary}>{description}</StyledText>
          )}
        </Stack>
        <StyledPressable
          paddingVertical={8} paddingHorizontal={14}
          borderRadius={20} backgroundColor={Colors.primary}
          onPress={() => router.push('/(app)/(settings)/premium')}
        >
          <StyledText fontSize={12} fontWeight="700" color={Colors.textInverse}>Unlock</StyledText>
        </StyledPressable>
      </Stack>
    )
  }

  return (
    <Stack gap={20} alignItems="center" padding={32}>
      <Stack width={72} height={72} borderRadius={36} backgroundColor={Colors.primaryFaint}
        alignItems="center" justifyContent="center" borderWidth={2} borderColor={Colors.border}>
        <VelaIcon name="crown" size={36} color={Colors.primary} />
      </Stack>
      <Stack gap={8} alignItems="center">
        <StyledText fontSize={20} fontWeight="800" color={Colors.textPrimary} textAlign="center">
          {feature}
        </StyledText>
        {description && (
          <StyledText fontSize={14} color={Colors.textSecondary} textAlign="center" lineHeight={21}>
            {description}
          </StyledText>
        )}
      </Stack>
      <StyledPressable backgroundColor={Colors.primary} borderRadius={30}
        paddingHorizontal={32} paddingVertical={14}
        onPress={() => router.push('/(app)/(settings)/premium')}
        flexDirection="row" alignItems="center" gap={8}
        shadowColor={Colors.primary} shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.3} shadowRadius={12} elevation={5}>
        <VelaIcon name="premium" size={16} color={Colors.textInverse} />
        <StyledText fontSize={15} fontWeight="700" color={Colors.textInverse}>
          Unlock Premium
        </StyledText>
      </StyledPressable>
      <StyledText fontSize={12} color={Colors.textTertiary}>
        7-day free trial · From £2.99/month
      </StyledText>
    </Stack>
  )
}
