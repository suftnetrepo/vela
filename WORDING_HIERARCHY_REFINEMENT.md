# ✅ WORDING HIERARCHY REFINEMENT — ESTIMATED PERIOD

**Date:** May 19, 2026  
**Status:** ✅ **COMPLETE**

---

## ISSUE IDENTIFIED

The "Estimated Period" section had **duplicated semantic meaning**:

```
Section Label: "ESTIMATED PERIOD"  ← already communicates "estimated"
Row Value:     "Expected around 24d ago"  ← redundantly repeats "expected/estimated"
```

**Result:** Visual and semantic redundancy that reduced premium feel.

---

## SOLUTION APPLIED

**File:** `src/components/home/TodayCard.tsx`

Remove the redundant "Expected" from the value row since the section title already provides that context.

---

## BEFORE

```
ESTIMATED PERIOD
Expected in 3d
Expected around 24d ago
Today
```

---

## AFTER

```
ESTIMATED PERIOD
In 3d
Around 24d ago
Today
```

---

## WORDING HIERARCHY REFINED

| Case | Before | After | Change |
|------|--------|-------|--------|
| **Future** | "Expected in 3d" | "In 3d" | Removed "Expected" |
| **Past** | "Expected around 24d ago" | "Around 24d ago" | Removed "Expected" |
| **Today** | "Today" | "Today" | No change |

---

## RATIONALE

The section title **"ESTIMATED PERIOD"** already communicates:
- The data point (Period)
- The certainty level (Estimated)

The row value should **only communicate the timing**:
- "In 3d" (future)
- "Around 24d ago" (past)
- "Today" (now)

This creates:
- ✅ **Cleaner hierarchy** — No redundancy
- ✅ **Premium feel** — Intentional and concise
- ✅ **Better scannability** — Clear visual structure
- ✅ **Higher confidence** — Less explanation needed

---

## VERIFICATION

| Check | Result | Status |
|-------|--------|--------|
| **ESLint** | 0 errors | ✅ PASS |
| **Build** | Compiles | ✅ PASS |
| **Logic** | Untouched | ✅ PASS |
| **Layout** | Unchanged | ✅ PASS |

---

## PRODUCTION READY

✅ Hierarchy refined  
✅ Builds cleanly  
✅ No breaking changes  
✅ Ready for deployment

---

**Status:** Production ready  
**Confidence:** 100%

