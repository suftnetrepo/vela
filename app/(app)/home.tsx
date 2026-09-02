import React, { useState } from "react";
import {
  Stack,
  StyledScrollView,
  StyledPage,
  StyledPressable,
  theme,
} from "fluent-styles";
import { router } from "expo-router";
import { Text } from "@/components/text";
import { useColors } from "../../src/hooks/useColors";
import { useCycles } from "../../src/hooks/useCycles";
import { usePrediction } from "../../src/hooks/usePrediction";
import { usePredictionConfidence } from "../../src/hooks/usePredictionConfidence";
import { useLogHistory } from "../../src/hooks/useLogHistory";
import { useHomeInsight } from "../../src/hooks/useHomeInsight";
import { usePatterns } from "../../src/hooks/usePatterns";
import { CycleCalendar } from "../../src/components/calendar/CycleCalendar";
import { TodayCard } from "../../src/components/home/TodayCard";
import { CycleForecastCard } from "../../src/components/home/CycleForecastCard";
import { QuickLogRow } from "../../src/components/home/QuickLogRow";
import { VelaInsightCard } from "../../src/components/home/VelaInsightCard";
import { PatternsSummaryCard } from "../../src/components/home/PatternsSummaryCard";
import { BrandHeader } from "../../src/components/shared/BrandHeader";
import { VelaIcon } from "../../src/components/shared/VelaIcon";
import { todayStr } from "../../src/utils/date";
import { dialogueService, toastService, loaderService } from "fluent-styles";
import { cycleService } from "../../src/services/cycle.service";
import { useRecordsStore } from "../../src/stores/records.store";

type HomeSection = "dashboard" | "calendar";

export default function HomeScreen() {
  const Colors = useColors();
  const [activeSection, setActiveSection] = useState<HomeSection>("dashboard");
  const { cycles } = useCycles();
  const prediction = usePrediction(cycles);
  const confidence = usePredictionConfidence(cycles, prediction);
  const { logs: logHistory } = useLogHistory();
  const insight = useHomeInsight(cycles, logHistory, prediction);
  const patterns = usePatterns(cycles, logHistory, prediction);
  const invalidateData = useRecordsStore((s) => s.invalidateData);

  const handleDayPress = (date: string) => {
    router.push({ pathname: "/(app)/log", params: { date } });
  };

  const openLog = (tab?: "flow" | "symptoms" | "journal", category?: string) => {
    router.push({
      pathname: "/(app)/log",
      params: {
        date: todayStr(),
        ...(tab ? { tab } : {}),
        ...(category ? { category } : {}),
      },
    });
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
    <StyledPage showStatusBar  backgroundColor={Colors.background}>
      {/* Premium Brand Header */}
      <Stack
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal={20}

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

      {/* Overdue indicator (shown if period is late) */}
      {prediction && prediction.daysUntilNextPeriod < 0 && (
        <Stack
          marginHorizontal={20}
          marginVertical={8}
          paddingHorizontal={14}
          paddingVertical={10}
          backgroundColor={Colors.surface}
          borderRadius={14}
          borderWidth={1}
          borderColor={Colors.border}
          flexDirection="row"
          alignItems="center"
          gap={8}
        >
          <VelaIcon name="moon" size={16} color={Colors.textTertiary} />
          <Text fontSize={12} fontWeight="500" color={Colors.textSecondary}>
            Your cycle appears later than usual ({Math.abs(prediction.daysUntilNextPeriod)} day{Math.abs(prediction.daysUntilNextPeriod) !== 1 ? 's' : ''})
          </Text>
        </Stack>
      )}

      {/* Home section switcher — in-screen navigation, bottom tabs remain unchanged */}
      <Stack paddingHorizontal={20} paddingTop={10} paddingBottom={8}>
        <Stack
          flexDirection="row"
          backgroundColor={Colors.primaryFaint}
          borderRadius={20}
          padding={4}
          gap={4}
        >
          {([
            { key: "dashboard", label: "Dashboard", icon: "grid" },
            { key: "calendar", label: "Calendar", icon: "calendar" },
          ] as const).map((item) => {
            const selected = activeSection === item.key;
            return (
              <StyledPressable
                key={item.key}
                onPress={() => setActiveSection(item.key)}
                flex={1}
                minHeight={44}
                borderRadius={16}
                alignItems="center"
                justifyContent="center"
                flexDirection="row"
                gap={6}
                backgroundColor={selected ? Colors.surface : "transparent"}
                borderWidth={selected ? 1 : 0}
                borderColor={selected ? Colors.border : "transparent"}
                shadowColor={selected ? "#000" : "transparent"}
                shadowOffset={{ width: 0, height: 1 }}
                shadowOpacity={selected ? 0.05 : 0}
                shadowRadius={5}
                elevation={selected ? 1 : 0}
              >
                <VelaIcon
                  name={item.icon}
                  size={15}
                  color={selected ? Colors.primary : Colors.textSecondary}
                />
                <Text
                  fontSize={13}
                  fontWeight={selected ? "700" : "600"}
                  color={selected ? Colors.primary : Colors.textSecondary}
                >
                  {item.label}
                </Text>
              </StyledPressable>
            );
          })}
        </Stack>
      </Stack>

      <StyledScrollView
        contentContainerStyle={{ paddingBottom: 0, marginBottom: 0 }}
        showsVerticalScrollIndicator={false}
      >
        {activeSection === "dashboard" && (
          <>
            <Stack paddingHorizontal={20} paddingTop={8} paddingBottom={16} shadowColor={theme.colors.rose[800]} shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.06} shadowRadius={12} elevation={3}>
              <TodayCard prediction={prediction} confidence={confidence} onLogPress={() => openLog()} onStartPeriodPress={handleStartPeriod} onEditCyclePress={() => router.push("/(app)/(settings)/cycle-settings")} onViewInsightsPress={() => router.push("/(app)/insights")} />
            </Stack>
            <Stack paddingHorizontal={20} paddingBottom={16}>
              <VelaInsightCard insight={insight} cyclesLogged={cycles.length} onViewAll={() => router.push("/(app)/insights")} />
            </Stack>
            <QuickLogRow onFlowPress={() => openLog("flow")} onMoodPress={() => openLog("journal")} onPainPress={() => openLog("symptoms", "pain")} onEnergyPress={() => openLog("journal")} onMorePress={() => openLog()} onEditPress={() => openLog()} />
            <Stack paddingHorizontal={20} paddingBottom={16}>
              <PatternsSummaryCard patterns={patterns} hasHistory={cycles.length > 0} onSeeAll={() => router.push("/(app)/insights")} />
            </Stack>
          </>
        )}

        {activeSection === "calendar" && (
          <>
            <Stack paddingHorizontal={20} paddingTop={8} paddingBottom={16}>
              <Stack
                backgroundColor={Colors.surface}
                borderRadius={24}
                padding={20}
                paddingBottom={16}
                borderWidth={1}
                borderColor={Colors.border}
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.05}
                shadowRadius={12}
                elevation={2}
              >
                <Stack flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom={12}>
                  <Text fontSize={18} fontWeight="700" color={Colors.textPrimary}>Calendar</Text>
                  <StyledPressable
                    onPress={() => openLog("flow")}
                    flexDirection="row"
                    alignItems="center"
                    gap={5}
                    paddingHorizontal={12}
                    paddingVertical={8}
                    borderRadius={16}
                    backgroundColor={Colors.primaryFaint}
                  >
                    <VelaIcon name="edit" size={13} color={Colors.primary} />
                    <Text fontSize={12} fontWeight="600" color={Colors.primaryDark}>Edit period</Text>
                  </StyledPressable>
                </Stack>
                <CycleCalendar prediction={prediction} cycles={cycles} onDayPress={handleDayPress} />
              </Stack>
            </Stack>

            <Stack paddingHorizontal={20} paddingBottom={24}>
              <CycleForecastCard
                prediction={prediction}
                confidence={confidence}
                layout="grid"
                onViewTimeline={() => router.push("/(app)/tracker")}
              />
            </Stack>
          </>
        )}
      </StyledScrollView>
    </StyledPage>
  );
}
