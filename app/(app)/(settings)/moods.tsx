import React, { useState, useEffect, useCallback } from "react";
import { ScrollView, ActivityIndicator } from "react-native";
import {
  Stack,
  StyledText,
  StyledPressable,
  StyledPage,
  StyledHeader,
  theme,
} from "fluent-styles";
import { router } from "expo-router";
import { Text } from "@/components/text";
import { useColors } from "../../../src/hooks/useColors";
import { useRecordsStore } from "../../../src/stores/records.store";
import {
  setMoodVisible,
  resetMoodsToDefault,
} from "../../../src/hooks/useMoods";
import { settingsService } from "../../../src/services/settings.service";
import { ALL_MOODS, MOOD_SETTING_PREFIX } from "../../../src/constants/moods";
import { VelaIcon } from "../../../src/components/shared/VelaIcon";
import { dialogueService, toastService } from "fluent-styles";
import type { MoodDef } from "../../../src/constants/moods";

// ─── Load visibility from DB — uses same 1/0 logic as useMoods ───────────────
async function loadVisibility(): Promise<Record<string, boolean>> {
  const all = await settingsService.getAll();
  const result: Record<string, boolean> = {};
  for (const mood of ALL_MOODS) {
    const key = `${MOOD_SETTING_PREFIX}${mood.key}`;
    if (key in all) {
      result[mood.key] = all[key] === 1 || all[key] === true;
    } else {
      result[mood.key] = mood.defaultVisible;
    }
  }
  return result;
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({
  label,
  count,
  description,
}: {
  label: string;
  count: number;
  description?: string;
}) {
  const Colors = useColors();
  return (
    <Stack
      flexDirection="column"
      paddingHorizontal={20}
      paddingTop={20}
      paddingBottom={12}
    >
      <Stack flexDirection="row" alignItems="center" marginLeft={6} gap={6}>
        <Text
          fontSize={11}
          fontWeight="700"
          color={Colors.textTertiary}
          letterSpacing={0.6}
        >
          {label}
        </Text>
        <Stack
          backgroundColor={Colors.primaryFaint}
          borderRadius={8}
          paddingRight={6}
          paddingVertical={2}
        >
          <Text fontSize={9} fontWeight="700" color={Colors.primary}>
            {count}
          </Text>
        </Stack>
      </Stack>
      {description && (
        <Text
          fontSize={11}
          fontWeight={theme.fontWeight.normal}
          color={Colors.textSecondary}
        >
          {description}
        </Text>
      )}
    </Stack>
  );
}

// ─── Custom tick indicator — elegantly minimal checked vs unchecked ────────
function TickBox({ checked, color }: { checked: boolean; color: string }) {
  if (checked) {
    return (
      <Stack
        width={24}
        height={24}
        borderRadius={12}
        backgroundColor={color}
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize={12} color="#fff">
          ✓
        </Text>
      </Stack>
    );
  }
  return (
    <Stack
      width={24}
      height={24}
      borderRadius={12}
      borderWidth={1.5}
      borderColor="#E5E7EB"
      backgroundColor="transparent"
    />
  );
}

// ─── Single mood row ──────────────────────────────────────────────────────────
function MoodRow({
  mood,
  checked,
  onToggle,
}: {
  mood: MoodDef;
  checked: boolean;
  onToggle: (key: string, val: boolean) => void;
}) {
  const Colors = useColors();
  return (
    <StyledPressable
      onPress={() => onToggle(mood.key, !checked)}
      flexDirection="row"
      alignItems="center"
      paddingHorizontal={20}
      paddingVertical={11}
      backgroundColor={Colors.surface}
      gap={12}
    >
      {/* Emoji circle */}
      <Stack
        width={36}
        height={36}
        borderRadius={18}
        backgroundColor={Colors.surfaceAlt}
        alignItems="center"
        justifyContent="center"
        borderWidth={1}
        borderColor={Colors.border}
      >
        <Text fontSize={20}>{mood.emoji}</Text>
      </Stack>

      {/* Label + default indicator */}
      <Stack flex={1} gap={2}>
        <Text
          fontSize={14}
          fontWeight={checked ? "700" : "500"}
          color={Colors.textPrimary}
        >
          {mood.label}
        </Text>
        {mood.defaultVisible && (
          <Text
            fontSize={10}
            color={Colors.textTertiary}
            fontWeight="500"
          >
            Default
          </Text>
        )}
      </Stack>

      {/* Tick */}
      <TickBox checked={checked} color={Colors.primary} />
    </StyledPressable>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function RowDivider() {
  const Colors = useColors();
  return <Stack height={0.8} backgroundColor={Colors.border} marginLeft={68} />;
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function MoodsSettingsScreen() {
  const Colors = useColors();
  const invalidateData = useRecordsStore((s) => s.invalidateData);

  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const vis = await loadVisibility();
      setVisibility(vis);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const checkedCount = Object.values(visibility).filter(Boolean).length;

  // Toggle a single mood — optimistic UI update then persist
  const handleToggle = useCallback(
    async (key: string, val: boolean) => {
      setVisibility((prev) => ({ ...prev, [key]: val }));
      setSaving(true);
      try {
        await setMoodVisible(key, val);
        invalidateData();
      } finally {
        setSaving(false);
      }
    },
    [invalidateData],
  );

  // Reset to defaults
  const handleReset = useCallback(async () => {
    const ok = await dialogueService.confirm({
      title: "Reset to defaults?",
      message: "This will restore the original mood selection.",
      icon: "🔄",
      confirmLabel: "Reset",
      cancelLabel: "Cancel",
    });
    if (!ok) return;
    setSaving(true);
    try {
      await resetMoodsToDefault();
      await load();
      invalidateData();
      toastService.success("Moods reset", "Default selection restored.");
    } finally {
      setSaving(false);
    }
  }, [load, invalidateData]);

  const defaultMoods = ALL_MOODS.filter((m) => m.defaultVisible);
  const extraMoods = ALL_MOODS.filter((m) => !m.defaultVisible);

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      <StyledPage.Header
        title="Moods"
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
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Stack
        marginTop={16}
        backgroundColor={Colors.surface}
        paddingBottom={12}
        paddingHorizontal={20}
        borderBottomWidth={1}
        borderBottomColor={Colors.border}
      >
        <Stack
          flexDirection="row"
          backgroundColor={Colors.primaryFaint}
          borderRadius={14}
          padding={12}
          borderWidth={1}
          borderColor={Colors.border}
        >
          <Stack flex={1} alignItems="center" gap={1}>
            <Text fontSize={20} fontWeight="800" color={Colors.primary}>
              {checkedCount}
            </Text>
            <Text
              fontSize={10}
              fontWeight="600"
              color={Colors.textTertiary}
            >
              Selected
            </Text>
          </Stack>
          <Stack width={1} backgroundColor={Colors.border} marginVertical={3} />
          <Stack flex={1} alignItems="center" gap={1}>
            <Text
              fontSize={20}
              fontWeight="800"
              color={Colors.textSecondary}
            >
              {ALL_MOODS.length - checkedCount}
            </Text>
            <Text
              fontSize={10}
              fontWeight="600"
              color={Colors.textTertiary}
            >
              Hidden
            </Text>
          </Stack>
          <Stack width={1} backgroundColor={Colors.border} marginVertical={3} />
          <Stack flex={1} alignItems="center" gap={1}>
            <Text
              fontSize={20}
              fontWeight="800"
              color={Colors.textTertiary}
            >
              {ALL_MOODS.length}
            </Text>
            <Text
              fontSize={10}
              fontWeight="600"
              color={Colors.textTertiary}
            >
              Total
            </Text>
          </Stack>
        </Stack>
      </Stack>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <Stack flex={1} alignItems="center" justifyContent="center" gap={12}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text fontSize={14} color={Colors.textSecondary}>
            Loading moods…
          </Text>
        </Stack>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 56 }}
        >
          {/* Default moods */}
          <SectionHeader
            label="DEFAULT MOODS"
            count={defaultMoods.length}
            description="  Choose which moods appear when logging"
          />
          <Stack
            backgroundColor={Colors.surface}
            marginHorizontal={16}
            borderRadius={20}
            overflow="hidden"
            borderWidth={1}
            borderColor={Colors.border}
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.06}
            shadowRadius={10}
            elevation={2}
          >
            {defaultMoods.map((mood, i) => (
              <Stack key={mood.key}>
                <MoodRow
                  mood={mood}
                  checked={visibility[mood.key] ?? mood.defaultVisible}
                  onToggle={handleToggle}
                />
                {i < defaultMoods.length - 1 && <RowDivider />}
              </Stack>
            ))}
          </Stack>

          {/* More moods */}
          <SectionHeader label="MORE MOODS" count={extraMoods.length} />
          <Stack
            backgroundColor={Colors.surface}
            marginHorizontal={16}
            borderRadius={20}
            overflow="hidden"
            borderWidth={1}
            borderColor={Colors.border}
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.06}
            shadowRadius={10}
            elevation={2}
          >
            {extraMoods.map((mood, i) => (
              <Stack key={mood.key}>
                <MoodRow
                  mood={mood}
                  checked={visibility[mood.key] ?? false}
                  onToggle={handleToggle}
                />
                {i < extraMoods.length - 1 && <RowDivider />}
              </Stack>
            ))}
          </Stack>

          {/* Reset button */}
          <Stack marginHorizontal={16} marginTop={28}>
            <StyledPressable
              onPress={handleReset}
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              gap={8}
              paddingVertical={16}
              borderRadius={16}
              backgroundColor={Colors.surfaceAlt}
              borderWidth={1}
              borderColor={Colors.border}
            >
              <VelaIcon name="cycle" size={16} color={Colors.textSecondary} />
              <Text
                fontSize={14}
                fontWeight="600"
                color={Colors.textSecondary}
              >
                Reset to defaults
              </Text>
            </StyledPressable>
          </Stack>

          {/* Tip */}
          <Stack
            marginHorizontal={16}
            marginTop={16}
            flexDirection="row"
            alignItems="flex-start"
            gap={8}
            backgroundColor={Colors.primaryFaint}
            borderRadius={14}
            padding={14}
            borderWidth={1}
            borderColor={Colors.border}
          >
            <Text fontSize={16}>💡</Text>
            <Text
              fontSize={12}
              color={Colors.textSecondary}
              flex={1}
              lineHeight={18}
            >
              Changes apply immediately. Moods marked{" "}
              <Text fontSize={12} fontWeight="700" color={Colors.primary}>
                Default
              </Text>{" "}
              are pre-selected by Vela as the most useful for cycle tracking.
            </Text>
          </Stack>
        </ScrollView>
      )}
    </StyledPage>
  );
}
