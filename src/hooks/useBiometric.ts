import { useState, useEffect } from 'react'
import { securityService } from '../services/security.service'

export function useBiometric() {
  const [available, setAvailable] = useState(false)
  const [type, setType]           = useState<'fingerprint' | 'face' | 'none'>('none')
  const [enabled, setEnabled]     = useState(false)

  useEffect(() => {
    const load = async () => {
      const avail   = await securityService.isBiometricAvailable()
      const bType   = await securityService.getBiometricType()
      const isOn    = await securityService.isBiometricEnabled()
      setAvailable(avail)
      setType(bType)
      setEnabled(isOn)
    }
    load()
  }, [])

  const authenticate = () => securityService.authenticateWithBiometric()

  const toggleBiometric = async (val: boolean) => {
    await securityService.setBiometricEnabled(val)
    setEnabled(val)
  }

  return { available, type, enabled, authenticate, toggleBiometric }
}
