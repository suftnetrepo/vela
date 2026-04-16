/**
 * Vela Premium Configuration
 *
 * Vela features a clean, capability-focused premium model:
 * - Free tier: core cycle logging, basic calendar, basic predictions
 * - Premium tier: advanced analytics, export, reminders, pregnancy mode, themes
 */

// ─── Product identifiers (match App Store Connect / Play Console) ─────────────
export const PREMIUM_PRODUCTS = {
  MONTHLY:  'com.vela.cycle.premium.monthly',
  YEARLY:   'com.vela.cycle.premium.yearly',
  LIFETIME: 'com.vela.cycle.premium.lifetime',
} as const

// ─── Pricing display (update to match App Store prices) ───────────────────────
export const PREMIUM_PRICING = {
  MONTHLY:  { price: '£2.99', period: 'per month', label: 'Monthly' },
  YEARLY:   { price: '£19.99', period: 'per year',  label: 'Yearly',  saving: 'Save 45%', trial: '7-day free trial' },
  LIFETIME: { price: '£34.99', period: 'one-time',  label: 'Lifetime' },
} as const

// ─── Premium features list for the paywall ───────────────────────────────────
export const PREMIUM_FEATURES = [
  { icon: '📊', title: 'Advanced insights',  description: 'Personalised trends in your cycle patterns' },
  { icon: '📄', title: 'Export data',        description: 'PDF & CSV exports for your records' },
  { icon: '🔔', title: 'Smart reminders',    description: 'Pill reminders and custom notifications' },
  { icon: '🤰', title: 'Pregnancy mode',     description: 'Track pregnancy and postpartum health' },
  { icon: '🎨', title: 'Premium themes',     description: 'More beautiful, personalizable themes' },
  { icon: '🔐', title: 'Future features',    description: 'Health integrations & sync coming soon' },
] as const

// ─── Free tier limits ──────────────────────────────────────────────────────────
// Note: Vela doesn't gate basic usage volume. Premium gates features, not logging.
// These are here for reference in case we add usage tracking later.
export const FREE_LIMITS = {
  // Vela doesn't currently limit basic usage
  // All users can log cycles, view calendar, get predictions
  // Premium gates: advanced insights, exports, custom reminders, pregnancy mode, themes
} as const

// ─── Themes that require premium ──────────────────────────────────────────────
// Free users get: 'rose' (default)
// Premium users get: all others
export const PREMIUM_THEMES = ['lavender', 'ocean', 'forest', 'mint', 'peach', 'slate'] as const
export const FREE_THEMES = ['rose'] as const

// ─── SecureStore key ──────────────────────────────────────────────────────────
export const PREMIUM_STORAGE_KEY = 'vela_premium_entitlement'
