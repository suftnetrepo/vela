import React, { useState, useEffect } from "react";
import {
  Stack,
  StyledText,
  StyledScrollView,
  StyledPage,
  StyledHeader,
  StyledPressable,
  StyledDivider,
  StyledTextInput,
  Switch,
  theme,
} from "fluent-styles";
import { router } from "expo-router";
import { useColors } from "../../../src/hooks/useColors";
import { VelaIcon } from "../../../src/components/shared/VelaIcon";
import { useSettingsStore } from "../../../src/stores/settings.store";
import { settingsService } from "../../../src/services/settings.service";
import { SETTINGS_KEYS } from "../../../src/constants/config";
import { toastService, dialogueService } from "fluent-styles";
import type { VelaIconName } from "../../../src/components/shared/VelaIcon";

type WeightUnit = "kg" | "lbs";
type TempUnit = "celsius" | "fahrenheit";
type FirstDay = "monday" | "sunday";

function PrefRow({
  icon,
  label,
  subtitle,
  onPress,
  right,
  iconBg,
  destructive = false,
}: {
  icon: VelaIconName;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  iconBg?: string;
  destructive?: boolean;
}) {
  const Colors = useColors();
  return (
    <StyledPressable
      onPress={onPress}
      flexDirection="row"
      alignItems="center"
      paddingVertical={14}
      paddingHorizontal={16}
      gap={14}
      backgroundColor="transparent"
    >
      <Stack
        width={38}
        height={38}
        borderRadius={11}
        backgroundColor={iconBg ?? Colors.primaryFaint}
        alignItems="center"
        justifyContent="center"
      >
        <VelaIcon
          name={icon}
          size={19}
          color={destructive ? Colors.error : Colors.primary}
        />
      </Stack>
      <Stack flex={1} gap={2}>
        <StyledText
          fontSize={15}
          fontWeight="600"
          color={destructive ? Colors.error : Colors.textPrimary}
        >
          {label}
        </StyledText>
        {subtitle && (
          <StyledText fontSize={12} color={Colors.textTertiary}>
            {subtitle}
          </StyledText>
        )}
      </Stack>
      {right !== undefined ? (
        right
      ) : onPress ? (
        <VelaIcon name="chevron-right" size={16} color={Colors.textTertiary} />
      ) : null}
    </StyledPressable>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const Colors = useColors();
  return (
    <Stack gap={0}>
      <StyledText
        fontSize={12}
        fontWeight="700"
        color={Colors.textTertiary}
        letterSpacing={0.5}
        paddingHorizontal={4}
        paddingBottom={8}
      >
        {title}
      </StyledText>
      <Stack
        backgroundColor={Colors.surface}
        borderRadius={20}
        overflow="hidden"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 1 }}
        shadowOpacity={0.05}
        shadowRadius={8}
        elevation={1}
      >
        {children}
      </Stack>
    </Stack>
  );
}

export default function ProfileScreen() {
  const Colors = useColors();
  const isPremium = useSettingsStore((s) => s.isPremium);

  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [tempUnit, setTempUnit] = useState<TempUnit>("celsius");
  const [firstDay, setFirstDay] = useState<FirstDay>("monday");
  const [bmiEnabled, setBmiEnabled] = useState(false);

  useEffect(() => {
    const load = async () => {
      const wu = await settingsService.get<WeightUnit>("weight_unit");
      const tu = await settingsService.get<TempUnit>(
        SETTINGS_KEYS.TEMPERATURE_UNIT,
      );
      const fd = await settingsService.get<FirstDay>(
        SETTINGS_KEYS.FIRST_DAY_OF_WEEK,
      );
      const bmi = await settingsService.get<boolean>("bmi_enabled");
      if (wu) setWeightUnit(wu);
      if (tu) setTempUnit(tu);
      if (fd) setFirstDay(fd);
      if (bmi != null) setBmiEnabled(bmi);
    };
    load();
  }, []);

  const toggle = async (key: string, val: boolean) => {
    await settingsService.set(key, val);
  };

  const cycleUnit = async (
    current: string,
    options: string[],
    key: string,
    setter: (v: any) => void,
  ) => {
    const next = options[(options.indexOf(current) + 1) % options.length];
    await settingsService.set(key, next);
    setter(next as any);
    toastService.info(`Changed to ${next}`);
  };

  const handleDeleteData = async () => {
    const ok = await dialogueService.confirm({
      title: "Clear all data?",
      message:
        "This will permanently delete all your cycle logs, symptoms, and settings. This cannot be undone.",
      icon: "⚠️",
      confirmLabel: "Delete everything",
      cancelLabel: "Cancel",
      destructive: true,
    });
    if (!ok) return;
    toastService.info(
      "Feature coming soon",
      "Data export & deletion will be in the next update.",
    );
  };

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      <StyledPage.Header
        title="Account"
        titleAlignment="left"
        marginHorizontal={16}
        shapeProps={{
          size: 48,
          backgroundColor: theme.colors.pink[50],
        }}
        backArrowProps={{
          color: theme.colors.pink[500],
        }}
        showBackArrow
        onBackPress={() => router.push("/(app)/settings")}
        backgroundColor={Colors.background}
        titleProps={{ fontWeight: "700", color: Colors.textPrimary }}
      />

      <StyledScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 48, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile hero card */}
        <Stack
          backgroundColor={Colors.surface}
          borderRadius={24}
          padding={20}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.07}
          shadowRadius={12}
          elevation={3}
        >
          <Stack horizontal alignItems="center" gap={16}>
            <Stack
              width={64}
              height={64}
              borderRadius={32}
              backgroundColor={Colors.primaryFaint}
              alignItems="center"
              justifyContent="center"
              borderWidth={3}
              borderColor={Colors.border}
            >
              <VelaIcon name="flower" size={30} color={Colors.primary} />
            </Stack>
            <Stack flex={1} gap={4}>
              <StyledText
                fontSize={18}
                fontWeight="800"
                color={Colors.textPrimary}
              >
                My Profile
              </StyledText>
              <StyledText fontSize={13} color={Colors.textSecondary}>
                Offline · Local data only
              </StyledText>
              {isPremium ? (
                <Stack
                  horizontal
                  alignItems="center"
                  gap={5}
                  backgroundColor={Colors.primaryFaint}
                  borderRadius={10}
                  paddingHorizontal={10}
                  paddingVertical={4}
                  alignSelf="flex-start"
                >
                  <VelaIcon name="crown" size={12} color={Colors.primary} />
                  <StyledText
                    fontSize={11}
                    fontWeight="700"
                    color={Colors.primaryDark}
                  >
                    Premium
                  </StyledText>
                </Stack>
              ) : (
                <StyledPressable
                  onPress={() => router.push("/(app)/(settings)/premium")}
                  flexDirection="row"
                  alignItems="center"
                  gap={5}
                  backgroundColor={Colors.primaryFaint}
                  borderRadius={10}
                  paddingHorizontal={10}
                  paddingVertical={4}
                  alignSelf="flex-start"
                >
                  <VelaIcon name="crown" size={12} color={Colors.primary} />
                  <StyledText
                    fontSize={11}
                    fontWeight="700"
                    color={Colors.primaryDark}
                  >
                    Upgrade to Premium
                  </StyledText>
                </StyledPressable>
              )}
            </Stack>
          </Stack>
        </Stack>

        {/* Preferences */}
        <SectionCard title="PREFERENCES">
          <PrefRow
            icon="weight"
            label="Weight unit"
            subtitle={weightUnit === "kg" ? "Kilograms (kg)" : "Pounds (lbs)"}
            right={
              <StyledPressable
                onPress={() =>
                  cycleUnit(
                    weightUnit,
                    ["kg", "lbs"],
                    "weight_unit",
                    setWeightUnit,
                  )
                }
                backgroundColor={Colors.primaryFaint}
                borderRadius={10}
                paddingHorizontal={12}
                paddingVertical={6}
              >
                <StyledText
                  fontSize={13}
                  fontWeight="700"
                  color={Colors.primaryDark}
                >
                  {weightUnit.toUpperCase()}
                </StyledText>
              </StyledPressable>
            }
          />
          <StyledDivider
            borderBottomColor={Colors.border}
            marginHorizontal={16}
          />
          <PrefRow
            icon="thermometer"
            label="Temperature unit"
            subtitle={
              tempUnit === "celsius" ? "Celsius (°C)" : "Fahrenheit (°F)"
            }
            right={
              <StyledPressable
                onPress={() =>
                  cycleUnit(
                    tempUnit,
                    ["celsius", "fahrenheit"],
                    SETTINGS_KEYS.TEMPERATURE_UNIT,
                    setTempUnit,
                  )
                }
                backgroundColor={Colors.primaryFaint}
                borderRadius={10}
                paddingHorizontal={12}
                paddingVertical={6}
              >
                <StyledText
                  fontSize={13}
                  fontWeight="700"
                  color={Colors.primaryDark}
                >
                  {tempUnit === "celsius" ? "°C" : "°F"}
                </StyledText>
              </StyledPressable>
            }
          />
          <StyledDivider
            borderBottomColor={Colors.border}
            marginHorizontal={16}
          />
          <PrefRow
            icon="calendar"
            label="First day of week"
            subtitle={firstDay === "monday" ? "Monday" : "Sunday"}
            right={
              <StyledPressable
                onPress={() =>
                  cycleUnit(
                    firstDay,
                    ["monday", "sunday"],
                    SETTINGS_KEYS.FIRST_DAY_OF_WEEK,
                    setFirstDay,
                  )
                }
                backgroundColor={Colors.primaryFaint}
                borderRadius={10}
                paddingHorizontal={12}
                paddingVertical={6}
              >
                <StyledText
                  fontSize={13}
                  fontWeight="700"
                  color={Colors.primaryDark}
                >
                  {firstDay === "monday" ? "Mon" : "Sun"}
                </StyledText>
              </StyledPressable>
            }
          />
          <StyledDivider
            borderBottomColor={Colors.border}
            marginHorizontal={16}
          />
          <PrefRow
            icon="activity"
            label="Body Mass Index"
            subtitle="Track BMI alongside weight"
            right={
              <Switch
                value={bmiEnabled}
                onChange={(v) => {
                  setBmiEnabled(v);
                  toggle("bmi_enabled", v);
                }}
                activeColor={Colors.primary}
                inactiveColor={Colors.border}
                size="sm"
              />
            }
          />
        </SectionCard>

        {/* Cycle */}
        <SectionCard title="CYCLE">
          <PrefRow
            icon="cycle"
            label="Cycle settings"
            subtitle="Adjust average lengths"
            onPress={() => router.push("/(app)/(settings)/cycle-settings")}
          />
          <StyledDivider
            borderBottomColor={Colors.border}
            marginHorizontal={16}
          />
          <PrefRow
            icon="bell"
            label="Reminders"
            subtitle="Period, ovulation & fertile window"
            onPress={() => router.push("/(app)/(settings)/notifications")}
          />
        </SectionCard>

        {/* Security */}
        <SectionCard title="ACCOUNT & SECURITY">
          <PrefRow
            icon="lock"
            label="PIN & Biometrics"
            subtitle="Protect access to Vela"
            onPress={() => router.push("/(app)/(settings)/security")}
          />
          <StyledDivider
            borderBottomColor={Colors.border}
            marginHorizontal={16}
          />
          <PrefRow
            icon="palette"
            label="Appearance"
            subtitle="Themes & display"
            onPress={() => router.push("/(app)/(settings)/theme")}
          />
        </SectionCard>

        {/* Data */}
        <SectionCard title="DATA & PRIVACY">
          <PrefRow
            icon="shield-check"
            label="Privacy policy"
            onPress={() => router.push("/(app)/(settings)/privacy")}
          />
          <StyledDivider
            borderBottomColor={Colors.border}
            marginHorizontal={16}
          />
          <PrefRow
            icon="download"
            label="Export my data"
            subtitle="Coming soon — Premium feature"
            onPress={() =>
              toastService.info(
                "Coming soon",
                "Data export will be available in a future update.",
              )
            }
          />
          <StyledDivider
            borderBottomColor={Colors.border}
            marginHorizontal={16}
          />
          <PrefRow
            icon="trash"
            label="Clear all data"
            subtitle="Permanently delete everything"
            iconBg={Colors.errorLight}
            destructive
            onPress={handleDeleteData}
          />
        </SectionCard>

        {/* Help */}
        <SectionCard title="HELP">
          <PrefRow
            icon="help"
            label="FAQ"
            onPress={() => router.push("/(app)/(settings)/faq")}
          />
          <StyledDivider
            borderBottomColor={Colors.border}
            marginHorizontal={16}
          />
          <PrefRow icon="info" label="About Vela" subtitle="Version 1.0.0" />
        </SectionCard>

        {/* Footer */}
        <Stack alignItems="center" gap={4} paddingTop={4}>
          <Stack
            width={40}
            height={40}
            borderRadius={20}
            backgroundColor={Colors.primaryFaint}
            alignItems="center"
            justifyContent="center"
          >
            <VelaIcon name="flower" size={20} color={Colors.primary} />
          </Stack>
          <StyledText fontSize={12} color={Colors.textTertiary}>
            Vela v1.0.0
          </StyledText>
          <StyledText fontSize={11} color={Colors.textTertiary}>
            No internet · No tracking · Your data only
          </StyledText>
        </Stack>
      </StyledScrollView>
    </StyledPage>
  );
}
