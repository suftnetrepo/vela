/**
 * premiumService.ts
 *
 * Manages Vela premium entitlements and purchases via RevenueCat.
 *
 * ─── Test Store Configuration (Development) ──────────────────────────────────
 * 
 * RevenueCat Test Store Setup:
 * - API Key: test_CUwZEYKAHnjpWzNGwwjrKCEILNM
 * - Entitlement: "premium" (display name: "Vela Premium")
 * - Offering: "default"
 * - Products: vela_premium_monthly, vela_premium_yearly, vela_premium_lifetime
 * 
 * ─── Architecture ──────────────────────────────────────────────────────────
 * 
 * For development:
 * - Using RevenueCat Test Store (configured above)
 * - No product registration needed in App Store/Play Console yet
 * - Use TEST_STORE_PRODUCT_IDS for test store products
 * 
 * For production later:
 * - Update REAL_STORE_PRODUCT_IDS with real Apple/Google product IDs
 * - Change IS_TEST_STORE = false
 * - Update API key to real iOS/Android key from RevenueCat dashboard
 * - Create subscriptions in App Store Connect & Play Console
 * - RevenueCat will automatically use real offerings
 * - No other code changes needed
 * 
 * ─────────────────────────────────────────────────────────────────────────────
 */
import * as SecureStore from 'expo-secure-store'
import Purchases from 'react-native-purchases'
import { PREMIUM_STORAGE_KEY } from '../constants/premium'

// ─── RevenueCat Configuration ─────────────────────────────────────────────────
// Development: Test Store (vela_premium_monthly, vela_premium_yearly, vela_premium_lifetime)
// Production: Real Apple/Google store products (com.vela.cycle.premium.*)
const IS_TEST_STORE = true // Set to false when integrating real Apple/Google products

const TEST_STORE_PRODUCT_IDS = {
  MONTHLY:  'vela_premium_monthly',
  YEARLY:   'vela_premium_yearly',
  LIFETIME: 'vela_premium_lifetime',
} as const

const REAL_STORE_PRODUCT_IDS = {
  MONTHLY:  'com.vela.cycle.premium.monthly',
  YEARLY:   'com.vela.cycle.premium.yearly',
  LIFETIME: 'com.vela.cycle.premium.lifetime',
} as const

const PRODUCT_IDS = IS_TEST_STORE ? TEST_STORE_PRODUCT_IDS : REAL_STORE_PRODUCT_IDS

// ─── RevenueCat Initialization ────────────────────────────────────────────────
let isRevenueCatInitialized = false

export const initializeRevenueCat = async (): Promise<void> => {
  if (isRevenueCatInitialized) return

  try {
    // Initialize RevenueCat with API key
    // For development: Using Test Store API key (test_CUwZEYKAHnjpWzNGwwjrKCEILNM)
    // Entitlement: "premium" | Offering: "default" (configured in RevenueCat dashboard)
    // For production: Replace with real iOS/Android API keys from RevenueCat dashboard
    await Purchases.configure({
      apiKey: 'test_CUwZEYKAHnjpWzNGwwjrKCEILNM', // Test Store API key (development only)
      appUserID: undefined, // Let RevenueCat generate one
    })
    isRevenueCatInitialized = true
    console.log('[RevenueCat] Initialized successfully')
  } catch (err) {
    console.error('[RevenueCat] Initialization failed:', err)
    throw err
  }
}

export type PremiumPlan = 'monthly' | 'yearly' | 'lifetime' | null

export interface EntitlementInfo {
  isActive:    boolean
  plan:        PremiumPlan
  expiresAt:   string | null
  purchasedAt: string | null
}

// ─── Read entitlement (from SecureStore cache + RevenueCat) ──────────────────

/**
 * Get the current premium entitlement info.
 * 
 * This reads from SecureStore cache first, then validates/updates from RevenueCat.
 * If entitlement has expired, it clears it.
 */
export const getEntitlement = async (): Promise<EntitlementInfo> => {
  try {
    // First try to get from cache
    const raw = await SecureStore.getItemAsync(PREMIUM_STORAGE_KEY)
    let info: EntitlementInfo | null = null
    
    if (raw) {
      try {
        info = JSON.parse(raw)
        // Check if cached entitlement has expired
        if (info && info.expiresAt && new Date(info.expiresAt) < new Date()) {
          await clearEntitlement()
          return { isActive: false, plan: null, expiresAt: null, purchasedAt: null }
        }
      } catch {
        info = null
      }
    }

    // Check RevenueCat for current status
    if (!isRevenueCatInitialized) {
      await initializeRevenueCat()
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo()
      const isActive = !!customerInfo.entitlements.active['premium']
      
      if (isActive) {
        const entitlement = customerInfo.entitlements.active['premium']
        
        // Determine plan from product ID
        const productId = entitlement.productIdentifier || ''
        let plan: PremiumPlan = 'monthly'
        
        if (productId.includes('lifetime') || productId.includes('life')) {
          plan = 'lifetime'
        } else if (productId.includes('annual') || productId.includes('yearly') || productId.includes('year')) {
          plan = 'yearly'
        }
        
        // Build expiry date
        const expiresAt = entitlement.expirationDate || null
        
        const newInfo: EntitlementInfo = {
          isActive: true,
          plan,
          expiresAt,
          purchasedAt: new Date().toISOString(),
        }
        
        // Cache the entitlement
        await SecureStore.setItemAsync(PREMIUM_STORAGE_KEY, JSON.stringify(newInfo))
        return newInfo
      } else {
        // No active entitlement in RevenueCat
        await clearEntitlement()
        return { isActive: false, plan: null, expiresAt: null, purchasedAt: null }
      }
    } catch (err: any) {
      // RevenueCat error; return cached info if available
      if (info?.isActive) {
        return info
      }
      console.warn('[Premium] RevenueCat check failed, returning inactive:', err?.message)
      return { isActive: false, plan: null, expiresAt: null, purchasedAt: null }
    }
  } catch {
    return { isActive: false, plan: null, expiresAt: null, purchasedAt: null }
  }
}

export const isPremiumActive = async (): Promise<boolean> => {
  const info = await getEntitlement()
  return info.isActive
}

// ─── Write / clear entitlement ────────────────────────────────────────────────

/**
 * Manually grant entitlement (dev/testing use only).
 * In production, entitlements come from RevenueCat after purchase.
 */
export const grantEntitlement = async (plan: PremiumPlan, months?: number): Promise<void> => {
  const now = new Date()
  const expiresAt = plan === 'lifetime' ? null
    : plan === 'yearly'  ? new Date(now.setFullYear(now.getFullYear() + 1)).toISOString()
    : new Date(now.setMonth(now.getMonth() + (months ?? 1))).toISOString()

  const info: EntitlementInfo = {
    isActive:    true,
    plan,
    expiresAt,
    purchasedAt: new Date().toISOString(),
  }
  await SecureStore.setItemAsync(PREMIUM_STORAGE_KEY, JSON.stringify(info))
}

export const clearEntitlement = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(PREMIUM_STORAGE_KEY)
  } catch {
    // Ignore errors if item doesn't exist
  }
}

// ─── Purchase functions (RevenueCat-backed) ───────────────────────────────────

/**
 * Purchase monthly subscription via RevenueCat Test Store.
 */
export const purchaseMonthly = async (): Promise<boolean> => {
  try {
    if (!isRevenueCatInitialized) {
      await initializeRevenueCat()
    }

    // Get offerings (Test Store or Real Store based on config)
    const offerings = await Purchases.getOfferings()
    
    if (!offerings.current) {
      throw new Error('No offerings available')
    }

    const pkg = offerings.current.monthly
    if (!pkg) {
      throw new Error('Monthly package not found in offerings')
    }

    console.log('[Premium] Purchasing:', pkg.identifier)
    await Purchases.purchasePackage(pkg)
    
    // After successful purchase, validate entitlement
    const result = await getEntitlement()
    return result.isActive
  } catch (err: any) {
    console.error('[Premium] Monthly purchase failed:', err?.message)
    if (err?.code === 'PurchaseCancelledError') {
      throw new Error('Purchase cancelled by user')
    }
    throw err
  }
}

/**
 * Purchase yearly subscription via RevenueCat Test Store.
 */
export const purchaseYearly = async (): Promise<boolean> => {
  try {
    if (!isRevenueCatInitialized) {
      await initializeRevenueCat()
    }

    const offerings = await Purchases.getOfferings()
    
    if (!offerings.current) {
      throw new Error('No offerings available')
    }

    const pkg = offerings.current.annual
    if (!pkg) {
      throw new Error('Yearly package not found in offerings')
    }

    console.log('[Premium] Purchasing:', pkg.identifier)
    await Purchases.purchasePackage(pkg)
    
    const result = await getEntitlement()
    return result.isActive
  } catch (err: any) {
    console.error('[Premium] Yearly purchase failed:', err?.message)
    if (err?.code === 'PurchaseCancelledError') {
      throw new Error('Purchase cancelled by user')
    }
    throw err
  }
}

/**
 * Purchase lifetime subscription via RevenueCat Test Store.
 */
export const purchaseLifetime = async (): Promise<boolean> => {
  try {
    if (!isRevenueCatInitialized) {
      await initializeRevenueCat()
    }

    const offerings = await Purchases.getOfferings()
    
    if (!offerings.current) {
      throw new Error('No offerings available')
    }

    // Lifetime might be called "lifetime" or another identifier in RevenueCat
    let pkg = offerings.current.lifetime || 
              (Object.values(offerings.current.availablePackages).find(p => 
                p.identifier.toLowerCase().includes('lifetime')
              ))
    
    if (!pkg) {
      throw new Error('Lifetime package not found in offerings')
    }

    console.log('[Premium] Purchasing:', pkg.identifier)
    await Purchases.purchasePackage(pkg)
    
    const result = await getEntitlement()
    return result.isActive
  } catch (err: any) {
    console.error('[Premium] Lifetime purchase failed:', err?.message)
    if (err?.code === 'PurchaseCancelledError') {
      throw new Error('Purchase cancelled by user')
    }
    throw err
  }
}

/**
 * Restore previous purchases via RevenueCat.
 * Useful when user switches devices or reinstalls app.
 */
export const restorePurchases = async (): Promise<boolean> => {
  try {
    if (!isRevenueCatInitialized) {
      await initializeRevenueCat()
    }

    console.log('[Premium] Attempting to restore purchases...')
    await Purchases.restorePurchases()
    
    const result = await getEntitlement()
    return result.isActive
  } catch (err: any) {
    console.error('[Premium] Restore purchases failed:', err?.message)
    return false
  }
}
