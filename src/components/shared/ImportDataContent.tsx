import React, { useState } from 'react'
import { ScrollView } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { Stack, StyledText, StyledPressable, StyledTextInput } from 'fluent-styles'
import { Text } from '@/components/text'
import { toastService, loaderService, dialogueService } from 'fluent-styles'
import { useColors } from '../../hooks/useColors'
import { VelaIcon } from './VelaIcon'
import {
  decodeVelaData,
  payloadToCycles,
  payloadToDailyLogs,
  payloadToSymptomLogs,
  payloadToSettings,
  getPayloadSummary,
} from '../../services/velaDataService'
import { cycleService } from '../../services/cycle.service'
import { logService } from '../../services/log.service'
import { settingsService } from '../../services/settings.service'
import { useRecordsStore } from '../../stores/records.store'
import { db } from '../../db/client'
import { dailyLogs as dailyLogsTable, symptomLogs as symptomLogsTable } from '../../db/schema'
import { eq } from 'drizzle-orm'

interface ImportDataContentProps {
  onDone: () => void
}

export function ImportDataContent({ onDone }: ImportDataContentProps) {
  const Colors = useColors()
  const { invalidateData } = useRecordsStore()
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
            await cycleService.startNewCycle(new Date(cycle.startDate))
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
      <Text fontSize={13} color={Colors.textTertiary} textAlign="center" marginBottom={20}>
        Paste an export code from another device or pick the .json file you exported
      </Text>

      {/* Paste code section */}
      <Stack gap={12} marginBottom={20}>
        <Text fontSize={12} fontWeight="700" color={Colors.textTertiary} letterSpacing={0.5}>
          PASTE CODE
        </Text>
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
          <Stack horizontal alignItems="center" gap={8}>
            <VelaIcon name="alert-circle" size={14} color={Colors.error} />
            <Text fontSize={12} color={Colors.error} fontWeight="600" flex={1}>
              {error}
            </Text>
          </Stack>
        ) : null}
      </Stack>

      {/* Summary preview */}
      {summary && (
        <Stack
          paddingHorizontal={14}
          paddingVertical={12}
          borderRadius={12}
          backgroundColor={Colors.surface}
          marginBottom={16}
        >
          <Stack gap={4}>
            <Text fontSize={13} fontWeight="600" color={Colors.textPrimary}>
              Ready to import:
            </Text>
            {summary.cycles > 0 && (
              <Stack horizontal alignItems="center" gap={8}>
                <VelaIcon name="cycle" size={14} color={Colors.primary} />
                <Text fontSize={12} color={Colors.textPrimary}>
                  {summary.cycles} cycle{summary.cycles !== 1 ? 's' : ''}
                </Text>
              </Stack>
            )}
            {summary.logs > 0 && (
              <Stack horizontal alignItems="center" gap={8}>
                <VelaIcon name="activity" size={14} color={Colors.primary} />
                <Text fontSize={12} color={Colors.textPrimary}>
                  {summary.logs} log{summary.logs !== 1 ? 's' : ''} ({summary.symptoms} symptoms)
                </Text>
              </Stack>
            )}
            {summary.dateRange && (
              <Text fontSize={12} color={Colors.textSecondary}>
                📅 {summary.dateRange}
              </Text>
            )}
          </Stack>
        </Stack>
      )}

      {/* Buttons */}
      <Stack gap={10}>
        <StyledPressable
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          gap={10}
          paddingVertical={14}
          borderRadius={14}
          backgroundColor={Colors.primary}
          onPress={handleImportCode}
          disabled={!code.trim()}
        >
          <VelaIcon name="upload" size={18} color="#fff" />
          <Text fontSize={15} fontWeight="700" color="#fff">
            Import from code
          </Text>
        </StyledPressable>

        {/* Divider */}
        <Stack horizontal alignItems="center" gap={10} marginVertical={4}>
          <Stack flex={1} height={1} backgroundColor={Colors.border} />
          <Text fontSize={12} color={Colors.textTertiary}>
            or
          </Text>
          <Stack flex={1} height={1} backgroundColor={Colors.border} />
        </Stack>

        <StyledPressable
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          gap={10}
          paddingVertical={14}
          borderRadius={14}
          backgroundColor={Colors.surfaceAlt}
          borderWidth={1}
          borderColor={Colors.border}
          onPress={handlePickFile}
        >
          <VelaIcon name="file" size={18} color={Colors.primary} />
          <Text fontSize={15} fontWeight="700" color={Colors.textPrimary}>
            Pick .json file
          </Text>
        </StyledPressable>
      </Stack>

      {/* Info box */}
      <Stack
        marginTop={20}
        paddingHorizontal={14}
        paddingVertical={12}
        borderRadius={12}
        backgroundColor={Colors.surface}
      >
        <Stack horizontal gap={8} alignItems="flex-start">
          <VelaIcon name="info" size={16} color={Colors.primary} style={{ marginTop: 2 }} />
          <Text fontSize={12} color={Colors.textPrimary} lineHeight={18} flex={1}>
            <Text color={Colors.textPrimary} variant='label'>Privacy</Text>: Only your cycle, logs, and settings are imported. Personal data like PIN and biometric settings are kept separate.
          </Text>
        </Stack>
      </Stack>
    </ScrollView>
  )
}
