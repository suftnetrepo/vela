# Database Reset & Reseed Guide

## Overview

The Vela app now includes a dev-only utility for resetting and reseeding the database with clean, realistic menstrual cycle test data.

This is useful when:
- Testing UI changes after periods have accumulated invalid data
- Starting fresh with known good test data
- Verifying cycle calculation logic with realistic spans
- Debugging Insights screens with clean history

## Root Cause Analysis

The original test data had several issues:
- Only 4 cycles total (insufficient for testing history/trends)
- Active cycle was only 5 days old (very short for realistic testing)
- Limited cycle length variation (all 27-29 days)
- No realistic time distribution across months

## What Was Changed

### Files Modified/Created

1. **`src/db/seed.ts`** — Updated with clean realistic data
   - ✓ 7 completed cycles (27-30 days each)
   - ✓ Spread across 9 months of history
   - ✓ Each has realistic period length (4-6 days)
   - ✓ 1 active cycle (12 days in)

2. **`src/db/dev-reset.ts`** — New dev utility (DEV-ONLY)
   - `resetAndReseedDatabase()` — Clears ALL data and reseeds fresh
   - `reseedDatabase()` — Just reseeds if nothing exists yet
   - Safe guard: exits early if data already exists

### Data Cleared

When `resetAndReseedDatabase()` is called:
- ✓ All `symptom_logs` records
- ✓ All `daily_logs` records  
- ✓ All `cycles` records

### Fresh Seed Data

**7 completed cycles** (oldest to newest):
| Cycle | Offset | Start Date | Length | Period |
|-------|--------|------------|--------|--------|
| 1 | 268 days ago | ~9 months | 28 days | 5 days |
| 2 | 240 days ago | ~8 months | 29 days | 5 days |
| 3 | 211 days ago | ~7 months | 28 days | 6 days |
| 4 | 183 days ago | ~6 months | 30 days | 4 days |
| 5 | 153 days ago | ~5 months | 27 days | 5 days |
| 6 | 126 days ago | ~4 months | 28 days | 5 days |
| 7 | 98 days ago | ~3 months | 29 days | 6 days |

**1 active cycle:**
- Started 12 days ago
- No end date (ongoing)
- No calculated cycle length yet
- Sample daily log for today

## How to Use

### In local development/testing context:

```typescript
import { resetAndReseedDatabase } from '@/src/db/dev-reset'

// Call when you need fresh test data
await resetAndReseedDatabase()
// Console output:
// 🔄 [Vela DevReset] Starting database reset...
// [Vela DevReset] Clearing symptom logs...
// [Vela DevReset] Clearing daily logs...
// [Vela DevReset] Clearing cycles...
// [Vela DevReset] Reseeding realistic cycle data...
// [Vela DevReset] ✓ Seeded 7 completed cycles
// [Vela DevReset] ✓ Seeded 1 active cycle
// ✅ [Vela DevReset] Database reset and reseed complete!
```

### Adding a debug button (example):

You could add this to a settings screen for dev-only access:

```typescript
{__DEV__ && (
  <StyledPressable onPress={async () => {
    const { resetAndReseedDatabase } = await import('@/src/db/dev-reset')
    await resetAndReseedDatabase()
    Alert.alert('Success', 'Database reset and reseeded with clean test data')
  }}>
    <StyledText>🔄 Reset Test Data (Dev Only)</StyledText>
  </StyledPressable>
)}
```

## Verification Checklist

After reset/reseed, verify:

### Cycle Calculations ✓
- Cycle length = start of one cycle to start of next (26-32 days)
- Period length = number of bleeding days (4-6 days)
- Active cycle is isolated from completed cycles
- No duplicate start dates

### Insights Screens ✓
- **History tab**: Shows 7 completed cycles (oldest → newest) + 1 active
- **Overview tab**: Prediction shows next period correctly
- **Patterns tab**: Statistics based on 7 cycles (reasonable confidence)
- **Current cycle card**: Shows day 12, active state

### Timeline UI ✓
- Completed cycles have soft blush background
- Active cycle has pink background + Active badge
- Checkmarks on completed cycles show correct status
- No horizontal overflow on active cycle card
- Phase progress bar displays correctly (if prediction available)

## Important Notes

### ⚠️ NOT for Production
- `dev-reset.ts` should NEVER be shipped to production
- It's imported only in dev contexts
- Safe guards prevent accidental data loss in prod

### ⚠️ Local Development Only
- After reset, remember to rebuild/restart app
- Depends on local SQLite database
- Does not affect cloud sync (if any)

### Data Validation
All seeded cycle data is validated against:
- `minCycleLength` (21 days) and `maxCycleLength` (35 days) — clamped in prediction
- `minPeriodLength` (3 days) and `maxPeriodLength` (7 days)
- Defined in `src/constants/config.ts`

## Next Steps

1. **Use the reset utility** whenever test data becomes dirty
2. **Verify Insights screens** display correctly with clean data
3. **Test cycle calculations** with known good history
4. **Debug prediction logic** with realistic cycle spans
