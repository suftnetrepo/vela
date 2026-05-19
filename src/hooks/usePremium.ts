import { useCallback, useEffect, useState } from 'react'
import { useSettingsStore } from '../stores/settings.store'
import {
  purchaseMonthly,
  purchaseYearly,
  purchaseLifetime,
  restorePurchases,
  getEntitlement,
  getPremiumPrices,
} from '../services/premium.service'
import { toastService, loaderService } from 'fluent-styles'
import { PREMIUM_THEMES, FREE_THEMES } from '../constants/premium'

export function usePremium() {
  const { isPremium, premiumPlan, setPremiumEntitlement } = useSettingsStore()
  const [prices, setPrices] = useState({
    monthlyPrice: null as string | null,
    yearlyPrice: null as string | null,
    lifetimePrice: null as string | null,
  })

  const refresh = useCallback(async () => {
    const info = await getEntitlement()
    setPremiumEntitlement(info.isActive, info.plan)
  }, [setPremiumEntitlement])

  const buyMonthly = useCallback(async () => {
    try {
      await loaderService.wrap(
        () => purchaseMonthly(),
        { label: 'Processing…', variant: 'spinner' },
      )
      await refresh()
      toastService.success('Welcome to Vela Premium! 🎉')
      return true
    } catch (err: any) {
      toastService.error('Purchase failed', err?.message)
      return false
    }
  }, [refresh])

  const buyYearly = useCallback(async () => {
    try {
      await loaderService.wrap(
        () => purchaseYearly(),
        { label: 'Processing…', variant: 'spinner' },
      )
      await refresh()
      toastService.success('Welcome to Vela Premium! 🎉')
      return true
    } catch (err: any) {
      toastService.error('Purchase failed', err?.message)
      return false
    }
  }, [refresh])

  const buyLifetime = useCallback(async () => {
    try {
      await loaderService.wrap(
        () => purchaseLifetime(),
        { label: 'Processing…', variant: 'spinner' },
      )
      await refresh()
      toastService.success('Welcome to Vela Premium! 🎉')
      return true
    } catch (err: any) {
      toastService.error('Purchase failed', err?.message)
      return false
    }
  }, [refresh])

  const restore = useCallback(async () => {
    try {
      const restored = await loaderService.wrap(
        () => restorePurchases(),
        { label: 'Restoring…', variant: 'spinner' },
      )
      if (restored) {
        await refresh()
        toastService.success('Purchases restored!')
      } else {
        toastService.info('No purchases found', 'No active subscription found for this account')
      }
      return restored
    } catch (err: any) {
      toastService.error('Restore failed', err?.message)
      return false
    }
  }, [refresh])

  // Fetch live prices from RevenueCat on mount
  useEffect(() => {
    getPremiumPrices()
      .then(setPrices)
      .catch(() => {
        // Prices will remain null if fetch fails, UI will use fallbacks
      })
  }, [])

  // ─── Vela-specific feature gates ──────────────────────────────────────────────

  return {
    isPremium,
    plan: premiumPlan,
    refresh,
    buyMonthly,
    buyYearly,
    buyLifetime,
    restore,

    // ─── Pricing (from RevenueCat) ────────────────────────────────────────────────
    monthlyPrice: prices.monthlyPrice,
    yearlyPrice: prices.yearlyPrice,
    lifetimePrice: prices.lifetimePrice,

    // ─── Purchase manager status (for UI control) ────────────────────────────────
    purchaseManagerLoading: false,
    purchaseManagerReady: true,
    purchaseManagerError: null,

    // ─── Feature gates (callable from anywhere) ────────────────────────────────────────
    canUseAdvancedInsights: () => isPremium,
    canUseReports:          () => isPremium,
    canUseReminders:        () => isPremium,
    canUsePregnancyMode:    () => isPremium,
    canUseTheme:            (key: string) => isPremium || FREE_THEMES.includes(key as any),
  }
}
