import React, { useState } from "react";
import { Dimensions } from "react-native";
import {
  Stack,
  StyledText,
  StyledScrollView,
  StyledPage,
  StyledHeader,
  StyledPressable,
  StyledTextInput,
  TabBar,
} from "fluent-styles";
import { Text } from "@/components/text";
import Svg, {
  Path,
  Circle,
  Line,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { useColors } from "../../src/hooks/useColors";
import { useTracker } from "../../src/hooks/useTracker";
import { VelaIcon } from "../../src/components/shared/VelaIcon";
import { formatMeasurement, getMeasurementErrorMessage, TRACKER_UNITS } from "../../src/constants/tracker";
import { format, parseISO } from "date-fns";
import { loaderService, toastService } from "fluent-styles";

const W = Dimensions.get("window").width;
const CHART_W = W - 48;
const CHART_H = 160;

type TrackerTab = "weight" | "temperature" | "notes";

// ─── Sparkline with gradient fill ────────────────────────────────────────────
function SparkChart({
  data,
  color,
  unit,
  minY,
  maxY,
}: {
  data: { date: string; value: number }[];
  color: string;
  unit: string;
  minY: number;
  maxY: number;
}) {
  const Colors = useColors();
  if (data.length < 2) return null;

  const range = maxY - minY || 1;
  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * (CHART_W - 40) + 20,
    y: CHART_H - 24 - ((d.value - minY) / range) * (CHART_H - 48),
  }));

  const pathD = pts.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    "",
  );
  const fillD = `${pathD} L ${pts[pts.length - 1].x} ${CHART_H - 24} L ${pts[0].x} ${CHART_H - 24} Z`;

  return (
    <Svg width={CHART_W} height={CHART_H}>
      <Defs>
        <LinearGradient id={`g-${color}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.18" />
          <Stop offset="1" stopColor={color} stopOpacity="0.01" />
        </LinearGradient>
      </Defs>
      {[0.25, 0.5, 0.75].map((f, i) => (
        <Line
          key={i}
          x1={20}
          y1={CHART_H - 24 - f * (CHART_H - 48)}
          x2={CHART_W - 20}
          y2={CHART_H - 24 - f * (CHART_H - 48)}
          stroke={Colors.border}
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      ))}
      <Path d={fillD} fill={`url(#g-${color})`} />
      <Path
        d={pathD}
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map((p, i) => (
        <Circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === pts.length - 1 ? 5 : 3.5}
          fill={Colors.surface}
          stroke={color}
          strokeWidth={i === pts.length - 1 ? 2.5 : 1.5}
        />
      ))}
      <SvgText
        x={pts[pts.length - 1].x}
        y={pts[pts.length - 1].y - 10}
        fontSize={11}
        fontWeight="700"
        fill={color}
        textAnchor="middle"
      >
        {data[data.length - 1].value}
        {unit}
      </SvgText>
      {data
        .filter(
          (_, i) =>
            i % Math.ceil(data.length / 5) === 0 || i === data.length - 1,
        )
        .map((d, i) => {
          const idx = data.indexOf(d);
          return (
            <SvgText
              key={i}
              x={pts[idx].x}
              y={CHART_H - 4}
              fontSize={9}
              fill={Colors.textTertiary}
              textAnchor="middle"
            >
              {format(parseISO(d.date), "MMM d")}
            </SvgText>
          );
        })}
    </Svg>
  );
}

// ─── BBT circular gauge ───────────────────────────────────────────────────────
function TempGauge({ value, colors }: { value: number | null; colors: any }) {
  const r = 68,
    cx = 90,
    cy = 90,
    stroke = 10;
  const circ = 2 * Math.PI * r;
  const pct = value != null ? Math.min(Math.max((value - 35) / 5, 0), 1) : 0;
  const col =
    value == null
      ? colors.border
      : value < 36.5
        ? colors.info
        : value <= 37.5
          ? colors.success
          : colors.error;
  const label =
    value == null
      ? "No data"
      : value < 36.5
        ? "Low"
        : value <= 37.5
          ? "Normal"
          : "High";

  return (
    <Svg width={180} height={180}>
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={colors.border}
        strokeWidth={stroke}
      />
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={col}
        strokeWidth={stroke}
        strokeDasharray={`${pct * circ} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <SvgText
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        fontSize={28}
        fontWeight="800"
        fill={colors.textPrimary}
      >
        {value != null ? value.toFixed(1) : "—"}
      </SvgText>
      <SvgText
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        fontSize={13}
        fill={colors.textSecondary}
      >
        °C BBT
      </SvgText>
      <SvgText
        x={cx}
        y={cy + 32}
        textAnchor="middle"
        fontSize={11}
        fill={col}
        fontWeight="600"
      >
        {label}
      </SvgText>
    </Svg>
  );
}

// ─── Metric input card ────────────────────────────────────────────────────────
function MetricInput({
  label,
  current,
  unit,
  placeholder,
  hint,
  onSave,
}: {
  label: string;
  current: string;
  unit: string;
  placeholder: string;
  hint?: string;
  onSave: (v: string) => void;
}) {
  const Colors = useColors();
  const [val, setVal] = useState(current);
  const [justSaved, setJustSaved] = useState(false);

  // Sync when todayLog changes
  React.useEffect(() => {
    setVal(current);
  }, [current]);

  const handleSave = () => {
    onSave(val);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <Stack
      backgroundColor={Colors.surface}
      borderRadius={20}
      padding={20}
      gap={14}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.06}
      shadowRadius={10}
      elevation={2}
    >
      <Text fontSize={15} fontWeight="700" color={Colors.textPrimary}>
        {label}
      </Text>
      <Stack flexDirection="row" alignItems="center" gap={10}>
        <Stack flex={1}>
          <TextInput
            variant="outline"
            value={val}
            onChangeText={(v) => {
              setVal(v);
              setJustSaved(false);
            }}
            keyboardType="decimal-pad"
            placeholder={placeholder}
            focusColor={Colors.primary}
            borderColor={Colors.border}
          />
        </Stack>
        <Stack
          backgroundColor={Colors.surfaceAlt}
          borderRadius={12}
          paddingHorizontal={14}
          paddingVertical={12}
        >
          <Text
            fontSize={14}
            fontWeight="600"
            color={Colors.textSecondary}
          >
            {unit}
          </Text>
        </Stack>
        <StyledPressable
          backgroundColor={justSaved ? Colors.success : Colors.primary}
          borderRadius={12}
          paddingHorizontal={16}
          paddingVertical={12}
          onPress={handleSave}
        >
          <VelaIcon
            name={justSaved ? "check-circle" : "check"}
            size={16}
            color={Colors.textInverse}
          />
        </StyledPressable>
      </Stack>
      {hint && (
        <Text fontSize={12} color={Colors.textTertiary}>
          {hint}
        </Text>
      )}
    </Stack>
  );
}

// ─── Stats row ────────────────────────────────────────────────────────────────
function StatRow({
  items,
}: {
  items: { label: string; value: string; color: string }[];
}) {
  const Colors = useColors();
  return (
    <Stack flexDirection="row" gap={8}>
      {items.map((s) => (
        <Stack
          key={s.label}
          flex={1}
          backgroundColor={Colors.surfaceAlt}
          borderRadius={12}
          padding={12}
          alignItems="center"
          gap={3}
        >
          <Text fontSize={17} fontWeight="800" color={s.color}>
            {s.value}
          </Text>
          <Text
            fontSize={10}
            color={Colors.textTertiary}
            fontWeight="600"
          >
            {s.label.toUpperCase()}
          </Text>
        </Stack>
      ))}
    </Stack>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function TrackerScreen() {
  const Colors = useColors();
  const tracker = useTracker();
  const [tab, setTab] = useState<TrackerTab>("weight");
  const [notes, setNotes] = useState("");
  const [noteDirty, setNoteDirty] = useState(false);

  // Sync notes from loaded log
  React.useEffect(() => {
    setNotes(tracker.todayLog?.notes ?? "");
    setNoteDirty(false);
  }, [tracker.todayLog?.notes]);

  const handleSaveWeight = async (raw: string) => {
    const n = parseFloat(raw);
    if (isNaN(n) || n <= 0 || n < TRACKER_UNITS.weight.min || n > TRACKER_UNITS.weight.max) {
      toastService.error(getMeasurementErrorMessage('weight'));
      return;
    }
    const id = loaderService.show({ variant: "dots", label: "Saving…" });
    try {
      await tracker.saveWeight(n);
      loaderService.hide(id);
      toastService.success("Weight saved");
    } catch {
      loaderService.hide(id);
      toastService.error("Could not save");
    }
  };

  const handleSaveTemp = async (raw: string) => {
    const n = parseFloat(raw);
    if (isNaN(n) || n < TRACKER_UNITS.temperature.min || n > TRACKER_UNITS.temperature.max) {
      toastService.error(getMeasurementErrorMessage('temperature'));
      return;
    }
    const id = loaderService.show({ variant: "dots", label: "Saving…" });
    try {
      await tracker.saveTemperature(n);
      loaderService.hide(id);
      toastService.success("Temperature saved");
    } catch {
      loaderService.hide(id);
      toastService.error("Could not save");
    }
  };

  const handleSaveNotes = async () => {
    const id = loaderService.show({ variant: "dots", label: "Saving…" });
    try {
      await tracker.saveNotes(notes);
      setNoteDirty(false);
      loaderService.hide(id);
      toastService.success("Notes saved");
    } catch {
      loaderService.hide(id);
      toastService.error("Could not save");
    }
  };

  const wVals = tracker.weightData.map((d) => d.value);
  const tVals = tracker.tempData.map((d) => d.value);

  const TABS = [
    { value: "weight" as TrackerTab, label: "Weight" },
    { value: "temperature" as TrackerTab, label: "Temperature" },
    { value: "notes" as TrackerTab, label: "Notes" },
  ];

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      <StyledPage.Header
        marginHorizontal={32}
        title="Tracker"
        titleAlignment="left"
        backgroundColor={Colors.background}
        titleProps={{
          fontSize: 22,
          fontWeight: "800",
          color: Colors.textPrimary,
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

      <StyledScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 56, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── WEIGHT ──────────────────────────────────────────────────────── */}
        {tab === "weight" && (
          <>
            <MetricInput
              label="Log today's weight"
              current={tracker.todayLog?.weight?.toString() ?? ""}
              unit={TRACKER_UNITS.weight.display}
              placeholder="e.g. 62.5"
              hint="Weigh yourself each morning for consistent readings"
              onSave={handleSaveWeight}
            />

            {tracker.weightData.length >= 2 ? (
              <Stack
                backgroundColor={Colors.surface}
                borderRadius={20}
                padding={20}
                gap={14}
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.06}
                shadowRadius={10}
                elevation={2}
              >
                <Stack
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text
                    fontSize={16}
                    fontWeight="700"
                    color={Colors.textPrimary}
                  >
                    Weight trend
                  </Text>
                  <Stack
                    backgroundColor={Colors.primaryFaint}
                    borderRadius={10}
                    paddingHorizontal={10}
                    paddingVertical={4}
                  >
                    <Text
                      fontSize={11}
                      color={Colors.primaryDark}
                      fontWeight="600"
                    >
                      Last {tracker.weightData.length} entries
                    </Text>
                  </Stack>
                </Stack>
                <Stack
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="center"
                >
                  <SparkChart
                    data={tracker.weightData}
                    color={Colors.primary}
                    unit="kg"
                    minY={Math.min(...wVals) - 1}
                    maxY={Math.max(...wVals) + 1}
                  />
                </Stack>

                <StatRow
                  items={[
                    {
                      label: "Current",
                      value: formatMeasurement(wVals[wVals.length - 1], 'weight'),
                      color: Colors.textPrimary,
                    },
                    {
                      label: "Change",
                      value: `${wVals[wVals.length - 1] - wVals[0] >= 0 ? "+" : ""}${formatMeasurement(wVals[wVals.length - 1] - wVals[0], 'weight')}`,
                      color:
                        wVals[wVals.length - 1] - wVals[0] <= 0
                          ? Colors.success
                          : Colors.warning,
                    },
                    {
                      label: "Entries",
                      value: `${wVals.length}`,
                      color: Colors.textSecondary,
                    },
                  ]}
                />
              </Stack>
            ) : (
              <Stack
                backgroundColor={Colors.surface}
                borderRadius={20}
                padding={32}
                alignItems="center"
                gap={12}
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 1 }}
                shadowOpacity={0.04}
                shadowRadius={6}
                elevation={1}
              >
                <Stack
                  width={56}
                  height={56}
                  borderRadius={28}
                  backgroundColor={Colors.primaryFaint}
                  alignItems="center"
                  justifyContent="center"
                >
                  <VelaIcon name="activity" size={28} color={Colors.primary} />
                </Stack>
                <Text
                  fontSize={15}
                  fontWeight="700"
                  color={Colors.textPrimary}
                >
                  No weight data yet
                </Text>
                <Text
                  fontSize={13}
                  color={Colors.textSecondary}
                  textAlign="center"
                >
                  Log your weight daily to see trends over time.
                </Text>
              </Stack>
            )}
          </>
        )}

        {/* ── TEMPERATURE ─────────────────────────────────────────────────── */}
        {tab === "temperature" && (
          <>
            <MetricInput
              label="Log basal body temperature"
              current={tracker.todayLog?.temperature?.toString() ?? ""}
              unit={TRACKER_UNITS.temperature.display}
              placeholder="e.g. 36.8"
              hint="Take your temperature before getting up, same time each morning"
              onSave={handleSaveTemp}
            />

            <Stack
              backgroundColor={Colors.surface}
              borderRadius={20}
              padding={20}
              gap={8}
              alignItems="center"
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.06}
              shadowRadius={10}
              elevation={2}
            >
              <Text
                fontSize={16}
                fontWeight="700"
                color={Colors.textPrimary}
                alignSelf="flex-start"
              >
                Today's reading
              </Text>
              <TempGauge
                value={tracker.todayLog?.temperature ?? null}
                colors={Colors}
              />
              <Stack
                flexDirection="row"
                gap={10}
                flexWrap="wrap"
                justifyContent="center"
              >
                {[
                  { label: "Low", color: Colors.info, range: "<36.5°C" },
                  {
                    label: "Normal",
                    color: Colors.success,
                    range: "36.5–37.5°C",
                  },
                  { label: "High", color: Colors.error, range: ">37.5°C" },
                ].map((i) => (
                  <Stack
                    key={i.label}
                    flexDirection="row"
                    alignItems="center"
                    gap={5}
                  >
                    <Stack
                      width={8}
                      height={8}
                      borderRadius={4}
                      backgroundColor={i.color}
                    />
                    <Text fontSize={11} color={Colors.textTertiary}>
                      {i.label} {i.range}
                    </Text>
                  </Stack>
                ))}
              </Stack>
            </Stack>

            {tracker.tempData.length >= 2 && (
              <Stack
                backgroundColor={Colors.surface}
                borderRadius={20}
                padding={20}
                gap={14}
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.06}
                shadowRadius={10}
                elevation={2}
              >
                <Text
                  fontSize={16}
                  fontWeight="700"
                  color={Colors.textPrimary}
                >
                  BBT chart
                </Text>
                <SparkChart
                  data={tracker.tempData}
                  color={Colors.fertile}
                  unit={TRACKER_UNITS.temperature.display}
                  minY={Math.min(...tVals) - 0.3}
                  maxY={Math.max(...tVals) + 0.3}
                />
                <StatRow
                  items={[
                    {
                      label: "Today",
                      value: formatMeasurement(tVals[tVals.length - 1], 'temperature'),
                      color: Colors.textPrimary,
                    },
                    {
                      label: "Average",
                      value: formatMeasurement(tVals.reduce((a, b) => a + b, 0) / tVals.length, 'temperature'),
                      color: Colors.fertile,
                    },
                    {
                      label: "Entries",
                      value: `${tVals.length}`,
                      color: Colors.textSecondary,
                    },
                  ]}
                />
              </Stack>
            )}
          </>
        )}

        {/* ── NOTES ───────────────────────────────────────────────────────── */}
        {tab === "notes" && (
          <Stack
            backgroundColor={Colors.surface}
            borderRadius={20}
            padding={20}
            gap={12}
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.06}
            shadowRadius={10}
            elevation={2}
          >
            <Text
              fontSize={15}
              fontWeight="700"
              color={Colors.textPrimary}
            >
              Today's notes
            </Text>
            <TextInput
              variant="outline"
              placeholder="How's your body feeling? Any observations about energy, mood, or symptoms…"
              multiline
              numberOfLines={7}
              value={notes}
              onChangeText={(v) => {
                setNotes(v);
                setNoteDirty(true);
              }}
              focusColor={Colors.primary}
              borderColor={Colors.border}
            />
            <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
              <Text fontSize={11} color={Colors.textTertiary}>
                Private journal for your cycle
              </Text>
              {noteDirty && (
                <StyledPressable
                  onPress={handleSaveNotes}
                  backgroundColor={Colors.primary}
                  borderRadius={12}
                  paddingHorizontal={14}
                  paddingVertical={8}
                  flexDirection="row"
                  alignItems="center"
                  gap={6}
                >
                  <VelaIcon name="check" size={14} color={Colors.textInverse} />
                  <Text
                    fontSize={13}
                    fontWeight="600"
                    color={Colors.textInverse}
                  >
                    Save
                  </Text>
                </StyledPressable>
              )}
            </Stack>
          </Stack>
        )}
      </StyledScrollView>
    </StyledPage>
  );
}
