import React from "react";
import { View } from "react-native";
import { Stack, StyledPressable } from "fluent-styles";
import Svg, { Circle, G, Text as SvgText } from "react-native-svg";
import { addDays, differenceInDays } from "date-fns";
import { Text } from "@/components/text";
import { useColors } from "../../hooks/useColors";
import type { CyclePrediction } from "../../algorithm/prediction";
import { phaseName } from "../../algorithm/prediction";
import type { PredictionConfidence } from "../../algorithm/confidence";
import { VelaIcon } from "../shared/VelaIcon";
import type { VelaIconName } from "../shared/VelaIcon";

interface TodayCardProps {
  prediction: CyclePrediction | null;
  onLogPress?: () => void;
  confidence?: PredictionConfidence | null;
  onStartPeriodPress?: () => void;
  onEditCyclePress?: () => void;
  onViewInsightsPress?: () => void;
}

const PHASE_ICON: Record<string, VelaIconName> = {
  menstrual: "phase-menstrual",
  follicular: "phase-follicular",
  ovulation: "phase-ovulation",
  fertile: "phase-fertile",
  luteal: "phase-luteal",
  predicted_period: "phase-predicted",
};

const PHASE_COLOR_KEY: Record<string, string> = {
  menstrual: "dayPeriod",
  follicular: "success",
  ovulation: "ovulation",
  fertile: "fertile",
  luteal: "primary",
  predicted_period: "primaryLight",
};

const SIZE = 310;
const CENTER = SIZE / 2;
const OUTER_R = 128;
const PROGRESS_R = 106;

const circumference = (radius: number) => 2 * Math.PI * radius;
const clampDay = (day: number, cycleLength: number) => Math.max(1, Math.min(day, cycleLength));

function dashForDays(days: number, cycleLength: number, radius: number) {
  const c = circumference(radius);
  return `${(c * Math.max(0, days)) / cycleLength} ${c}`;
}

function dashOffsetForDay(day: number, cycleLength: number, radius: number) {
  return -(circumference(radius) * (clampDay(day, cycleLength) - 1)) / cycleLength;
}

function pointForDay(day: number, cycleLength: number, radius: number) {
  const angle = ((clampDay(day, cycleLength) - 1) / cycleLength) * Math.PI * 2 - Math.PI / 2;
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  };
}

// Current-day marker position, as currentCycleDay / expectedCycleLength —
// the same "N days out of the cycle" ratio the Period/Fertile arcs already
// use (dashForDays), so the marker lines up with that convention: day 7 of
// 28 sits at 25% around the ring, day 28 of 28 reaches the completion
// boundary (100%). A day beyond the predicted length clamps at 100% via
// clampDay rather than continuing past it.
function currentDayProgress(day: number, cycleLength: number): number {
  return clampDay(day, cycleLength) / cycleLength;
}

function pointForProgress(fraction: number, radius: number) {
  const angle = fraction * Math.PI * 2 - Math.PI / 2;
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  };
}

export function TodayCard({
  prediction,
  onLogPress,
  confidence,
  onStartPeriodPress,
  onEditCyclePress,
}: TodayCardProps) {
  const Colors = useColors();

  if (!prediction) {
    return (
      <Stack
        backgroundColor={Colors.surface}
        borderRadius={28}
        padding={24}
        gap={14}
        borderWidth={1}
        borderColor={Colors.border}
        alignItems="center"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.04}
        shadowRadius={16}
        elevation={2}
      >
        <Stack width={52} height={52} borderRadius={26} backgroundColor={Colors.primaryFaint} alignItems="center" justifyContent="center">
          <VelaIcon name="flower" size={25} color={Colors.primary} />
        </Stack>
        <Text fontSize={20} fontWeight="700" color={Colors.textPrimary}>Start your cycle story</Text>
        <Text fontSize={14} lineHeight={20} color={Colors.textSecondary} textAlign="center">
          Log your first period and Vela will begin mapping your cycle.
        </Text>
        {onLogPress && (
          <StyledPressable
            backgroundColor={Colors.primary}
            borderRadius={22}
            paddingHorizontal={20}
            paddingVertical={11}
            onPress={onLogPress}
            accessibilityRole="button"
            accessibilityLabel="Log period"
            accessibilityHint="Opens today's log to record your first period"
          >
            <Text fontSize={14} fontWeight="700" color={Colors.textInverse}>Log period</Text>
          </StyledPressable>
        )}
      </Stack>
    );
  }

  const cycleLength = Math.max(1, prediction.averageCycleLength);
  const currentDay = clampDay(prediction.currentCycleDay, cycleLength);
  const periodDays = Math.min(prediction.averagePeriodLength, cycleLength);
  const currentCycleStart = addDays(prediction.nextPeriodStart, -cycleLength);
  const currentPeriodEnd = addDays(currentCycleStart, periodDays - 1);
  const fertileStartDay = clampDay(differenceInDays(prediction.fertileWindowStart, currentCycleStart) + 1, cycleLength);
  const fertileEndDay = clampDay(differenceInDays(prediction.fertileWindowEnd, currentCycleStart) + 1, cycleLength);
  const fertileDays = Math.max(1, fertileEndDay - fertileStartDay + 1);
  const ovulationDay = clampDay(differenceInDays(prediction.ovulationDay, currentCycleStart) + 1, cycleLength);

  const progressC = circumference(PROGRESS_R);
  const currentProgress = currentDayProgress(currentDay, cycleLength);
  const currentPoint = pointForProgress(currentProgress, OUTER_R);
  const ovulationPoint = pointForDay(ovulationDay, cycleLength, OUTER_R);
  const phaseColor = (Colors as any)[PHASE_COLOR_KEY[prediction.currentPhase]] ?? Colors.primary;
  const iconName = PHASE_ICON[prediction.currentPhase] ?? "flower";
  const progressLength = progressC * currentProgress;

  const relativePeriodText =
    prediction.daysUntilNextPeriod === 0
      ? "Expected today"
      : prediction.daysUntilNextPeriod === 1
        ? "Expected tomorrow"
        : prediction.daysUntilNextPeriod > 0
          ? `${prediction.daysUntilNextPeriod} days`
          : `${Math.abs(prediction.daysUntilNextPeriod)} days late`;


  return (
    <Stack
      backgroundColor={Colors.surface}
      borderRadius={30}
      paddingTop={12}
      paddingBottom={14}
      paddingHorizontal={12}
      borderWidth={1}
      borderColor={Colors.border}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 5 }}
      shadowOpacity={0.045}
      shadowRadius={18}
      elevation={2}
      alignItems="center"
      overflow="hidden"
    >
      <View style={{ width: "100%", maxWidth: SIZE, aspectRatio: 1, alignSelf: "center" }}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${SIZE} ${SIZE}`} accessibilityLabel={`Cycle day ${currentDay} of ${cycleLength}`}>
          <G rotation="-90" origin={`${CENTER}, ${CENTER}`}>
            {/* Outer ring is a phase timeline, not a progress fill: pink
                marks only real Period days, purple only the real Fertile
                window, everything else (Follicular/Luteal) stays on this
                pale track regardless of how much of the cycle has elapsed.
                Progression through the cycle is shown by the current-day
                marker's position below, not by shading the ring itself. */}
            <Circle cx={CENTER} cy={CENTER} r={OUTER_R} fill="none" stroke={Colors.primaryFaint} strokeWidth={15} />
            <Circle
              cx={CENTER} cy={CENTER} r={OUTER_R} fill="none"
              stroke={Colors.dayPeriod} strokeWidth={15} strokeLinecap="round"
              strokeDasharray={dashForDays(periodDays, cycleLength, OUTER_R)}
            />
            <Circle
              cx={CENTER} cy={CENTER} r={OUTER_R} fill="none"
              stroke={Colors.fertile} strokeWidth={15} strokeLinecap="round"
              strokeDasharray={dashForDays(fertileDays, cycleLength, OUTER_R)}
              strokeDashoffset={dashOffsetForDay(fertileStartDay, cycleLength, OUTER_R)}
            />
            <Circle cx={CENTER} cy={CENTER} r={PROGRESS_R} fill="none" stroke={Colors.border} strokeWidth={3.5} opacity={0.62} />
            <Circle
              cx={CENTER} cy={CENTER} r={PROGRESS_R} fill="none"
              stroke={phaseColor} strokeWidth={3.5} strokeLinecap="round"
              strokeDasharray={`${progressLength} ${progressC}`}
            />
          </G>

          <Circle cx={currentPoint.x} cy={currentPoint.y} r={17} fill={Colors.surface} stroke={Colors.primary} strokeWidth={2.5} />
          <SvgText x={currentPoint.x} y={currentPoint.y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill={Colors.textPrimary}>
            {currentDay}
          </SvgText>

          <Circle cx={ovulationPoint.x} cy={ovulationPoint.y} r={8.5} fill={Colors.surface} stroke={Colors.ovulation} strokeWidth={2.5} />
          <Circle cx={ovulationPoint.x} cy={ovulationPoint.y} r={3} fill={Colors.ovulation} />
        </Svg>

        <Stack position="absolute" top={58} left={42} right={42} bottom={52} alignItems="center" justifyContent="center" gap={8}>
          <Stack horizontal alignItems="center" gap={5}>
            <VelaIcon name={iconName} size={12} color={phaseColor} />
            <Text fontSize={11} fontWeight="700" letterSpacing={0.15} color={phaseColor}>{phaseName(prediction.currentPhase)}</Text>
          </Stack>

          <Stack horizontal alignItems="baseline" gap={6}>
            <Text fontSize={39} lineHeight={44} fontWeight="800" color={Colors.textPrimary} letterSpacing={-1.4}>Day {currentDay}</Text>
            <Text fontSize={13} fontWeight="600" color={Colors.textTertiary}>of {cycleLength}</Text>
          </Stack>

          <Text fontSize={11} fontWeight="500" color={Colors.textTertiary}>Next period in</Text>
          <Text fontSize={20} lineHeight={24} fontWeight="700" color={Colors.primaryDark}>{relativePeriodText}</Text>

          {onStartPeriodPress && (
            <StyledPressable
              onPress={onStartPeriodPress}
              marginTop={2}
              paddingHorizontal={13}
              paddingVertical={6.5}
              borderRadius={18}
              backgroundColor={Colors.primaryFaint}
              flexDirection="row"
              alignItems="center"
              gap={5}
              accessibilityRole="button"
              accessibilityLabel="Log period"
              accessibilityHint="Starts a new cycle from today"
            >
              <VelaIcon name="drop" size={11} color={Colors.primary} />
              <Text fontSize={11.5} fontWeight="700" color={Colors.primaryDark}>Log period</Text>
            </StyledPressable>
          )}
        </Stack>
      </View>

      <Stack horizontal width="100%" justifyContent="space-between" alignItems="center" paddingHorizontal={10} marginTop={-6}>
        <Stack horizontal alignItems="center" gap={5} flexWrap="wrap" flex={1}>
          <Stack width={7} height={7} borderRadius={4} backgroundColor={Colors.dayPeriod} />
          <Text fontSize={10.5} color={Colors.textSecondary}>Period</Text>
          <Stack width={7} height={7} borderRadius={4} backgroundColor={Colors.fertile} marginLeft={5} />
          <Text fontSize={10.5} color={Colors.textSecondary}>Fertile</Text>
          <Stack width={7} height={7} borderRadius={4} backgroundColor={Colors.ovulation} marginLeft={5} />
          <Text fontSize={10.5} color={Colors.textSecondary}>Ovulation</Text>
        </Stack>

        {onEditCyclePress && (
          <StyledPressable
            onPress={onEditCyclePress}
            flexDirection="row"
            alignItems="center"
            gap={4}
            paddingVertical={7}
            paddingLeft={8}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Edit cycle length"
          >
            <VelaIcon name="edit" size={12} color={Colors.textTertiary} />
            <Text fontSize={10.5} fontWeight="600" color={Colors.textSecondary}>Edit</Text>
          </StyledPressable>
        )}
      </Stack>

    </Stack>
  );
}
