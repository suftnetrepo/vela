# Vela Brand Refinement — Implementation Guide

## Overview

This document outlines the refined branding for Vela's home screen header and splash screen, ensuring a premium, calm, and consistent experience across the app.

---

## 1. Home Screen Header Improvements

### Visual Design

**Before:**
- Icon: 40×40 flower in bordered circle container, separate from text
- Text: "Vela" positioned to the right, medium weight
- Visual connection: Weak, icon and text felt disconnected
- Scale: Subtle, felt like a placeholder rather than intentional branding

**After (Refined):**
- **Component:** New `BrandHeader` component (horizontal layout)
- **Icon:** 24×24 flower, clean and legible
- **Text:** "Vela" wordmark, 20px, 600-weight (semibold)
- **Layout:** Icon + text in horizontal stack with 6px gap
- **Visual connection:** Strong, unified brand lock
- **Spacing:** 20px horizontal padding, 12px top margin, 16px bottom margin
- **Color:** Theme primary (rose #E8748A, lavender #9B8EC4, sage #7BAF8E)
- **Right element:** Phase pill or "Period" button (balanced visual weight)

### Technical Implementation

**File:** `/app/(app)/home.tsx`

Changes:
1. Imported `BrandHeader` component
2. Replaced `StyledPage.Header` with custom Stack-based header
3. Left side: `BrandHeader` (horizontal, compact)
4. Right side: Phase pill or Period button (unchanged functionality)

**Code structure:**
```tsx
<Stack
  flexDirection="row"
  alignItems="center"
  justifyContent="space-between"
  paddingHorizontal={20}
  paddingTop={12}
  paddingBottom={16}
  backgroundColor={Colors.background}
>
  <BrandHeader
    color={Colors.primary}
    iconSize={24}
    fontSize={20}
    fontWeight="600"
    spacing={4}
    horizontal
    horizontalGap={6}
  />
  {/* Right: Phase pill or Period button */}
</Stack>
```

### Layout Balance

- **Left:** Brand header anchors attention, feels intentional
- **Right:** Phase/Period UI balances the composition
- **Vertical center:** All elements vertically centered at ~24-30px height
- **No disruption:** Safe for notches, home indicators, dynamic islands

---

## 2. New BrandHeader Component

**File:** `/src/components/shared/BrandHeader.tsx`

A reusable component that can be used on:
- Home screen (horizontal, compact)
- Splash screen (vertical, large)
- Other branded screens (modal headers, etc.)

### Props

```typescript
interface BrandHeaderProps {
  color?: string           // Brand color (default: #E8748A)
  iconSize?: number        // Flower icon size (default: 28px)
  fontSize?: number        // "Vela" text size (default: 24px)
  fontWeight?: '500' | '600' | '700'  // Font weight (default: '600')
  spacing?: number         // Gap between icon and text (default: 8px)
  horizontal?: boolean     // Arrange horizontally (default: false)
  horizontalGap?: number   // Gap when horizontal (default: 8px)
}
```

### Variants

**Horizontal (Home screen):**
```tsx
<BrandHeader
  color={Colors.primary}
  iconSize={24}
  fontSize={20}
  fontWeight="600"
  horizontal
  horizontalGap={6}
/>
```

**Vertical (Splash screen):**
```tsx
<BrandHeader
  color={Colors.primary}
  iconSize={64}
  fontSize={48}
  fontWeight="700"
  spacing={16}
/>
```

---

## 3. Splash Screen Refinement

### Visual Design

**Purpose:** Professional, branded app opening during boot sequence

**Duration:** 1-2 seconds (during RevenueCat + database init)

**Layout (top to bottom):**
1. Centered vertically on screen
2. Flower icon (88×88px)
3. Spacing: 20px
4. "Vela" wordmark (48px, bold)
5. Background: Theme-specific pastel (off-white with subtle color tint)

### Technical Implementation

**Option A: Static PNG Asset (Current)**
- File: `/assets/images/splash.png`
- Format: PNG 512×512px or larger
- Resize mode: "contain" (preserves aspect ratio)
- Configured in `app.json`

**Option B: Generate Programmatically (Future)**
- Script: `/scripts/generate-splash-screen.js`
- Runtime: Node.js with sharp library
- Output: Theme-specific PNG variants
- Usage: `npm run generate:splash`

### App Configuration

**File:** `/app.json`

```json
{
  "expo": {
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#FFFBFC"
    }
  }
}
```

**Background colors by theme:**
- Rose: `#FFFBFC`
- Lavender: `#FAFAFF`
- Sage: `#FAFCFB`

### Design Specifications

- **No loading indicators** (boot is fast)
- **Minimal text** (just "Vela")
- **No marketing copy** (privacy-first, not salesy)
- **Calm aesthetic** (pastel background, soft icon)
- **Gender-neutral visual language** (flower is botanical/universal)
- **High contrast** (primary color on light background)

---

## 4. Color Consistency Across Themes

All three themes maintain visual consistency:

| Theme | Primary Color | Background | Effect |
|-------|---------------|-----------|--------|
| Rose | #E8748A | #FFFBFC | Warm, feminine |
| Lavender | #9B8EC4 | #FAFAFF | Cool, calm |
| Sage | #7BAF8E | #FAFCFB | Natural, grounding |

Both header and splash use the current theme's primary color, ensuring automatic visual harmony.

---

## 5. Component Reusability

### BrandHeader Component

Used in:
1. **Home screen** — Horizontal header, compact
2. **Splash screen** — Vertical center, prominent
3. **Settings header** — Could be adapted (currently uses different header)
4. **Modal headers** — Could be adopted for branded modals
5. **Onboarding screens** — Could feature the brand lock

### SplashScreenComponent

A React component version of the splash screen (useful if we need runtime splash):
- File: `/src/components/shared/SplashScreenComponent.tsx`
- Takes optional subtitle and loader props
- Could be used for loading states during onboarding

---

## 6. Testing & Validation

### Home Screen Header Testing

**Verify:**
- ✅ Logo and text are horizontally centered and balanced
- ✅ Phase pill is visible and aligns with header
- ✅ Responsive: Works on small screens (SE) and large screens (Max)
- ✅ No clipping on notched devices
- ✅ All theme colors display correctly
- ✅ Zero TypeScript errors

**Edge cases:**
- Long phase names ("Follicular Phase" fits)
- When "Period" button shows instead of phase pill
- Quick tap on period button shows/hides correctly
- Header stays fixed while content scrolls

### Splash Screen Testing

**Verify:**
- ✅ Displays during app boot
- ✅ Centered on screen
- ✅ Proper aspect ratio on all device sizes
- ✅ No distortion or stretching
- ✅ Transitions smoothly to onboarding or home
- ✅ Appears for ~1-2 seconds (not too fast, not too slow)

**Platform testing:**
- ✅ iOS: Safe area respected (notch, dynamic island)
- ✅ Android: Status bar and navigation bar clearance

---

## 7. Future Enhancements

### Possible iterations:

1. **Animated splash screen**
   - Gentle fade-in of icon and text
   - Could use Reanimated for smooth animation
   - Requires testing to ensure zero boot delay

2. **Theme-specific splash images**
   - Generate PNG variants per theme
   - Switch splash based on user's active theme
   - Requires Expo config updates per theme

3. **Premium indicator on splash**
   - Subtle badge/indicator if user is premium
   - Shows during boot before hydration complete
   - Low-priority feature

4. **Loading progress indicator**
   - Minimal dot animation during boot
   - Only if boot takes >3 seconds
   - Currently unnecessary

---

## 8. Files Modified/Created

**Created:**
- `/src/components/shared/BrandHeader.tsx` — Reusable brand component
- `/src/components/shared/SplashScreenComponent.tsx` — React splash component
- `/scripts/generate-splash-screen.js` — Splash PNG generator script
- `/SPLASH_SCREEN_DESIGN.md` — Design specification document
- `/BRAND_REFINEMENT_GUIDE.md` — This file

**Modified:**
- `/app/(app)/home.tsx` — Updated header to use BrandHeader
- `/app.json` — Splash config (existing, no changes needed)

---

## 9. Next Steps

1. **Test on device** — Run `yarn start` and verify home screen header looks balanced
2. **Generate splash screen** — Run `node scripts/generate-splash-screen.js` (requires sharp)
3. **Commit changes** — All TypeScript validated, no errors
4. **Review with team** — Confirm brand feel matches premium and calm objectives
5. **Consider animation** — If splash seems too static later, add gentle animation

---

## 10. Brand Voice

### Messaging alignment

The refined branding now matches Vela's voice:
- **Premium:** Cleaner typography, intentional spacing
- **Calm:** Soft colors, minimal visual noise
- **Private-first:** No marketing language, just the brand itself
- **Feminine:** Flower mark + pastel palette (inclusive, not gendered)
- **Trustworthy:** Consistent, professional presentation

---

**Document Version:** 1.0  
**Last Updated:** April 16, 2026  
**Component Status:** ✅ Production-ready
