import React, { useState } from 'react'
import { Stack, StyledText, StyledPressable } from 'fluent-styles'
import { useColors } from '../../hooks/useColors'
import { APP_CONFIG } from '../../constants/config'

interface PinPadProps {
  title:       string
  subtitle?:   string
  onComplete:  (pin: string) => void
  error?:      string
  loading?:    boolean
}

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫']

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
    <Stack alignItems="center" gap={32} flex={1} justifyContent="center">
      {/* Title */}
      <Stack alignItems="center" gap={6}>
        <StyledText fontSize={22} fontWeight="700" color={Colors.textPrimary}>
          {title}
        </StyledText>
        {subtitle ? (
          <StyledText fontSize={14} color={Colors.textSecondary} textAlign="center">
            {subtitle}
          </StyledText>
        ) : null}
      </Stack>

      {/* Dots */}
      <Stack horizontal gap={16} alignItems="center">
        {Array.from({ length: len }).map((_, i) => (
          <Stack
            key={i}
            width={14}
            height={14}
            borderRadius={7}
            backgroundColor={i < pin.length ? Colors.primary : 'transparent'}
            borderWidth={2}
            borderColor={error ? Colors.error : Colors.primary}
          />
        ))}
      </Stack>

      {/* Error */}
      {error ? (
        <StyledText fontSize={13} color={Colors.error} textAlign="center">
          {error}
        </StyledText>
      ) : null}

      {/* Keypad */}
      <Stack gap={12} alignItems="center">
        {[KEYS.slice(0,3), KEYS.slice(3,6), KEYS.slice(6,9), KEYS.slice(9,12)].map((row, ri) => (
          <Stack key={ri} horizontal gap={12}>
            {row.map((key, ki) => (
              <StyledPressable
                key={ki}
                width={72}
                height={72}
                borderRadius={36}
                backgroundColor={key === '' ? 'transparent' : Colors.surfaceAlt}
                alignItems="center"
                justifyContent="center"
                onPress={() => handleKey(key)}
                disabled={key === '' || loading}
              >
                <StyledText
                  fontSize={key === '⌫' ? 20 : 24}
                  fontWeight="600"
                  color={Colors.textPrimary}
                >
                  {key}
                </StyledText>
              </StyledPressable>
            ))}
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}
