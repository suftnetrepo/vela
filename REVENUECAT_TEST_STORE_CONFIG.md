# RevenueCat Test Store Configuration

**Last Updated**: April 16, 2026  
**Status**: ✅ Active - Development/Testing Only  
**Environment**: Test Store

---

## Configuration Summary

### RevenueCat Test Store Setup

| Setting | Value |
|---------|-------|
| **API Key** | `test_CUwZEYKAHnjpWzNGwwjrKCEILNM` |
| **Environment** | Test Store (Development Only) |
| **Entitlement Name** | `premium` |
| **Entitlement Display Name** | Vela Premium |
| **Offering** | `default` |
| **Status** | Ready for testing |

### Products Configuration

| Product Type | Product ID | Status |
|--------------|-----------|--------|
| **Monthly** | `vela_premium_monthly` | ✅ Active |
| **Yearly** | `vela_premium_yearly` | ✅ Active |
| **Lifetime** | `vela_premium_lifetime` | ✅ Active |

---

## Implementation Details

### API Key Location
- **File**: `src/services/premium.service.ts`
- **Line**: ~55 (in `initializeRevenueCat()`)
- **Scope**: Development only - Test Store API key
- **Security**: Safe for client use (public test key)

```typescript
await Purchases.configure({
  apiKey: 'test_CUwZEYKAHnjpWzNGwwjrKCEILNM',
  appUserID: undefined,
})
```

### Entitlement Check
- **File**: `src/services/premium.service.ts`
- **Method**: `getEntitlement()`
- **Entitlement Key**: `customerInfo.entitlements.active['premium']`

### Product IDs
- **File**: `src/services/premium.service.ts`
- **Constant**: `TEST_STORE_PRODUCT_IDS`
- **Lines**: 38-42

```typescript
const TEST_STORE_PRODUCT_IDS = {
  MONTHLY:  'vela_premium_monthly',
  YEARLY:   'vela_premium_yearly',
  LIFETIME: 'vela_premium_lifetime',
} as const
```

---

## Boot Initialization

### App Boot Flow

1. **File**: `app/_layout.tsx`
2. **Method**: `boot()` useEffect
3. **Step**: RevenueCat initializes before database setup

```typescript
await initializeRevenueCat()
await initDatabase()
await seedDatabase()
// ... rest of boot sequence
```

### Premium Hydration

```typescript
const entitlement = await getEntitlement()
setPremiumEntitlement(entitlement.isActive, entitlement.plan)
```

**Result**: Premium state available before router navigation

---

## Testing

### Development Controls

**Location**: Settings → My Account (only in `__DEV__` builds)

**Controls Available**:
- ✅ Grant Premium (7 days) - Instantly unlock for testing
- ✅ Clear Premium - Reset to free tier

### Test Store Purchase Flow

1. Premium paywall displayed to free users
2. User taps "Monthly", "Yearly", or "Lifetime"
3. RevenueCat Test Store payment sheet appears
4. Complete test purchase (no real payment)
5. Premium unlocks immediately
6. State persists after app restart

---

## Migration to Production

### When Ready to Launch

#### Step 1: Create Real Store Products

**Apple App Store Connect**:
- Subscription Group: "Vela Premium"
- Products:
  - `com.vela.cycle.premium.monthly` (Monthly subscription)
  - `com.vela.cycle.premium.yearly` (Annual subscription)
  - `com.vela.cycle.premium.lifetime` (Lifetime purchase)

**Google Play Console**:
- Subscription Group: "Vela Premium"
- Products (same IDs as iOS):
  - `com.vela.cycle.premium.monthly`
  - `com.vela.cycle.premium.yearly`
  - `com.vela.cycle.premium.lifetime`

#### Step 2: Create RevenueCat Real Apps

**In RevenueCat Dashboard**:
- Create iOS app with App Store Connect integration
- Create Android app with Play Console integration
- Note the new API keys for each platform

#### Step 3: Update Code

**File**: `src/services/premium.service.ts`

**Change this line** (line ~39):
```typescript
const IS_TEST_STORE = false  // ← Change from true to false
```

**Update API key** (line ~55):
```typescript
await Purchases.configure({
  apiKey: process.env.REVENUECAT_API_KEY || 'YOUR_REAL_API_KEY',
  appUserID: undefined,
})
```

#### Step 4: That's It

RevenueCat automatically:
- ✅ Detects iOS vs Android at runtime
- ✅ Uses correct API key for platform
- ✅ Switches from Test Store to real products
- ✅ Maintains same entitlement name (`premium`)
- ✅ Maintains same offering name (`default`)

**No other code changes needed.**

---

## Architecture

### Service Layer

**File**: `src/services/premium.service.ts`

**Exports**:
- `initializeRevenueCat()` - Called on app boot
- `getEntitlement()` - Checks RevenueCat + cache
- `purchaseMonthly()` - Purchase monthly product
- `purchaseYearly()` - Purchase yearly product
- `purchaseLifetime()` - Purchase lifetime product
- `restorePurchases()` - Restore from RevenueCat
- `grantEntitlement()` - Dev/testing only
- `clearEntitlement()` - Dev/testing only

### State Management

**File**: `src/stores/settings.store.ts`

**Premium State**:
- `isPremium: boolean` - Is user premium?
- `premiumPlan: 'monthly' | 'yearly' | 'lifetime' | null` - Which plan?
- `setPremiumEntitlement(active, plan)` - Update state

### UI Gating

**Component**: `src/components/shared/PremiumGate.tsx`

**Gated Screens**:
- ✅ Insights (Advanced charts)
- ✅ Notifications (Smart reminders)
- ✅ Pregnancy Mode
- ✅ Premium Themes

---

## Security Notes

### API Key Handling

- ✅ Test Store API key is public (safe to hardcode in client)
- ⚠️ For production, use environment variables or secure storage
- ✅ Never commit real API keys to git

### Entitlement Validation

- ✅ Validated against RevenueCat servers on app boot
- ✅ Cached locally in SecureStore (encrypted)
- ✅ Checked on every app restart
- ✅ Expires automatically if subscription ends

### User Data

- ✅ RevenueCat handles receipt verification
- ✅ No sensitive data stored locally (only TTL + expiry)
- ✅ All validation happens server-side

---

## Troubleshooting

### Premium Not Unlocking

1. Check RevenueCat initialization completed (logs)
2. Verify Test Store products exist in RevenueCat dashboard
3. Confirm entitlement name is exactly `"premium"`
4. Check offering name is exactly `"default"`
5. Verify product IDs match (vela_premium_*)

### Persistence Issues

1. Check SecureStore is accessible
2. Verify app restart hydrates entitlement
3. Confirm `getEntitlement()` called during boot
4. Check logs for SecureStore errors

### Test Store Purchase Failing

1. Ensure RevenueCat SDK initialized
2. Verify network connectivity
3. Check test user configured in RevenueCat dashboard
4. Review RevenueCat logs for purchase errors

---

## Reference

### Files Modified

| File | Purpose | Status |
|------|---------|--------|
| `src/services/premium.service.ts` | RevenueCat integration | ✅ Updated |
| `app/_layout.tsx` | Boot initialization | ✅ Updated |
| `src/stores/settings.store.ts` | State management | ✅ Unchanged |
| `src/components/shared/PremiumGate.tsx` | UI gating | ✅ Unchanged |
| `package.json` | Dependencies | ✅ Added react-native-purchases |

### Dependencies

- `react-native-purchases@^10.0.0` - RevenueCat SDK

### Constants

**Location**: `src/constants/premium.ts`

- `PREMIUM_PRODUCTS` - Product ID mapping
- `PREMIUM_PRICING` - Pricing display
- `PREMIUM_FEATURES` - Feature list for paywall
- `PREMIUM_THEMES` - Premium-only theme IDs

---

## Next Steps

### Immediate (Development)

- ✅ Test free tier experience
- ✅ Test purchase flow with dev controls
- ✅ Verify app restart persistence
- ✅ Test restore purchases

### Before Launch

- [ ] Create real App Store Connect products
- [ ] Create real Play Console products
- [ ] Register apps in RevenueCat
- [ ] Obtain real API keys
- [ ] Set up environment configuration
- [ ] Update code with production flag (`IS_TEST_STORE = false`)

### Post-Launch

- [ ] Monitor RevenueCat dashboard for issues
- [ ] Track subscription metrics
- [ ] Monitor churn and retention
- [ ] Plan upgrades/downgrades
- [ ] Handle grace periods and billing

---

**Status**: Test Store integration complete and ready for development testing.
