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
      "Vela collects nothing. Zero. Your cycle data lives exclusively on your device. We have no servers, no accounts, no analytics SDKs, and no ability to access your data — even if we wanted to.",
  },
  {
    title: "What data do we collect?",
    content:
      "None. Vela operates entirely offline. The app has no internet permissions and makes zero network requests. Every piece of information you log — periods, symptoms, moods, notes — is stored only in a SQLite database on your device.",
  },
  {
    title: "Do we share your data?",
    content:
      "No. There is no mechanism by which we could share your data even if required to. We have never received, and cannot receive, any user data.",
  },
  {
    title: "Third-party SDKs",
    content:
      "Vela contains zero analytics SDKs. We do not use Firebase, Facebook SDK, Mixpanel, Amplitude, Sentry, or any other data-collecting library. The only third-party code we use is open-source UI and utility libraries that contain no data collection.",
  },
  {
    title: "Why we built it this way",
    content:
      "Period tracking data is among the most sensitive personal data that exists. Following the 2025 data scandal where period tracking apps were found to be sharing menstrual data with advertisers, we built Vela on a simple principle: your cycle is yours alone.",
  },
  {
    title: "Backups",
    content:
      "Your data may be included in your device's standard backup (iCloud/Google Backup) if you have that enabled — this is encrypted and controlled entirely by you and your device OS, not by Vela.",
  },
  {
    title: "Contact",
    content:
      "Questions about privacy? Since we have no servers and collect no data, there's nothing for us to tell you about — but we're happy to discuss our approach. The source code is open for inspection.",
  },
];

export default function PrivacyScreen() {
  const Colors = useColors();

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      <StyledPage.Header
        title="Privacy Policy"
        titleAlignment="center"
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
        titleProps={{ fontWeight: "700", color: Colors.textPrimary }}
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
