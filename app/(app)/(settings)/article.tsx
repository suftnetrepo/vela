import React from "react";
import {
  Stack,
  StyledText,
  StyledScrollView,
  StyledPage,
  StyledHeader,
  theme,
} from "fluent-styles";
import { router, useLocalSearchParams } from "expo-router";
import { useColors } from "../../../src/hooks/useColors";
import { VelaIcon } from "../../../src/components/shared/VelaIcon";

// Mirror article data (same source of truth as articles.tsx, extracted here)
const ARTICLE_CONTENT: Record<
  string,
  {
    title: string;
    subtitle: string;
    readTime: string;
    category: string;
    content: string[];
  }
> = {
  "menstrual-cycle": {
    title: "Understanding Your Menstrual Cycle",
    subtitle: "A complete guide to the four phases",
    readTime: "5 min read",
    category: "Basics",
    content: [
      "Your menstrual cycle is a monthly series of changes your body goes through in preparation for the possibility of pregnancy. Each month, one of the ovaries releases an egg — a process called ovulation.",
      "Phase 1 — Menstrual (Days 1–5)\n\nThis is when the lining of your uterus sheds through the vagina. Day 1 is the first day of your period. You may experience cramps, bloating, and fatigue.",
      "Phase 2 — Follicular (Days 1–13)\n\nThe pituitary gland releases FSH, stimulating follicles in your ovaries. One follicle becomes dominant and produces estrogen, causing the uterine lining to thicken.",
      "Phase 3 — Ovulation (Day 14)\n\nA surge in LH causes the dominant follicle to release a mature egg. The egg travels down the fallopian tube. This is your peak fertility window.",
      "Phase 4 — Luteal (Days 15–28)\n\nThe empty follicle becomes the corpus luteum and secretes progesterone. If pregnancy doesn't occur, progesterone falls and your period begins again.",
    ],
  },
  "fertile-window": {
    title: "Your Fertile Window Explained",
    subtitle: "When are you most likely to conceive",
    readTime: "4 min read",
    category: "Fertility",
    content: [
      "The fertile window is the time each cycle when pregnancy is possible. You can only get pregnant from sex that happens during the 5 days before ovulation and on the day of ovulation itself.",
      "Why 6 days?\n\nSperm can survive in the female reproductive tract for up to 5 days. An egg, once released, is only viable for 12–24 hours. The combination means sex in the days leading up to ovulation can lead to conception.",
      "Identifying your fertile window\n\nVela calculates your fertile window based on your average cycle length, using the standard luteal phase length of 14 days.",
      "Physical signs\n\nYour body produces cervical mucus that changes throughout your cycle. During your fertile window, it becomes clear and stretchy. Some women also experience mild pelvic pain (mittelschmerz) at ovulation.",
    ],
  },
  "bbt-tracking": {
    title: "Basal Body Temperature Tracking",
    subtitle: "How to use BBT to understand your cycle",
    readTime: "4 min read",
    category: "Tracking",
    content: [
      "Basal body temperature (BBT) is your body's resting temperature, taken first thing in the morning before any activity. After ovulation, BBT typically rises by 0.2–0.5°C due to progesterone.",
      "How to track BBT\n\nUse a basal thermometer (reads to 2 decimal places). Take your temperature every morning at the same time, before getting out of bed. Log it in the Tracker tab.",
      "What to look for\n\nA sustained temperature rise of at least 0.2°C lasting 3+ days indicates ovulation has occurred.",
      "Important note\n\nBBT can be affected by illness, alcohol, poor sleep, or timezone changes. Always note disruptions when logging.",
    ],
  },
  "pms-symptoms": {
    title: "PMS: Symptoms & Management",
    subtitle: "Understanding premenstrual syndrome",
    readTime: "5 min read",
    category: "Wellness",
    content: [
      "Premenstrual syndrome (PMS) refers to physical and emotional symptoms that occur in the one to two weeks before your period.",
      "Common physical symptoms\n\nBloating, breast tenderness, headaches, fatigue, changes in appetite, and sleep disturbances.",
      "Common emotional symptoms\n\nMood swings, irritability, anxiety, depression, and difficulty concentrating.",
      "Management strategies\n\nRegular exercise, reducing caffeine and salt, prioritising sleep, and stress management can all reduce PMS symptoms.",
    ],
  },
  "irregular-cycles": {
    title: "Irregular Cycles: What's Normal?",
    subtitle: "Understanding cycle variation",
    readTime: "4 min read",
    category: "Health",
    content: [
      'A "normal" cycle length ranges from 21 to 35 days. Variation of 2–7 days between cycles is common and generally not a concern.',
      "Common causes of irregularity\n\nStress, significant weight changes, intense exercise, illness, travel, and hormonal changes.",
      "When to see a doctor\n\nConsider seeing a healthcare provider if your cycles are regularly shorter than 21 or longer than 35 days, or if you miss periods for 3+ months.",
      "How Vela handles irregular cycles\n\nVela uses a weighted average of your last 3–6 cycles, adapting to genuine changes in your pattern.",
    ],
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  Basics: "#E8748A",
  Fertility: "#A855F7",
  Tracking: "#6B9FD4",
  Wellness: "#4CAF88",
  Health: "#F59E4A",
};

export default function ArticleScreen() {
  const Colors = useColors();
  const params = useLocalSearchParams<{ id: string; from?: string }>();
  const article = ARTICLE_CONTENT[params.id ?? ""];

  const handleBackPress = () => {
    if (params.from === 'home') {
      router.push('/(app)')
    } else {
      // Default to articles hub
      router.push('/(app)/(settings)/articles')
    }
  }

  if (!article) {
    return (
      <StyledPage flex={1} backgroundColor={Colors.background}>
        <StyledPage.Header
          title="Article"
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
          onBackPress={handleBackPress}
          backgroundColor={Colors.background}
          titleProps={{ fontWeight: "700", color: Colors.textPrimary }}
        />
        <Stack flex={1} alignItems="center" justifyContent="center">
          <StyledText color={Colors.textSecondary}>
            Article not found.
          </StyledText>
        </Stack>
      </StyledPage>
    );
  }

  const accentColor = CATEGORY_COLORS[article.category] ?? Colors.primary;

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      <StyledPage.Header
        title=""
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
        onBackPress={handleBackPress}
        backgroundColor={Colors.background}
        titleProps={{ fontWeight: "700", color: Colors.textPrimary }}
      />

      <StyledScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Stack
          paddingHorizontal={24}
          paddingTop={4}
          paddingBottom={28}
          gap={14}
        >
          <Stack horizontal alignItems="center" gap={8}>
            <Stack
              backgroundColor={accentColor + "20"}
              borderRadius={10}
              paddingHorizontal={10}
              paddingVertical={5}
            >
              <StyledText fontSize={11} fontWeight="700" color={accentColor}>
                {article.category.toUpperCase()}
              </StyledText>
            </Stack>
            <StyledText fontSize={12} color={Colors.textTertiary}>
              {article.readTime}
            </StyledText>
          </Stack>

          <StyledText
            fontSize={24}
            fontWeight="800"
            color={Colors.textPrimary}
            lineHeight={32}
          >
            {article.title}
          </StyledText>
          <StyledText
            fontSize={15}
            color={Colors.textSecondary}
            lineHeight={23}
          >
            {article.subtitle}
          </StyledText>

          {/* Divider */}
          <Stack height={2} backgroundColor={Colors.border} borderRadius={1} />
        </Stack>

        {/* Content */}
        <Stack paddingHorizontal={24} gap={20}>
          {article.content.map((para, i) => {
            const parts = para.split("\n\n");
            return (
              <Stack key={i} gap={8}>
                {parts.map((part, j) => {
                  const isHeading = j === 0 && parts.length > 1;
                  return (
                    <StyledText
                      key={j}
                      fontSize={isHeading ? 16 : 15}
                      fontWeight={isHeading ? "700" : "400"}
                      color={
                        isHeading ? Colors.textPrimary : Colors.textSecondary
                      }
                      lineHeight={isHeading ? 22 : 24}
                    >
                      {part}
                    </StyledText>
                  );
                })}
              </Stack>
            );
          })}
        </Stack>

        {/* Footer disclaimer */}
        <Stack
          margin={24}
          backgroundColor={Colors.warningLight}
          borderRadius={16}
          padding={16}
          gap={6}
        >
          <Stack horizontal alignItems="center" gap={6}>
            <VelaIcon name="info" size={14} color={Colors.warning} />
            <StyledText
              fontSize={13}
              fontWeight="600"
              color={Colors.textPrimary}
            >
              For information only
            </StyledText>
          </Stack>
          <StyledText
            fontSize={12}
            color={Colors.textSecondary}
            lineHeight={18}
          >
            This article is for general education only and is not medical
            advice. Always consult a qualified healthcare provider for personal
            medical questions.
          </StyledText>
        </Stack>
      </StyledScrollView>
    </StyledPage>
  );
}
