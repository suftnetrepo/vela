import React, { useMemo, useState } from "react";
import { Dimensions, KeyboardAvoidingView, Platform } from "react-native";
import {
  Stack,
  StyledScrollView,
  StyledPage,
  StyledPressable,
  StyledTextInput,
  TabBar,
  StyledInput,
} from "fluent-styles";
import { Text } from "@/components/text";
import Svg, {
  Path,
  Circle,
  Line,
  Rect,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { useColors } from "../../src/hooks/useColors";
import { useTracker, type TrackerDataPoint } from "../../src/hooks/useTracker";
import { useCycles } from "../../src/hooks/useCycles";
import { usePrediction } from "../../src/hooks/usePrediction";
import { VelaIcon } from "../../src/components/shared/VelaIcon";
import { useSettingsStore } from "../../src/stores/settings.store";
import {
  validateDisplayMeasurement,
  getMeasurementErrorMessageDisplay,
  toDisplayValue,
  getDisplayRange,
} from "../../src/constants/tracker";
import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfDay,
} from "date-fns";
import { loaderService, toastService } from "fluent-styles";

const SCREEN_W = Dimensions.get("window").width;
const CARD_INSET = 40;
const CHART_W = Math.max(280, SCREEN_W - CARD_INSET - 32);

type TrackerTab = "weight" | "temperature" | "notes";

function cardShadow() {
  return {
    shadowColor: "#4C1D33",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.045,
    shadowRadius: 14,
    elevation: 1,
  } as const;
}

function formatReadingDate(date: string) {
  return format(parseISO(date), "MMM d, yyyy");
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// Screen readers should hear "kilograms", not the bare "kg" symbol — the
// unit strings tracker.tsx receives are abbreviations meant for sighted
// display only, so spell them out for accessibilityLabel use.
function spellUnit(unit: string): string {
  switch (unit) {
    case "kg": return "kilograms";
    case "lbs": return "pounds";
    case "°C": return "degrees Celsius";
    case "°F": return "degrees Fahrenheit";
    default: return unit;
  }
}

// ─── Premium measurement hero ────────────────────────────────────────────────
function MeasurementHero({
  kind,
  title,
  value,
  unit,
  placeholder,
  hint,
  onSave,
}: {
  kind: "weight" | "temperature";
  title: string;
  value: string;
  unit: string;
  placeholder: string;
  hint: string;
  onSave: (raw: string) => Promise<void> | void;
}) {
  const Colors = useColors();
  const [editing, setEditing] = useState(!value);
  const [input, setInput] = useState(value);

  React.useEffect(() => {
    setInput(value);
    if (value) setEditing(false);
  }, [value]);

  const handleSave = async () => {
    await onSave(input);
    setEditing(false);
  };

  return (
    <Stack
      backgroundColor={Colors.surface}
      borderRadius={22}
      padding={18}
      gap={16}
      borderWidth={1}
      borderColor={Colors.border}
      overflow="hidden"
      {...cardShadow()}
    >
      <Stack position="absolute" right={-26} top={-34} opacity={0.38}>
        <Svg width={150} height={135} viewBox="0 0 150 135">
          <Circle cx="112" cy="34" r="58" fill={Colors.primaryFaint} />
          <Circle cx="136" cy="93" r="34" fill={Colors.primaryFaint} />
        </Svg>
      </Stack>

      <Stack flexDirection="row" alignItems="flex-start" justifyContent="space-between" gap={12}>
        <Stack flexDirection="row" alignItems="center" gap={12} flex={1}>
          <Stack
            width={50}
            height={50}
            borderRadius={25}
            backgroundColor={Colors.primaryFaint}
            borderWidth={1}
            borderColor={Colors.border}
            alignItems="center"
            justifyContent="center"
          >
            <VelaIcon name={kind === "weight" ? "weight" : "thermometer"} size={24} color={Colors.primary} />
          </Stack>
          <Stack gap={2} flex={1}>
            <Text fontSize={kind === "temperature" ? 16 : 17} fontWeight="800" color={Colors.textPrimary} lineHeight={kind === "temperature" ? 21 : undefined}>{kind === "temperature" ? "Basal Body\nTemperature" : title}</Text>
            <Text fontSize={12} color={Colors.textTertiary}>Today</Text>
            <Stack flexDirection="row" alignItems="baseline" gap={6} marginTop={3}>
              <Text fontSize={34} fontWeight="800" color={value ? Colors.primary : Colors.textTertiary}>
                {value || "—"}
              </Text>
              <Text fontSize={14} fontWeight="600" color={Colors.textSecondary}>{unit}</Text>
            </Stack>
          </Stack>
        </Stack>

        {!editing && (
          <StyledPressable
            onPress={() => setEditing(true)}
            backgroundColor={Colors.primary}
            borderRadius={14}
            paddingHorizontal={kind === "temperature" ? 11 : 14}
            paddingVertical={11}
            minHeight={44}
            flexDirection="row"
            gap={6}
            alignItems="center"
            accessibilityRole="button"
            accessibilityLabel={`Log ${kind === "weight" ? "weight" : "temperature"}`}
          >
            <VelaIcon name="plus" size={15} color={Colors.textInverse} />
            <Text fontSize={kind === "temperature" ? 11 : 12} fontWeight="700" color={Colors.textInverse} numberOfLines={1}>
              Log {kind === "weight" ? "weight" : "temperature"}
            </Text>
          </StyledPressable>
        )}
      </Stack>

      {editing && (
        <Stack flexDirection="row" alignItems="center" gap={10}>
          <Stack flex={1}>
            <StyledInput
              variant="filled"
              value={input}
              onChangeText={setInput}
              keyboardType="decimal-pad"
              placeholder={placeholder}
              placeholderTextColor={Colors.textTertiary}
              focusColor={Colors.primary}
              backgroundColor={Colors.inputBackground}
              color={Colors.textPrimary}
              padding={12}
              accessibilityLabel={`${kind === "weight" ? "Weight" : "Temperature"} in ${spellUnit(unit)}`}
              returnKeyType="done"
            />
          </Stack>
          <Stack
            borderRadius={12}
            backgroundColor={Colors.inputBackground}
            borderWidth={1}
            borderColor={Colors.border}
            paddingHorizontal={12}
            paddingVertical={12}
          >
            <Text fontSize={12} fontWeight="700" color={Colors.textSecondary}>{unit}</Text>
          </Stack>
          <StyledPressable
            onPress={handleSave}
            backgroundColor={Colors.primary}
            width={46}
            height={46}
            borderRadius={14}
            alignItems="center"
            justifyContent="center"
            accessibilityRole="button"
            accessibilityLabel={`Save ${kind === "weight" ? "weight" : "temperature"}`}
          >
            <VelaIcon name="check" size={19} color={Colors.textInverse} />
          </StyledPressable>
        </Stack>
      )}

      <Stack
        flexDirection="row"
        alignItems="center"
        gap={9}
        borderRadius={13}
        backgroundColor={Colors.primaryFaint}
        paddingHorizontal={12}
        paddingVertical={10}
      >
        <VelaIcon name="premium" size={15} color={Colors.primary} />
        <Text fontSize={11.5} color={Colors.textSecondary} lineHeight={17} flex={1}>{hint}</Text>
      </Stack>
    </Stack>
  );
}

// ─── Weight trend chart ──────────────────────────────────────────────────────
function WeightTrendChart({ data, unit }: { data: TrackerDataPoint[]; unit: string }) {
  const Colors = useColors();
  if (data.length < 2) return null;

  const recent = data.slice(-30);
  const values = recent.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const paddingY = Math.max(0.6, (max - min) * 0.25);
  const minY = Math.floor((min - paddingY) * 2) / 2;
  const maxY = Math.ceil((max + paddingY) * 2) / 2;
  const chartH = 220;
  const left = 38;
  const right = 18;
  const top = 18;
  const bottom = 36;
  const plotW = CHART_W - left - right;
  const plotH = chartH - top - bottom;
  const range = maxY - minY || 1;

  const pts = recent.map((d, i) => ({
    x: left + (i / Math.max(1, recent.length - 1)) * plotW,
    y: top + (1 - (d.value - minY) / range) * plotH,
    ...d,
  }));
  const path = pts.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
  const fill = `${path} L ${pts[pts.length - 1].x} ${top + plotH} L ${pts[0].x} ${top + plotH} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => minY + (maxY - minY) * f);
  const xLabelIdx = Array.from(new Set([0, Math.floor((recent.length - 1) / 2), recent.length - 1]));

  return (
    <Svg width={CHART_W} height={chartH}>
      <Defs>
        <LinearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={Colors.primary} stopOpacity="0.18" />
          <Stop offset="1" stopColor={Colors.primary} stopOpacity="0.015" />
        </LinearGradient>
      </Defs>
      {ticks.map((tick, i) => {
        const y = top + (1 - (tick - minY) / range) * plotH;
        return (
          <React.Fragment key={i}>
            <Line x1={left} y1={y} x2={CHART_W - right} y2={y} stroke={Colors.border} strokeWidth={1} strokeDasharray="4 5" />
            <SvgText x={left - 8} y={y + 4} fontSize={9} fill={Colors.textTertiary} textAnchor="end">{tick.toFixed(1)}</SvgText>
          </React.Fragment>
        );
      })}
      <Path d={fill} fill="url(#weightFill)" />
      <Path d={path} fill="none" stroke={Colors.primary} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <Circle key={p.date} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 4.8 : 3.4} fill={Colors.surface} stroke={Colors.primary} strokeWidth={i === pts.length - 1 ? 2.3 : 1.7} />
      ))}
      {xLabelIdx.map((idx) => (
        <SvgText key={idx} x={pts[idx].x} y={chartH - 8} fontSize={9} fill={Colors.textTertiary} textAnchor={idx === 0 ? "start" : idx === recent.length - 1 ? "end" : "middle"}>
          {format(parseISO(recent[idx].date), "MMM d")}
        </SvgText>
      ))}
      <Rect x={CHART_W - right - 47} y={pts[pts.length - 1].y - 13} width={47} height={24} rx={8} fill={Colors.primary} />
      <SvgText x={CHART_W - right - 23.5} y={pts[pts.length - 1].y + 3} fontSize={10} fontWeight="700" fill={Colors.textInverse} textAnchor="middle">
        {values[values.length - 1].toFixed(1)}
      </SvgText>
      <SvgText x={left - 4} y={12} fontSize={9} fill={Colors.textTertiary}>{unit}</SvgText>
    </Svg>
  );
}

// ─── BBT chart with cycle context ────────────────────────────────────────────
function BBTTrendChart({
  data,
  unit,
  periodStart,
  periodEnd,
  fertileStart,
  fertileEnd,
  ovulationDate,
}: {
  data: TrackerDataPoint[];
  unit: string;
  periodStart?: Date | null;
  periodEnd?: Date | null;
  fertileStart?: Date | null;
  fertileEnd?: Date | null;
  ovulationDate?: Date | null;
}) {
  const Colors = useColors();
  if (data.length < 2) return null;

  const recent = data.slice(-36);
  const firstDate = startOfDay(parseISO(recent[0].date));
  const lastDate = startOfDay(parseISO(recent[recent.length - 1].date));
  const totalDays = Math.max(1, differenceInCalendarDays(lastDate, firstDate));
  const values = recent.map((d) => d.value);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values, avg);
  const max = Math.max(...values, avg);
  const pad = Math.max(unit === "°F" ? 0.5 : 0.25, (max - min) * 0.35);
  const minY = min - pad;
  const maxY = max + pad;
  const chartH = 270;
  const left = 42;
  const right = 18;
  const top = 42;
  const bottom = 42;
  const plotW = CHART_W - left - right;
  const plotH = chartH - top - bottom;
  const range = maxY - minY || 1;

  const xForDate = (d: Date) => left + clamp(differenceInCalendarDays(startOfDay(d), firstDate) / totalDays, 0, 1) * plotW;
  const yFor = (v: number) => top + (1 - (v - minY) / range) * plotH;
  const pts = recent.map((d) => ({ ...d, x: xForDate(parseISO(d.date)), y: yFor(d.value) }));
  const avgY = yFor(avg);

  const ovX = ovulationDate ? xForDate(ovulationDate) : null;
  const before = pts.filter((p) => !ovulationDate || parseISO(p.date) <= ovulationDate);
  const after = pts.filter((p) => !ovulationDate || parseISO(p.date) >= ovulationDate);
  const pathFor = (arr: typeof pts) => arr.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
  const tickValues = [0, 0.25, 0.5, 0.75, 1].map((f) => minY + (maxY - minY) * f);
  const labelIdx = Array.from(new Set([0, Math.floor((recent.length - 1) / 2), recent.length - 1]));

  const zoneRect = (start?: Date | null, end?: Date | null) => {
    if (!start || !end) return null;
    const s = startOfDay(start);
    const e = startOfDay(end);
    if (e < firstDate || s > lastDate) return null;
    const x1 = xForDate(s < firstDate ? firstDate : s);
    const x2 = xForDate(e > lastDate ? lastDate : e);
    return { x: x1, width: Math.max(4, x2 - x1) };
  };
  const periodZone = zoneRect(periodStart, periodEnd);
  const fertileZone = zoneRect(fertileStart, fertileEnd);

  return (
    <Svg width={CHART_W} height={chartH}>
      {periodZone && <Rect x={periodZone.x} y={top} width={periodZone.width} height={plotH} fill={Colors.primaryFaint} opacity={0.7} rx={6} />}
      {fertileZone && <Rect x={fertileZone.x} y={top} width={fertileZone.width} height={plotH} fill={Colors.success} opacity={0.08} rx={6} />}
      {tickValues.map((tick, i) => {
        const y = yFor(tick);
        return (
          <React.Fragment key={i}>
            <Line x1={left} y1={y} x2={CHART_W - right} y2={y} stroke={Colors.border} strokeWidth={1} strokeDasharray="4 5" />
            <SvgText x={left - 8} y={y + 4} fontSize={9} fill={Colors.textTertiary} textAnchor="end">{tick.toFixed(1)}</SvgText>
          </React.Fragment>
        );
      })}
      <Line x1={left} y1={avgY} x2={CHART_W - right} y2={avgY} stroke={Colors.primary} strokeWidth={1.5} strokeDasharray="5 5" opacity={0.75} />
      {ovX != null && ovulationDate && ovulationDate >= firstDate && ovulationDate <= lastDate && (
        <>
          <Line x1={ovX} y1={top - 10} x2={ovX} y2={top + plotH} stroke={Colors.success} strokeWidth={1.5} />
          <Circle cx={ovX} cy={top + plotH} r={4} fill={Colors.surface} stroke={Colors.success} strokeWidth={2} />
        </>
      )}
      {before.length >= 2 && <Path d={pathFor(before)} fill="none" stroke={Colors.primary} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />}
      {after.length >= 2 && <Path d={pathFor(after)} fill="none" stroke={Colors.success} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />}
      {pts.map((p) => {
        const postOv = ovulationDate ? parseISO(p.date) >= ovulationDate : false;
        return <Circle key={p.date} cx={p.x} cy={p.y} r={3.6} fill={Colors.surface} stroke={postOv ? Colors.success : Colors.primary} strokeWidth={1.7} />;
      })}
      {labelIdx.map((idx) => (
        <SvgText key={idx} x={pts[idx].x} y={chartH - 12} fontSize={9} fill={Colors.textTertiary} textAnchor={idx === 0 ? "start" : idx === recent.length - 1 ? "end" : "middle"}>
          {format(parseISO(recent[idx].date), "MMM d")}
        </SvgText>
      ))}
      <SvgText x={left - 4} y={16} fontSize={9} fill={Colors.textTertiary}>{unit}</SvgText>
      {ovX != null && ovulationDate && ovulationDate >= firstDate && ovulationDate <= lastDate && (
        <SvgText x={ovX} y={top - 18} fontSize={9} fontWeight="700" fill={Colors.success} textAnchor="middle">Ovulation</SvgText>
      )}
      <Rect x={CHART_W - right - 49} y={pts[pts.length - 1].y - 12} width={49} height={23} rx={8} fill={Colors.success} />
      <SvgText x={CHART_W - right - 24.5} y={pts[pts.length - 1].y + 3} fontSize={10} fontWeight="700" fill={Colors.textInverse} textAnchor="middle">{values[values.length - 1].toFixed(1)}</SvgText>
    </Svg>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  const Colors = useColors();
  return (
    <Stack flex={1} backgroundColor={Colors.inputBackground} borderRadius={14} padding={12} gap={5} borderWidth={1} borderColor={Colors.border}>
      <Text fontSize={10.5} color={Colors.textTertiary}>{label}</Text>
      <Text fontSize={17} fontWeight="800" color={accent ?? Colors.textPrimary}>{value}</Text>
    </Stack>
  );
}

function RecentReadings({
  title,
  data,
  unit,
}: {
  title: string;
  data: TrackerDataPoint[];
  unit: string;
}) {
  const Colors = useColors();
  const rows = [...data].slice(-3).reverse();
  if (!rows.length) return null;
  return (
    <Stack backgroundColor={Colors.surface} borderRadius={20} borderWidth={1} borderColor={Colors.border} overflow="hidden" {...cardShadow()}>
      <Stack paddingHorizontal={16} paddingVertical={15} flexDirection="row" alignItems="center" justifyContent="space-between">
        <Text fontSize={16} fontWeight="800" color={Colors.textPrimary}>{title}</Text>
        <Text fontSize={12} fontWeight="700" color={Colors.primary}>Recent 60 days</Text>
      </Stack>
      {rows.map((item, idx) => (
        <Stack
          key={item.date}
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal={16}
          paddingVertical={14}
          borderTopWidth={idx === 0 ? 0 : 1}
          borderTopColor={Colors.border}
        >
          <Stack flexDirection="row" alignItems="center" gap={10}>
            <Stack width={34} height={34} borderRadius={17} backgroundColor={Colors.primaryFaint} alignItems="center" justifyContent="center">
              <VelaIcon name="calendar" size={15} color={Colors.primary} />
            </Stack>
            <Text fontSize={13} fontWeight="700" color={Colors.textPrimary}>{formatReadingDate(item.date)}</Text>
          </Stack>
          <Stack flexDirection="row" alignItems="center" gap={8}>
            <Text fontSize={15} fontWeight="800" color={Colors.textPrimary}>{item.value.toFixed(1)} {unit}</Text>
            <VelaIcon name="chevron-right" size={15} color={Colors.textTertiary} />
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}

export default function TrackerScreen() {
  const Colors = useColors();
  const tracker = useTracker();
  const { cycles, active } = useCycles();
  const prediction = usePrediction(cycles);
  const [tab, setTab] = useState<TrackerTab>("weight");
  const [notes, setNotes] = useState("");
  const [noteDirty, setNoteDirty] = useState(false);
  const weightUnit = useSettingsStore((s) => s.weightUnit);
  const tempUnit = useSettingsStore((s) => s.tempUnit);

  React.useEffect(() => {
    setNotes(tracker.todayLog?.notes ?? "");
    setNoteDirty(false);
  }, [tracker.todayLog?.notes]);

  const handleSaveWeight = async (raw: string) => {
    const canonicalKg = validateDisplayMeasurement(raw, "weight", weightUnit, tempUnit);
    if (canonicalKg === null || canonicalKg <= 0) {
      toastService.error(getMeasurementErrorMessageDisplay("weight", weightUnit, tempUnit));
      return;
    }
    const id = loaderService.show({ variant: "dots", label: "Saving…" });
    try {
      await tracker.saveWeight(canonicalKg);
      toastService.success("Weight saved");
    } catch {
      toastService.error("Could not save");
    } finally {
      loaderService.hide(id);
    }
  };

  const handleSaveTemp = async (raw: string) => {
    const canonical = validateDisplayMeasurement(raw, "temperature", weightUnit, tempUnit);
    if (canonical === null) {
      toastService.error(getMeasurementErrorMessageDisplay("temperature", weightUnit, tempUnit));
      return;
    }
    const id = loaderService.show({ variant: "dots", label: "Saving…" });
    try {
      await tracker.saveTemperature(canonical);
      toastService.success("Temperature saved");
    } catch {
      toastService.error("Could not save");
    } finally {
      loaderService.hide(id);
    }
  };

  const handleSaveNotes = async () => {
    const id = loaderService.show({ variant: "dots", label: "Saving…" });
    try {
      await tracker.saveNotes(notes);
      setNoteDirty(false);
      toastService.success("Notes saved");
    } catch {
      toastService.error("Could not save");
    } finally {
      loaderService.hide(id);
    }
  };

  const weightUnitLabel = getDisplayRange("weight", weightUnit, tempUnit).unit;
  const tempUnitLabel = getDisplayRange("temperature", weightUnit, tempUnit).unit;
  const weightDisplayData = useMemo(() => tracker.weightData.map((d) => ({
    date: d.date,
    value: Math.round(toDisplayValue(d.value, "weight", weightUnit, tempUnit) * 10) / 10,
  })), [tracker.weightData, weightUnit, tempUnit]);
  const tempDisplayData = useMemo(() => tracker.tempData.map((d) => ({
    date: d.date,
    value: Math.round(toDisplayValue(d.value, "temperature", weightUnit, tempUnit) * 10) / 10,
  })), [tracker.tempData, weightUnit, tempUnit]);

  const currentCycleTempData = useMemo(() => {
    const start = active?.startDate ?? (cycles.length ? cycles[cycles.length - 1]?.startDate : undefined);
    if (!start) return tempDisplayData;
    const filtered = tempDisplayData.filter((d) => d.date >= start);
    return filtered.length ? filtered : tempDisplayData;
  }, [tempDisplayData, active?.startDate, cycles]);

  const weightStats = useMemo(() => {
    if (!weightDisplayData.length) return null;
    const latest = weightDisplayData[weightDisplayData.length - 1];
    const cutoff = addDays(parseISO(latest.date), -30);
    const thirty = weightDisplayData.filter((d) => parseISO(d.date) >= cutoff);
    const baseline = thirty[0] ?? latest;
    const lowest = weightDisplayData.reduce((a, b) => (b.value < a.value ? b : a));
    return {
      current: latest.value,
      change: latest.value - baseline.value,
      lowest,
    };
  }, [weightDisplayData]);

  const tempStats = useMemo(() => {
    if (!currentCycleTempData.length) return null;
    const values = currentCycleTempData.map((d) => d.value);
    return {
      current: values[values.length - 1],
      average: values.reduce((a, b) => a + b, 0) / values.length,
    };
  }, [currentCycleTempData]);

  const lastCycle = cycles.length ? cycles[cycles.length - 1] : null;
  const periodStart = active?.startDate ? parseISO(active.startDate) : lastCycle?.startDate ? parseISO(lastCycle.startDate) : null;
  const periodLength = active?.periodLength ?? prediction?.averagePeriodLength ?? 5;
  const periodEnd = periodStart ? addDays(periodStart, Math.max(0, periodLength - 1)) : null;

  const TABS = [
    { value: "weight" as TrackerTab, label: "Weight" },
    { value: "temperature" as TrackerTab, label: "Temperature" },
    { value: "notes" as TrackerTab, label: "Notes" },
  ];

  return (
    <StyledPage showStatusBar backgroundColor={Colors.background}>
      <StyledPage.Header
        marginHorizontal={32}
        title="Tracker"
        titleAlignment="left"
        backgroundColor={Colors.background}
        titleProps={{
          fontSize: 22,
          fontWeight: "800",
          color: Colors.textPrimary,
          fontFamily: "PlusJakartaSans_700Bold",
        }}
      />

      <Stack paddingHorizontal={20} paddingBottom={4}>
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
      <StyledScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 64, gap: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {tab === "weight" && (
          <>
            <MeasurementHero
              kind="weight"
              title="Weight"
              value={tracker.todayLog?.weight != null ? toDisplayValue(tracker.todayLog.weight, "weight", weightUnit, tempUnit).toFixed(1) : ""}
              unit={weightUnitLabel}
              placeholder={weightUnit === "lbs" ? "e.g. 137.8" : "e.g. 62.5"}
              hint="Log your weight at a similar time of day for more consistent trends."
              onSave={handleSaveWeight}
            />

            {weightStats ? (
              <>
                <Stack backgroundColor={Colors.surface} borderRadius={22} padding={16} gap={16} borderWidth={1} borderColor={Colors.border} {...cardShadow()}>
                  <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
                    <Text fontSize={17} fontWeight="800" color={Colors.textPrimary}>Your weight trend</Text>
                    <Stack backgroundColor={Colors.inputBackground} borderRadius={11} borderWidth={1} borderColor={Colors.border} paddingHorizontal={10} paddingVertical={7}>
                      <Text fontSize={11} fontWeight="700" color={Colors.textSecondary}>30 days</Text>
                    </Stack>
                  </Stack>
                  <Stack flexDirection="row" gap={8}>
                    <StatCard label="Current" value={`${weightStats.current.toFixed(1)} ${weightUnitLabel}`} accent={Colors.primary} />
                    <StatCard
                      label="30-day change"
                      value={`${weightStats.change > 0 ? "+" : ""}${weightStats.change.toFixed(1)} ${weightUnitLabel}`}
                      accent={weightStats.change <= 0 ? Colors.success : Colors.warning}
                    />
                    <StatCard label="Lowest" value={`${weightStats.lowest.value.toFixed(1)} ${weightUnitLabel}`} />
                  </Stack>
                  {weightDisplayData.length >= 2 ? (
                    <Stack alignItems="center"><WeightTrendChart data={weightDisplayData} unit={weightUnitLabel} /></Stack>
                  ) : (
                    <Text fontSize={12} color={Colors.textTertiary}>Add one more reading to start your trend.</Text>
                  )}
                </Stack>
                <RecentReadings title="Recent readings" data={weightDisplayData} unit={weightUnitLabel} />
              </>
            ) : (
              <Stack backgroundColor={Colors.surface} borderRadius={20} padding={24} alignItems="center" gap={10} borderWidth={1} borderColor={Colors.border} {...cardShadow()}>
                <Stack width={52} height={52} borderRadius={26} backgroundColor={Colors.primaryFaint} alignItems="center" justifyContent="center">
                  <VelaIcon name="weight" size={24} color={Colors.primary} />
                </Stack>
                <Text fontSize={15} fontWeight="800" color={Colors.textPrimary}>Your weight trend starts here</Text>
                <Text fontSize={12} color={Colors.textTertiary} textAlign="center" lineHeight={18}>Your readings will appear as a trend after you log them.</Text>
              </Stack>
            )}
          </>
        )}

        {tab === "temperature" && (
          <>
            <MeasurementHero
              kind="temperature"
              title="Basal Body Temperature"
              value={tracker.todayLog?.temperature != null ? toDisplayValue(tracker.todayLog.temperature, "temperature", weightUnit, tempUnit).toFixed(1) : ""}
              unit={tempUnitLabel}
              placeholder={tempUnit === "fahrenheit" ? "e.g. 98.2" : "e.g. 36.8"}
              hint="Take your temperature before getting up, at roughly the same time each morning."
              onSave={handleSaveTemp}
            />

            {tempStats ? (
              <>
                <Stack backgroundColor={Colors.surface} borderRadius={22} padding={16} gap={15} borderWidth={1} borderColor={Colors.border} {...cardShadow()}>
                  <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
                    <Text fontSize={17} fontWeight="800" color={Colors.textPrimary}>Your BBT trend</Text>
                    <Stack backgroundColor={Colors.inputBackground} borderRadius={11} borderWidth={1} borderColor={Colors.border} paddingHorizontal={10} paddingVertical={7}>
                      <Text fontSize={11} fontWeight="700" color={Colors.textSecondary}>Current cycle</Text>
                    </Stack>
                  </Stack>

                  <Stack flexDirection="row" gap={8}>
                    <StatCard label="Today" value={`${tempStats.current.toFixed(1)} ${tempUnitLabel}`} accent={Colors.primary} />
                    <StatCard label="Cycle average" value={`${tempStats.average.toFixed(1)} ${tempUnitLabel}`} />
                    <StatCard label="Ovulation" value={prediction ? format(prediction.ovulationDay, "MMM d") : "—"} accent={Colors.success} />
                  </Stack>

                  <Stack flexDirection="row" flexWrap="wrap" gap={12} alignItems="center">
                    <Stack flexDirection="row" alignItems="center" gap={5}><Stack width={10} height={10} borderRadius={3} backgroundColor={Colors.primaryFaint} /><Text fontSize={10.5} color={Colors.textSecondary}>Period</Text></Stack>
                    <Stack flexDirection="row" alignItems="center" gap={5}><Stack width={10} height={10} borderRadius={3} backgroundColor={Colors.success} opacity={0.15} /><Text fontSize={10.5} color={Colors.textSecondary}>Fertile window</Text></Stack>
                    <Stack flexDirection="row" alignItems="center" gap={5}><Stack width={2} height={14} backgroundColor={Colors.success} /><Text fontSize={10.5} color={Colors.textSecondary}>Ovulation</Text></Stack>
                  </Stack>

                  {currentCycleTempData.length >= 2 ? (
                    <Stack alignItems="center">
                      <BBTTrendChart
                        data={currentCycleTempData}
                        unit={tempUnitLabel}
                        periodStart={periodStart}
                        periodEnd={periodEnd}
                        fertileStart={prediction?.fertileWindowStart ?? null}
                        fertileEnd={prediction?.fertileWindowEnd ?? null}
                        ovulationDate={prediction?.ovulationDay ?? null}
                      />
                    </Stack>
                  ) : (
                    <Stack paddingVertical={24} alignItems="center" gap={8}>
                      <VelaIcon name="thermometer" size={28} color={Colors.primary} />
                      <Text fontSize={13} fontWeight="700" color={Colors.textPrimary}>One more reading unlocks your BBT trend</Text>
                    </Stack>
                  )}

                  <Stack flexDirection="row" alignItems="center" gap={8} backgroundColor={Colors.success} opacity={0.88} borderRadius={13} paddingHorizontal={12} paddingVertical={10}>
                    <VelaIcon name="leaf" size={14} color={Colors.textInverse} />
                    <Text fontSize={11} color={Colors.textInverse} flex={1} lineHeight={16}>BBT patterns can support cycle awareness, but individual readings are not a diagnosis.</Text>
                  </Stack>
                </Stack>
                <RecentReadings title="Recent readings" data={tempDisplayData} unit={tempUnitLabel} />
              </>
            ) : (
              <Stack backgroundColor={Colors.surface} borderRadius={20} padding={24} alignItems="center" gap={10} borderWidth={1} borderColor={Colors.border} {...cardShadow()}>
                <Stack width={52} height={52} borderRadius={26} backgroundColor={Colors.primaryFaint} alignItems="center" justifyContent="center"><VelaIcon name="thermometer" size={24} color={Colors.primary} /></Stack>
                <Text fontSize={15} fontWeight="800" color={Colors.textPrimary}>Start your BBT trend</Text>
                <Text fontSize={12} color={Colors.textTertiary} textAlign="center" lineHeight={18}>Log BBT consistently to see patterns across your cycle.</Text>
              </Stack>
            )}
          </>
        )}

        {tab === "notes" && (
          <>
            <Stack backgroundColor={Colors.surface} borderRadius={20} padding={18} gap={16} borderWidth={1} borderColor={Colors.border} overflow="hidden" {...cardShadow()}>
              <Stack position="absolute" right={-24} top={-30} opacity={0.45}>
                <Svg width={150} height={130} viewBox="0 0 150 130">
                  <Circle cx="105" cy="28" r="52" fill={Colors.primaryFaint} />
                  <Circle cx="138" cy="78" r="38" fill={Colors.primaryFaint} />
                  <Path d="M78 8 C105 36 104 68 76 100 C69 69 54 45 78 8Z" fill={Colors.primaryFaint} />
                </Svg>
              </Stack>
              <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
                <Stack gap={3} flex={1}>
                  <Text fontSize={11} fontWeight="800" color={Colors.primary} letterSpacing={0.8}>TODAY · {format(new Date(), "MMM d").toUpperCase()}</Text>
                  <Text fontSize={19} fontWeight="800" color={Colors.textPrimary}>How are you feeling today?</Text>
                </Stack>
                <Stack width={34} height={34} borderRadius={17} backgroundColor={Colors.primaryFaint} alignItems="center" justifyContent="center"><VelaIcon name="lock" size={15} color={Colors.primary} /></Stack>
              </Stack>
              <Stack minHeight={150} borderRadius={16} backgroundColor={Colors.inputBackground} borderWidth={1} borderColor={Colors.border} padding={4}>
                <StyledTextInput
                  variant="filled"
                  placeholder="Write anything you noticed about your body, mood, energy or cycle today…"
                  placeholderTextColor={Colors.textTertiary}
                  multiline
                  numberOfLines={6}
                  value={notes}
                  onChangeText={(v) => { setNotes(v.slice(0, 1000)); setNoteDirty(true); }}
                  focusColor={Colors.primary}
                  backgroundColor="transparent"
                  color={Colors.textPrimary}
                  padding={12}
                  textAlignVertical="top"
                  accessibilityLabel="Today's notes"
                  maxLength={1000}
                />
              </Stack>
              <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
                <Stack flexDirection="row" alignItems="center" gap={6}>
                  <VelaIcon name="lock" size={12} color={Colors.textTertiary} />
                  <Text fontSize={11} color={Colors.textTertiary}>Private to you</Text>
                  {!!notes.length && <Text fontSize={10} color={Colors.textTertiary}>{notes.length}/1000</Text>}
                </Stack>
                <StyledPressable onPress={handleSaveNotes} disabled={!noteDirty} opacity={noteDirty ? 1 : 0.45} backgroundColor={Colors.primary} borderRadius={13} paddingHorizontal={17} paddingVertical={11} minHeight={44} flexDirection="row" alignItems="center" gap={7} accessibilityRole="button" accessibilityLabel="Save note" accessibilityState={{ disabled: !noteDirty }}>
                  <VelaIcon name="check" size={14} color={Colors.textInverse} />
                  <Text fontSize={13} fontWeight="700" color={Colors.textInverse}>Save note</Text>
                </StyledPressable>
              </Stack>
            </Stack>

            <Stack gap={12} marginTop={4}>
              <Stack flexDirection="row" alignItems="center" justifyContent="space-between" paddingHorizontal={2}>
                <Text fontSize={17} fontWeight="800" color={Colors.textPrimary}>Recent notes</Text>
                {tracker.noteData.length > 3 && <Text fontSize={12} fontWeight="700" color={Colors.primary}>Recent 60 days</Text>}
              </Stack>
              {tracker.noteData.filter((n) => n.date !== format(new Date(), "yyyy-MM-dd")).length > 0 ? (
                tracker.noteData.filter((n) => n.date !== format(new Date(), "yyyy-MM-dd")).slice(0, 3).map((item) => (
                  <Stack key={item.date} backgroundColor={Colors.surface} borderRadius={17} padding={16} gap={9} borderWidth={1} borderColor={Colors.border} {...cardShadow()}>
                    <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
                      <Stack flexDirection="row" alignItems="center" gap={8}>
                        <Stack width={30} height={30} borderRadius={15} backgroundColor={Colors.primaryFaint} alignItems="center" justifyContent="center"><VelaIcon name="edit" size={13} color={Colors.primary} /></Stack>
                        <Text fontSize={12} fontWeight="800" color={Colors.textSecondary} letterSpacing={0.3}>{format(parseISO(item.date), "MMM d, yyyy")}</Text>
                      </Stack>
                      <VelaIcon name="lock" size={12} color={Colors.textTertiary} />
                    </Stack>
                    <Text numberOfLines={3} fontSize={14} color={Colors.textSecondary} lineHeight={21}>{item.notes}</Text>
                  </Stack>
                ))
              ) : (
                <Stack backgroundColor={Colors.surface} borderRadius={17} padding={22} alignItems="center" gap={9} borderWidth={1} borderColor={Colors.border}>
                  <Stack width={44} height={44} borderRadius={22} backgroundColor={Colors.primaryFaint} alignItems="center" justifyContent="center"><VelaIcon name="edit" size={20} color={Colors.primary} /></Stack>
                  <Text fontSize={14} fontWeight="800" color={Colors.textPrimary}>Your journal starts here</Text>
                  <Text fontSize={12} color={Colors.textTertiary} textAlign="center" lineHeight={17}>Saved reflections from previous days will appear here.</Text>
                </Stack>
              )}
            </Stack>
          </>
        )}
      </StyledScrollView>
      </KeyboardAvoidingView>
    </StyledPage>
  );
}
