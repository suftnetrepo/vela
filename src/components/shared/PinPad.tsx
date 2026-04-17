import React, { useState } from 'react'
import { Stack, StyledText, StyledPressable } from 'fluent-styles'
import { Text } from '@/components/text'
import { useColors } from '../../hooks/useColors'
import { VelaIcon } from './VelaIcon'
import { APP_CONFIG } from '../../constants/config'

interface PinPadProps {
  title:       string
  subtitle?:   string
  onComplete:  (pin: string) => void
  error?:      string
  loading?:    boolean
}

// Layout: 1-9 then empty/0/backspace
const KEY_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['',  '0', '⌫'],
]

export function PinPad({ title, subtitle, onComplete, error, loading }: PinPadProps) {
  const Colors        = useColors()
  const [pin, setPin] = useState('')
  const len           = APP_CONFIG.pinLength

  const handleKey = (key: string) => {
    if (loading) return
    if (key === '⌫') {
      setPin(p => p.slice(0, -1))
      return
    }
    if (key === '') return
    const next = pin + key
    setPin(next)
    if (next.length === len) {
      onComplete(next)
      setPin('')
    }
  }

  return (
    <Stack alignItems="center" gap={36} flex={1} justifyContent="center">
      {/* Title */}
      <Stack alignItems="center" gap={8}>
        <Text fontSize={24} fontWeight="800" color={Colors.textPrimary}>
          {title}
        </Text>
        {subtitle ? (
          <Text fontSize={14} color={Colors.textSecondary} textAlign="center"
            paddingHorizontal={32}>
            {subtitle}
          </Text>
        ) : null}
      </Stack>

      {/* PIN dots */}
      <Stack flexDirection="row" gap={20} alignItems="center">
        {Array.from({ length: len }).map((_, i) => (
          <Stack
            key={i}
            width={16}
            height={16}
            borderRadius={8}
            backgroundColor={i < pin.length ? Colors.primary : 'transparent'}
            borderWidth={2.5}
            borderColor={error ? Colors.error : i < pin.length ? Colors.primary : Colors.primaryLight}
          />
        ))}
      </Stack>

      {/* Error */}
      {error ? (
        <Text fontSize={13} color={Colors.error} textAlign="center"
          paddingHorizontal={32}>
          {error}
        </Text>
      ) : null}

      {/* Keypad */}
      <Stack gap={14} alignItems="center">
        {KEY_ROWS.map((row, ri) => (
          <Stack key={ri} flexDirection="row" gap={16}>
            {row.map((key, ki) => {
              const isEmpty    = key === ''
              const isBackspace = key === '⌫'
              return (
                <StyledPressable
                  key={ki}
                  width={80}
                  height={80}
                  borderRadius={40}
                  backgroundColor={isEmpty ? 'transparent' : Colors.primaryFaint}
                  alignItems="center"
                  justifyContent="center"
                  onPress={() => handleKey(key)}
                  disabled={isEmpty || loading}
                >
                  {isBackspace ? (
                    <VelaIcon name="close" size={22} color={Colors.textPrimary} />
                  ) : (
                    <Text
                      fontSize={26}
                      fontWeight="500"
                      color={isEmpty ? 'transparent' : Colors.textPrimary}
                    >
                      {key}
                    </Text>
                  )}
                </StyledPressable>
              )
            })}
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}
