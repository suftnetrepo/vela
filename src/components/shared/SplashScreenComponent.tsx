/**
 * SplashScreenComponent — Premium, branded app splash
 *
 * Displays during app boot while RevenueCat and database initialize.
 * Calm, minimal, and private-first aesthetic.
 *
 * Design:
 * - Centered Vela brand
 * - Soft pastel background
 * - Minimal visual noise
 * - Short display time (only during actual boot)
 */

import React from 'react'
import { Stack, StyledText } from 'fluent-styles'
import { Text } from '@/components/text'
import { useColors } from '../../hooks/useColors'
import { BrandHeader } from './BrandHeader'

interface SplashScreenComponentProps {
  /** Optional subtitle under the brand (e.g., "Loading your journey...") */
  subtitle?: string
  /** Show a minimal loading indicator */
  showLoader?: boolean
}

export function SplashScreenComponent({
  subtitle,
  showLoader = false,
}: SplashScreenComponentProps) {
  const Colors = useColors()

  return (
    <Stack
      flex={1}
      backgroundColor={Colors.background}
      alignItems="center"
      justifyContent="center"
      paddingHorizontal={24}
    >
      {/* Primary brand lock */}
      <BrandHeader
        color={Colors.primary}
        iconSize={64}
        fontSize={48}
        fontWeight="700"
        spacing={16}
      />

      {/* Optional subtitle for context */}
      {subtitle && (
        <Stack marginTop={32}>
          <Text
            fontSize={14}
            color={Colors.textTertiary}
            textAlign="center"
            letterSpacing={0.2}
            fontWeight="400"
          >
            {subtitle}
          </Text>
        </Stack>
      )}

      {/* Minimal loader indicator */}
      {showLoader && (
        <Stack marginTop={40}>
          <Stack
            width={3}
            height={3}
            borderRadius={99}
            backgroundColor={Colors.primary}
            opacity={0.4}
          />
        </Stack>
      )}
    </Stack>
  )
}
