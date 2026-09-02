import React, { useEffect, useMemo, useState } from 'react'
import { ScrollView, Share } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import QRCode from 'react-native-qrcode-svg'
import { Stack, StyledText, StyledPressable } from 'fluent-styles'
import { Text } from '@/components/text'
import { toastService, loaderService, dialogueService } from 'fluent-styles'
import { useColors } from '../../hooks/useColors'
import { useCycles } from '../../hooks/useCycles'
import { useDailyLogs } from '../../hooks/useDailyLogs'
import { useSettings } from '../../hooks/useSettings'
import { VelaIcon } from './VelaIcon'
import { ErrorBoundary } from './ErrorBoundary'
import {
  exportSettings,
  exportBackup,
  exportSelective,
  getPayloadSummary,
  type ExportLevel,
} from '../../services/velaDataService'
import type { SymptomLog } from '../../db/schema'

interface ExportDataContentProps {
  onDone?: () => void
}

// A QR code can only hold so much data — even at max size/lowest error
// correction, byte-mode capacity tops out around ~2953 bytes. Full backups
// with more than a few weeks of logs blow way past that, so instead of
// letting the QR library throw (and crash the screen), we simply don't
// attempt to render a QR above this length and show Copy/Share instead.
const MAX_QR_PAYLOAD_LENGTH = 2000

export function ExportDataContent({ onDone }: ExportDataContentProps) {
  const Colors = useColors()
  const { cycles } = useCycles()
  const { data: allLogs } = useDailyLogs()
  const settings = useSettings()

  const [exportLevel, setExportLevel] = useState<ExportLevel>('backup')
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null)

  useEffect(() => {
    if (exportLevel === 'selective' && !dateRange) {
      const now = new Date()
      const threeMonthsAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 3,
        now.getDate()
      )

      setDateRange({
        start: threeMonthsAgo.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0],
      })
    }
  }, [exportLevel, dateRange])

  const settingsArray = useMemo(() => {
    const now = new Date().toISOString()

    return Object.entries(settings || {}).map(([key, value]) => ({
      key,
      value: String(value),
      updatedAt: now,
    }))
  }, [settings])

  const allSymptoms = useMemo(() => {
    // Replace this with the real symptom extraction from your log shape
    return (allLogs || []).flatMap((log: any) =>
      (log?.symptoms || []).map((symptom: any) => ({
        date: log.date,
        symptomKey: symptom.symptomKey,
        intensity: symptom.intensity ?? 1,
      } as SymptomLog))
    )
  }, [allLogs])

  const code = useMemo(() => {
    try {
      if (!cycles || !allLogs) return ''
      if (exportLevel === 'selective' && !dateRange) return ''

      if (exportLevel === 'settings') {
        return exportSettings(settingsArray)
      }

      if (exportLevel === 'backup') {
        return exportBackup(cycles, allLogs, allSymptoms, settingsArray)
      }

      return exportSelective(
        allLogs,
        allSymptoms,
        dateRange!.start,
        dateRange!.end,
        settingsArray
      )
    } catch (err) {
      console.error('Export error:', err)
      return ''
    }
  }, [cycles, allLogs, allSymptoms, settingsArray, exportLevel, dateRange])

  const summary = useMemo(() => {
    try {
      if (!code) return null

      const json = decodeURIComponent(escape(atob(code)))
      const payload = JSON.parse(json)
      return getPayloadSummary(payload)
    } catch (err) {
      console.error('Summary parse error:', err)
      return null
    }
  }, [code])

  const canRenderQr = !!code && code.length <= MAX_QR_PAYLOAD_LENGTH

  const handleCopyCode = async () => {
    if (!code) return
    await Clipboard.setStringAsync(code)
    toastService.success('Code copied!', 'Your export code is ready to share')
  }

  const handleShareFile = async () => {
    if (!code) return

    try {
      await loaderService.wrap(async () => {
        const fileName = `vela-export-${new Date().toISOString().split('T')[0]}.json`
        const path = FileSystem.cacheDirectory + fileName

        const exportData = {
          vela: true,
          exportLevel,
          code,
          summary,
          exported: new Date().toISOString(),
        }

        await FileSystem.writeAsStringAsync(
          path,
          JSON.stringify(exportData, null, 2)
        )

        const canShare = await Sharing.isAvailableAsync()

        if (canShare) {
          await Sharing.shareAsync(path, {
            mimeType: 'application/json',
            dialogTitle: 'Share your Vela cycle data',
          })
        } else {
          await Share.share({
            message: code,
            title: 'My Vela Cycle Data',
          })
        }

        // Best-effort cleanup: this file is a plaintext-readable copy of the
        // user's cycle/symptom history — don't leave it sitting in the app
        // cache once the share sheet has done its job. Never let a cleanup
        // failure surface as an export failure.
        try {
          await FileSystem.deleteAsync(path, { idempotent: true })
        } catch {
          // Non-fatal — the OS will eventually reclaim the cache directory.
        }
      }, { label: 'Preparing…', variant: 'spinner' })
    } catch (err: any) {
      toastService.error('Share failed', err?.message || 'Could not share file')
    }
  }

  const handleExportLevelChange = async (level: ExportLevel) => {
    if (level === 'selective') {
      const ok = await dialogueService.confirm({
        title: 'Choose Date Range',
        message: 'Select a custom date range or use the last 3 months',
        confirmLabel: 'Last 3 Months',
        cancelLabel: 'Custom',
      })

      if (ok) {
        const now = new Date()
        const threeMonthsAgo = new Date(
          now.getFullYear(),
          now.getMonth() - 3,
          now.getDate()
        )

        setDateRange({
          start: threeMonthsAgo.toISOString().split('T')[0],
          end: now.toISOString().split('T')[0],
        })
      } else {
        // open your custom date picker here later
      }
    }

    setExportLevel(level)
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
    >
      <Text
        fontSize={13}
        color={Colors.textTertiary}
        textAlign="center"
        marginBottom={20}
      >
        Choose what to export, then share your code with someone or save it for backup
      </Text>

      <Stack gap={8} marginBottom={20}>
        <Text
          fontSize={12}
          fontWeight="700"
          color={Colors.textTertiary}
          letterSpacing={0.5}
        >
          EXPORT TYPE
        </Text>

        <Stack gap={8}>
          {[
           // { id: 'settings' as ExportLevel, label: 'Settings', desc: 'Theme & preferences', icon: 'settings' },
            { id: 'backup' as ExportLevel, label: 'Full Backup', desc: 'All cycles & logs', icon: 'download' },
          //  { id: 'selective' as ExportLevel, label: 'Date Range', desc: 'Custom period', icon: 'calendar' },
          ].map(option => (
            <StyledPressable
              key={option.id}
              onPress={() => handleExportLevelChange(option.id)}
              paddingHorizontal={14}
              paddingVertical={12}
              borderRadius={12}
              backgroundColor={exportLevel === option.id ? Colors.primary : Colors.surfaceAlt}
              borderWidth={1}
              borderColor={exportLevel === option.id ? Colors.primary : Colors.border}
            >
              <Stack horizontal alignItems="center" gap={12}>
                <VelaIcon
                  name={option.icon as any}
                  size={18}
                  color={exportLevel === option.id ? '#fff' : Colors.primary}
                />

                <Stack flex={1}>
                  <Text
                    fontSize={14}
                    fontWeight="600"
                    color={exportLevel === option.id ? '#fff' : Colors.textPrimary}
                  >
                    {option.label}
                  </Text>

                  <Text
                    fontSize={11}
                    color={exportLevel === option.id ? 'rgba(255,255,255,0.7)' : Colors.textTertiary}
                  >
                    {option.desc}
                  </Text>
                </Stack>
              </Stack>
            </StyledPressable>
          ))}
        </Stack>
      </Stack>

      {summary && (
        <Stack
          paddingHorizontal={14}
          paddingVertical={12}
          borderRadius={12}
          backgroundColor={Colors.surface}
          marginBottom={20}
        >
          <Stack gap={4}>
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
              <Stack horizontal alignItems="center" gap={8}>
                <VelaIcon name="calendar" size={14} color={Colors.primary} />
                <Text fontSize={12} color={Colors.textPrimary}>
                  {summary.dateRange}
                </Text>
              </Stack>
            )}
          </Stack>
        </Stack>
      )}

      {code ? (
        <>
          <Stack alignItems="center" marginBottom={24}>
            {canRenderQr ? (
              <ErrorBoundary
                fallback={
                  <Stack
                    padding={20}
                    borderRadius={20}
                    backgroundColor={Colors.surfaceAlt}
                    borderWidth={1}
                    borderColor={Colors.border}
                    alignItems="center"
                    gap={6}
                    maxWidth={260}
                  >
                    <VelaIcon name="download" size={22} color={Colors.textTertiary} />
                    <Text fontSize={12} color={Colors.textSecondary} textAlign="center">
                      Couldn't generate a QR code for this export. Use Copy code or Share file below instead.
                    </Text>
                  </Stack>
                }
              >
                <Stack
                  padding={16}
                  borderRadius={20}
                  backgroundColor="#fff"
                  borderWidth={1}
                  borderColor={Colors.border}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 4,
                  }}
                >
                  <QRCode
                    value={code}
                    size={200}
                    color="#111827"
                    backgroundColor="#fff"
                  />
                </Stack>
              </ErrorBoundary>
            ) : (
              <Stack
                padding={20}
                borderRadius={20}
                backgroundColor={Colors.surfaceAlt}
                borderWidth={1}
                borderColor={Colors.border}
                alignItems="center"
                gap={6}
                maxWidth={260}
              >
                <VelaIcon name="download" size={22} color={Colors.textTertiary} />
                <Text fontSize={12} color={Colors.textSecondary} textAlign="center">
                  Your backup has too much data to fit in a QR code. Use Copy code or Share file below instead.
                </Text>
              </Stack>
            )}
          </Stack>

          <Stack
            paddingHorizontal={14}
            paddingVertical={10}
            borderRadius={12}
            backgroundColor={Colors.surface}
            marginBottom={16}
          >
            <Text
              fontSize={11}
              color={Colors.textTertiary}
              numberOfLines={2}
              style={{ fontFamily: 'monospace' }}
            >
              {code.slice(0, 80)}…
            </Text>
          </Stack>

          <Stack gap={10}>
            <StyledPressable
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              gap={10}
              paddingVertical={14}
              borderRadius={14}
              backgroundColor={Colors.primary}
              onPress={handleCopyCode}
            >
              <VelaIcon name="copy" size={18} color="#fff" />
              <Text fontSize={15} fontWeight="700" color="#fff">
                Copy code
              </Text>
            </StyledPressable>

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
              onPress={handleShareFile}
            >
              <VelaIcon name="share" size={18} color={Colors.primary} />
              <Text fontSize={15} fontWeight="700" color={Colors.textPrimary}>
                Share file
              </Text>
            </StyledPressable>
          </Stack>

          <Stack
            marginTop={20}
            paddingHorizontal={14}
            paddingVertical={12}
            borderRadius={12}
            backgroundColor={Colors.surface}
          >
            <Stack horizontal gap={8} alignItems="flex-start">
              <VelaIcon name="alert-circle" size={16} color={Colors.warning} style={{ marginTop: 2 }} />
              <Text fontSize={12} color={Colors.textPrimary} lineHeight={18} flex={1}>
                <Text color={Colors.textPrimary} variant="label">Not encrypted</Text>: this code, QR, and file contain your cycle, symptom, and journal history in readable form. Store and share it only somewhere private.
              </Text>
            </Stack>
          </Stack>
        </>
      ) : null}
    </ScrollView>
  )
}