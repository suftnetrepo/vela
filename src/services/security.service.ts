import * as SecureStore from 'expo-secure-store'
import * as LocalAuthentication from 'expo-local-authentication'
import { hashPin, verifyPin, isLegacyHash } from '../utils/crypto'
import { settingsService } from './settings.service'
import { SETTINGS_KEYS } from '../constants/config'

const SECURE_PIN_KEY      = 'vela_pin_hash'
const SECURE_ATTEMPTS_KEY = 'vela_pin_attempts'
const SECURE_LOCKOUT_KEY  = 'vela_pin_lockout_until'

export const securityService = {
  // ── PIN ────────────────────────────────────────────────────────────────────
  async setPin(pin: string): Promise<void> {
    const hash = await hashPin(pin)
    await SecureStore.setItemAsync(SECURE_PIN_KEY, hash)
    await settingsService.set(SETTINGS_KEYS.PIN_HASH, hash)
  },

  async verifyPin(pin: string): Promise<boolean> {
    const stored = await SecureStore.getItemAsync(SECURE_PIN_KEY)
    if (!stored) return false
    const ok = await verifyPin(pin, stored)

    if (ok && isLegacyHash(stored)) {
      // The PIN was correct but stored with the old weak hash — silently
      // upgrade it now that we know the plaintext PIN. Invisible to the
      // user: no re-entry, no reset, nothing to notice.
      const upgraded = await hashPin(pin)
      await SecureStore.setItemAsync(SECURE_PIN_KEY, upgraded)
      await settingsService.set(SETTINGS_KEYS.PIN_HASH, upgraded)
    }

    return ok
  },

  async hasPin(): Promise<boolean> {
    const stored = await SecureStore.getItemAsync(SECURE_PIN_KEY)
    return !!stored
  },

  async clearPin(): Promise<void> {
    await SecureStore.deleteItemAsync(SECURE_PIN_KEY)
    await settingsService.delete(SETTINGS_KEYS.PIN_HASH)
    await this.resetLockoutState()
  },

  // ── Lockout state (persisted so it survives force-quit/relaunch —
  // an in-memory-only counter can be bypassed just by killing the app) ──────
  async getLockoutState(): Promise<{ attempts: number; lockedUntil: Date | null }> {
    const [attemptsStr, lockedUntilStr] = await Promise.all([
      SecureStore.getItemAsync(SECURE_ATTEMPTS_KEY),
      SecureStore.getItemAsync(SECURE_LOCKOUT_KEY),
    ])
    const attempts = attemptsStr ? parseInt(attemptsStr, 10) || 0 : 0
    const lockedUntil = lockedUntilStr ? new Date(lockedUntilStr) : null
    return { attempts, lockedUntil }
  },

  async recordFailedAttempt(attempts: number, lockedUntil: Date | null): Promise<void> {
    await SecureStore.setItemAsync(SECURE_ATTEMPTS_KEY, String(attempts))
    if (lockedUntil) {
      await SecureStore.setItemAsync(SECURE_LOCKOUT_KEY, lockedUntil.toISOString())
    }
  },

  async resetLockoutState(): Promise<void> {
    await SecureStore.deleteItemAsync(SECURE_ATTEMPTS_KEY)
    await SecureStore.deleteItemAsync(SECURE_LOCKOUT_KEY)
  },

  // ── Biometric ──────────────────────────────────────────────────────────────
  async isBiometricAvailable(): Promise<boolean> {
    const compatible = await LocalAuthentication.hasHardwareAsync()
    if (!compatible) return false
    const enrolled = await LocalAuthentication.isEnrolledAsync()
    return enrolled
  },

  async getBiometricType(): Promise<'fingerprint' | 'face' | 'none'> {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync()
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'face'
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'fingerprint'
    return 'none'
  },

  async authenticateWithBiometric(): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage:       'Unlock Vela',
        cancelLabel:         'Use PIN',
        disableDeviceFallback: false,
      })
      return result.success
    } catch {
      return false
    }
  },

  async setBiometricEnabled(enabled: boolean): Promise<void> {
    await settingsService.set(SETTINGS_KEYS.BIOMETRIC_ENABLED, enabled)
  },

  async isBiometricEnabled(): Promise<boolean> {
    return (await settingsService.get<boolean>(SETTINGS_KEYS.BIOMETRIC_ENABLED)) ?? false
  },
}