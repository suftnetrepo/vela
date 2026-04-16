import React, { useEffect, useState, useRef } from 'react'
import { ScrollView, Share, Platform } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import QRCode from 'react-native-qrcode-svg'
import { Stack, StyledText, StyledPressable } from 'fluent-styles'
import { toastService, loaderService, dialogueService } from 'fluent-styles'
import { useColors } from '../constants'
import { useCycles, useDailyLogs, useSettings } from '../hooks'
import {
  exportSettings,
  exportBackup,
  exportSelective,
  getPayloadSummary,
  type ExportLevel,
} from '../services/velaDataService'
import type { SymptomLog } from '../db/schema'

interface ExportDataContentProps {
  onDone?: () => void
}

export function ExportDataContent({ onDone }: ExportDataContentProps) {
  const Colors = useColors()
  const { data: cycles } = useCycles()
  const { data: allLogs } = useDailyLogs()
  const { data: settings } = useSettings()
  const [code, setCode] = useState<string>('')
  const [exportLevel, setExportLevel] = useState<ExportLevel>('backup')
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null)
  const [summary, setSummary] = useState<{ cycles: number; logs: number; symptoms: number; dateRange?: string } | null>(null)
  const qrRef = useRef<any>(null)

  useEffect(() => {
    generateExportCode()
  }, [exportLevel, dateRange, cycles, allLogs, settings])

  const generateExportCode = async () => {
    try {
      let newCode: string

      if (exportLevel === 'settings') {
        newCode = exportSettings(settings)
      } else if (exportLevel === 'backup') {
        // Get all symptoms
        const allSymptoms = allLogs.flatMap(log =>
          (log.symptoms as any[] || []).map(sym => ({
            date: log.date,
            symptomKey: sym.symptomKey,
            intensity: sym.intensity,
          } as SymptomLog))
        )
        newCode = exportBackup(cycles, allLogs, allSymptoms, settings)
      } else {
        // selective
        if (!dateRange) {
          // If no range specified, use last 3 months
          const now = new Date()
          const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
          const start = threeMonthsAgo.toISOString().split('T')[0]
          const end = now.toISOString().split('T')[0]
          setDateRange({ start, end })
          return
        }

        const allSymptoms = allLogs.flatMap(log =>
          (log.symptoms as any[] || []).map(sym => ({
            date: log.date,
            symptomKey: sym.symptomKey,
            intensity: sym.intensity,
          } as SymptomLog))
        )
        newCode = exportSelective(allLogs, allSymptoms, dateRange.start, dateRange.end, settings)
      }

      setCode(newCode)

      // Decode to show summary
      const base64 = newCode
      const json = decodeURIComponent(escape(atob(base64)))
      const payload = JSON.parse(json)
      setSummary(getPayloadSummary(payload))
    } catch (err) {
      console.error('Export error:', err)
      toastService.error('Export failed', 'Could not generate export code')
    }
  }

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

        await FileSystem.writeAsStringAsync(path, JSON.stringify(exportData, null, 2))

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
      }, { label: 'Preparing…', variant: 'spinner' })
    } catch (err: any) {
      toastService.error('Share failed', err?.message)
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
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        setDateRange({
          start: threeMonthsAgo.toISOString().split('T')[0],
          end: now.toISOString().split('T')[0],
        })
      }
    }
    setExportLevel(level)
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
    >
      <StyledText fontSize={13} color={Colors.textMuted} textAlign="center" marginBottom={20}>
        Choose what to export, then share your code with someone or save it for backup
      </StyledText>

      {/* Export level tabs */}
      <Stack gap={8} marginBottom={20}>
        <StyledText fontSize={12} fontWeight="700" color={Colors.textMuted} letterSpacing={0.5}>
          EXPORT TYPE
        </StyledText>
        <Stack gap={8}>
          {[
            { id: 'settings' as ExportLevel, label: '⚙️ Settings', desc: 'Theme & preferences' },
            { id: 'backup' as ExportLevel, label: '💾 Full Backup', desc: 'All cycles & logs' },
            { id: 'selective' as ExportLevel, label: '📅 Date Range', desc: 'Custom period' },
          ].map(option => (
            <StyledPressable
              key={option.id}
              onPress={() => handleExportLevelChange(option.id)}
              paddingHorizontal={14}
              paddingVertical={12}
              borderRadius={12}
              backgroundColor={exportLevel === option.id ? Colors.primary : Colors.bgMuted}
              borderWidth={1}
              borderColor={exportLevel === option.id ? Colors.primary : Colors.border}
            >
              <Stack horizontal alignItems="center" gap={12} justifyContent="space-between">
                <StyledText
                  fontSize={14}
                  fontWeight="600"
                  color={exportLevel === option.id ? '#fff' : Colors.textPrimary}
                >
                  {option.label}
                </StyledText>
                <StyledText
                  fontSize={12}
                  color={exportLevel === option.id ? 'rgba(255,255,255,0.7)' : Colors.textMuted}
                >
                  {option.desc}
                </StyledText>
              </Stack>
            </StyledPressable>
          ))}
        </Stack>
      </Stack>

      {/* Summary */}
      {summary && (
        <Stack
          paddingHorizontal={14}
          paddingVertical={12}
          borderRadius={12}
          backgroundColor={Colors.bgInput}
          marginBottom={20}
        >
          <Stack gap={4}>
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

      {/* QR code */}
      {code && (
        <>
          <Stack alignItems="center" marginBottom={24}>
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
                getRef={qrRef}
              />
            </Stack>
          </Stack>

          {/* Code preview */}
          <Stack
            paddingHorizontal={14}
            paddingVertical={10}
            borderRadius={12}
            backgroundColor={Colors.bgInput}
            marginBottom={16}
          >
            <StyledText
              fontSize={11}
              color={Colors.textMuted}
              numberOfLines={2}
              style={{ fontFamily: 'monospace' }}
            >
              {code.slice(0, 80)}…
            </StyledText>
          </Stack>

          {/* Action buttons */}
          <Stack gap={10}>
            <StyledPressable
              horizontal
              alignItems="center"
              justifyContent="center"
              gap={10}
              paddingVertical={14}
              borderRadius={14}
              backgroundColor={Colors.primary}
              onPress={handleCopyCode}
            >
              <StyledText fontSize={16}>📋</StyledText>
              <StyledText fontSize={15} fontWeight="700" color="#fff">
                Copy code
              </StyledText>
            </StyledPressable>

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
              onPress={handleShareFile}
            >
              <StyledText fontSize={16}>📤</StyledText>
              <StyledText fontSize={15} fontWeight="700" color={Colors.textPrimary}>
                Share file
              </StyledText>
            </StyledPressable>
          </Stack>
        </>
      )}
    </ScrollView>
  )
}
