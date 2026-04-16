import React, { useState } from 'react'
import { ScrollView } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { Stack, StyledText, StyledPressable, StyledTextInput } from 'fluent-styles'
import { toastService, loaderService, dialogueService } from 'fluent-styles'
import { useColors } from '../constants'
import {
  decodeVelaData,
  payloadToCycles,
  payloadToDailyLogs,
  payloadToSymptomLogs,
  payloadToSettings,
  getPayloadSummary,
} from '../services/velaDataService'
import { cycleService } from '../services/cycle.service'
import { logService } from '../services/log.service'
import { settingsService } from '../services/settings.service'
import { useAppStore } from '../stores'
import { db } from '../db/client'
import { dailyLogs as dailyLogsTable, symptomLogs as symptomLogsTable } from '../db/schema'
import { eq } from 'drizzle-orm'

interface ImportDataContentProps {
  onDone: () => void
}

export function ImportDataContent({ onDone }: ImportDataContentProps) {
  const Colors = useColors()
  const { invalidateData } = useAppStore()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [summary, setSummary] = useState<{ cycles: number; logs: number; symptoms: number; dateRange?: string } | null>(null)
  const [linkCycles, setLinkCycles] = useState(true)

  const performImport = async (rawCode: string) => {
    setError('')
    setSummary(null)

    try {
      const payload = decodeVelaData(rawCode.trim())
      const summary = getPayloadSummary(payload)

      setSummary(summary)

      // Show confirmation
      const dataTypes: string[] = []
      if (payload.st) dataTypes.push('settings')
      if (payload.cy && payload.cy.length > 0) dataTypes.push(`${payload.cy.length} cycles`)
      if (payload.dl && payload.dl.length > 0) dataTypes.push(`${payload.dl.length} logs`)

      const ok = await dialogueService.confirm({
        title: `Import ${dataTypes.join(' + ')}?`,
        message: `This will add the data from your export to your Vela. Your existing data won't be deleted.`,
        icon: '📥',
        confirmLabel: 'Import',
        destructive: false,
      })

      if (!ok) return

      await loaderService.wrap(async () => {
        // 1. Import settings
        if (payload.st) {
          const settingsMap = payloadToSettings(payload)
          for (const [key, value] of Object.entries(settingsMap)) {
            await settingsService.set(key, value)
          }
        }

        // 2. Import cycles
        if (payload.cy && payload.cy.length > 0) {
          const cycles = payloadToCycles(payload)
          for (const cycle of cycles) {
            await cycleService.create(cycle)
          }
        }

        // 3. Import daily logs + symptoms
        if (payload.dl && payload.dl.length > 0) {
          const logs = payloadToDailyLogs(payload)
          const symptoms = payloadToSymptomLogs(payload)

          // Upsert daily logs
          for (const log of logs) {
            await logService.upsertLog(log.date, log)
          }

          // Insert symptoms
          for (const sym of symptoms) {
            // Find the daily log we just inserted to get its ID
            const daily = await logService.getByDate(sym.date)
            if (daily) {
              await db
                .insert(symptomLogsTable)
                .values({
                  ...sym,
                  dailyLogId: daily.id,
                  createdAt: new Date().toISOString(),
                })
                .catch(() => {
                  // Ignore duplicate symptoms
                })
            }
          }
        }
      }, { label: 'Importing…', variant: 'spinner' })

      invalidateData()
      toastService.success('Import successful!', 'Your data has been added to Vela')
      onDone()
      setCode('')
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Check the code and try again.')
    }
  }

  const handleImportCode = () => {
    if (!code.trim()) {
      setError('Paste the code from your export first.')
      return
    }
    performImport(code)
  }

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      })
      if (result.canceled) return

      const asset = result.assets[0]
      const content = await FileSystem.readAsStringAsync(asset.uri)

      // Accept either raw code or JSON wrapper
      let rawCode = content.trim()
      try {
        const parsed = JSON.parse(rawCode)
        if (parsed.vela && parsed.code) {
          rawCode = parsed.code
        }
      } catch {
        // Not JSON wrapper — treat as raw code
      }

      performImport(rawCode)
    } catch (err: any) {
      toastService.error('Could not read file', err?.message)
    }
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
    >
      <StyledText fontSize={13} color={Colors.textMuted} textAlign="center" marginBottom={20}>
        Paste an export code from another device or pick the .json file you exported
      </StyledText>

      {/* Paste code input */}
      <Stack gap={8} marginBottom={16}>
        <StyledText fontSize={12} fontWeight="700" color={Colors.textMuted} letterSpacing={0.5}>
          PASTE CODE
        </StyledText>
        <StyledTextInput
          variant="filled"
          placeholder="Paste export code here…"
          value={code}
          onChangeText={t => {
            setCode(t)
            setError('')
            setSummary(null)
          }}
          fontSize={13}
          borderRadius={12}
          multiline
          numberOfLines={4}
        />
        {error ? (
          <StyledText fontSize={12} color={Colors.error} fontWeight="600">
            ⚠️ {error}
          </StyledText>
        ) : null}
      </Stack>

      {/* Summary preview */}
      {summary && (
        <Stack
          paddingHorizontal={14}
          paddingVertical={12}
          borderRadius={12}
          backgroundColor={Colors.bgInput}
          marginBottom={16}
        >
          <Stack gap={4}>
            <StyledText fontSize={13} fontWeight="600" color={Colors.textPrimary}>
              Ready to import:
            </StyledText>
            {summary.cycles > 0 && (
              <StyledText fontSize={12} color={Colors.textSecondary}>
                📊 {summary.cycles} cycle{summary.cycles !== 1 ? 's' : ''}
              </StyledText>
            )}
            {summary.logs > 0 && (
              <StyledText fontSize={12} color={Colors.textSecondary}>
                📝 {summary.logs} log{summary.logs !== 1 ? 's' : ''} ({summary.symptoms} symptoms)
              </StyledText>
            )}
            {summary.dateRange && (
              <StyledText fontSize={12} color={Colors.textSecondary}>
                📅 {summary.dateRange}
              </StyledText>
            )}
          </Stack>
        </Stack>
      )}

      {/* Buttons */}
      <Stack gap={10}>
        <StyledPressable
          horizontal
          alignItems="center"
          justifyContent="center"
          gap={10}
          paddingVertical={14}
          borderRadius={14}
          backgroundColor={Colors.primary}
          onPress={handleImportCode}
          disabled={!code.trim()}
        >
          <StyledText fontSize={16}>📥</StyledText>
          <StyledText fontSize={15} fontWeight="700" color="#fff">
            Import from code
          </StyledText>
        </StyledPressable>

        {/* Divider */}
        <Stack horizontal alignItems="center" gap={10} marginVertical={4}>
          <Stack flex={1} height={1} backgroundColor={Colors.border} />
          <StyledText fontSize={12} color={Colors.textMuted}>
            or
          </StyledText>
          <Stack flex={1} height={1} backgroundColor={Colors.border} />
        </Stack>

        <StyledPressable
          horizontal
          alignItems="center"
          justifyContent="center"
          gap={10}
          paddingVertical={14}
          borderRadius={14}
          backgroundColor={Colors.bgMuted}
          borderWidth={1}
          borderColor={Colors.border}
          onPress={handlePickFile}
        >
          <StyledText fontSize={16}>📂</StyledText>
          <StyledText fontSize={15} fontWeight="700" color={Colors.textPrimary}>
            Pick .json file
          </StyledText>
        </StyledPressable>
      </Stack>

      {/* Info box */}
      <Stack
        marginTop={20}
        paddingHorizontal={14}
        paddingVertical={12}
        borderRadius={12}
        backgroundColor={Colors.bgInput}
      >
        <StyledText fontSize={12} color={Colors.textMuted} lineHeight={18}>
          💡 <StyledText fontWeight="600">Privacy</StyledText>: Only your cycle, logs, and settings are imported. Personal data like PIN and biometric settings are kept separate.
        </StyledText>
      </Stack>
    </ScrollView>
  )
}
