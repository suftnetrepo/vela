import React, { useState, useEffect } from "react";
import {
  Stack,
  StyledText,
  StyledScrollView,
  StyledPage,
  StyledHeader,
  StyledPressable,
  TabBar,
  theme,
  StyledSpacer,
} from "fluent-styles";
import { router, useLocalSearchParams } from "expo-router";
import { Text } from "@/components/text";
import { useColors } from "../../src/hooks/useColors";
import { useDailyLog } from "../../src/hooks/useDailyLog";
import { useCycles } from "../../src/hooks/useCycles";
import { FlowTab } from "../../src/components/log/FlowTab";
import { SymptomsTab } from "../../src/components/log/SymptomsTab";
import { JournalTab } from "../../src/components/log/JournalTab";
import type { FlowData, FlowLevel, DischargeType } from "../../src/components/log/FlowTab";
import type { JournalData } from "../../src/components/log/JournalTab";
import { VelaIcon } from "../../src/components/shared/VelaIcon";
import { formatDisplayDate, todayStr, fromDateStr, toDateStr, subDays, differenceInDays } from "../../src/utils/date";
import { APP_CONFIG } from "../../src/constants/config";
import { toastService, loaderService, dialogueService } from "fluent-styles";
import { logService } from "../../src/services/log.service";
import { notificationService } from "../../src/services/notification.service";
import { useRecordsStore } from "../../src/stores/records.store";

// Mood keys are stored with this prefix in the symptoms table for persistence
const MOOD_KEY_PREFIX = "mood_";

type LogTab = "flow" | "symptoms" | "journal";

export default function LogScreen() {
  const Colors = useColors();
  const params = useLocalSearchParams<{ date?: string; tab?: string }>();
  const date = params.date ?? todayStr();
  const isToday = date === todayStr();

  const { log, loading, saveLog } = useDailyLog(date);
  const { active, startCycle, endCycle } = useCycles();
  const invalidateData = useRecordsStore((s) => s.invalidateData);

  const [activeTab, setActiveTab] = useState<LogTab>(
    (params.tab as LogTab) ?? "flow",
  );
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Flow state
  const [flowData, setFlowData] = useState<FlowData>({
    hasFlow: null,
    level: null,
    discharge: null,
  });

  // All selected symptom keys (does NOT include moods — moods are in journalData.moods)
  const [symptoms, setSymptoms] = useState<string[]>([]);

  // Journal (moods, energy level, and notes)
  const [journalData, setJournalData] = useState<JournalData>({
    moods: [],
    energyLevel: 3,
    notes: "",
  });

  // Reset all log state to defaults (used after delete)
  const resetLogState = () => {
    setFlowData({
      hasFlow: null,
      level: null,
      discharge: null,
    });
    setSymptoms([]);
    setJournalData({
      moods: [],
      energyLevel: 3,
      notes: "",
    });
    setDirty(false);
  };

  // Hydrate from existing log
  useEffect(() => {
    if (!log) {
      // If log is null (deleted or empty day), reset to defaults
      resetLogState();
      return;
    }
    const flow = log.flow ?? null;
    
    // Parse compound flow values like "light_spotting" into level and discharge
    let level: FlowLevel = null;
    let discharge: DischargeType = null;
    
    if (flow) {
      // Check if it's a discharge type (spotting, sticky, eggwhite)
      if (flow === "spotting" || flow === "sticky" || flow === "eggwhite") {
        discharge = flow;
        // Default to light if no level specified
        level = "light";
      } else if (flow.includes("_")) {
        // Compound value like "light_spotting"
        const parts = flow.split("_");
        if (parts.length >= 2) {
          const potentialLevel = parts[0];
          const potentialDischarge = parts[1];
          
          if (potentialLevel === "light" || potentialLevel === "medium" || potentialLevel === "heavy") {
            level = potentialLevel as FlowLevel;
          }
          if (potentialDischarge === "spotting" || potentialDischarge === "sticky" || potentialDischarge === "eggwhite") {
            discharge = potentialDischarge as DischargeType;
          }
        }
      } else if (flow === "light" || flow === "medium" || flow === "heavy") {
        level = flow;
      } else if (flow === "none") {
        // No flow selected
      }
    }
    
    // Determine hasFlow based on flow value
    // flow can be: "none", "none_spotting", "light", "light_spotting", etc.
    // Check for "none" prefix first (handles both "none" and "none_*" patterns)
    let hasFlow: boolean | null;
    if (!flow) {
      hasFlow = null;
    } else if (flow.startsWith("none")) {
      hasFlow = false;
    } else {
      hasFlow = true;
    }

    setFlowData({
      hasFlow,
      level,
      discharge,
    });

    // Separate symptom keys and mood keys from DB
    const allKeys = log.symptoms.map((s) => s.symptomKey);
    const symptomKeys = allKeys.filter((k) => !k.startsWith(MOOD_KEY_PREFIX));
    const moodKeys = allKeys
      .filter((k) => k.startsWith(MOOD_KEY_PREFIX))
      .map((k) => k.replace(MOOD_KEY_PREFIX, ""));

    // Also migrate legacy single mood from daily_logs.mood if present
    // and no mood_ keys exist yet
    if (log.mood && moodKeys.length === 0) {
      moodKeys.push(log.mood);
    }

    setSymptoms(symptomKeys);
    setJournalData({
      moods: moodKeys,
      energyLevel: log.energyLevel ?? 3,
      notes: log.notes ?? "",
    });
    setDirty(false);
  }, [log]);

  // Estimate how long the period was for the cycle that's about to be closed,
  // by counting the actual flow-logged days between its start and the day
  // before the new period begins. Falls back to the app default if nothing
  // was logged (shouldn't normally happen).
  const computePeriodLength = async (
    cycleStartStr: string,
    beforeDateStr: string,
  ): Promise<number> => {
    const logs = await logService.getRange(cycleStartStr, beforeDateStr);
    const flowDates = Array.from(
      new Set(
        logs
          .filter((l) => l.flow && !l.flow.startsWith("none"))
          .map((l) => l.date),
      ),
    ).sort();

    if (flowDates.length === 0) {
      return APP_CONFIG.prediction.defaultPeriodLength;
    }

    // Walk forward from the first logged flow day, tolerating single-day
    // gaps (e.g. light spotting that pauses for a day) but stopping the
    // moment there's a real gap. This prevents a stray/accidental flow log
    // much later in the cycle from inflating the period length — a period
    // is the actual bleeding run, not the full span between the first and
    // last day flow was ever logged.
    let runStart = fromDateStr(flowDates[0]);
    let runEnd = runStart;
    let longestRun = 1;
    let cursor = runStart;

    for (let i = 1; i < flowDates.length; i++) {
      const d = fromDateStr(flowDates[i]);
      const gap = differenceInDays(d, cursor);

      if (gap <= 2) {
        // Same day, next day, or a single skipped day — still the same run
        runEnd = d;
        cursor = d;
        const runLength = differenceInDays(runEnd, runStart) + 1;
        if (runLength > longestRun) longestRun = runLength;
      } else {
        // A real gap — start tracking a fresh run from here
        runStart = d;
        runEnd = d;
        cursor = d;
      }
    }

    return Math.min(
      Math.max(longestRun, APP_CONFIG.prediction.minPeriodLength),
      APP_CONFIG.prediction.maxPeriodLength,
    );
  };

  // Keep the `cycles` table (which Insights, History, Patterns and the
  // prediction algorithm all read from) in sync with what's actually being
  // logged on the Flow tab. This is what turns a logged period into a new
  // tracked cycle instead of just a daily_logs row.
  const syncCycleForFlowLog = async (
    logDateStr: string,
    hasFlow: boolean | null,
  ): Promise<number | undefined> => {
    // Not a period day (or flow wasn't touched) — leave cycle assignment as-is
    if (hasFlow !== true) {
      return active?.id;
    }

    const logDate = fromDateStr(logDateStr);

    // First period ever logged — nothing to compare against
    if (!active) {
      const created = await startCycle(logDate);
      return created.id;
    }

    const activeStart = fromDateStr(active.startDate);

    // Backfilling a date on/before the current cycle's recorded start —
    // treat it as part of that same cycle rather than fabricating a new one
    if (logDate <= activeStart) {
      return active.id;
    }

    // If flow was logged yesterday too, this is just a continuation of the
    // period that's already in progress
    const prevLog = await logService.getByDate(toDateStr(subDays(logDate, 1)));
    const hadFlowYesterday = !!prevLog?.flow && !prevLog.flow.startsWith("none");
    if (hadFlowYesterday) {
      return active.id;
    }

    const daysSinceStart = differenceInDays(logDate, activeStart);

    // A gap shortly after the cycle started is more likely an off day or
    // spotting within the same period than a brand-new cycle
    if (daysSinceStart < APP_CONFIG.prediction.minCycleLength) {
      return active.id;
    }

    // Enough time has passed with a real gap in flow logging — this is a new
    // period. Close out the previous cycle (recording its period length) and
    // start tracking the new one.
    const periodLength = await computePeriodLength(
      active.startDate,
      toDateStr(subDays(logDate, 1)),
    );
    await endCycle(subDays(logDate, 1), periodLength);
    const created = await startCycle(logDate);
    return created.id;
  };

  const handleSave = async () => {
    setSaving(true);
    const id = loaderService.show({ label: "Saving…", variant: "dots" });
    try {
      // Resolve flow string
      let flowStr: string | undefined;
      if (flowData.hasFlow === false) {
        // No flow - but still check for discharge
        // Discharge is independent from menstrual flow
        if (flowData.discharge === "spotting" || flowData.discharge === "sticky" || flowData.discharge === "eggwhite") {
          flowStr = `none_${flowData.discharge}`;
        } else {
          flowStr = "none";
        }
      } else if (flowData.hasFlow === true) {
        // Had flow - flow level is required
        const level = flowData.level ?? "light";
        
        // Combine flow level with discharge if discharge is selected
        if (flowData.discharge === "spotting" || flowData.discharge === "sticky" || flowData.discharge === "eggwhite") {
          flowStr = `${level}_${flowData.discharge}`;
        } else {
          // If no discharge selected, just use flow level
          flowStr = level;
        }
      }
      // If hasFlow is null, flowStr remains undefined (no period data logged)

      // Combine symptoms and moods for persistence
      // Moods are stored with mood_ prefix in the symptoms array
      const allKeys = [
        ...symptoms,
        ...journalData.moods.map((k) => `${MOOD_KEY_PREFIX}${k}`),
      ];

      // Extract first mood for legacy daily_logs.mood column
      const legacyMood =
        journalData.moods.length > 0 ? journalData.moods[0] : undefined;

      // Sync the cycles table BEFORE writing the daily log, so the log gets
      // stamped with the correct (possibly newly-created) cycle id
      const cycleId = await syncCycleForFlowLog(date, flowData.hasFlow);

      const payload = {
        flow: flowStr,
        mood: legacyMood,
        energyLevel: journalData.energyLevel,
        notes: journalData.notes || undefined,
        cycleId,
        symptoms: allKeys.map((k) => ({ key: k })),
      };

      await saveLog(payload);
      loaderService.hide(id);
      toastService.success(
        "Saved",
        `${formatDisplayDate(fromDateStr(date))} logged.`,
      );
      setDirty(false);

      // Predictions may have shifted (e.g. a new period just started) —
      // fire-and-forget refresh so reminder notifications stay accurate
      // without needing to wait for the next app launch.
      notificationService.refreshScheduledNotifications();
    } catch {
      loaderService.hide(id);
      toastService.error("Could not save", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!log) return;
    const ok = await dialogueService.confirm({
      title: "Delete this log?",
      message: `Remove log for ${formatDisplayDate(fromDateStr(date))}?`,
      icon: "🗑️",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      destructive: true,
    });
    if (!ok) return;
    const id = loaderService.show({ label: "Deleting…", variant: "dots" });
    try {
      await logService.deleteLog(date);

      // Immediately reset all local UI state to defaults
      resetLogState();

      // Invalidate cached data so fresh query returns empty
      invalidateData();

      loaderService.hide(id);
      toastService.info("Log deleted");
    } catch {
      loaderService.hide(id);
      toastService.error("Could not delete");
    }
  };

  const TABS = [
    { value: "flow" as LogTab, label: "Flow" },
    { value: "symptoms" as LogTab, label: "Symptoms" },
    { value: "journal" as LogTab, label: "Journal" },
  ];

  const markDirty = () => setDirty(true);

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      {/* Header */}
      <StyledPage.Header
        title={formatDisplayDate(fromDateStr(date))}
        titleAlignment="center"
        marginHorizontal={16}
        shapeProps={{
          size: 48,
          backgroundColor: Colors.surface,
        }}
        backArrowProps={{ color: Colors.primary }}
        showBackArrow
        onBackPress={() => router.back()}
        backgroundColor={Colors.background}
        titleProps={{
          fontWeight: "700",
          color: Colors.textPrimary,
          fontFamily: "PlusJakartaSans_700Bold",
        }}
        rightIcon={
          log ? (
            <StyledPressable onPress={handleDelete} padding={8}>
              <VelaIcon name="trash" size={18} color={Colors.error} />
            </StyledPressable>
          ) : null
        }
      />
      <StyledSpacer marginVertical={4} />

      {/* Tab bar */}
      <Stack paddingHorizontal={20} paddingBottom={8}>
        <TabBar
          options={TABS}
          value={activeTab}
          onChange={(v) => setActiveTab(v)}
          indicator="line"
          showBorder={false}
          colors={{
            activeText: Colors.primary,
            indicator: Colors.primary,
            text: Colors.textTertiary,
            border: Colors.border,
            background: Colors.background,
          }}
        />
      </Stack>

      {/* Scrollable content */}
      <StyledScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 160,
          gap: 0,
        }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "flow" && (
          <FlowTab
            data={flowData}
            onChange={(d) => {
              // When flow status changes, clear discharge to avoid stale state
              // This ensures user consciously chooses discharge again after switching
              if (d.hasFlow !== flowData.hasFlow) {
                d = { ...d, discharge: null };
              }
              setFlowData(d);
              markDirty();
            }}
          />
        )}
        {activeTab === "symptoms" && (
          <SymptomsTab
            selected={symptoms}
            onChange={(v) => {
              setSymptoms(v);
              markDirty();
            }}
          />
        )}
        {activeTab === "journal" && (
          <JournalTab
            data={journalData}
            onChange={(d) => {
              setJournalData(d);
              markDirty();
            }}
          />
        )}
      </StyledScrollView>

      {/* Sticky save button */}
      <Stack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        marginHorizontal={16}
       
      >
        <StyledPressable
          onPress={handleSave}
          backgroundColor={Colors.primary}
          borderRadius={26}
          paddingVertical={16}
          paddingHorizontal={32}
          alignItems="center"
          flexDirection="row"
          justifyContent="center"
          gap={12}
        >
          <VelaIcon name="check-circle" size={20} color={Colors.textInverse} />
          <Text
            fontSize={16}
            fontWeight="800"
            color={Colors.textInverse}
            letterSpacing={0.2}
          >
            {saving ? "Saving…" : "Save"}
          </Text>
        </StyledPressable>
      </Stack>
    </StyledPage>
  );
}