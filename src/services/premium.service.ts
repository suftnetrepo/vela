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
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import Purchases from "react-native-purchases";
import { PREMIUM_STORAGE_KEY } from "../constants/premium";
import { PREMIUM_PRODUCTS } from "../constants/premium";

// ─── RevenueCat Configuration ─────────────────────────────────────────────────
// Same product IDs across all environments: vela_premium_monthly/yearly/lifetime
// (Works for both RevenueCat Test Store and Production)
//
// RevenueCat issues a separate key per store — an "appl_" key only
// authenticates against App Store Connect/StoreKit, so reusing it on Android
// would fail there (this previously wasn't platform-aware at all). Each
// platform needs its own key from the RevenueCat dashboard (Project
// settings → API keys), tied to that platform's app.
const ANDROID_PLACEHOLDER_KEY = "goog_REPLACE_WITH_GOOGLE_PLAY_KEY";
// Widened to `string` — otherwise TS narrows both consts to their literal
// types and flags the placeholder-guard comparison below as an "always
// false" type error, which defeats the point of the check.
const ANDROID_PRODUCTION_KEY: string = ANDROID_PLACEHOLDER_KEY;

const REVENUECAT_API_KEY = __DEV__
  ? "test_CUwZEYKAHnjpWzNGwwjrKCEILNM"
  : Platform.select({
      ios: "appl_DLDmelsrlWRjyPwWCSVYXFouVDP",
      android: ANDROID_PRODUCTION_KEY,
      default: "",
    })!;

const PREMIUM_ENTITLEMENT_ID = "premium";
const PREMIUM_PRODUCT_IDS = new Set(Object.values(PREMIUM_PRODUCTS));

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
const entitlementListeners = new Set<(info: EntitlementInfo) => void>();

const emitEntitlementUpdate = (info: EntitlementInfo) => {
  for (const listener of entitlementListeners) {
    listener(info);
  }
};

const clearLocalEntitlementCache = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(PREMIUM_STORAGE_KEY);
};

const syncEntitlementFromCustomerInfo = async (
  customerInfo: any,
  source: string,
): Promise<EntitlementInfo> => {
  const entitlement = customerInfo?.entitlements?.active?.[PREMIUM_ENTITLEMENT_ID];
  const activeEntitlements = Object.keys(customerInfo?.entitlements?.active ?? {});

  // Dev-only: app user id and subscription identifiers are purchase/account
  // identifiers, not something to keep in production logs.
  if (__DEV__) {
    console.log("[Premium] Customer info sync", {
      source,
      appUserId: customerInfo?.originalAppUserId ?? null,
      activeEntitlements,
      activeSubscriptions: customerInfo?.activeSubscriptions ?? [],
    });
  }

  if (!entitlement) {
    const inactiveInfo: EntitlementInfo = {
      isActive: false,
      plan: null,
      expiresAt: null,
      purchasedAt: null,
    };

    await clearLocalEntitlementCache();
    emitEntitlementUpdate(inactiveInfo);
    return inactiveInfo;
  }

  const productId = entitlement.productIdentifier || "";
  const plan = getPlanFromProductId(productId);
  const expiresAt = entitlement.expirationDate || null;
  const purchasedAt =
    entitlement.latestPurchaseDate ??
    entitlement.originalPurchaseDate ??
    null;

  const nextInfo: EntitlementInfo = {
    isActive: true,
    plan,
    expiresAt,
    purchasedAt,
  };

  await SecureStore.setItemAsync(PREMIUM_STORAGE_KEY, JSON.stringify(nextInfo));
  emitEntitlementUpdate(nextInfo);

  if (__DEV__) {
    console.log("[Premium] Entitlement active", {
      source,
      entitlementId: PREMIUM_ENTITLEMENT_ID,
      productId,
      knownProductId: PREMIUM_PRODUCT_IDS.has(productId),
      plan,
      expiresAt,
    });
  }

  return nextInfo;
};

const registerCustomerInfoListener = () => {
  Purchases.addCustomerInfoUpdateListener((customerInfo) => {
    syncEntitlementFromCustomerInfo(customerInfo, "customer-info-listener").catch(
      (error) => {
        console.error("[Premium] Customer info listener sync failed:", error);
      },
    );
  });
};

export const initializeRevenueCat = async (): Promise<void> => {
  if (isRevenueCatInitialized) return;

  if (
    !__DEV__ &&
    Platform.OS === "android" &&
    ANDROID_PRODUCTION_KEY === ANDROID_PLACEHOLDER_KEY
  ) {
    throw new Error(
      "[Premium] ANDROID_PRODUCTION_KEY is still the placeholder. " +
        "Set it to the Google Play API key from the RevenueCat dashboard before shipping an Android build.",
    );
  }

  try {

    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: undefined,
    });

    registerCustomerInfoListener();

    isRevenueCatInitialized = true;
    // Never log any fragment of the API key, even in dev builds.
    if (__DEV__) {
      console.log("[RevenueCat] Initialized successfully", {
        entitlementId: PREMIUM_ENTITLEMENT_ID,
        expectedProductIds: Array.from(PREMIUM_PRODUCT_IDS),
      });
    }
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

export const subscribeToEntitlementUpdates = (
  listener: (info: EntitlementInfo) => void,
): (() => void) => {
  entitlementListeners.add(listener);
  return () => {
    entitlementListeners.delete(listener);
  };
};

export const refreshEntitlement = async (
  source = "manual-refresh",
): Promise<EntitlementInfo> => {
  if (!isRevenueCatInitialized) {
    await initializeRevenueCat();
  }

  const customerInfo = await Purchases.getCustomerInfo();
  return syncEntitlementFromCustomerInfo(customerInfo, source);
};

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
          await clearLocalEntitlementCache();
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

    // Check RevenueCat for current status. The init call is inside this same
    // try/catch (not before it) so that if RevenueCat can't be reached at
    // all — offline, RC outage, native module unavailable — we still fall
    // through to the cached entitlement below instead of discarding it.
    try {
      if (!isRevenueCatInitialized) {
        await initializeRevenueCat();
      }
      return await refreshEntitlement("get-entitlement");
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
    await clearLocalEntitlementCache();
    emitEntitlementUpdate({
      isActive: false,
      plan: null,
      expiresAt: null,
      purchasedAt: null,
    });
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

    if (__DEV__) console.log("[Premium] Purchasing monthly:", pkg.identifier);
    const purchaseResult = await Purchases.purchasePackage(pkg);

    // After successful purchase, use the returned customer info as source of truth
    const result = await syncEntitlementFromCustomerInfo(
      purchaseResult.customerInfo,
      "purchase-monthly",
    );
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

    if (__DEV__) console.log("[Premium] Purchasing yearly:", pkg.identifier);
    const purchaseResult = await Purchases.purchasePackage(pkg);

    const result = await syncEntitlementFromCustomerInfo(
      purchaseResult.customerInfo,
      "purchase-yearly",
    );
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

    if (__DEV__) console.log("[Premium] Purchasing lifetime:", pkg.identifier);
    const purchaseResult = await Purchases.purchasePackage(pkg);

    const result = await syncEntitlementFromCustomerInfo(
      purchaseResult.customerInfo,
      "purchase-lifetime",
    );
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
    const customerInfo = await Purchases.restorePurchases();

    const result = await syncEntitlementFromCustomerInfo(
      customerInfo,
      "restore-purchases",
    );
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
