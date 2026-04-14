/**
 * VelaIcon — single import point for all icons in the app.
 *
 * Uses @expo/vector-icons (bundled with Expo SDK 52, zero native config).
 * We mix three families:
 *   Feather       – clean, thin-stroke, perfect for UI chrome
 *   Ionicons      – filled variants for active tab states
 *   MaterialCommunityIcons – specialty icons (flower, water-drop, etc.)
 *
 * Usage:
 *   <VelaIcon name="calendar" size={22} color={Colors.primary} />
 *   <VelaIcon name="drop"     size={18} color={Colors.dayPeriod} />
 */

import React from 'react'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

// ─── Icon catalogue ──────────────────────────────────────────────────────────
// All icon names used anywhere in Vela, mapped to their family + glyph.
// Add new icons here — screens never touch the families directly.

type IconFamily = 'feather' | 'ionicons' | 'mci'

interface IconDef {
  family: IconFamily
  glyph:  string
}

const ICON_MAP: Record<string, IconDef> = {
  // ── Navigation tabs ─────────────────────────────────────────────────────
  'tab-home':          { family: 'feather',  glyph: 'home' },
  'tab-home-active':   { family: 'ionicons', glyph: 'home' },
  'tab-log':           { family: 'feather',  glyph: 'edit-3' },
  'tab-log-active':    { family: 'ionicons', glyph: 'create' },
  'tab-insights':      { family: 'feather',  glyph: 'bar-chart-2' },
  'tab-insights-active':{ family: 'ionicons', glyph: 'bar-chart' },
  'tab-settings':      { family: 'feather',  glyph: 'settings' },
  'tab-settings-active':{ family: 'ionicons', glyph: 'settings' },

  // ── Calendar / cycle ────────────────────────────────────────────────────
  'calendar':          { family: 'feather',  glyph: 'calendar' },
  'chevron-left':      { family: 'feather',  glyph: 'chevron-left' },
  'chevron-right':     { family: 'feather',  glyph: 'chevron-right' },
  'chevron-back':      { family: 'ionicons', glyph: 'chevron-back' },
  'cycle':             { family: 'mci',      glyph: 'sync' },
  'drop':              { family: 'mci',      glyph: 'water' },
  'flower':            { family: 'mci',      glyph: 'flower' },
  'flower-outline':    { family: 'mci',      glyph: 'flower-outline' },
  'leaf':              { family: 'mci',      glyph: 'leaf' },
  'moon':              { family: 'feather',  glyph: 'moon' },
  'sun':               { family: 'feather',  glyph: 'sun' },
  'star':              { family: 'feather',  glyph: 'star' },
  'star-filled':       { family: 'ionicons', glyph: 'star' },
  'zap':               { family: 'feather',  glyph: 'zap' },

  // ── Logging ─────────────────────────────────────────────────────────────
  'edit':              { family: 'feather',  glyph: 'edit-3' },
  'check':             { family: 'feather',  glyph: 'check' },
  'check-circle':      { family: 'feather',  glyph: 'check-circle' },
  'plus':              { family: 'feather',  glyph: 'plus' },
  'plus-circle':       { family: 'feather',  glyph: 'plus-circle' },
  'minus':             { family: 'feather',  glyph: 'minus' },
  'trash':             { family: 'feather',  glyph: 'trash-2' },
  'notes':             { family: 'feather',  glyph: 'file-text' },
  'thermometer':       { family: 'feather',  glyph: 'thermometer' },
  'weight':            { family: 'mci',      glyph: 'scale-bathroom' },
  'heart':             { family: 'feather',  glyph: 'heart' },
  'heart-filled':      { family: 'ionicons', glyph: 'heart' },
  'activity':          { family: 'feather',  glyph: 'activity' },

  // ── Moods ───────────────────────────────────────────────────────────────
  'mood-happy':        { family: 'ionicons', glyph: 'happy-outline' },
  'mood-sad':          { family: 'ionicons', glyph: 'sad-outline' },
  'mood-neutral':      { family: 'ionicons', glyph: 'remove-circle-outline' },
  'mood-anxious':      { family: 'mci',      glyph: 'emoticon-confused-outline' },
  'mood-energy':       { family: 'feather',  glyph: 'zap' },

  // ── Symptoms ────────────────────────────────────────────────────────────
  'cramps':            { family: 'mci',      glyph: 'lightning-bolt' },
  'headache':          { family: 'mci',      glyph: 'head-snowflake' },
  'bloating':          { family: 'mci',      glyph: 'circle-outline' },
  'fatigue':           { family: 'mci',      glyph: 'sleep' },
  'nausea':            { family: 'mci',      glyph: 'emoticon-sick-outline' },
  'acne':              { family: 'mci',      glyph: 'face-woman-shimmer-outline' },

  // ── Security ────────────────────────────────────────────────────────────
  'lock':              { family: 'feather',  glyph: 'lock' },
  'unlock':            { family: 'feather',  glyph: 'unlock' },
  'eye':               { family: 'feather',  glyph: 'eye' },
  'eye-off':           { family: 'feather',  glyph: 'eye-off' },
  'fingerprint':       { family: 'ionicons', glyph: 'finger-print' },
  'face-id':           { family: 'ionicons', glyph: 'scan-outline' },
  'shield':            { family: 'feather',  glyph: 'shield' },
  'shield-check':      { family: 'mci',      glyph: 'shield-check' },
  'key':               { family: 'feather',  glyph: 'key' },

  // ── Settings / UI ───────────────────────────────────────────────────────
  'settings':          { family: 'feather',  glyph: 'settings' },
  'bell':              { family: 'feather',  glyph: 'bell' },
  'bell-off':          { family: 'feather',  glyph: 'bell-off' },
  'palette':           { family: 'feather',  glyph: 'droplet' },
  'info':              { family: 'feather',  glyph: 'info' },
  'help':              { family: 'feather',  glyph: 'help-circle' },
  'arrow-left':        { family: 'feather',  glyph: 'arrow-left' },
  'arrow-right':       { family: 'feather',  glyph: 'arrow-right' },
  'close':             { family: 'feather',  glyph: 'x' },
  'more':              { family: 'feather',  glyph: 'more-horizontal' },
  'search':            { family: 'feather',  glyph: 'search' },
  'share':             { family: 'feather',  glyph: 'share-2' },
  'download':          { family: 'feather',  glyph: 'download' },
  'upload':            { family: 'feather',  glyph: 'upload' },
  'refresh':           { family: 'feather',  glyph: 'refresh-cw' },
  'copy':              { family: 'feather',  glyph: 'copy' },

  // ── Premium ─────────────────────────────────────────────────────────────
  'premium':           { family: 'ionicons', glyph: 'sparkles' },
  'crown':             { family: 'mci',      glyph: 'crown' },
  'gift':              { family: 'feather',  glyph: 'gift' },
  'pill':              { family: 'mci',      glyph: 'pill' },
  'baby':              { family: 'mci',      glyph: 'baby-carriage' },
  'partner':           { family: 'feather',  glyph: 'users' },
  'report':            { family: 'feather',  glyph: 'file-text' },

  // ── Phase-specific ──────────────────────────────────────────────────────
  'phase-menstrual':   { family: 'mci',      glyph: 'water' },
  'phase-follicular':  { family: 'mci',      glyph: 'leaf' },
  'phase-ovulation':   { family: 'mci',      glyph: 'star-four-points' },
  'phase-fertile':     { family: 'mci',      glyph: 'flower' },
  'phase-luteal':      { family: 'feather',  glyph: 'moon' },
  'phase-predicted':   { family: 'mci',      glyph: 'crystal-ball' },
}

// ─── Props ───────────────────────────────────────────────────────────────────
export interface VelaIconProps {
  name:    keyof typeof ICON_MAP | string
  size?:   number
  color?:  string
  style?:  object
}

export type VelaIconName = keyof typeof ICON_MAP

// ─── Component ───────────────────────────────────────────────────────────────
export function VelaIcon({ name, size = 20, color = '#2D1B24', style }: VelaIconProps) {
  const def = ICON_MAP[name]

  if (!def) {
    // Fallback to a circle if icon name is unknown
    return <Feather name="circle" size={size} color={color} style={style} />
  }

  switch (def.family) {
    case 'feather':
      return <Feather name={def.glyph as any} size={size} color={color} style={style} />
    case 'ionicons':
      return <Ionicons name={def.glyph as any} size={size} color={color} style={style} />
    case 'mci':
      return <MaterialCommunityIcons name={def.glyph as any} size={size} color={color} style={style} />
    default:
      return <Feather name="circle" size={size} color={color} style={style} />
  }
}
