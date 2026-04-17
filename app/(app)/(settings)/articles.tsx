import React, { useCallback } from "react";
import {
  Stack,
  StyledText,
  StyledScrollView,
  StyledPage,
  StyledPressable,
  theme,
} from "fluent-styles";
import { router, useLocalSearchParams } from "expo-router";
import { Text } from "@/components/text";

import { useColors } from "../../../src/hooks/useColors";
import { VelaIcon } from "../../../src/components/shared/VelaIcon";
import type { VelaIconName } from "../../../src/components/shared/VelaIcon";

interface Article {
  id: string;
  title: string;
  subtitle: string;
  readTime: string;
  icon: VelaIconName;
  iconBg: string;
  iconColor: string;
  category: string;
  content: string[];
}

// Articles keyed to useColors - colours resolved at render time
const ARTICLES: Omit<Article, "iconBg" | "iconColor">[] = [
  {
    id: "menstrual-cycle",
    title: "Understanding Your Menstrual Cycle",
    subtitle:
      "A complete guide to the four phases and what happens in your body",
    readTime: "5 min read",
    icon: "cycle",
    category: "Basics",
    content: [
      "Your menstrual cycle is a monthly series of changes your body goes through in preparation for the possibility of pregnancy. Each month, one of the ovaries releases an egg — a process called ovulation.",
      "**Phase 1 — Menstrual (Days 1–5)**\nThis is when the lining of your uterus sheds through the vagina. Day 1 is the first day of your period. You may experience cramps, bloating, and fatigue.",
      "**Phase 2 — Follicular (Days 1–13)**\nThe pituitary gland releases FSH, stimulating follicles in your ovaries. One follicle becomes dominant and produces estrogen, causing the uterine lining to thicken.",
      "**Phase 3 — Ovulation (Day 14)**\nA surge in LH causes the dominant follicle to release a mature egg. The egg travels down the fallopian tube. This is your peak fertility window.",
      "**Phase 4 — Luteal (Days 15–28)**\nThe empty follicle becomes the corpus luteum and secretes progesterone to maintain the uterine lining. If pregnancy doesn't occur, progesterone falls and your period begins again.",
    ],
  },
  {
    id: "fertile-window",
    title: "Your Fertile Window Explained",
    subtitle: "When are you most likely to conceive, and how to identify it",
    readTime: "4 min read",
    icon: "phase-fertile",
    category: "Fertility",
    content: [
      "The fertile window is the time each cycle when pregnancy is possible. You can only get pregnant from sex that happens during the 5 days before ovulation and on the day of ovulation itself.",
      "**Why 6 days?**\nSperm can survive in the female reproductive tract for up to 5 days. An egg, once released, is only viable for 12–24 hours. The combination means sex in the days leading up to ovulation can lead to conception.",
      "**Identifying your fertile window**\nVela calculates your fertile window based on your average cycle length, using the standard luteal phase length of 14 days. As you log more cycles, this prediction becomes more accurate.",
      "**Physical signs**\nYour body produces cervical mucus that changes throughout your cycle. During your fertile window, it becomes clear and stretchy — like raw egg white. Some women also experience mild pelvic pain (mittelschmerz) at ovulation.",
    ],
  },
  {
    id: "bbt-tracking",
    title: "Basal Body Temperature Tracking",
    subtitle: "How to use BBT to understand your cycle and confirm ovulation",
    readTime: "4 min read",
    icon: "thermometer",
    category: "Tracking",
    content: [
      "Basal body temperature (BBT) is your body's resting temperature, taken first thing in the morning before any activity. After ovulation, BBT typically rises by 0.2–0.5°C due to progesterone.",
      "**How to track BBT**\nUse a basal thermometer (reads to 2 decimal places). Take your temperature every morning at the same time, before getting out of bed, before eating or drinking. Log it immediately in the Tracker tab.",
      "**What to look for**\nA sustained temperature rise of at least 0.2°C lasting 3 or more days indicates ovulation has occurred. The temperature rise confirms ovulation — it doesn't predict it in advance.",
      "**Using BBT with Vela**\nTap the Tracker tab and select BBT to log your daily temperature. The chart shows your pattern over time and highlights the typical biphasic pattern of a normal ovulatory cycle.",
      "**Important note**\nBBT can be affected by illness, alcohol, poor sleep, or timezone changes. Always note disruptions when logging.",
    ],
  },
  {
    id: "pms-symptoms",
    title: "PMS: Symptoms & Management",
    subtitle: "Understanding premenstrual syndrome and how to manage it",
    readTime: "5 min read",
    icon: "heart",
    category: "Wellness",
    content: [
      "Premenstrual syndrome (PMS) refers to physical and emotional symptoms that occur in the one to two weeks before your period. Up to 75% of menstruating women experience some form of PMS.",
      "**Common physical symptoms**\nBloating, breast tenderness, headaches, fatigue, changes in appetite, and sleep disturbances are all common. These are linked to the hormonal changes in the luteal phase.",
      "**Common emotional symptoms**\nMood swings, irritability, anxiety, depression, and difficulty concentrating can occur. These typically resolve within a few days after your period begins.",
      "**Tracking helps**\nUsing Vela to log your symptoms consistently reveals your personal patterns. After a few cycles, you'll be able to anticipate when symptoms are likely and plan accordingly.",
      "**Management strategies**\nRegular exercise, reducing caffeine and salt, prioritising sleep, and stress management can all reduce PMS symptoms. If symptoms severely impact your quality of life, speak to a healthcare provider.",
    ],
  },
  {
    id: "irregular-cycles",
    title: "Irregular Cycles: What's Normal?",
    subtitle: "Understanding cycle variation and when to speak to a doctor",
    readTime: "4 min read",
    icon: "activity",
    category: "Health",
    content: [
      'A "normal" cycle length ranges from 21 to 35 days, with the average being 28 days. Variation of 2–7 days between cycles is common and generally not a concern.',
      "**Common causes of irregularity**\nStress, significant weight changes, intense exercise, illness, travel across time zones, and hormonal changes (including perimenopause) can all temporarily affect cycle length.",
      "**When to see a doctor**\nConsider speaking to a healthcare provider if your cycles are regularly shorter than 21 or longer than 35 days, if you miss periods for 3+ months (excluding pregnancy), if periods last longer than 7 days, or if you experience severe pain.",
      "**How Vela handles irregular cycles**\nVela uses a weighted average of your last 3–6 cycles, giving more weight to recent cycles. This means it adapts to genuine changes in your cycle rather than being stuck on old patterns.",
    ],
  },
];

function ArticleCard({
  article,
  onPress,
}: {
  article: (typeof ARTICLES)[0];
  onPress: () => void;
}) {
  const Colors = useColors();
  const iconBgs: Record<string, string> = {
    Basics: Colors.primaryFaint,
    Fertility: Colors.fertileLight,
    Tracking: Colors.infoLight,
    Wellness: Colors.successLight,
    Health: Colors.warningLight,
  };
  const iconColors: Record<string, string> = {
    Basics: Colors.primary,
    Fertility: Colors.ovulation,
    Tracking: Colors.info,
    Wellness: Colors.success,
    Health: Colors.warning,
  };

  return (
    <StyledPressable
      onPress={onPress}
      backgroundColor={Colors.surface}
      borderRadius={20}
      padding={16}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.06}
      shadowRadius={10}
      elevation={2}
      flexDirection="row"
      gap={14}
    >
      <Stack
        width={52}
        height={52}
        borderRadius={16}
        backgroundColor={iconBgs[article.category] ?? Colors.primaryFaint}
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        <VelaIcon
          name={article.icon}
          size={26}
          color={iconColors[article.category] ?? Colors.primary}
        />
      </Stack>
      <Stack flex={1} gap={5}>
        <Stack horizontal alignItems="center" gap={6}>
          <Stack
            backgroundColor={iconBgs[article.category] ?? Colors.primaryFaint}
            borderRadius={8}
            paddingHorizontal={8}
            paddingVertical={3}
          >
            <Text
              fontSize={10}
              fontWeight="700"
              color={iconColors[article.category] ?? Colors.primary}
            >
              {article.category.toUpperCase()}
            </Text>
          </Stack>
          <Text fontSize={11} color={Colors.textTertiary}>
            {article.readTime}
          </Text>
        </Stack>
        <Text
          fontSize={14}
          fontWeight="700"
          color={Colors.textPrimary}
          lineHeight={20}
        >
          {article.title}
        </Text>
        <Text
          fontSize={12}
          color={Colors.textSecondary}
          lineHeight={17}
          numberOfLines={2}
        >
          {article.subtitle}
        </Text>
      </Stack>
      <VelaIcon name="chevron-right" size={16} color={Colors.textTertiary} />
    </StyledPressable>
  );
}

export default function ArticlesScreen() {
  const Colors = useColors();
  const params = useLocalSearchParams<{ from?: string }>();
  
  const handleBackPress = useCallback(() => {
    if (params.from === 'home') {
      router.push('/(app)/home')
    } else {
      router.push("/(app)/settings")
    }
  }, [params.from])

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      <StyledPage.Header
        title="Learn"
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
        onBackPress={handleBackPress}
        backgroundColor={Colors.background}
        titleProps={{ fontWeight: "700", color: Colors.textPrimary, fontFamily: "PlusJakartaSans_700Bold" }}
      />

      <StyledScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 48, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Stack
          backgroundColor={Colors.primaryFaint}
          borderRadius={20}
          padding={20}
          gap={8}
          borderWidth={1}
          borderColor={Colors.border}
          marginBottom={4}
        >
          <Stack horizontal alignItems="center" gap={10}>
            <VelaIcon name="phase-fertile" size={24} color={Colors.primary} />
            <Text
              fontSize={16}
              fontWeight="800"
              color={Colors.textPrimary}
            >
              Understand your body
            </Text>
          </Stack>
          <Text
            fontSize={13}
            color={Colors.textSecondary}
            lineHeight={20}
          >
            Evidence-based articles written to help you understand your cycle,
            fertility, and health. All content is stored offline.
          </Text>
        </Stack>

        {ARTICLES.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onPress={() =>
              router.push({
                pathname: "/(app)/(settings)/article",
                params: { id: article.id, from: 'articles' },
              })
            }
          />
        ))}
      </StyledScrollView>
    </StyledPage>
  );
}
