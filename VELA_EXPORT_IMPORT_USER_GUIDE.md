# Vela Export/Import — User Guide

**Quick Start Guide for End Users**

---

## 🎯 What is Export/Import?

**Export** lets you save a copy of your cycle data as a code or file.  
**Import** lets you restore data from an export code or file.

### Use Cases

| Scenario | Use This |
|----------|----------|
| New phone, want to keep history | **Full Backup** |
| Sync preferences to new device | **Settings** |
| Share 3 months with doctor | **Date Range** |
| Backup for safety | **Full Backup** |

---

## 📤 How to Export

### Step 1: Open Settings
```
Open Vela → Tap Settings (gear icon) → Scroll down → Tap "Export Data"
```

### Step 2: Choose What to Export

**Option A: Settings Only** ⚙️
- Just theme and preferences
- Safe to share with anyone
- Small file (~500 bytes)

**Option B: Full Backup** 💾
- All cycles, logs, and symptoms
- Private data — keep secure
- Good for cloud backup
- Larger file (~24KB for 6 months)

**Option C: Date Range** 📅
- Choose specific dates (defaults to last 3 months)
- Private data in date range only
- Share with doctor

### Step 3: Share Your Export

After choosing, you'll see these options:

**🔲 Copy Code**
- Press to copy the export code
- Paste in email, iMessage, or notes
- Share with anyone you trust

**📤 Share File**
- Creates a .json file named `vela-export-YYYY-MM-DD.json`
- Opens system share sheet
- Send via iCloud, Google Drive, email, etc.

**📱 QR Code**
- Visible above the buttons
- Someone can scan to import
- Screenshot to share visually

---

## 📥 How to Import

### Step 1: Open Settings
```
Open Vela → Tap Settings (gear icon) → Scroll down → Tap "Import Data"
```

### Step 2: Provide the Export

**Option A: Paste Code**
```
1. Get the export code from someone
2. Long-press in the text field
3. Paste the code
4. Tap "Import from code"
```

**Option B: Pick File**
```
1. Get the .json file (email, cloud drive, etc.)
2. Tap "Pick .json file"
3. Select the file from your device
4. Tap "Import"
```

**Option C: Scan QR (Future)**
Currently, you need to use Options A or B. QR scanning coming soon!

### Step 3: Review & Confirm

You'll see:
- **What's included** (cycles, logs, symptoms)
- **Date range** if applicable
- **Number of items** being imported

Press **"Import"** to proceed.

---

## ⚠️ Important Notes

### Privacy & Security

✅ **SAFE to export/share:**
- Your cycles and logs
- Daily notes and symptoms
- User preferences

❌ **NEVER exported:**
- Your PIN code
- Biometric settings
- Premium status

### Data Safety

- **Imports NEVER delete** your existing data
- New data is added (merged)
- You can import the same file multiple times safely
- Existing data is always preserved

### Recommendations

✅ **DO:**
- Back up your data monthly
- Store backups in secure cloud (iCloud, Google Drive)
- Use encryption if sharing sensitive data
- Test import on new device before deleting old app

❌ **DON'T:**
- Share full backup in unencrypted email
- Leave export files on public USB drives
- Export on public WiFi without VPN
- Share with untrusted sources

---

## 🆘 Troubleshooting

### "Invalid code" Error

**Problem:** When pasting export code, you get an error

**Solutions:**
1. Check you copied the entire code (look for `...` = incomplete)
2. Avoid adding extra spaces before/after
3. Try re-exporting from the original device
4. If code is very old, re-export (backup codes can be refreshed)

### Export Code Too Long

**Problem:** Export code won't fit in iMessage or email

**Solution:** 
Use "Share File" instead of copy/paste:
- Creates a .json file
- Send via email/cloud normally
- Easier to handle

### Import Says "Date Invalid"

**Problem:** Import fails with date error

**Solutions:**
1. Make sure dates are in correct format (YYYY-MM-DD)
2. End date must be after start date
3. Try with smaller date range
4. Contact support if persists

### Lost My Export Code

**Problem:** Had the code but lost it

**Solution:** 
No problem! Export again:
1. Go to Settings → Export Data
2. Choose same export type
3. Get new code
4. Codes change each export but data is identical

---

## 📝 Examples

### Example 1: Device Migration

**You:** Getting new iPhone, want to keep 2 years of data

```
Old iPhone:
  1. Settings → Export Data
  2. Select "Full Backup"
  3. Tap "Share File"
  4. Choose "Save to Files"
  5. Save to iCloud Drive

New iPhone:
  1. Open iCloud Drive
  2. Download the vela-export-2026-04-16.json file
  3. Open Vela
  4. Settings → Import Data
  5. Tap "Pick .json file"
  6. Select the file
  7. Tap "Import"
  ✅ Done! All data restored
```

### Example 2: Sharing with Doctor

**You:** Want to share last 3 months with OB/GYN

```
Your Phone:
  1. Settings → Export Data
  2. Tap "Date Range"
  3. Confirm "Last 3 months" (or pick custom dates)
  4. Tap "Copy Code"
  5. Paste in secure message to doctor
  ✅ Done! Share complete

Doctor receives:
  - Text code only (no identifiable info needed)
  - Can import into test Vela account to view
  - Your privacy protected (no personal data visible)
```

### Example 3: Monthly Backup

**You:** Want to backup data every month to cloud

```
1st of each month:
  1. Settings → Export Data
  2. Select "Full Backup"
  3. Tap "Share File"
  4. Choose "Save to Files"
  5. Create folder "Vela Backups" if needed
  6. File auto-named: vela-export-2026-04-01.json
  7. Repeat monthly
  
  ✅ Now you have 12 backups in iCloud!
  
If you ever need to restore:
  - Open iCloud Drive
  - Download the backup file
  - Import into Vela
  - All history restored
```

---

## ❓ FAQ

**Q: How often should I backup?**  
A: Monthly is good. Weekly if you log frequently. At minimum, before major changes (e.g., switching to new phone).

**Q: Can I backup to multiple places?**  
A: Yes! Export to iCloud, Google Drive, Email, etc. Keep multiple copies for safety.

**Q: What if I import the same file twice?**  
A: No problem! Duplicates are handled gracefully — no errors or data loss.

**Q: Can I edit the export file?**  
A: Not recommended. Files are encoded — editing will likely corrupt them. Export again if needed.

**Q: How long are export codes valid?**  
A: Forever! They don't expire. But if your data changes, codes become outdated. Export fresh for latest data.

**Q: Is my data encrypted in export?**  
A: No, it's base64-encoded (not encrypted). So keep backups secure. Future versions will add encryption.

**Q: Can I password-protect an export?**  
A: Not yet. Coming in future version! For now, rely on file storage encryption (iCloud, Google Drive do this automatically).

**Q: What happens if I delete the app and reinstall?**  
A: All local data is gone. But if you have an export/backup, import it after reinstalling to restore everything.

---

## 🔗 More Help

- **In-App Help:** Settings → Help & Support → Export/Import  
- **Website:** www.velacycle.com/help/export-import  
- **Email Support:** support@velacycle.com  
- **Community:** Join us on Reddit r/VelaCycle

---

**Version:** 1.0  
**Last Updated:** April 2026
