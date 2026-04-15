import React, { useState } from 'react'
import { Stack, StyledText, StyledPressable, StyledPage } from 'fluent-styles'
import { router } from 'expo-router'
import { useColors } from '../../src/hooks/useColors'
import { useSettings } from '../../src/hooks/useSettings'
import { PinPad } from '../../src/components/shared/PinPad'
import { securityService } from '../../src/services/security.service'
import { useAuthStore } from '../../src/stores/auth.store'
import { toastService, loaderService } from 'fluent-styles'

export default function PinSetupScreen() {
  const Colors          = useColors()
  const setHasPin       = useAuthStore(s => s.setHasPin)
  const settings        = useSettings()
  const [stage, setStage]       = useState<'create' | 'confirm'>('create')
  const [firstPin, setFirstPin] = useState('')
  const [error, setError]       = useState('')

  const handleFirst = (pin: string) => {
    setFirstPin(pin)
    setStage('confirm')
    setError('')
  }

  const handleConfirm = async (pin: string) => {
    if (pin !== firstPin) {
      setError('PINs do not match. Try again.')
      setStage('create')
      setFirstPin('')
      return
    }
    const id = loaderService.show({ label: 'Securing data…', variant: 'dots' })
    try {
      await securityService.setPin(pin)
      // Mark hasPin = true but keep isLocked = false for this session.
      // The user just set the PIN — they shouldn't be immediately locked out.
      // isLocked will only be true on the NEXT app launch.
      setHasPin(true)
      loaderService.hide(id)
      toastService.success('PIN set', 'Your data is now protected.')
      router.replace('/(app)/home')
    } catch (err) {
      loaderService.hide(id)
      toastService.error('Setup failed', 'Please try again.')
    }
  }

  const handleSkip = async () => {
    const id = loaderService.show({ label: 'Continuing…', variant: 'dots' })
    try {
      // Explicitly persist that the user skipped PIN setup
      await settings.skipPin()
      loaderService.hide(id)
      router.replace('/(app)/home')
    } catch (err) {
      loaderService.hide(id)
      toastService.error('Failed', 'Please try again.')
    }
  }

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      <Stack flex={1}>
        <PinPad
          title={stage === 'create' ? 'Create your PIN' : 'Confirm your PIN'}
          subtitle={
            stage === 'create'
              ? 'Choose a 4-digit PIN to protect your data'
              : 'Enter the same PIN again to confirm'
          }
          onComplete={stage === 'create' ? handleFirst : handleConfirm}
          error={error}
        />
      </Stack>

      <Stack paddingBottom={48} alignItems="center">
        <StyledPressable
          paddingVertical={12}
          paddingHorizontal={24}
          onPress={handleSkip}
        >
          <StyledText fontSize={14} color={Colors.textTertiary}>
            Skip for now
          </StyledText>
        </StyledPressable>
      </Stack>
    </StyledPage>
  )
}
