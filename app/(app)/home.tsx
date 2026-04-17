import React from "react";
import {
  Stack,
  StyledText,
  StyledScrollView,
  StyledPage,
  StyledPressable,
  StyledSeperator,
  theme,
} from "fluent-styles";
import { router } from "expo-router";
import { Text } from "@/components/text";
import { useColors } from "../../src/hooks/useColors";
import { useCycles } from "../../src/hooks/useCycles";
import { usePrediction } from "../../src/hooks/usePrediction";
import { CycleCalendar } from "../../src/components/calendar/CycleCalendar";
import { TodayCard } from "../../src/components/home/TodayCard";
import { CycleInfoRow } from "../../src/components/home/CycleInfoRow";
import { CycleTrendsCard } from "../../src/components/insights/CycleTrendsCard";
import { BrandHeader } from "../../src/components/shared/BrandHeader";
import { VelaIcon } from "../../src/components/shared/VelaIcon";
import { todayStr } from "../../src/utils/date";
import { dialogueService, toastService, loaderService } from "fluent-styles";
import { cycleService } from "../../src/services/cycle.service";
import { useRecordsStore } from "../../src/stores/records.store";
import Svg, { Path } from "react-native-svg";

export default function HomeScreen() {
  const Colors = useColors();
  const { cycles } = useCycles();
  const prediction = usePrediction(cycles);
  const invalidateData = useRecordsStore((s) => s.invalidateData);
  const activeCycle = cycles.find((c) => c.isActive === 1) ?? null;

  const handleDayPress = (date: string) => {
    router.push({ pathname: "/(app)/log", params: { date } });
  };

  const handleStartPeriod = async () => {
    const ok = await dialogueService.confirm({
      title: "Start period today?",
      message: "This will log today as the start of your new cycle.",
      icon: "🌸",
      confirmLabel: "Yes, start",
      cancelLabel: "Cancel",
      theme: "light",
      colors: {
        primaryBg: Colors.primary,
        primaryBorder: Colors.textInverse,
        secondaryBg: Colors.surface,
        secondaryBorder: Colors.border,
      },
    });
    if (!ok) return;
    const id = loaderService.show({ label: "Logging…", variant: "dots" });
    try {
      await cycleService.startNewCycle(new Date());
      invalidateData();
      loaderService.hide(id);
      toastService.success("Period started", "New cycle logged.");
    } catch {
      loaderService.hide(id);
      toastService.error("Something went wrong");
    }
  };

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      {/* Premium Brand Header */}
      <Stack
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal={20}
        paddingTop={12}
        paddingBottom={16}
        backgroundColor={Colors.background}
      >
        {/* Left: Brand Logo + Wordmark */}
        <BrandHeader
          color={Colors.primary}
          iconSize={24}
          fontSize={20}
          fontWeight="600"
          spacing={4}
          horizontal
          horizontalGap={6}
        />

        {/* Right: Phase Pill or Period Button */}
        {prediction ? (
          <Stack
            backgroundColor={Colors.primaryFaint}
            borderRadius={18}
            paddingHorizontal={12}
            paddingVertical={6}
            borderWidth={1}
            borderColor={Colors.border}
            flexDirection="row"
            alignItems="center"
            gap={5}
          >
            <VelaIcon name="info" size={12} color={Colors.primary} />
            <Text fontSize={11} fontWeight="600" color={Colors.primary}>
              {prediction.currentPhase
                .split("_")
                .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")}
            </Text>
          </Stack>
        ) : (
          <StyledPressable
            onPress={handleStartPeriod}
            backgroundColor={Colors.primaryFaint}
            borderRadius={18}
            paddingHorizontal={12}
            paddingVertical={6}
            borderWidth={1}
            borderColor={Colors.border}
            flexDirection="row"
            alignItems="center"
            gap={5}
          >
            <VelaIcon name="drop" size={13} color={Colors.primary} />
            <Text
              fontSize={12}
              fontWeight="700"
              color={Colors.primaryDark}
            >
              Period
            </Text>
          </StyledPressable>
        )}
      </Stack>

      <StyledScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Today hero card */}
        <Stack
          paddingHorizontal={20}
          paddingTop={8}
          paddingBottom={16}
          shadowColor={theme.colors.rose[800]}
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.06}
          shadowRadius={12}
          elevation={3}
        >
          <TodayCard
            prediction={prediction}
            cycles={cycles}
            onLogPress={() =>
              router.push({
                pathname: "/(app)/log",
                params: { date: todayStr() },
              })
            }
          />
        </Stack>

        {/* 2. Calendar */}
        <Stack paddingHorizontal={20} paddingBottom={16}>
          <Stack
            backgroundColor={Colors.surface}
            borderRadius={24}
            padding={20}
            paddingBottom={28}
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.06}
            shadowRadius={12}
            elevation={3}
          >
            <CycleCalendar
              prediction={prediction}
              cycles={cycles}
              onDayPress={handleDayPress}
            />
          </Stack>
        </Stack>

        {/* 3. Cycle trends card */}
        {prediction && (
          <Stack paddingHorizontal={20} paddingBottom={16}>
            <CycleTrendsCard
              prediction={prediction}
              activeCycle={activeCycle}
              onPress={() => router.push("/(app)/insights")}
            />
          </Stack>
        )}
        <StyledSeperator
          leftLabel="Everyday tips for you  >"
          leftLabelProps={{
            color: theme.colors.gray[400],
          }}
          marginHorizontal={24}
          marginBottom={4}
        />
        {/* 4. Cycle info row */}
        <CycleInfoRow prediction={prediction} />
      </StyledScrollView>
    </StyledPage>
  );
}
