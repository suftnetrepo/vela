import React from "react";
import { Stack, StyledPressable } from "fluent-styles";
import { Text } from "@/components/text";
import { useColors } from "../../hooks/useColors";
import type { CyclePrediction } from "../../algorithm/prediction";
import { phaseName, phaseDescription } from "../../algorithm/prediction";
import { VelaIcon } from "../shared/VelaIcon";
import type { VelaIconName } from "../shared/VelaIcon";

interface TodayCardProps {
  prediction: CyclePrediction | null;
  onLogPress?: () => void;
  cycles?: any[];
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

export function TodayCard({ prediction, onLogPress, cycles }: TodayCardProps) {
  const Colors = useColors();

  const getPredictionConfidence = () => {
    if (!cycles || cycles.length < 2) return null;
    const completedCycles = cycles.filter((c) => c.cycleLength != null);
    if (completedCycles.length <= 3) return "Based on your last 3 cycles";
    if (completedCycles.length <= 7) return "Based on your last 7 cycles";
    return "Based on recent cycle patterns";
  };

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!prediction) {
    return (
      <Stack
        backgroundColor={Colors.primaryFaint}
        borderRadius={24}
        padding={20}
        gap={16}
        borderWidth={1}
        borderColor={Colors.border}
      >
        <Stack horizontal alignItems="center" gap={12}>
          <Stack
            width={40}
            height={40}
            borderRadius={12}
            backgroundColor={Colors.surface}
            borderWidth={1}
            borderColor={Colors.border}
            alignItems="center"
            justifyContent="center"
          >
            <VelaIcon name="flower" size={22} color={Colors.primary} />
          </Stack>
          <Stack flex={1} gap={2}>
            <Text
              fontSize={17}
              fontWeight="700"
              color={Colors.textPrimary}
              letterSpacing={-0.3}
            >
              Welcome to Vela
            </Text>
            <Text fontSize={13} color={Colors.textSecondary}>
              Log your first period to start tracking
            </Text>
          </Stack>
        </Stack>

        {onLogPress && (
          <StyledPressable
            backgroundColor={Colors.primary}
            borderRadius={20}
            paddingHorizontal={18}
            paddingVertical={10}
            alignSelf="flex-start"
            onPress={onLogPress}
            flexDirection="row"
            alignItems="center"
            gap={6}
          >
            <VelaIcon name="edit" size={14} color={Colors.textInverse} />
            <Text fontSize={13} fontWeight="600" color={Colors.textInverse}>
              Log today
            </Text>
          </StyledPressable>
        )}
      </Stack>
    );
  }

  // ── Main card ──────────────────────────────────────────────────────────────
  const iconName = PHASE_ICON[prediction.currentPhase] ?? "flower";
  const phaseColor =
    (Colors as any)[PHASE_COLOR_KEY[prediction.currentPhase]] ?? Colors.primary;

  const confidence = getPredictionConfidence();
  const phaseDescriptionText = phaseDescription(prediction.currentPhase);

  return (
    <Stack
      backgroundColor={Colors.primaryFaint}
      borderRadius={24}
      padding={20}
      gap={12}
      borderWidth={1}
      borderColor={Colors.border}
    >
      {/* ── Cycle day label ── */}
      <Text
        fontSize={10}
        fontWeight="700"
        color={Colors.textTertiary}
        letterSpacing={1.2}
        style={{ textTransform: "uppercase" }}
      >
        Cycle Day {prediction.currentCycleDay}
      </Text>

      {/* ── Phase row: icon + name + day badge ── */}
      <Stack
        horizontal
        alignItems="center"
        justifyContent="space-between"
        gap={12}
      >
        <Stack horizontal alignItems="center" gap={10} flex={1}>
          {/* Icon container */}
          <Stack
            width={36}
            height={36}
            borderRadius={12}
            backgroundColor={Colors.surface}
            borderWidth={1}
            borderColor={Colors.border}
            alignItems="center"
            justifyContent="center"
          >
            <VelaIcon name={iconName} size={20} color={phaseColor} />
          </Stack>

          {/* Phase name */}
          <Text
            fontSize={20}
            fontWeight="700"
            color={Colors.textPrimary}
            letterSpacing={-0.3}
          >
            {phaseName(prediction.currentPhase)}
          </Text>
        </Stack>

        {/* Day badge — ring style using theme primary */}
        <Stack
          width={52}
          height={52}
          borderRadius={26}
          borderWidth={1.5}
          borderColor={Colors.primary}
          backgroundColor={Colors.primaryFaint}
          alignItems="center"
          justifyContent="center"
        >
          <Text
            fontSize={20}
            fontWeight="700"
            color={Colors.textPrimary}
            letterSpacing={-0.5}
          >
            {prediction.currentCycleDay}
          </Text>
        </Stack>
      </Stack>

      {/* ── Phase description ── */}

      {phaseDescriptionText && (
        <Text fontSize={13} color={Colors.textSecondary} lineHeight={19}>
          {phaseDescriptionText}
        </Text>
      )}

      {/* ── Confidence note ── */}
      {confidence && (
        <Text paddingHorizontal={12} fontSize={11.5} color={Colors.textTertiary} lineHeight={16}>
            {confidence}
        </Text>
      )}

      {/* ── Divider ── */}
      <Stack height={1} backgroundColor={Colors.border} />

      {/* ── Estimated period + edit button ── */}
      <Stack
        horizontal
        alignItems="center"
        gap={10}
        justifyContent="space-between"
      >
        <Stack
          backgroundColor={Colors.primaryFaint}
          borderRadius={14}
          paddingHorizontal={14}
          paddingVertical={10}
          gap={4}
          flex={1}
        >
          <Text
            fontSize={9}
            fontWeight="700"
            color={Colors.textTertiary}
            letterSpacing={1.2}
            style={{ textTransform: "uppercase" }}
          >
            Estimated Period
          </Text>
          <Stack horizontal alignItems="center" gap={5}>
            <VelaIcon name="phase-predicted" size={13} color={Colors.primary} />
            <Text fontSize={11} fontWeight="500" color={Colors.textPrimary}>
              {prediction.daysUntilNextPeriod === 0
                ? "Today"
                : prediction.daysUntilNextPeriod > 0
                ? `In ${prediction.daysUntilNextPeriod}d`
                : `Expected Around ${Math.abs(prediction.daysUntilNextPeriod)}d ago`}
            </Text>
            {prediction.confidenceDays > 1 && (
              <Text fontSize={11} color={Colors.textTertiary}>
                ±{prediction.confidenceDays}d
              </Text>
            )}
          </Stack>
        </Stack>

        {onLogPress && (
          <StyledPressable
            backgroundColor={Colors.primary}
            borderRadius={12}
            width={48}
            height={48}
            alignItems="center"
            justifyContent="center"
            onPress={onLogPress}
          >
            <VelaIcon name="edit" size={18} color={Colors.textInverse} />
          </StyledPressable>
        )}
      </Stack>
    </Stack>
  );
}
