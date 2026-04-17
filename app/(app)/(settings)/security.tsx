import React, { useState, useEffect } from "react";
import {
  Stack,
  StyledText,
  StyledScrollView,
  StyledPage,
  StyledHeader,
  StyledDivider,
  Switch,
  StyledPressable,
  theme,
} from "fluent-styles";
import { router } from "expo-router";
import { Text } from "@/components/text";
import { useColors } from "../../../src/hooks/useColors";
import { useBiometric } from "../../../src/hooks/useBiometric";
import { securityService } from "../../../src/services/security.service";
import { useAuthStore } from "../../../src/stores/auth.store";
import { PinPad } from "../../../src/components/shared/PinPad";
import { VelaIcon } from "../../../src/components/shared/VelaIcon";
import { dialogueService, toastService } from "fluent-styles";

type View = "main" | "change_pin" | "confirm_pin";

export default function SecurityScreen() {
  const Colors = useColors();
  const biometric = useBiometric();
  const hasPin = useAuthStore((s) => s.hasPin);
  const setHasPin = useAuthStore((s) => s.setHasPin);

  const [view, setView] = useState<View>("main");
  const [newPin, setNewPin] = useState("");
  const [pinError, setPinError] = useState("");

  const handleRemovePin = async () => {
    const ok = await dialogueService.confirm({
      title: "Remove PIN?",
      message: "Your data will no longer be PIN protected.",
      icon: "🔓",
      confirmLabel: "Remove",
      cancelLabel: "Cancel",
      destructive: true,
      theme: "light",
    });
    if (!ok) return;
    await securityService.clearPin();
    setHasPin(false);
    toastService.info("PIN removed");
  };

  const handleFirstPin = (pin: string) => {
    setNewPin(pin);
    setView("confirm_pin");
    setPinError("");
  };

  const handleConfirmPin = async (pin: string) => {
    if (pin !== newPin) {
      setPinError("PINs do not match. Try again.");
      setView("change_pin");
      setNewPin("");
      return;
    }
    await securityService.setPin(pin);
    setHasPin(true);
    toastService.success("PIN updated");
    setView("main");
  };

  if (view === "change_pin") {
    return (
      <StyledPage flex={1} backgroundColor={Colors.background}>
          <StyledPage.Header
          title="Set PIN"
          titleAlignment="center"
          marginHorizontal={16}
          shapeProps={{
            size: 48,
            backgroundColor: theme.colors.pink[50],
          }}
          backArrowProps={{
            color: theme.colors.pink[500],
          }}
          showBackArrow
           onBackPress={() => {
            setView("main");
            setPinError("");
          }}
          backgroundColor={Colors.background}
          titleProps={{ fontWeight: "700", color: Colors.textPrimary }}
        />
        <Stack flex={1}>
          <PinPad
            title="Create new PIN"
            subtitle="Choose a 4-digit PIN"
            onComplete={handleFirstPin}
            error={pinError}
          />
        </Stack>
      </StyledPage>
    );
  }

  if (view === "confirm_pin") {
    return (
      <StyledPage flex={1} backgroundColor={Colors.background}>
        <StyledPage.Header
          title="Confirm PIN"
          titleAlignment="center"
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
        <Stack flex={1}>
          <PinPad
            title="Confirm your PIN"
            subtitle="Enter the same PIN again"
            onComplete={handleConfirmPin}
            error={pinError}
          />
        </Stack>
      </StyledPage>
    );
  }

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      <StyledPage.Header
        title="Security"
        titleAlignment="center"
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
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* PIN section */}
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
              PIN LOCK
            </Text>
          </Stack>

          <StyledPressable
            onPress={() => setView("change_pin")}
            flexDirection="row"
            alignItems="center"
            paddingVertical={14}
            paddingHorizontal={16}
            gap={14}
          >
            <Stack
              width={38}
              height={38}
              borderRadius={11}
              backgroundColor={Colors.primaryFaint}
              alignItems="center"
              justifyContent="center"
            >
              <VelaIcon name="key" size={18} color={Colors.primary} />
            </Stack>
            <Stack flex={1} gap={2}>
              <Text
                fontSize={15}
                fontWeight="600"
                color={Colors.textPrimary}
              >
                {hasPin ? "Change PIN" : "Set up PIN"}
              </Text>
              <Text fontSize={12} color={Colors.textTertiary}>
                {hasPin
                  ? "4-digit PIN is active"
                  : "No PIN set — data is unprotected"}
              </Text>
            </Stack>
            <VelaIcon
              name="chevron-right"
              size={16}
              color={Colors.textTertiary}
            />
          </StyledPressable>

          {hasPin && (
            <>
              <StyledDivider
                borderBottomColor={Colors.border}
                marginHorizontal={16}
              />
              <StyledPressable
                onPress={handleRemovePin}
                flexDirection="row"
                alignItems="center"
                paddingVertical={14}
                paddingHorizontal={16}
                gap={14}
              >
                <Stack
                  width={38}
                  height={38}
                  borderRadius={11}
                  backgroundColor={Colors.errorLight}
                  alignItems="center"
                  justifyContent="center"
                >
                  <VelaIcon name="trash" size={18} color={Colors.error} />
                </Stack>
                <Text
                  fontSize={15}
                  fontWeight="600"
                  color={Colors.error}
                  flex={1}
                >
                  Remove PIN
                </Text>
              </StyledPressable>
            </>
          )}
        </Stack>

        {/* Biometric section */}
        {biometric.available && (
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
                BIOMETRIC
              </Text>
            </Stack>
            <Stack
              horizontal
              alignItems="center"
              paddingVertical={14}
              paddingHorizontal={16}
              gap={14}
            >
              <Stack
                width={38}
                height={38}
                borderRadius={11}
                backgroundColor={Colors.primaryFaint}
                alignItems="center"
                justifyContent="center"
              >
                <VelaIcon
                  name={biometric.type === "face" ? "face-id" : "fingerprint"}
                  size={20}
                  color={Colors.primary}
                />
              </Stack>
              <Stack flex={1} gap={2}>
                <Text
                  fontSize={15}
                  fontWeight="600"
                  color={Colors.textPrimary}
                >
                  {biometric.type === "face" ? "Face ID" : "Fingerprint"}
                </Text>
                <Text fontSize={12} color={Colors.textTertiary}>
                  Unlock Vela with biometrics
                </Text>
              </Stack>
              <Switch
                value={biometric.enabled}
                onChange={biometric.toggleBiometric}
                activeColor={Colors.primary}
                inactiveColor={Colors.border}
                size="sm"
                disabled={!hasPin}
              />
            </Stack>
            {!hasPin && (
              <Stack paddingHorizontal={16} paddingBottom={12}>
                <Text fontSize={12} color={Colors.textTertiary}>
                  Set up a PIN first to enable biometrics.
                </Text>
              </Stack>
            )}
          </Stack>
        )}

        <Stack
          backgroundColor={Colors.successLight}
          borderRadius={16}
          padding={16}
          gap={8}
        >
          <Stack horizontal alignItems="center" gap={8}>
            <VelaIcon name="shield-check" size={15} color={Colors.success} />
            <Text
              fontSize={13}
              fontWeight="600"
              color={Colors.textPrimary}
            >
              Your data is local
            </Text>
          </Stack>
          <Text
            fontSize={12}
            color={Colors.textSecondary}
            lineHeight={18}
          >
            Even without a PIN, your data never leaves your phone. Vela has no
            internet access.
          </Text>
        </Stack>
      </StyledScrollView>
    </StyledPage>
  );
}
