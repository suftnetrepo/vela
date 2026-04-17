import React from "react";
import { Stack, StyledText, StyledPressable, theme } from "fluent-styles";
import { Text } from "@/components/text";
import { useColors } from "../../hooks/useColors";
import type { CyclePrediction } from "../../algorithm/prediction";
import { phaseName, phaseDescription } from "../../algorithm/prediction";
import { daysUntilText } from "../../utils/date";
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

  // Generate personalization cue based on cycles
  const getPredictionConfidence = () => {
    if (!cycles || cycles.length < 2) return null;
    const completedCycles = cycles.filter((c) => c.cycleLength != null);
    if (completedCycles.length <= 3) return "Based on your last 3 cycles";
    if (completedCycles.length <= 7) return "Based on your last 7 cycles";
    return "Updated from your recent logs";
  };

  if (!prediction) {
    return (
      <Stack
        backgroundColor={Colors.surface}
        borderRadius={24}
        padding={24}
        gap={16}
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.06}
        shadowRadius={12}
        elevation={3}
      >
        <Stack horizontal alignItems="center" gap={12}>
          <Stack
            width={48}
            height={48}
            borderRadius={24}
            backgroundColor={Colors.primaryFaint}
            alignItems="center"
            justifyContent="center"
          >
            <VelaIcon name="flower" size={26} color={Colors.primary} />
          </Stack>
          <Stack flex={1} gap={2}>
            <Text fontSize={18} fontWeight="800" color={Colors.textPrimary}>
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
            paddingHorizontal={20}
            paddingVertical={12}
            alignSelf="flex-start"
            onPress={onLogPress}
            flexDirection="row"
            alignItems="center"
            gap={8}
          >
            <VelaIcon name="edit" size={15} color={Colors.textInverse} />
            <Text fontSize={14} fontWeight="700" color={Colors.textInverse}>
              Log today
            </Text>
          </StyledPressable>
        )}
      </Stack>
    );
  }

  const iconName = PHASE_ICON[prediction.currentPhase] ?? "flower";
  const phaseColor =
    (Colors as any)[PHASE_COLOR_KEY[prediction.currentPhase]] ?? Colors.primary;

  return (
    <Stack
      backgroundColor={Colors.primaryFaint}
      borderRadius={24}
      padding={20}
      gap={16}
      borderWidth={1}
      borderColor={Colors.border}
    >
      {/* Top section: Cycle day label and title */}
      <Stack gap={8}>
        <Text
          fontSize={11}
          color={Colors.textTertiary}
          fontWeight="700"
          letterSpacing={0.6}
        >
          CYCLE DAY {prediction.currentCycleDay}
        </Text>
        {/* Phase with icon and day badge */}
        <Stack
          horizontal
          alignItems="flex-start"
          justifyContent="space-between"
          gap={12}
        >
          <Stack horizontal alignItems="center" gap={10} flex={1}>
            <Stack
              width={36}
              height={36}
              borderRadius={18}
              backgroundColor={Colors.surface}
              alignItems="center"
              justifyContent="center"
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 1 }}
              shadowOpacity={0.08}
              shadowRadius={4}
              elevation={2}
            >
              <VelaIcon name={iconName} size={20} color={phaseColor} />
            </Stack>
            <Text variant="metric" color={Colors.textPrimary}>
              {phaseName(prediction.currentPhase)}
            </Text>
          </Stack>
          {/* Cycle day badge - phase color intentionally used for visual feedback */}
          <Stack
            width={52}
            height={52}
            borderRadius={99}
            backgroundColor={phaseColor}
            alignItems="center"
            justifyContent="center"
            shadowColor={phaseColor}
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.2}
            shadowRadius={6}
            elevation={3}
          >
            <Text variant="metric" color={Colors.dayMuted}>
              {prediction.currentCycleDay}
            </Text>
          </Stack>
        </Stack>

        {/* Phase description */}
        <Text variant="body" color={Colors.textSecondary} lineHeight={21}>
          {phaseDescription(prediction.currentPhase)}
        </Text>

        {/* Prediction confidence note */}
        {getPredictionConfidence() && (
          <Text variant="subLabel" color={Colors.textTertiary} lineHeight={17}>
            💡 {getPredictionConfidence()}
          </Text>
        )}
      </Stack>

      {/* Next period info + Log button section */}
      <Stack
        horizontal
        alignItems="center"
        gap={10}
        justifyContent="space-between"
      >
        <Stack
          backgroundColor={Colors.surface}
          borderRadius={16}
          paddingHorizontal={16}
          paddingVertical={8}
          gap={4}
          flex={1}
        >
          <Text variant="overline" color={Colors.textTertiary}>
            NEXT PERIOD
          </Text>
          <Stack horizontal alignItems="center" gap={6}>
            <VelaIcon name="phase-predicted" size={14} color={Colors.primary} />
            <Text
              variant="metric_small"
              color={Colors.textPrimary}
              fontSize={14}
            >
              {daysUntilText(prediction.daysUntilNextPeriod)}
            </Text>
            {prediction.confidenceDays > 1 && (
              <Text variant="metric_small" color={Colors.textTertiary}>
                ±{prediction.confidenceDays}d
              </Text>
            )}
          </Stack>
        </Stack>
        {onLogPress && (
          <StyledPressable
            backgroundColor={Colors.primary}
            borderRadius={12}
            height={52}
            paddingHorizontal={14}
            alignItems="center"
            justifyContent="center"
            flexDirection="row"
            gap={6}
            onPress={onLogPress}
            shadowColor={Colors.primary}
            shadowOffset={{ width: 0, height: 3 }}
            shadowOpacity={0.18}
            shadowRadius={6}
            elevation={3}
          >
            <VelaIcon name="edit" size={18} color={Colors.textInverse} />
            {/* <Text variant="button" color={Colors.textInverse} fontSize={13}>
              Log
            </Text> */}
          </StyledPressable>
        )}
      </Stack>
    </Stack>
  );
}
