import React, { useState, useRef } from "react";
import {
  Stack,
  StyledText,
  StyledScrollView,
  StyledPage,
  StyledHeader,
  StyledPressable,
  StyledSlider,
  theme,
  StyledSpacer,
} from "fluent-styles";
import { router } from "expo-router";
import { Text } from "@/components/text";
import { useColors } from "../../../src/hooks/useColors";
import { useSettings } from "../../../src/hooks/useSettings";
import { VelaIcon } from "../../../src/components/shared/VelaIcon";
import { toastService } from "fluent-styles";

export default function CycleSettingsScreen() {
  const Colors = useColors();
  const settings = useSettings();

  // Stable initial values — never updated, so StyledSlider's
  // useEffect(() => setLocalLow(value), [value]) never fires mid-drag
  const [cycleInitial] = useState(settings.avgCycleLength);
  const [periodInitial] = useState(settings.avgPeriodLength);

  // Refs hold committed values (updated on sliding complete)
  const cycleLenRef = useRef(settings.avgCycleLength);
  const periodLenRef = useRef(settings.avgPeriodLength);

  // Display state — only updates when finger lifts (no re-render mid-drag)
  const [cycleDisplay, setCycleDisplay] = useState(settings.avgCycleLength);
  const [periodDisplay, setPeriodDisplay] = useState(settings.avgPeriodLength);

  const handleSave = async () => {
    await settings.setCycleLength(cycleLenRef.current);
    await settings.setPeriodLength(periodLenRef.current);
    toastService.success("Saved", "Cycle settings updated.");
    router.push("/(app)/settings");
  };

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      <StyledPage.Header
        title="Cycle Settings"
        titleAlignment="left"
        marginHorizontal={16}
        shapeProps={{
          size: 48,
          backgroundColor: Colors.primaryFaint,
        }}
        backArrowProps={{
          color: Colors.textPrimary,
        }}
        showBackArrow
        onBackPress={() => router.push("/(app)/settings")}
        backgroundColor={Colors.background}
        titleProps={{ fontWeight: "700", color: Colors.textPrimary, fontFamily: "PlusJakartaSans_700Bold" }}
        rightIcon={
          <StyledPressable
            onPress={handleSave}
            backgroundColor={Colors.primary}
            borderRadius={20}
            paddingHorizontal={16}
            paddingVertical={8}
          >
            <Text
              fontSize={14}
              fontWeight="700"
              color={Colors.textInverse}
            >
              Save
            </Text>
          </StyledPressable>
        }
      />

      <StyledSpacer marginVertical={1} />
      <StyledScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cycle length */}
        <Stack
          backgroundColor={Colors.surface}
          borderRadius={20}
          padding={20}
          gap={20}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 1 }}
          shadowOpacity={0.05}
          shadowRadius={8}
          elevation={1}
        >
          <Stack gap={6}>
            <Text
              fontSize={16}
              fontWeight="700"
              color={Colors.textPrimary}
            >
              Average cycle length
            </Text>
            <Text fontSize={13} color={Colors.textSecondary}>
              From first day of period to first day of next period
            </Text>
          </Stack>
          <Stack
            backgroundColor={Colors.primaryFaint}
            borderRadius={16}
            padding={16}
            alignItems="center"
            gap={2}
          >
            <Text fontSize={42} fontWeight="800" color={Colors.primary}>
              {cycleDisplay}
            </Text>
            <Text fontSize={14} color={Colors.textSecondary}>
              days
            </Text>
          </Stack>
          <StyledSlider
            key="cycle-slider"
            value={cycleInitial}
            min={20}
            max={45}
            step={1}
            onSlidingComplete={(v) => {
              cycleLenRef.current = v;
              setCycleDisplay(v);
            }}
            formatLabel={(v) => `${v}d`}
            colors={{
              fill: Colors.primary,
              track: Colors.border,
              thumbBorder: Colors.primary,
              tooltipBg: Colors.primaryDark,
            }}
            size="md"
            alwaysShowTooltip
          />
          <Stack horizontal justifyContent="space-between">
            <Text fontSize={11} color={Colors.textTertiary}>
              20 days (short)
            </Text>
            <Text fontSize={11} color={Colors.textTertiary}>
              45 days (long)
            </Text>
          </Stack>
        </Stack>

        {/* Period length */}
        <Stack
          backgroundColor={Colors.surface}
          borderRadius={20}
          padding={20}
          gap={20}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 1 }}
          shadowOpacity={0.05}
          shadowRadius={8}
          elevation={1}
        >
          <Stack gap={6}>
            <Text
              fontSize={16}
              fontWeight="700"
              color={Colors.textPrimary}
            >
              Average period length
            </Text>
            <Text fontSize={13} color={Colors.textSecondary}>
              How many days your bleeding typically lasts
            </Text>
          </Stack>
          <Stack
            backgroundColor={Colors.primaryFaint}
            borderRadius={16}
            padding={16}
            alignItems="center"
            gap={2}
          >
            <Text fontSize={42} fontWeight="800" color={Colors.primary}>
              {periodDisplay}
            </Text>
            <Text fontSize={14} color={Colors.textSecondary}>
              days
            </Text>
          </Stack>
          <StyledSlider
            key="period-slider"
            value={periodInitial}
            min={2}
            max={9}
            step={1}
            onSlidingComplete={(v) => {
              periodLenRef.current = v;
              setPeriodDisplay(v);
            }}
            formatLabel={(v) => `${v}d`}
            colors={{
              fill: Colors.primary,
              track: Colors.border,
              thumbBorder: Colors.primary,
              tooltipBg: Colors.primaryDark,
            }}
            size="md"
            alwaysShowTooltip
          />
          <Stack horizontal justifyContent="space-between">
            <Text fontSize={11} color={Colors.textTertiary}>
              2 days
            </Text>
            <Text fontSize={11} color={Colors.textTertiary}>
              9 days
            </Text>
          </Stack>
        </Stack>

        <Stack
          backgroundColor={Colors.infoLight}
          borderRadius={16}
          padding={16}
          gap={8}
        >
          <Stack horizontal alignItems="center" gap={8}>
            <VelaIcon name="info" size={15} color={Colors.info} />
            <Text
              fontSize={13}
              fontWeight="600"
              color={Colors.textPrimary}
            >
              Tip
            </Text>
          </Stack>
          <Text
            fontSize={12}
            color={Colors.textSecondary}
            lineHeight={18}
          >
            As you log more cycles, Vela automatically refines predictions using
            your actual data. These are starting values only.
          </Text>
        </Stack>
      </StyledScrollView>
    </StyledPage>
  );
}
