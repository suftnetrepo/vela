/**
 * BrandHeader — Premium branding component for app header
 *
 * Combines Vela's flower mark + wordmark in a cohesive,
 * intentional layout. Used on home screen and splash screens.
 *
 * Design principles:
 * - Calm, premium, feminine language
 * - Clean vertical alignment
 * - Breathing room around elements
 * - Consistent with app pastel palette
 */

import React from 'react'
import { Stack, StyledText } from 'fluent-styles'
import { Text } from '../text'
import { VelaIcon } from './VelaIcon'

interface BrandHeaderProps {
  /** Primary brand color (e.g., Colors.primary) */
  color?: string
  /** Icon size in pixels */
  iconSize?: number
  /** Font size for "Vela" wordmark */
  fontSize?: number
  /** Font weight for "Vela" wordmark */
  fontWeight?: '500' | '600' | '700'
  /** Vertical spacing between icon and text (in pixels) */
  spacing?: number
  /** Arrange horizontally instead of vertically */
  horizontal?: boolean
  /** Gap between icon and text when horizontal */
  horizontalGap?: number
}

export function BrandHeader({
  color = '#E8748A',
  iconSize = 28,
  fontSize = 24,
  fontWeight = '600',
  spacing = 8,
  horizontal = false,
  horizontalGap = 8,
}: BrandHeaderProps) {
  if (horizontal) {
    return (
      <Stack
        flexDirection="row"
        alignItems="center"
        gap={horizontalGap}
      >
        <VelaIcon name="flower" size={iconSize} color={color} />
        <StyledText
          fontSize={fontSize}
          fontWeight={fontWeight}
          color={color}
          letterSpacing={-0.4}
        >
          Vela
        </StyledText>
      </Stack>
    )
  }

  // Vertical stack (splash/centered layouts)
  return (
    <Stack alignItems="center" gap={spacing}>
      <VelaIcon name="flower" size={iconSize} color={color} />
      <StyledText
        fontSize={fontSize}
        fontWeight={fontWeight}
        color={color}
        letterSpacing={-0.4}
      >
        Vela
      </StyledText>
    </Stack>
  )
}
