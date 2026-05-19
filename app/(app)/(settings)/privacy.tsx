import React from "react";
import {
  Stack,
  StyledText,
  StyledScrollView,
  StyledPage,
  StyledHeader,
  StyledDivider,
  theme,
} from "fluent-styles";
import { router } from "expo-router";
import { Text } from "@/components/text";
import { useColors } from "../../../src/hooks/useColors";
import { VelaIcon } from "../../../src/components/shared/VelaIcon";

const SECTIONS = [
  {
    title: "The short version",
    content:
      "Your cycle data is private. Vela stores your period, symptom, mood, and journal data locally on your device. We do not sell your data, share your health data, or use it for advertising.",
  },
  {
    title: "What data do we collect?",
    content:
      "Vela does not require an account. Your personal cycle tracking data is stored locally on your device using the app’s local database. We do not operate a server that receives or stores your cycle history, symptoms, moods, notes, or temperature logs.",
  },
  {
    title: "Do we share your data?",
    content:
      "No. We do not sell, rent, or share your personal cycle or wellness data with advertisers, data brokers, or marketing platforms.",
  },
  {
    title: "Third-party services",
    content:
      "Vela may use Apple services for in-app purchases and subscription management. These services are handled by Apple and are used only to process purchases, restore purchases, and manage premium access.",
  },
  {
    title: "Why we built it this way",
    content:
      "Period tracking data is highly sensitive. Vela is designed around a simple principle: your cycle data should stay under your control.",
  },
  {
    title: "Backups",
    content:
      "Your data may be included in your device’s standard backup, such as iCloud backup, if you have that enabled. This is controlled by your device settings, not by Vela.",
  },
  {
  title: "Wellness disclaimer",
  content:
    "Vela is intended for wellness and personal tracking purposes only and is not a medical device. The app does not provide medical advice, diagnosis, or treatment.",
},
  {
    title: "Contact",
    content:
      "If you have questions about privacy or how Vela works, please contact us through the support information provided in the App Store listing.",
  },
];

export default function PrivacyScreen() {
  const Colors = useColors();

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      <StyledPage.Header
        title="Privacy Policy"
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
      />

      <StyledScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero badge */}
        <Stack
          backgroundColor={Colors.successLight}
          borderRadius={20}
          padding={20}
          gap={10}
        >
          <Stack horizontal alignItems="center" gap={12}>
            <Stack
              width={52}
              height={52}
              borderRadius={26}
              backgroundColor={Colors.surface}
              alignItems="center"
              justifyContent="center"
            >
              <VelaIcon name="shield-check" size={28} color={Colors.success} />
            </Stack>
            <Stack flex={1} gap={3}>
              <Text
                fontSize={17}
                fontWeight="800"
                color={Colors.textPrimary}
              >
                Zero data collection
              </Text>
              <Text fontSize={13} color={Colors.textSecondary}>
                This is not a legal disclaimer — it's a technical fact.
              </Text>
            </Stack>
          </Stack>
        </Stack>

        {/* Sections */}
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
          {SECTIONS.map((s, i) => (
            <Stack key={s.title}>
              <Stack padding={20} gap={8}>
                <Text
                  fontSize={15}
                  fontWeight="700"
                  color={Colors.textPrimary}
                >
                  {s.title}
                </Text>
                <Text
                  fontSize={13}
                  color={Colors.textSecondary}
                  lineHeight={21}
                >
                  {s.content}
                </Text>
              </Stack>
              {i < SECTIONS.length - 1 && (
                <StyledDivider
                  borderBottomColor={Colors.border}
                  marginHorizontal={20}
                />
              )}
            </Stack>
          ))}
        </Stack>

        <Stack alignItems="center" gap={4}>
          <Text fontSize={12} color={Colors.textTertiary}>
            Last updated: January 2025
          </Text>
          <Text fontSize={12} color={Colors.textTertiary}>
            Vela v1.0.0 · com.vela.cycle
          </Text>
        </Stack>
      </StyledScrollView>
    </StyledPage>
  );
}
