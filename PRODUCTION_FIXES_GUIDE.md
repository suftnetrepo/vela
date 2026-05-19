# Production Readiness Fixes - Implementation Guide

**Status:** Critical issues identified, ready for implementation
**Timeline:** Complete before production launch
**Risk Level:** LOW

---

## ISSUE #1: Future Date Logging Not Prevented 

### Risk
- User could log period data 60+ days in the future
- Prediction algorithm would use this future date as cycle anchor
- Results in broken predictions and calendar display

### Current Code
**File:** `/Users/appdev/dev/vela/src/services/log.service.ts`
```typescript
async upsertLog(date: string, data: Partial<NewDailyLog>): Promise<DailyLog> {
  const existing = await logService.getByDate(date)
  if (existing) {
    // Update existing
  } else {
    // Insert new
  }
}
```
❌ No date validation

### Recommended Fix
```typescript
async upsertLog(date: string, data: Partial<NewDailyLog>): Promise<DailyLog> {
  // Validate date is not in future
  const logDate = parseISO(date)
  const today = startOfDay(new Date())
  if (logDate > today) {
    throw new Error('Cannot log future dates. Max date: ' + toDateStr(today))
  }

  const existing = await logService.getByDate(date)
  if (existing) {
    const updated = await db
      .update(dailyLogs)
      .set({ ...data, updatedAt: nowISO() })
      .where(eq(dailyLogs.date, date))
      .returning()
    return updated[0]
  } else {
    const inserted = await db
      .insert(dailyLogs)
      .values({
        date,
        ...data,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      })
      .returning()
    return inserted[0]
  }
}
```

### Testing
```typescript
// Test 1: Valid past date
const result = await logService.upsertLog('2026-05-15', { flow: 'light' })
// ✓ Should succeed

// Test 2: Valid today
const today = todayStr() // '2026-05-18'
const result = await logService.upsertLog(today, { flow: 'light' })
// ✓ Should succeed

// Test 3: Invalid future date
try {
  await logService.upsertLog('2026-06-01', { flow: 'light' })
  // ❌ Should throw
} catch (e) {
  // ✓ Correctly rejected
}
```

### Impact
- ✅ Prevents invalid predictions
- ✅ Improves data integrity
- ✅ User-friendly error handling

---

## ISSUE #2: Missing Period Not Indicated

### Risk
- User might not notice period is overdue
- Calendar shows "predicted period" indefinitely
- No visual/textual indicator of missed period

### Current Code
**File:** `/Users/appdev/dev/vela/app/(app)/home.tsx`
```typescript
// No indicator for daysUntilNextPeriod < 0
```

### Recommended Fix Option A: Add Home Screen Indicator

**Location:** `/Users/appdev/dev/vela/app/(app)/home.tsx`

Add this after the phase pill:
```typescript
// Show if period is overdue
{prediction && prediction.daysUntilNextPeriod < 0 && (
  <Stack
    backgroundColor={Colors.dayPeriod}
    borderRadius={16}
    paddingHorizontal={14}
    paddingVertical={10}
    borderWidth={1}
    borderColor={Colors.error}
    flexDirection="row"
    alignItems="center"
    gap={8}
    marginTop={12}
  >
    <VelaIcon name="alert-circle" size={18} color={Colors.error} />
    <Text fontSize={13} fontWeight="700" color={Colors.error}>
      Period overdue by {Math.abs(prediction.daysUntilNextPeriod)} days
    </Text>
  </Stack>
)}
```

### Recommended Fix Option B: Update Phase Description

**Location:** `/Users/appdev/dev/vela/src/algorithm/prediction.ts`

```typescript
export function phaseDescription(phase: CyclePhase): string {
  const desc: Record<CyclePhase, string> = {
    menstrual: 'Your period is here. Rest and take care of yourself. 💗',
    follicular: 'Energy is building. Great time for new projects.',
    ovulation: 'Peak fertility day. You may feel your best today. ✨',
    fertile: 'Your fertile window is open. High chance of conception.',
    luteal: 'Winding down. Some PMS symptoms may appear.',
    predicted_period: 'Your period is estimated to be due around now.',
    // Changed from: 'Your period is due soon. It's on its way.'
  }
  return desc[phase] ?? ''
}
```

### Testing
```typescript
// Test 1: Period due in 5 days
const pred = predictNextCycle({
  confirmedCycles: [cycle28days],
  today: new Date('2026-05-18'),
  defaultCycleLength: 28,
})
// daysUntilNextPeriod should = 5
// No warning shown

// Test 2: Period overdue by 3 days
const past = new Date('2026-05-31') // 3 days past predicted start
const pred = predictNextCycle({
  confirmedCycles: [cycle28days],
  today: past,
  defaultCycleLength: 28,
})
// daysUntilNextPeriod should = -3
// WARNING: "Period overdue by 3 days" ✓
```

### Impact
- ✅ User aware of missed period
- ✅ Encourages health check-in
- ✅ Minimal UI impact

---

## ISSUE #3: Database Migrations Not Set Up

### Risk (Low Priority - Pre-Production)
- Schema changes won't be tracked in version control
- Difficult to deploy schema updates to production
- No rollback strategy for database changes

### Current Status
```
/Users/appdev/dev/vela
├── drizzle.config.ts (exists)
├── migrations/ ❌ MISSING
└── src/db/
    ├── schema.ts
    ├── client.ts
    └── seed.ts
```

### Recommended Fix

**Step 1:** Generate initial migration
```bash
# From project root
npx drizzle-kit generate:sqlite --out ./drizzle/migrations
```

**Step 2:** Verify output
```
drizzle/migrations/
├── 0000_create_tables.sql (or similar)
├── meta/
│   ├── 0000.json
│   └── _journal.json
└── README.md (generated by drizzle)
```

**Step 3:** Add to drizzle.config.ts
```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || './vela.db',
  },
  migrations: {
    migrationsTable: '__drizzle_migrations__',
  },
})
```

**Step 4:** Add migration runner (optional, for production deployments)
```typescript
// src/db/migrate.ts
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db } from './client'
import path from 'path'

export async function runMigrations() {
  await migrate(db, {
    migrationsFolder: path.join(__dirname, '../../drizzle/migrations'),
  })
  console.log('✅ Migrations complete')
}
```

**Step 5:** Commit to git
```bash
git add drizzle/
git add drizzle.config.ts
git commit -m "feat: add database migration tracking"
```

### Testing
```bash
# Generate migrations after schema change
npx drizzle-kit generate:sqlite --out ./drizzle/migrations

# Verify SQL is generated
cat drizzle/migrations/0001_add_new_field.sql
# Should show ALTER TABLE or CREATE commands
```

### Impact
- ✅ Production-grade database management
- ✅ Schema changes version-controlled
- ✅ Rollback capability

---

## ISSUE #4: Phase Description Language Enhancement

### Risk
- "Your period is here" assumes confirmed period when only predicted
- Misleading if prediction was wrong

### Current Code
**File:** `/Users/appdev/dev/vela/src/algorithm/prediction.ts` line 159
```typescript
menstrual: 'Your period is here. Rest and take care of yourself. 💗',
```

### Recommended Fix
```typescript
menstrual: 'Your period is estimated to be starting. Rest and take care of yourself. 💗',
// OR
menstrual: 'Your period is here or starting soon. Rest and care for yourself. 💗',
```

### Alternative: Data-Driven Text
If you want to distinguish between confirmed (logged) and predicted menstrual:
```typescript
// In prediction.ts, add parameter
export function phaseDescription(phase: CyclePhase, isPeriodLogged?: boolean): string {
  if (phase === 'menstrual' && !isPeriodLogged) {
    return 'Your period is estimated to be starting. Rest and care for yourself. 💗'
  }
  if (phase === 'menstrual' && isPeriodLogged) {
    return 'You've logged your period. Rest and care for yourself. 💗'
  }
  // ... rest of descriptions
}
```

**Usage:**
```typescript
const isPeriodLogged = log?.flow !== undefined && log?.flow !== null
const description = phaseDescription(prediction.currentPhase, isPeriodLogged)
```

### Impact
- ✅ More honest language
- ✅ Sets proper health expectations
- ✅ Improves compliance

---

## ISSUE #5: Add Overdue Period Check Function

### Recommended Addition
**File:** `/Users/appdev/dev/vela/src/algorithm/prediction.ts`

Add helper function:
```typescript
export function isPeriodOverdue(prediction: CyclePrediction): boolean {
  return prediction.daysUntilNextPeriod < 0
}

export function daysOverdue(prediction: CyclePrediction): number {
  if (prediction.daysUntilNextPeriod >= 0) return 0
  return Math.abs(prediction.daysUntilNextPeriod)
}

export function getOverdueStatus(prediction: CyclePrediction): {
  isOverdue: boolean
  daysOverdue: number
  message: string
} {
  const daysOver = daysOverdue(prediction)
  return {
    isOverdue: daysOver > 0,
    daysOverdue: daysOver,
    message: daysOver > 0 
      ? `Period overdue by ${daysOver} day${daysOver > 1 ? 's' : ''}`
      : '',
  }
}
```

### Usage
```typescript
// In home screen
const overdueStatus = getOverdueStatus(prediction)
if (overdueStatus.isOverdue) {
  <WarningBanner message={overdueStatus.message} />
}
```

### Impact
- ✅ Reusable logic
- ✅ Clear responsibility separation
- ✅ Testable

---

## IMPLEMENTATION PRIORITY

### Phase 1: Before Production Launch (CRITICAL)
1. ✅ Add future date validation to `logService.upsertLog()`
2. ✅ Setup Drizzle migrations

### Phase 2: Launch Week (HIGH)
1. ✅ Add overdue period indicator to home screen
2. ✅ Soften phase descriptions

### Phase 3: Post-Launch (NICE-TO-HAVE)
1. ✅ Add confidence range display on predictions
2. ✅ Add overdue check helper functions
3. ✅ Enhanced privacy policy disclaimer

---

## TESTING CHECKLIST

### After Implementing All Fixes

- [ ] Can't log future dates (error thrown)
- [ ] Can log today's date (succeeds)
- [ ] Can log past dates (succeeds)
- [ ] Period overdue indicator shows when daysUntilNextPeriod < 0
- [ ] Drizzle migrations folder created
- [ ] Migrations tracked in git
- [ ] Phase descriptions use "estimated" language
- [ ] Calendar rendering unchanged
- [ ] Prediction algorithm unchanged
- [ ] All existing tests pass
- [ ] App boots successfully with new validation
- [ ] Seed data still works

---

## ROLLBACK PLAN

### If Issues Arise
1. **Future date validation too strict:** Remove check, allow logging same day only
2. **Migrations break production:** Keep single `vela.db` file, add manual backup
3. **Overdue indicator confuses users:** Make it opt-in via settings
4. **Phase description changes unpopular:** Revert to original language

---

## ESTIMATED TIME to Implement

| Fix | Time | Complexity |
|-----|------|-----------|
| Future date validation | 15 min | Low |
| Overdue indicator | 30 min | Low |
| Drizzle migrations | 20 min | Medium |
| Phase descriptions | 5 min | Low |
| **Total** | **~70 min** | **Low-Medium** |

**Recommended:** Implement all 4 fixes in single pull request before launch
