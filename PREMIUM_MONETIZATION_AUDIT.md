# Production Monetization Audit: Vela Premium System

**Date**: April 16, 2026  
**Status**: 🔴 6/10 Production Ready  
**Priority**: Critical before launch

---

## Executive Summary

Vela's premium system has **solid architectural foundations** but **critical execution gaps** prevent any revenue generation in production. The feature gating infrastructure is built but **not enforced**—users currently receive premium features without paying.

**Key Finding**: Features are gated at the code level but gates are never called in the UI. This must be fixed before any user acquisition.

---

## Table of Contents

1. [Current State Assessment](#current-state-assessment)
2. [Critical Gaps](#critical-gaps)
3. [Secondary Issues](#secondary-issues)
4. [Implementation Roadmap](#implementation-roadmap)
5. [Verification Checklist](#verification-checklist)
6. [Code Architecture Reference](#code-architecture-reference)

---

## Current State Assessment

### ✅ What's Working

| Component | Status | Details |
|-----------|--------|---------|
| **Premium State Management** | ✅ Solid | Zustand store with `isPremium` boolean and `premiumPlan` type; properly typed |
| **Bootstrap Hydration** | ✅ Correct | `app/_layout.tsx` hydrates premium entitlement on app start after DB initialization |
| **Component Architecture** | ✅ Ready | `PremiumGate` component fully built with compact and expanded variants |
| **Hook System** | ✅ Complete | `usePremium()` hook includes all purchase methods and 5 feature gate functions |
| **Theme Gating** | ✅ Working | Only 'rose' free theme; others locked with "PRO" badges and redirect to premium screen |
| **Plan Definition** | ✅ Clear | Monthly (£2.99), Yearly (£19.99 / Save 45%), Lifetime (£34.99) with messaging |
| **SecureStore Integration** | ✅ Working | Premium entitlement persisted securely with expiry logic |
| **Feature List UI** | ✅ Designed | `PREMIUM_FEATURES` array with icons and descriptions ready for paywall |

### 📊 Feature Breakdown by Status

```
┌─────────────────────────────────────────────────────┐
│  Vela Premium Architecture Status                    │
├─────────────────────────────────────────────────────┤
│ ✅ State Management (Zustand)                        │
│ ✅ Purchase Methods (4x)                             │
│ ✅ Entitlement Logic                                 │
│ ✅ Component (PremiumGate)                           │
│ ❌ Feature Gating (Not Applied)                      │
│ ❌ Payment Processing (Mock Only)                    │
│ ❌ Telemetry (Not Implemented)                       │
│ ❓ Pregnancy Mode (Not Built)                        │
│ ❓ Export (Not Built)                                │
│ ✅ Premium Themes Config (Not Designed)              │
└─────────────────────────────────────────────────────┘
```

---

## Critical Gaps

### 🔴 Gap #1: Premium Features Are Not Gated

**Risk Level**: 🔴 **CRITICAL** — Zero Revenue Impact

Your app **gives away premium features to all users**. The feature gates are defined in code but never applied to the UI.

#### Affected Features

| Feature | Current Status | Where | Impact |
|---------|----------------|-------|--------|
| **Advanced Insights** | ❌ Fully accessible | `app/(app)/insights.tsx` | Users see all cycle analysis for free |
| **Insights Charts** | ❌ Fully accessible | `CycleRhythmChart`, `CycleTrendsCard`, `PatternSummary` | No paywall on data visualization |
| **Smart Reminders** | ❌ Settings accessible | `app/(app)/(settings)/notifications.tsx` | All users can enable pill reminders |
| **Pregnancy Mode** | ❌ Not implemented | N/A | No placeholder gating |
| **Export** | ❌ Not implemented | N/A | Feature doesn't exist yet |
| **Premium Themes** | ✅ Properly gated | `app/(app)/(settings)/theme.tsx` | Only 'rose' free; shows "PRO" badge |

#### Evidence

**`src/hooks/usePremium.ts`** defines gates that are **never called**:

```typescript
return {
  isPremium,
  plan: premiumPlan,
  // ... purchase methods ...
  
  // ❌ These exist but are NOT USED ANYWHERE IN THE APP
  canUseAdvancedInsights: () => isPremium,
  canUseReports:          () => isPremium,
  canUseReminders:        () => isPremium,
  canUsePregnancyMode:    () => isPremium,
  canUseTheme:            (key: string) => isPremium || FREE_THEMES.includes(key),
}
```

**`src/components/shared/PremiumGate.tsx`** exists but is **never imported**:
- Component is fully functional with two variants (compact & expanded)
- Has proper styling, icon, and CTA
- Zero usages in the app

#### Why This Matters

- **Users**: Get full experience without paying
- **Revenue**: Zero premium revenue potential
- **Metrics**: Cannot measure paywall impressions or conversion
- **Retention**: No reason for users to pay after trying features

---

### 🔴 Gap #2: RevenueCat Integration Not Implemented

**Risk Level**: 🔴 **CRITICAL** — No Real Payment Processing

Currently using **mock purchases** that grant entitlements locally without actual payment.

#### Current Mock Flow

```typescript
// ❌ In src/services/premium.service.ts
export const purchaseMonthly = async (): Promise<boolean> => {
  // REVENUECAT_SWAP ↓ (comment shows what to swap with)
  await grantEntitlement('monthly', 1)  // ← Local only, no real payment
  return true
}

export const restorePurchases = async (): Promise<boolean> => {
  return false  // ← Mock returns false
}
```

#### What Needs to Change

1. **Install SDK**
   ```bash
   npm install react-native-purchases
   ```

2. **Replace Purchase Functions** (signatures stay the same—no other files need changes)
   ```typescript
   // Pseudocode from comments in service
   export const purchaseMonthly = async (): Promise<boolean> => {
     const offerings = await Purchases.getOfferings()
     const pkg = offerings.current?.monthly
     if (!pkg) throw new Error('Monthly package not found')
     await Purchases.purchasePackage(pkg)
     const info = await Purchases.getCustomerInfo()
     return !!info.entitlements.active['premium']
   }
   ```

3. **Configure App.json** with RevenueCat API key

4. **Setup in App Store Connect & Play Console**:
   - Create subscription group "Vela Premium"
   - Add 3 products matching `PREMIUM_PRODUCTS` constant:
     - `com.vela.cycle.premium.monthly`
     - `com.vela.cycle.premium.yearly`
     - `com.vela.cycle.premium.lifetime`

#### Timeline Impact

- **Without RevenueCat**: Cannot charge users (mock only)
- **With RevenueCat**: Full payment processing, receipt validation, subscription management
- **Implementation Time**: ~2 hours for integration + testing

---

### 🔴 Gap #3: No Premium Status Indicators

**Risk Level**: 🟡 **MEDIUM** — Poor UX/Discovery

Users don't know which features require premium.

#### What's Missing

- ❌ Insights page: No "Unlock Premium" banner or indicator
- ❌ Advanced charts: No "PRO" badge
- ❌ Notifications settings: No "Premium feature" label
- ❌ Pregnancy mode: No placeholder/indication it exists
- ✅ Theme picker: **Good example** — shows "PRO" badges (copy this pattern)

#### How Theme Gating Works (Reference)

```tsx
// ✅ Example from app/(app)/(settings)/theme.tsx
const locked = name !== 'rose' && !isPremium

if (locked) {
  <Stack backgroundColor={Colors.primaryFaint} borderRadius={8}>
    <VelaIcon name="crown" size={10} color={Colors.primary} />
    <StyledText fontWeight="700">PRO</StyledText>
  </Stack>
}
```

Apply this pattern to other premium features.

---

### 🟡 Gap #4: Dual Premium Storage Sources

**Risk Level**: 🟡 **MEDIUM** — Potential State Divergence

Premium entitlement is stored in **two places** with no reconciliation:

1. **SecureStore** (via `premium.service.ts`)
   - Key: `vela_premium_entitlement`
   - Secure, persisted
   - Checked on boot

2. **SQLite** (via `settingsService`)
   - Key: `SETTINGS_KEYS.IS_PREMIUM`
   - General settings store
   - Hydrated separately in bootstrap

#### Current Bootstrap Logic (from `app/_layout.tsx`)

```typescript
// First: Hydrate from settings service (sqlite)
hydrateSettings({
  isPremium: Boolean(all[SETTINGS_KEYS.IS_PREMIUM]),  // ← SQLite
  // ...
})

// Then: Override with SecureStore
const entitlement = await getEntitlement()  // ← SecureStore
setPremiumEntitlement(entitlement.isActive, entitlement.plan)
```

#### Risk

If expiry logic runs in one but not the other, they can diverge.

#### Recommendation

Consolidate to **SecureStore only** (more secure, consistent TTL logic).

---

### 🟡 Gap #5: No Analytics / Telemetry

**Risk Level**: 🟡 **MEDIUM** — Cannot Measure Monetization

No metrics for:
- Paywall impressions
- Purchase attempts
- Conversion/drop-off rates
- Feature usage by premium users
- Subscription churn

---

## Secondary Issues

| Issue | Risk | Details | Impact |
|-------|------|---------|--------|
| **Restore Purchases** | High | `restorePurchases()` returns `false` (mock). Needs RevenueCat SDK. | Users can't restore on new device |
| **No Pregnancy Mode** | Low | Gated in `usePremium()` but feature doesn't exist. | Need placeholder screen |
| **No Export** | Low | Not implemented. Show on paywall but not built. | Incomplete feature promise |
| **Premium Themes** | Low | 4 premium themes defined by constant but not designed. | Need visual designs |
| **MockPaymentSheet.tsx** | Low | Mock component exists; remove after RevenueCat live. | Technical debt |
| **Dev Reset Control** | Low | No way to test free→premium flow locally. | Dev friction |

---

## Implementation Roadmap

### Phase 1: Critical (Before Any Revenue)

#### P1.1: Implement Feature Gating (2-3 hours)

**Objective**: Apply PremiumGate to features defined in `PREMIUM_FEATURES`

**Tasks**:

1. **Gate Insights Page** (30 min)
   ```tsx
   import { PremiumGate } from '../../src/components/shared/PremiumGate'
   import { usePremium } from '../../src/hooks/usePremium'
   
   export default function InsightsScreen() {
     const { isPremium, canUseAdvancedInsights } = usePremium()
     
     return (
       <PremiumGate
         feature="Advanced Insights"
         description="AI-powered cycle patterns and predictions"
       >
         {/* Existing insights content */}
       </PremiumGate>
     )
   }
   ```

2. **Gate Individual Charts** (20 min)
   - Wrap `CycleRhythmChart` component in `PremiumGate`
   - Wrap `CycleTrendsCard` component in `PremiumGate`
   - Wrap `PatternSummary` component in `PremiumGate`
   - Keep basic stats visible (free engagement driver)

3. **Gate Smart Reminders** (15 min)
   ```tsx
   // In app/(app)/(settings)/notifications.tsx
   if (!isPremium && feature === 'smartReminders') {
     return (
       <PremiumGate
         feature="Smart Reminders"
         description="Pill reminders and custom notifications"
         compact
       />
     )
   }
   ```

4. **Add Pregnancy Mode Placeholder** (10 min)
   - Add to settings navigation
   - Show `PremiumGate` with description "Track pregnancy and postpartum health"
   - No implementation needed yet

5. **Update Premium Pricing Messaging** (10 min)
   - Ensure paywall shows `PREMIUM_FEATURES` from constant
   - Add "7-day free trial" callout for yearly plan

#### P1.2: Integrate RevenueCat (2 hours)

**Objective**: Real payment processing

**Tasks**:

1. Install SDK (5 min)
   ```bash
   npm install react-native-purchases
   ```

2. Replace 4 functions in `src/services/premium.service.ts` (45 min)
   - `purchaseMonthly()`
   - `purchaseYearly()`
   - `purchaseLifetime()`
   - `restorePurchases()`
   - Pseudocode already in comments

3. Configure app.json with RevenueCat API key (10 min)

4. Setup products in App Store Connect & Play Console (30 min)
   - Create subscription group: "Vela Premium"
   - Add 3 subscription products with IDs from `PREMIUM_PRODUCTS` constant

5. Test purchase flow in sandbox (30 min)

#### P1.3: Add Dev Controls (30 min)

**Objective**: Enable local testing of premium flows

**Tasks**:

1. Add "Reset Premium (dev)" button to `app/(app)/(settings)/profile.tsx`
   ```tsx
   if (__DEV__) {
     <PrefRow
       icon="trash"
       label="Reset Premium (dev)"
       destructive
       onPress={() => {
         clearEntitlement()
         toastService.info('Premium entitlement cleared')
       }}
     />
   }
   ```

2. Add "Grant Trial (dev)" button for 7-day testing

---

### Phase 2: High Priority (Before 1st Users)

#### P2.1: Telemetry & Analytics (1 hour)

**Objective**: Measure paywall performance

Track:
- Paywall impressions (by feature)
- Purchase attempts + outcomes
- Subscription status changes
- Feature usage (premium vs. free)

#### P2.2: Fix State Reconciliation (30 min)

**Objective**: Single source of truth for premium

Move all premium storage to SecureStore; remove `SETTINGS_KEYS.IS_PREMIUM`.

#### P2.3: Premium UI Polish (1 hour)

**Objective**: Consistent premium indicators

- Add "PRO" badges to all premium feature screens (copy theme.tsx pattern)
- Update notifications screen UI for premium features
- Add trial countdown to paywall

---

### Phase 3: Normal (Post-Launch)

#### P3.1: Implement Export (2-3 hours)
- PDF/CSV export of cycle data
- Premium users only

#### P3.2: Implement Pregnancy Mode (4-6 hours)
- Replace placeholder with full feature
- Separate tracking interface

#### P3.3: Design Premium Themes (Design + 1 hour dev)
- Lavender, Ocean, Forest, Mint, Peach, Slate
- Update `src/constants/themes.ts` with color definitions

---

## Verification Checklist

Use this before marking work complete.

### Pre-Launch Requirements

#### Feature Gating
- [ ] Insights page shows `<PremiumGate />` when `isPremium=false`
- [ ] Each insights chart independently shows paywall if not premium
- [ ] Notifications settings shows "upgade required" for smart reminders
- [ ] Pregnancy mode screen shows `<PremiumGate />` placeholder
- [ ] Export option shows paywall message (if in free tier first)
- [ ] Theme picker shows "PRO" badges on premium themes ✅ (already working)

#### RevenueCat Integration
- [ ] SDK installed and configured
- [ ] 3 products created in App Store Connect
- [ ] 3 products created in Play Console
- [ ] Purchase flow works end-to-end in sandbox
- [ ] Restore purchases works in sandbox
- [ ] Receipt validation works

#### State Management
- [ ] Premium persists after app restart
- [ ] Premium expires at correct time (subscription end date)
- [ ] Expiry check runs on bootstrap
- [ ] Dev reset button clears premium state
- [ ] Dev grant button sets premium for 7 days

#### User Experience
- [ ] Paywall shows all `PREMIUM_FEATURES`
- [ ] "7-day free trial" shown for yearly plan
- [ ] Pricing matches App Store display
- [ ] Purchase success shows confirmation + immediate feature unlock
- [ ] Failed purchase shows error message
- [ ] Restore purchases shows success/failure message

#### Code Quality
- [ ] All feature gate functions in `usePremium()` are actually called
- [ ] `PremiumGate` component used in all premium features
- [ ] No hardcoded feature conditionals
- [ ] `MockPaymentSheet.tsx` removed
- [ ] RevenueCat swap comments removed from `premium.service.ts`

---

## Code Architecture Reference

### State Flow

```
┌─────────────────────────────────────────────────────┐
│  App Bootstrap (app/_layout.tsx)                     │
├─────────────────────────────────────────────────────┤
│ 1. Initialize database                              │
│ 2. Load settings from SQLite (settingsService)      │
│ 3. Load premium from SecureStore (getEntitlement)   │
│ 4. Hydrate Zustand stores                           │
│ 5. Set bootReady = true (allow navigation)          │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│  useSettingsStore (src/stores/settings.store.ts)    │
├─────────────────────────────────────────────────────┤
│ isPremium: boolean                                  │
│ premiumPlan: 'monthly' | 'yearly' | 'lifetime'     │
│ setPremiumEntitlement(active, plan)                 │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│  usePremium() (src/hooks/usePremium.ts)             │
├─────────────────────────────────────────────────────┤
│ isPremium, plan (from store)                        │
│ buyMonthly(), buyYearly(), buyLifetime()            │
│ canUseAdvancedInsights(), etc. (feature gates)      │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│  UI Components                                       │
├─────────────────────────────────────────────────────┤
│ <PremiumGate /> (compact & expanded variants)       │
│ app/(app)/(settings)/premium.tsx (paywall)          │
│ app/(app)/(settings)/theme.tsx (feature lock)       │
│ app/(app)/insights.tsx (should use PremiumGate)     │
└─────────────────────────────────────────────────────┘
```

### File Map

| File | Purpose | Status | Priority |
|------|---------|--------|----------|
| `src/services/premium.service.ts` | Payment & entitlement logic; RevenueCat swap target | Mock; needs RevenueCat | P1 |
| `src/hooks/usePremium.ts` | Feature gates & purchase API | Built but not called | P1 |
| `src/components/shared/PremiumGate.tsx` | Paywall UI component | Ready; not imported | P1 |
| `src/components/shared/ThemePreview.tsx` | Theme gating (reference pattern) | ✅ Good example | Copy pattern |
| `src/stores/settings.store.ts` | Premium state (Zustand) | Correct | ✅ |
| `src/constants/premium.ts` | Product IDs, pricing, feature list | Configured | ✅ |
| `app/(app)/(settings)/premium.tsx` | Paywall screen | Built | ✅ |
| `app/(app)/(settings)/theme.tsx` | Theme picker with gating | ✅ Good example | Copy pattern |
| `app/(app)/insights.tsx` | Insights page (needs gating) | Not gated | P1 |
| `app/(app)/(settings)/notifications.tsx` | Notifications settings (needs gating) | Not gated | P1 |
| `app/_layout.tsx` | Bootstrap & hydration | Correct | ✅ |

---

## FAQ

### Q: Why isn't the restore purchases working?
**A**: `restorePurchases()` is mocked—it returns `false`. After RevenueCat integration, it will check user's purchase history.

### Q: Can I test premium locally without RevenueCat?
**A**: Yes! Add a dev control button (see Phase 1.3) that calls `grantEntitlement('lifetime')` to test premium flows locally.

### Q: Should I use ExpoPay or RevenueCat?
**A**: Use **RevenueCat**. It handles:
- App Store receipt validation
- Google Play subscription management
- Cross-platform subscription status
- Expiry tracking
- Family sharing prep

ExpoPay is not suitable for in-app subscription management.

### Q: What's the free tier?
**A**: 
- ✅ Core cycle logging
- ✅ Basic calendar view
- ✅ Basic cycle predictions
- ✅ Mood & symptom tracking
- ✅ Default theme ('rose')
- ❌ Advanced insights / charts
- ❌ Export
- ❌ Smart reminders
- ❌ Pregnancy mode
- ❌ Premium themes

### Q: Can users see a preview of premium features?
**A**: Yes. Let free users see insights data but show PremiumGate paywall when they try advanced charts. This drives conversion.

---

## Approval Checklist

- [ ] Audit findings reviewed by tech lead
- [ ] Phase 1 timeline accepted
- [ ] RevenueCat account created + API key obtained
- [ ] App Store Connect products ready
- [ ] Play Console products ready
- [ ] Premium themes designed (or accept default)
- [ ] Go/no-go decision on launch date

---

## Appendix: Key Constants

### Premium Product IDs
```typescript
// src/constants/premium.ts
PREMIUM_PRODUCTS = {
  MONTHLY:  'com.vela.cycle.premium.monthly',
  YEARLY:   'com.vela.cycle.premium.yearly',
  LIFETIME: 'com.vela.cycle.premium.lifetime',
}
```

### Premium Features
```typescript
PREMIUM_FEATURES = [
  { icon: '📊', title: 'Advanced insights' },
  { icon: '📄', title: 'Export data' },
  { icon: '🔔', title: 'Smart reminders' },
  { icon: '🤰', title: 'Pregnancy mode' },
  { icon: '🎨', title: 'Premium themes' },
  { icon: '🔐', title: 'Future features' },
]
```

### Free Themes
```typescript
FREE_THEMES = ['rose']
PREMIUM_THEMES = ['lavender', 'ocean', 'forest', 'mint', 'peach', 'slate']
```

### Pricing
```typescript
PREMIUM_PRICING = {
  MONTHLY:  { price: '£2.99', period: 'per month' },
  YEARLY:   { price: '£19.99', period: 'per year', saving: 'Save 45%', trial: '7-day free trial' },
  LIFETIME: { price: '£34.99', period: 'one-time' },
}
```

---

## Contact & Questions

For questions on:
- **Architecture**: See `src/services/premium.service.ts` comments
- **UI Components**: See `PremiumGate.tsx` variants
- **State**: See `useSettingsStore` and `usePremium()`
- **RevenueCat Setup**: Check RevenueCat docs for React Native

---

**Last Updated**: April 16, 2026  
**Status**: 🔴 Critical fixes needed for production  
**Next Review**: After Phase 1 completion
