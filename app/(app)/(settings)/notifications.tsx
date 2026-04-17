import React, { useState, useEffect } from "react";
import {
  Stack,
  StyledText,
  StyledScrollView,
  StyledPage,
  theme,
  StyledDivider,
  Switch,
} from "fluent-styles";
import { router } from "expo-router";
import { Text } from "@/components/text";
import { useColors } from "../../../src/hooks/useColors";
import { useSettings } from "../../../src/hooks/useSettings";
import { settingsService } from "../../../src/services/settings.service";
import { notificationService } from "../../../src/services/notification.service";
import { SETTINGS_KEYS } from "../../../src/constants/config";
import { VelaIcon } from "../../../src/components/shared/VelaIcon";
import { PremiumGate } from "../../../src/components/shared/PremiumGate";
import { toastService } from "fluent-styles";

export default function NotificationsScreen() {
  const Colors = useColors();
  const settings = useSettings();

  const [fertileNotif, setFertileNotif] = useState(true);
  const [ovulationNotif, setOvulationNotif] = useState(true);
  const [daysBefore, setDaysBefore] = useState(2);

  useEffect(() => {
    const load = async () => {
      const f =
        (await settingsService.get<boolean>(SETTINGS_KEYS.NOTIFY_FERTILE)) ??
        true;
      const o =
        (await settingsService.get<boolean>(SETTINGS_KEYS.NOTIFY_OVULATION)) ??
        true;
      const db =
        (await settingsService.get<number>(SETTINGS_KEYS.NOTIFY_DAYS_BEFORE)) ??
        2;
      setFertileNotif(f);
      setOvulationNotif(o);
      setDaysBefore(db);
    };
    load();
  }, []);

  const handleMasterToggle = async (val: boolean) => {
    await settings.setNotificationsEnabled(val);
    if (!val) await notificationService.cancelAll();
    toastService.info(val ? "Notifications on" : "Notifications off");
  };

  const handleFertileToggle = async (val: boolean) => {
    await settingsService.set(SETTINGS_KEYS.NOTIFY_FERTILE, val);
    setFertileNotif(val);
  };

  const handleOvulationToggle = async (val: boolean) => {
    await settingsService.set(SETTINGS_KEYS.NOTIFY_OVULATION, val);
    setOvulationNotif(val);
  };

  const NotifRow = ({
    label,
    subtitle,
    value,
    onChange,
  }: {
    label: string;
    subtitle?: string;
    value: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <Stack
      horizontal
      alignItems="center"
      paddingVertical={14}
      paddingHorizontal={16}
      gap={12}
    >
      <Stack flex={1} gap={2}>
        <Text fontSize={15} fontWeight="600" color={Colors.textPrimary}>
          {label}
        </Text>
        {subtitle && (
          <Text fontSize={12} color={Colors.textTertiary}>
            {subtitle}
          </Text>
        )}
      </Stack>
      <Switch
        value={value}
        onChange={onChange}
        activeColor={Colors.primary}
        inactiveColor={Colors.border}
        size="sm"
      />
    </Stack>
  );

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      <StyledPage.Header
        title="Notifications"
        titleAlignment="left"
        marginHorizontal={16}
        shapeProps={{
          size:48,
          backgroundColor: Colors.primaryFaint
        }}
        backArrowProps={{
          color: Colors.textPrimary
        }}
        showBackArrow
        onBackPress={() => router.push("/(app)/settings")}
        backgroundColor={Colors.background}
        titleProps={{ fontWeight: "700", color: Colors.textPrimary, fontFamily: "PlusJakartaSans_700Bold" }}
        rightIcon={<></>}
      />

      <StyledScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
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
          <NotifRow
            label="Enable notifications"
            subtitle="Allow Vela to send reminders"
            value={settings.notificationsEnabled}
            onChange={handleMasterToggle}
          />
        </Stack>

        {settings.notificationsEnabled && (
          <PremiumGate
            feature="Smart Reminders"
            description="Custom pill reminders and smart cycle notifications"
            compact
          >
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
              <Stack paddingHorizontal={16} paddingTop={14} paddingBottom={4}>
                <Text
                  fontSize={12}
                  fontWeight="700"
                  color={Colors.textTertiary}
                  letterSpacing={0.5}
                >
                  REMINDERS
                </Text>
              </Stack>
              <NotifRow
                label="Period reminder"
                subtitle={`${daysBefore} days before your next period`}
                value={settings.notificationsEnabled}
                onChange={() => {}}
              />
              <StyledDivider
                borderBottomColor={Colors.border}
                marginHorizontal={16}
              />
              <NotifRow
                label="Fertile window"
                subtitle="When your fertile window opens"
                value={fertileNotif}
                onChange={handleFertileToggle}
              />
              <StyledDivider
                borderBottomColor={Colors.border}
                marginHorizontal={16}
              />
              <NotifRow
                label="Ovulation day"
                subtitle="On your estimated ovulation day"
                value={ovulationNotif}
                onChange={handleOvulationToggle}
              />
            </Stack>
          </PremiumGate>
        )}

        <Stack
          backgroundColor={Colors.infoLight}
          borderRadius={16}
          padding={16}
          gap={8}
        >
          <Stack horizontal alignItems="center" gap={8}>
            <VelaIcon name="shield-check" size={15} color={Colors.info} />
            <Text
              fontSize={13}
              fontWeight="600"
              color={Colors.textPrimary}
            >
              Fully private
            </Text>
          </Stack>
          <Text
            fontSize={12}
            color={Colors.textSecondary}
            lineHeight={18}
          >
            Notifications are scheduled locally on your device. No data leaves
            your phone.
          </Text>
        </Stack>
      </StyledScrollView>
    </StyledPage>
  );
}
