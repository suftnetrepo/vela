import React, { useState } from "react";
import {
  Stack,
  StyledText,
  StyledScrollView,
  StyledPage,
  StyledHeader,
  StyledPressable,
  StyledTextInput,
  theme,
} from "fluent-styles";
import { router } from "expo-router";
import { Text } from "@/components/text";
import { useColors } from "../../../src/hooks/useColors";
import { VelaIcon } from "../../../src/components/shared/VelaIcon";

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  // Privacy
  {
    category: "Privacy",
    q: "Does Vela send my data anywhere?",
    a: "No. Vela is 100% offline. All your data is stored locally in a SQLite database on your device. The app has no internet permissions and makes zero network requests — not even to check for updates.",
  },
  {
    category: "Privacy",
    q: "What happens if I delete the app?",
    a: "Your data is deleted with the app unless you have device backups (iCloud or Google Backup) enabled. We recommend exporting your data before uninstalling. Export is available on Premium.",
  },
  {
    category: "Privacy",
    q: "Can Vela access my photos or contacts?",
    a: "No. Vela only requests biometric/camera permissions for Face ID unlock. It never accesses your photos, contacts, location, or any other personal data.",
  },
  // Cycle tracking
  {
    category: "Cycle Tracking",
    q: "How does Vela predict my next period?",
    a: "Vela uses a weighted rolling average of your last 3–6 logged cycles. More recent cycles carry more weight in the calculation, so recent changes in your pattern are reflected quickly. It also uses the standard luteal phase constant of 14 days to estimate ovulation.",
  },
  {
    category: "Cycle Tracking",
    q: "How accurate are the predictions?",
    a: "With 1 cycle logged, predictions have ±4 days accuracy. With 3+ cycles this improves to ±2 days, and with 6+ cycles to ±1 day. The confidence range is shown next to each prediction.",
  },
  {
    category: "Cycle Tracking",
    q: "What is the fertile window?",
    a: "Your fertile window is the 5 days before ovulation plus the ovulation day itself. Sperm can survive up to 5 days in the reproductive tract, while an egg is viable for about 24 hours after ovulation.",
  },
  {
    category: "Cycle Tracking",
    q: "How do I log that my period has started?",
    a: 'Tap the "Period" button in the top right of the Today tab, or go to the Log tab and select a flow level. Logging any flow (even spotting) on a new day will associate it with your active cycle.',
  },
  {
    category: "Cycle Tracking",
    q: "Can I edit or delete a past log?",
    a: "Yes. Tap any day on the calendar to open the log for that date. You can edit all fields. To delete a log, open the log screen and use the delete option at the bottom.",
  },
  // BBT
  {
    category: "BBT & Tracking",
    q: "What is basal body temperature (BBT)?",
    a: "BBT is your body's resting temperature measured first thing in the morning before any activity. A small rise in BBT (0.2–0.5°C) typically indicates ovulation has occurred. Tracking BBT over multiple cycles can help confirm ovulation patterns.",
  },
  {
    category: "BBT & Tracking",
    q: "When should I take my temperature?",
    a: "Take your temperature immediately upon waking, before getting out of bed or having anything to drink. Use the same thermometer each day and log it in the Tracker tab.",
  },
  // Premium
  {
    category: "Premium",
    q: "What's included in Premium?",
    a: "Premium unlocks partner sharing, pill/contraception reminders, pregnancy mode, data export (PDF/CSV), advanced insights (PMS patterns, mood correlations), and all colour themes (Lavender, Sage, Midnight).",
  },
  {
    category: "Premium",
    q: "Is there a free trial?",
    a: "Yes — Premium includes a 7-day free trial. You won't be charged until the trial ends. You can cancel at any time before the trial ends and you won't pay anything.",
  },
  {
    category: "Premium",
    q: "Can I get a refund?",
    a: "Refunds are handled by Apple App Store or Google Play Store depending on your device. We recommend contacting support through your store if you need a refund.",
  },
];

const CATEGORIES = [...new Set(FAQ_DATA.map((f) => f.category))];

export default function FAQScreen() {
  const Colors = useColors();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = FAQ_DATA.filter((f) => {
    const matchSearch =
      !search ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase());
    const matchCat = !activeCategory || f.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      <StyledPage.Header
        title="FAQ"
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
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Stack
          alignItems="center"
          paddingHorizontal={24}
          paddingTop={8}
          paddingBottom={20}
          gap={8}
        >
          <Stack
            width={56}
            height={56}
            borderRadius={28}
            backgroundColor={Colors.primaryFaint}
            alignItems="center"
            justifyContent="center"
          >
            <VelaIcon name="help" size={28} color={Colors.primary} />
          </Stack>
          <Text fontSize={20} fontWeight="800" color={Colors.textPrimary}>
            How can we help?
          </Text>
        </Stack>

        {/* Search */}
        <Stack paddingHorizontal={20} paddingBottom={16}>
          <TextInput
            variant="filled"
            placeholder="Search questions…"
            value={search}
            onChangeText={setSearch}
            leftIcon={
              <VelaIcon name="search" size={16} color={Colors.textTertiary} />
            }
            clearable
            focusColor={Colors.primary}
          />
        </Stack>

        {/* Category chips */}
        <Stack
          horizontal
          paddingHorizontal={20}
          paddingBottom={20}
          gap={8}
          flexWrap="wrap"
        >
          <StyledPressable
            onPress={() => setActiveCategory(null)}
            backgroundColor={
              !activeCategory ? Colors.primary : Colors.surfaceAlt
            }
            borderRadius={20}
            paddingHorizontal={14}
            paddingVertical={8}
          >
            <Text
              fontSize={13}
              fontWeight="600"
              color={
                !activeCategory ? Colors.textInverse : Colors.textSecondary
              }
            >
              All
            </Text>
          </StyledPressable>
          {CATEGORIES.map((cat) => (
            <StyledPressable
              key={cat}
              onPress={() =>
                setActiveCategory(activeCategory === cat ? null : cat)
              }
              backgroundColor={
                activeCategory === cat ? Colors.primary : Colors.surfaceAlt
              }
              borderRadius={20}
              paddingHorizontal={14}
              paddingVertical={8}
            >
              <Text
                fontSize={13}
                fontWeight="600"
                color={
                  activeCategory === cat
                    ? Colors.textInverse
                    : Colors.textSecondary
                }
              >
                {cat}
              </Text>
            </StyledPressable>
          ))}
        </Stack>

        {/* Q&A accordion */}
        <Stack paddingHorizontal={20} gap={8}>
          {filtered.length === 0 && (
            <Stack alignItems="center" paddingVertical={40} gap={10}>
              <VelaIcon name="search" size={28} color={Colors.textTertiary} />
              <Text fontSize={15} color={Colors.textSecondary}>
                No results for "{search}"
              </Text>
            </Stack>
          )}
          {filtered.map((item, i) => {
            const key = `${item.category}-${i}`;
            const isOpen = expanded === key;
            return (
              <Stack
                key={key}
                backgroundColor={Colors.surface}
                borderRadius={18}
                overflow="hidden"
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 1 }}
                shadowOpacity={0.05}
                shadowRadius={6}
                elevation={1}
              >
                <StyledPressable
                  onPress={() => setExpanded(isOpen ? null : key)}
                  flexDirection="row"
                  alignItems="center"
                  padding={16}
                  gap={12}
                >
                  <Stack
                    width={32}
                    height={32}
                    borderRadius={10}
                    backgroundColor={Colors.primaryFaint}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <VelaIcon
                      name={isOpen ? "minus" : "plus"}
                      size={16}
                      color={Colors.primary}
                    />
                  </Stack>
                  <Text
                    fontSize={14}
                    fontWeight="700"
                    color={Colors.textPrimary}
                    flex={1}
                    lineHeight={20}
                  >
                    {item.q}
                  </Text>
                </StyledPressable>
                {isOpen && (
                  <Stack
                    paddingHorizontal={16}
                    paddingBottom={16}
                    paddingLeft={60}
                  >
                    <Text
                      fontSize={13}
                      color={Colors.textSecondary}
                      lineHeight={21}
                    >
                      {item.a}
                    </Text>
                  </Stack>
                )}
              </Stack>
            );
          })}
        </Stack>

        {/* Still need help */}
        <Stack
          margin={20}
          backgroundColor={Colors.primaryFaint}
          borderRadius={20}
          padding={20}
          gap={12}
          borderWidth={1}
          borderColor={Colors.border}
        >
          <Stack horizontal alignItems="center" gap={10}>
            <Stack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor={Colors.surface}
              alignItems="center"
              justifyContent="center"
            >
              <VelaIcon name="flower" size={20} color={Colors.primary} />
            </Stack>
            <Text
              fontSize={15}
              fontWeight="700"
              color={Colors.textPrimary}
            >
              Still have questions?
            </Text>
          </Stack>
          <Text
            fontSize={13}
            color={Colors.textSecondary}
            lineHeight={20}
          >
            Since Vela is fully offline, we can't offer in-app chat support. But
            you can reach us via the App Store review, or find us on GitHub.
          </Text>
          <Stack
            backgroundColor={Colors.surface}
            borderRadius={12}
            padding={12}
          >
            <Text
              fontSize={12}
              color={Colors.textTertiary}
              fontWeight="600"
            >
              github.com/aaghorighor/fluent-styles
            </Text>
          </Stack>
        </Stack>
      </StyledScrollView>
    </StyledPage>
  );
}
