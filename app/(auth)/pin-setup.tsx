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
      console.log('[🔐 PIN SETUP] ✗ PIN mismatch - asking user to retry')
      setError('PINs do not match. Try again.')
      setStage('create')
      setFirstPin('')
      return
    }
    
    console.log('[🔐 PIN SETUP] → User confirmed PIN match')
    
    const id = loaderService.show({ label: 'Securing data…', variant: 'dots' })
    try {
      console.log('[🔐 PIN SETUP] → Saving PIN to database...')
      await securityService.setPin(pin)
      console.log('[🔐 PIN SETUP] ✓ PIN hash saved')
      
      // Mark hasPin = true but keep isLocked = false for this session.
      // The user just set the PIN — they shouldn't be immediately locked out.
      // isLocked will only be true on the NEXT app launch.
      console.log('[🔐 PIN SETUP] → Setting hasPin=true (but keeping unlocked this session)')
      setHasPin(true)
      loaderService.hide(id)
      
      console.log('[🔐 PIN SETUP] ✓ SUCCESS: PIN created → Going to home\n')
      toastService.success('PIN set', 'Your data is now protected.')
      router.replace('/(app)/home')
    } catch (err) {
      loaderService.hide(id)
      console.log('[🔐 PIN SETUP] ✗ ERROR during PIN save:', err)
      toastService.error('Setup failed', 'Please try again.')
    }
  }

  const handleSkip = async () => {
    console.log('[🔐 PIN SETUP] → User skipping PIN setup')
    
    const id = loaderService.show({ label: 'Continuing…', variant: 'dots' })
    try {
      // Explicitly persist that the user skipped PIN setup
      console.log('[🔐 PIN SETUP] → Saving pin_skipped=true to database...')
      await settings.skipPin()
      console.log('[🔐 PIN SETUP] ✓ pin_skipped flag persisted')
      
      loaderService.hide(id)
      console.log('[🔐 PIN SETUP] ✓ SUCCESS: PIN skipped → Going to home\n')
      router.replace('/(app)/home')
    } catch (err) {
      loaderService.hide(id)
      console.log('[🔐 PIN SETUP] ✗ ERROR during skip:', err)
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
