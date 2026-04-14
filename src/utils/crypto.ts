// Simple PIN hashing using a digest approach
// For production consider expo-crypto for native SHA-256
export async function hashPin(pin: string): Promise<string> {
  // Use a simple but consistent hash for the PIN
  // In production, use expo-crypto: Crypto.digestStringAsync(CryptoDigestAlgorithm.SHA256, pin + salt)
  const encoder = new TextEncoder()
  const data = encoder.encode(`vela_pin_v1_${pin}`)
  
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
  
  // Fallback: simple hash for environments without subtle crypto
  let hash = 0
  const str = `vela_pin_v1_${pin}`
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}

export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
  const hash = await hashPin(pin)
  return hash === storedHash
}
