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
 *
 * For production:
 * - API key automatically uses production key from process.env.REVENUECAT_API_KEY
 * - Update REAL_STORE_PRODUCT_IDS with real Apple/Google product IDs
 * - Update API key placeholder in REVENUECAT_API_KEY constant
 * - Create subscriptions in App Store Connect & Play Console
 * - RevenueCat will automatically use real offerings
 * - No other code changes needed
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */
import * as SecureStore from "expo-secure-store";
import Purchases from "react-native-purchases";
import { PREMIUM_STORAGE_KEY } from "../constants/premium";

// ─── RevenueCat Configuration ─────────────────────────────────────────────────
// Same product IDs across all environments: vela_premium_monthly/yearly/lifetime
// (Works for both RevenueCat Test Store and Production)

const REVENUECAT_API_KEY = __DEV__
  ? "test_CUwZEYKAHnjpWzNGwwjrKCEILNM"
  : "appl_YOUR_VELA_PRODUCTION_KEY";

// ─── Helper: Determine plan type from product ID ──────────────────────────────

const getPlanFromProductId = (productId: string): PremiumPlan => {
  if (productId.includes('lifetime') || productId.includes('life')) {
    return 'lifetime'
  }
  if (productId.includes('annual') || productId.includes('yearly') || productId.includes('year')) {
    return 'yearly'
  }
  return 'monthly'
}

// ─── RevenueCat Initialization ────────────────────────────────────────────────
let isRevenueCatInitialized = false;

export const initializeRevenueCat = async (): Promise<void> => {
  if (isRevenueCatInitialized) return;

  try {

    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: undefined,
    });

    isRevenueCatInitialized = true;
    console.log("[RevenueCat] Initialized successfully");
  } catch (err) {
    console.error("[RevenueCat] Initialization failed:", err);
    throw err;
  }
};

export type PremiumPlan = "monthly" | "yearly" | "lifetime" | null;

export interface EntitlementInfo {
  isActive: boolean;
  plan: PremiumPlan;
  expiresAt: string | null;
  purchasedAt: string | null;
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
    const raw = await SecureStore.getItemAsync(PREMIUM_STORAGE_KEY);
    let info: EntitlementInfo | null = null;

    if (raw) {
      try {
        info = JSON.parse(raw);
        // Check if cached entitlement has expired
        if (info && info.expiresAt && new Date(info.expiresAt) < new Date()) {
          await clearEntitlement();
          return {
            isActive: false,
            plan: null,
            expiresAt: null,
            purchasedAt: null,
          };
        }
      } catch {
        info = null;
      }
    }

    // Check RevenueCat for current status
    if (!isRevenueCatInitialized) {
      await initializeRevenueCat();
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const isActive = !!customerInfo.entitlements.active["premium"];

      if (isActive) {
        const entitlement = customerInfo.entitlements.active["premium"];

        // Determine plan from product ID
        const productId = entitlement.productIdentifier || "";
        const plan = getPlanFromProductId(productId);

        // Build expiry date and purchase date
        const expiresAt = entitlement.expirationDate || null;
        const purchasedAt =
          entitlement.latestPurchaseDate ??
          entitlement.originalPurchaseDate ??
          null;

        const newInfo: EntitlementInfo = {
          isActive: true,
          plan,
          expiresAt,
          purchasedAt,
        };

        // Cache the entitlement
        await SecureStore.setItemAsync(
          PREMIUM_STORAGE_KEY,
          JSON.stringify(newInfo),
        );
        return newInfo;
      } else {
        // No active entitlement in RevenueCat
        await clearEntitlement();
        return {
          isActive: false,
          plan: null,
          expiresAt: null,
          purchasedAt: null,
        };
      }
    } catch (err: any) {
      // RevenueCat error; return cached info if available
      if (info?.isActive) {
        return info;
      }
      console.warn(
        "[Premium] RevenueCat check failed, returning inactive:",
        err?.message,
      );
      return {
        isActive: false,
        plan: null,
        expiresAt: null,
        purchasedAt: null,
      };
    }
  } catch {
    return { isActive: false, plan: null, expiresAt: null, purchasedAt: null };
  }
};

export const isPremiumActive = async (): Promise<boolean> => {
  const info = await getEntitlement();
  return info.isActive;
};

// ─── Write / clear entitlement ────────────────────────────────────────────────

/**
 * Manually grant entitlement (dev/testing use only).
 * In production, entitlements come from RevenueCat after purchase.
 */
export const grantEntitlement = async (
  plan: PremiumPlan,
  months?: number,
): Promise<void> => {
  const now = new Date();
  const expiresAt =
    plan === "lifetime"
      ? null
      : plan === "yearly"
        ? new Date(now.setFullYear(now.getFullYear() + 1)).toISOString()
        : new Date(now.setMonth(now.getMonth() + (months ?? 1))).toISOString();

  const info: EntitlementInfo = {
    isActive: true,
    plan,
    expiresAt,
    purchasedAt: new Date().toISOString(),
  };
  await SecureStore.setItemAsync(PREMIUM_STORAGE_KEY, JSON.stringify(info));
};

export const clearEntitlement = async (): Promise<void> => {
  try {
    // Clear both RevenueCat user and local cache
    await Purchases.logOut();
    await SecureStore.deleteItemAsync(PREMIUM_STORAGE_KEY);
  } catch {
    // Ignore errors if item doesn't exist
  }
};

// ─── Purchase functions (RevenueCat-backed) ───────────────────────────────────

/**
 * Purchase monthly subscription via RevenueCat Test Store.
 */
export const purchaseMonthly = async (): Promise<boolean> => {
  try {
    if (!isRevenueCatInitialized) {
      await initializeRevenueCat();
    }

    // Get offerings (Test Store or Real Store based on config)
    const offerings = await Purchases.getOfferings();

    if (!offerings.current) {
      throw new Error("No offerings available");
    }

    const pkg = offerings.current.monthly;
    if (!pkg) {
      throw new Error("Monthly package not found in offerings");
    }

    console.log("[Premium] Purchasing:", pkg.identifier);
    await Purchases.purchasePackage(pkg);

    // After successful purchase, validate entitlement
    const result = await getEntitlement();
    return result.isActive;
  } catch (err: any) {
    if (err?.code === "PurchaseCancelledError") {
      console.info("[Premium] Monthly purchase cancelled by user");
      return false;
    }
    console.error("[Premium] Monthly purchase failed:", err?.message);
    throw err;
  }
};

/**
 * Purchase yearly subscription via RevenueCat Test Store.
 */
export const purchaseYearly = async (): Promise<boolean> => {
  try {
    if (!isRevenueCatInitialized) {
      await initializeRevenueCat();
    }

    const offerings = await Purchases.getOfferings();

    if (!offerings.current) {
      throw new Error("No offerings available");
    }

    const pkg = offerings.current.annual;
    if (!pkg) {
      throw new Error("Yearly package not found in offerings");
    }

    console.log("[Premium] Purchasing:", pkg.identifier);
    await Purchases.purchasePackage(pkg);

    const result = await getEntitlement();
    return result.isActive;
  } catch (err: any) {
    if (err?.code === "PurchaseCancelledError") {
      console.info("[Premium] Yearly purchase cancelled by user");
      return false;
    }
    console.error("[Premium] Yearly purchase failed:", err?.message);
    throw err;
  }
};

/**
 * Purchase lifetime subscription via RevenueCat Test Store.
 */
export const purchaseLifetime = async (): Promise<boolean> => {
  try {
    if (!isRevenueCatInitialized) {
      await initializeRevenueCat();
    }

    const offerings = await Purchases.getOfferings();

    if (!offerings.current) {
      throw new Error("No offerings available");
    }

    // Lifetime might be called "lifetime" or another identifier in RevenueCat
    let pkg =
      offerings.current.lifetime ||
      Object.values(offerings.current.availablePackages).find((p) =>
        p.identifier.toLowerCase().includes("lifetime"),
      );

    if (!pkg) {
      throw new Error("Lifetime package not found in offerings");
    }

    console.log("[Premium] Purchasing:", pkg.identifier);
    await Purchases.purchasePackage(pkg);

    const result = await getEntitlement();
    return result.isActive;
  } catch (err: any) {
    if (err?.code === "PurchaseCancelledError") {
      console.info("[Premium] Lifetime purchase cancelled by user");
      return false;
    }
    console.error("[Premium] Lifetime purchase failed:", err?.message);
    throw err;
  }
};

/**
 * Restore previous purchases via RevenueCat.
 * Useful when user switches devices or reinstalls app.
 */
export const restorePurchases = async (): Promise<boolean> => {
  try {
    if (!isRevenueCatInitialized) {
      await initializeRevenueCat();
    }

    console.log("[Premium] Attempting to restore purchases...");
    await Purchases.restorePurchases();

    const result = await getEntitlement();
    return result.isActive;
  } catch (err: any) {
    console.error("[Premium] Restore purchases failed:", err?.message);
    return false;
  }
};

// ─── Get premium prices from RevenueCat ────────────────────────────────────────

/**
 * Fetch pricing from RevenueCat offerings.
 * Returns formatted price strings for display in the UI.
 * These are live prices from the App Store/Play Store.
 */
export interface PremiumPrices {
  monthlyPrice: string | null;
  yearlyPrice: string | null;
  lifetimePrice: string | null;
}

export const getPremiumPrices = async (): Promise<PremiumPrices> => {
  try {
    if (!isRevenueCatInitialized) {
      await initializeRevenueCat();
    }

    const offerings = await Purchases.getOfferings();
    const current = offerings.current;

    if (!current) {
      console.warn("[Premium] No offerings available from RevenueCat");
      return {
        monthlyPrice: null,
        yearlyPrice: null,
        lifetimePrice: null,
      };
    }

    return {
      monthlyPrice: current.monthly?.product.priceString ?? null,
      yearlyPrice: current.annual?.product.priceString ?? null,
      lifetimePrice: current.lifetime?.product.priceString ?? null,
    };
  } catch (err: any) {
    console.error("[Premium] Failed to fetch prices:", err?.message);
    return {
      monthlyPrice: null,
      yearlyPrice: null,
      lifetimePrice: null,
    };
  }
};
