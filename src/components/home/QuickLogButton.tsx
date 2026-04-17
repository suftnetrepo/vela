import React from 'react'
import { Stack, StyledText, StyledPressable } from 'fluent-styles'
import { Text } from '../text'
import { useColors } from '../../hooks/useColors'
import { VelaIcon } from '../shared/VelaIcon'

interface QuickLogButtonProps {
  onPress: () => void
}

export function QuickLogButton({ onPress }: QuickLogButtonProps) {
  const Colors = useColors()
  return (
    <StyledPressable onPress={onPress} backgroundColor={Colors.primary} borderRadius={30}
      paddingHorizontal={28} paddingVertical={16} flexDirection="row" alignItems="center" gap={10}
      shadowColor={Colors.primary} shadowOffset={{ width: 0, height: 4 }}
      shadowOpacity={0.3} shadowRadius={12} elevation={5}>
      <VelaIcon name="edit" size={18} color={Colors.textInverse} />
      <StyledText fontSize={15} fontWeight="700" color={Colors.textInverse}>
        Log today
      </StyledText>
    </StyledPressable>
  )
}
