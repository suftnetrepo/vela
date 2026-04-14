import * as SecureStore from 'expo-secure-store'
import * as LocalAuthentication from 'expo-local-authentication'
import { hashPin, verifyPin } from '../utils/crypto'
import { settingsService } from './settings.service'
import { SETTINGS_KEYS } from '../constants/config'

const SECURE_PIN_KEY = 'vela_pin_hash'

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
    return verifyPin(pin, stored)
  },

  async hasPin(): Promise<boolean> {
    const stored = await SecureStore.getItemAsync(SECURE_PIN_KEY)
    return !!stored
  },

  async clearPin(): Promise<void> {
    await SecureStore.deleteItemAsync(SECURE_PIN_KEY)
    await settingsService.delete(SETTINGS_KEYS.PIN_HASH)
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
