import React from 'react'
import { Stack, StyledText } from 'fluent-styles'
import { Text } from '../text'
import { useColors } from '../../hooks/useColors'
import { VelaIcon } from './VelaIcon'

interface PrivacyBadgeProps {
  compact?: boolean
}

export function PrivacyBadge({ compact }: PrivacyBadgeProps) {
  const Colors = useColors()

  if (compact) {
    return (
      <Stack horizontal alignItems="center" gap={6} backgroundColor={Colors.successLight}
        borderRadius={20} paddingHorizontal={12} paddingVertical={6}>
        <VelaIcon name="shield-check" size={13} color={Colors.success} />
        <StyledText fontSize={11} color={Colors.success} fontWeight="600">
          Stored on device only
        </StyledText>
      </Stack>
    )
  }

  return (
    <Stack backgroundColor={Colors.successLight} borderRadius={16} padding={16} gap={10}>
      <Stack horizontal alignItems="center" gap={10}>
        <Stack width={40} height={40} borderRadius={20} backgroundColor={Colors.surface}
          alignItems="center" justifyContent="center">
          <VelaIcon name="shield-check" size={22} color={Colors.success} />
        </Stack>
        <StyledText fontSize={15} fontWeight="700" color={Colors.textPrimary}>
          Your data stays on your phone
        </StyledText>
      </Stack>
      <StyledText fontSize={13} color={Colors.textSecondary} lineHeight={20}>
        Vela never connects to the internet. No accounts, no analytics, no data sharing — ever.
        Your cycle data belongs to you, and only you.
      </StyledText>
    </Stack>
  )
}
