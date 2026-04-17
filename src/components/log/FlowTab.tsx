import React from 'react'
import { Stack, StyledText, StyledPressable } from 'fluent-styles'
import { Text } from '@/components/text'
import { useColors } from '../../hooks/useColors'
import { VelaIcon } from '../shared/VelaIcon'

// ─── Types ────────────────────────────────────────────────────────────────────
export type FlowLevel    = 'light' | 'medium' | 'heavy' | null
export type HasFlow      = boolean | null
export type DischargeType = 'none' | 'spotting' | 'sticky' | 'eggwhite' | null

export interface FlowData {
  hasFlow:   HasFlow
  level:     FlowLevel
  discharge: DischargeType
}

interface FlowTabProps {
  data:     FlowData
  onChange: (data: FlowData) => void
}

// ─── Big icon selection tile ──────────────────────────────────────────────────
function SelectTile({
  label, icon, selected, onPress, size = 'md',
}: {
  label:   string
  icon:    React.ReactNode
  selected:boolean
  onPress: () => void
  size?:   'sm' | 'md' | 'lg'
}) {
  const Colors = useColors()
  const tileSize = size === 'lg' ? 100 : size === 'sm' ? 72 : 86

  return (
    <StyledPressable
      onPress={onPress}
      alignItems="center"
      gap={8}
      padding={0}
      backgroundColor="transparent"
    >
      <Stack
        width={tileSize}
        height={tileSize}
        borderRadius={20}
        backgroundColor={selected ? Colors.primaryFaint : Colors.surfaceAlt}
        borderWidth={selected ? 2 : 1.5}
        borderColor={selected ? Colors.primary : Colors.border}
        alignItems="center"
        justifyContent="center"
        shadowColor={selected ? Colors.primary : '#000'}
        shadowOffset={{ width: 0, height: selected ? 3 : 1 }}
        shadowOpacity={selected ? 0.15 : 0.04}
        shadowRadius={selected ? 8 : 4}
        elevation={selected ? 3 : 1}
      >
        {icon}
      </Stack>
      <Text
        fontSize={12}
        fontWeight={selected ? '700' : '500'}
        color={selected ? Colors.primaryDark : Colors.textSecondary}
        textAlign="center"
      >
        {label}
      </Text>
    </StyledPressable>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function LogSection({ title, children }: { title: string; children: React.ReactNode }) {
  const Colors = useColors()
  return (
    <Stack
      backgroundColor={Colors.surface}
      borderRadius={20}
      padding={20}
      gap={16}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 1 }}
      shadowOpacity={0.05}
      shadowRadius={8}
      elevation={1}
    >
      <Text fontSize={15} fontWeight="700" color={Colors.textPrimary}>
        {title}
      </Text>
      {children}
    </Stack>
  )
}

// ─── Drop SVG icon (custom, matches screenshot) ───────────────────────────────
function DropIcon({ color = '#F87171', size = 36, crossed = false }: {
  color?: string; size?: number; crossed?: boolean
}) {
  // Simple drop shape using a View approximation
  return (
    <Stack width={size} height={size} alignItems="center" justifyContent="center">
      <VelaIcon name="drop" size={size * 0.75} color={color} />
      {crossed && (
        <Stack
          position="absolute"
          width={size * 0.9}
          height={2.5}
          backgroundColor={color}
          borderRadius={2}
          style={{ transform: [{ rotate: '-45deg' }] }}
        />
      )}
    </Stack>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function FlowTab({ data, onChange }: FlowTabProps) {
  const Colors = useColors()

  const set = (patch: Partial<FlowData>) => onChange({ ...data, ...patch })

  return (
    <Stack gap={14}>
      {/* Period */}
      <LogSection title="Period">
        <Stack flexDirection="row" gap={14}>
          <SelectTile
            label="Had flow"
            selected={data.hasFlow === true}
            onPress={() => set({ hasFlow: true })}
            icon={<DropIcon color="#F87171" size={36} />}
            size="lg"
          />
          <SelectTile
            label="No flow"
            selected={data.hasFlow === false}
            onPress={() => set({ hasFlow: false, level: null })}
            icon={<DropIcon color={Colors.textTertiary} size={36} crossed />}
            size="lg"
          />
        </Stack>
      </LogSection>

      {/* Flow level — only shown if has flow */}
      {data.hasFlow && (
        <LogSection title="Flow Level">
          <Stack flexDirection="row" gap={14}>
            <SelectTile
              label="Light"
              selected={data.level === 'light'}
              onPress={() => set({ level: 'light' })}
              icon={<DropIcon color="#FCA5A5" size={32} />}
            />
            <SelectTile
              label="Medium"
              selected={data.level === 'medium'}
              onPress={() => set({ level: 'medium' })}
              icon={
                <Stack flexDirection="row" gap={2} alignItems="flex-end">
                  <DropIcon color="#F87171" size={24} />
                  <DropIcon color="#F87171" size={30} />
                </Stack>
              }
            />
            <SelectTile
              label="Heavy"
              selected={data.level === 'heavy'}
              onPress={() => set({ level: 'heavy' })}
              icon={
                <Stack flexDirection="row" gap={2} alignItems="flex-end">
                  <DropIcon color="#EF4444" size={20} />
                  <DropIcon color="#EF4444" size={28} />
                  <DropIcon color="#EF4444" size={22} />
                </Stack>
              }
            />
          </Stack>
        </LogSection>
      )}

      {/* Vaginal discharge */}
      <LogSection title="Vaginal Discharge">
        <Stack flexDirection="row" gap={10} flexWrap="wrap">
          {([
            {
              key:   'none'     as DischargeType,
              label: 'No\ndischarge',
              icon:  <DropIcon color={Colors.textTertiary} size={28} crossed />,
            },
            {
              key:   'spotting' as DischargeType,
              label: 'Spotting',
              icon:  <VelaIcon name="drop" size={28} color="#FCA5A5" />,
            },
            {
              key:   'sticky'   as DischargeType,
              label: 'Sticky',
              icon:  <VelaIcon name="activity" size={28} color="#F87171" />,
            },
            {
              key:   'eggwhite' as DischargeType,
              label: 'Eggwhite',
              icon:  <VelaIcon name="phase-fertile" size={28} color="#5EEAD4" />,
            },
          ]).map(item => (
            <SelectTile
              key={item.key}
              label={item.label}
              selected={data.discharge === item.key}
              onPress={() => set({ discharge: data.discharge === item.key ? null : item.key })}
              icon={item.icon}
              size="sm"
            />
          ))}
        </Stack>
      </LogSection>
    </Stack>
  )
}
