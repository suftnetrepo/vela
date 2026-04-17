import React, { useEffect, useState } from 'react'
import { Stack, StyledText, StyledPressable, StyledPage } from 'fluent-styles'
import { Text } from '../../src/components/text'
import { router } from 'expo-router'
import { useColors } from '../../src/hooks/useColors'
import { PinPad } from '../../src/components/shared/PinPad'
import { VelaIcon } from '../../src/components/shared/VelaIcon'
import { securityService } from '../../src/services/security.service'
import { useAuthStore } from '../../src/stores/auth.store'
import { APP_CONFIG } from '../../src/constants/config'

export default function LockScreen() {
  const Colors       = useColors()
  const { attempts, addAttempt, resetAttempts, setLocked, lockedUntil, lockout } = useAuthStore()
  const [error, setError]           = useState('')
  const [biometricType, setBioType] = useState<'fingerprint' | 'face' | 'none'>('none')
  const [biometricEnabled, setBioEnabled] = useState(false)

  useEffect(() => {
    const init = async () => {
      const t = await securityService.getBiometricType()
      const e = await securityService.isBiometricEnabled()
      setBioType(t)
      setBioEnabled(e)
      if (e && t !== 'none') tryBiometric()
    }
    init()
  }, [])

  const tryBiometric = async () => {
    const ok = await securityService.authenticateWithBiometric()
    if (ok) unlock()
  }

  const unlock = () => {
    resetAttempts()
    setLocked(false)
    router.replace('/(app)/home')
  }

  const handlePin = async (pin: string) => {
    // Check lockout
    if (lockedUntil && new Date() < lockedUntil) {
      const mins = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000)
      setError(`Too many attempts. Try again in ${mins} minute${mins > 1 ? 's' : ''}.`)
      return
    }

    const ok = await securityService.verifyPin(pin)
    if (ok) {
      unlock()
    } else {
      addAttempt()
      const newAttempts = attempts + 1
      if (newAttempts >= APP_CONFIG.maxPinAttempts) {
        const until = new Date(Date.now() + APP_CONFIG.lockoutMinutes * 60 * 1000)
        lockout(until)
        setError(`Too many attempts. Locked for ${APP_CONFIG.lockoutMinutes} minutes.`)
      } else {
        setError(`Incorrect PIN. ${APP_CONFIG.maxPinAttempts - newAttempts} attempts left.`)
      }
    }
  }

  const bioEmoji = biometricType === 'face' ? '👤' : '👆'

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      {/* Logo */}
      <Stack alignItems="center" paddingTop={60} gap={8}>
        <Stack width={68} height={68} borderRadius={34} backgroundColor={Colors.primaryFaint}
          alignItems="center" justifyContent="center" borderWidth={2} borderColor={Colors.border}>
          <VelaIcon name="flower" size={34} color={Colors.primary} />
        </Stack>
        <StyledText fontSize={22} fontWeight="800" color={Colors.textPrimary}>Vela</StyledText>
      </Stack>

      <Stack flex={1}>
        <PinPad
          title="Enter your PIN"
          subtitle="Your data is protected"
          onComplete={handlePin}
          error={error}
        />
      </Stack>

      {/* Biometric button */}
      {biometricEnabled && biometricType !== 'none' && (
        <Stack alignItems="center" paddingBottom={48}>
          <StyledPressable onPress={tryBiometric} backgroundColor={Colors.surfaceAlt}
            borderRadius={30} paddingHorizontal={24} paddingVertical={14}
            flexDirection="row" alignItems="center" gap={10}>
            <VelaIcon
              name={biometricType === 'face' ? 'face-id' : 'fingerprint'}
              size={22}
              color={Colors.primary}
            />
            <StyledText fontSize={14} fontWeight="600" color={Colors.textSecondary}>
              Use {biometricType === 'face' ? 'Face ID' : 'Fingerprint'}
            </StyledText>
          </StyledPressable>
        </Stack>
      )}
    </StyledPage>
  )
}
