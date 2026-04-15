# Log Inspection Guide - Onboarding Persistence Verification

## Overview

The app now has comprehensive logging to verify that:
1. Fresh installs start with onboarding (not skipped by seeding)  
2. Onboarding data persists correctly when app restarts
3. PIN setup is optional and properly tracked
4. Routing decisions match all expected flows
5. No forced database resets happen on boot

---

## How to Capture Logs

### Option 1: Xcode (iOS Simulator)
1. Open Xcode → Window → Console
2. Run the app: `npx expo prebuild` then run through Xcode
3. Watch console output in real time

### Option 2: Android Studio (Android Emulator)  
1. Open Android Studio → View → Tool Windows → Logcat
2. Run the app: `npm run android` or `yarn android`
3. Filter logs: search for `VELA` to see only app logs

### Option 3: Expo CLI (Any platform)
1. Run: `npx expo start`
2. Press `i` for iOS or `a` for Android
3. Logs appear in terminal

### Option 4: React Native Debugger
1. Install: `npm install -g react-native-debugger`
2. Start debugger, then run app
3. Logs appear in debugger console

---

## Log Format & Filtering

All logs use these prefixes for easy filtering:
```
🌱 VELA BOOT    - Seed initialization checks
⚡ VELA BOOT    - App boot (hydration, PIN detection)
🧭 VELA ROUTER  - Routing decision logic
📝 ONBOARDING   - Onboarding flow & persistence
🔐 PIN SETUP    - PIN creation/skip operations
📝 SETTINGS     - Settings persistence operations
```

Filter in your console:
```
// Show all Vela logs
VELA BOOT, VELA ROUTER, ONBOARDING, PIN SETUP, SETTINGS

// Show only onboarding-related
ONBOARDING, PIN SETUP, SETTINGS

// Show only boot sequence
VELA BOOT, VELA ROUTER
```

---

## Test Case 1: Fresh Install → Onboarding Shows

### Steps
1. Delete app from simulator/device (complete wipe)
2. Rebuild and run app
3. Watch console

### Expected Console Output
```
═══════════════════════════════════════════════════════════════
[🌱 VELA BOOT] Starting seed check
═══════════════════════════════════════════════════════════════

[🌱 VELA BOOT] → Database empty, initializing first-boot data
[🌱 VELA BOOT] ✓ Cycles: Seeded 7 completed + 1 active
[🌱 VELA BOOT] ✓ Logs: Seeded sample daily logs and symptoms
[🌱 VELA BOOT] ✓ Settings: Seeded defaults (onboarding_complete=FALSE)
[🌱 VELA BOOT] ✓ SUCCESS: First-boot data initialized

═══════════════════════════════════════════════════════════════
[⚡ VELA BOOT] Starting app initialization
═══════════════════════════════════════════════════════════════

[⚡ VELA BOOT] → Initializing database...
[⚡ VELA BOOT] → Running seed logic...
[⚡ VELA BOOT] ✓ Seed: Database already seeded (preserving user state)
[⚡ VELA BOOT] → Hydrating settings from database...
[⚡ VELA BOOT] ✓ Hydrated: onboarding_complete=false     <-- KEY!
[⚡ VELA BOOT] ✓ Hydrated: pin_skipped=false
[⚡ VELA BOOT] → Checking PIN state...
[⚡ VELA BOOT] ✓ PIN exists: false
[⚡ VELA BOOT] ✓ READY: Passing to router

═══════════════════════════════════════════════════════════════
[🧭 VELA ROUTER] Making routing decision...
[🧭 VELA ROUTER] onboardingComplete=false, hasPin=false, pinSkipped=false, isLocked=false
═══════════════════════════════════════════════════════════════

[🧭 VELA ROUTER] → DECISION: New user (onboarding incomplete) → WELCOME
```

### What This Proves
✅ Seed does NOT force-reset (would show "cleared" if it did)  
✅ `onboarding_complete=FALSE` (not true)  
✅ App correctly routes to WELCOME/onboarding screen

---

## Test Case 2: Complete Onboarding → PIN Setup Shows

### Steps
1. Continue from Test Case 1 (onboarding screen showing)
2. Go through all 4 onboarding steps
3. Watch console during "Setting up Vela..." loader

### Expected Console Output
```
[📝 ONBOARDING] Completing onboarding...
[📝 ONBOARDING] → Cycle: 28d, Period: 5d, Last period: 7d ago
[📝 ONBOARDING] → Persisting cycle length...
[📝 SETTINGS] Setting cycle_length...
[📝 SETTINGS] ✓ Cycle length saved
[📝 ONBOARDING] ✓ Cycle length saved
[📝 ONBOARDING] → Persisting period length...
[📝 SETTINGS] Setting period_length...
[📝 SETTINGS] ✓ Period length saved
[📝 ONBOARDING] ✓ Period length saved
[📝 ONBOARDING] → Creating first cycle...
[📝 ONBOARDING] ✓ First cycle created
[📝 ONBOARDING] → Marking onboarding as complete...
[📝 SETTINGS] Setting onboarding_complete=true
[📝 SETTINGS] ✓ Onboarding marked complete
[📝 ONBOARDING] ✓ SUCCESS: All data persisted → Going to PIN setup

═══════════════════════════════════════════════════════════════
[🧭 VELA ROUTER] Making routing decision...
[🧭 VELA ROUTER] onboardingComplete=true, hasPin=false, pinSkipped=false, isLocked=false
═══════════════════════════════════════════════════════════════

[🧭 VELA ROUTER] → DECISION: Onboarding complete, PIN not handled → PIN SETUP
```

### What This Proves
✅ All persistence operations completed (cycle, period, onboarding flag)  
✅ Each await completed before next step  
✅ `onboarding_complete` changed from false → true in database  
✅ Router correctly detected transition and moved to PIN SETUP

---

## Test Case 3: Skip PIN → Home Shows

### Steps
1. Continue from Test Case 2 (PIN setup screen showing)
2. Click "Skip for now" button
3. Watch console as it saves and navigates

### Expected Console Output
```
[🔐 PIN SETUP] → User skipping PIN setup
[🔐 PIN SETUP] → Saving pin_skipped=true to database...
[📝 SETTINGS] Setting pin_skipped=true
[📝 SETTINGS] ✓ PIN skip persisted
[🔐 PIN SETUP] ✓ pin_skipped flag persisted
[🔐 PIN SETUP] ✓ SUCCESS: PIN skipped → Going to home

═══════════════════════════════════════════════════════════════
[🧭 VELA ROUTER] Making routing decision...
[🧭 VELA ROUTER] onboardingComplete=true, hasPin=false, pinSkipped=true, isLocked=false
═══════════════════════════════════════════════════════════════

[🧭 VELA ROUTER] → DECISION: All setup complete → HOME
```

### What This Proves
✅ `pin_skipped=true` was persisted to database  
✅ Router recognized "end state" condition and sent to HOME
✅ No more PIN setup screen

---

## Test Case 4: Close & Reopen After Skipping PIN

### Steps
1. Completely close the app (force quit)
2. Reopen the app
3. Watch console for boot sequence

### Expected Console Output
```
═══════════════════════════════════════════════════════════════
[🌱 VELA BOOT] Starting seed check
═══════════════════════════════════════════════════════════════

[🌱 VELA BOOT] ✓ Database already seeded (preserving user state)  <-- KEY: Not "initializing"!
[🌱 VELA BOOT] ✓ No forced reset on this boot

═══════════════════════════════════════════════════════════════
[⚡ VELA BOOT] Starting app initialization
═══════════════════════════════════════════════════════════════

[⚡ VELA BOOT] ✓ Hydrated: onboarding_complete=true      <-- Persisted!
[⚡ VELA BOOT] ✓ Hydrated: pin_skipped=true              <-- Persisted!
[⚡ VELA BOOT] ✓ PIN exists: false

═══════════════════════════════════════════════════════════════
[🧭 VELA ROUTER] Making routing decision...
[🧭 VELA ROUTER] onboardingComplete=true, hasPin=false, pinSkipped=true
═══════════════════════════════════════════════════════════════

[🧭 VELA ROUTER] → DECISION: All setup complete → HOME
```

### What This Proves
✅ **CRITICAL**: No "initializing first-boot data" message (seed not reset)  
✅ `onboarding_complete=true` persisted across app restart  
✅ `pin_skipped=true` persisted across app restart  
✅ App goes straight to HOME (not back to onboarding)  
✅ **Onboarding state survives app restart** ✓

---

## Test Case 5: Complete Onboarding + Create PIN

### Steps
1. Start fresh install again (or use Test Case 1)
2. Complete onboarding (same as Test Case 2)
3. Create PIN instead of skipping
4. Watch console during PIN entry and confirmation

### Expected Console Output
```
[🔐 PIN SETUP] → User confirmed PIN match
[🔐 PIN SETUP] → Saving PIN to database...
[🔐 PIN SETUP] ✓ PIN hash saved
[🔐 PIN SETUP] → Setting hasPin=true (but keeping unlocked this session)
[🔐 PIN SETUP] ✓ SUCCESS: PIN created → Going to home

═══════════════════════════════════════════════════════════════
[🧭 VELA ROUTER] Making routing decision...
[🧭 VELA ROUTER] onboardingComplete=true, hasPin=true, pinSkipped=false, isLocked=false
═══════════════════════════════════════════════════════════════

[🧭 VELA ROUTER] → DECISION: All setup complete → HOME
```

### What This Proves
✅ PIN hash saved to database  
✅ `hasPin=true` detected  
✅ Router correctly sends to HOME (PIN was just created, so not locked yet)

---

## Test Case 6: Close & Reopen After PIN Creation

### Steps
1. Completely close the app (force quit)
2. Reopen the app
3. Watch console for boot sequence

### Expected Console Output
```
[🌱 VELA BOOT] ✓ Database already seeded (preserving user state)
[🌱 VELA BOOT] ✓ No forced reset on this boot

[⚡ VELA BOOT] ✓ Hydrated: onboarding_complete=true
[⚡ VELA BOOT] ✓ Hydrated: pin_skipped=false
[⚡ VELA BOOT] → Checking PIN state...
[⚡ VELA BOOT] ✓ PIN exists: true                         <-- Found PIN!
[⚡ VELA BOOT] → Setting app to LOCKED state

═══════════════════════════════════════════════════════════════
[🧭 VELA ROUTER] Making routing decision...
[🧭 VELA ROUTER] onboardingComplete=true, hasPin=true, pinSkipped=false, isLocked=true
═══════════════════════════════════════════════════════════════

[🧭 VELA ROUTER] → DECISION: Onboarding complete, PIN exists, app locked → LOCK SCREEN
```

### What This Proves
✅ PIN was found in database (persistence confirmed)  
✅ App locked itself on boot (default locked state)  
✅ Router sends to LOCK SCREEN (PIN pad), not onboarding  
✅ **No onboarding shown after PIN creation** ✓

---

## Test Case 7: Verify Dev Reset is Manual Only

### Steps
1. Look for evidence of auto-reset in boot logs
2. Search for any "initializing" or "clearing" messages after first boot

### What You Should NOT See
```
❌ [Vela DevReset] Force resetting database...
❌ [Vela Seed] DEV MODE: Force resetting database...
❌ [Vela Seed] Clearing...
❌ All data cleared
```

### What You Should See (All Boots After First)
```
✅ [🌱 VELA BOOT] ✓ Database already seeded (preserving user state)
✅ [🌱 VELA BOOT] ✓ No forced reset on this boot
```

### To Manually Trigger Dev Reset (Testing)
In your debug/test code:
```typescript
import { resetAndReseedDatabase } from '@/src/db/dev-reset'

// Manually trigger reset (console logs will show)
await resetAndReseedDatabase()
```

You'll see:
```
🔄 [Vela DevReset] Starting database reset...
[Vela DevReset] Clearing symptom logs...
[Vela DevReset] Clearing daily logs...
[Vela DevReset] Clearing cycles...
[Vela DevReset] Data cleared ✓
[Vela DevReset] Reseeding realistic cycle data...
✅ [Vela DevReset] Database reset and reseed complete!
```

**This confirms dev reset is opt-in, not automatic** ✓

---

## Summary Checklist

Use these logs to verify all 7 test cases:

- [ ] **Test 1**: Fresh install shows `onboarding_complete=FALSE` ✓
- [ ] **Test 2**: Onboarding completion persists all 4 values ✓
- [ ] **Test 3**: PIN skip sets `pin_skipped=TRUE` ✓
- [ ] **Test 4**: App restart preserves `onboarding_complete=true` + `pin_skipped=true` ✓
- [ ] **Test 5**: PIN creation detected and saved ✓
- [ ] **Test 6**: App restart finds PIN and locks ✓
- [ ] **Test 7**: No auto-reset messages, only manual reset shown ✓
- [ ] **Bonus**: No onboarding shown after completion ✓

---

## Debugging Tips

### If You See Wrong Behavior

**Problem**: Onboarding shows again after restart
- Check: Is `onboarding_complete=false` on restart? 
- Look for "initializing" message (seed is resetting)
- Fix: Verify seed.ts changes are in place

**Problem**: Goes to PIN setup instead of home
- Check: Is `pin_skipped=false` but has no PIN?
- This is correct behavior (waiting for PIN/skip decision)
- Check: Did user actually click skip?

**Problem**: App crashes during onboarding save
- Look for error message in `[📝 ONBOARDING]` logs
- Check: Are all `await` statements present?
- Verify: SQLite database isn't corrupted

**Problem**: PIN screen keeps showing on restart
- Check: Is `hasPin=true` but `isLocked=false`?
- This means PIN exists but app isn't locked
- Expected on first boot after PIN creation (user just set it)
- Close app and reopen: should show LOCK SCREEN next boot

---

## Archive Logs for Analysis

To save logs for later review:

### Xcode
- Cmd+A to select all console
- Cmd+C to copy
- Paste into a text file

### Android Logcat
- Click the save icon in logcat
- Select filter: search for "VELA"
- Export to file

### Terminal
- Redirect output: `npx expo start | tee app_logs.txt`
- Run through all test cases
- Review `app_logs.txt`
