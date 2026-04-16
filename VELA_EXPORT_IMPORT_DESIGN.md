# Vela Cycle Tracking — Export/Import Feature Design Document

**Version:** 1.0  
**Date:** April 2026  
**Status:** Implementation Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Components](#core-components)
4. [Data Model & Privacy](#data-model--privacy)
5. [Implementation Guide](#implementation-guide)
6. [Security Considerations](#security-considerations)
7. [User Workflows](#user-workflows)
8. [Testing Strategy](#testing-strategy)

---

## Overview

### Purpose

Vela's export/import feature allows users to:
- **Backup** their complete cycle history to secure storage
- **Migrate** data between devices
- **Share selective data** with healthcare providers or partners
- **Manage** their health data across platforms

### Key Features

| Feature | Capability | Privacy Level |
|---------|-----------|---|
| **Settings Export** | Theme, temperature unit, day preference | Public |
| **Full Backup** | Complete history: cycles, logs, symptoms | Private |
| **Selective Export** | Custom date ranges | Private |
| **Universal Import** | Add data from any Vela export | Additive (non-destructive) |
| **Format Support** | JSON + Base64 QR codes | Both formats compatible |

### Guiding Principles

1. **Privacy First** — No sensitive data (PIN, biometric) ever exported
2. **User Control** — Users choose what to export
3. **Non-Destructive** — Imports always merge, never overwrite
4. **Backward Compatible** — Version control for future format changes
5. **Accessibility** — Multiple input/output methods (QR, text, file)

---

## Architecture

### Layered Component Structure

```
┌─────────────────────────────────────────────────────┐
│  UI Layer                                           │
│  ├─ ExportDataContent.tsx                          │
│  │  └─ actionSheetService.present()                │
│  ├─ ImportDataContent.tsx                          │
│  │  └─ actionSheetService.present()                │
│  └─ Integration in home/settings screens           │
└────────────────  ▲  ──────────────────────────────┘
                   │
┌─────────────────────────────────────────────────────┐
│  Service Layer                                      │
│  └─ velaDataService.ts                             │
│     ├─ exportSettings()         ──┐                │
│     ├─ exportBackup()           ──┼─ Encoding     │
│     ├─ exportSelective()        ──┤               │
│     ├─ decodeVelaData()         ──┼─ Decoding     │
│     ├─ payloadToCycles()        ──┤               │
│     ├─ payloadToDailyLogs()     ──┤               │
│     ├─ payloadToSymptomLogs()   ──┤               │
│     ├─ payloadToSettings()      ──┤               │
│     └─ getPayloadSummary()      ──┘               │
└────────────────  ▲  ──────────────────────────────┘
                   │
┌─────────────────────────────────────────────────────┐
│  Data Access Layer                                  │
│  ├─ cycleService.getAll()                          │
│  ├─ cycleService.create()                          │
│  ├─ logService.getRange()                          │
│  ├─ logService.upsertLog()                         │
│  ├─ settingsService.get()                          │
│  └─ settingsService.set()                          │
└────────────────  ▲  ──────────────────────────────┘
                   │
┌─────────────────────────────────────────────────────┐
│  Database Layer (Drizzle ORM)                       │
│  ├─ cycles table                                    │
│  ├─ dailyLogs table                                │
│  ├─ symptomLogs table                              │
│  └─ settings table                                 │
└─────────────────────────────────────────────────────┘
```

### Data Flow

#### Export Pipeline

```
User selects export type
        ↓
ExportDataContent component
        ↓
selectsTabs: Settings | Backup | Selective
        ↓
generateExportCode()
        ├─ Fetch data from services
        ├─ Transform to compact format
        └─ Encode to base64
        ↓
Render QR + Code preview
        ↓
User action:
  ├─ Copy code → Clipboard
  ├─ Share file → FileSystem.write + Share
  └─ Share QR → Screenshot
```

#### Import Pipeline

```
User opens import
        ↓
ImportDataContent component
        ↓
User input: Paste code OR Pick file
        ↓
performImport(rawCode)
        ├─ Trim whitespace
        └─ Extract from JSON wrapper (if needed)
        ↓
decodeVelaData()
        ├─ Base64 decode
        ├─ Parse JSON
        └─ Validate structure
        ↓
Show summary + Confirmation
        ↓
User confirms
        ↓
Database operations:
  ├─ payloadToSettings() → settingsService.set()
  ├─ payloadToCycles() → cycleService.create()
  ├─ payloadToDailyLogs() → logService.upsertLog()
  └─ payloadToSymptomLogs() → symptomLogsTable.insert()
        ↓
invalidateData() + onDone()
        ↓
Success toast + Close
```

---

## Core Components

### 1. **Service Layer** — `velaDataService.ts`

#### Export Functions

```typescript
// Export only settings (safe to share publicly)
exportSettings(settings: Setting[]): string
  └─ Returns: Base64-encoded settings payload

// Export complete history (private backup)
exportBackup(
  cycles: Cycle[],
  dailyLogs: DailyLog[],
  symptomLogs: SymptomLog[],
  settings: Setting[]
): string
  └─ Returns: Base64-encoded full backup

// Export date-range selection (sharing specific period)
exportSelective(
  dailyLogs: DailyLog[],
  symptomLogs: SymptomLog[],
  startDate: string,
  endDate: string,
  settings: Setting[]
): string
  └─ Returns: Base64-encoded selective export
```

#### Data Transformation

Each type has compact field names for QR code efficiency:

```typescript
// Full field names (for reference)
{
  id, startDate, endDate, periodLength, cycleLength
}

// Compact export format
{
  sd, ed, pl, cl  // startDate, endDate, periodLength, cycleLength
}

// Size comparison:
// Full JSON: ~600 bytes per cycle
// Compact:   ~120 bytes per cycle  (80% reduction)
```

#### Payload Structure

```typescript
interface VelaExportPayload {
  v:  number                    // Schema version (1)
  l:  'settings' | 'backup' | 'selective'
  ts: number                    // Export timestamp (ms)
  st: ExportableSettings | null // Settings object
  cy: ExportableCycle[] | null  // Cycles array
  dl: ExportableDailyLog[] | null // Daily logs array
}
```

### 2. **Export Component** — `ExportDataContent.tsx`

**Type:** Action sheet content component (service-managed presentation)

#### Props
```typescript
interface ExportDataContentProps {
  onDone?: () => void
}
```

#### State Management

```typescript
const [code, setCode] = useState<string>('')
const [exportLevel, setExportLevel] = useState<ExportLevel>('backup')
const [dateRange, setDateRange] = useState<{ start; end } | null>(null)
const [summary, setSummary] = useState<{cycles; logs; symptoms; dateRange}>(null)
```

#### UI Sections

1. **Export Type Selector** (3 options)
   - ⚙️ Settings — Theme preferences only
   - 💾 Full Backup — Everything
   - 📅 Date Range — Last 3 months or custom

2. **Summary Display**
   - Shows what will be exported
   - Cycle count, log count, symptom count
   - Date range (if applicable)

3. **QR Code Card**
   - Visual representation of export code
   - SVG rendered in white card
   - Scan-ready for import on another device

4. **Code Preview**
   - Monospace truncated display
   - First 80 characters + ellipsis

5. **Action Buttons**
   - Copy code → Platform clipboard
   - Share file → JSON export via system share

#### Export Methods

| Method | User Experience | File Generated |
|--------|---|---|
| **Copy Code** | IM/email friendly | No file |
| **Share File** | System file picker | `vela-export-YYYY-MM-DD.json` |
| **QR Code** | Share visually | No file (rendered) |

### 3. **Import Component** — `ImportDataContent.tsx`

**Type:** Action sheet content component with form state

#### Props
```typescript
interface ImportDataContentProps {
  onDone: () => void
}
```

#### State Management

```typescript
const [code, setCode] = useState('')
const [error, setError] = useState('')
const [summary, setSummary] = useState(null)
const [linkCycles, setLinkCycles] = useState(true)
```

#### UI Sections

1. **Input Methods**
   - Text area for code paste
   - File picker for `.json` files
   - Dual approach: code OR file

2. **File Format Detection**
   ```typescript
   // Try parse as JSON wrapper
   {
     vela: true,
     code: "eyJ2IjoxLCJsIjoiYmFja3VwIiwi...",
     summary: { cycles: 5, logs: 120 },
     exported: "2026-04-16T10:30:00Z"
   }
   
   // Fallback to raw code if not JSON
   "eyJ2IjoxLCJsIjoiYmFja3VwIiwi..."
   ```

3. **Summary Preview**
   - Shows what will be imported
   - Breakdown by data type

4. **Validation & Confirmation**
   - Decode validation
   - User confirmation dialog
   - Non-destructive merge explanation

5. **Privacy Notice**
   - Explains what's included
   - Ensures PIN/biometric not imported

#### Import Validation Pipeline

```
Raw input
  ↓
Trim whitespace
  ↓
Try JSON wrapper extraction
  ↓
Base64 decode attempt
  ↓
JSON parse attempt
  ↓
Payload structure validation
  ├─ Check version field
  ├─ Check level field
  ├─ Check timestamp field
  └─ Check data arrays
  ↓
Domain validation
  ├─ All cycles have startDate
  ├─ All logs have date
  └─ All symptoms have symptomKey
  ↓
✅ Valid or ❌ Error (user-friendly message)
```

---

## Data Model & Privacy

### Exportable Data Hierarchies

#### Level 1: Settings ONLY
```typescript
{
  theme: 'dark' | 'light',
  tempUnit: 'C' | 'F',
  firstDayOfWeek: 'MON' | 'SUN',
  cycleNotifications: boolean,
}
Usage: Share preferences with different device
Risk Level: 🟢 LOW
Shared With: Anyone (non-personal)
```

#### Level 2: Settings + Full History
```typescript
{
  settings: {...},
  cycles: [{startDate, endDate, periodLength, cycleLength, notes}, ...],
  dailyLogs: [{date, flow, mood, energy, sexualDesire, temp, weight, notes}, ...],
  symptomLogs: [{date, symptomKey, intensity}, ...],
}
Usage: Backup to secure storage / Migrate device
Risk Level: 🟡 MEDIUM (personal medical data)
Shared With: Cloud storage, encrypted email
```

#### Level 3: Selective Range
```typescript
{
  settings: {...},
  dailyLogs: [{...data for date range...}],
  symptomLogs: [{...symptoms for date range...}],
}
Usage: Share 3 months of data with doctor
Risk Level: 🟡 MEDIUM (scope-limited)
Shared With: Healthcare provider (with consent)
```

### **NEVER Exported** (Privacy Protected)

| Data | Reason | Alternative |
|------|--------|-------------|
| PIN hash | Security risk | Manually set on new device |
| Biometric state | Security risk | Re-enable in settings |
| Premium status | Account-specific | Restore purchase on new device |
| Notification tokens | Device-specific | Auto-generated per device |

### Data Integrity Guarantees

```typescript
// Primary key safety
Imported cycles:     isActive = 0  // Never active initially
Imported logs:       cycleId = null // User chooses linking
Imported symptoms:   dailyLogId = null // Linked after log insert

// Deduplication strategy
Find existing log by date:
  ├─ If exists: Merge fields (user sees diff)
  └─ If new: Insert directly

// Transaction safety
Try all inserts:
  ├─ Success: Invalidate cache + Show toast
  └─ Failure: Rollback + Show error (no partial inserts)
```

---

## Implementation Guide

### Step 1: Integrate Export Button

**File:** `src/screens/settings.tsx` (or settings screens)

```typescript
import { ExportDataContent } from '../components/shared/ExportDataContent'
import { actionSheetService } from 'fluent-styles'

function SettingsScreen() {
  const handleExport = () => {
    actionSheetService.present(<ExportDataContent onDone={() => {}} />, {
      title: 'Export Your Data',
      theme: 'light',
    })
  }

  return (
    <Stack>
      {/* ... other settings ... */}
      <StyledPressable onPress={handleExport}>
        <StyledText>💾 Export / Backup</StyledText>
      </StyledPressable>
    </Stack>
  )
}
```

### Step 2: Integrate Import Button

**File:** `src/screens/settings.tsx` (or settings screens)

```typescript
import { ImportDataContent } from '../components/shared/ImportDataContent'

function SettingsScreen() {
  const handleImport = () => {
    actionSheetService.present(
      <ImportDataContent onDone={() => refetchData()} />,
      { title: 'Restore from Backup', theme: 'light' }
    )
  }

  return (
    <Stack>
      {/* ... */}
      <StyledPressable onPress={handleImport}>
        <StyledText>📥 Restore Data</StyledText>
      </StyledPressable>
    </Stack>
  )
}
```

### Step 3: Verify Dependencies

Ensure these packages are installed:

```bash
# Already typically included in Vela:
yarn add expo-clipboard expo-file-system expo-document-picker expo-sharing react-native-qrcode-svg

# Verification
grep "expo-clipboard\|expo-file-system\|react-native-qrcode-svg" package.json
```

### Step 4: Test Service Layer

```typescript
// Test encoding round-trip
import { exportBackup, decodeVelaData, getPayloadSummary } from '../services/velaDataService'

// Create sample data
const cycles = [...]
const logs = [...]
const symptoms = [...]
const settings = [...]

// Export
const code = exportBackup(cycles, logs, symptoms, settings)

// Decode
const payload = decodeVelaData(code)
const summary = getPayloadSummary(payload)

// Verify
expect(summary.cycles).toBe(cycles.length)
expect(summary.logs).toBe(logs.length)
```

### Step 5: Deploy

1. **Staging**: Test on test device with various export levels
2. **Beta**: Collect user feedback on UX
3. **Production**: Gradual rollout with feature flag (optional)

---

## Security Considerations

### Encoding & Transport

```
✅ Base64 is NOT encryption — it's encoding
   → Prevents casual tampering
   → Not suitable for highly sensitive data alone

✅ Recommend: Transport over encrypted channels
   - iCloud backup (encrypted)
   - Google Drive with encryption
   - Encrypted email (Proton Mail)
   - Signal / WhatsApp (encrypted IM)

❌ Not recommended: Unencrypted storage
   - Plain text email
   - Dropbox without encryption
   - Public USB drives
```

### Validation Strategy

**Multi-layer validation prevents data corruption:**

```
Layer 1: Structural Validation
  ├─ Base64 valid
  ├─ JSON parseable
  ├─ Required fields present
  └─ Correct data types

Layer 2: Domain Validation
  ├─ startDate format (YYYY-MM-DD)
  ├─ endDate >= startDate
  ├─ Symptom keys recognized
  ├─ Mood values valid
  └─ Flow values valid

Layer 3: Business Logic Validation
  ├─ No negative cycle lengths
  ├─ Dates in valid range (e.g., not year 3000)
  ├─ No zero or negative intensities
  └─ No duplicate symptom entries per date
```

### User Consent & Privacy

```
REQUIRED before export:
  ☐ User chooses export level
  ☐ Summary displayed (what's included)
  ☐ User confirms action

REQUIRED before import:
  ☐ Payload summary shown
  ☐ Data types listed
  ☐ User confirms merge operation
  ☐ Privacy notice displayed

LOGGING:
  ☐ Track export time/level in app analytics (anonymized)
  ☐ Alert user if exporting to unexpected location
  ☐ Log import success/failure for debugging
```

---

## User Workflows

### Workflow 1: Device Migration

**Scenario:** User gets new iPhone, wants to keep cycle history

```
Old device:
  1. Settings → Export Data
  2. Select "Full Backup"
  3. Tap "Share file"
  4. Send to self via iCloud Mail

New device:
  1. Settings → Restore Data
  2. Open email, download .json file
  3. Tap "Pick .json file" in Vela
  4. Confirm import
  5. ✅ All data restored

Duration: ~5 minutes
Data retained: 100% (cycles, logs, symptoms)
Risk: Low (encrypted iCloud)
```

### Workflow 2: Doctor Sharing

**Scenario:** User shares last 3 months of data with OB/GYN

```
User device:
  1. Settings → Export Data
  2. Select "Date Range"
  3. Confirm "Last 3 months"
  4. Tap "Copy code"
  5. Paste in email/portal

Doctor device (optional):
  1. Receives code
  2. Opens Vela test account
  3. Settings → Restore Data
  4. Paste code
  5. ✅ Views last 3 months

Duration: ~2 minutes
Data privacy: Selective (3 months only)
Audit trail: Timestamp logged
```

### Workflow 3: Partner Sync

**Scenario:** Partner wants to see user's cycle prediction

```
User device:
  1. Settings → Export Data
  2. Select "Settings" (preferences only)
  3. Tap "Copy code"
  4. Text code to partner

Partner device:
  1. Open Vela
  2. Settings → Restore Data
  3. Paste code
  4. ✅ Theme + preferences match

Duration: ~1 minute
Data privacy: No personal data (settings only)
Sync: Non-destructive (partners' settings preserved)
```

### Workflow 4: Manual Backup Rotation

**Scenario:** Monthly backup to cloud storage

```
Monthly (1st of month):
  1. Settings → Export Data
  2. Select "Full Backup"
  3. Tap "Share file"
  4. Move to "iCloud Drive/Vela Backups/"
  5. Rename to "vela-2026-04.json"
  6. ✅ Archive completed

Quarterly check:
  1. Open oldest backup
  2. Verify file readable
  3. Spot-check data in summary
  4. ✅ Backup integrity confirmed

Duration: ~3 minutes per month
Data retention: 12+ months (configurable)
Recovery time: ~2 minutes if needed
```

---

## Testing Strategy

### Unit Tests (Service Layer)

```typescript
describe('velaDataService', () => {
  describe('exportSettings', () => {
    it('should encode settings to base64', () => {
      const settings = [{key: 'theme', value: 'dark'}, ...]
      const code = exportSettings(settings)
      expect(code).toMatch(/^[A-Za-z0-9+/=]*$/)  // Valid base64
    })

    it('should handle empty settings', () => {
      const code = exportSettings([])
      expect(code).toBeDefined()
      const payload = decodeVelaData(code)
      expect(payload.st).toEqual({})
    })
  })

  describe('exportBackup', () => {
    it('should include all data types', () => {
      const cycles = [...]
      const logs = [...]
      const symptoms = [...]
      const settings = [...]

      const code = exportBackup(cycles, logs, symptoms, settings)
      const payload = decodeVelaData(code)

      expect(payload.cy).toHaveLength(cycles.length)
      expect(payload.dl).toHaveLength(logs.length)
      expect(payload.st).toBeDefined()
    })

    it('should compress to <1KB per 10 cycles', () => {
      const cycles = generateCycles(10)
      // ...
      const code = exportBackup(...)
      expect(code.length).toBeLessThan(1000)
    })
  })

  describe('decodeVelaData', () => {
    it('should validate payload version', () => {
      const invalid = btoa(JSON.stringify({v: 99, l: 'backup', ts: Date.now()}))
      expect(() => decodeVelaData(invalid)).toThrow()
    })

    it('should reject malformed base64', () => {
      expect(() => decodeVelaData('!!!invalid!!!')).toThrow()
    })

    it('should reject non-JSON payloads', () => {
      const notJson = btoa('this is not json')
      expect(() => decodeVelaData(notJson)).toThrow()
    })
  })
})
```

### Integration Tests (UI Layer)

```typescript
describe('ExportDataContent', () => {
  it('should render all export level options', () => {
    const { getByText } = render(<ExportDataContent />)
    expect(getByText(/Settings/)).toBeDefined()
    expect(getByText(/Full Backup/)).toBeDefined()
    expect(getByText(/Date Range/)).toBeDefined()
  })

  it('should show summary after code generation', async () => {
    // Mock data...
    const { getByText } = render(<ExportDataContent />)
    await waitFor(() => {
      expect(getByText(/5 cycles/)).toBeDefined()
    })
  })

  it('should copy code to clipboard', async () => {
    // Mock clipboard...
    const { getByText } = render(<ExportDataContent />)
    fireEvent.press(getByText(/Copy code/))
    await waitFor(() => {
      expect(mockClipboard.setStringAsync).toBeCalled()
    })
  })
})

describe('ImportDataContent', () => {
  it('should validate code before import', () => {
    const { getByText, getByPlaceholder } = render(
      <ImportDataContent onDone={() => {}} />
    )
    fireEvent.changeText(getByPlaceholder(/Paste/), 'invalid')
    fireEvent.press(getByText(/Import from code/))
    expect(getByText(/Invalid/)).toBeDefined()
  })

  it('should show confirmation dialog', async () => {
    // Valid code mock...
    const { getByPlaceholder, getByText } = render(
      <ImportDataContent onDone={() => {}} />
    )
    fireEvent.changeText(getByPlaceholder(/Paste/), validCode)
    fireEvent.press(getByText(/Import from code/))

    await waitFor(() => {
      expect(mockDialogue.confirm).toBeCalled()
    })
  })
})
```

### End-to-End Tests (Full Flow)

```typescript
describe('Export → Import Cycle', () => {
  it('should preserve data through export-import cycle', async () => {
    // Setup
    const device1 = new VelaTestDevice()
    const device2 = new VelaTestDevice()

    // Add test data to device1
    await device1.addCycle({ startDate: '2026-01-01' })
    await device1.addLog('2026-01-05', { mood: 'happy', flow: 'heavy' })

    // Export from device1
    const exportCode = await device1.export('backup')

    // Import to device2
    await device2.import(exportCode)

    // Verify
    const cycles = await device2.getCycles()
    const logs = await device2.getLogs()

    expect(cycles).toHaveLength(1)
    expect(logs[0].mood).toBe('happy')
    expect(logs[0].flow).toBe('heavy')
  })

  it('should merge non-destructively', async () => {
    // Device2 already has some data
    const device2 = new VelaTestDevice()
    await device2.addCycle({ startDate: '2026-03-01' })

    // Import from device1
    await device2.import(exportCode)

    // Verify both cycles exist
    const cycles = await device2.getCycles()
    expect(cycles).toHaveLength(2)
  })
})
```

---

## Deployment Checklist

- [ ] All files created and tested
- [ ] Service layer unit tests passing
- [ ] UI components render correctly
- [ ] Export button integrated in settings
- [ ] Import button integrated in settings
- [ ] QR code generation working
- [ ] File I/O tested on device
- [ ] Error messages user-friendly
- [ ] Privacy notice visible
- [ ] Documentation updated
- [ ] Beta testers recruited
- [ ] Analytics events added
- [ ] Production release ready

---

## Future Enhancements

### Phase 2: Cloud Sync

```typescript
// Automatic backup to secure server
cloudSync: {
  enabled: boolean
  frequency: 'daily' | 'weekly'
  lastSync: Date
}
```

### Phase 3: Partner Sharing

```typescript
// Real-time sync with partner
partnerSharing: {
  partnerId: string
  shareLevel: 'summary' | 'full'
  syncFrequency: 'realtime' | 'daily'
}
```

### Phase 4: Data Analytics

```typescript
// Share anonymized data for research
analytics: {
  participateInResearch: boolean
  anonymizedCycles: number
  anonymizedLogs: number
}
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Invalid code" error | Bad base64 copy | Check for extra spaces |
| QR won't scan | Phone lighting | Better lighting, larger size |
| Import fails silently | Old data exists | Manually merge date ranges |
| File won't open | Wrong app | Use native file manager |
| Symptoms not imported | Missing dailyLog ID | Check log import first |

### Support Resources

- **User Guide**: `/docs/EXPORT_IMPORT_USER_GUIDE.md`
- **FAQ**: `/docs/FAQ.md#export-import`
- **Support Email**: support@velacycle.com

---

## References

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Expo Clipboard API](https://docs.expo.dev/modules/clipboard/)
- [React Native QR Code SVG](https://github.com/awesomejerry/react-native-qrcode-svg)
- [Base64 Encoding RFC](https://datatracker.ietf.org/doc/html/rfc4648)

---

**End of Document**
