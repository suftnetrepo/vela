import * as Crypto from 'expo-crypto'

// Hashes created with this file use this prefix so we can always tell a
// current (v2, native SHA-256) hash apart from a legacy (v1, weak) one —
// this is what makes a silent, invisible upgrade possible below.
const HASH_VERSION_PREFIX = 'v2:'

// Current PIN hashing — real SHA-256 via expo-crypto's native implementation.
// (Previously this used the Web Crypto API's crypto.subtle, which generally
// isn't available in React Native/Hermes, so it was silently falling back to
// a trivial, insecure checksum on real devices. expo-crypto works natively.)
export async function hashPin(pin: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `vela_pin_v1_${pin}`,
  )
  return `${HASH_VERSION_PREFIX}${digest}`
}

// Legacy hashing — kept ONLY so a PIN hash created before this fix can still
// be verified once. Never used to create new hashes. Do not remove this
// without a migration plan, or existing users will be locked out.
async function legacyHashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(`vela_pin_v1_${pin}`)

  if (typeof crypto !== 'undefined' && (crypto as any).subtle) {
    const hashBuffer = await (crypto as any).subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  let hash = 0
  const str = `vela_pin_v1_${pin}`
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}

// True if a stored hash still uses the old, weaker format. Used to silently
// upgrade it in the background the moment it's next successfully verified —
// completely invisible to the user, no re-entry or reset required.
export function isLegacyHash(storedHash: string): boolean {
  return !storedHash.startsWith(HASH_VERSION_PREFIX)
}

// Verifies a PIN against a stored hash, transparently supporting both the
// current and legacy formats so nobody's existing PIN breaks after this update.
export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
  if (!isLegacyHash(storedHash)) {
    const hash = await hashPin(pin)
    return hash === storedHash
  }
  const legacyHash = await legacyHashPin(pin)
  return legacyHash === storedHash
}