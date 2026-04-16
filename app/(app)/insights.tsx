import React, { useMemo, useState } from "react";
import {
  Stack,
  StyledText,
  StyledScrollView,
  StyledPage,
  TabBar,
  StyledTimeline,
  type TimelineItem,
  theme
} from "fluent-styles";
import { useColors } from "../../src/hooks/useColors";
import { useCycles } from "../../src/hooks/useCycles";
import { usePrediction } from "../../src/hooks/usePrediction";
import { usePremium } from "../../src/hooks/usePremium";
import { CycleTrendsCard } from "../../src/components/insights/CycleTrendsCard";
import { CycleRhythmChart } from "../../src/components/insights/CycleRhythmChart";
import { CyclePhasePillBar } from "../../src/components/shared/CyclePhasePillBar";
import { PatternSummary } from "../../src/components/insights/PatternSummary";
import { PremiumGate } from "../../src/components/shared/PremiumGate";
import { VelaIcon } from "../../src/components/shared/VelaIcon";
import type { VelaIconName } from "../../src/components/shared/VelaIcon";
import { phaseName, phaseDescription } from "../../src/algorithm/prediction";
import {
  formatShortDate,
  parseISO,
  differenceInDays,
} from "../../src/utils/date";
import { format } from "date-fns";

const getCycleBadge = (cycleLength: number | null) => {
  if (!cycleLength) return null;
  if (cycleLength < 21)
    return { label: "Short", color: "#C97A7E", bg: "#FBEAEC" };
  if (cycleLength > 35)
    return { label: "Long", color: "#8B6E9C", bg: "#F4EEFA" };
  return { label: "Regular", color: "#6E8E7B", bg: "#EDF7F0" };
};

const CycleHistoryCard = ({ entry, Colors }: { entry: any; Colors: any }) => {
  const badge = getCycleBadge(entry.cycleLength);

  return (
    <Stack
      backgroundColor={Colors.surface}
      borderRadius={16}
      borderWidth={1}
      borderColor={Colors.border}
      padding={14}
      gap={10}
    >
      <Stack
        flexDirection="row"
        alignItems="flex-start"
        justifyContent="space-between"
        gap={8}
      >
        <Stack flex={1} gap={3}>
          <StyledText fontSize={15} fontWeight="800" color={Colors.textPrimary}>
            {entry.cycleLength
              ? `${entry.cycleLength} day cycle`
              : "Cycle logged"}
          </StyledText>

          <StyledText fontSize={12} color={Colors.textSecondary}>
            Started {format(entry.start, "MMM d, yyyy")}
          </StyledText>
        </Stack>

        {badge && (
          <Stack
            paddingHorizontal={10}
            paddingVertical={5}
            borderRadius={999}
            backgroundColor={badge.bg}
          >
            <StyledText fontSize={11} fontWeight="700" color={badge.color}>
              {badge.label}
            </StyledText>
          </Stack>
        )}
      </Stack>

      <Stack flexDirection="row" gap={8}>
        <Stack
          flex={1}
          backgroundColor={Colors.surfaceAlt}
          borderRadius={12}
          padding={10}
          gap={2}
        >
          <StyledText fontSize={18} fontWeight="800" color={Colors.primary}>
            {entry.cycleLength ?? "—"}
          </StyledText>
          <StyledText fontSize={11} color={Colors.textTertiary}>
            Cycle length
          </StyledText>
        </Stack>

        <Stack
          flex={1}
          backgroundColor={Colors.surfaceAlt}
          borderRadius={12}
          padding={10}
          gap={2}
        >
          <StyledText fontSize={18} fontWeight="800" color={Colors.textPrimary}>
            {entry.periodLength ?? "—"}
          </StyledText>
          <StyledText fontSize={11} color={Colors.textTertiary}>
            Period length
          </StyledText>
        </Stack>
      </Stack>
    </Stack>
  );
};

const ActiveCycleHistoryCard = ({
  entry,
  prediction,
  Colors,
}: {
  entry: any;
  prediction?: any;
  Colors: any;
}) => {
  return (
    <Stack
      backgroundColor={Colors.primaryFaint}
      borderRadius={18}
      borderWidth={1}
      borderColor={Colors.primary}
      padding={14}
      gap={12}
      overflow="hidden"
    >
      <Stack
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        gap={8}
      >
        <Stack flex={1} gap={3}>
          <StyledText fontSize={16} fontWeight="800" color={Colors.textPrimary}>
            Current cycle
          </StyledText>
          <StyledText fontSize={12} color={Colors.textSecondary}>
            Day {entry.currentDay} • Started {format(entry.start, "MMM d")}
          </StyledText>
        </Stack>

        <Stack
          backgroundColor={Colors.primary}
          borderRadius={999}
          paddingHorizontal={10}
          paddingVertical={5}
        >
          <StyledText fontSize={11} fontWeight="700" color={Colors.textInverse}>
            Active
          </StyledText>
        </Stack>
      </Stack>

      {prediction && (
        <Stack overflow="hidden" borderRadius={12}>
          <CyclePhasePillBar
            prediction={prediction}
            currentDay={prediction.currentCycleDay}
            compact
          />
        </Stack>
      )}

      <Stack flexDirection="row" gap={8}>
        <Stack
          flex={1}
          backgroundColor={Colors.surface}
          borderRadius={12}
          padding={10}
        >
          <StyledText fontSize={11} color={Colors.textTertiary}>
            Average cycle
          </StyledText>
          <StyledText fontSize={14} fontWeight="800" color={Colors.textPrimary}>
            {prediction?.averageCycleLength ?? "—"} days
          </StyledText>
        </Stack>

        <Stack
          flex={1}
          backgroundColor={Colors.surface}
          borderRadius={12}
          padding={10}
        >
          <StyledText fontSize={11} color={Colors.textTertiary}>
            Next period
          </StyledText>
          <StyledText fontSize={14} fontWeight="800" color={Colors.textPrimary}>
            {prediction?.nextPeriodStart
              ? format(prediction.nextPeriodStart, "MMM d")
              : "—"}
          </StyledText>
        </Stack>
      </Stack>
    </Stack>
  );
};

type InsightTab = "overview" | "cycles" | "patterns";

type CycleLike = {
  id: string | number;
  startDate: string;
  endDate?: string | null;
  cycleLength?: number | null;
  periodLength?: number | null;
  isActive?: number | boolean;
};

type HistoryEntry = {
  id: string;
  cycle: CycleLike;
  start: Date;
  monthKey: string;
  timeLabel: string;
  fullDate: string;
  cycleLength: number | null;
  periodLength: number | null;
  isActive: boolean;
  currentDay: number | null;
};

function positiveInt(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const n = Math.round(value);
  return n > 0 ? n : null;
}

function isSameCalendarDay(a: string, b: string) {
  return a.slice(0, 10) === b.slice(0, 10);
}

function cyclePriorityScore(cycle: CycleLike): number {
  let score = 0;
  if (cycle.isActive === 1 || cycle.isActive === true) score += 100;
  if (positiveInt(cycle.cycleLength)) score += 50;
  if (positiveInt(cycle.periodLength)) score += 20;
  if (cycle.endDate) score += 10;
  return score;
}

function dedupeCyclesByStartDate(cycles: CycleLike[]) {
  const byDate = new Map<string, CycleLike>();

  for (const cycle of cycles) {
    if (!cycle?.startDate) continue;

    const key = cycle.startDate.slice(0, 10);
    const existing = byDate.get(key);

    if (!existing || cyclePriorityScore(cycle) > cyclePriorityScore(existing)) {
      byDate.set(key, cycle);
    }
  }

  return Array.from(byDate.values());
}

function buildHistoryEntries(cycles: CycleLike[]): HistoryEntry[] {
  const cleaned = dedupeCyclesByStartDate(cycles)
    .filter((c) => !!c.startDate)
    .sort(
      (a, b) =>
        parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime(),
    );

  const entries: HistoryEntry[] = cleaned.map((cycle, index) => {
    const start = parseISO(cycle.startDate);
    const next = cleaned[index + 1];
    const isActive = cycle.isActive === 1 || cycle.isActive === true;

    let safeCycleLength: number | null = null;
    const rawCycleLength = positiveInt(cycle.cycleLength);

    if (isActive) {
      safeCycleLength = Math.max(differenceInDays(new Date(), start) + 1, 1);
    } else if (rawCycleLength) {
      safeCycleLength = rawCycleLength;
    } else if (
      next?.startDate &&
      !isSameCalendarDay(cycle.startDate, next.startDate)
    ) {
      const diff = differenceInDays(parseISO(next.startDate), start);
      safeCycleLength = diff > 0 ? diff : null;
    }

    const safePeriodLength = positiveInt(cycle.periodLength);

    return {
      id: String(cycle.id),
      cycle,
      start,
      monthKey: format(start, "MMMM yyyy"),
      timeLabel: format(start, "MMM d"),
      fullDate: format(start, "MMM d, yyyy"),
      cycleLength: safeCycleLength,
      periodLength: safePeriodLength,
      isActive,
      currentDay: isActive
        ? Math.max(differenceInDays(new Date(), start) + 1, 1)
        : null,
    };
  });

  return entries.sort((a, b) => b.start.getTime() - a.start.getTime());
}

function groupEntriesByMonth(entries: HistoryEntry[]) {
  const groups: { month: string; items: HistoryEntry[] }[] = [];

  for (const entry of entries) {
    const last = groups[groups.length - 1];
    if (!last || last.month !== entry.monthKey) {
      groups.push({ month: entry.monthKey, items: [entry] });
    } else {
      last.items.push(entry);
    }
  }

  return groups;
}

function getMotivationMessage(cycles: any[], prediction: any): string {
  if (!prediction || cycles.length < 2) return "";
  const lengths = cycles
    .filter((c) => c.cycleLength)
    .map((c: any) => c.cycleLength!);
  if (lengths.length < 2) return "";
  const range = Math.max(...lengths) - Math.min(...lengths);
  if (range <= 2)
    return "Excellent! Your menstrual rhythm is perfectly stable.";
  if (range <= 5) return "Your cycle is mostly regular. Keep tracking!";
  return "Your cycle shows some variation — this is common and normal.";
}

export default function InsightsScreen() {
  const Colors = useColors();
  const { cycles, loading } = useCycles();
  const prediction = usePrediction(cycles);
  const [tab, setTab] = useState<InsightTab>("overview");

  const safeDate = (d: Date | undefined) => {
    try {
      return d ? formatShortDate(d) : "—";
    } catch {
      return "—";
    }
  };

  const motivationMsg = getMotivationMessage(cycles, prediction);
  const activeCycle = cycles.find((c: any) => c.isActive === 1) ?? null;

  const historyGroups = useMemo(() => {
    const entries = buildHistoryEntries(cycles as CycleLike[]);
    return groupEntriesByMonth(entries);
  }, [cycles]);

  const TABS = [
    { value: "overview" as InsightTab, label: "Overview" },
    { value: "cycles" as InsightTab, label: "History" },
    { value: "patterns" as InsightTab, label: "Patterns" },
  ];

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      <StyledPage.Header
        marginHorizontal={32}
        title="Insights"
        titleAlignment="left"
        
        backgroundColor={Colors.background}
        titleProps={{
          fontSize: 22,
          fontWeight: "800",
          color: Colors.textPrimary,
        }}
      />

      <Stack  paddingBottom={4}>
        <TabBar
          options={TABS}
          value={tab}
          onChange={setTab}
          indicator="line"
          showBorder
          colors={{
            activeText: Colors.primary,
            indicator: Colors.primary,
            text: Colors.textTertiary,
            border: Colors.border,
            background: Colors.background,
          }}
        />
      </Stack>

      <StyledScrollView
        contentContainerStyle={{ padding: 20,  paddingBottom: 48, gap: 22 }}
        showsVerticalScrollIndicator={false}
      >
        {tab === "overview" && (
          <>
            <PremiumGate
              feature="Cycle Trends"
              description="AI-powered cycle analytics and trends"
            >
              {prediction ? (
                <CycleTrendsCard
                  prediction={prediction}
                  activeCycle={activeCycle}
                />
              ) : (
                <Stack
                  backgroundColor={Colors.primaryFaint}
                  borderRadius={20}
                  padding={24}
                  alignItems="center"
                  gap={10}
                  borderWidth={1}
                  borderColor={Colors.border}
                >
                  <VelaIcon name="flower" size={32} color={Colors.primary} />
                  <StyledText
                    fontSize={15}
                    fontWeight="700"
                    color={Colors.textPrimary}
                  >
                    Start tracking your cycle
                  </StyledText>
                  <StyledText
                    fontSize={13}
                    color={Colors.textSecondary}
                    textAlign="center"
                  >
                    Log your first period to see insights here.
                  </StyledText>
                </Stack>
              )}
            </PremiumGate>

            {prediction && (
              <Stack gap={12}>
                <StyledText
                  fontSize={12}
                  fontWeight="700"
                  color={Colors.textTertiary}
                  letterSpacing={0.5}
                  paddingHorizontal={4}
                >
                  CURRENT PHASE
                </StyledText>

                <Stack
                  backgroundColor={Colors.surface}
                  borderRadius={20}
                  padding={20}
                  gap={8}
                  shadowColor="#000"
                  shadowOffset={{ width: 0, height: 1 }}
                  shadowOpacity={0.05}
                  shadowRadius={8}
                  elevation={1}
                >
                  <StyledText
                    fontSize={20}
                    fontWeight="800"
                    color={Colors.primary}
                  >
                    {phaseName(prediction.currentPhase)}
                  </StyledText>
                  <StyledText
                    fontSize={14}
                    color={Colors.textSecondary}
                    lineHeight={21}
                  >
                    {phaseDescription(prediction.currentPhase)}
                  </StyledText>
                </Stack>
              </Stack>
            )}

            {prediction && (
              <Stack gap={12}>
                <StyledText
                  fontSize={12}
                  fontWeight="700"
                  color={Colors.textTertiary}
                  letterSpacing={0.5}
                  paddingHorizontal={4}
                >
                  UPCOMING EVENTS
                </StyledText>

                <Stack
                  backgroundColor={Colors.surface}
                  borderRadius={20}
                  padding={14}
                  gap={10}
                  shadowColor="#000"
                  shadowOffset={{ width: 0, height: 1 }}
                  shadowOpacity={0.04}
                  shadowRadius={6}
                  elevation={1}
                >
                  {[
                    {
                      icon: "phase-fertile" as VelaIconName,
                      label: "Fertile window",
                      date: `${safeDate(prediction.fertileWindowStart)} – ${safeDate(prediction.fertileWindowEnd)}`,
                      bg: Colors.fertileLight,
                      color: Colors.ovulation,
                    },
                    {
                      icon: "phase-ovulation" as VelaIconName,
                      label: "Ovulation",
                      date: safeDate(prediction.ovulationDay),
                      bg: Colors.ovulationLight,
                      color: Colors.ovulation,
                    },
                    {
                      icon: "phase-menstrual" as VelaIconName,
                      label: "Next period",
                      date: `${safeDate(prediction.nextPeriodStart)} · ±${prediction.confidenceDays}d`,
                      bg: Colors.primaryFaint,
                      color: Colors.primary,
                    },
                  ].map((item, idx) => (
                    <Stack key={item.label}>
                      <Stack
                        flexDirection="row"
                        alignItems="center"
                        gap={12}
                        padding={12}
                      >
                        <Stack
                          width={36}
                          height={36}
                          borderRadius={18}
                          backgroundColor={item.bg}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <VelaIcon
                            name={item.icon}
                            size={20}
                            color={item.color}
                          />
                        </Stack>
                        <Stack flex={1} gap={2}>
                          <StyledText
                            fontSize={14}
                            fontWeight="600"
                            color={Colors.textPrimary}
                          >
                            {item.label}
                          </StyledText>
                          <StyledText
                            fontSize={12}
                            color={item.color}
                            fontWeight="500"
                          >
                            {item.date}
                          </StyledText>
                        </Stack>
                      </Stack>
                      {idx < 2 && (
                        <Stack
                          height={1}
                          backgroundColor={Colors.border}
                          marginHorizontal={12}
                        />
                      )}
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            )}

            <PremiumGate
              feature="Cycle Rhythm Chart"
              description="Visualize your menstrual rhythm patterns over time"
            >
              <CycleRhythmChart cycles={cycles} />
            </PremiumGate>

            {motivationMsg && (
              <Stack
                backgroundColor={Colors.surface}
                borderRadius={20}
                padding={16}
                flexDirection="row"
                gap={12}
                alignItems="flex-start"
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 1 }}
                shadowOpacity={0.05}
                shadowRadius={8}
                elevation={1}
              >
                <Stack
                  width={40}
                  height={40}
                  borderRadius={20}
                  backgroundColor={Colors.successLight}
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <VelaIcon name="check-circle" size={20} color={Colors.success} />
                </Stack>
                <Stack flex={1} justifyContent="center" paddingVertical={2}>
                  <StyledText
                    fontSize={13}
                    fontWeight="600"
                    color={Colors.textPrimary}
                    lineHeight={20}
                  >
                    {motivationMsg}
                  </StyledText>
                </Stack>
              </Stack>
            )}
          </>
        )}

        {tab === "cycles" && (
          <>
            {/* <StyledText
              fontSize={12}
              fontWeight="700"
              color={Colors.textTertiary}
              letterSpacing={0.4}
              paddingHorizontal={4}
            >
              {historyGroups.reduce((sum, g) => sum + g.items.length, 0)} CYCLE
              {historyGroups.reduce((sum, g) => sum + g.items.length, 0) !== 1
                ? "S"
                : ""}{" "}
              TRACKED
            </StyledText> */}

            {historyGroups.length === 0 && (
              <Stack
                backgroundColor={Colors.surface}
                borderRadius={20}
                padding={32}
                alignItems="center"
                gap={12}
              >
                <VelaIcon
                  name="calendar"
                  size={32}
                  color={Colors.textTertiary}
                />
                <StyledText
                  fontSize={15}
                  color={Colors.textSecondary}
                  textAlign="center"
                >
                  No cycles logged yet.
                </StyledText>
              </Stack>
            )}

            {historyGroups.map((group) => {
              const timelineItems: TimelineItem[] = group.items.map(
                (entry) => ({
                  id: entry.id,
                  time: entry.timeLabel,
                  title: entry.isActive
                    ? "Current cycle"
                    : `${entry.cycleLength ?? "—"} day cycle`,
                  subtitle: entry.isActive
                    ? `Day ${entry.currentDay} • Started ${format(entry.start, "MMM d")}`
                    : `Started ${format(entry.start, "MMM d")}${entry.periodLength ? ` • Period ${entry.periodLength} days` : ""}`,
                  meta: entry,
                }),
              );

              return (
                <Stack key={group.month} gap={12} marginHorizontal={8}>
                  <StyledText
                    fontSize={14}
                    fontWeight={theme.fontWeight.semiBold}
                    color={theme.colors.gray[600]}
                  >
                    {group.month}
                  </StyledText>

                  <StyledTimeline
                    items={timelineItems}
                    variant="default"
                    dotShape="filled"
                    dotSize={15}
                    timeColumnWidth={58}
                    timeGap={6}
                    animated
                    fonts={{
                      startFontSize : theme.fontSize.small,
                      endFontSize : theme.fontSize.small,
                      startFontWeight : theme.fontWeight.normal,
                      endFontWeight : theme.fontWeight.normal
                    }}
                    colors={{
                      dot: Colors.primary,
                      line: Colors.border,
                      dotBorder: Colors.surface,
                      endTimeText: theme.colors.gray[400],
                      timeText: theme.colors.rose[400],
                    }}
                    renderItem={(item: TimelineItem) => {
                      const entry = item.meta as HistoryEntry;

                      if (entry.isActive) {
                        return (
                          <ActiveCycleHistoryCard
                            entry={entry}
                            prediction={prediction}
                            Colors={Colors}
                          />
                        );
                      }

                      return <CycleHistoryCard entry={entry} Colors={Colors} />;
                    }}
                  />
                </Stack>
              );
            })}
          </>
        )}

        {tab === "patterns" && (
          <>
            <PremiumGate
              feature="Pattern Analysis"
              description="Deep insights into your menstrual patterns and trends"
            >
              <PatternSummary cycles={cycles} />
            </PremiumGate>

            <Stack gap={12}>
              <StyledText
                fontSize={13}
                fontWeight="600"
                color={Colors.textSecondary}
              >
                Symptom insights
              </StyledText>

              <Stack
                backgroundColor={Colors.primaryFaint}
                borderRadius={20}
                padding={16}
                alignItems="center"
                gap={10}
                borderWidth={1}
                borderColor={Colors.border}
              >
                <Stack
                  width={48}
                  height={48}
                  borderRadius={24}
                  backgroundColor={Colors.surface}
                  alignItems="center"
                  justifyContent="center"
                >
                  <VelaIcon name="activity" size={24} color={Colors.primary} />
                </Stack>
                <Stack alignItems="center" gap={6}>
                  <StyledText
                    fontSize={15}
                    fontWeight="600"
                    color={Colors.textPrimary}
                    textAlign="center"
                  >
                    Log more cycles to unlock
                  </StyledText>
                  <StyledText
                    fontSize={12}
                    color={Colors.textSecondary}
                    textAlign="center"
                    lineHeight={17}
                  >
                    Symptom patterns appear after a few more cycles.
                  </StyledText>
                </Stack>
              </Stack>
            </Stack>
          </>
        )}
      </StyledScrollView>
    </StyledPage>
  );
}
